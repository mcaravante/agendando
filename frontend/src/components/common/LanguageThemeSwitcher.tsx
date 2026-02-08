import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function LanguageThemeSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {/* Language Switcher */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
        <button
          onClick={() => setLanguage('es')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
            language === 'es'
              ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          title="Espanol"
        >
          <span className="text-base">🇪🇸</span>
          <span className="hidden sm:inline">ES</span>
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
            language === 'en'
              ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          title="English"
        >
          <span className="text-base">🇺🇸</span>
          <span className="hidden sm:inline">EN</span>
        </button>
      </div>

      {/* Theme Switcher */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        title={theme === 'light' ? 'Dark mode' : 'Light mode'}
      >
        {theme === 'light' ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
