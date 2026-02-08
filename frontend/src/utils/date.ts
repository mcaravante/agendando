import { format, parseISO, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, startOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

export function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: es });
}

export function formatDateInTimezone(date: Date | string, timezone: string, formatStr: string = 'PPP'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(d, timezone, formatStr, { locale: es });
}

export function formatTime(date: Date | string, timezone?: string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (timezone) {
    return formatInTimeZone(d, timezone, 'HH:mm');
  }
  return format(d, 'HH:mm');
}

export function getCalendarDays(date: Date): Date[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
}

export function getCalendarWeeks(date: Date): Date[][] {
  const days = getCalendarDays(date);
  const weeks: Date[][] = [];

  // Add days from previous month to fill the first week
  const firstDay = days[0];
  const firstDayOfWeek = firstDay.getDay();

  const paddedDays: Date[] = [];

  // Add previous month's days
  for (let i = firstDayOfWeek; i > 0; i--) {
    paddedDays.push(addDays(firstDay, -i));
  }

  // Add current month's days
  paddedDays.push(...days);

  // Add next month's days to complete the last week
  const lastDay = days[days.length - 1];
  const lastDayOfWeek = lastDay.getDay();
  for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
    paddedDays.push(addDays(lastDay, i));
  }

  // Split into weeks
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  return weeks;
}

export function isDateDisabled(date: Date, maxDays: number = 60): boolean {
  const today = startOfDay(new Date());
  const maxDate = addDays(today, maxDays);

  return isBefore(date, today) || isBefore(maxDate, date);
}

export { isSameMonth, isToday, parseISO, format, addDays };
