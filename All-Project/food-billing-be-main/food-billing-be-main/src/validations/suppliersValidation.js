import { z } from "zod";

// Validation schema for creating a supplier
export const supplierValidation = z.object({
  name: z
    .string({ required_error: "Name is required", invalid_type_error: "Name must be a string" })
    .min(1, "Name must be at least 1 character long"),

  contactPerson: z
    .string({ required_error: "Contact person is required", invalid_type_error: "Contact person must be a string" })
    .min(1, "Contact person must be at least 1 character long"),

phone: z
  .number({ required_error: "Phone number is required", invalid_type_error: "Phone number must be a number" })
  .int("Phone number must be an integer") // Ensures it's an integer
  .gte(1000000000, "Phone number must be at least 10 digits long")  // Ensures the number has at least 10 digits
  .lte(999999999999999, "Phone number cannot exceed 15 digits"), // Ensures the number has at most 15 digits
    
  email: z
    .string({ required_error: "Email is required", invalid_type_error: "Email must be a string" })
    .email("Invalid email format"),

  address: z
    .string({ required_error: "Address is required", invalid_type_error: "Address must be a string" })
    .min(1, "Address must be at least 1 character long"),
});
