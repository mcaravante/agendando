import { useState, useEffect } from 'react';
import { getTimezone } from '../utils/date';

export function useTimezone() {
  const [timezone, setTimezone] = useState<string>(getTimezone());

  useEffect(() => {
    const stored = localStorage.getItem('timezone');
    if (stored) {
      setTimezone(stored);
    }
  }, []);

  const changeTimezone = (tz: string) => {
    setTimezone(tz);
    localStorage.setItem('timezone', tz);
  };

  return { timezone, setTimezone: changeTimezone };
}

// Common timezones for the selector
export const COMMON_TIMEZONES = [
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
  { value: 'America/Sao_Paulo', label: 'Sao Paulo (GMT-3)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'America/Chicago', label: 'Chicago (GMT-6)' },
  { value: 'America/Denver', label: 'Denver (GMT-7)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
  { value: 'America/Mexico_City', label: 'Mexico City (GMT-6)' },
  { value: 'America/Santiago', label: 'Santiago (GMT-4)' },
  { value: 'America/Bogota', label: 'Bogota (GMT-5)' },
  { value: 'America/Lima', label: 'Lima (GMT-5)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
  { value: 'Europe/Berlin', label: 'Berlin (GMT+1)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
  { value: 'Europe/Rome', label: 'Rome (GMT+1)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (GMT+1)' },
  { value: 'Europe/Moscow', label: 'Moscow (GMT+3)' },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
  { value: 'Asia/Kolkata', label: 'Mumbai (GMT+5:30)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (GMT+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+11)' },
  { value: 'Pacific/Auckland', label: 'Auckland (GMT+13)' },
];
