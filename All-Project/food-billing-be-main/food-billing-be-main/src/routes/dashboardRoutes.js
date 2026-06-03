
import express from "express";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getDashboardSummary } from "../controllers/dashboardController.js";
const router = express.Router();



/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard  APIs
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: "Get the dashboard summary"
 *     description: "This endpoint returns the dashboard summary for the authenticated user based on their role."
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []  # This assumes you're using Bearer token for authentication
 *     responses:
 *       200:
 *         description: "Successfully retrieved the dashboard summary."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: string
 *                   example: "This is the dashboard summary data."
 *       401:
 *         description: "Unauthorized access due to missing or invalid authentication."
 *       403:
 *         description: "Forbidden access due to insufficient role permissions."
 *       500:
 *         description: "Internal server error."
 *     x-codeSamples:
 *       - lang: "JavaScript"
 *         source: |
 *           fetch('/summary', {
 *             method: 'GET',
 *             headers: {
 *               'Authorization': 'Bearer <your-token>'
 *             }
 *           })
 *           .then(response => response.json())
 *           .then(data => console.log(data))
 *           .catch(error => console.error('Error:', error));
 */


router.get('/summary',
    authenticate,
    requireRole(['super-admin', 'admin', 'branch-admin']),
    getDashboardSummary);

export default router;