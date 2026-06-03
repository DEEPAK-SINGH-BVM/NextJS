import { z } from "zod";

// Helper for required strings
const required = (msg) => z.string({ required_error: msg }).min(1, msg);

export const createHotelBrandSchema = z.object({
  name: required("Hotel brand name is required"),
  address: required("Address is required"),
  phone: z.string({ required_error: "Phone number is required" })
          .min(10, "Phone number must be at least 10 characters"),

  adminName: required("Admin name is required"),

  adminEmail: z.string({ required_error: "Admin email is required" })
               .email("Invalid admin email"),

  adminPassword: z.string({ required_error: "Admin Password is required" })
                 .min(6, "Password must be at least 6 characters")
}).strict();


const optionalNonEmptyString = (fieldName) =>
  z.string()
    .trim()
    .min(1, `${fieldName} must not be empty`)
    .optional();

export const updateHotelBrandSchema = z.object({
  name: optionalNonEmptyString("Name"),
  address: optionalNonEmptyString("Address"),
  phone: z.string({ required_error: "Phone number is required" })
          .min(10, "Phone must be at least 10 digits")
          .optional(),
});