import express from "express";
import { getPrinterSetting, savePrinterSetting, updatePrinterSetting } from "../controllers/PrintersettingController.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import { savePrinterSettingSchema } from "../validations/Printersettingvalidation.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PrinterSettings:
 *       type: object
 *       required:
 *         - kitchenPrinter
 *         - receiptPrinter
 *         - paperSize
 *       properties:
 *         kitchenPrinter:
 *           type: string
 *           enum:
 *             - "Kitchen Printer (192.168.1.100)"
 *             - "Epson TM-T88V (192.168.1.102)"
 *             - "Star TSP143 (192.168.1.103)"
 *           example: "Epson TM-T88V (192.168.1.102)"
 *         receiptPrinter:
 *           type: string
 *           enum:
 *             - "Receipt Printer (192.168.1.101)"
 *             - "Epson TM-T20II (192.168.1.104)"
 *             - "Star TSP100 (192.168.1.105)"
 *           example: "Receipt Printer (192.168.1.101)"
 *         paperSize:
 *           type: string
 *           enum: ["A4", "58mm", "80mm"]
 *           example: "80mm"
 *         printKitchenAutomatically:
 *           type: boolean
 *           default: false
 *           example: true
 *         printCustomerReceipts:
 *           type: boolean
 *           default: false
 *           example: false
 *         autoPrintOnConfirmation:
 *           type: boolean
 *           default: false
 *           example: true
 */

/**
 * @swagger
 * tags:
 *   name: PrinterSettings
 *   description: APIs for managing printer settings
 */

/**
 * @swagger
 * /api/printer/printer-settings:
 *   post:
 *     summary: Create a new printer setting
 *     tags: [PrinterSettings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrinterSettings'
 *     responses:
 *       201:
 *         description: Printer setting created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrinterSettings'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all printer settings
 *     tags: [PrinterSettings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of printer settings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PrinterSettings'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.post(
  "/printer-settings",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  validate(savePrinterSettingSchema),
  savePrinterSetting
);

router.get(
  "/printer-settings",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  getPrinterSetting
);


/**
 * @swagger
 * /api/printer/printer-settings/{id}:
 *   patch:
 *     summary: Update an existing printer setting
 *     tags: [PrinterSettings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Printer setting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrinterSettings'
 *     responses:
 *       200:
 *         description: Printer setting updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrinterSettings'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Printer setting not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/printer-settings/:id",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  updatePrinterSetting
);

export default router;
