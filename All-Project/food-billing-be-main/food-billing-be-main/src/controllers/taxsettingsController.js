import TaxSetting from "../models/taxsettingsModal.js";
import { saveTaxSettingSchema } from "../validations/taxsettingsvalidation.js";
import mongoose from "mongoose";

export const saveTaxSetting = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Zod validation
    const parseResult = saveTaxSettingSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => e.message);
      return res.status(400).json({ error: errors.join(", ") });
    }

    const {
      serviceCharge,
      gstTax,
      vat,
      deliveryCharge,
      packagingCharge
    } = parseResult.data;

    let taxSetting = await TaxSetting.findOne();

    if (taxSetting) {
      taxSetting.serviceCharge = serviceCharge;
      taxSetting.gstTax = gstTax;
      taxSetting.vat = vat;
      taxSetting.deliveryCharge = deliveryCharge;
      taxSetting.packagingCharge = packagingCharge;
      await taxSetting.save();
    } else {
      taxSetting = new TaxSetting({
        serviceCharge,
        gstTax,
        vat,
        deliveryCharge,
        packagingCharge
      });
      await taxSetting.save();
    }

    res.status(200).json({
      message: "Tax settings saved successfully",
      data: taxSetting
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
};

export const getTaxSetting = async (req, res) => {
  try {
    // Authorization check (optional if handled by middleware)
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const taxSetting = await TaxSetting.findOne();

    if (!taxSetting) {
      return res.status(404).json({ error: "Tax settings not found" });
    }

    return res.status(200).json(taxSetting);
  } catch (error) {
    console.error("Get Tax Setting Error:", error);
    return res.status(500).json({
      error: error?.message || "Internal server error",
    });
  }
};

export const updateTaxSetting = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tax setting ID" });
    }

    const taxSetting = await TaxSetting.findById(id);
    if (!taxSetting) {
      return res.status(404).json({ message: "Tax settings not found" });
    }

    // Update only defined fields from req.body
    Object.entries(req.body).forEach(([key, value]) => {
      if (value !== undefined && key in taxSetting) {
        taxSetting[key] = value;
      }
    });

    await taxSetting.save();

    return res.status(200).json({ message: "Tax settings updated", data: taxSetting });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Update failed" });
  }
};
