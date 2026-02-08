import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../utils/api';

interface Integration {
  provider: string;
  connected: boolean;
  accountEmail: string | null;
  connectedAt: string | null;
}

const integrationInfo: Record<string, { name: string; descriptionEn: string; descriptionEs: string; icon: React.ReactNode }> = {
  GOOGLE_CALENDAR: {
    name: 'Google Calendar',
    descriptionEn: 'Sync your bookings with Google Calendar and add Google Meet links automatically.',
    descriptionEs: 'Sincroniza tus reservas con Google Calendar y agrega enlaces de Google Meet automaticamente.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  ZOOM: {
    name: 'Zoom',
    descriptionEn: 'Create Zoom meetings automatically when bookings are made.',
    descriptionEs: 'Crea reuniones de Zoom automaticamente cuando se hacen reservas.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24">
        <rect fill="#2D8CFF" width="24" height="24" rx="4"/>
        <path fill="white" d="M7.5 9.5v5a1 1 0 001 1h5.5l2 2v-2h.5a1 1 0 001-1v-5a1 1 0 00-1-1H8.5a1 1 0 00-1 1zm10.5 1.5l2.5-2v6l-2.5-2v-2z"/>
      </svg>
    ),
  },
};

export function Integrations() {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();

    // Handle callback messages
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      toast.success(
        language === 'es'
          ? `${success === 'google' ? 'Google Calendar' : 'Zoom'} conectado exitosamente!`
          : `${success === 'google' ? 'Google Calendar' : 'Zoom'} connected successfully!`
      );
      window.history.replaceState({}, '', '/integrations');
    }

    if (error) {
      toast.error(
        language === 'es' ? `Error al conectar: ${error}` : `Failed to connect: ${error}`
      );
      window.history.replaceState({}, '', '/integrations');
    }
  }, [searchParams, language]);

  const fetchIntegrations = async () => {
    try {
      const response = await api.get('/integrations');
      setIntegrations(response.data);
    } catch (error) {
      toast.error(language === 'es' ? 'Error al cargar integraciones' : 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    try {
      const endpoint = provider === 'GOOGLE_CALENDAR' ? '/integrations/google/auth' : '/integrations/zoom/auth';
      const response = await api.get(endpoint);
      window.location.href = response.data.url;
    } catch (error: any) {
      toast.error(error.response?.data?.error || (language === 'es' ? 'Error al conectar' : 'Failed to connect'));
      setConnecting(null);
    }
  };

  const handleDisconnect = async (provider: string) => {
    if (!confirm(language === 'es' ? '¿Estas seguro de desconectar esta integracion?' : 'Are you sure you want to disconnect this integration?')) {
      return;
    }

    try {
      const endpoint = provider === 'GOOGLE_CALENDAR' ? '/integrations/google' : '/integrations/zoom';
      await api.delete(endpoint);
      toast.success(language === 'es' ? 'Integracion desconectada' : 'Integration disconnected');
      fetchIntegrations();
    } catch (error: any) {
      toast.error(error.response?.data?.error || (language === 'es' ? 'Error al desconectar' : 'Failed to disconnect'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.integrations')}</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {language === 'es'
            ? 'Conecta tus aplicaciones favoritas para mejorar tu experiencia de programacion.'
            : 'Connect your favorite apps to enhance your scheduling experience.'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {integrations.map((integration) => {
          const info = integrationInfo[integration.provider];
          if (!info) return null;

          return (
            <div
              key={integration.provider}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">{info.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{info.name}</h3>
                    {integration.connected && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                        {language === 'es' ? 'Conectado' : 'Connected'}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {language === 'es' ? info.descriptionEs : info.descriptionEn}
                  </p>

                  {integration.connected && integration.accountEmail && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {language === 'es' ? 'Conectado como:' : 'Connected as:'} {integration.accountEmail}
                    </p>
                  )}

                  <div className="mt-4">
                    {integration.connected ? (
                      <button
                        onClick={() => handleDisconnect(integration.provider)}
                        className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                      >
                        {language === 'es' ? 'Desconectar' : 'Disconnect'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(integration.provider)}
                        disabled={connecting === integration.provider}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {connecting === integration.provider
                          ? (language === 'es' ? 'Conectando...' : 'Connecting...')
                          : (language === 'es' ? 'Conectar' : 'Connect')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info section */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
          {language === 'es' ? 'Como funcionan las integraciones' : 'How integrations work'}
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>
              <strong>Google Calendar:</strong>{' '}
              {language === 'es'
                ? 'Crea eventos de calendario automaticamente cuando alguien reserva contigo. Si estableces la ubicacion del tipo de evento como "Google Meet", se creara un enlace de reunion automaticamente.'
                : 'Automatically creates calendar events when someone books with you. If you set an event type location to "Google Meet", a meeting link will be created automatically.'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>
              <strong>Zoom:</strong>{' '}
              {language === 'es'
                ? 'Crea reuniones de Zoom automaticamente cuando se hacen reservas para tipos de eventos con "Zoom" como ubicacion. El enlace de la reunion se incluye en los emails de confirmacion.'
                : 'Creates Zoom meetings automatically when bookings are made for event types with "Zoom" as the location. The meeting link is included in confirmation emails.'}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
