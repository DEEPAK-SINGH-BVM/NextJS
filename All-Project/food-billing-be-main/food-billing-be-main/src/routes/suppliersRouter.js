import express from "express";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { createSupplier, deleteSupplier, getAllSuppliers, updateSupplier } from "../controllers/suppliersController.js";
import validate from "../middlewares/validateMiddleware.js";
import { supplierValidation } from "../validations/suppliersValidation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: Operations related to managing suppliers
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Supplier:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f1b7c8a5e4b123456789ab
 *         name:
 *           type: string
 *           example: Fresh Farms Pvt Ltd
 *         contactPerson:
 *           type: string
 *           example: Rajesh Sharma
 *         phone:
 *           type: number
 *           example: 9876543210
 *         email:
 *           type: string
 *           format: email
 *           example: supplier@example.com
 *         address:
 *           type: string
 *           example: 123 Market Street, Mumbai
 *         createdBy:
 *           type: string
 *           example: 64f0abc9b7cde123456789ff
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SupplierInput:
 *       type: object
 *       required:
 *         - name
 *         - contactPerson
 *         - phone
 *         - email
 *         - address
 *       properties:
 *         name:
 *           type: string
 *           example: Fresh Farms Pvt Ltd
 *         contactPerson:
 *           type: string
 *           example: Rajesh Sharma
 *         phone:
 *           type: number
 *           example: 9876543210
 *         email:
 *           type: string
 *           format: email
 *           example: supplier@example.com
 *         address:
 *           type: string
 *           example: 123 Market Street, Mumbai
 */

/**
 * @swagger
 * /api/supplier/createsuppliers:
 *   post:
 *     summary: Create a new supplier
 *     tags: [Suppliers]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupplierInput'
 *     responses:
 *       201:
 *         description: Supplier created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/createsuppliers",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  validate(supplierValidation),
  createSupplier
);

/**
 * @swagger
 * /api/supplier/getsuppliers:
 *   get:
 *     summary: Get all suppliers
 *     tags: [Suppliers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of suppliers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Supplier'
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/getsuppliers",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  getAllSuppliers
);

/**
 * @swagger
 * /api/supplier/editsuppliers/{id}:
 *   patch:
 *     summary: Update supplier details by ID
 *     tags: [Suppliers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Supplier ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupplierInput'
 *     responses:
 *       200:
 *         description: Supplier updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Supplier not found
 */
router.patch(
  "/editsuppliers/:id",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  updateSupplier
);

/**
 * @swagger
 * /api/supplier/deletesuppliers/{id}:
 *   delete:
 *     summary: Delete a supplier by ID
 *     tags: [Suppliers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Supplier not found
 */
router.delete(
  "/deletesuppliers/:id",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  deleteSupplier
);

export default router;
