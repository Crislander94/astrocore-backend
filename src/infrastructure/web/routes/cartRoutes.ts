import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Get cart endpoint - Coming soon' });
});

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/items', (req, res) => {
  res.status(501).json({ message: 'Add to cart endpoint - Coming soon' });
});

export { router as cartRoutes };
