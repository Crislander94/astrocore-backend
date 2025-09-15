import { Order, OrderWithDetails, OrderStatus } from '../entities/Order';
import { z } from 'zod';

export const CreateOrderDataSchema = z.object({
  userId: z.string(),
  orderNumber: z.string(),
  subtotal: z.number(),
  tax: z.number(),
  shipping: z.number(),
  discount: z.number(),
  total: z.number(),
  shippingAddressId: z.string().nullable(),
  notes: z.string().nullable(),
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number(),
      price: z.number(),
      total: z.number(),
      product: z.object({
        id: z.number(),
        name: z.string(),
        images: z.array(z.string()).nullable()
      })
    })
  ),
});

export type CreateOrderData = z.infer<typeof CreateOrderDataSchema>;

export interface OrderRepository {
  create(data: CreateOrderData): Promise<Order>;
  findById(id: string): Promise<OrderWithDetails | null>;
  findByUserId(userId: string, page: number, limit: number): Promise<{
    orders: OrderWithDetails[];
    total: number;
  }>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
  generateOrderNumber(): Promise<string>;
  validateAddressExists(addressId: string, userId: string): Promise<boolean>;
}
