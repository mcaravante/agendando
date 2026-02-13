import { AvailableSlot } from '../../types';
import { Loading } from '../common/Loading';
import { useLanguage } from '../../contexts/LanguageContext';

interface TimeSlotsProps {
  slots: AvailableSlot[];
  selectedSlot: string | null;
  onSlotSelect: (slot: AvailableSlot) => void;
  isLoading?: boolean;
  timezone: string;
  accentColor?: string;
}

export function TimeSlots({
  slots,
  selectedSlot,
  onSlotSelect,
  isLoading,
  timezone,
  accentColor,
}: TimeSlotsProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return <Loading text={t('booking.loadingSlots')} />;
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('booking.noSlots')}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 mb-4">
        {t('booking.timesInTimezone')} {timezone}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
        {slots.map((slot) => {
          const isSelected = selectedSlot === slot.datetime;
          return (
            <button
              key={slot.datetime}
              onClick={() => onSlotSelect(slot)}
              className={`
                px-4 py-2 text-sm rounded-lg border transition-colors
                ${!accentColor && isSelected ? 'bg-primary-600 text-white border-primary-600' : ''}
                ${!accentColor && !isSelected ? 'bg-white text-gray-700 border-gray-300 hover:border-primary-500 hover:bg-primary-50' : ''}
                ${accentColor && !isSelected ? 'bg-white text-gray-700 border-gray-300' : ''}
              `}
              style={accentColor ? {
                ...(isSelected
                  ? { backgroundColor: accentColor, color: 'white', borderColor: accentColor }
                  : {}),
              } : undefined}
              onMouseEnter={accentColor && !isSelected ? (e) => {
                e.currentTarget.style.borderColor = accentColor;
              } : undefined}
              onMouseLeave={accentColor && !isSelected ? (e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
              } : undefined}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );
}
