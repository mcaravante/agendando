import { AvailableSlot } from '../../types';
import { Loading } from '../common/Loading';

interface TimeSlotsProps {
  slots: AvailableSlot[];
  selectedSlot: string | null;
  onSlotSelect: (slot: AvailableSlot) => void;
  isLoading?: boolean;
  timezone: string;
}

export function TimeSlots({
  slots,
  selectedSlot,
  onSlotSelect,
  isLoading,
  timezone,
}: TimeSlotsProps) {
  if (isLoading) {
    return <Loading text="Cargando horarios..." />;
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay horarios disponibles para esta fecha
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 mb-4">
        Horarios en tu zona: {timezone}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
        {slots.map((slot) => (
          <button
            key={slot.datetime}
            onClick={() => onSlotSelect(slot)}
            className={`
              px-4 py-2 text-sm rounded-lg border transition-colors
              ${selectedSlot === slot.datetime
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500 hover:bg-primary-50'
              }
            `}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
}
