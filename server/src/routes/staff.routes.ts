import { Router } from 'express';
import * as staffController from '../controllers/staff.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  createStaffSchema,
  updateStaffSchema,
  updateStaffStatusSchema,
} from '../validators/staff.validator.js';
import { Role } from '../types/auth.js';

const router = Router();

// All staff management routes strictly require ADMIN role
router.use(authenticate, authorizeRoles(Role.ADMIN));

router.get('/', staffController.listStaff);
router.post('/', validateBody(createStaffSchema), staffController.createStaff);
router.get('/:id', staffController.getStaffById);
router.patch('/:id', validateBody(updateStaffSchema), staffController.updateStaff);
router.patch('/:id/status', validateBody(updateStaffStatusSchema), staffController.updateStaffStatus);

export default router;
