import express from 'express';
import { getInvoices } from '../controllers/invoiceController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice related APIs
 */

/**
 * @swagger
 * /api/invoices/invoices:
 *   get:
 *     summary: Retrieve a list of invoices
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     description: >
 *       Retrieves all invoices. Requires authentication and one of the following roles: admin, branch-admin, super-admin.
 *     responses:
 *       200:
 *         description: Successful retrieval of invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: Unauthorized - Authentication failed or missing token
 *       403:
 *         description: Forbidden - User does not have required roles
 */
router.get(
  "/invoices",
  authenticate,
 requireRole(['super-admin', 'admin', 'branch-admin']),
  getInvoices
);

export default router;
