import Food from "../models/foodSchema.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import cloudinary from "../utills/cloudinary.js";
import { createFoodSchema } from "../validations/foodValidation.js";
import { z } from "zod";
import mongoose from "mongoose";
import streamifier from "streamifier";
import xlsx from "xlsx";
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({ storage });
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


export const createFood = async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rawData = {
      name: req.body.name?.trim(),
      price: req.body.price ?? "",
      type: req.body.type?.trim(),
      description: req.body.description?.trim(),
      category: req.body.category?.trim(),
      subcategory: req.body.subcategory?.trim(),
      isAvailable: req.body.isAvailable === "true" || req.body.isAvailable === true,
      branchId: user.role === "branch-admin"
        ? String(user.branch)
        : String(req.body.branchId),
      hotelBrand: req.body.hotelBrand || (user.hotelBrand ? String(user.hotelBrand) : undefined),
      image: req.file || req.body.image,
    };

    const parsedData = createFoodSchema.parse(rawData);

    const existingFood = await Food.findOne({
      name: parsedData.name,
      branchId: parsedData.branchId,
    }).collation({ locale: 'en', strength: 2 });

    if (existingFood) {
      return res.status(400).json({
        message: `Food already exists in this branch.`,
      });
    }

    let imageUrl = typeof parsedData.image === "string" ? parsedData.image : "";
    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "food_images" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    }

    const food = new Food({
      name: parsedData.name,
      price: parsedData.price,
      type: parsedData.type,
      description: parsedData.description,
      category: parsedData.category,
      subcategory: parsedData.subcategory,
      isAvailable: parsedData.isAvailable ?? true,
      branchId: new mongoose.Types.ObjectId(parsedData.branchId),
      hotelBrand: new mongoose.Types.ObjectId(parsedData.hotelBrand),
      image: imageUrl,
    });

    await food.save();

    return res.status(201).json(food);
  } catch (err) {
    console.error("Create food error:", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: err.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")
      });
    }
    return res.status(500).json({ message: err.message });
  }
};


export const getAllFood = async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);

    const {
      page = 1,
      limit = 25,
      search = "",
      branchId,
      category,
    } = req.query;

    // Ensure page and limit are valid positive integers
    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const pageLimit = Math.max(parseInt(limit) || 25, 1);
    const skip = (pageNumber - 1) * pageLimit;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Role-based filtering
    if (user.role === "branch-admin") {
      query.branchId = user.branch.toString(); // force filter by their branch
    } else if (user.role === "admin") {
      query.hotelBrand = user.hotelBrand.toString(); // filter by their brand
      if (branchId) query.branchId = branchId;       // allow filtering by branch
    }

    if (category) {
      query.category = category;
    }

    const [allFood, totalFoods] = await Promise.all([
      Food.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),
      Food.countDocuments(query),
    ]);

    res.status(200).json({
      allFood,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalFoods / pageLimit),
      totalFoods,
    });
  } catch (err) {
    res
      .status(err.message === "Unauthorized" ? 401 : 500)
      .json({ message: err.message });
  }
};


export const getFoodByHoteId = async (req, res) => {
  try {
    const { hotelBrandId } = req.params;

    if (!hotelBrandId) {
      return res.status(400).json({ message: "Hotel brand ID is required." });
    }
    const foods = await Food.find({ hotelBrand: hotelBrandId });

    res.status(200).json(foods);
  } catch (err) {
    console.error("Error fetching food by hotel brand ID:", err);
    res.status(500).json({ message: "Failed to fetch food items.", error: err.message });
  }
};

