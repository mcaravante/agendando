import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, subMonths, format, isSameMonth, isToday, startOfDay, isBefore, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCalendarWeeks } from '../../utils/date';

interface MonthCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  availableDays?: number[]; // 0-6, Sunday-Saturday
  availableDates?: Set<string>; // 'YYYY-MM-DD' strings
  maxDaysInAdvance?: number;
  onUnavailableClick?: (date: Date) => void;
  onMonthChange?: (month: Date) => void;
  accentColor?: string;
}

export function MonthCalendar({
  selectedDate,
  onDateSelect,
  availableDays = [0, 1, 2, 3, 4, 5, 6],
  availableDates,
  maxDaysInAdvance = 60,
  onUnavailableClick,
  onMonthChange,
  accentColor,
}: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const weeks = getCalendarWeeks(currentMonth);
  const today = startOfDay(new Date());
  const maxDate = addDays(today, maxDaysInAdvance);

  const isDateDisabled = (date: Date) => {
    const dateStart = startOfDay(date);

    // Past dates
    if (isBefore(dateStart, today)) return true;

    // Beyond max days
    if (isBefore(maxDate, dateStart)) return true;

    return false;
  };

  const isDateUnavailable = (date: Date) => {
    if (isDateDisabled(date)) return false; // disabled is a separate state
    if (availableDates) {
      const key = format(date, 'yyyy-MM-dd');
      return !availableDates.has(key);
    }
    // Fallback to day-of-week check
    return !availableDays.includes(date.getDay());
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return startOfDay(date).getTime() === startOfDay(selectedDate).getTime();
  };

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    if (isDateUnavailable(date)) {
      onUnavailableClick?.(date);
      return;
    }
    onDateSelect(date);
  };

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => handleMonthChange(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
          disabled={isSameMonth(currentMonth, new Date())}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold capitalize text-gray-900">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <button
          onClick={() => handleMonthChange(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}

        {weeks.flat().map((date, index) => {
          const disabled = isDateDisabled(date);
          const unavailable = isDateUnavailable(date);
          const selected = isDateSelected(date);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isTodayDate = isToday(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              className={`
                aspect-square flex items-center justify-center text-sm rounded-lg transition-colors
                ${!isCurrentMonth ? 'text-gray-300' : ''}
                ${disabled ? 'text-gray-300 cursor-not-allowed' : ''}
                ${unavailable && !disabled && isCurrentMonth ? 'text-gray-400 line-through decoration-gray-300 cursor-pointer hover:bg-gray-50' : ''}
                ${!disabled && !unavailable ? 'text-gray-900 hover:bg-gray-100 font-medium' : ''}
                ${selected && !accentColor ? 'bg-primary-600 !text-white hover:bg-primary-700 no-underline' : ''}
                ${isTodayDate && !selected && !accentColor ? 'ring-2 ring-primary-500 ring-inset' : ''}
              `}
              style={accentColor ? {
                ...(selected ? { backgroundColor: accentColor, color: 'white', textDecoration: 'none' } : {}),
                ...(isTodayDate && !selected ? { boxShadow: `inset 0 0 0 2px ${accentColor}` } : {}),
              } : undefined}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
