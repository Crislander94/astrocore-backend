import { OrderRepository } from '../../../domain/repositories/OrderRepository';
import { CartRepository } from '../../../domain/repositories/CartRepository';
import { Order } from '../../../domain/entities/Order';

export class CreateOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private cartRepository: CartRepository
  ) {}

  async execute(userId: string, shippingAddressId: string | null, notes: string | null): Promise<Order> {
    // Obtener items del carrito
    const cartItems = await this.cartRepository.getCartItems(userId);
    
    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validar que shippingAddressId existe si se proporciona
    if (shippingAddressId) {
      const addressExists = await this.orderRepository.validateAddressExists(shippingAddressId, userId);
      if (!addressExists) {
        throw new Error('Shipping address not found or does not belong to user');
      }
    }

    // Verificar que todos los productos estén activos y con stock
    for (const item of cartItems) {
      if (!item.product.isActive) {
        throw new Error(`Product ${item.product.name} is not available`);
      }
      if (item.product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product.name}`);
      }
    }
    // Calcular totales
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const tax = cartItems.reduce((sum, item) => {
      if (item.iva) {
        return sum + (item.product.price * item.quantity * 0.15); // 15% IVA Ecuador
      }
      return sum;
    }, 0);

    const shipping = 0.00; // Costo fijo de envío
    const discount = 0; // Sin descuentos por ahora
    const total = subtotal + tax + shipping - discount;

    // Generar número de orden
    const orderNumber = await this.orderRepository.generateOrderNumber();

    // Preparar items de la orden
    const orderItems = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
      total: item.product.price * item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        images: item.product.images
      }
    }));

    // Crear orden
    const order = await this.orderRepository.create({
      userId,
      orderNumber,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      shippingAddressId,
      notes,
      items: orderItems
    });

    // Limpiar carrito
    await this.cartRepository.clearCart(userId);

    return order;
  }
}
