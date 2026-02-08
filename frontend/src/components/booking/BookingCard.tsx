import { Calendar, Clock, User, Mail, MapPin, X } from 'lucide-react';
import { Booking } from '../../types';
import { formatDateInTimezone, formatTime } from '../../utils/date';
import { Button } from '../common/Button';

interface BookingCardProps {
  booking: Booking;
  timezone: string;
  onCancel?: (id: string) => void;
  showCancelButton?: boolean;
}

export function BookingCard({
  booking,
  timezone,
  onCancel,
  showCancelButton = true,
}: BookingCardProps) {
  const isCancelled = booking.status === 'CANCELLED';
  const isPast = new Date(booking.endTime) < new Date();

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${
        isCancelled ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className="w-2 h-full min-h-[60px] rounded-full"
            style={{ backgroundColor: booking.eventType?.color || '#3b82f6' }}
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {booking.eventType?.title}
              {isCancelled && (
                <span className="ml-2 text-xs text-red-600 dark:text-red-400 font-normal">
                  (Cancelada)
                </span>
              )}
            </h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDateInTimezone(booking.startTime, timezone, 'PPP')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {formatTime(booking.startTime, timezone)} -{' '}
                  {formatTime(booking.endTime, timezone)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{booking.guestName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{booking.guestEmail}</span>
              </div>
              {booking.eventType?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{{ meet: 'Google Meet', zoom: 'Zoom', phone: 'Teléfono', 'in-person': 'En persona' }[booking.eventType.location!] || booking.eventType.location}</span>
                </div>
              )}
            </div>
            {booking.notes && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Notas:</span> {booking.notes}
              </p>
            )}
          </div>
        </div>

        {showCancelButton && !isCancelled && !isPast && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(booking.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
