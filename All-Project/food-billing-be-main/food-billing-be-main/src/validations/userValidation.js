// validators/user.schema.js
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string({ required_error: "Name is required" }),
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  password: z.string({ required_error: "Password is required" }),
  profileImage: z.string().url("Invalid image URL").optional(),

  role: z.enum([
    "super-admin",
    "admin",
    "branch-admin",
  ], { required_error: "Role is required and must be a valid value" }),

  hotelBrand: z.union([z.string(), z.null()], {
    required_error: "hotelBrand is required",
  }),

  branch: z.union([z.string(), z.null()], {
    required_error: "branch is required",
  }),

  permissions: z.array(z.string()).optional(),
});

  export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  password: z.string().optional(),

  role: z.enum([
    "super-admin",
    "admin",
    "branch-admin",
  ]).optional(),

  hotelBrand: z.union([z.string(), z.null()]).optional(),
  branch: z.union([z.string(), z.null()]).optional(),

  permissions: z.array(z.string()).optional(),
});