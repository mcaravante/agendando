import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar, Clock, User, Mail, MapPin, X } from 'lucide-react';
import { addWeeks, subWeeks, startOfWeek, addDays, addMonths, subMonths, format, isSameDay, isSameMonth, isToday } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { Booking, Availability } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCalendarWeeks } from '../../utils/date';
import { Button } from '../common/Button';
import api from '../../utils/api';

interface BookingsCalendarProps {
  bookings: Booking[];
  timezone: string;
  onCancel: (id: string) => void;
}

interface DateOverride {
  date: string;
  isBlocked: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

const HOUR_HEIGHT = 60;
const START_HOUR = 0;
const END_HOUR = 24;
const ALL_HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const LABEL_HOURS = ALL_HOURS.filter(h => h > 0);

const LOCATION_LABELS: Record<string, string> = {
  meet: 'Google Meet',
  zoom: 'Zoom',
  phone: 'Teléfono',
  'in-person': 'En persona',
};

function getTimeInHours(dateStr: string, timezone: string): number {
  const h = parseInt(formatInTimeZone(dateStr, timezone, 'H'));
  const m = parseInt(formatInTimeZone(dateStr, timezone, 'm'));
  return h + m / 60;
}

function formatTimeStr(dateStr: string, timezone: string): string {
  return formatInTimeZone(dateStr, timezone, 'HH:mm');
}

function timeToHour(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
}

export function BookingsCalendar({ bookings, timezone, onCancel }: BookingsCalendarProps) {
  const { language } = useLanguage();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date());
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Fetch availability + overrides
  useEffect(() => {
    Promise.all([
      api.get('/availability'),
      api.get('/availability/overrides'),
    ]).then(([availRes, overridesRes]) => {
      setAvailability(availRes.data);
      setOverrides(overridesRes.data);
    }).catch(() => {});
  }, []);

