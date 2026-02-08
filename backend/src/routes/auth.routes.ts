import { Router, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';
import * as authService from '../services/auth.service';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Username can only contain lowercase letters, numbers, and hyphens'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = await authService.getCurrentUser(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  // JWT is stateless, logout is handled client-side
  res.json({ message: 'Logged out successfully' });
});

export default router;
