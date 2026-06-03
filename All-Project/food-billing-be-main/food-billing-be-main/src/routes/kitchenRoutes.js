import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { deleteAllKitchenOrders, deleteKitchenOrder, getKitchenOrders } from '../controllers/kitchenController.js';

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Kitchen
 *   description: Kitchen Order Management APIs
 */

/**
 * @swagger
 * /api/kitchen/getkitchen:
 *   get:
 *     summary: "Get kitchen orders"
 *     description: "Retrieve a list of kitchen orders for authorized users. Access is restricted to users with roles: super-admin, admin, or branch-admin."
 *     tags:
 *       - Kitchen
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved kitchen orders."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderId:
 *                         type: string
 *                         example: "order123"
 *                       status:
 *                         type: string
 *                         example: "preparing"
 *                       items:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Burger", "Fries"]
 *       401:
 *         description: "Unauthorized. Token missing or invalid."
 *       403:
 *         description: "Forbidden. User does not have the required role."
 *       500:
 *         description: "Internal server error."
 */
router.get(
  "/getkitchen",
  authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  getKitchenOrders
);

/**
 * @swagger
 * /api/kitchen/{id}:
 *   delete:
 *     summary: Delete a specific kitchen order
 *     description: Deletes a kitchen order by its ID. Requires authentication and proper role access.
 *     tags:
 *       - Kitchen
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the kitchen order to delete
 *     responses:
 *       200:
 *         description: Kitchen order deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Kitchen order deleted successfully
 *                 deletedOrder:
 *                   type: object
 *                   description: The deleted kitchen order data
 *       401:
 *         description: Unauthorized. Token missing or invalid.
 *       403:
 *         description: Forbidden. User does not have the required role.
 *       404:
 *         description: Kitchen order not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  deleteKitchenOrder);

/**
 * @swagger
 * /api/kitchen/delete-all:
 *   delete:
 *     summary: Delete all kitchen orders
 *     description: Deletes all kitchen orders in the system. Use with caution. Requires authentication and role access.
 *     tags:
 *       - Kitchen
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All kitchen orders deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 25 kitchen orders deleted
 *       401:
 *         description: Unauthorized. Token missing or invalid.
 *       403:
 *         description: Forbidden. User does not have the required role.
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/delete-all",
  authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  deleteAllKitchenOrders);

export default router;