import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    price: { type: Number, required: true },
    name: { type: String, required: true },
    type: { type: String, required: false },
    description: { type: String, required: false },
    instructions: { type: String },
    image: { type: String },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    hotelBrand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelBrand",
      required: false,
    },
    category: { type: String, required: true },
    subcategory: { type: String, required: false },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Food = mongoose.model("Food", foodSchema);

export default Food;
