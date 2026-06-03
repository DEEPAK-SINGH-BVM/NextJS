import mongoose from "mongoose";
import PrinterSetting from "../models/PrintersettingModal.js";
import { savePrinterSettingSchema } from "../validations/Printersettingvalidation.js";

export const savePrinterSetting = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    //Validate input
    const parseResult = savePrinterSettingSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => e.message);
      return res.status(400).json({ error: errors.join(", ") });
    }

    const {
      kitchenPrinter,
      receiptPrinter,
      paperSize,
      printKitchenAutomatically,
      printCustomerReceipts,
      autoPrintOnConfirmation,
    } = parseResult.data;

    let setting = await PrinterSetting.findOne();

    if (setting) {
      setting.kitchenPrinter = kitchenPrinter;
      setting.receiptPrinter = receiptPrinter;
      setting.paperSize = paperSize;
      setting.printKitchenAutomatically = printKitchenAutomatically;
      setting.printCustomerReceipts = printCustomerReceipts;
      setting.autoPrintOnConfirmation = autoPrintOnConfirmation;
      await setting.save();
    } else {
      setting = new PrinterSetting({
        kitchenPrinter,
        receiptPrinter,
        paperSize,
        printKitchenAutomatically,
        printCustomerReceipts,
        autoPrintOnConfirmation,
      });
      await setting.save();
    }

    res.status(200).json({ message: "Printer settings saved", data: setting });
  } catch (error) {
    console.error("Save Printer Setting Error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

export const getPrinterSetting = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const setting = await PrinterSetting.findOne();
    if (!setting) {
      return res.status(404).json({ error: "Printer settings not found" });
    }

    return res.status(200).json(setting);
  } catch (error) {
    console.error("Get Printer Setting Error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
};

export const updatePrinterSetting = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    const setting = await PrinterSetting.findById(id);
    if (!setting) return res.status(404).json({ error: "Not found" });

    Object.entries(req.body).forEach(([key, value]) => {
      if (value !== undefined) setting[key] = value;
    });

    await setting.save();

    return res.status(200).json(setting);
  } catch (err) {
    console.error("Update Error:", err);
    return res.status(500).json({ error: err.message || "Update failed" });
  }
};
