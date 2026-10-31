import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import * as productController from '../controllers/product.controller.js';

const router = Router();

router.use(authenticate, authorizeRoles('ADMIN', 'STAFF'));

router.put('/:id', productController.updateVariant);
router.patch('/:id/status', productController.updateVariantStatus);
router.delete('/:id', authorizeRoles('ADMIN'), productController.deleteVariant);

export default router;
