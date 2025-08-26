-- =====================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS - ECOMMERCE ASTROCORE
-- Fecha: 25/08/2025
-- Descripción: Base de datos para ecommerce con autenticación passwordless
-- =====================================================

-- Crear base de datos (ejecutar como superusuario)
-- CREATE DATABASE ecommerce_astrocore;
-- CREATE USER astrocore_user WITH PASSWORD 'secure_password_2025';
-- GRANT ALL PRIVILEGES ON DATABASE ecommerce_astrocore TO astrocore_user;

-- Conectar a la base de datos ecommerce_astrocore
\c ecommerce_astrocore;

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "VerificationCodeType" AS ENUM ('LOGIN', 'REGISTER', 'PASSWORD_RESET');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- =====================================================
-- TABLA: users
-- =====================================================

CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "email" TEXT NOT NULL UNIQUE,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Índices para users
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- =====================================================
-- TABLA: verification_codes
-- =====================================================

CREATE TABLE "verification_codes" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "email" TEXT NOT NULL,
    "code" CHAR(6) NOT NULL,
    "type" "VerificationCodeType" NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- Índices para verification_codes
CREATE INDEX "verification_codes_email_type_idx" ON "verification_codes"("email", "type");
CREATE INDEX "verification_codes_expiresAt_idx" ON "verification_codes"("expiresAt");

-- =====================================================
-- TABLA: categories
-- =====================================================

CREATE TABLE "categories" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- Índices para categories
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE INDEX "categories_parentId_idx" ON "categories"("parentId");
CREATE INDEX "categories_isActive_idx" ON "categories"("isActive");

-- =====================================================
-- TABLA: products
-- =====================================================

CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "descripcion" TEXT,
    "shortDesc" TEXT,
    "sku" TEXT NOT NULL UNIQUE,
    "price" DECIMAL(10,2) NOT NULL,
    "oldPrice" DECIMAL(10,2),
    "haveDiscount" BOOLEAN NOT NULL DEFAULT false,
    "cost" DECIMAL(10,2),
    "trackQuantity" BOOLEAN NOT NULL DEFAULT true,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "weight" DECIMAL(8,2),
    "dimensions" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- Índices para products
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX "products_status_idx" ON "products"("status");
CREATE INDEX "products_isActive_idx" ON "products"("isActive");
CREATE INDEX "products_isFeatured_idx" ON "products"("isFeatured");
CREATE INDEX "products_price_idx" ON "products"("price");

-- =====================================================
-- TABLA: product_variants
-- =====================================================

CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "price" DECIMAL(10,2),
    "sku" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- Índices para product_variants
CREATE INDEX "product_variants_productId_idx" ON "product_variants"("productId");

-- =====================================================
-- TABLA: addresses
-- =====================================================

CREATE TABLE "addresses" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "company" TEXT,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'EC',
    "phone" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "instructions" TEXT,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- Índices para addresses
CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");

-- =====================================================
-- TABLA: cart_items
-- =====================================================

CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "iva" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- Índices para cart_items
CREATE UNIQUE INDEX "cart_items_userId_productId_key" ON "cart_items"("userId", "productId");
CREATE INDEX "cart_items_userId_idx" ON "cart_items"("userId");
CREATE INDEX "cart_items_productId_idx" ON "cart_items"("productId");

-- =====================================================
-- TABLA: orders
-- =====================================================

CREATE TABLE "orders" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "orderNumber" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "shipping" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "shippingAddressId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- Índices para orders
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE INDEX "orders_userId_idx" ON "orders"("userId");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_paymentStatus_idx" ON "orders"("paymentStatus");
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- =====================================================
-- TABLA: order_items
-- =====================================================

CREATE TABLE "order_items" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "orderId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- Índices para order_items
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- =====================================================
-- TABLA: payments
-- =====================================================

CREATE TABLE "payments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "orderId" TEXT NOT NULL,
    "transactionId" TEXT,
    "datafastReference" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" TEXT NOT NULL DEFAULT 'datafast',
    "gateway" TEXT NOT NULL DEFAULT 'datafast',
    "gatewayResponse" JSONB,
    "failureReason" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- Índices para payments
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");
CREATE UNIQUE INDEX "payments_datafastReference_key" ON "payments"("datafastReference");
CREATE INDEX "payments_orderId_idx" ON "payments"("orderId");
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- =====================================================
-- TABLA: reviews
-- =====================================================

CREATE TABLE "reviews" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
    "title" TEXT,
    "comment" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- Índices para reviews
CREATE UNIQUE INDEX "reviews_userId_productId_key" ON "reviews"("userId", "productId");
CREATE INDEX "reviews_productId_idx" ON "reviews"("productId");
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- =====================================================
-- FOREIGN KEYS (RELACIONES)
-- =====================================================

