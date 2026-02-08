import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { validateBody } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for avatar uploads
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: AuthenticatedRequest, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user!.id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  timezone: z.string().optional(),
});

router.patch('/me', authMiddleware, validateBody(updateProfileSchema), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: req.body,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        timezone: true,
        avatarUrl: true,
      },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/avatar', authMiddleware, upload.single('avatar'), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatarUrl },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        timezone: true,
        avatarUrl: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/:username', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        timezone: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
