import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // Database
  DATABASE_URL: z.string(),
  
  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  
  // CORS
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000'),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_SECURE: z.string().transform(Boolean).default('false'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().optional(),
  FROM_NAME: z.string().optional(),
  
  // Datafast
  DATAFAST_MID: z.string(),
  DATAFAST_ACQUIRER_ID: z.string(),
  DATAFAST_SECRET_KEY: z.string(),
  DATAFAST_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
  DATAFAST_API_URL: z.string().default('https://ccapi-stg.datafast.com.ec'),
  DATAFAST_CALLBACK_URL: z.string(),
  DATAFAST_SUCCESS_URL: z.string(),
  DATAFAST_FAILURE_URL: z.string(),
  
  // File Upload
  MAX_FILE_SIZE: z.string().default('5MB'),
  UPLOAD_PATH: z.string().default('./uploads'),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/webp'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  SESSION_SECRET: z.string(),
  
  // Logging
  LOG_LEVEL: z.string().default('info'),
  LOG_FILE: z.string().default('logs/app.log'),
  
  // Cache
  REDIS_URL: z.string().optional(),
  CACHE_TTL: z.string().transform(Number).default('3600'),
});

const env = envSchema.parse(process.env);

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  
  database: {
    url: env.DATABASE_URL,
  },
  
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  
  cors: {
    frontendUrl: env.FRONTEND_URL,
    allowedOrigins: env.ALLOWED_ORIGINS.split(','),
  },
  
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    fromEmail: env.FROM_EMAIL,
    fromName: env.FROM_NAME,
  },
  
  datafast: {
    mid: env.DATAFAST_MID,
    acquirerId: env.DATAFAST_ACQUIRER_ID,
    secretKey: env.DATAFAST_SECRET_KEY,
    environment: env.DATAFAST_ENVIRONMENT,
    apiUrl: env.DATAFAST_API_URL,
    callbackUrl: env.DATAFAST_CALLBACK_URL,
    successUrl: env.DATAFAST_SUCCESS_URL,
    failureUrl: env.DATAFAST_FAILURE_URL,
  },
  
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    uploadPath: env.UPLOAD_PATH,
    allowedFileTypes: env.ALLOWED_FILE_TYPES.split(','),
  },
  
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    sessionSecret: env.SESSION_SECRET,
  },
  
  logging: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE,
  },
  
  cache: {
    redisUrl: env.REDIS_URL,
    ttl: env.CACHE_TTL,
  },
};
