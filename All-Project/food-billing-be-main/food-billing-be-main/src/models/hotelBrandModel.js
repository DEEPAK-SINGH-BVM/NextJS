import mongoose from 'mongoose';

const hotelBrandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  adminUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
}, { timestamps: true });

const HotelBrand = mongoose.model('HotelBrand', hotelBrandSchema);

export default HotelBrand;
