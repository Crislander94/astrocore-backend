import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get user orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Get orders endpoint - Coming soon' });
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', (req, res) => {
  res.status(501).json({ message: 'Create order endpoint - Coming soon' });
});

export { router as orderRoutes };
