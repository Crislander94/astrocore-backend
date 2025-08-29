import { CartRepository } from '../../../domain/repositories/CartRepository';
import { ProductRepository } from '../../../domain/repositories/ProductRepository';
import { CartItem } from '../../../domain/entities/CartItem';

export class AddToCartUseCase {
  constructor(
    private cartRepository: CartRepository,
    private productRepository: ProductRepository
  ) {}

  async execute(userId: string, productId: number, quantity: number = 1, iva: boolean = true): Promise<CartItem> {
    // Verificar que el producto existe y está activo
    const product = await this.productRepository.findById(productId);
    if (!product || !product.isActive) {
      throw new Error('Product not found or inactive');
    }

    // Verificar stock disponible
    if (product.trackQuantity && product.quantity < quantity) {
      throw new Error('Insufficient stock');
    }

    return await this.cartRepository.addItem(userId, productId, quantity, iva);
  }
}
