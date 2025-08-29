import { Router } from 'express';
import { addressController } from '../../config/dependencies';
import { authenticate } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createAddressSchema,
  updateAddressSchema,
  addressIdSchema
} from '../validators/addressValidators';

const router = Router();

/**
 * @swagger
 * /api/users/addresses:
 *   get:
 *     summary: Get user addresses
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Address'
 */
router.get(
  '/',
  authenticate,
  addressController.getAddresses.bind(addressController)
);

/**
 * @swagger
 * /api/users/addresses:
 *   post:
 *     summary: Create new address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - address1
 *               - city
 *               - state
 *               - postalCode
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 maxLength: 50
 *               company:
 *                 type: string
 *                 maxLength: 100
 *               address1:
 *                 type: string
 *                 maxLength: 200
 *               address2:
 *                 type: string
 *                 maxLength: 200
 *               city:
 *                 type: string
 *                 maxLength: 100
 *               state:
 *                 type: string
 *                 maxLength: 100
 *               postalCode:
 *                 type: string
 *                 maxLength: 20
 *               country:
 *                 type: string
 *                 length: 2
 *                 default: EC
 *               phone:
 *                 type: string
 *                 maxLength: 20
 *               isDefault:
 *                 type: boolean
 *                 default: false
 *               instructions:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Address created successfully
 */
router.post(
  '/',
  authenticate,
  validateRequest({ body: createAddressSchema }),
  addressController.createAddress.bind(addressController)
);

/**
 * @swagger
 * /api/users/addresses/{id}:
 *   put:
 *     summary: Update address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAddress'
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
 *       403:
 *         description: Access denied
 */
router.put(
  '/:id',
  authenticate,
  validateRequest({ 
    params: addressIdSchema,
    body: updateAddressSchema 
  }),
  addressController.updateAddress.bind(addressController)
);

/**
 * @swagger
 * /api/users/addresses/{id}:
 *   delete:
 *     summary: Delete address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 *       403:
 *         description: Access denied
 */
router.delete(
  '/:id',
  authenticate,
  validateRequest({ params: addressIdSchema }),
  addressController.deleteAddress.bind(addressController)
);

export { router as addressRoutes };
