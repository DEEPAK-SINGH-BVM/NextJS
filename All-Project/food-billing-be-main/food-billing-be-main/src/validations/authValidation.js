import { z } from "zod";

export const registerUserSchema = z.object({
  name: z.string({ required_error: "Name is required" }),
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  password: z.string({ required_error: "Password is required" }),

  role: z.enum([
    "super-admin",
    "admin",
    "branch-admin",
  ], { required_error: "Role is required and must be valid" }),

  hotelBrand: z.union([z.string(), z.null()]).optional(),
  branch: z.union([z.string(), z.null()]).optional(),
  permissions: z.array(z.string()).optional(),
});

export const loginSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  password: z.string({ required_error: "Password is required" }),
});


export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),
});

// .string({ required_error: "user_id is required" })

export const resetPasswordSchema = z.object({
  user_id: z.string({ required_error: "user_id is required" }),
  otp: z
    .string({ required_error: "OTP is required" })
    .length(6, "OTP must be exactly 6 digits"), 
  new_password: z
    .string({ required_error: "New password is required" })
});