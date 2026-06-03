import Order from "../models/orderSchema.js";
import Table from "../models/tableModel.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { createOrderSchema, updateOrderSchema } from "../validations/orderValidation.js";
import mongoose from "mongoose";
import TaxSetting from "../models/taxsettingsModal.js";
import Invoice from "../models/invoiceModel.js";
import { createNotification } from "./notificationController.js";
import { createKitchenOrder, updateKitchenOrder } from "./kitchenController.js";

const ERRORS = {
  MISSING_FIELDS:
    "Missing required fields: totalPrice, paymentMethod, customerName, number, foods, or orderType",
  INVALID_DELIVERY_ADDRESS: "Delivery address is required for delivery orders",
  INVALID_FOOD_ITEM: "Each food must have a name, price, and quantity",
  INVALID_QUANTITY: "Food quantity must be at least 1",
  INVALID_TABLE_TYPE: "Table must be a number for dine-in orders",
  TABLE_NOT_FOUND: (num) => `Table with number ${num} not found`,
  TABLE_OCCUPIED: "Table is already occupied",
  INVALID_TOKEN: "Unauthorized: Invalid token",
  MISSING_TOKEN: "Unauthorized: Missing or invalid token",
  USER_NOT_FOUND: "Unauthorized: User not found",
};


