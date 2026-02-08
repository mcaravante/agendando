import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
// 7 days in seconds
const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload as object, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN_SECONDS });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}
