import express from 'express';
import {
    createBranch,
    getBranches,
    updateBranch,
    deleteBranch
} from '../controllers/branchController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';
import { createBranchSchema, updateBranchSchema } from '../validations/branchValidation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Branch
 *   description: Operations related to Branches
 */

/**
 * @swagger
 * /api/branches:
 *   get:
 *     summary: Get all branches
 *     tags: [Branch]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of branches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Branch'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, requireRole(['super-admin', 'admin','branch-admin']), getBranches);

/**
 * @swagger
 * /api/branches:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branch]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the branch
 *               address:
 *                 type: string
 *                 description: The address of the branch
 *               phone:
 *                 type: string
 *                 description: The phone number of the branch
 *               branchAdminName:
 *                 type: string
 *                 description: The name of the branch admin user
 *               branchAdminEmail:
 *                 type: string
 *                 description: The email of the branch admin user
 *               branchAdminPassword:
 *                 type: string
 *                 description: The password of the branch admin user
 *             required:
 *               - name
 *               - address
 *               - phone
 *               - branchAdminName
 *               - branchAdminEmail
 *               - branchAdminPassword
 *     responses:
 *       201:
 *         description: The created branch
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Bad request
 */
router.post('/', authenticate, requireRole(['super-admin', 'admin','branch-admin']), validate(createBranchSchema), createBranch);

/**
 * @swagger
 * /api/branches/editbranch/{id}:
 *   patch:
 *     summary: Update a branch
 *     tags: [Branch]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the branch to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the branch
 *               address:
 *                 type: string
 *                 description: The address of the branch
 *               phone:
 *                 type: string
 *                 description: The phone number of the branch
 *             required:
 *               - name
 *               - address
 *               - phone
 *     responses:
 *       200:
 *         description: The updated branch
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Branch'
 *       404:
 *         description: Branch not found
 *       400:
 *         description: Bad request
 */
router.patch('/editbranch/:id', authenticate, requireRole(['super-admin', 'admin', 'branch-admin']), validate(updateBranchSchema), updateBranch);

/**
 * @swagger
 * /api/branches/deletebranch/{id}:
 *   delete:
 *     summary: Delete a branch
 *     tags: [Branch]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the branch to delete
 *     responses:
 *       200:
 *         description: Branch deleted
 *       404:
 *         description: Branch not found
 *       400:
 *         description: Bad request
 */
router.delete('/deletebranch/:id', authenticate, requireRole(['super-admin', 'admin', 'branch-admin']), deleteBranch);

export default router;
