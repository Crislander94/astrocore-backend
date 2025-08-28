import { PrismaClient } from '@prisma/client';
import { PrismaProductRepository } from '../database/repositories/PrismaProductRepository';
import { CreateProductUseCase } from '../../application/use-cases/products/CreateProductUseCase';
import { GetProductsUseCase } from '../../application/use-cases/products/GetProductsUseCase';
import { GetProductByIdUseCase } from '../../application/use-cases/products/GetProductByIdUseCase';
import { UpdateProductUseCase } from '../../application/use-cases/products/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../application/use-cases/products/DeleteProductUseCase';
import { ProductController } from '../web/controllers/ProductController';

// Prisma client singleton
const prisma = new PrismaClient();

// Repositories
const productRepository = new PrismaProductRepository(prisma);

// Use Cases
const createProductUseCase = new CreateProductUseCase(productRepository);
const getProductsUseCase = new GetProductsUseCase(productRepository);
const getProductByIdUseCase = new GetProductByIdUseCase(productRepository);
const updateProductUseCase = new UpdateProductUseCase(productRepository);
const deleteProductUseCase = new DeleteProductUseCase(productRepository);

// Controllers
export const productController = new ProductController(
  createProductUseCase,
  getProductsUseCase,
  getProductByIdUseCase,
  updateProductUseCase,
  deleteProductUseCase
);
