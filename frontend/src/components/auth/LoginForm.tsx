import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import toast from 'react-hot-toast';
import { useState } from 'react';

type LoginFormData = {
  email: string;
  password: string;
};

export function LoginForm() {
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const loginSchema = z.object({
    email: z.string().email(language === 'es' ? 'Email invalido' : 'Invalid email'),
    password: z.string().min(1, language === 'es' ? 'La contrasena es requerida' : 'Password is required'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success(language === 'es' ? 'Bienvenido!' : 'Welcome!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || (language === 'es' ? 'Error al iniciar sesion' : 'Login error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label={t('auth.email')}
        type="email"
        placeholder="you@email.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label={t('auth.password')}
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" className="w-full" isLoading={isLoading}>
        {t('auth.login')}
      </Button>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:underline">
          {t('auth.register')}
        </Link>
      </p>
    </form>
  );
}
