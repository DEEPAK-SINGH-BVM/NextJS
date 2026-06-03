import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
} from '../controllers/orderController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';
import { createOrderSchema, updateOrderSchema } from '../validations/orderValidation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * /api/orders/getallorders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/getallorders', getOrders);

/**
 * @swagger
 * /api/orders/getorder/{id}:
 *   get:
 *     summary: Get a single order by ID
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order found
 *       404:
 *         description: Order not found
 */
router.get('/getorder/:id',
  authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  getOrder
);

/**
 * @swagger
 * /api/orders/createorder:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderType
 *               - totalPrice
 *               - foods
 *             properties:
 *               orderType:
 *                 type: string
 *                 enum: [Dine-In, Delivery, Take-Home]
 *                 example: Dine-In
 *               floor:
 *                 type: string
 *                 example: ground
 *               tables:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64e8d45a8f34a2b17c1e23a2"]
 *               totalPrice:
 *                 type: number
 *                 example: 450
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Card, UPI]
 *                 example: UPI
 *               status:
 *                 type: string
 *                 enum: ["Processing", "Served", "Paid & Completed", "Cancel", "Cancel & Refund"]
 *                 example: Pending
 *               customerName:
 *                 type: string
 *                 example: John Doe
 *               number:
 *                 type: string
 *                 example: "+919876543210"
 *               deliveryAddress:
 *                 type: string
 *                 example: "123 Street, City"
 *               foods:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - price
 *                     - quantity
 *                     - image
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Burger"
 *                     price:
 *                       type: number
 *                       example: 150
 *                     quantity:
 *                       type: number
 *                       example: 2
 *                     instructions:
 *                       type: string
 *                       example: "No onions"
 *                     image:
 *                       type: string
 *                       example: "https://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/createorder',
  authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  validate(createOrderSchema),
  createOrder
);

/**
 * @swagger
 * /api/orders/editorder/{id}:
 *   patch:
 *     summary: Update an existing order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["Processing", "Served", "Paid & Completed", "Cancel", "Cancel & Refund"]
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Card, UPI]
 *               totalPrice:
 *                 type: number
 *               customerName:
 *                 type: string
 *               number:
 *                 type: string
 *               foods:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     foodId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: number
 *                     instructions:
 *                       type: string
 *                     image:
 *                       type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 */
router.patch(
  '/editorder/:id',
  authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  validate(updateOrderSchema),
  updateOrder
);

/**
 * @swagger
 * /api/orders/deleteorder/{id}:
 *   delete:
 *     summary: Delete an order by ID
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Order ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
router.delete(
  '/deleteorder/:id',
  authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  deleteOrder
);

export default router;
