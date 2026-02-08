import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { getAvailableSlots } from '../services/slot.service';

const router = Router();
const prisma = new PrismaClient();

// Get public profile with event types
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
        eventTypes: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            duration: true,
            color: true,
            location: true,
          },
          orderBy: { createdAt: 'asc' },
        },
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

// Get specific event type
router.get('/:username/:eventSlug', async (req, res, next) => {
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

    const eventType = await prisma.eventType.findFirst({
      where: {
        userId: user.id,
        slug: req.params.eventSlug,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        duration: true,
        color: true,
        location: true,
      },
    });

    if (!eventType) {
      throw new AppError('Event type not found', 404);
    }

    res.json({
      user,
      eventType,
    });
  } catch (error) {
    next(error);
  }
});

// Get available slots for a date
router.get('/:username/:eventSlug/slots', async (req, res, next) => {
  try {
    const { date, timezone } = req.query;

    if (!date || typeof date !== 'string') {
      throw new AppError('Date is required (format: YYYY-MM-DD)', 400);
    }

    if (!timezone || typeof timezone !== 'string') {
      throw new AppError('Timezone is required', 400);
    }

    const slots = await getAvailableSlots(
      req.params.username,
      req.params.eventSlug,
      date,
      timezone
    );

    res.json(slots);
  } catch (error) {
    next(error);
  }
});

export default router;
