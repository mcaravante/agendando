import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import api from '../../utils/api';
import { EventType } from '../../types';
import toast from 'react-hot-toast';

const eventTypeSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  slug: z
    .string()
    .min(1, 'El slug es requerido')
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().optional(),
  duration: z.coerce.number().min(5, 'Mínimo 5 minutos').max(480, 'Máximo 8 horas'),
  color: z.string(),
  location: z.string().optional(),
});

type EventTypeFormData = z.infer<typeof eventTypeSchema>;

const COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

const LOCATION_OPTIONS = [
  { value: '', label: 'Sin ubicación' },
  { value: 'meet', label: 'Google Meet' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'phone', label: 'Teléfono' },
  { value: 'in-person', label: 'En persona' },
];

interface CreateEventTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingEventType?: EventType | null;
}

export function CreateEventTypeModal({
  isOpen,
  onClose,
  onSuccess,
  editingEventType,
}: CreateEventTypeModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventTypeFormData>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues: {
      color: '#3b82f6',
      duration: 30,
    },
  });

  const selectedColor = watch('color');
  const selectedDuration = watch('duration');

  useEffect(() => {
    if (isOpen) {
      if (editingEventType) {
        reset({
          title: editingEventType.title,
          slug: editingEventType.slug,
          description: editingEventType.description || '',
          duration: editingEventType.duration,
          color: editingEventType.color,
          location: editingEventType.location || '',
        });
      } else {
        reset({
          title: '',
          slug: '',
          description: '',
          duration: 30,
          color: '#3b82f6',
          location: '',
        });
      }
    }
  }, [isOpen, editingEventType, reset]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const onSubmit = async (data: EventTypeFormData) => {
    try {
      if (editingEventType) {
        await api.patch(`/event-types/${editingEventType.id}`, data);
        toast.success('Evento actualizado');
      } else {
        await api.post('/event-types', data);
        toast.success('Evento creado');
      }
      onClose();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEventType ? 'Editar Evento' : 'Nuevo Evento'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Título"
          placeholder="Reunión de 30 minutos"
          error={errors.title?.message}
          {...register('title', {
            onChange: (e) => {
              if (!editingEventType) {
                setValue('slug', generateSlug(e.target.value));
              }
            },
          })}
        />

        <Input
          label="Slug (URL)"
          placeholder="reunion-30-min"
          error={errors.slug?.message}
          {...register('slug')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción (opcional)
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={2}
            placeholder="Una breve descripción de la reunión"
            {...register('description')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duración (minutos)
          </label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setValue('duration', d)}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  selectedDuration === d
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
          <input type="hidden" {...register('duration')} />
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <div className="flex gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={`w-8 h-8 rounded-full ${
                  selectedColor === color ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <input type="hidden" {...register('color')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación (opcional)
          </label>
          <div className="flex flex-wrap gap-2">
            {LOCATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('location', opt.value)}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  (watch('location') || '') === opt.value
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input type="hidden" {...register('location')} />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" isLoading={isSubmitting}>
            {editingEventType ? 'Guardar Cambios' : 'Crear Evento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