export const deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    res.status(200).json({ message: "Food deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    const {
      name,
      price,
      type,
      category,
      subcategory,
      description,
      isAvailable
    } = req.body;

    if (req.file) {
      const imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "food_images" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      food.image = imageUrl;
    }

    if (name !== undefined) food.name = name;
    if (price !== undefined) food.price = price;
    if (type !== undefined) food.type = type;
    if (category !== undefined) food.category = category;
    if (subcategory !== undefined) food.subcategory = subcategory;
    if (description !== undefined) food.description = description;
    if (isAvailable !== undefined) food.isAvailable = isAvailable;


    await food.save();
    res.status(200).json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const createBulkFood = async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const foods = Array.isArray(req.body.foods) ? req.body.foods : [];

    if (foods.length === 0) {
      return res.status(400).json({ message: "No food items provided." });
    }

    const validFoods = [];
    const duplicateFoods = [];

    for (const item of foods) {
      try {
        const rawData = {
          name: item.name?.trim(),
          price: item.price ?? "",
          type: item.type?.trim(),
          description: item.description?.trim(),
          category: item.category?.trim(),
          subcategory: item.subcategory?.trim(),
          isAvailable: item.isAvailable === "true" || item.isAvailable === true,
          branchId: user.role === "branch-admin"
            ? String(user.branch)
            : String(item.branchId),
          hotelBrand: item.hotelBrand || (user.hotelBrand ? String(user.hotelBrand) : undefined),
          image: item.image, 
        };

      
        const parsedData = createFoodSchema.parse(rawData);

        const existing = await Food.findOne({
          name: parsedData.name,
          branchId: parsedData.branchId,
        }).collation({ locale: "en", strength: 2 });

        if (existing) {
          duplicateFoods.push({
            name: parsedData.name,
            branchId: parsedData.branchId,
          });
          continue;
        }

        let imageUrl = typeof parsedData.image === "string" ? parsedData.image : "";

        if (parsedData.image && parsedData.image.startsWith("data:image")) {
          imageUrl = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "food_images" },
              (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
              }
            );
            const buffer = Buffer.from(parsedData.image.split(",")[1], "base64");
            streamifier.createReadStream(buffer).pipe(stream);
          });
        }

        validFoods.push({
          name: parsedData.name,
          price: parsedData.price,
          type: parsedData.type,
          description: parsedData.description,
          category: parsedData.category,
          subcategory: parsedData.subcategory,
          isAvailable: parsedData.isAvailable ?? true,
          branchId: new mongoose.Types.ObjectId(parsedData.branchId),
          hotelBrand: parsedData.hotelBrand ? new mongoose.Types.ObjectId(parsedData.hotelBrand) : undefined,
          image: imageUrl,
        });
      } catch (err) {
        console.error("Validation failed for one item:",);
        continue; 
      }
    }

    if (validFoods.length === 0) {
      return res.status(400).json({ message: "No valid food items to insert.", duplicateFoods });
    }

    const insertedFoods = await Food.insertMany(validFoods);

    return res.status(201).json({
      message: `${insertedFoods.length} food items created successfully.`,
      inserted: insertedFoods,
      duplicates: duplicateFoods,
    });
  } catch (err) {
    console.error("Bulk food creation error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const uploadExcelFood = async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    if (jsonData.length === 0) {
      return res.status(400).json({ message: "Excel file is empty." });
    }

    const validFoods = [];
    const duplicateFoods = [];
    const invalidFoods = [];

    for (const item of jsonData) {
      try {
        const rawData = {
          name: item.name?.toString().trim(),
          price: item.price ?? "",
          type: item.type?.toString().trim(),
          description: item.description?.toString().trim(),
          category: item.category?.toString().trim(),
          subcategory: item.subcategory?.toString().trim(),
          isAvailable: item.isAvailable === "true" || item.isAvailable === true,
          branchId: user.role === "branch-admin"
            ? String(user.branch)
            : String(item.branchId),
          hotelBrand: item.hotelBrand || (user.hotelBrand ? String(user.hotelBrand) : undefined),
          image: item.image || "", 
        };

        const parsedData = createFoodSchema.parse(rawData);

        const existing = await Food.findOne({
          name: parsedData.name,
          branchId: parsedData.branchId,
        }).collation({ locale: "en", strength: 2 });

        if (existing) {
          duplicateFoods.push({
            name: parsedData.name,
            branchId: parsedData.branchId,
            message: `${parsedData.name} already exists in this branch`
          });
          continue;
        }


        let imageUrl = typeof parsedData.image === "string" ? parsedData.image : "";

        if (parsedData.image?.startsWith("data:image")) {
          // Base64 image
          imageUrl = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "food_images" },
              (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
              }
            );
            const buffer = Buffer.from(parsedData.image.split(",")[1], "base64");
            streamifier.createReadStream(buffer).pipe(stream);
          });
        }

        validFoods.push({
          name: parsedData.name,
          price: parsedData.price,
          type: parsedData.type,
          description: parsedData.description,
          category: parsedData.category,
          subcategory: parsedData.subcategory,
          isAvailable: parsedData.isAvailable ?? true,
          branchId: new mongoose.Types.ObjectId(parsedData.branchId),
          hotelBrand: parsedData.hotelBrand ? new mongoose.Types.ObjectId(parsedData.hotelBrand) : undefined,
          image: imageUrl,
        });
      } catch (err) {
        invalidFoods.push({ item, error: err?.message });
      }
    }

    if (validFoods.length === 0) {
      return res.status(400).json({
        message: "This Foods already exists in this branch",
        duplicates: duplicateFoods,
        invalids: invalidFoods,
      });
    }

    const insertedFoods = await Food.insertMany(validFoods);
    console.log("Inserted foods:", insertedFoods.name);
    

    return res.status(201).json({
      message: `${insertedFoods.length} food items created successfully.`,
      inserted: insertedFoods,
      duplicates: duplicateFoods,
      invalids: invalidFoods,
    });
  } catch (err) {
    console.error("Excel upload error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


