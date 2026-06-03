import mongoose from 'mongoose';

const dashboardSchema = new mongoose.Schema({
  orderType: { 
    type: String, 
    enum: ['dine-in', 'take-home', 'summary'], // Add 'summary' to the enum list
    required: true 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Dashboard', dashboardSchema);
