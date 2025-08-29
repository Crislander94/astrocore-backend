import { OrderRepository } from '../../../domain/repositories/OrderRepository';
import { Order, OrderStatus } from '../../../domain/entities/Order';

export class UpdateOrderStatusUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(orderId: string, status: OrderStatus): Promise<Order> {
    // Verificar que la orden existe
    const existingOrder = await this.orderRepository.findById(orderId);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // Validar transición de estado
    this.validateStatusTransition(existingOrder.status, status);

    return await this.orderRepository.updateStatus(orderId, status);
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: []
    };

    const allowedStatuses = validTransitions[currentStatus] || [];
    
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }
}
