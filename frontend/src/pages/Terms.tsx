import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export function Terms() {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Condiciones del Servicio</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Ultima actualizacion: 13 de febrero de 2026</p>

            <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">1. Aceptacion de los terminos</h2>
                <p>Al acceder y utilizar Agendando, aceptas estos terminos y condiciones. Si no estas de acuerdo, no utilices el servicio.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">2. Descripcion del servicio</h2>
                <p>Agendando es una plataforma de programacion de reuniones que permite a los usuarios:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Configurar su disponibilidad horaria.</li>
                  <li>Crear tipos de eventos con diferentes duraciones y configuraciones.</li>
                  <li>Compartir un enlace publico para que otros reserven reuniones.</li>
                  <li>Integrar con Google Calendar, Zoom y MercadoPago.</li>
                  <li>Recibir notificaciones por correo electronico sobre reservas.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">3. Cuentas de usuario</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Debes proporcionar informacion veridica al crear tu cuenta.</li>
                  <li>Eres responsable de mantener la seguridad de tu cuenta y contrasena.</li>
                  <li>Debes notificarnos inmediatamente sobre cualquier uso no autorizado.</li>
                  <li>Nos reservamos el derecho de suspender cuentas que violen estos terminos.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">4. Uso aceptable</h2>
                <p>Al utilizar Agendando, te comprometes a:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>No utilizar el servicio para actividades ilegales o no autorizadas.</li>
                  <li>No intentar acceder a cuentas o datos de otros usuarios.</li>
                  <li>No enviar spam ni contenido malicioso a traves de la plataforma.</li>
                  <li>No interferir con el funcionamiento del servicio.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">5. Integraciones de terceros</h2>
                <p>Agendando se integra con servicios de terceros (Google, Zoom, MercadoPago). El uso de estas integraciones esta sujeto a los terminos de servicio de cada proveedor. No somos responsables por interrupciones o cambios en servicios de terceros.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">6. Pagos</h2>
                <p>Los pagos por eventos configurados con precio se procesan a traves de MercadoPago. Agendando no almacena datos de tarjetas de credito ni informacion financiera sensible. Las disputas de pago deben resolverse a traves de MercadoPago.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">7. Limitacion de responsabilidad</h2>
                <p>Agendando se proporciona "tal cual". No garantizamos que el servicio sea ininterrumpido o libre de errores. No somos responsables por danos indirectos derivados del uso de la plataforma.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">8. Modificaciones</h2>
                <p>Nos reservamos el derecho de modificar estos terminos en cualquier momento. Los cambios seran publicados en esta pagina. El uso continuado del servicio implica la aceptacion de los terminos actualizados.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">9. Contacto</h2>
                <p>Para consultas sobre estos terminos, contactanos en: <a href="mailto:soporte@agendando.com.ar" className="text-primary-600 dark:text-primary-400 hover:underline">soporte@agendando.com.ar</a></p>
              </section>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Terms of Service</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: February 13, 2026</p>

            <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">1. Acceptance of Terms</h2>
                <p>By accessing and using Agendando, you accept these terms and conditions. If you do not agree, do not use the service.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">2. Service Description</h2>
                <p>Agendando is a meeting scheduling platform that allows users to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Set up their schedule availability.</li>
                  <li>Create event types with different durations and configurations.</li>
                  <li>Share a public link for others to book meetings.</li>
                  <li>Integrate with Google Calendar, Zoom and MercadoPago.</li>
                  <li>Receive email notifications about bookings.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">3. User Accounts</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You must provide accurate information when creating your account.</li>
                  <li>You are responsible for maintaining the security of your account and password.</li>
                  <li>You must notify us immediately of any unauthorized use.</li>
                  <li>We reserve the right to suspend accounts that violate these terms.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">4. Acceptable Use</h2>
                <p>When using Agendando, you agree to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Not use the service for illegal or unauthorized activities.</li>
                  <li>Not attempt to access other users' accounts or data.</li>
                  <li>Not send spam or malicious content through the platform.</li>
                  <li>Not interfere with the operation of the service.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">5. Third-Party Integrations</h2>
                <p>Agendando integrates with third-party services (Google, Zoom, MercadoPago). Use of these integrations is subject to each provider's terms of service. We are not responsible for interruptions or changes in third-party services.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">6. Payments</h2>
                <p>Payments for events configured with a price are processed through MercadoPago. Agendando does not store credit card data or sensitive financial information. Payment disputes should be resolved through MercadoPago.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">7. Limitation of Liability</h2>
                <p>Agendando is provided "as is". We do not guarantee that the service will be uninterrupted or error-free. We are not responsible for indirect damages arising from the use of the platform.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">8. Modifications</h2>
                <p>We reserve the right to modify these terms at any time. Changes will be posted on this page. Continued use of the service implies acceptance of the updated terms.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">9. Contact</h2>
                <p>For inquiries about these terms, contact us at: <a href="mailto:soporte@agendando.com.ar" className="text-primary-600 dark:text-primary-400 hover:underline">soporte@agendando.com.ar</a></p>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
