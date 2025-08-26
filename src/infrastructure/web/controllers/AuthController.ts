import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase.js';
import { RegisterUseCase } from '@/application/use-cases/auth/RegisterUseCase.js';
import { VerifyCodeUseCase } from '@/application/use-cases/auth/VerifyCodeUseCase.js';
import { PrismaUserRepository } from '@/infrastructure/database/repositories/PrismaUserRepository.js';
import { PrismaVerificationCodeRepository } from '@/infrastructure/database/repositories/PrismaVerificationCodeRepository.js';
import { JwtServiceImpl } from '@/infrastructure/external/JwtServiceImpl.js';
import { EmailServiceImpl } from '@/infrastructure/external/EmailServiceImpl.js';
import { requestLoginSchema, requestRegisterSchema, verifyCodeSchema } from '@/domain/entities/User.js';
import { createSuccessResponse } from '@/shared/types/api.js';
import { logger } from '@/shared/utils/logger.js';

export class AuthController {
  private loginUseCase: LoginUseCase;
  private registerUseCase: RegisterUseCase;
  private verifyCodeUseCase: VerifyCodeUseCase;
  private jwtService: JwtServiceImpl;

  constructor() {
    const userRepository = new PrismaUserRepository();
    const verificationCodeRepository = new PrismaVerificationCodeRepository();
    const emailService = new EmailServiceImpl();
    this.jwtService = new JwtServiceImpl();

    this.loginUseCase = new LoginUseCase(
      userRepository,
      verificationCodeRepository,
      emailService
    );

    this.registerUseCase = new RegisterUseCase(
      userRepository,
      verificationCodeRepository,
      emailService
    );

    this.verifyCodeUseCase = new VerifyCodeUseCase(
      userRepository,
      verificationCodeRepository,
      this.jwtService
    );
  }

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Iniciar sesión (envía código por email)
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: usuario@ejemplo.com
   *     responses:
   *       200:
   *         description: Código de verificación enviado
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
   *                   example: Código de verificación enviado a tu email
   *                 data:
   *                   type: object
   *                   properties:
   *                     email:
   *                       type: string
   *                       example: usuario@ejemplo.com
   *       404:
   *         description: Usuario no encontrado
   *       400:
   *         description: Error de validación
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData = requestLoginSchema.parse(req.body);
      
      const result = await this.loginUseCase.execute(loginData);
      
      res.json(createSuccessResponse(result, result.message));
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Registrar nuevo usuario
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - firstName
   *               - lastName
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: usuario@ejemplo.com
   *               firstName:
   *                 type: string
   *                 example: Juan
   *               lastName:
   *                 type: string
   *                 example: Pérez
   *     responses:
   *       201:
   *         description: Usuario registrado exitosamente
   *       409:
   *         description: El email ya está registrado
   *       400:
   *         description: Error de validación
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const registerData = requestRegisterSchema.parse(req.body);
      
      const result = await this.registerUseCase.execute(registerData);
      
      res.status(201).json(createSuccessResponse(result, result.message));
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/auth/verify-login:
   *   post:
   *     summary: Verificar código de inicio de sesión
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - code
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               code:
   *                 type: string
   *                 minLength: 6
   *                 maxLength: 6
   *                 example: "123456"
   *     responses:
   *       200:
   *         description: Código verificado exitosamente
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
   *                   type: object
   *                   properties:
   *                     user:
   *                       $ref: '#/components/schemas/User'
   *                     accessToken:
   *                       type: string
   *                     refreshToken:
   *                       type: string
   *                     expiresIn:
   *                       type: number
   *       400:
   *         description: Código inválido o expirado
   */
  verifyLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const verifyData = verifyCodeSchema.parse(req.body);
      
      const result = await this.verifyCodeUseCase.execute(verifyData, 'LOGIN');
      
      res.json(createSuccessResponse(result, 'Inicio de sesión exitoso'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/auth/verify-register:
   *   post:
   *     summary: Verificar código de registro
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - code
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               code:
   *                 type: string
   *                 minLength: 6
   *                 maxLength: 6
   *                 example: "123456"
   *     responses:
   *       200:
   *         description: Registro completado exitosamente
   *       400:
   *         description: Código inválido o expirado
   */
  verifyRegister = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const verifyData = verifyCodeSchema.parse(req.body);
      
      const result = await this.verifyCodeUseCase.execute(verifyData, 'REGISTER');
      
      res.json(createSuccessResponse(result, 'Registro completado exitosamente'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/auth/refresh:
   *   post:
   *     summary: Renovar token de acceso
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token renovado exitosamente
   *       401:
   *         description: Refresh token inválido o expirado
   */
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token requerido',
          error: 'MISSING_REFRESH_TOKEN',
        });
      }

      const result = await this.jwtService.refreshTokens(refreshToken);
      
      res.json(createSuccessResponse(result, 'Token renovado exitosamente'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Cerrar sesión
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Sesión cerrada exitosamente
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // En un sistema stateless con JWT, el logout es principalmente del lado del cliente
      // Aquí podríamos implementar una blacklist de tokens si fuera necesario
      
      logger.info(`User ${req.user?.email} logged out`);
      
      res.json(createSuccessResponse(null, 'Sesión cerrada exitosamente'));
    } catch (error) {
      next(error);
    }
  };
}
