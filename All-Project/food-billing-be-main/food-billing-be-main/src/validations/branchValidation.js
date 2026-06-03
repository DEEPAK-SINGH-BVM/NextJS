import { z } from 'zod';

// Helper for required fields
const required = (msg) => z.string({ required_error: msg }).min(1, msg);

// For branch creation (with admin info)
export const createBranchSchema = z.object({
  name: required("Branch name is required"),
  address: required("Address is required"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  branchAdminName: required("Admin name is required"),
  branchAdminEmail: required("Admin email is required")
    .email("Invalid admin email")
    .nonempty("Admin email is required"),
  branchAdminPassword: required("Admin Password is required")
    .min(6, "Password must be at least 6 characters"),
  hotelBrand: z.string().optional(), // Hotel brand is now optional for all roles
  // roleBranch: required("Role is required"),
}).strict();


// For branch update
export const updateBranchSchema = z.object({
  name: z.string().min(1, "Name must not be empty").optional(),
  address: z.string().min(1, "Address must not be empty").optional(),
  phone: z.string()
    .min(10, "Phone must be at least 10 digits")
    .optional(),
});


