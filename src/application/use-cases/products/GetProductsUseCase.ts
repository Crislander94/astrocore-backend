import { Product } from '../../../domain/entities/Product';
import { ProductRepository, ProductFilters } from '../../../domain/repositories/ProductRepository';

export interface GetProductsRequest {
  filters?: ProductFilters;
  page?: number;
  limit?: number;
}

export interface GetProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export class GetProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(request: GetProductsRequest = {}): Promise<GetProductsResponse> {
    const { filters, page = 1, limit = 10 } = request;
    
    return await this.productRepository.findAll(filters, page, limit);
  }
}
