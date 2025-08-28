import { Request, Response } from 'express';
import { CreateProductUseCase } from '../../../application/use-cases/products/CreateProductUseCase';
import { GetProductsUseCase } from '../../../application/use-cases/products/GetProductsUseCase';
import { GetProductByIdUseCase } from '../../../application/use-cases/products/GetProductByIdUseCase';
import { UpdateProductUseCase } from '../../../application/use-cases/products/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../../application/use-cases/products/DeleteProductUseCase';

export class ProductController {
  constructor(
    private createProductUseCase: CreateProductUseCase,
    private getProductsUseCase: GetProductsUseCase,
    private getProductByIdUseCase: GetProductByIdUseCase,
    private updateProductUseCase: UpdateProductUseCase,
    private deleteProductUseCase: DeleteProductUseCase
  ) {}

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await this.createProductUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        data: product,
        message: 'Producto creado exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el producto',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const { category, minPrice, maxPrice, available, search, page, limit } = req.query as any;
      
      const result = await this.getProductsUseCase.execute({
        filters: { category, minPrice, maxPrice, available, search },
        page,
        limit,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los productos',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.getProductByIdUseCase.execute(Number(id));

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el producto',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.updateProductUseCase.execute(Number(id), req.body);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: product,
        message: 'Producto actualizado exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el producto',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.deleteProductUseCase.execute(Number(id));

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Producto eliminado exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el producto',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }
}
