import Waiter from "../models/waiterModal.js";
import mongoose from "mongoose";

export const createWaiter = async (req, res) => {
  try {
    const { name, age, phone, email, shift, address } = req.body;

    if (!name || !age || !phone || !email || !shift || !address) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newWaiter = new Waiter({
      name,
      age,
      phone,
      email,
      shift,
      address,
      createdBy: req.user._id,
    });

    const savedWaiter = await newWaiter.save();
    res.status(201).json({ message: "Waiter created successfully.", data: savedWaiter });
  } catch (error) {
    console.error("Create Waiter Error:", error);
    res.status(500).json({ message: "Server error while creating waiter.", error: error.message });
  }
};

export const getAllWaiters = async (req, res) => {
  try {
    const { search = "", per_page, page } = req.query;

    const currentPage = parseInt(page, 10) || 1;
    const limit = parseInt(per_page, 10) || 25;
    const skip = (currentPage - 1) * limit;

    const filter = {};
    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ name: { $regex: regex } }, { email: { $regex: regex } }];
    }

    const [waiters, totalWaiters] = await Promise.all([
      Waiter.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Waiter.countDocuments(filter),
    ]);

    res.status(200).json({
      message: "Waiters fetched successfully.",
      data: waiters,
      currentPage,
      totalPages: Math.ceil(totalWaiters / limit),
      totalWaiters,
    });
  } catch (error) {
    console.error("Fetch Waiters Error:", error);
    res.status(500).json({
      message: "Server error while fetching waiters.",
      error: error.message,
    });
  }
};

export const updateWaiter = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const waiter = await Waiter.findById(id);
    if (!waiter) {
      return res.status(404).json({ message: "Waiter not found." });
    }

    // Update only fields present in req.body
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        waiter[key] = value;
      }
    });

    const updatedWaiter = await waiter.save();
    res.status(200).json({ message: "Waiter updated successfully.", data: updatedWaiter });
  } catch (error) {
    console.error("Update Waiter Error:", error);
    res.status(500).json({ message: "Server error while updating waiter.", error: error.message });
  }
};

export const deleteWaiter = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid waiter ID." });
    }

    const deletedWaiter = await Waiter.findByIdAndDelete(id);

    if (!deletedWaiter) {
      return res.status(404).json({ message: "Waiter not found." });
    }

    res.status(200).json({
      message: "Waiter deleted successfully.",
      // data: deletedWaiter,
    });
  } catch (error) {
    console.error("Delete Waiter Error:", error);
    res.status(500).json({
      message: "Server error while deleting waiter.",
      error: error.message,
    });
  }
};