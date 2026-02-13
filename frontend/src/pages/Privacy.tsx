import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export function Privacy() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">Agendando</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {language === 'es' ? (
          <>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Politica de Privacidad</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Ultima actualizacion: 13 de febrero de 2026</p>

            <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">1. Informacion que recopilamos</h2>
                <p>Al utilizar Agendando, recopilamos la siguiente informacion:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Datos de cuenta:</strong> nombre, direccion de correo electronico, zona horaria y foto de perfil.</li>
                  <li><strong>Datos de reservas:</strong> informacion sobre las reuniones programadas, incluyendo fecha, hora, participantes y notas.</li>
                  <li><strong>Datos de integraciones:</strong> cuando conectas servicios como Google Calendar, Zoom o MercadoPago, almacenamos tokens de acceso necesarios para el funcionamiento de la integracion.</li>
                  <li><strong>Datos de uso:</strong> informacion sobre como interactuas con la plataforma para mejorar nuestro servicio.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">2. Como usamos tu informacion</h2>
                <p>Utilizamos tu informacion para:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Proporcionar y mantener el servicio de programacion de reuniones.</li>
                  <li>Enviar notificaciones y recordatorios de reuniones por correo electronico.</li>
                  <li>Sincronizar eventos con tu calendario conectado.</li>
                  <li>Crear reuniones automaticas en Zoom cuando corresponda.</li>
                  <li>Procesar pagos a traves de MercadoPago cuando se configuren eventos pagos.</li>
                  <li>Mejorar y optimizar la plataforma.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">3. Comparticion de datos</h2>
                <p>No vendemos ni compartimos tu informacion personal con terceros, excepto:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Proveedores de servicios:</strong> Google (Calendar/Meet), Zoom y MercadoPago reciben datos necesarios para sus respectivas integraciones.</li>
                  <li><strong>Participantes de reuniones:</strong> las personas que reservan contigo ven tu nombre, disponibilidad y los detalles del evento.</li>
                  <li><strong>Requerimientos legales:</strong> cuando sea requerido por ley.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">4. Seguridad de datos</h2>
                <p>Protegemos tu informacion mediante:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Conexiones cifradas con HTTPS.</li>
                  <li>Tokens de autenticacion seguros (JWT).</li>
                  <li>Almacenamiento seguro de credenciales de integraciones.</li>
                  <li>Acceso restringido a bases de datos.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">5. Tus derechos</h2>
                <p>Tenes derecho a:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Acceder a tu informacion personal desde tu perfil.</li>
                  <li>Modificar o actualizar tus datos en cualquier momento.</li>
                  <li>Desconectar integraciones de terceros.</li>
                  <li>Solicitar la eliminacion de tu cuenta y datos asociados contactandonos por email.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">6. Cookies</h2>
                <p>Utilizamos almacenamiento local del navegador (localStorage) para mantener tu sesion iniciada y tus preferencias. No utilizamos cookies de rastreo de terceros.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">7. Contacto</h2>
                <p>Para consultas sobre privacidad, contactanos en: <a href="mailto:soporte@agendando.com.ar" className="text-primary-600 dark:text-primary-400 hover:underline">soporte@agendando.com.ar</a></p>
              </section>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: February 13, 2026</p>

            <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">1. Information We Collect</h2>
                <p>When you use Agendando, we collect the following information:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Account data:</strong> name, email address, timezone and profile picture.</li>
                  <li><strong>Booking data:</strong> information about scheduled meetings, including date, time, participants and notes.</li>
                  <li><strong>Integration data:</strong> when you connect services like Google Calendar, Zoom or MercadoPago, we store access tokens needed for the integration to work.</li>
                  <li><strong>Usage data:</strong> information about how you interact with the platform to improve our service.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">2. How We Use Your Information</h2>
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide and maintain the meeting scheduling service.</li>
                  <li>Send meeting notifications and reminders via email.</li>
                  <li>Sync events with your connected calendar.</li>
                  <li>Create automatic Zoom meetings when applicable.</li>
                  <li>Process payments through MercadoPago when paid events are configured.</li>
                  <li>Improve and optimize the platform.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">3. Data Sharing</h2>
                <p>We do not sell or share your personal information with third parties, except:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Service providers:</strong> Google (Calendar/Meet), Zoom and MercadoPago receive data necessary for their respective integrations.</li>
                  <li><strong>Meeting participants:</strong> people who book with you see your name, availability and event details.</li>
                  <li><strong>Legal requirements:</strong> when required by law.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">4. Data Security</h2>
                <p>We protect your information through:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Encrypted connections with HTTPS.</li>
                  <li>Secure authentication tokens (JWT).</li>
                  <li>Secure storage of integration credentials.</li>
                  <li>Restricted database access.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">5. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access your personal information from your profile.</li>
                  <li>Modify or update your data at any time.</li>
                  <li>Disconnect third-party integrations.</li>
                  <li>Request deletion of your account and associated data by contacting us via email.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">6. Cookies</h2>
                <p>We use browser local storage (localStorage) to keep you signed in and save your preferences. We do not use third-party tracking cookies.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">7. Contact</h2>
                <p>For privacy inquiries, contact us at: <a href="mailto:soporte@agendando.com.ar" className="text-primary-600 dark:text-primary-400 hover:underline">soporte@agendando.com.ar</a></p>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
