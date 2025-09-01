import { PrismaClient } from '@prisma/client';
import { Product } from '../../../domain/entities/Product';
import { ProductRepository, ProductFilters } from '../../../domain/repositories/ProductRepository';

export class PrismaProductRepository implements ProductRepository {
  constructor(private prisma: PrismaClient) {}

  async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return await this.prisma.product.create({
      data: productData,
    });
  }

  private convertDecimalFields(product: any): Product {
    return {
      ...product,
      price: product.price ? Number(product.price) : product.price,
      oldPrice: product.oldPrice ? Number(product.oldPrice) : product.oldPrice,
      cost: product.cost ? Number(product.cost) : product.cost,
      weight: product.weight ? Number(product.weight) : product.weight,
    };
  }

  async findById(id: number): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    console.log('Producto encontrado:', product);
    return product ? this.convertDecimalFields(product) : null;
  }

  async findAll(
    filters: ProductFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.minPrice !== undefined) {
      where.price = { ...where.price, gte: filters.minPrice };
    }
    if (filters.maxPrice !== undefined) {
      where.price = { ...where.price, lte: filters.maxPrice };
    }
    if (filters.available !== undefined) {
      where.isActive = filters.available;
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { descripcion: { contains: filters.search, mode: 'insensitive' } },
        { shortDesc: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);
    return {
      products: products.map(product => this.convertDecimalFields(product)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: number,
    productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Product | null> {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: productData,
      });
    } catch (error) {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.product.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async updateStock(id: number, quantity: number): Promise<Product | null> {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: { quantity },
      });
    } catch (error) {
      return null;
    }
  }
}
