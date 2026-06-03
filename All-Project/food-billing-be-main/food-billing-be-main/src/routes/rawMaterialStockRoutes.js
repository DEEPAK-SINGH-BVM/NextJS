import express from "express";
import {
    bulkUploadRawItems,
  createRawItem,
  deleteRawItem,
  getAllItem,
  updateRawItem,
} from "../controllers/rawMaterialStockController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import { rawItemSchema, updateRawItemSchema } from "../validations/rawMaterialValidation.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: RawMaterial
 *   description: Operations related to Raw Material Stock
 */

/**
 * @swagger
 * /api/raw/rawItem:
 *   post:
 *     summary: Create a new raw material item
 *     tags: [RawMaterial]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - purchaseUnit
 *               - consumptionUnit
 *               - stockLevelUnit
 *               - minStockLevelUnit
 *               - closingStock
 *               - HSNCode
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               barCode:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [Fruits, Vegetable, Grocery, Dairy, Dry Fruits]
 *               purchaseUnit:
 *                 type: string
 *                 enum: [Dish, Piece, Kg, Ltr, Milligram]
 *               consumptionUnit:
 *                 type: string
 *                 enum: [Dish, Pieces, Kg, Ltr]
 *               purchasePrice:
 *                 type: number
 *                 minimum: 0
 *               salePrice:
 *                 type: number
 *               reconciliationPrice:
 *                 type: number
 *               normalLoss:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               taxType:
 *                 type: string
 *                 enum: [GST, VAT]
 *               stockLevel:
 *                 type: number
 *                 default: 1
 *               stockLevelUnit:
 *                 type: string
 *                 enum: [Dish, Pieces, Kg, Ltr]
 *               minStockLevel:
 *                 type: number
 *                 default: 3
 *               minStockLevelUnit:
 *                 type: string
 *                 enum: [Dish, Pieces, Kg, Ltr]
 *               closingStock:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *               HSNCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Raw material item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/RawMaterial'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict - Item already exists
 */

router.post(
  "/rawItem",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  validate(rawItemSchema),
  createRawItem
);

/**
 * @swagger
 * /api/raw/rawItem/{id}:
 *   patch:
 *     summary: Update an existing raw material item
 *     tags: [RawMaterial]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the raw material to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               barCode:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [Fruits, Vegetable, Grocery, Dairy, Dry Fruits]
 *               purchaseUnit:
 *                 type: string
 *                 enum: [Dish, Piece, Kg, Ltr, Milligram]
 *               consumptionUnit:
 *                 type: string
 *                 enum: [Dish, Pieces, Kg, Ltr]
 *               purchasePrice:
 *                 type: number
 *               salePrice:
 *                 type: number
 *               reconciliationPrice:
 *                 type: number
 *               normalLoss:
 *                 type: number
 *               taxType:
 *                 type: string
 *                 enum: [GST, VAT]
 *               stockLevel:
 *                 type: number
 *               stockLevelUnit:
 *                 type: string
 *                 enum: [Dish, Pieces, Kg, Ltr]
 *               minStockLevel:
 *                 type: number
 *               minStockLevelUnit:
 *                 type: string
 *                 enum: [Dish, Pieces, Kg, Ltr]
 *               closingStock:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     periodType:
 *                       type: string
 *                       enum: [daily, weekly, monthly]
 *                     closingStock:
 *                       type: number
 *               HSNCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Raw material item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/RawMaterial'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Raw item not found
 */

router.patch(
  "/rawItem/:id",
  authenticate,
  requireRole(["admin", "super-admin", "branch-admin"]),
  validate(updateRawItemSchema),
  updateRawItem
);

/**
 * @swagger
 * /api/raw/rawItem/{id}:
 *   delete:
 *     summary: Delete a raw material item by ID
 *     tags: [RawMaterial]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the raw material item to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Raw item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/RawMaterial'
 *       404:
 *         description: Raw item not found
 *       401:
 *         description: Unauthorized
 */

router.delete(
  "/rawItem/:id",
  authenticate,
  requireRole(["admin", "super-admin", "branch-admin"]),
  deleteRawItem
);

/**
 * @swagger
 * /api/raw/allRawItems:
 *   get:
 *     summary: Get all raw material items
 *     tags: [RawMaterial]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all raw items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RawMaterial'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - role not allowed
 *       500:
 *         description: Server error
 */

router.get(
  "/allRawItems",
  authenticate,
  requireRole(["admin", "super-admin", "branch-admin"]),
  getAllItem
);

router.post("/upload-bulk", authenticate,upload.single("file"), bulkUploadRawItems);
export default router;
