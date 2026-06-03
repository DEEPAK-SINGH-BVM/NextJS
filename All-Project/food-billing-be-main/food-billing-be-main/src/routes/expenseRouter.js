import express from "express";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  createExpense,
  deleteExpense,
  getAllExpenses,
  updateExpense,
} from "../controllers/expenseController.js";
import validate from "../middlewares/validateMiddleware.js";
import { createExpenseSchema } from "../validations/expensesValidation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: APIs for managing expenses
 */

/**
 * @swagger
 * /api/expenses/createexpenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - amount
 *             properties:
 *               category:
 *                 type: string
 *                 example: Electricity Bill
 *               amount:
 *                 type: number
 *                 example: 2500
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       200:
 *         description: Expense amount updated for the current month
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/createexpenses",
  authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  validate(createExpenseSchema),
  createExpense
);

/**
 * @swagger
 * /api/expenses/getexpenses:
 *   get:
 *     summary: Get all expenses
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 64a1f2c5d93e
 *                   category:
 *                     type: string
 *                     example: Electricity Bill
 *                   amount:
 *                     type: number
 *                     example: 2500
 *                   month:
 *                     type: number
 *                     example: 9
 *                   year:
 *                     type: number
 *                     example: 2025
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/getexpenses",
  authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  getAllExpenses
);

/**
 * @swagger
 * /api/expenses/editexpenses/{id}:
 *   patch:
 *     summary: Update an expense
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 example: Internet Bill
 *               amount:
 *                 type: number
 *                 example: 3000
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Expense not found
 */
router.patch(
  "/editexpenses/:id",
  authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  updateExpense
);

/**
 * @swagger
 * /api/expenses/deleteexpenses/{id}:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Expense not found
 */
router.delete(
  "/deleteexpenses/:id",
  authenticate,
 requireRole(['super-admin', 'admin', 'branch-admin']),
  deleteExpense
);

export default router;
