import mongoose from "mongoose";
import Table from "../models/tableModel.js";
import Waiter from "../models/waiterModal.js";
import { DateTime } from "luxon";
import { createTableSchema } from "../validations/tableValidation.js";

export const createTable = async (req, res) => {
  try {
    const parseResult = createTableSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map(e => e.message);
      return res.status(400).json({ error: errorMessages.join(", ") });
    }

    const { number, capacity, floor, waiterName } = parseResult.data;
    const branchId = req.user?.branch;

    // Try to create the new table (duplicate checking is handled by the unique index)
    const newTable = new Table({
      number,
      capacity,
      floor,
      branch: branchId,
      waiter: null, // Default if no waiter is assigned
    });

    // If a waiter name is provided, fetch the waiter and assign it
    if (waiterName) {
      const waiter = await Waiter.findOne({ name: waiterName });
      if (!waiter) {
        return res.status(404).json({ error: "Waiter not found." });
      }
      newTable.waiter = waiter._id;
    }

    // Save the new table, MongoDB will automatically enforce the uniqueness of floor, number, and branch
    await newTable.save();

    // Populate the newly created table and return it
    const populatedTable = await Table.findById(newTable._id).populate("waiter", "name");

    res.status(201).json(populatedTable);
  } catch (error) {
    // Handle duplicate key error (from the unique index)
    if (error.code === 11000) {
      return res.status(400).json({ error: "Table with the same number and floor already exists." });
    }

    // Handle other errors
    console.error("Create table error:", error);
    res.status(400).json({ error: error.message });
  }
};


