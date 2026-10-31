import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import * as planController from '../controllers/plan.controller.js';

const router = Router();

// All plan management routes require authentication and either ADMIN or STAFF role
router.use(authenticate, authorizeRoles('ADMIN', 'STAFF'));

router.get('/', planController.listPlans);
router.get('/:id', planController.getPlan);
router.post('/', planController.createPlan);
router.put('/:id', planController.updatePlan);
router.patch('/:id/status', planController.updatePlanStatus);
router.delete('/:id', authorizeRoles('ADMIN'), planController.deletePlan);

export default router;

