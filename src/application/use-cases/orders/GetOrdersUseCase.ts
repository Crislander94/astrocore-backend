import { OrderRepository } from '../../../domain/repositories/OrderRepository';
import { OrderWithDetails } from '../../../domain/entities/Order';

export class GetOrdersUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(userId: string, page: number = 1, limit: number = 10): Promise<{
    orders: OrderWithDetails[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = await this.orderRepository.findByUserId(userId, page, limit);
    
    return {
      orders: result.orders,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    };
  }
}
