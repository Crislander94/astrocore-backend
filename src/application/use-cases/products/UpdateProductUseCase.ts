import { Product } from '../../../domain/entities/Product';
import { ProductRepository } from '../../../domain/repositories/ProductRepository';

export interface UpdateProductRequest {
  name?: string;
  slug?: string;
  descripcion?: string;
  shortDesc?: string;
  sku?: string;
  price?: number;
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

export class UpdateProductUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(id: number, request: UpdateProductRequest): Promise<Product | null> {
    return await this.productRepository.update(id, request);
  }
}
