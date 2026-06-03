import mongoose from "mongoose";

const taxSettingSchema = new mongoose.Schema({
  serviceCharge: { type: Number, required: true },
  gstTax: { type: Number, required: true },
  vat: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  packagingCharge: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model("TaxSetting", taxSettingSchema);
