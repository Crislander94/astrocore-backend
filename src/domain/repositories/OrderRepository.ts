import { Order, OrderWithDetails, OrderStatus } from '../entities/Order';

export interface CreateOrderData {
  userId: string;
  orderNumber: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddressId?: string;
  notes?: string;
  items: {
    productId: number;
    quantity: number;
    price: number;
    total: number;
  }[];
}

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
