import { Router } from 'express';
import { productController } from '../../config/dependencies';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createProductSchema,
  updateProductSchema,
  getProductsQuerySchema,
  productIdSchema,
} from '../validators/productValidators';

const router = Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener lista de productos
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Precio máximo
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filtrar por disponibilidad
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en name y descripción
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Productos por página
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 */
router.get(
  '/',
  validateRequest({ query: getProductsQuerySchema }),
  productController.getProducts.bind(productController)
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto obtenido exitosamente
 *       404:
 *         description: Producto no encontrado
 */
router.get(
  '/:id',
  validateRequest({ params: productIdSchema }),
  productController.getProductById.bind(productController)
);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear nuevo producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - sku
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               shortDesc:
 *                 type: string
 *               sku:
 *                 type: string
 *               price:
 *                 type: number
 *               oldPrice:
 *                 type: number
 *               haveDiscount:
 *                 type: boolean
 *               cost:
 *                 type: number
 *               trackQuantity:
 *                 type: boolean
 *               quantity:
 *                 type: integer
 *               weight:
 *                 type: number
 *               dimensions:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, ARCHIVED]
 *               isActive:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *               metaTitle:
 *                 type: string
 *               metaDesc:
 *                 type: string
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateRequest({ body: createProductSchema }),
  productController.createProduct.bind(productController)
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               shortDesc:
 *                 type: string
 *               sku:
 *                 type: string
 *               price:
 *                 type: number
 *               oldPrice:
 *                 type: number
 *               haveDiscount:
 *                 type: boolean
 *               cost:
 *                 type: number
 *               trackQuantity:
 *                 type: boolean
 *               quantity:
 *                 type: integer
 *               weight:
 *                 type: number
 *               dimensions:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, ARCHIVED]
 *               isActive:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *               metaTitle:
 *                 type: string
 *               metaDesc:
 *                 type: string
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateRequest({ params: productIdSchema, body: updateProductSchema }),
  productController.updateProduct.bind(productController)
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validateRequest({ params: productIdSchema }),
  productController.deleteProduct.bind(productController)
);

export { router as productRoutes };
