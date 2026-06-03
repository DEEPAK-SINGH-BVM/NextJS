import { z } from "zod";

export const savePrinterSettingSchema = z.object({
  kitchenPrinter: z.string({
    required_error: "Kitchen printer is required.",
    invalid_type_error: "Kitchen printer must be a string."
  }).min(1, "Kitchen printer is required."),

  receiptPrinter: z.string({
    required_error: "Receipt printer is required.",
    invalid_type_error: "Receipt printer must be a string."
  }).min(1, "Receipt printer is required."),

  paperSize: z.string({
    required_error: "Paper size is required.",
    invalid_type_error: "Paper size must be a string."
  }).min(1, "Paper size is required."),

  printKitchenAutomatically: z.boolean({
    required_error: "Print kitchen automatically is required.",
    invalid_type_error: "Print kitchen automatically must be a boolean."
  }),

  printCustomerReceipts: z.boolean({
    required_error: "Print customer receipts is required.",
    invalid_type_error: "Print customer receipts must be a boolean."
  }),

  autoPrintOnConfirmation: z.boolean({
    required_error: "Auto print on confirmation is required.",
    invalid_type_error: "Auto print on confirmation must be a boolean."
  })
});
