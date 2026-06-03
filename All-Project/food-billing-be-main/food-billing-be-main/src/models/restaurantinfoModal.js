import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  gstNumber: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  logo: { type: String }, 
}, { timestamps: true });

export default mongoose.model('Restaurant', restaurantSchema);
