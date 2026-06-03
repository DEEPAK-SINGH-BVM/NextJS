import { z } from "zod";

export const saveTaxSettingSchema = z.object({
  serviceCharge: z.number({
    required_error: "Service charge is required.",
    invalid_type_error: "Service charge must be a number."
  }),

  gstTax: z.number({
    required_error: "GST tax is required.",
    invalid_type_error: "GST tax must be a number."
  }),

  vat: z.number({
    required_error: "VAT is required.",
    invalid_type_error: "VAT must be a number."
  }),

  deliveryCharge: z.number({
    required_error: "Delivery charge is required.",
    invalid_type_error: "Delivery charge must be a number."
  }),

  packagingCharge: z.number({
    required_error: "Packaging charge is required.",
    invalid_type_error: "Packaging charge must be a number."
  })
});
