import mongoose from "mongoose";

const kitchenSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      default: "Walk-in Customer",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    hotelBrand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelBrand",
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "update"],
      default: "new"
    },
    foods: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        foodType: {
          type: String,
          enum: ["new", "updated"],
          default: "new" 
        }
      }
    ],
    originalFoods: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        status: {
          type: String,
          enum: ["pending", "preparing", "ready", "served"],
          default: "pending"
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

const KitchenOrder = mongoose.models.KitchenOrder || mongoose.model("Kitchen", kitchenSchema);

export default KitchenOrder;