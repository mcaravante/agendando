import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Upload, Moon, Sun, Globe, Palette, Image, X, Check } from 'lucide-react';
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
  const [selectedColor, setSelectedColor] = useState(user?.brandColor || '');
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const profileSchema = z.object({
    name: z.string().min(1, t('profile.nameRequired')),
    timezone: z.string().min(1, t('profile.timezoneRequired')),
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
      toast.error(t('profile.imageOnly'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.imageSizeLimit'));
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
      toast.success(t('profile.avatarUpdated'));
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('toast.saveError'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success(t('profile.signedOut'));
    navigate('/login');
  };

  const COLOR_SWATCHES = [
    { value: '#3b82f6', label: 'Blue' },
    { value: '#ef4444', label: 'Red' },
    { value: '#22c55e', label: 'Green' },
    { value: '#8b5cf6', label: 'Violet' },
    { value: '#f97316', label: 'Orange' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#14b8a6', label: 'Teal' },
    { value: '#6366f1', label: 'Indigo' },
  ];

  const handleSaveBranding = async () => {
    setIsSavingBranding(true);
    try {
      const res = await api.patch('/users/me', {
        brandColor: selectedColor || null,
      });
      updateUser(res.data);
      toast.success(t('profile.brandingSaved'));
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('toast.saveError'));
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.imageOnly'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.imageSizeLimit'));
      return;
    }

    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await api.post('/users/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(res.data);
      toast.success(t('profile.brandingSaved'));
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('toast.saveError'));
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const res = await api.patch('/users/me', { logoUrl: null } as any);
      updateUser(res.data);
      toast.success(t('profile.brandingSaved'));
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('toast.saveError'));
    }
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
                  src={`/api${user.avatarUrl}`}
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

      {/* Branding Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          {t('profile.branding')}
        </h2>

        {/* Brand Color */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('profile.brandColor')}
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {COLOR_SWATCHES.map((swatch) => (
              <button
                key={swatch.value}
                type="button"
                onClick={() => setSelectedColor(swatch.value)}
                className="w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center"
                style={{
                  backgroundColor: swatch.value,
                  borderColor: selectedColor === swatch.value ? swatch.value : 'transparent',
                  boxShadow: selectedColor === swatch.value ? `0 0 0 2px white, 0 0 0 4px ${swatch.value}` : 'none',
                }}
                title={swatch.label}
              >
                {selectedColor === swatch.value && (
                  <Check className="w-5 h-5 text-white" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedColor || '#3b82f6'}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent p-0.5"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedColor || '#3b82f6'}
            </span>
          </div>
          <Button
            onClick={handleSaveBranding}
            className="mt-3"
            size="sm"
            isLoading={isSavingBranding}
            disabled={selectedColor === (user?.brandColor || '')}
          >
            {t('common.save')}
          </Button>
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('profile.logo')}
          </label>
          {user?.logoUrl ? (
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                <img
                  src={`/api${user.logoUrl}`}
                  alt="Logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
                  <Image className="w-4 h-4" />
                  {t('profile.logoUpload')}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                  {t('profile.logoRemove')}
                </button>
              </div>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
              <Image className="w-4 h-4" />
              {t('profile.logoUpload')}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={isUploadingLogo}
              />
            </label>
          )}
        </div>
      </div>

      {/* Preferences Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('profile.preferences')}
        </h2>

        {/* Language Selection */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Globe className="w-4 h-4" />
            {t('profile.language')}
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
            {t('profile.theme')}
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
