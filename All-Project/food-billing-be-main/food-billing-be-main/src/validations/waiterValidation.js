import { z } from "zod";

const waiterValidation = z.object({
  name: z.string({
    required_error: "Name is required.",
    invalid_type_error: "Name must be a string."
  }).min(1, "Name is required."),
  age: z.number({
    required_error: "Age is required",
    invalid_type_error: "Age must be a number",
  }),
  phone: z.number({ required_error: "Phone number is required" })
    .min(10, "Phone number must be at least 10 characters"),
  email: z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string"
  })
    .email("Invalid email address")
    .min(1, "Email is required"),
  shift: z.enum(["Morning", "Evening", "Night"], {
    required_error: "Shift is required",
  }),
  address: z.string({
    required_error: "Address is required",
    invalid_type_error: "Address must be a string"
  }).min(1, "Address is required")
});

export default waiterValidation;
