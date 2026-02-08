import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface TimeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export function TimeDropdown({ value, onChange, options }: TimeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedIndex = options.indexOf(value);
      if (selectedIndex > -1) {
        const itemHeight = 36;
        listRef.current.scrollTop = selectedIndex * itemHeight - 72;
      }
    }
  }, [isOpen, value, options]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg min-w-[100px] text-sm text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <span className="flex-1 text-left">{value}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {options.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => {
                onChange(time);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
                time === value ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
