import { Router } from 'express';
import authRoutes from './auth.routes.js';
import staffRoutes from './staff.routes.js';
import customerRoutes from './customer.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/staff', staffRoutes);
router.use('/customers', customerRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Subscriptly Backend API',
    version: '1.0.0-phase1',
  });
});

export default router;
