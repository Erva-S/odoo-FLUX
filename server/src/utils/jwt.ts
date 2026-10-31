import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { JwtUserPayload } from '../types/auth.js';

export function signJwt(payload: JwtUserPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyJwt(token: string): JwtUserPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;
  } catch {
    return null;
  }
}
