import HotelBrand from "../models/hotelBrandModel.js";
import User from "../models/userModel.js";
import { z } from "zod";
import { createHotelBrandSchema, updateHotelBrandSchema } from "../validations/hotelBrandValidation.js";
import mongoose from 'mongoose';

export const createHotelBrand = async (req, res) => {
  try {
    // Validate request body
    createHotelBrandSchema.parse(req.body);

    const { name, address, phone, adminName, adminEmail, adminPassword } = req.body;

    console.log('Request body:', req.body);
    // Check if admin user already exists
    let existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Create admin user
    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });
    await adminUser.save();

    // Create hotel brand
    const newHotelBrand = new HotelBrand({
      name,
      address,
      phone,
      adminUser: adminUser._id,
    });
    await newHotelBrand.save();

    // Update hotel brand reference in admin user
    adminUser.hotelBrand = newHotelBrand._id;
    await adminUser.save();

    res.status(201).json(newHotelBrand);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message });
    }

    console.error("Error creating hotel brand:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getAllHotelBrands = async (req, res) => {
  try {
    // Run both queries in parallel for better performance
    const [hotelBrands, totalHotel] = await Promise.all([
      HotelBrand.find(),
      HotelBrand.countDocuments(),
    ]);

    res.status(200).json({
      totalHotel,
      hotelBrands,
    });
  } catch (error) {
    console.error("Error fetching hotel brands:", error);
    res.status(500).json({
      message: "Failed to fetch hotel brands.",
      error: error.message,
    });
  }
};

export const getHotelBrand = async (req, res) => {
  try {
    const hotelBrand = await HotelBrand.findOne({ adminUser: req.user._id });

    if (!hotelBrand) {
      return res.status(404).json({ error: "Hotel brand not found." });
    }

    res.status(200).json([hotelBrand]); // returning as an array (kept same)
  } catch (error) {
    console.error("Error fetching hotel brand:", error);
    res.status(500).json({
      message: "Failed to fetch hotel brand.",
      error: error.message,
    });
  }
};

export const updateHotelBrand = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    const updates = updateHotelBrandSchema.parse(req.body);

    // Fetch hotel brand
    const hotelBrand = await HotelBrand.findById(id);

    if (!hotelBrand) {
      return res.status(404).json({ message: "Hotel brand not found" });
    }

    // Apply trimmed string updates
    Object.entries(updates).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim()) {
        hotelBrand[key] = value;
      }
    });

    await hotelBrand.save();

    // Return full updated document
    res.status(200).json(hotelBrand);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: error.errors.map(e => e.message).join(", "),
      });
    }

    console.error("Error updating hotel brand:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteHotelBrand = async (req, res) => {
  try {
    const { id } = req.params;

    //Check if ID is missing
    if (!id || id.trim() === "") {
      return res.status(400).json({ message: "Hotel brand ID is required" });
    }

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid hotel brand ID" });
    }

    const hotelBrand = await HotelBrand.findByIdAndDelete(id);
    if (!hotelBrand) {
      return res.status(404).json({ message: "Hotel brand not found" });
    }

    res.status(200).json({ message: "Hotel brand deleted successfully." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
