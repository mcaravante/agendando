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

type RegisterFormData = {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const registerSchema = z.object({
    name: z.string().min(1, language === 'es' ? 'El nombre es requerido' : 'Name is required'),
    email: z.string().email(language === 'es' ? 'Email invalido' : 'Invalid email'),
    username: z
      .string()
      .min(3, language === 'es' ? 'El usuario debe tener al menos 3 caracteres' : 'Username must be at least 3 characters')
      .max(30, language === 'es' ? 'El usuario debe tener maximo 30 caracteres' : 'Username must be at most 30 characters')
      .regex(
        /^[a-z0-9-]+$/,
        language === 'es'
          ? 'El usuario solo puede contener letras minusculas, numeros y guiones'
          : 'Username can only contain lowercase letters, numbers and hyphens'
      ),
    password: z.string().min(8, language === 'es' ? 'La contrasena debe tener al menos 8 caracteres' : 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: language === 'es' ? 'Las contrasenas no coinciden' : 'Passwords do not match',
    path: ['confirmPassword'],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        username: data.username,
        password: data.password,
      });
      toast.success(language === 'es' ? 'Cuenta creada exitosamente!' : 'Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || (language === 'es' ? 'Error al crear la cuenta' : 'Error creating account'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label={t('auth.name')}
        type="text"
        placeholder={language === 'es' ? 'Tu nombre' : 'Your name'}
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label={t('auth.email')}
        type="email"
        placeholder={language === 'es' ? 'tu@email.com' : 'you@email.com'}
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label={language === 'es' ? 'Usuario' : 'Username'}
        type="text"
        placeholder={language === 'es' ? 'tu-usuario' : 'your-username'}
        error={errors.username?.message}
        {...register('username')}
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
        {language === 'es' ? 'Este sera tu URL:' : 'This will be your URL:'} agendando.com/<span className="font-medium">{language === 'es' ? 'tu-usuario' : 'your-username'}</span>
      </p>
      <Input
        label={t('auth.password')}
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label={language === 'es' ? 'Confirmar Contrasena' : 'Confirm Password'}
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" className="w-full" isLoading={isLoading}>
        {language === 'es' ? 'Crear Cuenta' : 'Create Account'}
      </Button>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {language === 'es' ? '¿Ya tienes cuenta?' : 'Already have an account?'}{' '}
        <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </form>
  );
}
