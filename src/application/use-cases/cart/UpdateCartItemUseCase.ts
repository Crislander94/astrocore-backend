import { CartRepository } from '../../../domain/repositories/CartRepository';
import { ProductRepository } from '../../../domain/repositories/ProductRepository';
import { CartItem } from '../../../domain/entities/CartItem';

export class UpdateCartItemUseCase {
  constructor(
    private cartRepository: CartRepository,
    private productRepository: ProductRepository
  ) {}

  async execute(userId: string, productId: number, quantity: number): Promise<CartItem> {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    //TODO: Verificar stock disponible
    // const product = await this.productRepository.findById(productId);

    return await this.cartRepository.updateQuantity(userId, productId, quantity);
  }
}
