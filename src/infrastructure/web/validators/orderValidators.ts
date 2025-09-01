import { z } from 'zod';
import { OrderStatus } from '../../../domain/entities/Order';

export const createOrderSchema = z.object({
  shippingAddressId: z.string().optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional()
});

export const getOrdersQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).pipe(z.number().min(1)),
  limit: z.string().transform(val => parseInt(val) || 10).pipe(z.number().min(1).max(100))
});

export const orderIdSchema = z.object({
  id: z.string().min(1, 'Order ID is required')
});

export type CreateOrderRequest = z.infer<typeof createOrderSchema>;
export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;
export type OrderIdParams = z.infer<typeof orderIdSchema>;
