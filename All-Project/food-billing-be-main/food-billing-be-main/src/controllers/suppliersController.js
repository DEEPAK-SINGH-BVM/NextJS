import Supplier from "../models/suppliersModal.js";
import { supplierValidation } from "../validations/suppliersValidation.js";
import mongoose from 'mongoose';

export const createSupplier = async (req, res) => {
  try {
    // Validate the request body using Zod
    const parsedData = supplierValidation.parse(req.body);

    const { name, contactPerson, phone, email, address } = parsedData;

    const newSupplier = new Supplier({
      name,
      contactPerson,
      phone,
      email,
      address,
      createdBy: req.user._id,
    });

    const savedSupplier = await newSupplier.save();
    res.status(201).json({ message: "Supplier created successfully.", data: savedSupplier });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // If validation error occurs, return 400 with the validation errors
      return res.status(400).json({
        message: "Validation failed.",
        errors: error.errors, // Detailed validation error messages
      });
    }
    // Catch any other errors
    console.error("Create Supplier Error:", error);
    res.status(500).json({ message: "Server error while creating supplier.", error: error.message });
  }
};

export const getAllSuppliers = async (req, res) => {
  try {
    const {
      search = "",
      per_page,
      page,
    } = req.query;

    const currentPage = parseInt(page, 10) || 1;
    const limit = parseInt(per_page, 10) || 25;
    const skip = (currentPage - 1) * limit;

    const searchFilter = {};
    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      searchFilter.$or = [
        { name: { $regex: regex } },
        // You can add more searchable fields here if needed
      ];
    }

    const [suppliers, totalSuppliers] = await Promise.all([
      Supplier.find(searchFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Supplier.countDocuments(searchFilter),
    ]);

    const totalPages = Math.ceil(totalSuppliers / limit);

    res.status(200).json({
      message: "Suppliers fetched successfully.",
      data: suppliers,
      currentPage,
      totalPages,
      totalSuppliers,
    });
  } catch (error) {
    console.error("Fetch Suppliers Error:", error);
    res.status(500).json({
      message: "Server error while fetching suppliers.",
      error: error.message,
    });
  }
};
  
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid supplier ID" });
    }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found." });
    }

    // Update only the fields provided in req.body
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        supplier[key] = value;
      }
    });

    const updatedSupplier = await supplier.save();
    res.status(200).json({ message: "Supplier updated successfully.", data: updatedSupplier });
  } catch (error) {
    console.error("Update Supplier Error:", error);
    res.status(500).json({ message: "Server error while updating supplier.", error: error.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid supplier ID" });
    }

    const deletedSupplier = await Supplier.findByIdAndDelete(id);

    if (!deletedSupplier) {
      return res.status(404).json({ message: "Supplier not found or already deleted." });
    }

    return res.status(200).json({
      message: "Supplier deleted successfully.",
      // data: deletedSupplier,
    });
  } catch (error) {
    console.error("Delete Supplier Error:", error);
    return res.status(500).json({
      message: "Server error while deleting supplier.",
      error: error.message,
    });
  }
};
