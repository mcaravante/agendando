import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Calendar, Check } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MonthCalendar } from '../components/calendar/MonthCalendar';
import { TimeSlots } from '../components/calendar/TimeSlots';
import { BookingForm } from '../components/booking/BookingForm';
import { Button } from '../components/common/Button';
import { PageLoading } from '../components/common/Loading';
import { useTimezone, COMMON_TIMEZONES } from '../hooks/useTimezone';
import api from '../utils/api';
import { EventType, User, AvailableSlot } from '../types';
import toast from 'react-hot-toast';

type Step = 'date' | 'time' | 'form' | 'confirmed';

interface EventData {
  user: User;
  eventType: EventType;
}

export function BookingPage() {
  const { username, eventSlug } = useParams<{ username: string; eventSlug: string }>();
  const [searchParams] = useSearchParams();
  const { timezone, setTimezone } = useTimezone();

  // Check if embedded
  const isEmbed = searchParams.get('embed') === 'popup' || searchParams.get('embed') === 'inline';

  const [data, setData] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

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
    if (selectedDate) {
      loadSlots();
    }
  }, [selectedDate, timezone]);

  const loadEventData = async () => {
    try {
      const res = await api.get(`/public/${username}/${eventSlug}`);
      setData(res.data);

      // Available days could be loaded from the API in a future enhancement
      // For now, all days are available and the slot API will filter
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('Evento no encontrado');
      } else {
        setError('Error al cargar el evento');
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
      toast.error('Error al cargar horarios');
      setSlots([]);
    } finally {
      setIsSlotsLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep('time');
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setStep('form');
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
      setStep('confirmed');

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
        toast.error('Este horario ya no está disponible. Por favor, elige otro.');
        setStep('time');
        loadSlots();
      } else {
        toast.error(error.response?.data?.error || 'Error al crear la reserva');
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
            {error || 'Evento no encontrado'}
          </h1>
          <p className="text-gray-500 mb-4">
            La página que buscas no existe o no está disponible.
          </p>
          <Link to={`/${username}`} className="text-primary-600 hover:underline">
            Ver todos los eventos de {username}
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
              ¡Reserva Confirmada!
            </h1>
            <p className="text-gray-600 mb-4">
              Tu reunión con {data.user.name} ha sido programada.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
              <p className="font-semibold">{data.eventType.title}</p>
              <p className="text-sm text-gray-600">
                {selectedDate && format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
              </p>
              <p className="text-sm text-gray-600">
                {selectedSlot?.time} ({timezone})
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Recibirás un email de confirmación con los detalles de la reunión.
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
                  Volver
                </Link>
              )}

              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {data.user.avatarUrl ? (
                      <img
                        src={data.user.avatarUrl}
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
                    {data.eventType.duration} minutos
                  </div>
                  {data.eventType.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {{ meet: 'Google Meet', zoom: 'Zoom', phone: 'Teléfono', 'in-person': 'En persona' }[data.eventType.location] || data.eventType.location}
                    </div>
                  )}
                  {selectedDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                    </div>
                  )}
                  {selectedSlot && (
                    <div className="flex items-center gap-2 font-medium text-primary-600">
                      <Clock className="w-4 h-4" />
                      {selectedSlot.time}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <label className="block text-xs text-gray-500 mb-1">
                    Tu zona horaria
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
                  <h2 className="text-lg font-semibold mb-4 text-gray-900">Selecciona una fecha</h2>
                  <MonthCalendar
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    availableDays={availableDays}
                  />
                </div>
              )}

              {step === 'time' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Selecciona un horario</h2>
                    <Button variant="ghost" size="sm" onClick={() => setStep('date')}>
                      Cambiar fecha
                    </Button>
                  </div>
                  <div className="bg-white rounded-xl border p-6">
                    <TimeSlots
                      slots={slots}
                      selectedSlot={selectedSlot?.datetime || null}
                      onSlotSelect={handleSlotSelect}
                      isLoading={isSlotsLoading}
                      timezone={timezone}
                    />
                  </div>
                </div>
              )}

              {step === 'form' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900">Completa tus datos</h2>
                  <div className="bg-white rounded-xl border p-6">
                    <BookingForm
                      onSubmit={handleFormSubmit}
                      onBack={() => setStep('time')}
                      isLoading={isSubmitting}
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
