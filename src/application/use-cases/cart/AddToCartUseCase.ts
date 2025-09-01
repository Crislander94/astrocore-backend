import { CartRepository } from '../../../domain/repositories/CartRepository';
import { ProductRepository } from '../../../domain/repositories/ProductRepository';
import { CartItem, CartItemEntity } from '../../../domain/entities/CartItem';

export class AddToCartUseCase {
  constructor(
    private cartRepository: CartRepository,
    private productRepository: ProductRepository
  ) {}

  async execute(userId: string, productId: number, quantity: number = 1, iva: boolean = true): Promise<CartItem> {
    // Validar cantidad usando Entity Class
    if (!CartItemEntity.validateQuantity(quantity)) {
      throw new Error('Cantidad debe estar entre 1 y 99');
    }

    // Verificar que el producto existe y está activo
    const product = await this.productRepository.findById(productId);
    if (!product || !product.isActive) {
      throw new Error('Product not found or inactive');
    }

    //TODO: Verificar stock disponible
    // if (product.trackQuantity && product.quantity < quantity) {
    //   throw new Error('Insufficient stock');
    // }

    // Verificar si el item ya existe en el carrito
    const existingItem = await this.cartRepository.findByUserAndProduct(userId, productId);
    if (existingItem) {
      const cartItemEntity = new CartItemEntity(
        existingItem.id,
        existingItem.userId,
        existingItem.productId,
        existingItem.quantity,
        existingItem.iva,
        existingItem.createdAt,
        existingItem.updatedAt
      );

      // Verificar si se puede agregar más cantidad
      if (!cartItemEntity.canAddQuantity(quantity)) {
        throw new Error('No se puede agregar más cantidad. Máximo 99 items por producto');
      }

      // Actualizar cantidad existente
      const updatedEntity = cartItemEntity.updateQuantity(existingItem.quantity + quantity);
      return await this.cartRepository.updateQuantity(userId, productId, updatedEntity.quantity);
    }

    return await this.cartRepository.addItem(userId, productId, quantity, iva);
  }
}
