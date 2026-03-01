import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';

export function Documentation() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Documentación
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-10">
          Guía completa para usar Agendando y sus integraciones.
        </p>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Primeros pasos</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Creá tu cuenta</h3>
                <p className="text-sm">Registrate con tu email. Vas a poder configurar tu nombre, zona horaria y foto de perfil desde la sección de Perfil.</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Configurá tu disponibilidad</h3>
                <p className="text-sm">En "Disponibilidad", definí los días y horarios en que podés recibir reuniones. Podés configurar franjas horarias diferentes para cada día y agregar excepciones para fechas específicas.</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Creá tipos de evento</h3>
                <p className="text-sm">En "Tipos de Evento", creá diferentes tipos de reuniones (ej: "Llamada de 15 min", "Consulta de 1 hora"). Configurá la duración, ubicación (Zoom, Google Meet, teléfono, presencial) y opcionalmente un precio.</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4. Compartí tu link</h3>
                <p className="text-sm">Tu página pública es <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">agendando.com.ar/tu-usuario</code>. Compartilo por email, redes sociales o tu sitio web para que otros reserven reuniones.</p>
              </div>
            </div>
          </section>

          <section id="zoom">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Integración con Zoom</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>La integración con Zoom crea reuniones automáticamente cuando alguien reserva un evento con "Zoom" como ubicación.</p>
              <h3 className="font-semibold text-gray-900 dark:text-white mt-4">Cómo conectar</h3>
              <ol className="list-decimal pl-6 space-y-1 text-sm">
                <li>Andá a <strong>Integraciones</strong> en tu panel de control.</li>
                <li>Hacé clic en <strong>"Conectar"</strong> en la tarjeta de Zoom.</li>
                <li>Se abre una ventana para autorizar el acceso. Iniciá sesión en Zoom si es necesario.</li>
                <li>Autorizá a Agendando a crear reuniones en tu nombre.</li>
                <li>La integración queda activa.</li>
              </ol>
              <h3 className="font-semibold text-gray-900 dark:text-white mt-4">Cómo funciona</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Cuando alguien reserva un evento con ubicación "Zoom", se crea automáticamente una reunión de Zoom.</li>
                <li>El enlace de la reunión se incluye en los emails de confirmación para ambas partes.</li>
                <li>Si se cancela la reserva, la reunión de Zoom se elimina automáticamente.</li>
              </ul>
              <h3 className="font-semibold text-gray-900 dark:text-white mt-4">Cómo desconectar</h3>
              <p className="text-sm">Andá a <strong>Integraciones</strong> y hacé clic en <strong>"Desconectar"</strong> en la tarjeta de Zoom. Los eventos existentes no se verán afectados, pero no se crearán nuevas reuniones de Zoom para futuras reservas.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Integración con Google Calendar</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>Sincronizá tus reservas con Google Calendar y agregá enlaces de Google Meet automáticamente.</p>
              <h3 className="font-semibold text-gray-900 dark:text-white mt-4">Cómo conectar</h3>
              <ol className="list-decimal pl-6 space-y-1 text-sm">
                <li>Andá a <strong>Integraciones</strong> y hacé clic en <strong>"Conectar"</strong> en Google Calendar.</li>
                <li>Seleccioná tu cuenta de Google y autorizá el acceso.</li>
                <li>Las reservas se sincronizarán automáticamente con tu calendario.</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Integración con MercadoPago</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>Cobrá por tus eventos usando MercadoPago Checkout Pro.</p>
              <h3 className="font-semibold text-gray-900 dark:text-white mt-4">Cómo configurar eventos pagos</h3>
              <ol className="list-decimal pl-6 space-y-1 text-sm">
                <li>Conectá MercadoPago en <strong>Integraciones</strong>.</li>
                <li>Al crear o editar un tipo de evento, ingresá el precio en el campo correspondiente.</li>
                <li>Los invitados serán redirigidos a MercadoPago para pagar antes de confirmar la reserva.</li>
                <li>Recibís el pago directamente en tu cuenta de MercadoPago.</li>
              </ol>
            </div>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          ¿Necesitás más ayuda?{' '}
          <Link to="/soporte" className="text-primary-600 dark:text-primary-400 hover:underline">
            Contactá soporte
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
