import { config } from '@/infrastructure/config/environment.js';
import { createApp } from '@/infrastructure/web/app.js';
import { DatabaseConnection } from '@/infrastructure/database/connection.js';
import { logger } from '@/shared/utils/logger.js';

async function bootstrap() {
  try {
    // Initialize database connection
    await DatabaseConnection.connect();
    logger.info('Database connected successfully');

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📚 API Documentation: http://localhost:${config.port}/api/docs`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await DatabaseConnection.disconnect();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(async () => {
        await DatabaseConnection.disconnect();
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
