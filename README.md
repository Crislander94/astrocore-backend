# Backend Ecommerce AstroCore

Backend API desarrollado en TypeScript con Node.js utilizando arquitectura hexagonal para el proyecto de ecommerce AstroCore.

## Tecnologías

- **Runtime**: Node.js
- **Lenguaje**: TypeScript
- **Arquitectura**: Hexagonal (Ports & Adapters)
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **Framework web**: Express.js
- **Validación**: Zod
- **Autenticación**: JWT
- **Pasarela de pago**: Datafast (Ecuador)
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest
- **Deployment**: Digital Ocean Droplet

## Arquitectura Hexagonal

```
src/
├── application/          # Casos de uso y lógica de aplicación
│   ├── use-cases/
│   ├── ports/           # Interfaces (puertos)
│   └── services/
├── domain/              # Entidades y lógica de negocio
│   ├── entities/
│   ├── value-objects/
│   └── repositories/    # Interfaces de repositorios
├── infrastructure/      # Adaptadores externos
│   ├── database/        # Implementación de repositorios
│   ├── web/            # Controllers y rutas
│   ├── external/       # APIs externas
│   └── config/
└── shared/             # Utilidades compartidas
    ├── errors/
    ├── types/
    └── utils/
```

## Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- Git

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd backend-astrocore
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_astrocore"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:5173"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Payment Gateway - Datafast
DATAFAST_MID="your-merchant-id"
DATAFAST_ACQUIRER_ID="your-acquirer-id"
DATAFAST_SECRET_KEY="your-secret-key"
DATAFAST_ENVIRONMENT="sandbox" # sandbox | production
DATAFAST_CALLBACK_URL="https://your-domain.com/api/payments/callback"

# File Upload
MAX_FILE_SIZE="5MB"
UPLOAD_PATH="./uploads"
```

### 4. Configurar base de datos

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Poblar base de datos (opcional)
npx prisma db seed
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor con hot-reload
npm run build        # Compila TypeScript a JavaScript
npm start           # Inicia servidor en producción

# Base de datos
npm run db:migrate   # Ejecuta migraciones
npm run db:seed     # Pobla la base de datos
npm run db:studio   # Abre Prisma Studio
npm run db:reset    # Resetea la base de datos

# Testing
npm test            # Ejecuta tests
npm run test:watch  # Tests en modo watch
npm run test:coverage # Tests con cobertura

# Linting y formato
npm run lint        # Ejecuta ESLint
npm run lint:fix    # Corrige errores de linting
npm run format      # Formatea código con Prettier

# Documentación
npm run docs        # Genera documentación API
```

## Modelos de Datos

### Alineación Frontend-Backend

Los modelos del backend están completamente alineados con los del frontend para garantizar consistencia:

#### Product Model (Alineado con frontend)
```typescript
// Frontend & Backend compatible
{
  id: number,                    // Auto-increment ID
  name: string,
  descripcion: string,           // Descripción del producto
  price: number,
  images: string[],              // Array de URLs de imágenes
  haveDiscount: boolean,         // Indica si tiene descuento
  oldPrice?: number,             // Precio anterior (para descuentos)
  category?: string              // Categoría como string
}
```

#### Cart Model (Alineado con frontend)
```typescript
// Item del carrito
{
  id: number,                    // ID del producto
  name: string,
  price: number,
  oldPrice?: number,
  haveDiscount?: boolean,
  quantity: number,
  iva: boolean,                  // Campo específico para Ecuador
  images?: string[]
}

// Carrito completo
{
  items: CartItem[],
  lastItemAdded: CartItem | null,
  total: number,                 // Total con IVA incluido
  totalQuantity: number
}
```

### Campos Específicos del Backend

El backend extiende los modelos del frontend con campos adicionales para gestión interna:

- **Product**: `slug`, `sku`, `quantity`, `status`, `isActive`, `isFeatured`, `createdAt`, `updatedAt`
- **User**: Gestión completa de usuarios con roles y autenticación
- **Order**: Sistema completo de órdenes con estados y seguimiento
- **Payment**: Integración completa con Datafast

### Cálculos de IVA

