import { Router } from 'express';
import { cartController } from '../../config/dependencies';
import { authenticate } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { addToCartSchema, updateCartItemSchema } from '../validators/cartValidators';

const router = Router();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CartItemWithProduct'
 *                 subtotal:
 *                   type: number
 *                 tax:
 *                   type: number
 *                 total:
 *                   type: number
 *                 itemCount:
 *                   type: integer
 */
router.get('/', authenticate, cartController.getCart.bind(cartController));

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               iva:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Item added to cart
 */
router.post('/', authenticate, validateRequest({ body: addToCartSchema }), cartController.addToCart.bind(cartController));

/**
 * @swagger
 * /api/cart/{productId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cart item updated
 */
router.put('/:productId', authenticate, validateRequest({ body: updateCartItemSchema }), cartController.updateCartItem.bind(cartController));

/**
 * @swagger
 * /api/cart/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Item removed from cart
 */
router.delete('/:productId', authenticate, cartController.removeFromCart.bind(cartController));

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Cart cleared
 */
router.delete('/', authenticate, cartController.clearCart.bind(cartController));

export { router as cartRoutes };
