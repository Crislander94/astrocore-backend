import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.number().int().positive('Product ID must be a positive integer'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
  iva: z.boolean().optional().default(true)
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100')
});

export const removeFromCartSchema = z.object({
  productId: z.number().int().positive('Product ID must be a positive integer')
});

export type AddToCartRequest = z.infer<typeof addToCartSchema>;
export type UpdateCartItemRequest = z.infer<typeof updateCartItemSchema>;
export type RemoveFromCartRequest = z.infer<typeof removeFromCartSchema>;
