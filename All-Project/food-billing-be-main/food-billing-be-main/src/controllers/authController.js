import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import cloudinary from "../utills/cloudinary.js";
import streamifier from "streamifier";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "user_profiles" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, hotelBrand, branch, permissions } =
      req.body;

    const normalizedEmail = email.toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Handle empty strings as null for MongoDB compatibility
    const normalizedHotelBrand = hotelBrand === "" ? null : hotelBrand;
    const normalizedBranch = branch === "" ? null : branch;

    let profileImageUrl = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      profileImageUrl = result.secure_url;
    }

    const user = new User({
      name,
      email: normalizedEmail,
      password, // Hashing assumed done in model middleware
      role,
      hotelBrand: normalizedHotelBrand,
      branch: normalizedBranch,
      permissions,
      profileImage: profileImageUrl,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    console.log("normalizedEmail", normalizedEmail);
    let user = await User.findOne({ email: normalizedEmail }).collation({
      locale: "en",
      strength: 2,
    });
    console.log("user", user);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({ user: userData, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = { ...req.body };

    // Completely remove any password related fields from update
    delete updates.password;
    delete updates.oldPassword;
    delete updates.newPassword;

    // Handle profile image upload if present
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      updates.profileImage = result.secure_url;
    }

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove password field before sending response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    return res.status(200).json({ user: userResponse });
  } catch (error) {
    console.error("Update User error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  console.log("req", req);

  try {
    const { email } = req.body;
    console.log("Incoming request email:", email);

    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now

    user.resetOTP = otp;
    user.resetOTPExpiry = expiry;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Password Reset OTP",
      text: `Hello ${user.name},\n\nYour OTP to reset your password is: ${otp}.\nIt expires in 15 minutes.\n\nIf you didn't request this, please ignore this email.\n\nThanks.`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error("Email sending failed:", mailError);
      return res.status(500).json({ error: "Failed to send OTP email" });
    }

    return res
      .status(200)
      .json({ message: "OTP sent to your email.", user_id: user._id });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { user_id, otp, new_password } = req.body;

    if (!user_id || !otp || !new_password) {
      return res
        .status(400)
        .json({ error: "user_id, otp, and new_password are required" });
    }

    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.resetOTP || !user.resetOTPExpiry) {
      return res
        .status(400)
        .json({ error: "No OTP request found for this user" });
    }

    if (user.resetOTP !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (Date.now() > user.resetOTPExpiry) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    user.password = new_password;
    user.resetOTP = null;
    user.resetOTPExpiry = null;

    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // No need to do anything server-side for JWT logout
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Logout failed" });
  }
};

// export const sendOTP = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) return res.status(400).json({ error: "Email is required" });

//     const user = await User.findOne({ email });

//     if (!user) return res.status(404).json({ error: "User not found" });

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

//     user.resetOTP = otp;
//     user.resetOTPExpiry = expiry;

//     try {
//       await user.save();
//     } catch (err) {
//       console.error("Error saving OTP:", err);
//       return res.status(500).json({ error: "Failed to save OTP" });
//     }

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Your Password Reset OTP",
//       text: `Hello ${user.name},\n\nYour OTP to reset your password is: ${otp}.\nIt expires in 15 minutes.\n\nIf you didn't request this, please ignore this email.\n\nThanks.`,
//     };

//     await transporter.sendMail(mailOptions);

//     return res.status(200).json({
//       message: "OTP sent to your email",
//       user_id: user._id,
//     });
//   } catch (error) {
//     console.error("Forgot password error:", error);
//     return res.status(500).json({ error: error.message });
//   }
// };

// export const resetPassword = async (req, res) => {
//   try {
//     const { user_id, new_password, otp } = req.body;

//     if (!user_id || !new_password || !otp) {
//       return res.status(400).json({ error: "user_id, new_password, and otp are required" });
//     }

//     const user = await User.findById(user_id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     if (!user.resetOTP || !user.resetOTPExpiry) {
//       return res.status(400).json({ error: "No OTP request found for this user" });
//     }

//     if (user.resetOTP !== otp) {
//       return res.status(400).json({ error: "Invalid OTP" });
//     }

//     if (Date.now() > user.resetOTPExpiry) {
//       return res.status(400).json({ error: "OTP has expired" });
//     }

//     user.password = new_password;

//     user.resetOTP = null;
//     user.resetOTPExpiry = null;

//     await user.save();

//     return res.status(200).json({ message: "Password reset successfully" });
//   } catch (error) {
//     console.error("Reset password error:", error);
//     return res.status(500).json({ error: error.message });
//   }
// };

