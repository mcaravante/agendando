interface DayAvatarProps {
  dayLabel: string;
  hasSlots: boolean;
}

const DAY_INITIALS: Record<string, string> = {
  // Spanish
  'Domingo': 'D',
  'Lunes': 'L',
  'Martes': 'M',
  'Miercoles': 'X',
  'Jueves': 'J',
  'Viernes': 'V',
  'Sabado': 'S',
  // English
  'Sunday': 'Su',
  'Monday': 'M',
  'Tuesday': 'T',
  'Wednesday': 'W',
  'Thursday': 'Th',
  'Friday': 'F',
  'Saturday': 'Sa',
};

export function DayAvatar({ dayLabel, hasSlots }: DayAvatarProps) {
  const initial = DAY_INITIALS[dayLabel] || dayLabel.charAt(0);

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
        hasSlots
          ? 'bg-primary-900 dark:bg-primary-700 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
      }`}
    >
      {initial}
    </div>
  );
}
