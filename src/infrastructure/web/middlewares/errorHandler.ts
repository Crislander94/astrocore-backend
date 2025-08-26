import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '@/shared/utils/logger.js';
import { AppError } from '@/shared/errors/AppError.js';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
    return;
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        res.status(409).json({
          success: false,
          message: 'Resource already exists',
          error: 'DUPLICATE_ENTRY',
        });
        return;
      case 'P2025':
        res.status(404).json({
          success: false,
          message: 'Resource not found',
          error: 'NOT_FOUND',
        });
        return;
      default:
        res.status(500).json({
          success: false,
          message: 'Database error',
          error: 'DATABASE_ERROR',
        });
        return;
    }
  }

  // Custom application errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: error.code,
    });
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: 'INVALID_TOKEN',
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
      error: 'TOKEN_EXPIRED',
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: 'INTERNAL_ERROR',
  });
}