  // Scroll to 7am on mount
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, []);

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close modals on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedBooking) setSelectedBooking(null);
        else if (pickerOpen) setPickerOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedBooking, pickerOpen]);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const dayHeaders = language === 'es'
    ? ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
    : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const miniDayHeaders = language === 'es'
    ? ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const day of weekDays) {
      const key = format(day, 'yyyy-MM-dd');
      map.set(key, []);
    }
    for (const booking of bookings) {
      const dateKey = formatInTimeZone(booking.startTime, timezone, 'yyyy-MM-dd');
      const existing = map.get(dateKey);
      if (existing) existing.push(booking);
    }
    return map;
  }, [bookings, weekDays, timezone]);

  const overrideMap = useMemo(() => {
    const map = new Map<string, DateOverride[]>();
    for (const o of overrides) {
      const key = o.date.slice(0, 10);
      const arr = map.get(key) || [];
      arr.push(o);
      map.set(key, arr);
    }
    return map;
  }, [overrides]);

  // Returns available ranges for a given date as [startHour, endHour][]
  const getAvailableRanges = (date: Date): [number, number][] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayOverrides = overrideMap.get(dateKey);

    if (dayOverrides && dayOverrides.length > 0) {
      if (dayOverrides.some(o => o.isBlocked)) return [];
      return dayOverrides
        .filter(o => o.startTime && o.endTime)
        .map(o => [timeToHour(o.startTime!), timeToHour(o.endTime!)]);
    }

    const dow = date.getDay();
    const slots = availability.filter(a => a.dayOfWeek === dow);
    if (slots.length === 0) return [];
    return slots.map(s => [timeToHour(s.startTime), timeToHour(s.endTime)]);
  };

  const isHourAvailable = (date: Date, hour: number): boolean => {
    const ranges = getAvailableRanges(date);
    if (ranges.length === 0) return false;
    return ranges.some(([start, end]) => hour >= start && hour < end);
  };

  const monthLabel = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[6];
    const locale = language === 'es' ? es : undefined;
    if (first.getMonth() === last.getMonth()) {
      return format(first, 'MMM yyyy', { locale });
    }
    return `${format(first, 'MMM', { locale })} - ${format(last, 'MMM yyyy', { locale })}`;
  }, [weekDays, language]);

  const goToToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));

  const selectDateFromPicker = (date: Date) => {
    setWeekStart(startOfWeek(date, { weekStartsOn: 0 }));
    setPickerOpen(false);
  };

  const pickerWeeks = getCalendarWeeks(pickerMonth);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setWeekStart(subWeeks(weekStart, 1))}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setWeekStart(addWeeks(weekStart, 1))}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Month label with picker */}
        <div ref={pickerRef} className="relative">
          <button
            onClick={() => {
              setPickerMonth(weekStart);
              setPickerOpen(!pickerOpen);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-lg font-semibold capitalize text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {monthLabel}
            <ChevronDown className={`w-4 h-4 transition-transform ${pickerOpen ? 'rotate-180' : ''}`} />
          </button>

          {pickerOpen && (
            <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 w-[280px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold capitalize text-gray-900 dark:text-white">
                  {format(pickerMonth, 'MMMM yyyy', { locale: language === 'es' ? es : undefined })}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setPickerMonth(subMonths(pickerMonth, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => setPickerMonth(addMonths(pickerMonth, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-0">
                {miniDayHeaders.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                ))}
                {pickerWeeks.flat().map((date, i) => {
                  const inMonth = isSameMonth(date, pickerMonth);
                  const today = isToday(date);
                  const inCurrentWeek = weekDays.some(wd => isSameDay(wd, date));
                  return (
                    <button
                      key={i}
                      onClick={() => selectDateFromPicker(date)}
                      className={`text-center text-sm py-1.5 rounded transition-colors
                        ${!inMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}
                        ${today ? 'font-bold text-blue-600 dark:text-blue-400' : ''}
                        ${inCurrentWeek ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                      `}
                    >
                      {format(date, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={goToToday}
          className="ml-2 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {language === 'es' ? 'Hoy' : 'Today'}
        </button>
      </div>

      {/* Week grid */}
      <div ref={gridRef} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-y-auto" style={{ height: '660px' }}>
        {/* Day headers - sticky */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 bg-white dark:bg-gray-800">
          <div />
          {weekDays.map((day, i) => {
            const today = isToday(day);
            return (
              <div
                key={i}
                className={`text-center py-3 border-l border-gray-200 dark:border-gray-700 ${today ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              >
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {dayHeaders[i]}
                </div>
                <div className={`text-lg font-semibold mt-0.5 ${
                  today ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {/* Time labels column */}
          <div className="relative" style={{ height: `${ALL_HOURS.length * HOUR_HEIGHT}px` }}>
            {LABEL_HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute right-2 text-xs text-gray-400 dark:text-gray-500 -translate-y-1/2"
                style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
              >
                {`${String(hour).padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayBookings = bookingsByDay.get(dateKey) || [];
            const today = isToday(day);

            return (
              <div
                key={dayIndex}
                className="relative border-l border-gray-200 dark:border-gray-700"
                style={{ height: `${ALL_HOURS.length * HOUR_HEIGHT}px` }}
              >
                {/* Unavailable background blocks */}
                {ALL_HOURS.map((hour) => {
                  const available = isHourAvailable(day, hour);
                  return (
                    <div
                      key={hour}
                      className={`absolute w-full border-t border-gray-100 dark:border-gray-700/50 ${
                        !available ? 'bg-gray-100/80 dark:bg-gray-700/40' : today ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                      }`}
                      style={{
                        top: `${(hour - START_HOUR) * HOUR_HEIGHT}px`,
                        height: `${HOUR_HEIGHT}px`,
                      }}
                    />
                  );
                })}

                {/* Booking blocks */}
                {dayBookings.map((booking) => {
                  const startH = getTimeInHours(booking.startTime, timezone);
                  const endH = getTimeInHours(booking.endTime, timezone);
                  const top = Math.max((startH - START_HOUR) * HOUR_HEIGHT, 0);
                  const height = Math.max((endH - startH) * HOUR_HEIGHT, 20);
                  const isCancelled = booking.status === 'CANCELLED';
                  const color = booking.eventType?.color || '#3b82f6';

                  return (
                    <button
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className={`absolute left-1 right-1 rounded-md px-2 py-1 text-left overflow-hidden transition-opacity hover:opacity-90 cursor-pointer z-10 ${
                        isCancelled ? 'opacity-50' : ''
                      }`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: `${color}20`,
                        borderLeft: `3px solid ${color}`,
                      }}
                    >
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {booking.guestName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {formatTimeStr(booking.startTime, timezone)} - {formatTimeStr(booking.endTime, timezone)}
                      </p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking detail popup */}
      {selectedBooking && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedBooking(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div
                    className="w-1.5 h-12 rounded-full mt-0.5 flex-shrink-0"
                    style={{ backgroundColor: selectedBooking.eventType?.color || '#3b82f6' }}
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedBooking.eventType?.title}
                    </h2>
                    {selectedBooking.status === 'CANCELLED' && (
                      <span className="text-xs text-red-600 dark:text-red-400">
                        {language === 'es' ? 'Cancelada' : 'Cancelled'}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span>{formatInTimeZone(selectedBooking.startTime, timezone, "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span>
                    {formatTimeStr(selectedBooking.startTime, timezone)} - {formatTimeStr(selectedBooking.endTime, timezone)}
                    {selectedBooking.eventType?.duration && (
                      <span className="text-gray-400 ml-1">({selectedBooking.eventType.duration} min)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span>{selectedBooking.guestName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span>{selectedBooking.guestEmail}</span>
                </div>
                {selectedBooking.eventType?.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                    <span>{LOCATION_LABELS[selectedBooking.eventType.location] || selectedBooking.eventType.location}</span>
                  </div>
                )}
                {selectedBooking.notes && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">
                      <span className="font-medium">{language === 'es' ? 'Notas:' : 'Notes:'}</span> {selectedBooking.notes}
                    </p>
                  </div>
                )}
              </div>
              {selectedBooking.status === 'CONFIRMED' && new Date(selectedBooking.endTime) > new Date() && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      onCancel(selectedBooking.id);
                      setSelectedBooking(null);
                    }}
                  >
                    {language === 'es' ? 'Cancelar reunión' : 'Cancel meeting'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
