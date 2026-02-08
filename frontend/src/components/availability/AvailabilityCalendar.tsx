import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, subMonths, format, isSameMonth, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCalendarWeeks } from '../../utils/date';
import { DateOverride } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface AvailabilityCalendarProps {
  weeklySlots: AvailabilitySlot[];
  overrides: DateOverride[];
  onDayClick: (date: Date) => void;
}

export function AvailabilityCalendar({ weeklySlots, overrides, onDayClick }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { language } = useLanguage();

  const overrideMap = useMemo(() => {
    const map = new Map<string, DateOverride[]>();
    for (const o of overrides) {
      const existing = map.get(o.date) || [];
      existing.push(o);
      map.set(o.date, existing);
    }
    return map;
  }, [overrides]);

  const weeks = getCalendarWeeks(currentMonth);

  const dayHeaders = language === 'es'
    ? ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEffectiveHours = (date: Date): { text: string; hasOverride: boolean; isBlocked: boolean } => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dateOverrides = overrideMap.get(dateKey);

    if (dateOverrides && dateOverrides.length > 0) {
      if (dateOverrides.some((o) => o.isBlocked)) {
        return {
          text: language === 'es' ? 'Bloqueado' : 'Blocked',
          hasOverride: true,
          isBlocked: true,
        };
      }
      const text = dateOverrides
        .filter((o) => o.startTime && o.endTime)
        .map((o) => `${o.startTime}-${o.endTime}`)
        .join(', ');
      return {
        text,
        hasOverride: true,
        isBlocked: false,
      };
    }

    const dayOfWeek = date.getDay();
    const daySlots = weeklySlots.filter((s) => s.dayOfWeek === dayOfWeek);
    if (daySlots.length === 0) {
      return { text: '', hasOverride: false, isBlocked: false };
    }

    const hoursText = daySlots.map((s) => `${s.startTime}-${s.endTime}`).join(', ');
    return { text: hoursText, hasOverride: false, isBlocked: false };
  };

  return (
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
          {format(currentMonth, 'MMMM yyyy', { locale: language === 'es' ? es : undefined })}
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
          const { text, hasOverride, isBlocked } = getEffectiveHours(date);

          return (
            <button
              key={index}
              onClick={() => isCurrentMonth && onDayClick(date)}
              disabled={!isCurrentMonth}
              className={`
                min-h-[60px] p-1 flex flex-col items-center justify-start text-sm rounded-lg transition-colors
                ${!isCurrentMonth ? 'opacity-40 cursor-default' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'}
                ${isTodayDate ? 'ring-2 ring-primary-500 ring-inset' : ''}
                ${hasOverride && !isBlocked && isCurrentMonth ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
              `}
            >
              <span className={`
                text-sm font-medium
                ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100'}
              `}>
                {format(date, 'd')}
              </span>
              {text && isCurrentMonth && (
                <span className={`
                  text-[10px] leading-tight mt-0.5 text-center
                  ${isBlocked
                    ? 'text-red-500 dark:text-red-400 line-through'
                    : hasOverride
                      ? 'text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {text}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
