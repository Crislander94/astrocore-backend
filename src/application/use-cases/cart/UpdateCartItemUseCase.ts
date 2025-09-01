import { CartRepository } from '../../../domain/repositories/CartRepository';
import { ProductRepository } from '../../../domain/repositories/ProductRepository';
import { CartItem, CartItemEntity } from '../../../domain/entities/CartItem';

export class UpdateCartItemUseCase {
  constructor(
    private cartRepository: CartRepository,
    private productRepository: ProductRepository
  ) {}

  async execute(userId: string, productId: number, quantity: number): Promise<CartItem> {
    // Validar cantidad usando Entity Class
    if (!CartItemEntity.validateQuantity(quantity)) {
      throw new Error('Cantidad debe estar entre 1 y 99');
    }

    // Verificar que el item existe en el carrito
    const existingItem = await this.cartRepository.findByUserAndProduct(userId, productId);
    if (!existingItem) {
      throw new Error('Item not found in cart');
    }

    // Verificar stock disponible
    const product = await this.productRepository.findById(productId);
    if (product?.trackQuantity && product.quantity < quantity) {
      throw new Error('Insufficient stock');
    }

    // Usar Entity Class para actualizar
    const cartItemEntity = new CartItemEntity(
      existingItem.id,
      existingItem.userId,
      existingItem.productId,
      existingItem.quantity,
      existingItem.iva,
      existingItem.createdAt,
      existingItem.updatedAt
    );

    const updatedEntity = cartItemEntity.updateQuantity(quantity);
    return await this.cartRepository.updateQuantity(userId, productId, updatedEntity.quantity);
  }
}
