import { z } from "zod";

export const createOrderSchema = z
  .object({
    orderType: z.enum(["Dine-In", "Delivery", "Take-Home"], {
      required_error: "Order type is required",
    }),

    // Floor validation: Required only when order type is Dine-In
    floor: z
      .number({})
      .optional()
      .refine((val, ctx) => {
        // Correctly access the value of `orderType` from the data
        if (ctx?.data?.orderType === "Dine-In" && (val === undefined || isNaN(val))) {
          return false;
        }
        return true;
      }, "Floor is required and must be a valid number for Dine-In orders"),

    tables: z
      .any()
      .optional()
      .transform((val) => {
        if (Array.isArray(val)) return val.map((table) => Number(table)); // Ensure tables are numbers
        if (val === undefined || val === null) return [];
        return [Number(val)];
      }),

    totalPrice: z
      .number({
        required_error: "Total price is required",
      })
      .positive("Total price must be greater than zero"),

    paymentMethod: z.enum(["Cash", "Card", "UPI"]).optional(),

    status: z
      .enum(["Processing", "Served", "Paid & Completed", "Cancel", "Cancel & Refund"], {
        errorMap: () => ({ message: "Status is required" }),
      })
      .default("Processing"),

    customerName: z.string().optional(),
    number: z.string().optional(),
    deliveryAddress: z.string().optional(),

    foods: z
      .array(
        z.object({
          name: z
            .string({ required_error: "Food name is required" })
            .min(1, "Food name is required"),

          price: z
            .number({ required_error: "Price is required" })
            .positive("Price must be greater than 0"),

          quantity: z
            .number({ required_error: "Quantity is required" })
            .min(1, "Quantity must be at least 1"),

          instructions: z.string().optional(),
          image: z.string({ required_error: "Image is required" }),
        }),
        {
          required_error: "Foods is required",
        }
      )
      .min(1, "At least one food item is required"),
  })
  .superRefine((data, ctx) => {
    // Additional checks after the schema validation
    if (data.orderType === "Dine-In") {
      // Check if floor is valid when the order type is Dine-In
      if (data.floor === undefined || isNaN(data.floor)) {
        ctx.addIssue({
          path: ["floor"],
          code: z.ZodIssueCode.custom,
          message: "Floor is required and must be a valid number for Dine-In orders",
        });
      }

      if (!Array.isArray(data.tables) || data.tables.length === 0) {
        ctx.addIssue({
          path: ["tables"],
          code: z.ZodIssueCode.custom,
          message: "At least one table is required for Dine-In orders",
        });
      }
    }

    // When order type is Delivery, delivery address is required
    if (data.orderType === "Delivery" && !data.deliveryAddress) {
      ctx.addIssue({
        path: ["deliveryAddress"],
        code: z.ZodIssueCode.custom,
        message: "Delivery address is required for Delivery orders",
      });
    }

    // FIXED: Payment method is only required for "Paid & Completed" status
    // This applies to ALL order types when status is "Paid & Completed"
    if (data.status === "Paid & Completed" && !data.paymentMethod) {
      ctx.addIssue({
        path: ["paymentMethod"],
        code: z.ZodIssueCode.custom,
        message: "Payment method is required when status is 'Paid & Completed'",
      });
    }
  })
const foodItemSchema = z.object({
  foodId: z.string().optional(),
  name: z.string().min(1, "Food name is required"),
  price: z.number().positive("Food price must be greater than zero"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  instructions: z.string().optional(),
  image: z.string().optional(),
});


export const updateOrderSchema = z
  .object({
    status: z
      .enum(["Processing", "Served", "Paid & Completed", "Cancel", "Cancel & Refund"], {
        required_error: "Status is required",
      })
      .optional(),

    foods: z
      .array(
        z.object({
          foodId: z.string().optional(),
          name: z.string().min(1, "Food name is required"),
          price: z.number().positive("Food price must be greater than zero"),
          quantity: z.number().min(1, "Quantity must be at least 1"),
          instructions: z.string().optional(),
          image: z.string().optional(),
        })
      )
      .optional(),

    totalPrice: z
      .number()
      .positive("Total price must be a positive value")
      .optional(),

    // Make paymentMethod optional with proper validation
    paymentMethod: z.union([
      z.literal(""), // Allow empty string
      z.enum(["Cash", "Card", "UPI"])
    ]).optional(),

    customerName: z.string().optional(),
    number: z.string().optional(),
    orderType: z.enum(["Dine-In", "Take-Home", "Delivery"]).optional(), // Added orderType
    floor: z.number().optional(), // Added floor
  })

  // Validate that if foods are passed, at least one food item is present
  .refine((data) => {
    if (data.foods && data.foods.length < 1) {
      return false;
    }
    return true;
  }, {
    message: "Foods should have at least one item if provided.",
    path: ["foods"]
  })

  // If status is "Paid & Completed", paymentMethod is required and cannot be empty
  .refine((data) => {
    if (data.status === "Paid & Completed") {
      return data.paymentMethod && data.paymentMethod !== "";
    }
    return true;
  }, {
    message: "Payment method is required when status is 'Paid & Completed'.",
    path: ["paymentMethod"]
  })

  // Floor validation: if the order type is Dine-In, floor must be provided and a valid number
  .refine((data) => {
    if (data.orderType === "Dine-In" && data.foods && data.foods.length > 0) {
      return data.floor !== undefined && !isNaN(data.floor);
    }
    return true;
  }, {
    message: "Floor is required and must be a valid number for Dine-In orders.",
    path: ["floor"]
  });