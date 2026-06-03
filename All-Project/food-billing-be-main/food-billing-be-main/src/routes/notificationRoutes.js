import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  deleteAllNotifications,
} from "../controllers/notificationController.js";
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User Notification APIs
 */

/**
 * @swagger
 * /api/notifications/:
 *   get:
 *     summary: "Get all notifications"
 *     description: "Retrieve all notifications for the authenticated user."
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved notifications."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       message:
 *                         type: string
 *                       read:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: "Unauthorized"
 *       500:
 *         description: "Internal server error."
 */
router.get("/", authenticate, getNotifications);


/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     summary: "Get notification stats"
 *     description: "Returns statistics like unread count for the authenticated user."
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: "Successfully retrieved notification stats."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unreadCount:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: "Unauthorized"
 *       500:
 *         description: "Internal server error."
 */
router.get("/stats", authenticate, getNotificationStats);


/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: "Mark a specific notification as read"
 *     description: "Marks a single notification as read using its ID."
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the notification
 *     responses:
 *       200:
 *         description: "Notification marked as read."
 *       400:
 *         description: "Invalid notification ID."
 *       401:
 *         description: "Unauthorized"
 *       404:
 *         description: "Notification not found."
 *       500:
 *         description: "Internal server error."
 */
router.patch("/:id/read", authenticate, markAsRead);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: "Mark all notifications as read"
 *     description: "Marks all of the user's notifications as read."
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: "All notifications marked as read."
 *       401:
 *         description: "Unauthorized"
 *       500:
 *         description: "Internal server error."
 */
router.patch("/read-all", authenticate, markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: "Delete a notification"
 *     description: "Deletes a notification by ID for the authenticated user."
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the notification
 *     responses:
 *       200:
 *         description: "Notification deleted successfully."
 *       400:
 *         description: "Invalid notification ID."
 *       401:
 *         description: "Unauthorized"
 *       404:
 *         description: "Notification not found."
 *       500:
 *         description: "Internal server error."
 */
router.delete("/:id", authenticate, deleteNotification);

/**
 * @swagger
 * /api/notifications/delete-all:
 *   delete:
 *     summary: "Delete all notifications"
 *     description: "Deletes all notifications based on the user's role. Branch admins delete only their branch's notifications; admins delete all under their hotel brand."
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: "All notifications deleted successfully."
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
 *                   example: All notifications deleted successfully
 *                 deletedCount:
 *                   type: integer
 *                   example: 42
 *       401:
 *         description: "Unauthorized"
 *       500:
 *         description: "Internal server error."
 */
router.delete("/delete-all", authenticate, deleteAllNotifications);
export default router;