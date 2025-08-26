import { Router } from 'express';
import { UserController } from '@/infrastructure/web/controllers/UserController.js';
import { authenticate, requireEmailVerified } from '@/infrastructure/web/middlewares/authMiddleware.js';

const router = Router();
const userController = new UserController();

// Todas las rutas de usuario requieren autenticación
router.use(authenticate);

// Rutas que requieren email verificado
router.get('/profile', requireEmailVerified, userController.getProfile);
router.put('/profile', requireEmailVerified, userController.updateProfile);
router.delete('/profile', requireEmailVerified, userController.deactivateAccount);

export { router as userRoutes };
