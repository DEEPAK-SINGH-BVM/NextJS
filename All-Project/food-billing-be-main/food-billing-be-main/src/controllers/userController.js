import User from '../models/userModel.js';
import mongoose from 'mongoose';
import { createUserSchema } from '../validations/userValidation.js';
import bcrypt from 'bcryptjs/dist/bcrypt.js';

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.per_page, 10) || 25;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const skip = (page - 1) * limit;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      if (!isNaN(search)) {
        filter.number = parseInt(search, 10);
      } else {
        filter.name = { $regex: search, $options: "i" };
      }
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const sanitizedUsers = users.map(user => {
      const userObj = user.toJSON();
      delete userObj.password;
      return userObj;
    });

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      message: "Filtered users",
      UserDatas: sanitizedUsers,
      page,
      totalUsers,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    // Validate input
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.flatten().fieldErrors,
      });
    }

    let {
      name,
      email,
      password,
      role,
      profileImage,
      hotelBrand,
      branch,
      permissions,
    } = parsed.data;

    // Normalize optional fields
    hotelBrand = hotelBrand === "" ? null : hotelBrand;
    branch = branch === "" ? null : branch;
    permissions = permissions || [];

    // Normalize email
    email = email.toLowerCase();

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      role,
      profileImage,
      hotelBrand,
      branch,
      permissions,
    });

    await newUser.save();

    // Sanitize response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // MongoDB ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const updateFields = ['name', 'email', 'password', 'role', 'hotelBrand', 'branch', 'permissions'];
    const updates = {};

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json(userObj);
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
};
