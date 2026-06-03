import mongoose from "mongoose";

const monthlyReportSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
    },
    reportDate: {
      type: Date,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    purchaseCancel: {
      type: Number,
      default: 0,
    },
    purchaseTotal: {
      type: Number,
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
    },
    saleCancel: {
      type: Number,
      default: 0,
    },
    saleTotal: {
      type: Number,
      required: true,
    },
    profit: {
      type: Number,
      default: 0,
    },
    loss: {
      type: Number,
      default: 0,
    },
    remark: {
      type: String,
      enum: ["Profit", "Loss", "Equal"],
      default: "Equal",
    },
    // monthlyExpenseTotal: {
    //   type: Number,
    //   default: 0,
    // },
    dailyExpenseTotal: {  // Added field here
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Unique index on reportDate + createdBy to avoid duplicates
monthlyReportSchema.index({ reportDate: 1, createdBy: 1 }, { unique: true });

monthlyReportSchema.set("toJSON", { virtuals: true });
monthlyReportSchema.set("toObject", { virtuals: true });

export default mongoose.model("DailyReport", monthlyReportSchema);
