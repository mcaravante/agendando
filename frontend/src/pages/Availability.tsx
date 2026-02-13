import { useState, useEffect } from 'react';
import { Plus, X, Copy, Globe, List, CalendarDays } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { useLanguage } from '../contexts/LanguageContext';
import { TimeDropdown } from '../components/availability/TimeDropdown';
import { DayAvatar } from '../components/availability/DayAvatar';
import { CopyScheduleModal } from '../components/availability/CopyScheduleModal';
import { AvailabilityCalendar } from '../components/availability/AvailabilityCalendar';
import { DateOverrideModal } from '../components/availability/DateOverrideModal';
import api from '../utils/api';
import { Availability as AvailabilityType, SchedulingConfig, DateOverride } from '../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const DAY_KEYS = [
  'days.sunday', 'days.monday', 'days.tuesday', 'days.wednesday',
  'days.thursday', 'days.friday', 'days.saturday',
];

const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
});

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export function Availability() {
  const { t } = useLanguage();
  const DAYS = DAY_KEYS.map((key, i) => ({ value: i, label: t(key) }));

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [config, setConfig] = useState<SchedulingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState<{ value: number; label: string } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [availRes, configRes, overridesRes] = await Promise.all([
        api.get('/availability'),
        api.get('/availability/config'),
        api.get('/availability/overrides'),
      ]);
      setSlots(
        availRes.data.map((a: AvailabilityType) => ({
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
        }))
      );
      setConfig(configRes.data);
      setOverrides(overridesRes.data);
    } catch (error) {
      toast.error(t('availability.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/availability', { slots });
      toast.success(t('availability.saved'));
    } catch (error) {
      toast.error(t('toast.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigSave = async () => {
    if (!config) return;
    try {
      await api.patch('/availability/config', {
        bufferBefore: config.bufferBefore,
        bufferAfter: config.bufferAfter,
        minNotice: config.minNotice,
        maxDaysInAdvance: config.maxDaysInAdvance,
      });
      toast.success(t('availability.configSaved'));
    } catch (error) {
      toast.error(t('toast.saveError'));
    }
  };

  const addSlot = (dayOfWeek: number) => {
    setSlots([...slots, { dayOfWeek, startTime: '09:00', endTime: '17:00' }]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const getSlotsByDay = (dayOfWeek: number) => {
    return slots
      .map((slot, index) => ({ ...slot, index }))
      .filter((slot) => slot.dayOfWeek === dayOfWeek);
  };

  const openCopyModal = (day: { value: number; label: string }) => {
    setCopySourceDay(day);
    setCopyModalOpen(true);
  };

  const copyScheduleToOtherDays = (targetDays: number[]) => {
    if (!copySourceDay) return;
    const sourceSlots = slots.filter((s) => s.dayOfWeek === copySourceDay.value);
    const filteredSlots = slots.filter((s) => !targetDays.includes(s.dayOfWeek));
    const newSlots = targetDays.flatMap((targetDay) =>
      sourceSlots.map((slot) => ({ ...slot, dayOfWeek: targetDay }))
    );
    setSlots([...filteredSlots, ...newSlots]);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setOverrideModalOpen(true);
  };

  const getOverridesForDate = (date: Date): DateOverride[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return overrides.filter((o) => o.date === dateStr);
  };

  const getWeeklyHoursForDate = (date: Date): string | null => {
    const dayOfWeek = date.getDay();
    const daySlots = slots.filter((s) => s.dayOfWeek === dayOfWeek);
    if (daySlots.length === 0) return null;
    return daySlots.map((s) => `${s.startTime}-${s.endTime}`).join(', ');
  };

  const handleOverrideSave = async (data: { date: string; isBlocked: boolean; slots?: { startTime: string; endTime: string }[] }) => {
    try {
      await api.post('/availability/overrides', data);
      toast.success(t('availability.overrideSaved'));
      setOverrideModalOpen(false);
      const res = await api.get('/availability/overrides');
      setOverrides(res.data);
    } catch (error) {
      toast.error(t('toast.saveError'));
    }
  };

  const handleOverrideDelete = async (date: string) => {
    try {
      await api.delete(`/availability/overrides/${date}`);
      toast.success(t('availability.overrideDeleted'));
      setOverrideModalOpen(false);
      const res = await api.get('/availability/overrides');
      setOverrides(res.data);
    } catch (error) {
      toast.error(t('toast.deleteError'));
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.availability')}</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title={t('availability.listView')}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title={t('availability.calendarView')}
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
          {viewMode === 'list' && (
            <Button onClick={handleSave} isLoading={isSaving}>
              {t('availability.saveChanges')}
            </Button>
          )}
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {t('availability.weeklyHours')}
          </h2>

          <div className="space-y-4">
            {DAYS.map((day) => {
              const daySlots = getSlotsByDay(day.value);
              const hasSlots = daySlots.length > 0;

              return (
                <div key={day.value} className="flex items-start gap-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <DayAvatar dayLabel={day.label} hasSlots={hasSlots} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">{day.label}</span>
                    </div>

                    {!hasSlots ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {t('availability.notAvailable')}
                        </span>
                        <button
                          type="button"
                          onClick={() => addSlot(day.value)}
                          className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-500 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {daySlots.map((slot, slotIndex) => (
                          <div key={slot.index} className="flex items-center gap-2 flex-wrap">
                            <TimeDropdown
                              value={slot.startTime}
                              onChange={(value) => updateSlot(slot.index, 'startTime', value)}
                              options={TIME_OPTIONS}
                            />
                            <span className="text-gray-400">-</span>
                            <TimeDropdown
                              value={slot.endTime}
                              onChange={(value) => updateSlot(slot.index, 'endTime', value)}
                              options={TIME_OPTIONS}
                            />

                            <div className="flex items-center gap-1 ml-2">
                              <button
                                type="button"
                                onClick={() => removeSlot(slot.index)}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                title={t('availability.removeSlot')}
                              >
                                <X className="w-4 h-4" />
                              </button>

                              {slotIndex === daySlots.length - 1 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => addSlot(day.value)}
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    title={t('availability.addSlot')}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openCopyModal(day)}
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    title={t('availability.copyToOtherDays')}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Globe className="w-4 h-4" />
            <span>
              {t('availability.timezone')}: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </span>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <AvailabilityCalendar
            weeklySlots={slots}
            overrides={overrides}
            onDayClick={handleDayClick}
          />
        </div>
      )}

      {config && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('availability.config')}
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('availability.bufferBefore')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={config.bufferBefore}
                  onChange={(e) =>
                    setConfig({ ...config, bufferBefore: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('availability.bufferBeforeDesc')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('availability.bufferAfter')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={config.bufferAfter}
                  onChange={(e) =>
                    setConfig({ ...config, bufferAfter: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('availability.bufferAfterDesc')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('availability.minNotice')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={config.minNotice}
                  onChange={(e) =>
                    setConfig({ ...config, minNotice: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('availability.minNoticeDesc')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('availability.maxDays')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={config.maxDaysInAdvance}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maxDaysInAdvance: parseInt(e.target.value) || 60,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('availability.maxDaysDesc')}
                </p>
              </div>
            </div>

            <Button onClick={handleConfigSave} variant="secondary">
              {t('availability.saveConfig')}
            </Button>
          </div>
        </div>
      )}

      {copySourceDay && (
        <CopyScheduleModal
          isOpen={copyModalOpen}
          onClose={() => setCopyModalOpen(false)}
          sourceDay={copySourceDay}
          days={DAYS}
          onCopy={copyScheduleToOtherDays}
        />
      )}

      {selectedDate && (
        <DateOverrideModal
          isOpen={overrideModalOpen}
          onClose={() => setOverrideModalOpen(false)}
          date={selectedDate}
          existingOverrides={getOverridesForDate(selectedDate)}
          weeklyHours={getWeeklyHoursForDate(selectedDate)}
          onSave={handleOverrideSave}
          onDelete={handleOverrideDelete}
        />
      )}
    </div>
  );
}
