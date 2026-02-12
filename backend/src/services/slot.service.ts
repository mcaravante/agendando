import { PrismaClient } from '@prisma/client';
import {
  addMinutes,
  startOfDay,
  isBefore,
  isAfter,
  addDays,
  getDay,
  format,
  parse,
} from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export interface AvailableSlot {
  time: string;
  datetime: string;
}

export async function getAvailableSlots(
  username: string,
  eventSlug: string,
  dateStr: string,
  visitorTimezone: string
): Promise<AvailableSlot[]> {
  // Get user
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      availabilities: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get event type
  const eventType = await prisma.eventType.findFirst({
    where: {
      userId: user.id,
      slug: eventSlug,
      isActive: true,
    },
  });

  if (!eventType) {
    throw new AppError('Event type not found', 404);
  }

  // Get scheduling config
  const config = await prisma.schedulingConfig.findUnique({
    where: { userId: user.id },
  });

  const bufferBefore = config?.bufferBefore || 0;
  const bufferAfter = config?.bufferAfter || 0;
  const minNotice = config?.minNotice || 60;
  const maxDaysInAdvance = config?.maxDaysInAdvance || 60;

  // Parse the date in the host's timezone
  const hostTimezone = user.timezone;
  const requestedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
  const dateInHostTz = toZonedTime(requestedDate, hostTimezone);
  const dayOfWeek = getDay(dateInHostTz);

  // Check if date is within allowed range
  const now = new Date();
  const minDate = addMinutes(now, minNotice);
  const maxDate = addDays(now, maxDaysInAdvance);

  if (isBefore(requestedDate, startOfDay(now))) {
    return [];
  }

  if (isAfter(requestedDate, maxDate)) {
    return [];
  }

  // Check for date overrides
  const dateOverrides = await prisma.dateOverride.findMany({
    where: {
      userId: user.id,
      date: requestedDate,
    },
    orderBy: { startTime: 'asc' },
  });

  if (dateOverrides.some((o) => o.isBlocked)) {
    return [];
  }

  // Get availability for this day
  let dayAvailability;
  if (dateOverrides.length > 0) {
    dayAvailability = dateOverrides
      .filter((o) => o.startTime && o.endTime)
      .map((o) => ({
        startTime: o.startTime!,
        endTime: o.endTime!,
      }));
  } else {
    dayAvailability = user.availabilities.filter(
      (a) => a.dayOfWeek === dayOfWeek
    );
  }

  if (dayAvailability.length === 0) {
    return [];
  }

  // Get existing bookings for this day
  const dayStart = fromZonedTime(
    parse(`${dateStr} 00:00`, 'yyyy-MM-dd HH:mm', new Date()),
    hostTimezone
  );
  const dayEnd = fromZonedTime(
    parse(`${dateStr} 23:59`, 'yyyy-MM-dd HH:mm', new Date()),
    hostTimezone
  );

  const existingBookings = await prisma.booking.findMany({
    where: {
      hostId: user.id,
      status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
      startTime: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  // Generate slots
  const slots: AvailableSlot[] = [];
  const duration = eventType.duration;
  const totalDuration = duration + bufferBefore + bufferAfter;

  for (const availability of dayAvailability) {
    const startParts = availability.startTime.split(':').map(Number);
    const endParts = availability.endTime.split(':').map(Number);

    let slotStart = fromZonedTime(
      parse(`${dateStr} ${availability.startTime}`, 'yyyy-MM-dd HH:mm', new Date()),
      hostTimezone
    );
    const availabilityEnd = fromZonedTime(
      parse(`${dateStr} ${availability.endTime}`, 'yyyy-MM-dd HH:mm', new Date()),
      hostTimezone
    );

    while (addMinutes(slotStart, duration) <= availabilityEnd) {
      const slotEnd = addMinutes(slotStart, duration);
      const slotWithBufferStart = addMinutes(slotStart, -bufferBefore);
      const slotWithBufferEnd = addMinutes(slotEnd, bufferAfter);

      // Check minimum notice
      if (isBefore(slotStart, minDate)) {
        slotStart = addMinutes(slotStart, duration);
        continue;
      }

      // Check for conflicts with existing bookings
      let hasConflict = false;
      for (const booking of existingBookings) {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);

        // Check if slot overlaps with booking (including buffers)
        if (
          (slotWithBufferStart < bookingEnd && slotWithBufferEnd > bookingStart)
        ) {
          hasConflict = true;
          break;
        }
      }

      if (!hasConflict) {
        // Convert to visitor's timezone for display
        const slotInVisitorTz = toZonedTime(slotStart, visitorTimezone);
        slots.push({
          time: format(slotInVisitorTz, 'HH:mm'),
          datetime: slotStart.toISOString(),
        });
      }

      slotStart = addMinutes(slotStart, duration);
    }
  }

  return slots;
}
