import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.js';
import * as planService from '../services/plan.service.js';
import {
  createPlanSchema,
  updatePlanSchema,
  updatePlanStatusSchema,
  queryPlanSchema,
} from '../validators/plan.validator.js';

export async function listPlans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = queryPlanSchema.parse(req.query);
    const result = await planService.listPlans(query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const plan = await planService.getPlanById(req.params.id);
    return res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (err) {
    next(err);
  }
}

export async function createPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = createPlanSchema.parse(req.body);
    const plan = await planService.createPlan(input, req.user?.id);
    return res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      data: plan,
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = updatePlanSchema.parse(req.body);
    const plan = await planService.updatePlan(req.params.id, input, req.user?.id);
    return res.status(200).json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: plan,
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePlanStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = updatePlanStatusSchema.parse(req.body);
    const plan = await planService.updatePlanStatus(req.params.id, status, req.user?.id);
    return res.status(200).json({
      success: true,
      message: `Plan status updated to ${status}`,
      data: plan,
    });
  } catch (err) {
    next(err);
  }
}

export async function deletePlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await planService.deletePlan(req.params.id, req.user?.id);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}
