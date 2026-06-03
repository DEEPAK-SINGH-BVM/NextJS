import express from 'express';
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { requireRole } from "../middlewares/roleMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Category
 *     description: Operations related to categories and subcategories
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f1a5e9b8f6a3c8f9274a2d
 *         category:
 *           type: string
 *           example: Electronics
 *         subcategories:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Mobile Phones", "Laptops"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-09-10T12:34:56.789Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-09-10T12:34:56.789Z
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     description: Creates a category with optional subcategories. Requires authentication and specific roles.
 *     tags:
 *       - Category
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
 *             properties:
 *               category:
 *                 type: string
 *                 example: Electronics
 *               subcategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Phones", "Laptops"]
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  createCategory
);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieves all categories. Requires authentication and specific roles.
 *     tags:
 *       - Category
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  getAllCategories
);

/**
 * @swagger
 * /api/categories/update/{id}:
 *   patch:
 *     summary: Update a category by ID
 *     description: Updates an existing category. Requires authentication and specific roles.
 *     tags:
 *       - Category
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the category to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 example: Updated Category Name
 *               subcategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Updated Sub1", "Updated Sub2"]
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  '/update/:id',
   authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  updateCategory
);

/**
 * @swagger
 * /api/categories/delete/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     description: Deletes a category. Requires authentication and specific roles.
 *     tags:
 *       - Category
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the category to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/delete/:id',
   authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  deleteCategory
);

export default router;
