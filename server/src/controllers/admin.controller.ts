import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, Role } from '../types/auth.js';
import * as adminService from '../services/admin.service.js';

export async function getDashboard(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await adminService.getAdminDashboardMetrics();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

export async function listUsers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const roleQuery = req.query.role as Role | undefined;
    const users = await adminService.listAllUsers(roleQuery);
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return next(error);
  }
}
