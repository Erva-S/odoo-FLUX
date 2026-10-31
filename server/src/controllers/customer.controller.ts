import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.js';
import * as customerService from '../services/customer.service.js';

export async function getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await customerService.getCustomerProfile(req.user!.id);
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return next(error);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const updated = await customerService.updateCustomerProfile(req.user!.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}
