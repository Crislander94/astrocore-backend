import { Prisma } from '@prisma/client';
import { z } from 'zod';

// Schema que coincide exactamente con el frontend
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  descripcion: z.string().nullable(),
  price: z.instanceof(Prisma.Decimal),
  images: z.array(z.string()).nullable(),
  haveDiscount: z.boolean().default(false),
  oldPrice: z.instanceof(Prisma.Decimal).nullable(),
  category: z.string().nullable(),
});

// Schema extendido para el backend con campos adicionales
export const productBackendSchema = productSchema.extend({
  slug: z.string(),
  shortDesc: z.string().nullable(),
  sku: z.string(),
  cost: z.instanceof(Prisma.Decimal).nullable(),
  trackQuantity: z.boolean().default(true),
  quantity: z.number().default(0),
  weight: z.instanceof(Prisma.Decimal).nullable(),
  dimensions: z.string().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().nullable(),
  metaDesc: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema para crear producto
export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  descripcion: z.string().nullable(),
  price: z.number().positive('Price must be positive'),
  oldPrice: z.number().positive().nullable(),
  haveDiscount: z.boolean().default(false),
  images: z.array(z.string()).nullable(),
  category: z.string().nullable(),
  sku: z.string().min(1, 'SKU is required'),
  quantity: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

// Schema para actualizar producto
export const updateProductSchema = createProductSchema.partial();

// Schema para listado de productos con paginación
export const productListSchema = z.object({
  products: z.array(productSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Schema para filtros de productos
export const productFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  category: z.string().nullable(),
  search: z.string().nullable(),
  minPrice: z.number().nullable(),
  maxPrice: z.number().nullable(),
  haveDiscount: z.boolean().nullable(),
  isActive: z.boolean().default(true),
  sortBy: z.enum(['name', 'price', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Types
export type Product = z.infer<typeof productSchema>;
export type ProductBackend = z.infer<typeof productBackendSchema>;
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type ProductList = z.infer<typeof productListSchema>;
export type ProductFilters = z.infer<typeof productFiltersSchema>;

// Product Entity Class
export class ProductEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly descripcion: string,
    public readonly price: number,
    public readonly images?: string[],
    public readonly haveDiscount: boolean = false,
    public readonly oldPrice?: number,
    public readonly category?: string,
    public readonly slug?: string,
    public readonly sku?: string,
    public readonly quantity: number = 0,
    public readonly isActive: boolean = true,
    public readonly isFeatured: boolean = false,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  // Método para calcular precio con descuento
  getDiscountedPrice(): number {
    if (this.haveDiscount && this.oldPrice) {
      return this.price;
    }
    return this.price;
  }

  // Método para calcular porcentaje de descuento
  getDiscountPercentage(): number {
    if (this.haveDiscount && this.oldPrice && this.oldPrice > this.price) {
      return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
    }
    return 0;
  }

  // Método para verificar si está en stock
  isInStock(): boolean {
    return this.quantity > 0;
  }
}
