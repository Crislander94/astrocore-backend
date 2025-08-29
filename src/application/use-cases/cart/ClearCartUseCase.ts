import { CartRepository } from '../../../domain/repositories/CartRepository';

export class ClearCartUseCase {
  constructor(private cartRepository: CartRepository) {}

  async execute(userId: string): Promise<void> {
    await this.cartRepository.clearCart(userId);
  }
}
