import Material from "../models/rawMaterialStock.js";
import XLSX from "xlsx";
import mongoose from 'mongoose';
import { updateRawItemSchema } from "../validations/rawMaterialValidation.js";
import z from "zod";

export const createRawItem = async (req, res) => {
  try {
    // 1. Validate request body using Zod
    const parsed = updateRawItemSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed.",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const {
      description,
      category,
      type,
      purchaseUnit,
      amount,
    } = parsed.data;

    // 2. Create new material (day will be auto-set by pre-save middleware)
    const userId = req.user?._id || null;

    const newMaterial = new Material({
      description,
      category,
      type,
      amount,
      created: userId,
    });

    // Set fields based on category - only set purchaseUnit if it's not empty
    if (category === "food" && purchaseUnit) {
      newMaterial.purchaseUnit = purchaseUnit;
    }

    const savedMaterial = await newMaterial.save();

    res.status(201).json({
      message: "Raw item created successfully.",
      data: savedMaterial,
    });
  } catch (error) {
    console.error("Error creating raw item:", error);
    res.status(500).json({
      message: "Something went wrong while creating the raw item.",
      error: error.message,
    });
  }
};

export const updateRawItem = async (req, res) => {
  try {
    const validated = updateRawItemSchema.parse(req.body);
    const { id } = req.params;

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: "Raw item not found." });
    }

    // Update material fields only if defined and not empty string
    for (const [key, value] of Object.entries(validated)) {
      if (value !== undefined && value !== "") {
        // Clear fields when switching categories
        if (key === 'category' && value !== material.category) {
          if (value === 'food') {
            material.purchaseUnit = undefined;
          } else if (value === 'expense') {
            material.purchaseUnit = undefined;
          }
        }
        material[key] = value;
      }
    }

    await material.save();

    return res.status(200).json({
      message: "Raw item updated successfully.",
      data: material
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    console.error("Error updating raw item:", error);
    return res.status(500).json({
      message: "Something went wrong while updating the raw item.",
      error: error.message,
    });
  }
};

export const deleteRawItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid raw item ID" });
    }

    const deletedItem = await Material.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Raw item not found." });
    }

    return res.status(200).json({ message: "Raw item deleted successfully." });
  } catch (error) {
    console.error("Error deleting raw item:", error);
    return res.status(500).json({
      message: "Something went wrong while deleting the raw item.",
      error: error.message,
    });
  }
};

export const getAllItem = async (req, res) => {
  try {
    const {
      search = "",
      sortBy = "createdAt",
      order = "desc",
      per_page,
      page,
      category = "",
      type = "",
      startDate = "",
      endDate = ""
    } = req.query;

    const currentPage = parseInt(page, 10) || 1;
    const limit = parseInt(per_page, 10) || 25;
    const skip = (currentPage - 1) * limit;

    const filter = {};
    if (search) {
      filter.description = { $regex: search, $options: "i" };
    }
    if (category) {
      filter.category = category;
    }
    if (type) {
      filter.type = type;
    }

    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const sortOrder = order.toLowerCase() === "asc" ? 1 : -1;
    const sort = {
      [sortBy]: sortOrder,
      type: 1,
    };

    // Get date ranges
    const currentDate = new Date();
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOfMonthDate = new Date(startOfMonth);
    startOfMonthDate.setHours(0, 0, 0, 0);

    // Get paginated items and total count
    const [allItems, totalStock] = await Promise.all([
      Material.find(filter).sort(sort).skip(skip).limit(limit),
      Material.countDocuments(filter),
    ]);

    // Get all items for calculations (with same filters)
    const allFilteredItems = await Material.find(filter);

    // Initialize totals
    let dailyFoodTotal = 0;
    let dailyExpenseTotal = 0;
    let monthlyFoodTotal = 0;
    let monthlyExpenseTotal = 0;
    let overallFoodTotal = 0;
    let overallExpenseTotal = 0;

    // Calculate totals by iterating through all items
    allFilteredItems.forEach(item => {
      const itemDate = new Date(item.createdAt);
      
      // Overall totals
      if (item.category === "food") {
        overallFoodTotal += item.amount;
      } else if (item.category === "expense") {
        overallExpenseTotal += item.amount;
      }

      // Monthly totals
      if (itemDate >= startOfMonthDate) {
        if (item.category === "food") {
          monthlyFoodTotal += item.amount;
        } else if (item.category === "expense") {
          monthlyExpenseTotal += item.amount;
        }
      }

      // Daily totals
      if (itemDate >= startOfDay) {
        if (item.category === "food") {
          dailyFoodTotal += item.amount;
        } else if (item.category === "expense") {
          dailyExpenseTotal += item.amount;
        }
      }
    });

    const calculations = {
      daily: {
        food: dailyFoodTotal,
        expense: dailyExpenseTotal
      },
      monthly: {
        food: monthlyFoodTotal,
        expense: monthlyExpenseTotal
      },
      overall: {
        food: overallFoodTotal,
        expense: overallExpenseTotal
      }
    };

    const totalPages = Math.ceil(totalStock / limit);

    res.status(200).json({
      message: "Raw items fetched successfully",
      StockData: allItems,
      currentPage,
      totalStock,
      totalPages,
      calculations
    });
  } catch (error) {
    console.error("Error fetching raw items:", error);
    res.status(500).json({
      message: "Something went wrong while fetching the raw items.",
      error: error.message,
    });
  }
};

export const bulkUploadRawItems = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const validItems = [];
    const errors = [];

    for (const [index, item] of sheetData.entries()) {
      try {
        // Validate required fields
        if (!item.category || !item.type || item.amount === undefined) {
          errors.push(`Row ${index + 2}: Missing category, type, or amount`);
          continue;
        }

        let validItem = {
          description: item.Description || "",
          category: item.category,
          type: item.type,
          amount: Number(item.amount),
          created: req.user._id,
          // Note: day field will be automatically set by pre-save middleware
        };

        // Set fields based on category
        if (item.category === "food") {
          if (!item.purchaseUnit) {
            errors.push(`Row ${index + 2}: Food items require purchaseUnit`);
            continue;
          }

          // Validate food type
          if (!["Fruits", "Vegetable", "Grocery", "Dairy", "Dry Fruits"].includes(item.type)) {
            errors.push(`Row ${index + 2}: Invalid type for food category`);
            continue;
          }

          validItem.purchaseUnit = item.purchaseUnit;

        } else if (item.category === "expense") {
          // Validate expense type
          if (!["Bill", "Rent", "Salary"].includes(item.type)) {
            errors.push(`Row ${index + 2}: Invalid type for expense category`);
            continue;
          }

          // Food-specific fields should not be provided for expense
          if (item.purchaseUnit !== undefined) {
            errors.push(`Row ${index + 2}: Purchase unit should not be provided for expense items`);
            continue;
          }
        } else {
          errors.push(`Row ${index + 2}: Invalid category`);
          continue;
        }

        validItems.push(validItem);
      } catch (error) {
        errors.push(`Row ${index + 2}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Some items have validation errors",
        errors: errors
      });
    }

    if (validItems.length === 0) {
      return res.status(400).json({ message: "No valid items to upload." });
    }

    const savedItems = await Material.insertMany(validItems);

    res.status(201).json({
      message: `${savedItems.length} raw items added successfully.`,
      data: savedItems,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({
      message: "Something went wrong while uploading the file.",
      error: error.message,
    });
  }
};