import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useLanguage } from '../../contexts/LanguageContext';

type BookingFormData = {
  guestName: string;
  guestEmail: string;
  notes?: string;
};

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  onBack: () => void;
  isLoading?: boolean;
  accentColor?: string;
  price?: number;
  currency?: string;
}

export function BookingForm({ onSubmit, onBack, isLoading, accentColor, price, currency }: BookingFormProps) {
  const { t } = useLanguage();

  const bookingSchema = z.object({
    guestName: z.string().min(1, t('booking.nameRequired')),
    guestEmail: z.string().email(t('booking.invalidEmail')),
    notes: z.string().optional(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label={t('booking.yourName')}
        type="text"
        placeholder="Juan Pérez"
        error={errors.guestName?.message}
        {...register('guestName')}
      />
      <Input
        label={t('booking.yourEmail')}
        type="email"
        placeholder="tu@email.com"
        error={errors.guestEmail?.message}
        {...register('guestEmail')}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('booking.notes')}
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          rows={3}
          placeholder={t('booking.notesPlaceholder')}
          {...register('notes')}
        />
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          {t('common.back')}
        </Button>
        <Button
          type="submit"
          className="flex-1"
          isLoading={isLoading}
          style={accentColor ? { backgroundColor: accentColor } : undefined}
        >
          {price && price > 0
            ? `${t('booking.payAndBook')} $${price.toLocaleString()} ${currency || 'ARS'}`
            : t('booking.confirmBooking')}
        </Button>
      </div>
    </form>
  );
}
