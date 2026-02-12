import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

const bookingSchema = z.object({
  guestName: z.string().min(1, 'El nombre es requerido'),
  guestEmail: z.string().email('Email inválido'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  onBack: () => void;
  isLoading?: boolean;
  accentColor?: string;
  price?: number;
  currency?: string;
}

export function BookingForm({ onSubmit, onBack, isLoading, accentColor, price, currency }: BookingFormProps) {
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
        label="Tu nombre"
        type="text"
        placeholder="Juan Pérez"
        error={errors.guestName?.message}
        {...register('guestName')}
      />
      <Input
        label="Tu email"
        type="email"
        placeholder="tu@email.com"
        error={errors.guestEmail?.message}
        {...register('guestEmail')}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas adicionales (opcional)
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          rows={3}
          placeholder="¿Algo que debamos saber antes de la reunión?"
          {...register('notes')}
        />
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button
          type="submit"
          className="flex-1"
          isLoading={isLoading}
          style={accentColor ? { backgroundColor: accentColor } : undefined}
        >
          {price && price > 0
            ? `Pagar $${price.toLocaleString()} ${currency || 'ARS'} y Reservar`
            : 'Confirmar Reserva'}
        </Button>
      </div>
    </form>
  );
}
