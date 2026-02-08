import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useLanguage } from '../../contexts/LanguageContext';

interface CopyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceDay: { value: number; label: string };
  days: { value: number; label: string }[];
  onCopy: (targetDays: number[]) => void;
}

export function CopyScheduleModal({
  isOpen,
  onClose,
  sourceDay,
  days,
  onCopy,
}: CopyScheduleModalProps) {
  const { language } = useLanguage();
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const toggleDay = (dayValue: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((d) => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  const handleApply = () => {
    if (selectedDays.length > 0) {
      onCopy(selectedDays);
      setSelectedDays([]);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedDays([]);
    onClose();
  };

  const availableDays = days.filter((d) => d.value !== sourceDay.value);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={language === 'es' ? 'Copiar horarios' : 'Copy schedule'}
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {language === 'es' ? 'Copiar horarios de' : 'Copy schedule from'}{' '}
          <span className="font-medium text-gray-900 dark:text-white">{sourceDay.label}</span>{' '}
          {language === 'es' ? 'a:' : 'to:'}
        </p>

        <div className="space-y-2">
          {availableDays.map((day) => (
            <label
              key={day.value}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedDays.includes(day.value)}
                onChange={() => toggleDay(day.value)}
                className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-900 dark:text-white">{day.label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            {language === 'es' ? 'Cancelar' : 'Cancel'}
          </Button>
          <Button
            onClick={handleApply}
            disabled={selectedDays.length === 0}
            className="flex-1"
          >
            {language === 'es' ? 'Aplicar' : 'Apply'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
