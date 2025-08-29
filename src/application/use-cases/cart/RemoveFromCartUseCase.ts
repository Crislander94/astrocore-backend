import { CartRepository } from '../../../domain/repositories/CartRepository';

export class RemoveFromCartUseCase {
  constructor(private cartRepository: CartRepository) {}

  async execute(userId: string, productId: number): Promise<void> {
    await this.cartRepository.removeItem(userId, productId);
  }
}
