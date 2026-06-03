import mongoose from "mongoose";
import { z } from "zod";


export const createFoodSchema = z.object({
  name: z.string({
    required_error: "Name is required.",
  }).transform(str => str.trim()),

  price: z.coerce.number({
    required_error: "Price is required.",
  }).positive("Price must be a positive number."),

  type: z.string().optional().transform(str => str?.trim() ?? ""),
  description: z.string().optional().transform(str => str?.trim() ?? ""),

  category: z.string({
    required_error: "Category is required.",
  }).transform(str => str.trim()),

  subcategory: z.string()
    .optional()
    .transform(str => str?.trim() ?? "")
    .refine(val => val === "" || val.length > 0, {
      message: "Subcategory cannot be empty.",
    }),

  branchId: z.string({
    required_error: "Branch ID is required.",
  }).refine(val => mongoose.Types.ObjectId.isValid(val), {
    message: "Branch ID must be a valid ObjectId.",
  }),

  hotelBrand: z.string({
    required_error: "Hotel Brand is required.",
  }).refine(val => mongoose.Types.ObjectId.isValid(val), {
    message: "Hotel Brand must be a valid ObjectId.",
  }),

  image: z.any().optional(),
});
