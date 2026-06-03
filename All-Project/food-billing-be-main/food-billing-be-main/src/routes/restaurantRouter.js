import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { getRestaurantInfo, saveRestaurantInfo, updateRestaurantInfo } from "../controllers/restaurantinfoController.js";
import upload from "../middlewares/upload.js";
import validate from "../middlewares/validateMiddleware.js";
import { saveRestaurantInfoSchema } from "../validations/restaurantValidation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Restaurant Info
 *   description: APIs for managing restaurant information
 */

/**
 * @swagger
 * /api/info/restaurant-info:
 *   post:
 *     summary: Save restaurant information
 *     description: Create and save new restaurant details (only for authorized roles).
 *     tags: [Restaurant Info]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - address
 *               - email
 *               - gstNumber
 *               - licenseNumber
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Restaurant
 *               phone:
 *                 type: string
 *                 example: +91 9876543210
 *               address:
 *                 type: string
 *                 example: 123 Main Street, City
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               gstNumber:
 *                 type: string
 *                 example: 22AAAAA0000A1Z5
 *               licenseNumber:
 *                 type: string
 *                 example: LIC123456789
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Restaurant logo image file
 *     responses:
 *       201:
 *         description: Restaurant info saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f87e9c1234abc567def890
 *                     name:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     address:
 *                       type: string
 *                     email:
 *                       type: string
 *                     gstNumber:
 *                       type: string
 *                     licenseNumber:
 *                       type: string
 *                     logo:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (role not allowed)
 */
router.post(
  "/restaurant-info",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  upload.single("logo"),
  validate(saveRestaurantInfoSchema),
  saveRestaurantInfo
);

/**
 * @swagger
 * /api/info/restaurant-info:
 *   get:
 *     summary: Get restaurant information
 *     description: Fetch restaurant details for the logged-in user.
 *     tags: [Restaurant Info]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Restaurant info fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 64a1f2c5d93e123456789abc
 *                 name:
 *                   type: string
 *                   example: My Restaurant
 *                 phone:
 *                   type: string
 *                   example: +91 9876543210
 *                 address:
 *                   type: string
 *                   example: 123 Main Street, City
 *                 email:
 *                   type: string
 *                   example: test@example.com
 *                 gstNumber:
 *                   type: string
 *                   example: 22AAAAA0000A1Z5
 *                 licenseNumber:
 *                   type: string
 *                   example: LIC123456789
 *                 logo:
 *                   type: string
 *                   example: uploads/logo.png
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/restaurant-info",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  getRestaurantInfo
);

/**
 * @swagger
 * /api/info/updateinfo/{id}:
 *   patch:
 *     summary: Update restaurant information
 *     description: Update existing restaurant details by ID.
 *     tags: [Restaurant Info]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               gstNumber:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Restaurant info updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Restaurant not found
 */
router.patch(
  "/updateinfo/:id",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  upload.single("logo"),
  updateRestaurantInfo
);

export default router;
