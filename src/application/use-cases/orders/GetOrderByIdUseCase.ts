import { OrderRepository } from '../../../domain/repositories/OrderRepository';
import { OrderWithDetails } from '../../../domain/entities/Order';

export class GetOrderByIdUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(orderId: string, userId: string, isAdmin: boolean = false): Promise<OrderWithDetails> {
    const order = await this.orderRepository.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    // Verificar ownership (solo admin puede ver órdenes de otros usuarios)
    if (!isAdmin && order.userId !== userId) {
      throw new Error('Access denied');
    }

    return order;
  }
}
