import { CartRepository } from '../../../domain/repositories/CartRepository';
import { CartSummary, CartSummaryEntity } from '../../../domain/entities/CartItem';

export class GetCartUseCase {
  constructor(private cartRepository: CartRepository) {}

  async execute(userId: string): Promise<CartSummary> {
    const items = await this.cartRepository.getCartItems(userId);
    
    // Usar la Entity Class para calcular totales con lógica de negocio
    const cartSummary = CartSummaryEntity.fromItems(items);
    
    return {
      items: cartSummary.items,
      subtotal: cartSummary.subtotal,
      tax: cartSummary.tax,
      total: cartSummary.total,
      itemCount: cartSummary.itemCount
    };
  }
}
