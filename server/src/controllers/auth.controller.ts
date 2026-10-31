import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.js';
import * as authService from '../services/auth.service.js';
import { prisma } from '../config/database.js';

const COOKIE_NAME = 'token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, token } = await authService.registerCustomer(req.body);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user,
      token,
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, token } = await authService.login(req.body);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    return res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      user,
      token,
    });
  } catch (error) {
    return next(error);
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.forgotPassword(req.body.email);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.resetPassword(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        customer: true,
      },
    });

    return res.status(200).json({
      success: true,
      user: fullUser,
    });
  } catch (error) {
    return next(error);
  }
}
