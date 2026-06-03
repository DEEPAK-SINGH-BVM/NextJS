import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { getTaxSetting, saveTaxSetting, updateTaxSetting } from "../controllers/taxsettingsController.js";
import validate from "../middlewares/validateMiddleware.js";
import { saveTaxSettingSchema } from "../validations/taxsettingsvalidation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TaxSettings
 *   description: Manage tax settings for branches
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TaxSetting:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64e3f5a1c9d7a123456789ab"
 *         serviceCharge:
 *           type: number
 *           example: 10.5
 *         gstTax:
 *           type: number
 *           example: 18
 *         vat:
 *           type: number
 *           example: 5
 *         deliveryCharge:
 *           type: number
 *           example: 30
 *         packagingCharge:
 *           type: number
 *           example: 15
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TaxSettingInput:
 *       type: object
 *       required:
 *         - serviceCharge
 *         - gstTax
 *         - vat
 *         - deliveryCharge
 *         - packagingCharge
 *       properties:
 *         serviceCharge:
 *           type: number
 *           example: 10.5
 *         gstTax:
 *           type: number
 *           example: 18
 *         vat:
 *           type: number
 *           example: 5
 *         deliveryCharge:
 *           type: number
 *           example: 30
 *         packagingCharge:
 *           type: number
 *           example: 15
 */

/**
 * @swagger
 * /api/tax/tax-setting:
 *   post:
 *     summary: Create new tax setting
 *     tags: [TaxSettings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaxSettingInput'
 *     responses:
 *       201:
 *         description: Tax setting created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaxSetting'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/tax-setting",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  validate(saveTaxSettingSchema),
  saveTaxSetting
);

/**
 * @swagger
 * /api/tax/tax-setting:
 *   get:
 *     summary: Get all tax settings
 *     tags: [TaxSettings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of tax settings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaxSetting'
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/tax-setting",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  getTaxSetting
);

/**
 * @swagger
 * /api/tax/tax-setting/{id}:
 *   patch:
 *     summary: Update an existing tax setting
 *     tags: [TaxSettings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tax setting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaxSettingInput'
 *     responses:
 *       200:
 *         description: Tax setting updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaxSetting'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tax setting not found
 */
router.patch(
  "/tax-setting/:id",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  updateTaxSetting
);

export default router;
