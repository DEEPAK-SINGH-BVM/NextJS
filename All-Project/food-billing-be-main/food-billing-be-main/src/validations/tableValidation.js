import { z } from "zod";

export const createTableSchema = z.object({
  number: z
    .union([z.number()], {
      errorMap: () => ({ message: "Table Number must be a number." })
    })
    .refine(val => val !== '' && val !== null, {
      message: "Table number is required.",
    }),
  capacity: z
    .number({ invalid_type_error: "Capacity must be a number.", required_error: "Capacity is required" })
    .min(1, "Capacity must be at least 1."),

  floor: z
    .union([z.string(), z.number()], {
      errorMap: () => ({ message: "Floor must be a string or number." })
    })
    .refine(val => val !== '', {
      message: "Floor is required.",
    }),

  waiterName: z.string({
    required_error: "Waiter name is required",
    invalid_type_error: "Waiter name must be a string."
  })
});
