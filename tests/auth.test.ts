import request from 'supertest';
import { createApp } from '@/infrastructure/web/app.js';

const app = createApp();

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
    });

    it('should return validation error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should send verification code for existing user', async () => {
      // Primero registrar un usuario
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login-test@example.com',
          firstName: 'Login',
          lastName: 'Test',
        });

      // Luego intentar login
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login-test@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('login-test@example.com');
    });

    it('should return error for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });
  });
});
