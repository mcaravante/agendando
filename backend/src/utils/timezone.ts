import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { format, parse, addMinutes, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';

export function convertToUTC(date: Date, timezone: string): Date {
  return fromZonedTime(date, timezone);
}

export function convertFromUTC(date: Date, timezone: string): Date {
  return toZonedTime(date, timezone);
}

export function formatInTimezone(date: Date, timezone: string, formatStr: string): string {
  return formatInTimeZone(date, timezone, formatStr);
}

export function parseTimeInTimezone(timeStr: string, date: Date, timezone: string): Date {
  const dateStr = format(date, 'yyyy-MM-dd');
  const datetimeStr = `${dateStr} ${timeStr}`;
  const parsedDate = parse(datetimeStr, 'yyyy-MM-dd HH:mm', new Date());
  return fromZonedTime(parsedDate, timezone);
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  duration: number,
  date: Date,
  timezone: string
): Date[] {
  const slots: Date[] = [];

  const start = parseTimeInTimezone(startTime, date, timezone);
  const end = parseTimeInTimezone(endTime, date, timezone);

  let current = start;

  while (isBefore(addMinutes(current, duration), end) ||
         addMinutes(current, duration).getTime() === end.getTime()) {
    slots.push(current);
    current = addMinutes(current, duration);
  }

  return slots;
}

export function isSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  bookedSlots: Array<{ startTime: Date; endTime: Date }>
): boolean {
  for (const booked of bookedSlots) {
    const bookedStart = new Date(booked.startTime);
    const bookedEnd = new Date(booked.endTime);

    // Check for overlap
    if (
      (isBefore(slotStart, bookedEnd) && isAfter(slotEnd, bookedStart)) ||
      slotStart.getTime() === bookedStart.getTime()
    ) {
      return false;
    }
  }
  return true;
}
