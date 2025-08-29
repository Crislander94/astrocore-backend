import { CartRepository } from '../../../domain/repositories/CartRepository';
import { CartSummary } from '../../../domain/entities/CartItem';

export class GetCartUseCase {
  constructor(private cartRepository: CartRepository) {}

  async execute(userId: string): Promise<CartSummary> {
    const items = await this.cartRepository.getCartItems(userId);
    
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const tax = items.reduce((sum, item) => {
      if (item.iva) {
        return sum + (item.product.price * item.quantity * 0.15); // 15% IVA Ecuador
      }
      return sum;
    }, 0);

    const total = subtotal + tax;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      subtotal,
      tax,
      total,
      itemCount
    };
  }
}
