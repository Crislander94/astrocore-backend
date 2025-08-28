import { ProductRepository } from '../../../domain/repositories/ProductRepository';

export class DeleteProductUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(id: number): Promise<boolean> {
    return await this.productRepository.delete(id);
  }
}
