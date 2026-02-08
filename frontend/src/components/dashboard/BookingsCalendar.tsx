import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, subMonths, format, isSameMonth, isToday, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCalendarWeeks, formatDateInTimezone } from '../../utils/date';
import { Booking } from '../../types';
import { BookingCard } from '../booking/BookingCard';
import { useLanguage } from '../../contexts/LanguageContext';

interface BookingsCalendarProps {
  bookings: Booking[];
  timezone: string;
  onCancel: (id: string) => void;
}

export function BookingsCalendar({ bookings, timezone, onCancel }: BookingsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { language } = useLanguage();
  const bookingsRef = useRef<HTMLDivElement>(null);

  // Group bookings by date string (in the user's timezone)
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const booking of bookings) {
      const dateKey = formatDateInTimezone(booking.startTime, timezone, 'yyyy-MM-dd');
      const existing = map.get(dateKey) || [];
      existing.push(booking);
      map.set(dateKey, existing);
    }
    return map;
  }, [bookings, timezone]);

  const weeks = getCalendarWeeks(currentMonth);

  const getBookingsForDate = (date: Date): Booking[] => {
    const key = format(date, 'yyyy-MM-dd');
    return bookingsByDate.get(key) || [];
  };

  const selectedBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  const dayHeaders = language === 'es'
    ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Scroll to bookings section when a date is selected
  useEffect(() => {
    if (selectedDate && bookingsRef.current) {
      bookingsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedDate]);

  return (
    <div>
      {/* Calendar grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1">
          {dayHeaders.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}

          {/* Day cells */}
          {weeks.flat().map((date, index) => {
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isTodayDate = isToday(date);
            const dayBookings = getBookingsForDate(date);
            const isSelected = selectedDate && startOfDay(date).getTime() === startOfDay(selectedDate).getTime();

            // Get unique colors for dots (up to 3)
            const dotColors = dayBookings
              .map((b) => b.eventType?.color || '#3b82f6')
              .filter((color, i, arr) => arr.indexOf(color) === i)
              .slice(0, 3);

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`
                  py-2 flex flex-col items-center justify-center text-sm rounded-lg transition-colors
                  ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100'}
                  ${isSelected ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                  ${isTodayDate && !isSelected ? 'ring-2 ring-primary-500 ring-inset' : ''}
                `}
              >
                <span>{format(date, 'd')}</span>
                {dotColors.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dotColors.map((color, i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isSelected ? 'white' : color }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day bookings */}
      {selectedDate && (
        <div ref={bookingsRef} className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {formatDateInTimezone(selectedDate, timezone, 'PPP')}
          </h3>
          {selectedBookings.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'es' ? 'No hay reuniones este día' : 'No meetings this day'}
            </p>
          ) : (
            <div className="space-y-3">
              {selectedBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  timezone={timezone}
                  onCancel={onCancel}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
