import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { validateBody } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';

const router = Router();
const prisma = new PrismaClient();

const createEventTypeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  duration: z.number().min(5, 'Duration must be at least 5 minutes').max(480, 'Duration must be at most 8 hours'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format').optional(),
  location: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateEventTypeSchema = createEventTypeSchema.partial();

// Get all event types for authenticated user
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const eventTypes = await prisma.eventType.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(eventTypes);
  } catch (error) {
    next(error);
  }
});

// Get single event type
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const eventType = await prisma.eventType.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!eventType) {
      throw new AppError('Event type not found', 404);
    }

    res.json(eventType);
  } catch (error) {
    next(error);
  }
});

// Create event type
router.post('/', authMiddleware, validateBody(createEventTypeSchema), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    // Check if slug is unique for this user
    const existing = await prisma.eventType.findFirst({
      where: {
        userId: req.user!.id,
        slug: req.body.slug,
      },
    });

    if (existing) {
      throw new AppError('An event type with this slug already exists', 400);
    }

    const eventType = await prisma.eventType.create({
      data: {
        ...req.body,
        userId: req.user!.id,
      },
    });

    res.status(201).json(eventType);
  } catch (error) {
    next(error);
  }
});

// Update event type
router.patch('/:id', authMiddleware, validateBody(updateEventTypeSchema), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    // Check if event type exists and belongs to user
    const existing = await prisma.eventType.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!existing) {
      throw new AppError('Event type not found', 404);
    }

    // Check if new slug is unique (if slug is being changed)
    if (req.body.slug && req.body.slug !== existing.slug) {
      const slugExists = await prisma.eventType.findFirst({
        where: {
          userId: req.user!.id,
          slug: req.body.slug,
          id: { not: req.params.id },
        },
      });

      if (slugExists) {
        throw new AppError('An event type with this slug already exists', 400);
      }
    }

    const eventType = await prisma.eventType.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(eventType);
  } catch (error) {
    next(error);
  }
});

// Delete event type
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const existing = await prisma.eventType.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!existing) {
      throw new AppError('Event type not found', 404);
    }

    await prisma.eventType.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
