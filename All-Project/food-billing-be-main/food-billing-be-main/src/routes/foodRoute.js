import express from "express";
import {
  createBulkFood,
  createFood,
  deleteFood,
  getAllFood,
  getFoodByHoteId,
  updateFood,
  uploadExcelFood,
} from "../controllers/foodController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/upload.js";
import validate from "../middlewares/validateMiddleware.js";
import { createFoodSchema } from "../validations/foodValidation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Food
 *   description: Manage food items in the restaurant
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Food:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64fa6cdea34e0b00125a1b22
 *         name:
 *           type: string
 *           example: Chicken Biryani
 *         price:
 *           type: number
 *           example: 199.99
 *         type:
 *           type: string
 *           example: Non-Veg
 *         description:
 *           type: string
 *           example: A spicy rice dish with chicken
 *         instructions:
 *           type: string
 *           example: Extra spicy
 *         image:
 *           type: string
 *           example: /uploads/chicken_biryani.jpg
 *         category:
 *           type: string
 *           example: Main Course
 *         subcategory:
 *           type: string
 *           example: Rice
 *         quantity:
 *           type: number
 *           example: 100
 *         isAvailable:
 *           type: boolean
 *           example: true
 *         branchId:
 *           type: string
 *           example: 64fa6bd9a34e0b00125a1a44
 *         hotelBrand:
 *           type: string
 *           example: 64f99999a34e0b00125a1999
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     FoodInput:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - type
 *         - description
 *         - category
 *         - quantity
 *         - branchId
 *         - hotelBrand
 *       properties:
 *         name:
 *           type: string
 *           example: Chicken Biryani
 *         price:
 *           type: number
 *           example: 199.99
 *         type:
 *           type: string
 *           example: Non-Veg
 *         description:
 *           type: string
 *           example: A spicy rice dish with chicken
 *         instructions:
 *           type: string
 *           example: Extra spicy
 *         category:
 *           type: string
 *           example: Main Course
 *         subcategory:
 *           type: string
 *           example: Rice
 *         quantity:
 *           type: number
 *           example: 100
 *         branchId:
 *           type: string
 *           example: 64fa6bd9a34e0b00125a1a44
 *         hotelBrand:
 *           type: string
 *           example: 64f99999a34e0b00125a1999
 */

/**
 * @swagger
 * /api/foods/createfood:
 *   post:
 *     summary: Create a new food item
 *     tags: [Food]
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
 *               - price
 *               - type
 *               - description
 *               - category
 *               - quantity
 *               - branchId
 *               - hotelBrand
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               instructions:
 *                 type: string
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               quantity:
 *                 type: number
 *               branchId:
 *                 type: string
 *               hotelBrand:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Food created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Food'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/createfood",
  authenticate,
 requireRole(['super-admin', 'admin', 'branch-admin']),
  upload.single("image"), 
  createFood             
);


/**
 * @swagger
 * /api/foods/getallfoods:
 *   get:
 *     summary: Get all food items
 *     tags: [Food]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of food items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Food'
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/getallfoods",
  authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  getAllFood
);

/**
 * @swagger
 * /api/foods/deletefood/{id}:
 *   delete:
 *     summary: Delete a food item by ID
 *     tags: [Food]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Food item ID
 *     responses:
 *       200:
 *         description: Food item deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Food not found
 */
router.delete(
  "/deletefood/:id",
  authenticate,
 requireRole(['super-admin', 'admin', 'branch-admin']),
  deleteFood
);

/**
 * @swagger
 * /api/foods/editfood/{id}:
 *   patch:
 *     summary: Update a food item
 *     tags: [Food]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Food ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               instructions:
 *                 type: string
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               quantity:
 *                 type: number
 *               branchId:
 *                 type: string
 *               hotelBrand:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Food item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Food'
 *       404:
 *         description: Food item not found
 *       400:
 *         description: Invalid input
 */
router.patch(
  "/editfood/:id",
  authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  upload.single("image"),
  updateFood
);

/**
 * @swagger
 * /api/foods/bulkfood:
 *   post:
 *     summary: Create bulk food items
 *     tags: [Food]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - foods
 *             properties:
 *               foods:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - price
 *                     - type
 *                     - description
 *                     - branchId
 *                     - category
 *                     - subcategory
 *                     - isAvailable
 *                     - quantity
 *                     - hotelBrand
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Palak Paneer
 *                     price:
 *                       type: number
 *                       example: 320
 *                     type:
 *                       type: string
 *                       example: Main Course
 *                     description:
 *                       type: string
 *                       example: Creamy Alfredo pasta loaded with seasonal vegetables
 *                     branchId:
 *                       type: string
 *                       example: 68d67c65c5654843e013126d
 *                     category:
 *                       type: string
 *                       example: Main Course
 *                     subcategory:
 *                       type: string
 *                       example: Chinese
 *                     isAvailable:
 *                       type: boolean
 *                       example: true
 *                     quantity:
 *                       type: integer
 *                       example: 10
 *                     hotelBrand:
 *                       type: string
 *                       example: 68d67c1ac5654843e013125d
 *     responses:
 *       201:
 *         description: Bulk food items created successfully
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient role permissions
 *       500:
 *         description: Server error
 */
router.post(
  "/bulkfood",
  authenticate,
 requireRole(['super-admin', 'admin', 'branch-admin']),
  upload.single("image"), 
  createBulkFood             
);

/**
 * @swagger
 * /api/foods/upload-excel:
 *   post:
 *     summary: Upload Excel file to create bulk food items
 *     tags: [Food]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel (.xlsx) file containing food data
 *     responses:
 *       200:
 *         description: Excel file processed successfully
 *       400:
 *         description: Bad request or invalid file
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient role permissions
 *       500:
 *         description: Server error
 */
router.post(
  "/upload-excel",
    authenticate,
 requireRole(['super-admin', 'admin', 'branch-admin']),
   upload.single("file"), 
   uploadExcelFood
  );

export default router;
