import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  adminUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hotelBrand: { type: mongoose.Schema.Types.ObjectId, ref: 'HotelBrand', required: false }, // Optional
}, { timestamps: true });

const Branch = mongoose.model('Branch', branchSchema);

export default Branch;
