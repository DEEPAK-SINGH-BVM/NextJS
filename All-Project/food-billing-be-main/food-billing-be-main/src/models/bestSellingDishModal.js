import mongoose from "mongoose";

const bestSellingDishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalSold: { type: Number, required: true },
  revenue: { type: Number, required: true },
  day: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("BestSellingDish", bestSellingDishSchema);
