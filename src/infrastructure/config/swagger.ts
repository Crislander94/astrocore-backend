import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './environment.js';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AstroCore Ecommerce API',
    version: '1.0.0',
    description: `
      API REST para el ecommerce AstroCore desarrollado con arquitectura hexagonal.
      
      ## Características
      - Autenticación passwordless con códigos de verificación
      - Sistema de productos con categorías
      - Carrito de compras con IVA
      - Gestión de órdenes
      - Integración con Datafast para pagos
      
      ## Autenticación
      La API utiliza JWT Bearer tokens. Para obtener un token:
      1. Registrarse o hacer login con email
      2. Verificar el código de 6 dígitos enviado por email
      3. Usar el accessToken en el header Authorization: Bearer <token>
    `,
    contact: {
      name: 'AstroCore Team',
      email: 'dev@astrocore.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Servidor de desarrollo',
    },
    {
      url: 'https://api.astrocore.com',
      description: 'Servidor de producción',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa tu JWT token obtenido del endpoint de verificación',
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Token de acceso faltante o inválido',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Token de acceso requerido' },
                error: { type: 'string', example: 'UNAUTHORIZED' },
              },
            },
          },
        },
      },
      ValidationError: {
        description: 'Error de validación de datos',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Error de validación' },
                error: { type: 'string', example: 'VALIDATION_ERROR' },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      NotFoundError: {
        description: 'Recurso no encontrado',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Recurso no encontrado' },
                error: { type: 'string', example: 'NOT_FOUND' },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'Endpoints de autenticación passwordless',
    },
    {
      name: 'Users',
      description: 'Gestión de perfiles de usuario',
    },
    {
      name: 'Products',
      description: 'Catálogo de productos',
    },
    {
      name: 'Cart',
      description: 'Carrito de compras',
    },
    {
      name: 'Orders',
      description: 'Gestión de órdenes',
    },
    {
      name: 'Payments',
      description: 'Procesamiento de pagos con Datafast',
    },
    {
      name: 'Health',
      description: 'Estado del servicio',
    },
  ],
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    // Rutas en desarrollo (TypeScript)
    './src/infrastructure/web/routes/*.ts',
    './src/infrastructure/web/controllers/*.ts',
    // Rutas compiladas (JavaScript)
    './dist/infrastructure/web/routes/*.js',
    './dist/infrastructure/web/controllers/*.js',
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Configuración adicional para desarrollo
if (config.nodeEnv === 'development') {
  console.log('📚 Swagger documentation available at: http://localhost:' + config.port + '/api/docs');
}
