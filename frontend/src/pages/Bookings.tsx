import { useState, useEffect } from 'react';
import { List, CalendarDays } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { BookingList } from '../components/dashboard/BookingList';
import { BookingsCalendar } from '../components/dashboard/BookingsCalendar';
import api from '../utils/api';
import { Booking } from '../types';
import toast from 'react-hot-toast';

type Filter = 'upcoming' | 'past' | 'cancelled' | 'all';

export function Bookings() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('upcoming');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/bookings', { params: { filter } });
      setBookings(res.data);
    } catch (error) {
      toast.error(t('bookings.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (id: string) => {
    setCancelId(id);
  };

  const confirmCancel = async () => {
    if (!cancelId) return;
    setIsCancelling(true);
    try {
      await api.patch(`/bookings/${cancelId}/cancel`);
      toast.success(t('bookings.meetingCancelled'));
      setCancelId(null);
      loadBookings();
    } catch (error) {
      toast.error(t('bookings.cancelError'));
    } finally {
      setIsCancelling(false);
    }
  };

  const filters: { value: Filter; label: string }[] = [
    { value: 'upcoming', label: t('bookings.upcoming') },
    { value: 'past', label: t('bookings.past') },
    { value: 'cancelled', label: t('bookings.cancelled') },
    { value: 'all', label: t('bookings.all') },
  ];

  const getEmptyMessage = () => {
    switch (filter) {
      case 'upcoming': return t('bookings.noUpcoming');
      case 'past': return t('bookings.noPast');
      case 'cancelled': return t('bookings.noCancelled');
      default: return t('bookings.noMeetings');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('nav.bookings')}</h1>

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            title={t('bookings.listView')}
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
            title={t('bookings.calendarView')}
          >
            <CalendarDays className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : viewMode === 'calendar' ? (
        <BookingsCalendar
          bookings={bookings}
          timezone={user?.timezone || 'America/Argentina/Buenos_Aires'}
          onCancel={handleCancel}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <BookingList
            bookings={bookings}
            timezone={user?.timezone || 'America/Argentina/Buenos_Aires'}
            onCancel={handleCancel}
            emptyMessage={getEmptyMessage()}
          />
        </div>
      )}

      <Modal
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        title={t('bookings.cancelMeetingTitle')}
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t('bookings.confirmCancelMessage')}
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" size="sm" onClick={() => setCancelId(null)}>
            {t('bookings.cancelGoBack')}
          </Button>
          <Button variant="danger" size="sm" onClick={confirmCancel} isLoading={isCancelling}>
            {t('bookings.cancelConfirm')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
