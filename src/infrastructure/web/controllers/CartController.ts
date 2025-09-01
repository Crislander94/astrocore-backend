import { Request, Response } from 'express';
import { AddToCartUseCase } from '../../../application/use-cases/cart/AddToCartUseCase';
import { GetCartUseCase } from '../../../application/use-cases/cart/GetCartUseCase';
import { UpdateCartItemUseCase } from '../../../application/use-cases/cart/UpdateCartItemUseCase';
import { RemoveFromCartUseCase } from '../../../application/use-cases/cart/RemoveFromCartUseCase';
import { ClearCartUseCase } from '../../../application/use-cases/cart/ClearCartUseCase';

export class CartController {
  constructor(
    private addToCartUseCase: AddToCartUseCase,
    private getCartUseCase: GetCartUseCase,
    private updateCartItemUseCase: UpdateCartItemUseCase,
    private removeFromCartUseCase: RemoveFromCartUseCase,
    private clearCartUseCase: ClearCartUseCase
  ) {}

  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const cart = await this.getCartUseCase.execute(userId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get cart' });
    }
  }

  async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { productId, quantity, iva } = req.body;
      const cartItem = await this.addToCartUseCase.execute(userId, productId, quantity, iva);
      res.status(201).json(cartItem);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add item to cart';
      res.status(400).json({ error: message });
    }
  }

  async updateCartItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      if (!req.params.productId) {
        res.status(400).json({ error: 'Product ID is required' });
        return;
      }

      const productId = parseInt(req.params.productId);
      const { quantity } = req.body;
      
      const cartItem = await this.updateCartItemUseCase.execute(userId, productId, quantity);
      res.json(cartItem);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update cart item';
      res.status(400).json({ error: message });
    }
  }

  async removeFromCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      if (!req.params.productId) {
        res.status(400).json({ error: 'Product ID is required' });
        return;
      }

      const productId = parseInt(req.params.productId);
      await this.removeFromCartUseCase.execute(userId, productId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Failed to remove item from cart' });
    }
  }

  async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await this.clearCartUseCase.execute(userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear cart' });
    }
  }
}
