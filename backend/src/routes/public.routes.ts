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

// Get available days for a month
router.get('/:username/:eventSlug/available-days', async (req, res, next) => {
  try {
    const { month, timezone } = req.query;

    if (!month || typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
      throw new AppError('Month is required (format: YYYY-MM)', 400);
    }

    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      include: { availabilities: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const eventType = await prisma.eventType.findFirst({
      where: { userId: user.id, slug: req.params.eventSlug, isActive: true },
    });

    if (!eventType) throw new AppError('Event type not found', 404);

    const config = await prisma.schedulingConfig.findUnique({
      where: { userId: user.id },
    });

    const minNotice = config?.minNotice || 60;
    const maxDaysInAdvance = config?.maxDaysInAdvance || 60;

    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const monthNum = parseInt(monthStr) - 1;
    const daysInMonth = new Date(year, monthNum + 1, 0).getDate();

    const now = new Date();
    const minDate = new Date(now.getTime() + minNotice * 60000);
    const maxDate = new Date(now.getTime() + maxDaysInAdvance * 24 * 3600000);

    // Get all date overrides for this month
    const monthStart = new Date(year, monthNum, 1);
    const monthEnd = new Date(year, monthNum + 1, 0, 23, 59, 59);
    const overrides = await prisma.dateOverride.findMany({
      where: { userId: user.id, date: { gte: monthStart, lte: monthEnd } },
    });

    const overrideMap = new Map<string, typeof overrides>();
    for (const o of overrides) {
      const key = o.date.toISOString().slice(0, 10);
      const arr = overrideMap.get(key) || [];
      arr.push(o);
      overrideMap.set(key, arr);
    }

    // Build set of available day-of-week
    const availableDows = new Set(user.availabilities.map(a => a.dayOfWeek));

    const availableDays: string[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, monthNum, d);
      const dateStr = `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // Past or beyond range
      if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) continue;
      if (date > maxDate) continue;

      const dayOverrides = overrideMap.get(dateStr);

      if (dayOverrides && dayOverrides.length > 0) {
        // If blocked, skip
        if (dayOverrides.some(o => o.isBlocked)) continue;
        // If has custom hours, it's available
        if (dayOverrides.some(o => o.startTime && o.endTime)) {
          availableDays.push(dateStr);
          continue;
        }
      }

      // Check weekly schedule
      if (availableDows.has(date.getDay())) {
        availableDays.push(dateStr);
      }
    }

    res.json(availableDays);
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
