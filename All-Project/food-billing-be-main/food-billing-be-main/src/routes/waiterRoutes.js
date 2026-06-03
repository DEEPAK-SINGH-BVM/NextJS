import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import waiterValidation from "../validations/waiterValidation.js";
import {
  getAllWaiters,
  updateWaiter,
  deleteWaiter,
  createWaiter,
} from "../controllers/waiterController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Waiters
 *   description: Manage restaurant waiters
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Waiter:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64e3f5a1c9d7a123456789ab"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         age:
 *           type: number
 *           example: 28
 *         phone:
 *           type: number
 *           example: 9876543210
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         shift:
 *           type: string
 *           enum: [Morning, Evening, Night]
 *           example: Morning
 *         address:
 *           type: string
 *           example: 123 Main St, City
 *         createdBy:
 *           type: string
 *           example: 64e3f5a1c9d7a12345678900
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     WaiterInput:
 *       type: object
 *       required:
 *         - name
 *         - age
 *         - phone
 *         - email
 *         - shift
 *         - address
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         age:
 *           type: number
 *           example: 28
 *         phone:
 *           type: number
 *           example: 9876543210
 *         email:
 *           type: string
 *           example: john.doe@example.com
 *         shift:
 *           type: string
 *           enum: [Morning, Evening, Night]
 *           example: Morning
 *         address:
 *           type: string
 *           example: 123 Main St, City
 */

/**
 * @swagger
 * /api/waiters/createwaiter:
 *   post:
 *     summary: Create a new waiter
 *     tags: [Waiters]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WaiterInput'
 *     responses:
 *       201:
 *         description: Waiter created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Waiter'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/createwaiter",
  authenticate,
 requireRole(['super-admin', 'admin', 'branch-admin']),
  validate(waiterValidation),
  createWaiter
);

/**
 * @swagger
 * /api/waiters/getwaiters:
 *   get:
 *     summary: Get all waiters
 *     tags: [Waiters]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of waiters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Waiter'
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/getwaiters",
  authenticate,
 requireRole(['super-admin', 'admin', 'branch-admin']),
  getAllWaiters
);

/**
 * @swagger
 * /api/waiters/editwaiter/{id}:
 *   patch:
 *     summary: Update an existing waiter
 *     tags: [Waiters]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Waiter ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WaiterInput'
 *     responses:
 *       200:
 *         description: Waiter updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Waiter'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Waiter not found
 */
router.patch(
  "/editwaiter/:id",
  authenticate,
 requireRole(['super-admin', 'admin', 'branch-admin']),
  updateWaiter
);

/**
 * @swagger
 * /api/waiters/deletewaiter/{id}:
 *   delete:
 *     summary: Delete a waiter
 *     tags: [Waiters]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Waiter ID
 *     responses:
 *       200:
 *         description: Waiter deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Waiter deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Waiter not found
 */
router.delete(
  "/deletewaiter/:id",
  authenticate,
 requireRole(['super-admin', 'admin', 'branch-admin']),
  deleteWaiter
);

export default router;
