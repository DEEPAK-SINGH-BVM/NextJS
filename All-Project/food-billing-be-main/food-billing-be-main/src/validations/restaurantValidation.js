import { z } from "zod";

export const saveRestaurantInfoSchema = z.object({
  name: z.string({
    required_error: "Restaurant name is required.",
    invalid_type_error: "Restaurant name must be a string."
  }).min(1, "Restaurant name is required."),

  phone: z.string({
    required_error: "Phone number is required.",
    invalid_type_error: "Phone number must be a number."
  }).min(10, "Phone must be at least 10 digits"),

  address: z.string({
    required_error: "Address is required.",
    invalid_type_error: "Address must be a string."
  }).min(1, "Address is required."),

  email: z.string({
    required_error: "Email is required.",
    invalid_type_error: "Email must be a string."
  }).email("Invalid email address"),

  gstNumber: z.string({
    required_error: "GST number is required.",
    invalid_type_error: "GST number must be a string."
  }).min(1, "GST number is required."),

  licenseNumber: z.string({
    required_error: "License number is required.",
    invalid_type_error: "License number must be a string."
  }).min(1, "License number is required.")
});
