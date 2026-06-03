import mongoose from "mongoose";

const profitLossSummarySchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  branch: { type: String, required: true },
  hotelBrand: { type: String, required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalSale: { type: Number, required: true, default: 0 },
  totalPurchase: { type: Number, required: true, default: 0 },
  totalExpenses: { type: Number, required: true, default: 0 },
  grossProfit: { type: Number, required: true, default: 0 },
  netProfit: { type: Number, required: true, default: 0 },
  profitMargin: { type: String, required: true, default: "0%" },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
export default mongoose.model("ProfitLossSummary", profitLossSummarySchema);
