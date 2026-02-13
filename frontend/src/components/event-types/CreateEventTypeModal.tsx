import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../utils/api';
import { EventType } from '../../types';
import toast from 'react-hot-toast';

type EventTypeFormData = {
  title: string;
  slug: string;
  description?: string;
  duration: number;
  color: string;
  location?: string;
  price?: number | null;
  currency?: string;
};

const COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

const LOCATION_KEYS = [
  { value: '', labelKey: 'eventTypes.modal.noLocation' },
  { value: 'meet', labelKey: 'location.meet' },
  { value: 'zoom', labelKey: 'location.zoom' },
  { value: 'phone', labelKey: 'location.phone' },
  { value: 'in-person', labelKey: 'location.inPerson' },
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
  const { t } = useLanguage();

  const eventTypeSchema = z.object({
    title: z.string().min(1, t('eventTypes.modal.titleRequired')),
    slug: z
      .string()
      .min(1, t('eventTypes.modal.slugRequired'))
      .regex(/^[a-z0-9-]+$/, t('eventTypes.modal.slugFormat')),
    description: z.string().optional(),
    duration: z.coerce.number().min(5, t('eventTypes.modal.durationMin')).max(480, t('eventTypes.modal.durationMax')),
    color: z.string(),
    location: z.string().optional(),
    price: z.coerce.number().min(0).nullable().optional(),
    currency: z.string().optional(),
  });

  const LOCATION_OPTIONS = LOCATION_KEYS.map((loc) => ({
    value: loc.value,
    label: t(loc.labelKey),
  }));

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
          price: editingEventType.price != null ? Number(editingEventType.price) : null,
          currency: editingEventType.currency || 'ARS',
        });
      } else {
        reset({
          title: '',
          slug: '',
          description: '',
          duration: 30,
          color: '#3b82f6',
          location: '',
          price: null,
          currency: 'ARS',
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
      // Convert empty price string to null
      const submitData = {
        ...data,
        price: data.price && Number(data.price) > 0 ? Number(data.price) : null,
      };
      if (editingEventType) {
        await api.patch(`/event-types/${editingEventType.id}`, submitData);
        toast.success(t('eventTypes.modal.updated'));
      } else {
        await api.post('/event-types', submitData);
        toast.success(t('eventTypes.modal.created'));
      }
      onClose();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('toast.saveError'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEventType ? t('eventTypes.editTitle') : t('eventTypes.new')}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('eventTypes.modal.titleLabel')}
          placeholder={t('eventTypes.modal.titlePlaceholder')}
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
          label={t('eventTypes.modal.slug')}
          placeholder={t('eventTypes.modal.slugPlaceholder')}
          error={errors.slug?.message}
          {...register('slug')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('eventTypes.modal.descriptionLabel')}
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={2}
            placeholder={t('eventTypes.modal.descriptionPlaceholder')}
            {...register('description')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('eventTypes.modal.durationLabel')}
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
            {t('eventTypes.modal.colorLabel')}
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
            {t('eventTypes.modal.locationLabel')}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('eventTypes.modal.priceLabel')}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder={t('eventTypes.modal.pricePlaceholder')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              {...register('price', { setValueAs: (v) => v === '' || v === null ? null : Number(v) })}
            />
            <span className="text-gray-500 text-sm">ARS</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {t('eventTypes.modal.priceHelp')}
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" className="flex-1" isLoading={isSubmitting}>
            {editingEventType ? t('eventTypes.modal.saveChanges') : t('eventTypes.modal.createEvent')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
