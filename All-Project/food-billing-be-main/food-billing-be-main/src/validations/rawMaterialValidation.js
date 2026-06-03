import z from "zod";

// Base schema with common fields
const baseRawItemSchema = z.object({
  description: z.string().optional(),
  category: z.enum(["food", "expense"]),
  type: z.string().min(1, "Type is required"),
  amount: z.number().min(0, "Amount must be non-negative"),
});

// Food category specific validation
const foodSchema = baseRawItemSchema.extend({
  category: z.literal("food"),
  type: z.enum(["Fruits", "Vegetable", "Grocery", "Dairy", "Dry Fruits"]),
  purchaseUnit: z.enum(["Dish", "Piece", "Kg", "Ltr", "Milligram"], {
    required_error: "Purchase unit is required for food category"
  }),
});

// Expense category specific validation
const expenseSchema = baseRawItemSchema.extend({
  category: z.literal("expense"),
  type: z.enum(["Bill", "Rent", "Salary"]),
  purchaseUnit: z.union([z.undefined(), z.literal("")]).optional(), // Allow undefined or empty string
});

// Combined schema using discriminated union
export const rawItemSchema = z.discriminatedUnion("category", [
  foodSchema,
  expenseSchema
]);

export const updateRawItemSchema = z.union([foodSchema.partial(), expenseSchema.partial()]);