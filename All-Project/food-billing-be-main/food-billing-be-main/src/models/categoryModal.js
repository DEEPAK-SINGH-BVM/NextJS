import mongoose from "mongoose";

export const CategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true
  },
  subcategories: {
    type: [String],
    default: []
  }
}, { timestamps: true });

export default mongoose.model("Category", CategorySchema);
