import { PublicLayout } from '../components/layout/PublicLayout';

export function Terms() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Condiciones del Servicio</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Última actualización: 13 de febrero de 2026</p>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">1. Aceptación de los términos</h2>
            <p>Al acceder y utilizar Agendando, aceptás estos términos y condiciones. Si no estás de acuerdo, no utilices el servicio.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">2. Descripción del servicio</h2>
            <p>Agendando es una plataforma de programación de reuniones que permite a los usuarios:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Configurar su disponibilidad horaria.</li>
              <li>Crear tipos de eventos con diferentes duraciones y configuraciones.</li>
              <li>Compartir un enlace público para que otros reserven reuniones.</li>
              <li>Integrar con Google Calendar, Zoom y MercadoPago.</li>
              <li>Recibir notificaciones por correo electrónico sobre reservas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">3. Cuentas de usuario</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Debés proporcionar información verídica al crear tu cuenta.</li>
              <li>Sos responsable de mantener la seguridad de tu cuenta y contraseña.</li>
              <li>Debés notificarnos inmediatamente sobre cualquier uso no autorizado.</li>
              <li>Nos reservamos el derecho de suspender cuentas que violen estos términos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">4. Uso aceptable</h2>
            <p>Al utilizar Agendando, te comprometés a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>No utilizar el servicio para actividades ilegales o no autorizadas.</li>
              <li>No intentar acceder a cuentas o datos de otros usuarios.</li>
              <li>No enviar spam ni contenido malicioso a través de la plataforma.</li>
              <li>No interferir con el funcionamiento del servicio.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">5. Integraciones de terceros</h2>
            <p>Agendando se integra con servicios de terceros (Google, Zoom, MercadoPago). El uso de estas integraciones está sujeto a los términos de servicio de cada proveedor. No somos responsables por interrupciones o cambios en servicios de terceros.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">6. Pagos</h2>
            <p>Los pagos por eventos configurados con precio se procesan a través de MercadoPago. Agendando no almacena datos de tarjetas de crédito ni información financiera sensible. Las disputas de pago deben resolverse a través de MercadoPago.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">7. Limitación de responsabilidad</h2>
            <p>Agendando se proporciona "tal cual". No garantizamos que el servicio sea ininterrumpido o libre de errores. No somos responsables por daños indirectos derivados del uso de la plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">8. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán publicados en esta página. El uso continuado del servicio implica la aceptación de los términos actualizados.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">9. Contacto</h2>
            <p>Para consultas sobre estos términos, contactanos en: <a href="mailto:soporte@agendando.com.ar" className="text-primary-600 dark:text-primary-400 hover:underline">soporte@agendando.com.ar</a></p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
