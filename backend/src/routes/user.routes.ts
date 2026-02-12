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
const avatarUploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(avatarUploadDir)) {
  fs.mkdirSync(avatarUploadDir, { recursive: true });
}

// Configure multer for logo uploads
const logoUploadDir = path.join(__dirname, '../../uploads/logos');
if (!fs.existsSync(logoUploadDir)) {
  fs.mkdirSync(logoUploadDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarUploadDir);
  },
  filename: (req: AuthenticatedRequest, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user!.id}${ext}`);
  },
});

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, logoUploadDir);
  },
  filename: (req: AuthenticatedRequest, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user!.id}${ext}`);
  },
});

const imageFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
  }
};

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  timezone: z.string().optional(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  logoUrl: z.null().optional(),
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
        brandColor: true,
        logoUrl: true,
      },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/avatar', authMiddleware, uploadAvatar.single('avatar'), async (req: AuthenticatedRequest, res: Response, next) => {
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
        brandColor: true,
        logoUrl: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/logo', authMiddleware, uploadLogo.single('logo'), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { logoUrl },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        timezone: true,
        avatarUrl: true,
        brandColor: true,
        logoUrl: true,
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
        brandColor: true,
        logoUrl: true,
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
