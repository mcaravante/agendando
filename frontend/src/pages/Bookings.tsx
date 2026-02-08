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
  const { t, language } = useLanguage();
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
      toast.error(language === 'es' ? 'Error al cargar las reuniones' : 'Error loading meetings');
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
      toast.success(language === 'es' ? 'Reunión cancelada' : 'Meeting cancelled');
      setCancelId(null);
      loadBookings();
    } catch (error) {
      toast.error(language === 'es' ? 'Error al cancelar la reunión' : 'Error cancelling meeting');
    } finally {
      setIsCancelling(false);
    }
  };

  const filters: { value: Filter; label: string }[] = [
    { value: 'upcoming', label: language === 'es' ? 'Próximas' : 'Upcoming' },
    { value: 'past', label: language === 'es' ? 'Pasadas' : 'Past' },
    { value: 'cancelled', label: language === 'es' ? 'Canceladas' : 'Cancelled' },
    { value: 'all', label: language === 'es' ? 'Todas' : 'All' },
  ];

  const getEmptyMessage = () => {
    if (language === 'es') {
      return `No hay reuniones ${
        filter === 'upcoming'
          ? 'próximas'
          : filter === 'past'
          ? 'pasadas'
          : filter === 'cancelled'
          ? 'canceladas'
          : ''
      }`;
    }
    return `No ${
      filter === 'upcoming'
        ? 'upcoming'
        : filter === 'past'
        ? 'past'
        : filter === 'cancelled'
        ? 'cancelled'
        : ''
    } meetings`;
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
            title={language === 'es' ? 'Vista lista' : 'List view'}
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
            title={language === 'es' ? 'Vista calendario' : 'Calendar view'}
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
        title={language === 'es' ? 'Cancelar reunión' : 'Cancel meeting'}
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {language === 'es'
            ? '¿Estás seguro de que deseas cancelar esta reunión?'
            : 'Are you sure you want to cancel this meeting?'}
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" size="sm" onClick={() => setCancelId(null)}>
            {language === 'es' ? 'No, volver' : 'No, go back'}
          </Button>
          <Button variant="danger" size="sm" onClick={confirmCancel} isLoading={isCancelling}>
            {language === 'es' ? 'Sí, cancelar' : 'Yes, cancel'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
