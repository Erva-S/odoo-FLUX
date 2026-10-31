import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import * as productController from '../controllers/product.controller.js';

const router = Router();

// All product management routes require authentication and either ADMIN or STAFF role
router.use(authenticate, authorizeRoles('ADMIN', 'STAFF'));

// Products
router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.patch('/:id/status', productController.updateProductStatus);
router.delete('/:id', authorizeRoles('ADMIN'), productController.deleteProduct);

// Product Variants sub-routes
router.get('/:productId/variants', productController.listVariants);
router.post('/:productId/variants', productController.createVariant);

export default router;
