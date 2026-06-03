import mongoose from "mongoose";

const PrinterSettingsSchema = new mongoose.Schema({
  kitchenPrinter: {
    type: String,
    enum: ["Kitchen Printer (192.168.1.100)", "Epson TM-T88V (192.168.1.102)", "Star TSP143 (192.168.1.103)"],
    required: true
  },
  receiptPrinter: {
    type: String,
    enum: ["Receipt Printer (192.168.1.101)", "Epson TM-T20II (192.168.1.104)", "Star TSP100 (192.168.1.105)"],
    required: true
  },
  paperSize: {
    type: String,
    enum: ["A4", "58mm", "80mm"],
    required: true
  },
  printKitchenAutomatically: { type: Boolean, default: false },
  printCustomerReceipts: { type: Boolean, default: false },
  autoPrintOnConfirmation: { type: Boolean, default: false },
});

export default mongoose.model("PrintrSettings", PrinterSettingsSchema);
