import express from "express";
import { getBestSellingDishes, getMonthlyReport, getPaymentMethodsSummary, getProfitLossSummary } from "../controllers/monthlyReportController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MonthlyReport
 *   description: Operations related to Monthly Reporting
 */

/**
 * @swagger
 * /api/report/monthly-report:
 *   get:
 *     summary: Get monthly financial report
 *     tags: [MonthlyReport]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Monthly report retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     month:
 *                       type: string
 *                       example: 2025-08
 *                     purchasePrice:
 *                       type: number
 *                       example: 5000
 *                     purchaseCancel:
 *                       type: number
 *                       example: 200
 *                     purchaseTotal:
 *                       type: number
 *                       example: 4800
 *                     salePrice:
 *                       type: number
 *                       example: 8000
 *                     saleCancel:
 *                       type: number
 *                       example: 500
 *                     saleTotal:
 *                       type: number
 *                       example: 7500
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get(
  "/monthly-report",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  getMonthlyReport
);


/**
 * @swagger
 * /api/report/bestSelling:
 *   get:
 *     summary: Get best selling dishes of the month
 *     tags: [MonthlyReport]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Best selling dishes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   dishName:
 *                     type: string
 *                     example: Margherita Pizza
 *                   quantitySold:
 *                     type: integer
 *                     example: 120
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/bestSelling",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  getBestSellingDishes
);


/**
 * @swagger
 * /api/report/paymentMethods:
 *   get:
 *     summary: Get payment method summary for the month
 *     tags: [MonthlyReport]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Payment method summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Cash:
 *                   type: number
 *                   example: 2500
 *                 Card:
 *                   type: number
 *                   example: 4000
 *                 UPI:
 *                   type: number
 *                   example: 3000
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/paymentMethods",
  authenticate,
requireRole(['super-admin', 'admin', 'branch-admin']),  getPaymentMethodsSummary
);


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
 * /profitloss:
 *   get:
 *     summary: "Get the profit and loss summary"
 *     description: "This endpoint returns the profit and loss summary for the authenticated user based on their role."
 *     tags:
 *       - Financials
 *     security:
 *       - BearerAuth: []  # Assuming you're using Bearer token authentication
 *     responses:
 *       200:
 *         description: "Successfully retrieved the profit and loss summary."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profitLoss:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                       example: 100000
 *                     totalCost:
 *                       type: number
 *                       example: 50000
 *                     netProfit:
 *                       type: number
 *                       example: 50000
 *       401:
 *         description: "Unauthorized access due to missing or invalid authentication."
 *       403:
 *         description: "Forbidden access due to insufficient role permissions."
 *       500:
 *         description: "Internal server error."
 *     x-codeSamples:
 *       - lang: "JavaScript"
 *         source: |
 *           fetch('/profitloss', {
 *             method: 'GET',
 *             headers: {
 *               'Authorization': 'Bearer <your-token>'
 *             }
 *           })
 *           .then(response => response.json())
 *           .then(data => console.log(data))
 *           .catch(error => console.error('Error:', error));
 */


router.get(
  "/profitloss",
  authenticate,
  requireRole(['super-admin', 'admin', 'branch-admin']),
  getProfitLossSummary
);

export default router;
