import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const waitlistSchema = z.object({
  guestName: z.string().min(1, 'Required'),
  guestEmail: z.string().email('Invalid email'),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

interface WaitlistFormProps {
  username: string;
  eventSlug: string;
  accentColor?: string;
}

export function WaitlistForm({ username, eventSlug, accentColor }: WaitlistFormProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  const onSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true);
    try {
      await api.post(`/public/${username}/${eventSlug}/waitlist`, data);
      setIsJoined(true);
    } catch {
      toast.error(t('waitlist.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isJoined) {
    return (
      <div className="text-center py-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: `${accentColor || '#3b82f6'}20` }}
        >
          <Check className="w-6 h-6" style={{ color: accentColor || '#3b82f6' }} />
        </div>
        <p className="font-medium text-gray-900">{t('waitlist.success')}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">{t('waitlist.title')}</h3>
      <p className="text-sm text-gray-500 mb-4">{t('waitlist.description')}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input
          label={t('waitlist.yourName')}
          type="text"
          placeholder="Juan Perez"
          error={errors.guestName?.message}
          {...register('guestName')}
        />
        <Input
          label={t('waitlist.yourEmail')}
          type="email"
          placeholder="tu@email.com"
          error={errors.guestEmail?.message}
          {...register('guestEmail')}
        />
        <Button
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
          style={accentColor ? { backgroundColor: accentColor } : undefined}
        >
          {t('waitlist.joinButton')}
        </Button>
      </form>
    </div>
  );
}
