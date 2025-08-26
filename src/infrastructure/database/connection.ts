import { PrismaClient } from '@prisma/client';
import { logger } from '@/shared/utils/logger.js';

class DatabaseConnection {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new PrismaClient({
        log: [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'warn' },
        ],
      });

      // Log database queries in development
      if (process.env.NODE_ENV === 'development') {
        DatabaseConnection.instance.$on('query', (e) => {
          logger.debug(`Query: ${e.query}`);
          logger.debug(`Params: ${e.params}`);
          logger.debug(`Duration: ${e.duration}ms`);
        });
      }

      DatabaseConnection.instance.$on('error', (e) => {
        logger.error('Database error:', e);
      });
    }

    return DatabaseConnection.instance;
  }

  static async connect(): Promise<void> {
    try {
      const prisma = DatabaseConnection.getInstance();
      await prisma.$connect();
      logger.info('Database connection established');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    try {
      if (DatabaseConnection.instance) {
        await DatabaseConnection.instance.$disconnect();
        logger.info('Database connection closed');
      }
    } catch (error) {
      logger.error('Error closing database connection:', error);
      throw error;
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const prisma = DatabaseConnection.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }
}

export { DatabaseConnection };
export const prisma = DatabaseConnection.getInstance();
