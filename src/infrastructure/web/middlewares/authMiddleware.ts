import { Request, Response, NextFunction } from 'express';
import { JwtServiceImpl } from '@/infrastructure/external/JwtServiceImpl.js';
import { PrismaUserRepository } from '@/infrastructure/database/repositories/PrismaUserRepository.js';
import { UnauthorizedError, ForbiddenError } from '@/shared/errors/AppError.js';
import { logger } from '@/shared/utils/logger.js';

// Extender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        isActive: boolean;
        emailVerified: boolean;
      };
    }
  }
}

export class AuthMiddleware {
  private jwtService: JwtServiceImpl;
  private userRepository: PrismaUserRepository;

  constructor() {
    this.jwtService = new JwtServiceImpl();
    this.userRepository = new PrismaUserRepository();
  }

  // Middleware para verificar autenticación
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.jwtService.extractTokenFromHeader(req.headers.authorization);
      
      if (!token) {
        throw new UnauthorizedError('Token de acceso requerido');
      }

      // Verificar token
      const payload = await this.jwtService.verifyAccessToken(token);

      // Buscar usuario en la base de datos
      const user = await this.userRepository.findById(payload.userId);
      
      if (!user) {
        throw new UnauthorizedError('Usuario no encontrado');
      }

      if (!user.isActive) {
        throw new UnauthorizedError('Cuenta desactivada');
      }

      // Agregar usuario al request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
      };

      next();
    } catch (error) {
      logger.error('Authentication error:', error);
      next(error);
    }
  };

  // Middleware para verificar que el email esté verificado
  requireEmailVerified = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    if (!req.user.emailVerified) {
      throw new ForbiddenError('Email no verificado. Por favor verifica tu email.');
    }

    next();
  };

  // Middleware para verificar roles de admin
  requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Acceso denegado. Se requieren permisos de administrador.');
    }

    next();
  };

  // Middleware para verificar rol de super admin
  requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Acceso denegado. Se requieren permisos de super administrador.');
    }

    next();
  };

  // Middleware opcional (no lanza error si no hay token)
  optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.jwtService.extractTokenFromHeader(req.headers.authorization);
      
      if (token) {
        const payload = await this.jwtService.verifyAccessToken(token);
        const user = await this.userRepository.findById(payload.userId);
        
        if (user && user.isActive) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
          };
        }
      }

      next();
    } catch (error) {
      // En auth opcional, continuamos sin usuario si hay error
      logger.debug('Optional auth failed:', error);
      next();
    }
  };
}

// Instancia singleton
const authMiddleware = new AuthMiddleware();

export const authenticate = authMiddleware.authenticate;
export const requireEmailVerified = authMiddleware.requireEmailVerified;
export const requireAdmin = authMiddleware.requireAdmin;
export const requireSuperAdmin = authMiddleware.requireSuperAdmin;
export const optionalAuth = authMiddleware.optionalAuth;
