import express from "express";
import {getStockConsumptions } from "../controllers/StockConsumptionController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: StockConsumption
 *   description: Operations related to stock consumption tracking
 */

/**
 * @swagger
 * /api/stock/get-stock-consumption:
 *   get:
 *     summary: Get stock consumption records
 *     tags: [StockConsumption]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of stock consumption records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 64f1b7c8a5e4b123456789ab
 *                   rawItem:
 *                     type: string
 *                     example: Tomato
 *                   quantity:
 *                     type: number
 *                     example: 15
 *                   unit:
 *                     type: string
 *                     example: Kg
 *                   consumedAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-09-03T12:30:00Z
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - role not allowed
 *       500:
 *         description: Server error
 */

router.get("/get-stock-consumption",
    authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),    getStockConsumptions
);

export default router;
