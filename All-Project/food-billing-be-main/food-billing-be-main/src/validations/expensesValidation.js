import { z } from "zod";

export const createExpenseSchema = z.object({
  category: z.string({
    required_error: "Category is required.",
    invalid_type_error: "Category must be a string.",
  }).min(1, "Category is required."),

  amount: z.number({
    required_error: "Amount is required.",
    invalid_type_error: "Amount must be a number.",
  })
});
