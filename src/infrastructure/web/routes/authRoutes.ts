import { Router } from 'express';
import { AuthController } from '@/infrastructure/web/controllers/AuthController.js';
import { authenticate } from '@/infrastructure/web/middlewares/authMiddleware.js';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         phone:
 *           type: string
 *         isActive:
 *           type: boolean
 *         role:
 *           type: string
 *           enum: [CUSTOMER, ADMIN, SUPER_ADMIN]
 *         emailVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: usuario@ejemplo.com
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - firstName
 *         - lastName
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: usuario@ejemplo.com
 *         firstName:
 *           type: string
 *           example: Juan
 *         lastName:
 *           type: string
 *           example: Pérez
 *     VerifyCodeRequest:
 *       type: object
 *       required:
 *         - email
 *         - code
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         code:
 *           type: string
 *           minLength: 6
 *           maxLength: 6
 *           example: "123456"
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *         expiresIn:
 *           type: number
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Rutas públicas (no requieren autenticación)
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/verify-login', authController.verifyLogin);
router.post('/verify-register', authController.verifyRegister);
router.post('/refresh', authController.refresh);

// Rutas protegidas (requieren autenticación)
router.post('/logout', authenticate, authController.logout);

export { router as authRoutes };
