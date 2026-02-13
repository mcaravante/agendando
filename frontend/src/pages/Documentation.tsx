import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export function Documentation() {
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
          {language === 'es' ? 'Documentacion' : 'Documentation'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-10">
          {language === 'es'
            ? 'Guia completa para usar Agendando y sus integraciones.'
            : 'Complete guide to using Agendando and its integrations.'}
        </p>

        {language === 'es' ? (
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Primeros pasos</h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Crea tu cuenta</h3>
                  <p className="text-sm">Registrate con tu email. Vas a poder configurar tu nombre, zona horaria y foto de perfil desde la seccion de Perfil.</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Configura tu disponibilidad</h3>
                  <p className="text-sm">En "Disponibilidad", defini los dias y horarios en que podes recibir reuniones. Podes configurar franjas horarias diferentes para cada dia y agregar excepciones para fechas especificas.</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Crea tipos de evento</h3>
                  <p className="text-sm">En "Tipos de Evento", crea diferentes tipos de reuniones (ej: "Llamada de 15 min", "Consulta de 1 hora"). Configura la duracion, ubicacion (Zoom, Google Meet, telefono, presencial) y opcionalmente un precio.</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4. Comparte tu link</h3>
                  <p className="text-sm">Tu pagina publica es <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">agendando.com.ar/tu-usuario</code>. Compartilo por email, redes sociales o tu sitio web para que otros reserven reuniones.</p>
                </div>
              </div>
            </section>

            <section id="zoom">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Integracion con Zoom</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>La integracion con Zoom crea reuniones automaticamente cuando alguien reserva un evento con "Zoom" como ubicacion.</p>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">Como conectar</h3>
                <ol className="list-decimal pl-6 space-y-1 text-sm">
                  <li>Anda a <strong>Integraciones</strong> en tu panel de control.</li>
                  <li>Hace clic en <strong>"Conectar"</strong> en la tarjeta de Zoom.</li>
                  <li>Se abre una ventana para autorizar el acceso. Inicia sesion en Zoom si es necesario.</li>
                  <li>Autoriza a Agendando a crear reuniones en tu nombre.</li>
                  <li>La integracion queda activa.</li>
                </ol>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">Como funciona</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Cuando alguien reserva un evento con ubicacion "Zoom", se crea automaticamente una reunion de Zoom.</li>
                  <li>El enlace de la reunion se incluye en los emails de confirmacion para ambas partes.</li>
                  <li>Si se cancela la reserva, la reunion de Zoom se elimina automaticamente.</li>
                </ul>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">Como desconectar</h3>
                <p className="text-sm">Anda a <strong>Integraciones</strong> y hace clic en <strong>"Desconectar"</strong> en la tarjeta de Zoom. Los eventos existentes no se veran afectados, pero no se crearan nuevas reuniones de Zoom para futuras reservas.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Integracion con Google Calendar</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Sincroniza tus reservas con Google Calendar y agrega enlaces de Google Meet automaticamente.</p>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">Como conectar</h3>
                <ol className="list-decimal pl-6 space-y-1 text-sm">
                  <li>Anda a <strong>Integraciones</strong> y hace clic en <strong>"Conectar"</strong> en Google Calendar.</li>
                  <li>Selecciona tu cuenta de Google y autoriza el acceso.</li>
                  <li>Las reservas se sincronizaran automaticamente con tu calendario.</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Integracion con MercadoPago</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Cobra por tus eventos usando MercadoPago Checkout Pro.</p>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">Como configurar eventos pagos</h3>
                <ol className="list-decimal pl-6 space-y-1 text-sm">
                  <li>Conecta MercadoPago en <strong>Integraciones</strong>.</li>
                  <li>Al crear o editar un tipo de evento, ingresa el precio en el campo correspondiente.</li>
                  <li>Los invitados seran redirigidos a MercadoPago para pagar antes de confirmar la reserva.</li>
                  <li>Recibis el pago directamente en tu cuenta de MercadoPago.</li>
                </ol>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Getting Started</h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Create your account</h3>
                  <p className="text-sm">Sign up with your email. You can configure your name, timezone and profile picture from the Profile section.</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Set up your availability</h3>
                  <p className="text-sm">In "Availability", define the days and times when you can receive meetings. You can configure different time slots for each day and add exceptions for specific dates.</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Create event types</h3>
                  <p className="text-sm">In "Event Types", create different types of meetings (e.g., "15 min call", "1 hour consultation"). Configure the duration, location (Zoom, Google Meet, phone, in-person) and optionally a price.</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4. Share your link</h3>
                  <p className="text-sm">Your public page is <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">agendando.com.ar/your-username</code>. Share it via email, social media or your website so others can book meetings.</p>
                </div>
              </div>
            </section>

            <section id="zoom">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Zoom Integration</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>The Zoom integration automatically creates meetings when someone books an event with "Zoom" as the location.</p>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">How to connect</h3>
                <ol className="list-decimal pl-6 space-y-1 text-sm">
                  <li>Go to <strong>Integrations</strong> in your dashboard.</li>
                  <li>Click <strong>"Connect"</strong> on the Zoom card.</li>
                  <li>A window will open to authorize access. Sign in to Zoom if needed.</li>
                  <li>Authorize Agendando to create meetings on your behalf.</li>
                  <li>The integration is now active.</li>
                </ol>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">How it works</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>When someone books an event with "Zoom" as the location, a Zoom meeting is automatically created.</li>
                  <li>The meeting link is included in confirmation emails for both parties.</li>
                  <li>If the booking is cancelled, the Zoom meeting is automatically deleted.</li>
                </ul>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">How to disconnect</h3>
                <p className="text-sm">Go to <strong>Integrations</strong> and click <strong>"Disconnect"</strong> on the Zoom card. Existing events will not be affected, but new Zoom meetings will not be created for future bookings.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Google Calendar Integration</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Sync your bookings with Google Calendar and add Google Meet links automatically.</p>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">How to connect</h3>
                <ol className="list-decimal pl-6 space-y-1 text-sm">
                  <li>Go to <strong>Integrations</strong> and click <strong>"Connect"</strong> on Google Calendar.</li>
                  <li>Select your Google account and authorize access.</li>
                  <li>Bookings will be automatically synced to your calendar.</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">MercadoPago Integration</h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Accept payments for your events using MercadoPago Checkout Pro.</p>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-4">How to set up paid events</h3>
                <ol className="list-decimal pl-6 space-y-1 text-sm">
                  <li>Connect MercadoPago in <strong>Integrations</strong>.</li>
                  <li>When creating or editing an event type, enter the price in the corresponding field.</li>
                  <li>Guests will be redirected to MercadoPago to pay before confirming the booking.</li>
                  <li>You receive the payment directly in your MercadoPago account.</li>
                </ol>
              </div>
            </section>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          {language === 'es' ? 'Necesitas mas ayuda? ' : 'Need more help? '}
          <Link to="/support" className="text-primary-600 dark:text-primary-400 hover:underline">
            {language === 'es' ? 'Contacta soporte' : 'Contact support'}
          </Link>
        </div>
      </main>
    </div>
  );
}
