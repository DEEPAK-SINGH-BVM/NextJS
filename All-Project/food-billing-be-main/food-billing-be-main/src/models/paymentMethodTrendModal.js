import mongoose from "mongoose";

const paymentMethodTrendSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ["Cash", "Card", "UPI", "pending PaymentData"],
    required: true,
  },
  count: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  day: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("PaymentMethodTrend", paymentMethodTrendSchema);
