import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { Role } from '../types/auth.js';

const router = Router();

// Dashboard is accessible to ADMIN and STAFF
router.get('/dashboard', authenticate, authorizeRoles(Role.ADMIN, Role.STAFF), adminController.getDashboard);

// User listing is ADMIN only
router.get('/users', authenticate, authorizeRoles(Role.ADMIN), adminController.listUsers);

export default router;
