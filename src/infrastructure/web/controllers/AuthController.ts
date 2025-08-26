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

  // Iniciar sesión (envía código por email)
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData = requestLoginSchema.parse(req.body);
      
      const result = await this.loginUseCase.execute(loginData);
      
      res.json(createSuccessResponse(result, result.message));
    } catch (error) {
      next(error);
    }
  };

  // Registrar nuevo usuario
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const registerData = requestRegisterSchema.parse(req.body);
      
      const result = await this.registerUseCase.execute(registerData);
      
      res.status(201).json(createSuccessResponse(result, result.message));
    } catch (error) {
      next(error);
    }
  };

  // Verificar código de inicio de sesión
  verifyLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const verifyData = verifyCodeSchema.parse(req.body);
      
      const result = await this.verifyCodeUseCase.execute(verifyData, 'LOGIN');
      
      res.json(createSuccessResponse(result, 'Inicio de sesión exitoso'));
    } catch (error) {
      next(error);
    }
  };

  // Verificar código de registro
  verifyRegister = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const verifyData = verifyCodeSchema.parse(req.body);
      
      const result = await this.verifyCodeUseCase.execute(verifyData, 'REGISTER');
      
      res.json(createSuccessResponse(result, 'Registro completado exitosamente'));
    } catch (error) {
      next(error);
    }
  };

  // Renovar token de acceso
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

  // Cerrar sesión
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
