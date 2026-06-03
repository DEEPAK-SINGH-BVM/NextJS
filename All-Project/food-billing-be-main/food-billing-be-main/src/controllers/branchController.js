import mongoose from "mongoose";
import Branch from "../models/branchModel.js";
import User from "../models/userModel.js";
import { createBranchSchema, updateBranchSchema } from "../validations/branchValidation.js";

export const createBranch = async (req, res) => {
  try {
    const {
      name,
      address,
      phone,
      branchAdminName,
      branchAdminEmail,
      branchAdminPassword,
      hotelBrand,
      // Remove roleBranch or ignore it
    } = req.body;

    const userRole = req.user.role;

    // Authorization: Only certain roles can create branches
    const allowedCreators = ['super-admin', 'admin', 'branch-admin'];
    if (!allowedCreators.includes(userRole)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    // Use the creator's hotelBrand if not explicitly passed
    const hotelBrandId = req.user.hotelBrand || hotelBrand;

    // Prevent duplicate admin email
    const existingUser = await User.findOne({ email: branchAdminEmail });
    if (existingUser) {
      return res.status(400).json({ error: "A user with this email already exists." });
    }

    const branchAdminUser = new User({
      name: branchAdminName,
      email: branchAdminEmail,
      password: branchAdminPassword,
      role: "branch-admin", // Always set this
      hotelBrand: hotelBrandId || undefined,
    });

    await branchAdminUser.save();

    const newBranch = new Branch({
      name,
      address,
      phone,
      adminUser: branchAdminUser._id,
      hotelBrand: hotelBrandId || undefined,
    });

    await newBranch.save();

    branchAdminUser.branch = newBranch._id;
    await branchAdminUser.save();

    res.status(201).json(newBranch);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export const getBranches = async (req, res) => {
  try {
    const { role, branch, hotelBrand } = req.user;
    const { search, page = 1, per_page = 25 } = req.query;

    let queryFilter = {};

    // Role-based filtering
    switch (role) {
      case "super-admin":
      case "branch-admin":
        // No filter needed, fetch all branches
        break;
      case "sub-admin":
        queryFilter._id = branch;
        break;
      case "admin":
      case "adminManager":
        queryFilter.hotelBrand = hotelBrand;
        break;
      default:
        return res.status(403).json({ error: "Unauthorized access" });
    }

    // Search filter
    if (search) {
      queryFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const limit = parseInt(per_page);
    const skip = (parseInt(page) - 1) * limit;

    // Fetch branches with pagination
    const [branches, totalBranches] = await Promise.all([
      Branch.find(queryFilter)
        .populate("adminUser")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Branch.countDocuments(queryFilter),
    ]);

    const totalPages = Math.ceil(totalBranches / limit);
    res.status(200).json({
      branches,
      currentPage: parseInt(page),
      totalPages,
      totalBranches,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { success, data, error: validationError } = updateBranchSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationError.flatten().fieldErrors,
      });
    }

    const { id } = req.params;

    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    Object.assign(branch, data);

    await branch.save();
    res.status(200).json(branch);
  } catch (error) {
    console.error("Update Branch Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid branch ID" });
    }

    const deletedBranch = await Branch.findByIdAndDelete(id);

    if (!deletedBranch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    return res.status(200).json({ message: "Branch deleted successfully" });
  } catch (error) {
    console.error("Delete Branch Error:", error);
    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
};
