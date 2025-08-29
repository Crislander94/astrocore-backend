import { PrismaClient } from '@prisma/client';
import { PrismaProductRepository } from '../database/repositories/PrismaProductRepository';
import { PrismaCartRepository } from '../database/repositories/PrismaCartRepository';
import { PrismaOrderRepository } from '../database/repositories/PrismaOrderRepository';
import { CreateProductUseCase } from '../../application/use-cases/products/CreateProductUseCase';
import { GetProductsUseCase } from '../../application/use-cases/products/GetProductsUseCase';
import { GetProductByIdUseCase } from '../../application/use-cases/products/GetProductByIdUseCase';
import { UpdateProductUseCase } from '../../application/use-cases/products/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../application/use-cases/products/DeleteProductUseCase';
import { AddToCartUseCase } from '../../application/use-cases/cart/AddToCartUseCase';
import { GetCartUseCase } from '../../application/use-cases/cart/GetCartUseCase';
import { UpdateCartItemUseCase } from '../../application/use-cases/cart/UpdateCartItemUseCase';
import { RemoveFromCartUseCase } from '../../application/use-cases/cart/RemoveFromCartUseCase';
import { ClearCartUseCase } from '../../application/use-cases/cart/ClearCartUseCase';
import { CreateOrderUseCase } from '../../application/use-cases/orders/CreateOrderUseCase';
import { GetOrdersUseCase } from '../../application/use-cases/orders/GetOrdersUseCase';
import { GetOrderByIdUseCase } from '../../application/use-cases/orders/GetOrderByIdUseCase';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/orders/UpdateOrderStatusUseCase';
import { ProductController } from '../web/controllers/ProductController';
import { CartController } from '../web/controllers/CartController';
import { OrderController } from '../web/controllers/OrderController';

// Prisma client singleton
const prisma = new PrismaClient();

// Repositories
const productRepository = new PrismaProductRepository(prisma);
const cartRepository = new PrismaCartRepository(prisma);
const orderRepository = new PrismaOrderRepository(prisma);

// Product Use Cases
const createProductUseCase = new CreateProductUseCase(productRepository);
const getProductsUseCase = new GetProductsUseCase(productRepository);
const getProductByIdUseCase = new GetProductByIdUseCase(productRepository);
const updateProductUseCase = new UpdateProductUseCase(productRepository);
const deleteProductUseCase = new DeleteProductUseCase(productRepository);

// Cart Use Cases
const addToCartUseCase = new AddToCartUseCase(cartRepository, productRepository);
const getCartUseCase = new GetCartUseCase(cartRepository);
const updateCartItemUseCase = new UpdateCartItemUseCase(cartRepository, productRepository);
const removeFromCartUseCase = new RemoveFromCartUseCase(cartRepository);
const clearCartUseCase = new ClearCartUseCase(cartRepository);

// Order Use Cases
const createOrderUseCase = new CreateOrderUseCase(orderRepository, cartRepository);
const getOrdersUseCase = new GetOrdersUseCase(orderRepository);
const getOrderByIdUseCase = new GetOrderByIdUseCase(orderRepository);
const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);

// Controllers
export const productController = new ProductController(
  createProductUseCase,
  getProductsUseCase,
  getProductByIdUseCase,
  updateProductUseCase,
  deleteProductUseCase
);

export const cartController = new CartController(
  addToCartUseCase,
  getCartUseCase,
  updateCartItemUseCase,
  removeFromCartUseCase,
  clearCartUseCase
);

export const orderController = new OrderController(
  createOrderUseCase,
  getOrdersUseCase,
  getOrderByIdUseCase,
  updateOrderStatusUseCase
);
