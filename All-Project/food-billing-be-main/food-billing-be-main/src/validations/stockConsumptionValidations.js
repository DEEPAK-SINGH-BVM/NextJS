// // utils/stockConsumptionValidations.js
// import { z } from "zod";

// export const stockConsumptionValidations = z.object({
//   itemName: z.string().min(1, "Item name is required"),
//   consumed: z.number({
//     required_error: "Consumed is required",
//     invalid_type_error: "Consumed must be a number",
//   }).nonnegative("Consumed must be a number greater than or equal to 0"),
//   cost: z.number({
//     required_error: "Cost is required",
//     invalid_type_error: "Cost must be a number",
//   }).nonnegative("Cost must be a number greater than or equal to 0"),
//   currentStock: z.number({
//     required_error: "Current stock is required",
//     invalid_type_error: "Current stock must be a number",
//   }).nonnegative("Current stock must be a number greater than or equal to 0"),
//   status: z.enum(["In Stock", "Low Stock", "Out of Stock"], {
//     required_error: "Status is required",
//     invalid_type_error: "Status must be a valid option",
//   }),
// });

// export default stockConsumptionValidations;
