import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  slug: z.string().min(1, 'El slug es requerido').max(255),
  descripcion: z.string().optional(),
  shortDesc: z.string().optional(),
  sku: z.string().min(1, 'El SKU es requerido').max(100),
  price: z.number().positive('El precio debe ser positivo'),
  oldPrice: z.number().positive().optional(),
  haveDiscount: z.boolean().optional(),
  cost: z.number().positive().optional(),
  trackQuantity: z.boolean().optional(),
  quantity: z.number().int().min(0).optional(),
  weight: z.number().positive().optional(),
  dimensions: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  images: z.array(z.string().url('URL de imagen inválida')).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const getProductsQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
  maxPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
  available: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
  search: z.string().optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
});

export const productIdSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
});
