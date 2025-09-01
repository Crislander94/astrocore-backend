import { ProductBackend as Product } from '../entities/Product';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  search?: string;
}

export interface ProductRepository {
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  findById(id: number): Promise<Product | null>;
  findAll(filters?: ProductFilters, page?: number, limit?: number): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  update(id: number, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product | null>;
  delete(id: number): Promise<boolean>;
  updateStock(id: number, quantity: number): Promise<Product | null>;
}
