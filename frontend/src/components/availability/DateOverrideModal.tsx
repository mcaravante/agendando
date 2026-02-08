import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TimeDropdown } from './TimeDropdown';
import { useLanguage } from '../../contexts/LanguageContext';
import { DateOverride } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
});

interface Slot {
  startTime: string;
  endTime: string;
}

interface DateOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  existingOverrides: DateOverride[];
  weeklyHours: string | null;
  onSave: (data: { date: string; isBlocked: boolean; slots?: Slot[] }) => void;
  onDelete: (date: string) => void;
}

export function DateOverrideModal({
  isOpen,
  onClose,
  date,
  existingOverrides,
  weeklyHours,
  onSave,
  onDelete,
}: DateOverrideModalProps) {
  const { language } = useLanguage();
  const [isBlocked, setIsBlocked] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([{ startTime: '09:00', endTime: '17:00' }]);

  useEffect(() => {
    if (existingOverrides.length > 0) {
      const blocked = existingOverrides.some((o) => o.isBlocked);
      setIsBlocked(blocked);
      if (!blocked) {
        setSlots(
          existingOverrides
            .filter((o) => o.startTime && o.endTime)
            .map((o) => ({ startTime: o.startTime!, endTime: o.endTime! }))
        );
      } else {
        setSlots([{ startTime: '09:00', endTime: '17:00' }]);
      }
    } else {
      setIsBlocked(false);
      setSlots([{ startTime: '09:00', endTime: '17:00' }]);
    }
  }, [existingOverrides, date]);

  const dateStr = format(date, 'yyyy-MM-dd');
  const title = format(date, "d 'de' MMMM 'de' yyyy", {
    locale: language === 'es' ? es : undefined,
  });

  const isValid = isBlocked || slots.every((s) => s.startTime < s.endTime);

  const addSlot = () => {
    const lastSlot = slots[slots.length - 1];
    setSlots([...slots, { startTime: lastSlot.endTime, endTime: '18:00' }]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const handleSave = () => {
    if (!isValid) return;
    if (isBlocked) {
      onSave({ date: dateStr, isBlocked: true });
    } else {
      onSave({ date: dateStr, isBlocked: false, slots });
    }
  };

  const handleDelete = () => {
    onDelete(dateStr);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        {weeklyHours && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {language === 'es' ? 'Horario semanal' : 'Weekly hours'}: {weeklyHours}
          </p>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isBlocked}
            onChange={(e) => setIsBlocked(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {language === 'es' ? 'Bloquear este dia' : 'Block this day'}
          </span>
        </label>

        {!isBlocked && (
          <div className="space-y-2">
            {slots.map((slot, index) => (
              <div key={index} className="flex items-center gap-2">
                <TimeDropdown
                  value={slot.startTime}
                  onChange={(value) => updateSlot(index, 'startTime', value)}
                  options={TIME_OPTIONS}
                />
                <span className="text-gray-400">-</span>
                <TimeDropdown
                  value={slot.endTime}
                  onChange={(value) => updateSlot(index, 'endTime', value)}
                  options={TIME_OPTIONS}
                />

                <div className="flex items-center gap-1 ml-1">
                  {slots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlot(index)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title={language === 'es' ? 'Eliminar' : 'Remove'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {index === slots.length - 1 && (
                    <button
                      type="button"
                      onClick={addSlot}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title={language === 'es' ? 'Agregar horario' : 'Add time'}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isBlocked && slots.some((s) => s.startTime >= s.endTime) && (
          <p className="text-sm text-red-500">
            {language === 'es'
              ? 'La hora de inicio debe ser anterior a la hora de fin'
              : 'Start time must be before end time'}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div>
            {existingOverrides.length > 0 && (
              <Button variant="danger" size="sm" onClick={handleDelete}>
                {language === 'es' ? 'Eliminar' : 'Delete'}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              {language === 'es' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!isValid}>
              {language === 'es' ? 'Guardar' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
