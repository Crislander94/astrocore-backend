# 🗄️ Base de Datos - Ecommerce AstroCore

Esta carpeta contiene todos los archivos relacionados con la base de datos PostgreSQL del proyecto.

## 📁 Archivos Incluidos

- `create_database.sql` - Script completo de creación de BD
- `install_database.sh` - Script automatizado de instalación
- `entity_relationship_diagram.md` - Diagrama ER completo
- `README.md` - Esta documentación

## 🚀 Instalación Rápida

### Opción 1: Script Automatizado (Recomendado)
```bash
cd database/
./install_database.sh
```

### Opción 2: Manual
```bash
# 1. Crear base de datos y usuario
sudo -u postgres psql
CREATE DATABASE ecommerce_astrocore;
CREATE USER astrocore_user WITH PASSWORD 'AstroCore2025!';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_astrocore TO astrocore_user;
\q

# 2. Ejecutar script SQL
psql -U astrocore_user -d ecommerce_astrocore -f create_database.sql
```

## 📊 Estructura de la Base de Datos

### Tablas Principales

| Tabla | Propósito | Registros Iniciales |
|-------|-----------|-------------------|
| `users` | Usuarios con auth passwordless | 1 (admin) |
| `verification_codes` | Códigos de 6 dígitos | 0 |
| `categories` | Categorías jerárquicas | 3 |
| `products` | Catálogo alineado con frontend | 3 |
| `cart_items` | Carrito persistente | 0 |
| `orders` | Órdenes de compra | 0 |
| `payments` | Pagos con Datafast | 0 |
| `reviews` | Reseñas de productos | 0 |

### Características Especiales

#### 🔐 Autenticación Passwordless
- Sin campo `password` en usuarios
- Códigos de verificación de 6 dígitos
- Expiración automática (10-15 min)
- Tipos: LOGIN, REGISTER, PASSWORD_RESET

#### 🛍️ Productos Alineados con Frontend
- ID numérico auto-increment
- Campo `descripcion` (no `description`)
- Array de imágenes como strings
- Campos `haveDiscount` y `oldPrice`
- Categoría como string simple

#### 🛒 Carrito con IVA Ecuatoriano
- Campo `iva` boolean para cada item
- Cálculo automático del 12% IVA
- Relación única usuario-producto

#### 💳 Integración Datafast
- Referencia única de Datafast
- Respuesta JSON del gateway
- Estados de pago detallados
- Soporte para callbacks

## 🔧 Configuración

### Variables de Entorno Requeridas
```env
DATABASE_URL="postgresql://astrocore_user:AstroCore2025!@localhost:5432/ecommerce_astrocore"
```

### Conexión Manual
```bash
psql -h localhost -p 5432 -U astrocore_user -d ecommerce_astrocore
```

## 📈 Índices de Performance

### Índices Únicos
- `users_email_key` - Email único
- `products_sku_key` - SKU único
- `orders_orderNumber_key` - Número de orden único
- `cart_items_userId_productId_key` - Carrito único

### Índices de Consulta
- `products_categoryId_idx` - Filtros por categoría
- `products_price_idx` - Filtros por precio
- `orders_status_idx` - Estados de orden
- `verification_codes_email_type_idx` - Códigos por usuario

## 🔄 Triggers Automáticos

### Actualización de Timestamps
Todas las tablas con `updatedAt` tienen triggers que actualizan automáticamente este campo en cada UPDATE.

```sql
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON "users" 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🛡️ Seguridad y Restricciones

### Eliminación en Cascada
- `verification_codes` → `users` (CASCADE)
- `cart_items` → `users` (CASCADE)
- `addresses` → `users` (CASCADE)
- `order_items` → `orders` (CASCADE)

### Eliminación Restringida
- `orders` → `users` (RESTRICT)
- `payments` → `orders` (RESTRICT)
- `reviews` → `users/products` (RESTRICT)

### Validaciones
- Rating en reviews: 1-5 estrellas
- Códigos de verificación: exactamente 6 dígitos
- Emails únicos y válidos

## 📋 Datos Iniciales (Seed)

### Usuario Administrador
```sql
Email: admin@astrocore.com
Nombre: Admin AstroCore
Rol: SUPER_ADMIN
Email Verificado: true
```

### Categorías Base
- Tecnología (cat-tech)
- Laptops (cat-laptops)
- Accesorios (cat-accessories)

### Productos de Ejemplo
3 laptops con datos reales alineados con el frontend:
- Laptop 1: $1,200 (descuento desde $1,400)
- Laptop 2: $900 (descuento desde $1,000)
- Laptop 3: $1,100 (sin descuento)

## 🔍 Consultas Útiles

### Verificar Instalación
```sql
-- Ver todas las tablas
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Contar registros por tabla
SELECT 
    schemaname,
    tablename,
    n_tup_ins as "Registros"
FROM pg_stat_user_tables 
WHERE schemaname = 'public';
```

### Consultas de Desarrollo
```sql
-- Ver usuarios
SELECT id, email, "firstName", "lastName", role, "emailVerified" FROM users;

-- Ver productos con descuento
SELECT name, price, "oldPrice", "haveDiscount" 
FROM products 
WHERE "haveDiscount" = true;

-- Ver códigos de verificación activos
SELECT email, code, type, "expiresAt" 
FROM verification_codes 
WHERE "isUsed" = false AND "expiresAt" > NOW();
```

### Mantenimiento
```sql
-- Limpiar códigos expirados
DELETE FROM verification_codes 
WHERE "expiresAt" < NOW() OR "isUsed" = true;

-- Ver estadísticas de tablas
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables 
WHERE schemaname = 'public';
```

## 🚨 Troubleshooting

### Problemas Comunes

#### Error de Conexión
```bash
# Verificar que PostgreSQL esté corriendo
pg_isready -h localhost -p 5432

# Iniciar PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS
```

#### Error de Permisos
```sql
-- Otorgar permisos completos
GRANT ALL PRIVILEGES ON DATABASE ecommerce_astrocore TO astrocore_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO astrocore_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO astrocore_user;
```

#### Error de Encoding
```sql
-- Verificar encoding
SELECT datname, encoding FROM pg_database WHERE datname = 'ecommerce_astrocore';

-- Debe ser UTF8 (6)
```

### Logs de PostgreSQL
```bash
# Ubuntu/Debian
sudo tail -f /var/log/postgresql/postgresql-*.log

# CentOS/RHEL
sudo tail -f /var/lib/pgsql/data/log/postgresql-*.log

# macOS (Homebrew)
tail -f /usr/local/var/log/postgresql@14.log
```

## 📚 Recursos Adicionales

- [Documentación PostgreSQL](https://www.postgresql.org/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Datafast API Documentation](https://developers.datafast.com.ec/)

## 🔄 Migraciones Futuras

Para cambios en el esquema, usar Prisma:

```bash
# Generar migración
npx prisma migrate dev --name descripcion_cambio

# Aplicar migraciones en producción
npx prisma migrate deploy

# Reset completo (solo desarrollo)
npx prisma migrate reset
```

---

**Creado:** 25/08/2025  
**Versión:** 1.0  
**Compatible con:** PostgreSQL 14+
