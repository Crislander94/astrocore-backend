import { PrismaClient } from '@prisma/client';
import { logger } from '@/shared/utils/logger.js';

const prisma = new PrismaClient();

async function main() {
  logger.info('🌱 Starting database seeding...');

  try {
    // Crear usuario administrador
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@astrocore.com' },
      update: {},
      create: {
        email: 'admin@astrocore.com',
        firstName: 'Admin',
        lastName: 'AstroCore',
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true,
      },
    });

    logger.info(`✅ Admin user created: ${adminUser.email}`);

    // Crear categorías
    const categories = [
      {
        id: 'tech-category',
        name: 'Tecnología',
        slug: 'tecnologia',
        description: 'Productos tecnológicos y electrónicos',
        isActive: true,
      },
      {
        id: 'laptops-category',
        name: 'Laptops',
        slug: 'laptops',
        description: 'Computadoras portátiles',
        isActive: true,
      },
    ];

    for (const category of categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: {},
        create: category,
      });
    }

    logger.info('✅ Categories created');

    // Crear productos de ejemplo (alineados con el frontend)
    const products = [
      {
        name: 'Laptop 1',
        slug: 'laptop-1',
        descripcion: `<p><strong>Perfecta para TODAS estas actividades:</strong></p>
        <ul>
            <li>Universidad, Colegio, oficina</li>
            <li>Navegar en internet</li>
            <li>Crear documentos</li>
            <li>Hacer tablas en Excel</li>
            <li>Ver videos en youtube</li>
            <li>Ver Netflix</li>
            <li>Diapositivas Power Point</li>
            <li>Ver películas y más....</li>
        </ul>
        <p><strong>✅ Aquí tienes Características ✅</strong></p>
        <ul>
            <li>12 pulgadas</li>
            <li>4 GB de RAM</li>
            <li>16 GB de almacenamiento (expandible hasta 256 GB Micro SD)</li>
            <li>Procesador: INTEL CELERON CPU N3450</li>
        </ul>
        <p><strong>🎁 REGALO SORPRESA 🎁</strong></p>
        <ul>
            <li>ENVÍOS GRATIS</li>
            <li>UN AÑO DE GARANTÍA Y SERVICIO TÉCNICO</li>
        </ul>`,
        sku: 'LAP-001',
        price: 1200,
        oldPrice: 1400,
        haveDiscount: true,
        images: [
          '/src/assets/products/laptop_1.png',
          '/src/assets/products/laptop_2.png',
        ],
        category: 'technology',
        quantity: 10,
        isActive: true,
        isFeatured: true,
        categoryId: 'laptops-category',
      },
      {
        name: 'Laptop 2',
        slug: 'laptop-2',
        descripcion: 'Ideal para estudiantes y profesionales.',
        sku: 'LAP-002',
        price: 900,
        oldPrice: 1000,
        haveDiscount: true,
        images: [
          '/src/assets/products/laptop_1.png',
          '/src/assets/products/laptop_2.png',
        ],
        category: 'technology',
        quantity: 15,
        isActive: true,
        categoryId: 'laptops-category',
      },
      {
        name: 'Laptop 3',
        slug: 'laptop-3',
        descripcion: 'Ligera y portátil con gran batería.',
        sku: 'LAP-003',
        price: 1100,
        oldPrice: 1100,
        haveDiscount: false,
        images: [
          '/src/assets/products/laptop_1.png',
          '/src/assets/products/laptop_2.png',
        ],
        category: 'technology',
        quantity: 8,
        isActive: true,
        categoryId: 'laptops-category',
      },
    ];

    for (const product of products) {
      await prisma.product.upsert({
        where: { sku: product.sku },
        update: {},
        create: product,
      });
    }

    logger.info('✅ Products created');

    logger.info('🎉 Database seeding completed successfully!');
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    logger.error('Seed script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
