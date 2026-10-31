import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.js';
import * as staffService from '../services/staff.service.js';

export async function listStaff(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const staff = await staffService.listStaff();
    return res.status(200).json({ success: true, data: staff });
  } catch (error) {
    return next(error);
  }
}

export async function getStaffById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const staff = await staffService.getStaffById(req.params.id);
    return res.status(200).json({ success: true, data: staff });
  } catch (error) {
    return next(error);
  }
}

export async function createStaff(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const adminId = req.user!.id;
    const result = await staffService.createStaff(req.body, adminId);
    return res.status(201).json({
      success: true,
      message: 'Staff account created successfully.',
      data: result.staff,
      temporaryPassword: result.temporaryPassword,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateStaff(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const adminId = req.user!.id;
    const staff = await staffService.updateStaff(req.params.id, req.body, adminId);
    return res.status(200).json({
      success: true,
      message: 'Staff account updated successfully.',
      data: staff,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateStaffStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const adminId = req.user!.id;
    const { isActive } = req.body;
    const staff = await staffService.updateStaffStatus(req.params.id, isActive, adminId);
    return res.status(200).json({
      success: true,
      message: `Staff account has been ${isActive ? 'activated' : 'deactivated'}.`,
      data: staff,
    });
  } catch (error) {
    return next(error);
  }
}
