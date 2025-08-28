import { Product } from '../../../domain/entities/Product';
import { ProductRepository } from '../../../domain/repositories/ProductRepository';

export interface CreateProductRequest {
  name: string;
  slug: string;
  descripcion?: string;
  shortDesc?: string;
  sku: string;
  price: number;
  oldPrice?: number;
  haveDiscount?: boolean;
  cost?: number;
  trackQuantity?: boolean;
  quantity?: number;
  weight?: number;
  dimensions?: string;
  status?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  images?: string[];
  tags?: string[];
  category?: string;
  metaTitle?: string;
  metaDesc?: string;
}

export class CreateProductUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(request: CreateProductRequest): Promise<Product> {
    const productData = {
      ...request,
      haveDiscount: request.haveDiscount ?? false,
      trackQuantity: request.trackQuantity ?? true,
      quantity: request.quantity ?? 0,
      isActive: request.isActive ?? true,
      isFeatured: request.isFeatured ?? false,
      images: request.images ?? [],
      tags: request.tags ?? [],
    };

    return await this.productRepository.create(productData);
  }
}
