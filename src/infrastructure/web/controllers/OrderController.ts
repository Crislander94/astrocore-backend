import { Request, Response } from 'express';
import { CreateOrderUseCase } from '../../../application/use-cases/orders/CreateOrderUseCase';
import { GetOrdersUseCase } from '../../../application/use-cases/orders/GetOrdersUseCase';
import { GetOrderByIdUseCase } from '../../../application/use-cases/orders/GetOrderByIdUseCase';
import { UpdateOrderStatusUseCase } from '../../../application/use-cases/orders/UpdateOrderStatusUseCase';

export class OrderController {
  constructor(
    private createOrderUseCase: CreateOrderUseCase,
    private getOrdersUseCase: GetOrdersUseCase,
    private getOrderByIdUseCase: GetOrderByIdUseCase,
    private updateOrderStatusUseCase: UpdateOrderStatusUseCase
  ) {}

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { shippingAddressId, notes } = req.body;
      const order = await this.createOrderUseCase.execute(userId, shippingAddressId, notes);
      res.status(201).json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create order';
      res.status(400).json({ error: message });
    }
  }

  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { page, limit } = req.query as any;
      const result = await this.getOrdersUseCase.execute(userId, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get orders' });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const order = await this.getOrderByIdUseCase.execute(id, userId, isAdmin);
      res.json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get order';
      const status = message === 'Order not found' ? 404 : 
                    message === 'Access denied' ? 403 : 500;
      res.status(status).json({ error: message });
    }
  }

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const order = await this.updateOrderStatusUseCase.execute(id, status);
      res.json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update order status';
      const statusCode = message === 'Order not found' ? 404 : 400;
      res.status(statusCode).json({ error: message });
    }
  }
}
