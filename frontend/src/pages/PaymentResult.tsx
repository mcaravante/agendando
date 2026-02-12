import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Check, X, Clock, MapPin, Calendar, User } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../utils/api';

interface BookingDetails {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  guestTimezone: string;
  paymentStatus: string | null;
  eventType: {
    title: string;
    slug: string;
    duration: number;
    location: string | null;
    price: number | null;
    currency: string | null;
  };
  host: {
    name: string;
    username: string;
    avatarUrl: string | null;
    brandColor: string | null;
    timezone: string;
  };
}

const LOCATION_LABELS: Record<string, Record<string, string>> = {
  es: { meet: 'Google Meet', zoom: 'Zoom', phone: 'Teléfono', 'in-person': 'En persona' },
  en: { meet: 'Google Meet', zoom: 'Zoom', phone: 'Phone', 'in-person': 'In person' },
};

export function PaymentResult() {
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const VALID_STATUSES = ['success', 'failure', 'pending'] as const;
  const rawStatus = searchParams.get('status') || 'pending';
  const status = VALID_STATUSES.includes(rawStatus as any) ? rawStatus : 'pending';
  const bookingId = searchParams.get('external_reference');

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(!!bookingId);

  // Force light mode
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.remove('dark');
    root.classList.add('light');

    return () => {
      if (wasDark) {
        root.classList.remove('light');
        root.classList.add('dark');
      }
    };
  }, []);

  useEffect(() => {
    if (!bookingId) return;

    api.get(`/public/bookings/${bookingId}`)
      .then((res) => setBooking(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [bookingId]);

  const statusConfig = {
    success: {
      icon: <Check className="w-8 h-8 text-green-600" />,
      bg: 'bg-green-100',
      title: t('payment.confirmed'),
      message: t('booking.confirmationEmail'),
      color: 'text-green-600',
    },
    failure: {
      icon: <X className="w-8 h-8 text-red-600" />,
      bg: 'bg-red-100',
      title: t('payment.failed'),
      message: t('payment.failedMessage'),
      color: 'text-red-600',
    },
    pending: {
      icon: <Clock className="w-8 h-8 text-yellow-600" />,
      bg: 'bg-yellow-100',
      title: t('payment.pending'),
      message: t('payment.processingMessage'),
      color: 'text-yellow-600',
    },
  }[status] || {
    icon: <Clock className="w-8 h-8 text-gray-600" />,
    bg: 'bg-gray-100',
    title: t('payment.pending'),
    message: t('payment.processingMessage'),
    color: 'text-gray-600',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const locationLabel = booking?.eventType.location
    ? (LOCATION_LABELS[language]?.[booking.eventType.location] || booking.eventType.location)
    : null;

  const dateFormat = language === 'es' ? "EEEE d 'de' MMMM, yyyy" : 'EEEE, MMMM d, yyyy';
  const dateLocale = language === 'es' ? { locale: es } : undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl border p-8 text-center">
          {/* Status icon */}
          <div className={`w-16 h-16 ${statusConfig.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {statusConfig.icon}
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${statusConfig.color}`}>
            {statusConfig.title}
          </h1>

          {/* Booking details */}
          {booking ? (
            <>
              <div className="bg-gray-50 rounded-lg p-4 text-left mt-4 mb-4 space-y-3">
                {/* Host */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {booking.host.avatarUrl ? (
                      <img
                        src={`/api${booking.host.avatarUrl}`}
                        alt={booking.host.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{booking.eventType.title}</p>
                    <p className="text-sm text-gray-600">{booking.host.name}</p>
                  </div>
                </div>

                {/* Date and time */}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>
                    {formatInTimeZone(booking.startTime, booking.guestTimezone, dateFormat, dateLocale)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>
                    {formatInTimeZone(booking.startTime, booking.guestTimezone, 'HH:mm')}
                    {' - '}
                    {formatInTimeZone(booking.endTime, booking.guestTimezone, 'HH:mm')}
                    {' '}({booking.guestTimezone})
                  </span>
                </div>

                {/* Location */}
                {locationLabel && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{locationLabel}</span>
                  </div>
                )}
              </div>

              {/* Status-specific message */}
              <p className="text-sm text-gray-500 mb-6">
                {statusConfig.message}
              </p>

              {/* Failure: retry button */}
              {status === 'failure' && (
                <Link
                  to={`/${booking.host.username}/${booking.eventType.slug}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('payment.retry')}
                </Link>
              )}
            </>
          ) : (
            <>
              {/* Fallback: no booking details */}
              <p className="text-gray-600 mb-6">
                {statusConfig.message}
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('common.back')}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
