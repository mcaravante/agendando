import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, subMonths, format, isSameMonth, isToday, startOfDay, isBefore, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCalendarWeeks } from '../../utils/date';

interface MonthCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  availableDays?: number[]; // 0-6, Sunday-Saturday
  maxDaysInAdvance?: number;
}

export function MonthCalendar({
  selectedDate,
  onDateSelect,
  availableDays = [0, 1, 2, 3, 4, 5, 6],
  maxDaysInAdvance = 60,
}: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const weeks = getCalendarWeeks(currentMonth);
  const today = startOfDay(new Date());
  const maxDate = addDays(today, maxDaysInAdvance);

  const isDateDisabled = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dateStart = startOfDay(date);

    // Past dates
    if (isBefore(dateStart, today)) return true;

    // Beyond max days
    if (isBefore(maxDate, dateStart)) return true;

    // Not in available days
    if (!availableDays.includes(dayOfWeek)) return true;

    return false;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return startOfDay(date).getTime() === startOfDay(selectedDate).getTime();
  };

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
          disabled={isSameMonth(currentMonth, new Date())}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold capitalize text-gray-900">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
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
          const selected = isDateSelected(date);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isTodayDate = isToday(date);

          return (
            <button
              key={index}
              onClick={() => !disabled && onDateSelect(date)}
              disabled={disabled}
              className={`
                aspect-square flex items-center justify-center text-sm rounded-lg transition-colors text-gray-900
                ${!isCurrentMonth ? 'text-gray-400' : ''}
                ${disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}
                ${selected ? 'bg-primary-600 text-white hover:bg-primary-700' : ''}
                ${isTodayDate && !selected ? 'ring-2 ring-primary-500 ring-inset' : ''}
              `}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
