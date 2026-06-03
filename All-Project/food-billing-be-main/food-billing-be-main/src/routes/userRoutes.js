import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import validate from '../middlewares/validateMiddleware.js';
import { createUserSchema, updateUserSchema } from '../validations/userValidation.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           description: The user's email
 *         password:
 *           type: string
 *           description: The user's password
 *         role:
 *           type: string
 *           enum: ['super-admin', 'admin', 'branch-admin']
 *           description: The user's role
 *         hotelBrand:
 *           type: string
 *           description: The user's associated hotel brand
 *         branch:
 *           type: string
 *           description: The user's associated branch
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           description: The user's permissions
 *       example:
 *         name: John Doe
 *         email: johndoe@example.com
 *         password: password123
 *         role: super-admin
 *         hotelBrand: ""
 *         branch: ""
 *         permissions: []
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for managing users
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', authenticate, requireRole(['super-admin', 'admin', 'branch-admin']), getUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '201':
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post('/', authenticate, requireRole(['super-admin', 'admin', 'branch-admin']), validate(createUserSchema), createUser);

/**
 * @swagger
 * /api/users/edituser/{id}:
 *   patch:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name
 *               email:
 *                 type: string
 *                 description: The user's email
 *               password:
 *                 type: string
 *                 description: The user's password
 *               role:
 *                 type: string
 *                 enum: ['super-admin', 'admin', 'branch-admin']
 *               hotelBrand:
 *                 type: string
 *                 description: The user's associated hotel brand
 *               branch:
 *                 type: string
 *                 description: The user's associated branch
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The user's permissions
 *     responses:
 *       '200':
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '404':
 *         description: User not found
 *       '400':
 *         description: Bad request
 */
router.patch('/edituser/:id', authenticate, requireRole(['super-admin', 'admin', 'branch-admin']), validate(updateUserSchema), updateUser);

/**
 * @swagger
 * /api/users/deleteuser/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to delete
 *     responses:
 *       '200':
 *         description: User deleted
 *       '404':
 *         description: User not found
 *       '400':
 *         description: Bad request
 */
router.delete('/deleteuser/:id', authenticate, requireRole(['super-admin', 'admin', 'branch-admin']), deleteUser);

export default router;
