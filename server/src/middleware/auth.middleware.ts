import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.js';
import { verifyJwt } from '../utils/jwt.js';
import { prisma } from '../config/database.js';

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No session or token provided.',
      });
    }

    const payload = verifyJwt(token);
    if (!payload || !payload.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please sign in again.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}
