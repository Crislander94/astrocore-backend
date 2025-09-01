import { CartItem, CartItemWithProduct } from '../entities/CartItem';

export interface CartRepository {
  addItem(userId: string, productId: number, quantity: number, iva?: boolean): Promise<CartItem>;
  updateQuantity(userId: string, productId: number, quantity: number): Promise<CartItem>;
  findByUserAndProduct(userId: string, productId: number): Promise<CartItem | null>;
  removeItem(userId: string, productId: number): Promise<void>;
  getCartItems(userId: string): Promise<CartItemWithProduct[]>;
  clearCart(userId: string): Promise<void>;
  getItemCount(userId: string): Promise<number>;
}