El sistema maneja automáticamente el IVA del 12% (Ecuador):
- **Subtotal**: Suma de productos sin IVA
- **IVA**: 12% sobre productos que lo requieren
- **Total**: Subtotal + IVA + Envío - Descuentos

### Application Layer (Aplicación)

```typescript
// src/application/use-cases/CreateUser.ts
export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(command: CreateUserCommand): Promise<User> {
    // Lógica de negocio
  }
}
```

### Infrastructure Layer (Infraestructura)

```typescript
// src/infrastructure/database/PrismaUserRepository.ts
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: UserId): Promise<User | null> {
    // Implementación con Prisma
  }
}
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil
- `DELETE /api/users/account` - Eliminar cuenta

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)

### Carrito
- `GET /api/cart` - Obtener carrito
- `POST /api/cart/items` - Agregar item
- `PUT /api/cart/items/:id` - Actualizar item
- `DELETE /api/cart/items/:id` - Eliminar item

### Órdenes
- `GET /api/orders` - Listar órdenes
- `GET /api/orders/:id` - Obtener orden
- `POST /api/orders` - Crear orden
- `PUT /api/orders/:id/status` - Actualizar estado

### Pagos (Datafast)
- `POST /api/payments/create` - Crear transacción de pago
- `POST /api/payments/callback` - Callback de Datafast
- `GET /api/payments/:id/status` - Verificar estado de pago
- `POST /api/payments/refund` - Procesar reembolso

## Deployment en Digital Ocean

### 1. Preparar el Droplet

```bash
# Conectar al droplet
ssh root@your-droplet-ip

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Instalar PostgreSQL
apt install postgresql postgresql-contrib -y

# Instalar PM2
npm install -g pm2

# Instalar Nginx
apt install nginx -y
```

### 2. Configurar PostgreSQL

```bash
# Cambiar a usuario postgres
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE ecommerce_astrocore;
CREATE USER astrocore_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_astrocore TO astrocore_user;
\q
```

### 3. Configurar el proyecto

```bash
# Clonar repositorio
git clone <repository-url> /var/www/backend-astrocore
cd /var/www/backend-astrocore

# Instalar dependencias
npm ci --only=production

# Configurar variables de entorno
cp .env.example .env
nano .env

# Compilar proyecto
npm run build

# Ejecutar migraciones
npx prisma migrate deploy
```

### 4. Configurar PM2

```bash
# Crear archivo ecosystem
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'backend-astrocore',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Iniciar aplicación
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Configurar Nginx

```bash
# Crear configuración
cat > /etc/nginx/sites-available/backend-astrocore << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Habilitar sitio
ln -s /etc/nginx/sites-available/backend-astrocore /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 6. SSL con Certbot (Opcional)

```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obtener certificado
certbot --nginx -d your-domain.com

# Auto-renovación
crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoreo y Logs

```bash
# Ver logs de PM2
pm2 logs backend-astrocore

# Monitorear aplicación
pm2 monit

# Ver logs de Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Reiniciar servicios
pm2 restart backend-astrocore
systemctl restart nginx
```

## Comandos de Mantenimiento

```bash
# Actualizar aplicación
git pull origin main
npm ci --only=production
npm run build
npx prisma migrate deploy
pm2 restart backend-astrocore

# Backup de base de datos
pg_dump -U astrocore_user -h localhost ecommerce_astrocore > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U astrocore_user -h localhost ecommerce_astrocore < backup_20240101.sql
```

## Troubleshooting

### Problemas Comunes

1. **Error de conexión a base de datos**
   ```bash
   # Verificar estado de PostgreSQL
   systemctl status postgresql
   
   # Verificar conexión
   psql -U astrocore_user -h localhost -d ecommerce_astrocore
   ```

2. **Aplicación no inicia**
   ```bash
   # Verificar logs
   pm2 logs backend-astrocore
   
   # Verificar variables de entorno
   pm2 env 0
   ```

3. **Error 502 Bad Gateway**
   ```bash
   # Verificar que la aplicación esté corriendo
   pm2 status
   
   # Verificar configuración de Nginx
   nginx -t
   ```

## Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## Contacto

- **Proyecto**: Ecommerce AstroCore
- **Repositorio**: [GitHub Repository URL]
- **Documentación API**: `http://your-domain.com/api/docs`
