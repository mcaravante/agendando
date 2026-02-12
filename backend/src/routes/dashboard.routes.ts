import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays, startOfDay, endOfDay, parseISO, differenceInDays, addWeeks, getDay, getHours } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
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

// Get analytics data
router.get('/analytics', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const fromParam = req.query.from as string | undefined;
    const toParam = req.query.to as string | undefined;

    let since: Date;
    let until: Date;

    if (fromParam && toParam) {
      since = startOfDay(parseISO(fromParam));
      until = endOfDay(parseISO(toParam));
    } else {
      const days = parseInt(req.query.days as string) || 90;
      until = endOfDay(new Date());
      since = startOfDay(subDays(new Date(), days));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    const tz = user?.timezone || 'UTC';

    const bookings = await prisma.booking.findMany({
      where: {
        hostId: userId,
        createdAt: { gte: since, lte: until },
      },
      include: {
        eventType: { select: { title: true, color: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    // Summary
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED');
    const cancelled = bookings.filter(b => b.status === 'CANCELLED');
    const totalBookings = bookings.length;
    const totalCancelled = cancelled.length;
    const cancellationRate = totalBookings > 0 ? Math.round((totalCancelled / totalBookings) * 100) : 0;
    const rangeDays = Math.max(1, differenceInDays(until, since));
    const weeks = Math.max(1, rangeDays / 7);
    const avgBookingsPerWeek = Math.round((totalBookings / weeks) * 10) / 10;

    // Most popular event type
    const eventTypeCounts: Record<string, { title: string; color: string; count: number }> = {};
    for (const b of bookings) {
      const key = b.eventType.title;
      if (!eventTypeCounts[key]) {
        eventTypeCounts[key] = { title: key, color: b.eventType.color, count: 0 };
      }
      eventTypeCounts[key].count++;
    }
    const eventTypeArr = Object.values(eventTypeCounts).sort((a, b) => b.count - a.count);
    const mostPopularEventType = eventTypeArr[0]?.title || '-';

    // Bookings over time (by week)
    const weekMap: Record<string, { confirmed: number; cancelled: number }> = {};
    const totalWeeks = Math.max(1, Math.ceil(rangeDays / 7));
    const firstWeekStart = startOfWeek(since, { weekStartsOn: 1 });
    for (let i = 0; i < totalWeeks; i++) {
      const ws = addWeeks(firstWeekStart, i);
      const key = ws.toISOString().slice(0, 10);
      weekMap[key] = { confirmed: 0, cancelled: 0 };
    }
    for (const b of bookings) {
      const weekStart = startOfWeek(b.startTime, { weekStartsOn: 1 });
      const key = weekStart.toISOString().slice(0, 10);
      if (weekMap[key]) {
        if (b.status === 'CONFIRMED') weekMap[key].confirmed++;
        else weekMap[key].cancelled++;
      }
    }
    const bookingsOverTime = Object.entries(weekMap).map(([week, data]) => ({
      week,
      ...data,
    }));

    // By event type
    const bookingsByEventType = eventTypeArr;

    // By day of week (converted to user timezone)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCount = [0, 0, 0, 0, 0, 0, 0];
    for (const b of bookings) {
      const zoned = toZonedTime(b.startTime, tz);
      dayCount[getDay(zoned)]++;
    }
    const bookingsByDayOfWeek = dayCount.map((count, i) => ({
      day: i,
      dayName: dayNames[i],
      count,
    }));

    // By hour of day (converted to user timezone)
    const hourCount: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourCount[h] = 0;
    for (const b of bookings) {
      const zoned = toZonedTime(b.startTime, tz);
      hourCount[getHours(zoned)]++;
    }
    const bookingsByHour = Object.entries(hourCount)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .filter(h => h.count > 0 || (h.hour >= 7 && h.hour <= 21));

    // Top guests
    const guestMap: Record<string, { guestEmail: string; guestName: string; count: number }> = {};
    for (const b of bookings) {
      if (!guestMap[b.guestEmail]) {
        guestMap[b.guestEmail] = { guestEmail: b.guestEmail, guestName: b.guestName, count: 0 };
      }
      guestMap[b.guestEmail].count++;
    }
    const topGuests = Object.values(guestMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      summary: {
        totalBookings,
        totalCancelled,
        cancellationRate,
        avgBookingsPerWeek,
        mostPopularEventType,
      },
      bookingsOverTime,
      bookingsByEventType,
      bookingsByDayOfWeek,
      bookingsByHour,
      topGuests,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
