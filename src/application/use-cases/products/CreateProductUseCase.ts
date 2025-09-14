import { Prisma } from '@prisma/client';
import { Product } from '../../../domain/entities/Product';
import { ProductRepository } from '../../../domain/repositories/ProductRepository';
import { z } from 'zod';

export const CreateProductRequestSchema = z.object({
  name: z.string(),
  slug: z.string(),
  descripcion: z.string().nullable(),
  shortDesc: z.string().nullable(),
  sku: z.string(),
  price: z.instanceof(Prisma.Decimal),
  oldPrice: z.instanceof(Prisma.Decimal).nullable(),
  haveDiscount: z.boolean().nullable(),
  cost: z.instanceof(Prisma.Decimal).nullable(),
  trackQuantity: z.boolean().nullable(),
  quantity: z.number().nullable(),
  weight: z.instanceof(Prisma.Decimal).nullable(),
  dimensions: z.string().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  isActive: z.boolean().nullable(),
  isFeatured: z.boolean().nullable(),
  images: z.array(z.string()).nullable(),
  tags: z.array(z.string()).nullable(),
  category: z.string().nullable(),
  metaTitle: z.string().nullable(),
  metaDesc: z.string().nullable(),
});

export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;

export class CreateProductUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(request: CreateProductRequest): Promise<Product> {
    const productData = {
      ...request,
      descripcion: request.descripcion ?? '',
      haveDiscount: request.haveDiscount ?? false,
      trackQuantity: request.trackQuantity ?? true,
      quantity: request.quantity ?? 0,
      isActive: request.isActive ?? true,
      isFeatured: request.isFeatured ?? false,
      images: request.images,
      tags: request.tags ?? [],
    };

    return await this.productRepository.create(productData);
  }
}
