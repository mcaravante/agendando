import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

// Get dashboard stats
router.get('/stats', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Upcoming meetings count
    const upcomingCount = await prisma.booking.count({
      where: {
        hostId: userId,
        status: 'CONFIRMED',
        startTime: { gte: now },
      },
    });

    // This month's meetings
    const thisMonthCount = await prisma.booking.count({
      where: {
        hostId: userId,
        status: 'CONFIRMED',
        startTime: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // Cancelled this month
    const cancelledCount = await prisma.booking.count({
      where: {
        hostId: userId,
        status: 'CANCELLED',
        cancelledAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // Total bookings ever
    const totalCount = await prisma.booking.count({
      where: {
        hostId: userId,
        status: 'CONFIRMED',
      },
    });

    // Active event types
    const eventTypesCount = await prisma.eventType.count({
      where: {
        userId,
        isActive: true,
      },
    });

    // Bookings per day this week for chart
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const weeklyBookings = await prisma.booking.groupBy({
      by: ['startTime'],
      where: {
        hostId: userId,
        status: 'CONFIRMED',
        startTime: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      _count: true,
    });

    res.json({
      upcoming: upcomingCount,
      thisMonth: thisMonthCount,
      cancelled: cancelledCount,
      total: totalCount,
      activeEventTypes: eventTypesCount,
      weeklyBookings: weeklyBookings.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get bookings for calendar view
router.get('/calendar', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: 'start and end dates are required' });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        hostId: userId,
        status: 'CONFIRMED',
        startTime: {
          gte: new Date(start as string),
          lte: new Date(end as string),
        },
      },
      include: {
        eventType: {
          select: {
            title: true,
            color: true,
            duration: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // Format for calendar view
    const calendarEvents = bookings.map((booking) => ({
      id: booking.id,
      title: `${booking.eventType.title} - ${booking.guestName}`,
      start: booking.startTime.toISOString(),
      end: booking.endTime.toISOString(),
      color: booking.eventType.color,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
    }));

    res.json(calendarEvents);
  } catch (error) {
    next(error);
  }
});

// Get recent activity
router.get('/activity', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    // Recent bookings (last 10)
    const recentBookings = await prisma.booking.findMany({
      where: { hostId: userId },
      include: {
        eventType: {
          select: {
            title: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const activity = recentBookings.map((booking) => ({
      id: booking.id,
      type: booking.status === 'CANCELLED' ? 'cancellation' : 'booking',
      eventType: booking.eventType.title,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      date: booking.startTime,
      createdAt: booking.createdAt,
      status: booking.status,
    }));

    res.json(activity);
  } catch (error) {
    next(error);
  }
});

export default router;
