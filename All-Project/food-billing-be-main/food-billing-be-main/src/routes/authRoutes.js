import express from "express";
import upload from "../middlewares/upload.js";
import validate from "../middlewares/validateMiddleware.js";
import {
  registerUser,
  loginUser,
  updateUser,
  logoutUser,
  forgotPassword,
  resetPasswordWithOTP
} from "../controllers/authController.js";
import { forgotPasswordSchema, loginSchema, registerUserSchema, resetPasswordSchema } from "../validations/authValidation.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Some server error
 */
router.post("/register", upload.single("profileImage"), validate(registerUserSchema), registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", validate(loginSchema), loginUser);

router.put("/update/:id", upload.single("profileImage"), updateUser);

// router.post("/sendotp", sendOTP);

// router.post("/resetpassword", resetPassword);


/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user and invalidate JWT session
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []   # Require Authorization header with JWT
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post("/logout", logoutUser);

/**
 * @swagger
 * /api/auth/forgotpassword:
 *   post:
 *     summary: Send password reset link to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link sent
 */
router.post("/forgotpassword", validate(forgotPasswordSchema), forgotPassword);

/**
 * @swagger
 * /api/auth/resetpassword:
 *   post:
 *     summary: Reset user password with OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - otp
 *               - new_password
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: User ID from database
 *                 example: "64f1b7c8a5e4b123456789ab"
 *               otp:
 *                 type: string
 *                 description: One-time password sent to the user
 *                 example: "123456"
 *               new_password:
 *                 type: string
 *                 format: password
 *                 description: New password to set
 *                 example: "StrongPass@123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successfully
 *       400:
 *         description: Invalid OTP, expired OTP, or validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/resetpassword", validate(resetPasswordSchema), resetPasswordWithOTP);



export default router;
