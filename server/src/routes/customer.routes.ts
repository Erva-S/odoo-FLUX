import { Router } from 'express';
import * as customerController from '../controllers/customer.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { updateCustomerProfileSchema } from '../validators/customer.validator.js';
import { Role } from '../types/auth.js';

const router = Router();

router.get('/me', authenticate, authorizeRoles(Role.CUSTOMER, Role.ADMIN), customerController.getProfile);
router.patch('/me', authenticate, authorizeRoles(Role.CUSTOMER), validateBody(updateCustomerProfileSchema), customerController.updateProfile);

export default router;