export const createOrder = async (req, res) => {
  try {
    // Validate and parse request body using Zod schema
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    let {
      tables,
      paymentMethod,
      status,
      customerName,
      number,
      foods,
      orderType,
      deliveryAddress,
      floor,
    } = parsed.data;

    const roundToTwo = (num) => Math.round(num * 100) / 100;

    // Calculate subtotal
    const subtotal = roundToTwo(foods.reduce((acc, item) => acc + item.price * item.quantity, 0));

    // Fetch current tax setting
    const taxSetting = await TaxSetting.findOne();
    if (!taxSetting) {
      return res.status(500).json({ error: "Tax settings not configured" });
    }
    // Calculate tax components
    const serviceChargeAmount = roundToTwo(subtotal * (taxSetting.serviceCharge / 100));
    const gstAmount = roundToTwo(subtotal * (taxSetting.gstTax / 100));
    const vatAmount = roundToTwo(subtotal * (taxSetting.vat / 100));

    // Final total price
    const totalPrice = roundToTwo(
      subtotal +
      serviceChargeAmount +
      gstAmount +
      vatAmount +
      taxSetting.deliveryCharge +
      taxSetting.packagingCharge
    );

    const { branch, hotelBrand } = req.user;

    // Basic required field checks
    if (!totalPrice || !foods || !orderType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (orderType === "Delivery" && !deliveryAddress) {
      return res.status(400).json({ error: "Invalid delivery address" });
    }

    if (!Array.isArray(foods) || foods.length === 0) {
      return res.status(400).json({ error: "At least one food item is required" });
    }

    for (const food of foods) {
      if (!food.name || !food.price || !food.quantity || food.quantity < 1) {
        return res.status(400).json({ error: "Invalid food item in list" });
      }
    }

    let tableIds = [];
    let tableNumbers = [];

    // Dine-In order: Handle table lookup and assignment
    if (orderType === "Dine-In") {
      if (!tables || tables.length === 0) {
        return res.status(400).json({ error: "At least one table must be selected" });
      }

      const selectedTableNumber = parseInt(tables[0], 10); // Ensure it's a number

      const selectedTable = await Table.findOne({
        number: selectedTableNumber,
        floor: floor,
        branch,
      });

      if (!selectedTable) {
        return res.status(404).json({ error: ERRORS.TABLE_NOT_FOUND(selectedTableNumber) });
      }

      // Handle merged table if applicable
      let tableDocs = [];

      if (selectedTable.isMerged) {
        tableDocs = await Table.find({
          mergedWith: { $in: [selectedTable._id] },
          branch,
        });
      } else {
        tableDocs = [selectedTable];
      }

      tableIds = tableDocs.map((t) => t._id);
      tableNumbers = tableDocs.map((t) => String(t.number));
    }
    
    let generatedOrderId = null;

    // Generate orderId for all orders in format "INV-DD-MM-001"
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const datePrefix = `INV-${day}-${month}`;

    const lastOrderToday = await Order.findOne({
      orderId: { $regex: `^${datePrefix}-\\d{3}$` },
    }).sort({ createdAt: -1 });

    let newOrderNumber = 1;

    if (lastOrderToday && lastOrderToday.orderId) {
      const lastNumber = parseInt(lastOrderToday.orderId.split("-")[3], 10);
      if (!isNaN(lastNumber)) {
        newOrderNumber = lastNumber + 1;
      }
    }

    const formattedOrderNumber = String(newOrderNumber).padStart(3, "0");
    generatedOrderId = `${datePrefix}-${formattedOrderNumber}`;

    // Create the order with the generated orderId
    const newOrder = await Order.create({
      orderId: generatedOrderId,
      floor,
      tableNumbers,
      tableIds,
      totalPrice,
      paymentMethod,
      status,
      customerName,
      number,
      foods,
      orderType,
      deliveryAddress: orderType === "Delivery" ? deliveryAddress : null,
      branch,
      hotelBrand,
      taxSnapshot: {
        serviceCharge: taxSetting.serviceCharge,
        gstTax: taxSetting.gstTax,
        vat: taxSetting.vat,
        deliveryCharge: taxSetting.deliveryCharge,
        packagingCharge: taxSetting.packagingCharge,
      },
    });

   try {
      await createKitchenOrder(newOrder);
      console.log("Kitchen order created successfully for order:", newOrder.orderId);
    } catch (kitchenError) {
      console.error("Failed to create kitchen order:", kitchenError);
    }

    const notification = await createNotification({
      type: "order_created",
      title: "New Order Created",
      message: `New ${orderType} order created for ${customerName || "Walk-in Customer"}`,
      orderId: newOrder._id,
      orderNumber: generatedOrderId,
      customerName: customerName || "Walk-in Customer",
      status: status,
      initiatedBy: req.user.email || req.user.name || "System",
      branch: branch,
      hotelBrand: hotelBrand,
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("newNotification", {
        notification: notification || {
          title: "New Order Created",
          message: `New ${orderType} order created for ${customerName || "Walk-in Customer"}`,
          orderId: newOrder._id,
          type: "order_created",
        },
        type: "order_created",
        orderId: newOrder._id,
        timestamp: new Date(),
      });

 
    }

    // Update table status for Dine-In
    if (orderType === "Dine-In") {
      for (const tableId of tableIds) {
        const table = await Table.findById(tableId);
        if (table.orderId && table.statusOverride === "Available") {
          table.lastOrderId = table.orderId;
        }
        table.status = "Occupied";
        table.orderId = newOrder._id;
        table.reservation = undefined;
        table.statusOverride = undefined;
        await table.save();
      }
    }

    let invoice = null;

    // DIRECT IMPLEMENTATION: Generate invoice based on order type rules
    let shouldGenerateInvoice = false;

    if (orderType === "Dine-In") {
      // For Dine-In, only generate invoice if status is Paid & Completed
      shouldGenerateInvoice = (status === "Paid & Completed");
    } else if (orderType === "Delivery" || orderType === "Take-Home") {
      // For Delivery and Take-Home, always generate invoice
      shouldGenerateInvoice = true;
    }

    if (shouldGenerateInvoice) {
      invoice = generateInvoice(newOrder);

      // Save invoice to database
      await Invoice.create({
        orderId: newOrder._id,
        invoiceNumber: `${newOrder.orderId}`,
        customerName: newOrder.customerName || "Walk-in Customer",
        amount: newOrder.totalPrice,
        paymentMethod: newOrder.paymentMethod,
        date: newOrder.createdAt,
      });

      console.log("Invoice generated for", orderType, "order:", newOrder.orderId);
    } else {
      console.log("Invoice NOT generated. Order Type:", orderType, "Status:", status);
    }

    // Populate table info
    await newOrder.populate("tableIds");

    return res.status(201).json({
      order: newOrder,
   
      notification: notification ? {
        id: notification._id,
        message: notification.message,
        type: notification.type,
      } : null,
    });
  } catch (error) {
    console.error("Order creation failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
// Helper function to generate invoice
const generateInvoice = (order) => {
  return {
    invoiceNumber: `${order.orderId}`,
    customerName: order.customerName || "Walk-in Customer",
    amount: order.totalPrice,
    date: order.createdAt,
    paymentMethod: order.paymentMethod,
    status: order.status,
    orderType: order.orderType,
  };
};

export const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      per_page,
      search = "",
      status,
      branchOrder,
    } = req.query;

    // Final pagination values
    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const pageLimit = Math.max(parseInt(per_page || limit) || 5, 1);
    const skip = (pageNumber - 1) * pageLimit;

    // Extract and verify token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: ERRORS.MISSING_TOKEN });
    }

    let userData;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userData = await User.findById(decoded.id);
      if (!userData) {
        return res.status(401).json({ error: ERRORS.USER_NOT_FOUND });
      }
    } catch {
      return res.status(401).json({ error: ERRORS.INVALID_TOKEN });
    }

    // Define the statusLabels map for filtering (label, value structure)
    const statusLabels = [
      { label: "Processing", value: "Processing" },
      { label: "Served", value: "Served" },
      { label: "Paid-Completed", value: "Paid & Completed" },
      { label: "Cancel", value: "Cancel" },
      { label: "Cancel-Refund", value: "Cancel & Refund" }
    ];

    // Build filters
    const filters = {};

    // Handle search filter
    if (search) {
      const searchKey = isNaN(search) ? "customerName" : "number";
      filters[searchKey] = isNaN(search)
        ? { $regex: search, $options: "i" }
        : search;
    }

    // Handle status filter (map status label to database status)
    if (status) {
      const mappedStatus = statusLabels.find(
        (statusObj) => statusObj.label.toLowerCase() === status.toLowerCase()
      );
      if (mappedStatus) {
        filters.status = mappedStatus.value; // Apply the correct status value to the filter
      } else {
        return res.status(400).json({ error: "Invalid status value" });
      }
    }

    if (branchOrder) {
      filters.branch = new mongoose.Types.ObjectId(branchOrder);
    }

    // Role-based filtering
    if (userData.role === "branch-admin") {
      filters.branch = userData.branch;
    }
    if (userData.role === "admin") {
      filters.hotelBrand = userData.hotelBrand;
    }

    // Fetch orders and total count in parallel
    const [orders, totalOrders] = await Promise.all([
      Order.find(filters)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(pageLimit),
      Order.countDocuments(filters),
    ]);

    return res.status(200).json({
      orders,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalOrders / pageLimit),
      ordersCount: totalOrders,
    });
  } catch (error) {
    console.error("Order fetch error:", error);
    res.status(500).json({ error: error.message });
  }
};



