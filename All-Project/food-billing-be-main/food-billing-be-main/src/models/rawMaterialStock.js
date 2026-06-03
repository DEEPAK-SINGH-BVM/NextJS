import mongoose from "mongoose";

// Main schema for Raw Material
const rawMaterialStock = new mongoose.Schema(
  {
    // Basic details
    description: { type: String },
    
    // Classification
    category: {
      type: String,
      enum: ["food", "expense"],
      required: true
    },
    type: {
      type: String,
      validate: {
        validator: function(value) {
          if (this.category === "food") {
            return ["Fruits", "Vegetable", "Grocery", "Dairy", "Dry Fruits"].includes(value);
          } else if (this.category === "expense") {
            return ["Bill", "Rent", "Salary", "Other"].includes(value);
          }
          return false;
        },
        message: "Type must match the category"
      }
    },

    // Units (only for food category)
    purchaseUnit: {
      type: String,
      enum: ["Dish", "Piece", "Kg", "Ltr", "Milligram"],
    },

    // Amount field for both categories
    amount: {
      type: Number,
      min: 0,
      required: true
    },

    // Day field for formatted creation date
    day: {
      type: String
    },
  },
  { timestamps: true }
);

// Pre-save middleware to set the day field based on createdAt
rawMaterialStock.pre('save', function(next) {
  if (this.isNew) {
    const date = this.createdAt || new Date();
    this.day = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  next();
});

export default mongoose.model("Material", rawMaterialStock);