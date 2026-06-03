import express from "express";
import {
  createTable,
  getTables,
  updateTable,
  deleteTable,
  mergeTables,
  splitTable,
  reserveTable,
  cancelReservation,
  getAllFloors,
} from "../controllers/tableController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import { createTableSchema } from "../validations/tableValidation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Table
 *   description: Operations related to Tables
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Table:
 *       type: object
 *       required:
 *         - number
 *         - capacity
 *         - floor
 *       properties:
 *         number:
 *           type: integer
 *           example: 12
 *         capacity:
 *           type: integer
 *           example: 4
 *         floor:
 *           type: string
 *           example: "1st Floor"
 *         waiterName:
 *           type: string
 *           example: "John Doe"
 */

/**
 * @swagger
 * /api/tables:
 *   get:
 *     summary: Get all tables
 *     tags: [Table]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of tables
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Table'
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  getTables
);

/**
 * @swagger
 * /api/tables:
 *   post:
 *     summary: Create a new table
 *     tags: [Table]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Table'
 *     responses:
 *       201:
 *         description: Table created successfully
 *       400:
 *         description: Bad request
 */
router.post(
  "/",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  validate(createTableSchema),
  createTable
);

/**
 * @swagger
 * /api/tables/{id}:
 *   put:
 *     summary: Update a table by ID
 *     tags: [Table]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Table ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Table'
 *     responses:
 *       200:
 *         description: Table updated successfully
 */
router.patch(
  "/:id",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  updateTable
);

/**
 * @swagger
 * /api/tables/{id}:
 *   delete:
 *     summary: Delete a table by ID
 *     tags: [Table]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Table deleted successfully
 */
router.delete(
  "/:id",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  deleteTable
);

/**
 * @swagger
 * /api/tables/floors:
 *   get:
 *     summary: Get all distinct floors
 *     tags: [Table]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of floors
 */
router.get(
  "/floors",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  getAllFloors
);

/**
 * @swagger
 * /api/tables/merge:
 *   post:
 *     summary: Merge multiple tables into a main table
 *     tags: [Table]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mainTableId
 *               - mergeTableIds
 *             properties:
 *               mainTableId:
 *                 type: string
 *                 description: The ID of the main table to merge into
 *                 example: "684ff7652de0481429c6c184"
 *               mergeTableIds:
 *                 type: array
 *                 description: Table IDs to merge
 *                 items:
 *                   type: string
 *                 example: [ "64e8d45a8f34a2b17c1e23a2" ]
 *     responses:
 *       200:
 *         description: Tables merged successfully
 *       400:
 *         description: Bad request - missing or invalid data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/merge",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  mergeTables
);

/**
 * @swagger
 * /api/tables/split/{id}:
 *   post:
 *     summary: Split a merged table
 *     tags: [Table]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Table split successfully
 */
router.post(
  "/split/:id",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  splitTable
);

/**
 * @swagger
 * /api/tables/reserve:
 *   post:
 *     summary: Reserve a table
 *     tags: [Table]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - floor
 *               - customerName
 *               - customerPhone
 *               - reservationDate
 *               - reservationTime
 *               - durationValue
 *               - durationUnit
 *             properties:
 *               number:
 *                 type: integer
 *                 example: 1
 *               floor:
 *                 type: string
 *                 example: "Ground"
 *               customerName:
 *                 type: string
 *                 example: "John Doe"
 *               customerPhone:
 *                 type: string
 *                 example: "+919876543210"
 *               reservationDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-09-01"
 *               reservationTime:
 *                 type: string
 *                 example: "17:16"
 *               durationValue:
 *                 type: integer
 *                 example: 90
 *               durationUnit:
 *                 type: string
 *                 enum: [minutes, hours, days]
 *                 example: minutes
 *               specialRequests:
 *                 type: string
 *                 example: "Window seat"
 *               timeZone:
 *                 type: string
 *                 example: "Asia/Kolkata"
 *     responses:
 *       200:
 *         description: Table reserved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/reserve",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  reserveTable
);

/**
 * @swagger
 * /api/tables/cancle/{id}:
 *   post:
 *     summary: Cancel a table reservation
 *     tags: [Table]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservation canceled successfully
 */
router.post(
  "/cancle/:id",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  cancelReservation
);

export default router;