export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Order ID" });
    }

    const order = await Order.findById(id).populate("tableIds");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const io = req.app.get("io");

    // Find existing order
    const oldOrder = await Order.findById(id);
    if (!oldOrder) return res.status(404).json({ error: "Order not found" });

    // Clean up the request body
    const updateData = { ...req.body };

    // If paymentMethod is empty string and status is not "Paid & Completed", remove it
    if (updateData.paymentMethod === "" && updateData.status !== "Paid & Completed") {
      delete updateData.paymentMethod;
    }

    //FIX: COMPLETELY REPLACE the foods array with the incoming data
    let updatedFoods = [];
    
    if (updateData.foods && Array.isArray(updateData.foods)) {
      // Only include foods with quantity > 0
      updatedFoods = updateData.foods.filter(food => food.quantity > 0);
    } else {
      // If no foods in update, keep the original foods
      updatedFoods = [...oldOrder.foods];
    }

    // Recalculate total price
    const totalPrice = updatedFoods.reduce((acc, f) => acc + f.price * f.quantity, 0);

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        ...updateData, // Use cleaned up data
        foods: updatedFoods,
        totalPrice,
      },
      { new: true, runValidators: true }
    );

    //FIXED: AUTOMATIC TABLE STATUS UPDATE - PROPER IMPLEMENTATION
    if (oldOrder.status !== "Paid & Completed" && updatedOrder.status === "Paid & Completed") {
      try {
        // Import Table model
        const Table = mongoose.model('Table');

        console.log("Starting table status update for order completion");
        console.log("Order tableIds:", updatedOrder.tableIds);

        // Update ALL tables associated with this order
        if (updatedOrder.tableIds && updatedOrder.tableIds.length > 0) {
          console.log("Updating tables:", updatedOrder.tableIds);

          // Method 1: Update each table individually to ensure proper saving
          const updatePromises = updatedOrder.tableIds.map(async (tableId) => {
            try {
              const table = await Table.findById(tableId);
              if (table) {
                console.log(`Before update - Table ${table.number}: status=${table.status}, orderId=${table.orderId}`);

                // Update table properties
                table.status = "Available";
                table.orderId = undefined;
                table.lastOrderId = table.orderId; // Keep reference to last order

                // Clear reservation data
                if (table.reservation) {
                  table.reservation = {
                    isReserved: false,
                    timeZone: "Asia/Kolkata"
                  };
                }

                await table.save();
                console.log(`After update - Table ${table.number}: status=${table.status}, orderId=${table.orderId}`);

                return { success: true, tableId, tableNumber: table.number };
              } else {
                console.log(`Table ${tableId} not found`);
                return { success: false, tableId, error: "Table not found" };
              }
            } catch (error) {
              console.error(`Error updating table ${tableId}:`, error);
              return { success: false, tableId, error: error.message };
            }
          });

          const results = await Promise.all(updatePromises);
          console.log("Table update results:", results);

          // Emit socket event for table status updates
          if (io) {
            results.forEach(result => {
              if (result.success) {
                io.emit("tableStatusUpdated", {
                  tableId: result.tableId,
                  tableNumber: result.tableNumber,
                  status: "Available",
                  orderId: updatedOrder._id,
                  updatedAt: new Date()
                });
              }
            });
          }
        } else {
          console.log("No tableIds found in order");
        }
      } catch (tableError) {
        console.error("Failed to update table status automatically:", tableError);
        // Don't fail the order update if table update fails
      }
    }

    //UPDATE KITCHEN ORDER AND GET FOOD CHANGES (WITH ERROR HANDLING)
    let kitchenUpdateResult = null;
    try {
      kitchenUpdateResult = await updateKitchenOrder(updatedOrder);
    } catch (kitchenError) {
      console.error("Kitchen order update failed:", kitchenError);
      // Continue with order update even if kitchen order fails
    }

    //NOTIFICATION: Determine notification type and message
    let notificationType = "order_updated";
    let notificationTitle = "Order Updated";
    let notificationMessage = `Order ${updatedOrder.orderId} has been updated`;

    // Check if status changed
    if (oldOrder.status !== updatedOrder.status) {
      notificationType = "order_status_changed";
      notificationTitle = "Order Status Changed";
      notificationMessage = `Order ${updatedOrder.orderId} status changed from ${oldOrder.status} to ${updatedOrder.status}`;

      //Add table status update to notification if applicable
      if (updatedOrder.status === "Paid & Completed" && oldOrder.status !== "Paid & Completed") {
        notificationMessage += " - Table automatically set to Available";
      }
    }

    // Check if foods changed
    const oldFoodsJSON = JSON.stringify(oldOrder.foods.map(f => ({ name: f.name, quantity: f.quantity })));
    const newFoodsJSON = JSON.stringify(updatedOrder.foods.map(f => ({ name: f.name, quantity: f.quantity })));
    
    if (oldFoodsJSON !== newFoodsJSON) {
      notificationType = "order_updated";
      notificationTitle = "Order Items Updated";
      notificationMessage = `Order ${updatedOrder.orderId} food items have been modified`;
    }

    // NOTIFICATION: Create notification
    const notification = await createNotification({
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      orderId: updatedOrder._id,
      orderNumber: updatedOrder.orderId,
      customerName: updatedOrder.customerName || "Walk-in Customer",
      status: updatedOrder.status,
      previousStatus: oldOrder.status,
      initiatedBy: req.user?.email || req.user?.name || "System",
      branch: updatedOrder.branch,
      hotelBrand: updatedOrder.hotelBrand,
    });

    //NOTIFICATION: Emit socket notifications
    if (io) {
      io.emit("newNotification", {
        notification: notification || {
          title: notificationTitle,
          message: notificationMessage,
          orderId: updatedOrder._id,
          type: notificationType,
        },
        type: notificationType,
        orderId: updatedOrder._id,
        timestamp: new Date(),
      });
    }

    //FIX: Define invoice variables properly
    let invoice = null;
    let existingInvoice = null;

    // Check if invoice exists
    existingInvoice = await Invoice.findOne({ orderId: id });

    if (existingInvoice) {
      // UPDATE EXISTING INVOICE for Take-Home and Delivery orders
      if (updatedOrder.orderType === "Take-Home" || updatedOrder.orderType === "Delivery") {
        existingInvoice.customerName = updatedOrder.customerName || "Walk-in Customer";
        existingInvoice.amount = updatedOrder.totalPrice;

        // Only update paymentMethod if provided and order is paid
        if (updateData.paymentMethod && updatedOrder.status === "Paid & Completed") {
          existingInvoice.paymentMethod = updateData.paymentMethod;
        }

        await existingInvoice.save();
        console.log("Invoice updated for", updatedOrder.orderType, "order:", updatedOrder.orderId);
      }
      // For Dine-In orders, only update payment method if status changed to Paid & Completed
      else if (updatedOrder.orderType === "Dine-In" &&
        updatedOrder.status === "Paid & Completed" &&
        oldOrder.status !== "Paid & Completed" &&
        updateData.paymentMethod) {
        existingInvoice.paymentMethod = updateData.paymentMethod;
        await existingInvoice.save();
      }
    } else {
      // CREATE NEW INVOICE if it doesn't exist
      let shouldGenerateInvoice = false;

      if (updatedOrder.orderType === "Dine-In" &&
        updatedOrder.status === "Paid & Completed" &&
        oldOrder.status !== "Paid & Completed") {
        shouldGenerateInvoice = true;
      }
      else if ((updatedOrder.orderType === "Take-Home" || updatedOrder.orderType === "Delivery") &&
        !existingInvoice) {
        // Always generate invoice for Take-Home and Delivery if doesn't exist
        shouldGenerateInvoice = true;
      }

      if (shouldGenerateInvoice) {
        invoice = generateInvoice(updatedOrder);

        await Invoice.create({
          orderId: updatedOrder._id,
          invoiceNumber: `${updatedOrder.orderId}`,
          customerName: updatedOrder.customerName || "Walk-in Customer",
          amount: updatedOrder.totalPrice,
          paymentMethod: updatedOrder.paymentMethod,
          date: updatedOrder.createdAt,
        });

        console.log("Invoice generated during order update:", updatedOrder.orderId);
      }
    }

    // Emit socket for order update (existing functionality)
    if (io) {
      io.emit("orderUpdated", {
        orderId: updatedOrder._id,
        customerName: updatedOrder.customerName,
        status: updatedOrder.status,
        updatedBy: req.user?.id || req.user?.email || null,
        type: "update",
        time: new Date().toISOString(),
        read: false,
        foodItems: updatedOrder.foods.map(food => ({
          name: food.name,
          quantity: food.quantity,
          image: food.image || "",
        })),
      });
    }

    //FIX: Safe food changes data with proper array checks
    let foodChanges = null;
    if (kitchenUpdateResult) {
      const newFoods = Array.isArray(kitchenUpdateResult.newFoods) ? kitchenUpdateResult.newFoods : [];
      const updatedFoodItems = Array.isArray(kitchenUpdateResult.updatedFoodItems) ? kitchenUpdateResult.updatedFoodItems : [];
      
      foodChanges = {
        kitchenStatus: kitchenUpdateResult.kitchenOrder?.status || "unknown",
        newFoods: newFoods,
        updatedFoods: updatedFoodItems,
        totalNew: newFoods.length,
        totalUpdated: updatedFoodItems.length
      };
    }

    return res.status(200).json({
      updatedOrder,
      invoice: existingInvoice || invoice,
      notification: notification ? {
        id: notification._id,
        message: notification.message,
        type: notification.type,
      } : null,
      foodChanges: foodChanges
    });
  } catch (error) {
    console.error("Order update error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Order ID" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.orderType === "Dine-In" && order.tableId) {
      await Table.findByIdAndUpdate(order.tableId, { status: "Available" });
    }

    await Order.findByIdAndDelete(id);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
