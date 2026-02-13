import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Calendar, Check, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { es, enUS } from 'date-fns/locale';
import { MonthCalendar } from '../components/calendar/MonthCalendar';
import { TimeSlots } from '../components/calendar/TimeSlots';
import { BookingForm } from '../components/booking/BookingForm';
import { WaitlistForm } from '../components/booking/WaitlistForm';
import { Button } from '../components/common/Button';
import { PageLoading } from '../components/common/Loading';
import { useTimezone, COMMON_TIMEZONES } from '../hooks/useTimezone';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../utils/api';
import { EventType, User, AvailableSlot } from '../types';
import toast from 'react-hot-toast';

type Step = 'date' | 'time' | 'form' | 'confirmed';

const DEFAULT_BRAND_COLOR = '#3b82f6';

interface EventData {
  user: User;
  eventType: EventType;
}

export function BookingPage() {
  const { username, eventSlug } = useParams<{ username: string; eventSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { timezone, setTimezone } = useTimezone();
  const { t, language } = useLanguage();
  const dateFnsLocale = language === 'es' ? es : enUS;

  // Check if embedded
  const isEmbed = searchParams.get('embed') === 'popup' || searchParams.get('embed') === 'inline';

  // Derive step from URL search params (enables browser back/forward)
  const step: Step = (() => {
    const s = searchParams.get('step');
    if (s === 'time' || s === 'form' || s === 'confirmed') return s;
    return 'date';
  })();

  const navigateToStep = (newStep: Step, params?: Record<string, string>, options?: { replace?: boolean }) => {
    const newParams = new URLSearchParams();
    const embed = searchParams.get('embed');
    if (embed) newParams.set('embed', embed);
    if (newStep !== 'date') {
      newParams.set('step', newStep);
    }
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        newParams.set(k, v);
      }
    }
    setSearchParams(newParams, options);
  };

  const [data, setData] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());

  // Force light mode on public booking page
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
    loadEventData();
  }, [username, eventSlug]);

  useEffect(() => {
    loadAvailableDays(new Date());
  }, [username, eventSlug, timezone]);

  useEffect(() => {
    if (selectedDate) {
      loadSlots();
    }
  }, [selectedDate, timezone]);

  // Restore selectedDate from URL on refresh/direct navigation
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam && !selectedDate) {
      const [y, m, d] = dateParam.split('-').map(Number);
      setSelectedDate(new Date(y, m - 1, d));
    }
  }, [searchParams]);

  // Clear selectedSlot when navigating back to time or date step
  useEffect(() => {
    if (step === 'date' || step === 'time') {
      setSelectedSlot(null);
    }
  }, [step]);

  const loadAvailableDays = async (month: Date) => {
    try {
      const monthStr = format(month, 'yyyy-MM');
      const res = await api.get(`/public/${username}/${eventSlug}/available-days`, {
        params: { month: monthStr, timezone },
      });
      setAvailableDates(new Set(res.data));
    } catch {
      // Fallback: all days available
    }
  };

  const handleUnavailableClick = () => {
    toast(t('booking.noAvailabilityDay'), { icon: '📅' });
  };

  const loadEventData = async () => {
    try {
      const res = await api.get(`/public/${username}/${eventSlug}`);
      setData(res.data);

      // Available days could be loaded from the API in a future enhancement
      // For now, all days are available and the slot API will filter
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError(t('booking.notFound'));
      } else {
        setError(t('booking.eventLoadError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadSlots = async () => {
    if (!selectedDate) return;

    setIsSlotsLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await api.get(`/public/${username}/${eventSlug}/slots`, {
        params: { date: dateStr, timezone },
      });
      setSlots(res.data);
    } catch (error) {
      toast.error(t('booking.loadSlotsError'));
      setSlots([]);
    } finally {
      setIsSlotsLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    navigateToStep('time', { date: format(date, 'yyyy-MM-dd') });
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    navigateToStep('form', selectedDate ? { date: format(selectedDate, 'yyyy-MM-dd') } : undefined);
  };

  const handleFormSubmit = async (formData: { guestName: string; guestEmail: string; notes?: string }) => {
    if (!selectedSlot) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/bookings', {
        username,
        eventSlug,
        startTime: selectedSlot.datetime,
        guestTimezone: timezone,
        ...formData,
      });

      // If payment is required, redirect to MercadoPago
      if (response.data.requiresPayment && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
        return;
      }

      navigateToStep('confirmed', undefined, { replace: true });

      // Notify parent window if embedded
      if (isEmbed && window.parent !== window) {
        window.parent.postMessage({
          type: 'agendando-booked',
          booking: {
            id: response.data.id,
            eventTitle: data?.eventType.title,
            hostName: data?.user.name,
            guestName: formData.guestName,
            guestEmail: formData.guestEmail,
            startTime: selectedSlot.datetime,
            timezone,
          },
        }, '*');
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error(t('booking.slotTaken'));
        navigateToStep('time', { date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '' }, { replace: true });
        loadSlots();
      } else {
        toast.error(error.response?.data?.error || t('booking.createError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || t('booking.notFound')}
          </h1>
          <p className="text-gray-500 mb-4">
            {t('booking.notFoundMessage')}
          </p>
          <Link to={`/${username}`} className="text-primary-600 hover:underline">
            {t('booking.viewAllEvents')} {username}
          </Link>
        </div>
      </div>
    );
  }

  if (step === 'confirmed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl border p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('booking.confirmed')}
            </h1>
            <p className="text-gray-600 mb-4">
              {t('booking.confirmedMessage')}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
              <p className="font-semibold">{data.eventType.title}</p>
              <p className="text-sm text-gray-600">
                {selectedSlot && formatInTimeZone(selectedSlot.datetime, timezone, language === 'es' ? "EEEE d 'de' MMMM, yyyy" : "EEEE, MMMM d, yyyy", { locale: dateFnsLocale })}
              </p>
              <p className="text-sm text-gray-600">
                {selectedSlot && formatInTimeZone(selectedSlot.datetime, timezone, 'HH:mm')} ({timezone})
              </p>
            </div>
            <p className="text-sm text-gray-500">
              {t('booking.confirmationEmail')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar with event info */}
            <div className="md:col-span-1">
              {!isEmbed && (
                <Link
                  to={`/${username}`}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  {t('common.back')}
                </Link>
              )}

              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {data.user.avatarUrl ? (
                      <img
                        src={`/api${data.user.avatarUrl}`}
                        alt={data.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg text-gray-500">
                        {data.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{data.user.name}</p>
                  </div>
                </div>

                <h1 className="text-xl font-bold mb-2 text-gray-900">{data.eventType.title}</h1>

                {data.eventType.description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {data.eventType.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {data.eventType.duration} {t('common.minutes')}
                  </div>
                  {data.eventType.price != null && Number(data.eventType.price) > 0 && (
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <DollarSign className="w-4 h-4" />
                      ${Number(data.eventType.price).toLocaleString()} {data.eventType.currency || 'ARS'}
                    </div>
                  )}
                  {data.eventType.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {{ meet: t('location.meet'), zoom: t('location.zoom'), phone: t('location.phone'), 'in-person': t('location.inPerson') }[data.eventType.location] || data.eventType.location}
                    </div>
                  )}
                  {selectedSlot ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatInTimeZone(selectedSlot.datetime, timezone, language === 'es' ? "EEEE d 'de' MMMM" : "EEEE, MMMM d", { locale: dateFnsLocale })}
                    </div>
                  ) : selectedDate ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(selectedDate, language === 'es' ? "EEEE d 'de' MMMM" : "EEEE, MMMM d", { locale: dateFnsLocale })}
                    </div>
                  ) : null}
                  {selectedSlot && (
                    <div className="flex items-center gap-2 font-medium" style={{ color: data.user.brandColor || DEFAULT_BRAND_COLOR }}>
                      <Clock className="w-4 h-4" />
                      {formatInTimeZone(selectedSlot.datetime, timezone, 'HH:mm')}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('booking.yourTimezone')}
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full text-sm px-2 py-1 border rounded"
                  >
                    {COMMON_TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="md:col-span-2">
              {step === 'date' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900">{t('booking.selectDate')}</h2>
                  <MonthCalendar
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    availableDates={availableDates}
                    onUnavailableClick={handleUnavailableClick}
                    onMonthChange={loadAvailableDays}
                    accentColor={data.user.brandColor || DEFAULT_BRAND_COLOR}
                  />
                </div>
              )}

              {step === 'time' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">{t('booking.selectTime')}</h2>
                    <Button variant="ghost" size="sm" onClick={() => navigateToStep('date')}>
                      {t('booking.changeDate')}
                    </Button>
                  </div>
                  <div className="bg-white rounded-xl border p-6">
                    <TimeSlots
                      slots={slots}
                      selectedSlot={selectedSlot?.datetime || null}
                      onSlotSelect={handleSlotSelect}
                      isLoading={isSlotsLoading}
                      timezone={timezone}
                      accentColor={data.user.brandColor || DEFAULT_BRAND_COLOR}
                    />
                  </div>
                  {!isSlotsLoading && slots.length === 0 && (
                    <div className="mt-4 bg-white rounded-xl border p-6">
                      <WaitlistForm
                        username={username!}
                        eventSlug={eventSlug!}
                        accentColor={data.user.brandColor || DEFAULT_BRAND_COLOR}
                      />
                    </div>
                  )}
                </div>
              )}

              {step === 'form' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900">{t('booking.yourDetails')}</h2>
                  <div className="bg-white rounded-xl border p-6">
                    <BookingForm
                      onSubmit={handleFormSubmit}
                      onBack={() => navigateToStep('time', { date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '' })}
                      isLoading={isSubmitting}
                      accentColor={data.user.brandColor || DEFAULT_BRAND_COLOR}
                      price={data.eventType.price != null ? Number(data.eventType.price) : undefined}
                      currency={data.eventType.currency}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
