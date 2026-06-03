import restaurantinfo from "../models/restaurantinfoModal.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import cloudinary from "../utills/cloudinary.js";
import { saveRestaurantInfoSchema } from "../validations/restaurantValidation.js";
import mongoose from "mongoose";

const getUserFromToken = async (authHeader) => {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
};

export const saveRestaurantInfo = async (req, res) => {
  try {
    const parseResult = saveRestaurantInfoSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map(e => e.message);
      return res.status(400).json({ error: errorMessages.join(", ") });
    }

    const user = await getUserFromToken(req.headers.authorization);

    const {
      name,
      phone,
      address,
      email,
      gstNumber,
      licenseNumber
    } = parseResult.data;

    let logoUrl = null;
    if (req.file) {
      const streamifier = await import("streamifier");
      logoUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "restaurant_logos" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        streamifier.default.createReadStream(req.file.buffer).pipe(stream);
      });
    }

    let restaurant = await restaurantinfo.findOne();
    if (restaurant) {
      restaurant.name = name;
      restaurant.phone = phone;
      restaurant.address = address;
      restaurant.email = email;
      restaurant.gstNumber = gstNumber;
      restaurant.licenseNumber = licenseNumber;
      if (logoUrl) restaurant.logo = logoUrl;

      await restaurant.save();
    } else {
      restaurant = new restaurantinfo({
        name,
        phone,
        address,
        email,
        gstNumber,
        licenseNumber,
        logo: logoUrl
      });
      await restaurant.save();
    }

    res.status(200).json({ message: 'Saved successfully', data: restaurant });

  } catch (error) {
    console.error(error);
    res.status(error.message === "Unauthorized" ? 401 : 500).json({
      error: error.message || 'Something went wrong'
    });
  }
};

export const getRestaurantInfo = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    await getUserFromToken(authHeader);

    const restaurant = await restaurantinfo.findOne();
    if (!restaurant) {
      return res.status(404).json({ error: 'No data found' });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    const statusCode = error.message === "Unauthorized" ? 401 : 500;
    res.status(statusCode).json({ error: error.message || 'Server error' });
  }
};

export const updateRestaurantInfo = async (req, res) => {
  try {
    await getUserFromToken(req.headers.authorization);

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid restaurant ID." });
    }

    const {
      name,
      phone,
      address,
      email,
      gstNumber,
      licenseNumber,
    } = req.body;

    let logoUrl = null;
    if (req.file) {
      logoUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "restaurant_logos" },
          (error, result) => (error ? reject(error) : resolve(result.secure_url))
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    }

    const restaurant = await restaurantinfo.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant info not found" });
    }

    // Update only provided fields
    if (name) restaurant.name = name;
    if (phone) restaurant.phone = phone;
    if (address) restaurant.address = address;
    if (email) restaurant.email = email;
    if (gstNumber) restaurant.gstNumber = gstNumber;
    if (licenseNumber) restaurant.licenseNumber = licenseNumber;
    if (logoUrl) restaurant.logo = logoUrl;

    await restaurant.save();

    return res.status(200).json({ message: "Restaurant info updated", data: restaurant });
  } catch (error) {
    console.error(error);
    return res.status(error.message === "Unauthorized" ? 401 : 500).json({
      error: error.message || "Update failed",
    });
  }
};
