import { Request, Response, NextFunction } from 'express';
import { PrismaUserRepository } from '@/infrastructure/database/repositories/PrismaUserRepository.js';
import { updateProfileSchema } from '@/domain/entities/User.js';
import { createSuccessResponse } from '@/shared/types/api.js';
import { NotFoundError } from '@/shared/errors/AppError.js';

export class UserController {
  private userRepository: PrismaUserRepository;

  constructor() {
    this.userRepository = new PrismaUserRepository();
  }

  /**
   * @swagger
   * /api/users/profile:
   *   get:
   *     summary: Obtener perfil del usuario autenticado
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Perfil obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: No autorizado
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }

      res.json(createSuccessResponse(user.toResponse(), 'Perfil obtenido exitosamente'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/users/profile:
   *   put:
   *     summary: Actualizar perfil del usuario
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firstName:
   *                 type: string
   *                 example: Juan
   *               lastName:
   *                 type: string
   *                 example: Pérez
   *               phone:
   *                 type: string
   *                 example: "+593987654321"
   *     responses:
   *       200:
   *         description: Perfil actualizado exitosamente
   *       400:
   *         description: Error de validación
   *       401:
   *         description: No autorizado
   */
  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const updateData = updateProfileSchema.parse(req.body);
      
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }

      const updatedUser = await this.userRepository.update(userId, updateData);

      res.json(createSuccessResponse(
        updatedUser.toResponse(), 
        'Perfil actualizado exitosamente'
      ));
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/users/profile:
   *   delete:
   *     summary: Desactivar cuenta del usuario
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Cuenta desactivada exitosamente
   *       401:
   *         description: No autorizado
   */
  deactivateAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      
      await this.userRepository.update(userId, { isActive: false });

      res.json(createSuccessResponse(null, 'Cuenta desactivada exitosamente'));
    } catch (error) {
      next(error);
    }
  };
}
