import express from 'express';
import {
  createHotelBrand,
  getAllHotelBrands,
  getHotelBrand,
  updateHotelBrand,
  deleteHotelBrand
} from '../controllers/hotelBrandController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';
import {
  createHotelBrandSchema,
  updateHotelBrandSchema
} from '../validations/hotelBrandValidation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Hotel Brand
 *   description: Operations related to Hotel Brands
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     HotelBrand:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64a1f2c5d93e120001234567
 *         name:
 *           type: string
 *           example: Grand Royal Hotel
 *         address:
 *           type: string
 *           example: 123 Main Street, City
 *         phone:
 *           type: string
 *           example: +1234567890
 *         adminUser:
 *           type: string
 *           description: User ID of the admin for this hotel brand
 *           example: 64b1a2d3f4a5c60001234567
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     HotelBrandInput:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - phone
 *         - adminName
 *         - adminEmail
 *         - adminPassword
 *       properties:
 *         name:
 *           type: string
 *           example: Grand Royal Hotel
 *         address:
 *           type: string
 *           example: 123 Main Street, City
 *         phone:
 *           type: string
 *           example: +1234567890
 *         adminName:
 *           type: string
 *           example: John Doe
 *         adminEmail:
 *           type: string
 *           format: email
 *           example: admin@example.com
 *         adminPassword:
 *           type: string
 *           format: password
 *           example: P@ssw0rd123
 */

/**
 * @swagger
 * /api/hotelBrands:
 *   get:
 *     summary: Get all hotel brands
 *     tags: [Hotel Brand]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of hotel brands
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HotelBrand'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, requireRole(['super-admin', 'admin', 'branch-admin']), getAllHotelBrands);

/**
 * @swagger
 * /api/hotelBrands/my:
 *   get:
 *     summary: Get the hotel brand associated with the authenticated user
 *     tags: [Hotel Brand]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The hotel brand associated with the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HotelBrand'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel brand not found
 */
router.get('/my', authenticate, requireRole(['super-admin', 'admin', 'branch-admin']), getHotelBrand);

/**
 * @swagger
 * /api/hotelBrands:
 *   post:
 *     summary: Create a new hotel brand
 *     tags: [Hotel Brand]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HotelBrandInput'
 *     responses:
 *       201:
 *         description: Hotel brand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HotelBrand'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, requireRole(['super-admin', 'admin', 'branch-admin']), validate(createHotelBrandSchema), createHotelBrand);

/**
 * @swagger
 * /api/hotelBrands/edithotelBrand/{id}:
 *   patch:
 *     summary: Update a hotel brand
 *     tags: [Hotel Brand]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the hotel brand to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Hotel Name
 *               address:
 *                 type: string
 *                 example: Updated Address
 *               phone:
 *                 type: string
 *                 example: +1234567899
 *     responses:
 *       200:
 *         description: The updated hotel brand
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HotelBrand'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Hotel brand not found
 */
router.patch('/edithotelBrand/:id', authenticate, requireRole(['super-admin', 'admin', 'branch-admin']), validate(updateHotelBrandSchema), updateHotelBrand);

/**
 * @swagger
 * /api/hotelBrands/deletehotelBrand/{id}:
 *   delete:
 *     summary: Delete a hotel brand
 *     tags: [Hotel Brand]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the hotel brand to delete
 *     responses:
 *       200:
 *         description: Hotel brand deleted
 *       400:
 *         description: Bad request
 *       404:
 *         description: Hotel brand not found
 */
router.delete('/deletehotelBrand/:id', authenticate, requireRole(['super-admin', 'admin', 'branch-admin']), deleteHotelBrand);

export default router;
