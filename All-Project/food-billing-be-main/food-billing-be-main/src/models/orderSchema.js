import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    floor: {
      type: Number,
      required: function () {
        return this.orderType === "Dine-In";
      },
      validate: {
        validator: Number.isInteger,
        message: "Floor must be a valid integer."
      }
    },
    tableNumbers: {
      type: [String],
      required: false,
    },
    tableIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Table",
      required: function () {
        return this.orderType === "Dine-In";
      },
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI"],
      required: false,
    },
    status: {
      type: String,
      enum: [
        "Processing",
        "Served",
        "Paid & Completed",
        "Cancel",
        "Cancel & Refund",
      ],
      default: "Processing",
    },
    customerName: {
      type: String,
      required: false,
    },
    number: {
      type: String,
      required: false,
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
    foods: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        instructions: {
          type: String,
        },
        image: {
          type: String,
        },
      },
    ],
    orderType: {
      type: String,
      required: true,
    },
    deliveryAddress: {
      type: String,
      default: null,
    },
    taxSnapshot: {
      serviceCharge: { type: Number, required: true },
      gstTax: { type: Number, required: true },
      vat: { type: Number, required: true },
      deliveryCharge: { type: Number, required: true },
      packagingCharge: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;