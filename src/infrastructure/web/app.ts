import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { config } from '@/infrastructure/config/environment.js';
import { swaggerSpec } from '@/infrastructure/config/swagger.js';
import { errorHandler } from '@/infrastructure/web/middlewares/errorHandler.js';
import { notFoundHandler } from '@/infrastructure/web/middlewares/notFoundHandler.js';
import { authRoutes } from '@/infrastructure/web/routes/authRoutes.js';
import { userRoutes } from '@/infrastructure/web/routes/userRoutes.js';
import { productRoutes } from '@/infrastructure/web/routes/productRoutes.js';
import { cartRoutes } from '@/infrastructure/web/routes/cartRoutes.js';
import { orderRoutes } from '@/infrastructure/web/routes/orderRoutes.js';
import { addressRoutes } from '@/infrastructure/web/routes/addressRoutes.js';import { paymentRoutes } from '@/infrastructure/web/routes/paymentRoutes.js';
import { healthRoutes } from '@/infrastructure/web/routes/healthRoutes.js';
import { logger } from '@/shared/utils/logger.js';

export function createApp(): express.Application {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // CORS configuration
  app.use(cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression middleware
  app.use(compression());

  // Logging middleware
  if (config.nodeEnv !== 'test') {
    app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }));
  }

  // Swagger documentation
  const swaggerOptions = {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2563eb }
    `,
    customSiteTitle: 'AstroCore API Documentation',
    customfavIcon: '/favicon.ico',
  };

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

  // Health check endpoint
  app.use('/health', healthRoutes);

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/users/addresses', addressRoutes);  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payments', paymentRoutes);

  // Static files
  app.use('/uploads', express.static(config.upload.uploadPath));

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
