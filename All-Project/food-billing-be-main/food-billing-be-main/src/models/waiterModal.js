import mongoose from "mongoose";

const waiterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    phone: { type: Number, required: true },
    email: { type: String, required: true },
    shift: { type: String, required: true, enum: ["Morning", "Evening", "Night"] },
    address: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Waiter = mongoose.model("Waiter", waiterSchema);
export default Waiter;
