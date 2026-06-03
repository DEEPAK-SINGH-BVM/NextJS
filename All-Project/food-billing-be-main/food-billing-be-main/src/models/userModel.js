import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profileImage: { type: String },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: [
        "super-admin",
        "admin",
        "branch-admin",
      ],
    },
    hotelBrand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelBrand",
      default: null,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },
    permissions: { type: [String], default: [] },
    resetOTP: {
      type: String,
    },
    resetOTPExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