export const reserveTable = async (req, res) => {
  try {
    const {
      number,
      floor,
      customerName,
      customerPhone,
      reservationDate,
      reservationTime,
      durationValue = 60,
      durationUnit = "minutes",
      specialRequests = "",
      timeZone = "",
    } = req.body;

    const branchId = req.user?.branch;

    if (!number || floor === undefined || !customerName || !reservationDate || !reservationTime) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    if (!branchId) {
      return res.status(400).json({ error: "Branch information is missing from user." });
    }

    const resDateTimeLocal = DateTime.fromFormat(`${reservationDate} ${reservationTime}`, "yyyy-MM-dd HH:mm", { zone: timeZone || "Asia/Kolkata" });

    if (!resDateTimeLocal.isValid) {
      return res.status(400).json({ error: `Invalid reservation date or time format. Expected YYYY-MM-DD HH:MM. Received: ${reservationDate} ${reservationTime}` });
    }

    const reservationStartUTC = resDateTimeLocal.toUTC().toJSDate();

    let durationMinutes;
    switch (durationUnit.toLowerCase()) {
      case "minutes":
        durationMinutes = durationValue;
        break;
      case "hours":
        durationMinutes = durationValue * 60;
        break;
      case "days":
        durationMinutes = durationValue * 60 * 24;
        break;
      default:
        return res.status(400).json({ error: "Invalid duration unit. Accepted: 'minutes', 'hours', 'days'." });
    }

    const table = await Table.findOne({ number, floor, branch: branchId });
    if (!table) {
      return res.status(404).json({ error: "Table not found." });
    }

    let tablesToReserve = [table];
    if (table.isMerged && table.mergedWith?.length > 0) {
      tablesToReserve = await Table.find({ _id: { $in: [...table.mergedWith, table._id] }, branch: branchId });
    }

    const nowUTC = DateTime.utc();

    for (const tableToCheck of tablesToReserve) {
      const r = tableToCheck.reservation;
      if (r?.isReserved && r.reservationStartUTC) {
        const existingStartUTC = DateTime.fromJSDate(r.reservationStartUTC);
        const existingEndUTC = existingStartUTC.plus({ minutes: r.durationMinutes || 60 });
        if (
          reservationStartUTC.getTime() < existingEndUTC.toMillis() &&
          existingEndUTC.toMillis() > nowUTC.toMillis()
        ) {
          return res.status(409).json({
            error: `Table ${tableToCheck.number} is already reserved for an overlapping period.`,
            existingReservationDetails: {
              customerName: r.customerName,
              reservationStartTime: existingStartUTC.setZone(r.timeZone || 'UTC').toFormat("yyyy-MM-dd HH:mm"),
              durationMinutes: r.durationMinutes
            }
          });
        }
      }
    }

    const reservationData = {
      customerName,
      customerPhone,
      specialRequests,
      reservationStartUTC,
      durationMinutes,
      isReserved: true,
      timeZone,
    };

    for (const tableToUpdate of tablesToReserve) {
      tableToUpdate.reservation = reservationData;
      tableToUpdate.status = "Reserved";
      await tableToUpdate.save();
    }

    res.status(200).json({
      message: `Table${tablesToReserve.length > 1 ? 's' : ''} reserved successfully`,
      tables: tablesToReserve.map(t => ({
        _id: t._id,
        number: t.number,
        floor: t.floor,
        reservation: {
          ...t.reservation.toObject(),
          reservationStartLocal: DateTime.fromJSDate(t.reservation.reservationStartUTC).setZone(t.reservation.timeZone || 'UTC').toFormat("yyyy-MM-dd HH:mm")
        },
        status: t.status,
      })),
    });
  } catch (error) {
    console.error("Reservation error:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getTables = async (req, res) => {
  try {
    const branchId = req.user.branch;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.per_page, 10) || 25;
    const search = req.query.search || "";
    const floorFilter = req.query.floor;
    const mergeGroupId = req.query.mergeGroupId;
    const skip = (page - 1) * limit;

    const filter = { branch: branchId };

    // Ensure floorFilter is a number if it's provided
    if (floorFilter) {
      const parsedFloor = parseInt(floorFilter, 10);
      if (!isNaN(parsedFloor)) {
        filter.floor = parsedFloor; // Set the floor filter as a number
      } else {
        return res.status(400).json({ error: "Invalid floor filter value" });
      }
    }

    if (mergeGroupId) {
      filter.mergeGroupId = mergeGroupId;
    }

    if (search) {
      filter[isNaN(search) ? "name" : "number"] = isNaN(search)
        ? { $regex: search, $options: "i" }
        : parseInt(search, 10);
    }

    const [tables, totalTables] = await Promise.all([
      Table.find(filter)
        .sort({ floor: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate([
          {
            path: "orderId",
            select: "customerName number totalPrice status createdAt foods paymentMethod",
          },
          { path: "waiter", select: "name" },
          { path: "mergedWith", select: "number floor" },
        ])
        .lean(), // Improves performance for read-only operations

      Table.countDocuments(filter),
    ]);

    const nowUTC = DateTime.utc();

    const tablesClean = tables.map((table) => {
      const orderStatus = table.orderId?.status;
      const isOrderActive = orderStatus && !["Completed", "Cancelled"].includes(orderStatus);

      let isCurrentlyReserved = false;
      let reservation = table.reservation;

      if (reservation?.isReserved && reservation.reservationStartUTC) {
        const start = DateTime.fromJSDate(reservation.reservationStartUTC);
        const end = start.plus({ minutes: reservation.durationMinutes || 60 });

        if (nowUTC > end) {
          reservation = undefined;
        } else if (nowUTC >= start && nowUTC < end) {
          isCurrentlyReserved = true;
        }
      }

      let status = "Available";
      if (isOrderActive) {
        status = "Occupied";
      } else if (isCurrentlyReserved) {
        status = "Reserved";
      } else {
        table.orderId = null;
      }

      if (reservation?.reservationStartUTC) {
        reservation.reservationStartLocal = DateTime.fromJSDate(reservation.reservationStartUTC)
          .setZone(reservation.timeZone || "Asia/Kolkata")
          .toFormat("yyyy-MM-dd HH:mm");
      } else {
        reservation = undefined;
      }

      return {
        ...table,
        reservation,
        status,
      };
    });

    res.status(200).json({
      tables: tablesClean,
      currentPage: page,
      totalPages: Math.ceil(totalTables / limit),
      totalTables,
    });
  } catch (error) {
    console.error("Get tables error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const getAllFloors = async (req, res) => {
  try {
    const branchId = req.user.branch;

    // Fetch distinct floors and ensure they're treated as numbers
    const floors = await Table.distinct("floor", { branch: branchId });

    // Ensure all floors are numbers and sort them
    const sortedFloors = floors
      .map(floor => Number(floor)) // Convert to numbers
      .filter(floor => !isNaN(floor)) // Filter out invalid values
      .sort((a, b) => a - b); // Sort numerically

    res.status(200).json({ floors: sortedFloors });
  } catch (error) {
    console.error("Error fetching floors:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const branchId = req.user.branch;

    const table = await Table.findOne({ _id: id, branch: branchId });
    if (!table || !table.reservation?.isReserved) {
      return res.status(404).json({ error: "Reservation not found." });
    }
    let tablesToCancel = [table];
    if (table.isMerged && table.mergedWith && table.mergedWith.length > 0) {
      tablesToCancel = await Table.find({
        _id: { $in: table.mergedWith },
        branch: branchId
      });
    }
    for (const tableToCancel of tablesToCancel) {
      tableToCancel.reservation = {
        customerName: null,
        reservationTime: null,
        durationMinutes: 60,
        isReserved: false,
      };
      tableToCancel.status = "Available";
      await tableToCancel.save();
    }

    res.status(200).json({
      message: `Reservation cancelled for ${tablesToCancel.length} table${tablesToCancel.length > 1 ? 's' : ''}`,
      tables: tablesToCancel.map(t => ({
        _id: t._id,
        number: t.number,
        floor: t.floor,
        status: t.status
      }))
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { number, capacity, floor, status, waiterName } = req.body;
    const branchId = req.user?.branch;

    
    // Check for duplicate table in same branch and floor
    const existingTable = await Table.findOne({
      _id: { $ne: id },
      number,
      floor,
      branch: branchId,
    });
    if (existingTable) {
      return res.status(400).json({ error: "Another table with the same number and floor already exists." });
    }

    const currentTable = await Table.findById(id);
    if (!currentTable) {
      return res.status(404).json({ error: "Table not found." });
    }

    // Prepare update data
    const updateData = { number, capacity, floor: floor !== undefined ? floor : currentTable.floor };

    // Handle status logic
    if (status) {
      updateData.statusOverride = status;
      if (status === "Available") {
        if (currentTable.orderId) updateData.lastOrderId = currentTable.orderId;
        updateData.orderId = null;
        updateData.reservation = undefined;
      }

      if (status === "Occupied" && currentTable.lastOrderId) {
        updateData.orderId = currentTable.lastOrderId;
        updateData.lastOrderId = null;
      }
    }

    // Assign waiter if provided
    if (waiterName) {
      const waiter = await Waiter.findOne({ name: waiterName });
      if (!waiter) {
        return res.status(404).json({ error: "Waiter not found." });
      }
      updateData.waiter = waiter._id;
    }

    // Perform the update
    const updatedTable = await Table.findOneAndUpdate(
      { _id: id, branch: branchId },
      updateData,
      { new: true, runValidators: true }
    ).populate("waiter", "name");

    return res.status(200).json(updatedTable);
  } catch (error) {
    console.error("updateTable error:", error);
    return res.status(400).json({ error: error.message });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
    const branchId = req.user.branch;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid table ID" });
    }

    const tableToDelete = await Table.findOne({ _id: id, branch: branchId });
    if (!tableToDelete) {
      return res.status(404).json({ error: "Table not found" });
    }

    if (tableToDelete.isMerged && Array.isArray(tableToDelete.mergedWith) && tableToDelete.mergedWith.length > 0) {
      await Table.updateMany(
        {
          _id: { $in: tableToDelete.mergedWith, $ne: id },
          branch: branchId,
        },
        { $pull: { mergedWith: id } }
      );

      const remainingMergedTables = await Table.find({
        _id: { $in: tableToDelete.mergedWith, $ne: id },
        branch: branchId,
      });

      if (remainingMergedTables.length === 1) {
        remainingMergedTables[0].isMerged = false;
        remainingMergedTables[0].mergedWith = [];
        await remainingMergedTables[0].save();
      }
    }

    await Table.findOneAndDelete({ _id: id, branch: branchId });

    return res.status(200).json({ message: "Table deleted successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
export const mergeTables = async (req, res) => {
  try {
    const { mainTableId, mergeTableIds } = req.body;
    const branchId = req.user.branch;

    if (!mainTableId || !Array.isArray(mergeTableIds)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const mergeGroupId = new mongoose.Types.ObjectId();
    const allTableIds = [mainTableId, ...mergeTableIds];

    const tablesToMerge = await Table.find({
      _id: { $in: allTableIds },
      branch: branchId,
    }).populate("orderId", "status");

    const nowUTC = DateTime.utc();

    for (const table of tablesToMerge) {
      const isManuallyAvailable = table.statusOverride === "Available";

      if (
        table.orderId &&
        table.orderId.status !== "Completed" &&
        !isManuallyAvailable
      ) {
        return res.status(400).json({
          error: `Cannot merge tables. Table ${table.number} (Floor ${table.floor}) is currently occupied.`,
        });
      }

      if (table.reservation?.isReserved && table.reservation.reservationStartUTC) {
        const start = DateTime.fromJSDate(table.reservation.reservationStartUTC);
        const end = start.plus({ minutes: table.reservation.durationMinutes || 60 });

        if (DateTime.utc() >= start && DateTime.utc() < end) {
          return res.status(400).json({
            error: `Cannot merge tables. Table ${table.number} (Floor ${table.floor}) is currently reserved.`,
          });
        }
      }
    }

    await Table.updateMany(
      { _id: { $in: allTableIds }, branch: branchId },
      {
        isMerged: true,
        mergeGroupId,
        mergedWith: allTableIds,
        status: "Available",
      }
    );

    res.status(200).json({
      message: "Tables merged successfully",
      mergeGroupId,
      mergedTables: tablesToMerge.map((table) => ({
        _id: table._id,
        number: table.number,
      })),
    });
  } catch (error) {
    console.error("Merge tables error:", error.message);
    res.status(500).json({ error: error.message });
  }
};


export const splitTable = async (req, res) => {
  try {
    const { id } = req.params;
    const branchId = req.user.branch;

    const mainTable = await Table.findOne({ _id: id, branch: branchId });

    if (!mainTable || !mainTable.isMerged) {
      return res.status(404).json({ error: "Merged table not found" });
    }

    await Table.updateMany(
      { _id: { $in: mainTable.mergedWith }, branch: branchId },
      {
        isMerged: false,
        mergedWith: [],
        mergeGroupId: undefined,
        reservation: undefined,
        status: "Available"
      }
    );

    res.status(200).json({
      message: "Table split successfully",
      splitTables: mainTable.mergedWith.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
