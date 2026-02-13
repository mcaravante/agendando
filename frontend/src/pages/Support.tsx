import { Link } from 'react-router-dom';
import { Mail, FileText, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function Support() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">Agendando</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {language === 'es' ? 'Soporte' : 'Support'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {language === 'es'
            ? 'Estamos para ayudarte. Contactanos por cualquiera de los siguientes medios.'
            : 'We are here to help. Contact us through any of the following channels.'}
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {language === 'es'
                ? 'Escribinos y te respondemos lo antes posible.'
                : 'Write to us and we will respond as soon as possible.'}
            </p>
            <a href="mailto:soporte@agendando.com.ar" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              soporte@agendando.com.ar
            </a>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'es' ? 'Documentacion' : 'Documentation'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {language === 'es'
                ? 'Consulta nuestra guia para resolver dudas comunes.'
                : 'Check our guide to resolve common questions.'}
            </p>
            <Link to="/docs" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              {language === 'es' ? 'Ver documentacion' : 'View documentation'}
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Preguntas frecuentes' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-4">
            <FaqItem
              question={language === 'es' ? 'Como configuro mi disponibilidad?' : 'How do I set up my availability?'}
              answer={language === 'es'
                ? 'Anda a la seccion "Disponibilidad" en tu panel. Ahi podes definir los dias y horarios en que estas disponible para reuniones.'
                : 'Go to the "Availability" section in your dashboard. There you can define the days and times when you are available for meetings.'}
            />
            <FaqItem
              question={language === 'es' ? 'Como conecto Google Calendar?' : 'How do I connect Google Calendar?'}
              answer={language === 'es'
                ? 'Anda a "Integraciones" y hace clic en "Conectar" en Google Calendar. Se abrira una ventana para autorizar el acceso. Tus reuniones se sincronizaran automaticamente.'
                : 'Go to "Integrations" and click "Connect" on Google Calendar. A window will open to authorize access. Your meetings will sync automatically.'}
            />
            <FaqItem
              question={language === 'es' ? 'Como configuro eventos pagos con MercadoPago?' : 'How do I set up paid events with MercadoPago?'}
              answer={language === 'es'
                ? 'Primero conecta MercadoPago en "Integraciones". Luego, al crear o editar un tipo de evento, ingresa el precio. Los invitados pagaran antes de confirmar la reserva.'
                : 'First connect MercadoPago in "Integrations". Then, when creating or editing an event type, enter the price. Guests will pay before confirming the booking.'}
            />
            <FaqItem
              question={language === 'es' ? 'Como cancelo una reunion?' : 'How do I cancel a meeting?'}
              answer={language === 'es'
                ? 'Desde el panel en "Reservas", hace clic en la reunion que queres cancelar. Tambien podes cancelar desde el enlace en el email de confirmacion.'
                : 'From the dashboard in "Bookings", click the meeting you want to cancel. You can also cancel from the link in the confirmation email.'}
            />
          </div>
        </div>

        <div className="mt-10 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Privacidad y seguridad' : 'Privacy and security'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es'
                  ? 'Tu informacion esta protegida. Lee nuestra '
                  : 'Your information is protected. Read our '}
                <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
                  {language === 'es' ? 'Politica de Privacidad' : 'Privacy Policy'}
                </Link>
                {language === 'es' ? ' y nuestras ' : ' and our '}
                <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
                  {language === 'es' ? 'Condiciones del Servicio' : 'Terms of Service'}
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <summary className="cursor-pointer px-4 py-3 font-medium text-gray-900 dark:text-white list-none flex items-center justify-between">
        {question}
        <svg className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <p className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400">{answer}</p>
    </details>
  );
}
