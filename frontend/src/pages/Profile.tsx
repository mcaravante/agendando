import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Upload, Moon, Sun, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { COMMON_TIMEZONES } from '../hooks/useTimezone';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type ProfileFormData = {
  name: string;
  timezone: string;
};

export function Profile() {
  const { user, logout, updateUser } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const profileSchema = z.object({
    name: z.string().min(1, language === 'es' ? 'El nombre es requerido' : 'Name is required'),
    timezone: z.string().min(1, language === 'es' ? 'La zona horaria es requerida' : 'Timezone is required'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      timezone: user?.timezone || 'America/Argentina/Buenos_Aires',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const res = await api.patch('/users/me', data);
      updateUser(res.data);
      toast.success(t('profile.saved'));
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('toast.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'es' ? 'Solo se permiten imagenes' : 'Only images allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'es' ? 'La imagen no puede superar 5MB' : 'Image must be under 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(res.data);
      toast.success(language === 'es' ? 'Avatar actualizado' : 'Avatar updated');
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('toast.saveError'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success(language === 'es' ? 'Sesion cerrada' : 'Signed out');
    navigate('/login');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profile.title')}</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          {t('nav.signOut')}
        </Button>
      </div>

      {/* Personal Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('profile.personalInfo')}</h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl text-gray-500 dark:text-gray-400">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
              <Upload className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </label>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{user?.name}</h3>
            <p className="text-gray-500 dark:text-gray-400">@{user?.username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t('auth.name')}
            error={errors.name?.message}
            {...register('name')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('profile.timezone')}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              {...register('timezone')}
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            {errors.timezone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.timezone.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" isLoading={isSaving}>
            {t('common.save')}
          </Button>
        </form>
      </div>

      {/* Preferences Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {language === 'es' ? 'Preferencias' : 'Preferences'}
        </h2>

        {/* Language Selection */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Globe className="w-4 h-4" />
            {language === 'es' ? 'Idioma' : 'Language'}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                language === 'es'
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">🇪🇸</span>
              <span>Espanol</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                language === 'en'
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">🇺🇸</span>
              <span>English</span>
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {language === 'es' ? 'Tema' : 'Theme'}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                theme === 'light'
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>{t('theme.light')}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>{t('theme.dark')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
