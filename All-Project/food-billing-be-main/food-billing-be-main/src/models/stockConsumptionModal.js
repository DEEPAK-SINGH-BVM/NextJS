import mongoose from "mongoose";

const stockConsumptionReportSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  consumed: { type: Number, required: true },
  cost: { type: Number, required: true },
  currentStock: { type: Number, required: true }, // <-- Add this
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    required: true
  },
  unit: {
    type: String,
    enum: ['Piece', 'Kg', 'Ltr', 'Milligram'],
    required: true
  },
  branch: { type: String },
  hotelBrand: { type: String }
}, { timestamps: true });

export default mongoose.model("StockConsumptionReport", stockConsumptionReportSchema);
