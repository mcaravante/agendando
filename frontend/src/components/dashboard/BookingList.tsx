import { Booking } from '../../types';
import { BookingCard } from '../booking/BookingCard';

interface BookingListProps {
  bookings: Booking[];
  timezone: string;
  onCancel: (id: string) => void;
  emptyMessage?: string;
}

export function BookingList({
  bookings,
  timezone,
  onCancel,
  emptyMessage = 'No hay reuniones',
}: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          timezone={timezone}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}
