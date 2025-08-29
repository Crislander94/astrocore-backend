export interface CartItem {
  id: string;
  userId: string;
  productId: number;
  quantity: number;
  iva: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItemWithProduct extends CartItem {
  product: {
    id: number;
    name: string;
    price: number;
    images: string[];
    isActive: boolean;
    quantity: number;
  };
}

export interface CartSummary {
  items: CartItemWithProduct[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}
