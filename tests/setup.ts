import { config } from '@/infrastructure/config/environment.js';

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_ecommerce_astrocore';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

// Mock del servicio de email para testing
jest.mock('@/infrastructure/external/EmailServiceImpl.js', () => {
  return {
    EmailServiceImpl: jest.fn().mockImplementation(() => ({
      sendVerificationCode: jest.fn().mockResolvedValue(undefined),
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
      sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
      sendPaymentConfirmation: jest.fn().mockResolvedValue(undefined),
      isConfigured: jest.fn().mockReturnValue(true),
    })),
  };
});

// Configuración global para tests
beforeAll(async () => {
  // Aquí podrías configurar una base de datos de prueba
});

afterAll(async () => {
  // Limpiar después de las pruebas
});