-- verification_codes -> users
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_email_fkey" 
    FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- categories (auto-referencia para jerarquía)
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" 
    FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- products -> categories
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" 
    FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- product_variants -> products
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" 
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- addresses -> users
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- cart_items -> users
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- cart_items -> products
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" 
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- orders -> users
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- orders -> addresses
ALTER TABLE "orders" ADD CONSTRAINT "orders_shippingAddressId_fkey" 
    FOREIGN KEY ("shippingAddressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- order_items -> orders
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" 
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- order_items -> products
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" 
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- payments -> orders
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" 
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- reviews -> users
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- reviews -> products
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_productId_fkey" 
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas las tablas con updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON "categories" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON "products" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON "cart_items" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON "orders" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON "payments" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON "reviews" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS INICIALES (SEED)
-- =====================================================

-- Usuario administrador
INSERT INTO "users" ("id", "email", "firstName", "lastName", "role", "isActive", "emailVerified") 
VALUES (
    gen_random_uuid()::TEXT,
    'admin@astrocore.com',
    'Admin',
    'AstroCore',
    'SUPER_ADMIN',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Categorías principales
INSERT INTO "categories" ("id", "name", "slug", "description", "isActive") VALUES
    ('cat-tech', 'Tecnología', 'tecnologia', 'Productos tecnológicos y electrónicos', true),
    ('cat-laptops', 'Laptops', 'laptops', 'Computadoras portátiles', true),
    ('cat-accessories', 'Accesorios', 'accesorios', 'Accesorios para computadoras', true)
ON CONFLICT (name) DO NOTHING;

-- Productos de ejemplo (alineados con frontend)
INSERT INTO "products" (
    "name", "slug", "descripcion", "sku", "price", "oldPrice", "haveDiscount", 
    "images", "category", "quantity", "isActive", "isFeatured", "categoryId"
) VALUES
    (
        'Laptop 1',
        'laptop-1',
        '<p><strong>Perfecta para TODAS estas actividades:</strong></p><ul><li>Universidad, Colegio, oficina</li><li>Navegar en internet</li><li>Crear documentos</li><li>Ver Netflix</li></ul>',
        'LAP-001',
        1200.00,
        1400.00,
        true,
        ARRAY['/src/assets/products/laptop_1.png', '/src/assets/products/laptop_2.png'],
        'technology',
        10,
        true,
        true,
        'cat-laptops'
    ),
    (
        'Laptop 2',
        'laptop-2',
        'Ideal para estudiantes y profesionales.',
        'LAP-002',
        900.00,
        1000.00,
        true,
        ARRAY['/src/assets/products/laptop_1.png', '/src/assets/products/laptop_2.png'],
        'technology',
        15,
        true,
        false,
        'cat-laptops'
    ),
    (
        'Laptop 3',
        'laptop-3',
        'Ligera y portátil con gran batería.',
        'LAP-003',
        1100.00,
        1100.00,
        false,
        ARRAY['/src/assets/products/laptop_1.png', '/src/assets/products/laptop_2.png'],
        'technology',
        8,
        true,
        false,
        'cat-laptops'
    )
ON CONFLICT (sku) DO NOTHING;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON DATABASE ecommerce_astrocore IS 'Base de datos para ecommerce AstroCore con autenticación passwordless';

COMMENT ON TABLE "users" IS 'Usuarios del sistema con autenticación passwordless';
COMMENT ON TABLE "verification_codes" IS 'Códigos de verificación de 6 dígitos para autenticación';
COMMENT ON TABLE "categories" IS 'Categorías de productos con soporte jerárquico';
COMMENT ON TABLE "products" IS 'Catálogo de productos alineado con frontend';
COMMENT ON TABLE "cart_items" IS 'Items del carrito de compras con soporte para IVA';
COMMENT ON TABLE "orders" IS 'Órdenes de compra con estados y seguimiento';
COMMENT ON TABLE "payments" IS 'Pagos procesados con Datafast';
COMMENT ON TABLE "reviews" IS 'Reseñas y calificaciones de productos';

-- =====================================================
-- PERMISOS
-- =====================================================

-- Otorgar permisos al usuario de la aplicación
GRANT USAGE ON SCHEMA public TO astrocore_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO astrocore_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO astrocore_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO astrocore_user;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Verificar la creación de tablas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Mostrar información de la base de datos
SELECT 
    'Base de datos creada exitosamente' as status,
    current_database() as database_name,
    current_user as connected_user,
    version() as postgresql_version;
