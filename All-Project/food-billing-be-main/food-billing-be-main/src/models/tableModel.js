import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    floor: { type: Number, required: true },
    number: { type: Number, required: true },
    capacity: { type: Number, required: true },
    waiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Waiter",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    lastOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    status: {
      type: String,
      enum: ["Available", "Occupied", "Reserved"],
      default: "Available",
    },
    statusOverride: {
      type: String,
      enum: ["Available", "Occupied", "Reserved"],
      default: null,
    },
    isMerged: {
      type: Boolean,
      default: false,
    },
    mergedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Table",
      },
    ],
    reservation: {
      customerName: { type: String },
      customerPhone: { type: String },
      specialRequests: { type: String },
      reservationDate: { type: String },
      reservationTime: { type: String },
      durationValue: { type: Number, default: 60 },
      durationUnit: {
        type: String,
        enum: ["minutes", "hours", "days"],
        default: "minutes",
      },
      durationMinutes: { type: Number, default: 60 },
      isReserved: { type: Boolean, default: false },
      reservationStartUTC: { type: Date },
      timeZone: { type: String, default: "Asia/Kolkata" },
    },
  },
  { timestamps: true }
);

// Add a unique compound index for the combination of floor, number, and branch
tableSchema.index({ floor: 1, number: 1, branch: 1 }, { unique: true });

const Table = mongoose.model("Table", tableSchema);
export default Table;
