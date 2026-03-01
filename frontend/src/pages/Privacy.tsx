import { PublicLayout } from '../components/layout/PublicLayout';

export function Privacy() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Última actualización: 13 de febrero de 2026</p>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">1. Información que recopilamos</h2>
            <p>Al utilizar Agendando, recopilamos la siguiente información:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Datos de cuenta:</strong> nombre, dirección de correo electrónico, zona horaria y foto de perfil.</li>
              <li><strong>Datos de reservas:</strong> información sobre las reuniones programadas, incluyendo fecha, hora, participantes y notas.</li>
              <li><strong>Datos de integraciones:</strong> cuando conectás servicios como Google Calendar, Zoom o MercadoPago, almacenamos tokens de acceso necesarios para el funcionamiento de la integración.</li>
              <li><strong>Datos de uso:</strong> información sobre cómo interactuás con la plataforma para mejorar nuestro servicio.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">2. Cómo usamos tu información</h2>
            <p>Utilizamos tu información para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Proporcionar y mantener el servicio de programación de reuniones.</li>
              <li>Enviar notificaciones y recordatorios de reuniones por correo electrónico.</li>
              <li>Sincronizar eventos con tu calendario conectado.</li>
              <li>Crear reuniones automáticas en Zoom cuando corresponda.</li>
              <li>Procesar pagos a través de MercadoPago cuando se configuren eventos pagos.</li>
              <li>Mejorar y optimizar la plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">3. Compartición de datos</h2>
            <p>No vendemos ni compartimos tu información personal con terceros, excepto:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Proveedores de servicios:</strong> Google (Calendar/Meet), Zoom y MercadoPago reciben datos necesarios para sus respectivas integraciones.</li>
              <li><strong>Participantes de reuniones:</strong> las personas que reservan contigo ven tu nombre, disponibilidad y los detalles del evento.</li>
              <li><strong>Requerimientos legales:</strong> cuando sea requerido por ley.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">4. Seguridad de datos</h2>
            <p>Protegemos tu información mediante:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Conexiones cifradas con HTTPS.</li>
              <li>Tokens de autenticación seguros (JWT).</li>
              <li>Almacenamiento seguro de credenciales de integraciones.</li>
              <li>Acceso restringido a bases de datos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">5. Tus derechos</h2>
            <p>Tenés derecho a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Acceder a tu información personal desde tu perfil.</li>
              <li>Modificar o actualizar tus datos en cualquier momento.</li>
              <li>Desconectar integraciones de terceros.</li>
              <li>Solicitar la eliminación de tu cuenta y datos asociados contactándonos por email.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">6. Cookies</h2>
            <p>Utilizamos almacenamiento local del navegador (localStorage) para mantener tu sesión iniciada y tus preferencias. No utilizamos cookies de rastreo de terceros.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">7. Contacto</h2>
            <p>Para consultas sobre privacidad, contactanos en: <a href="mailto:soporte@agendando.com.ar" className="text-primary-600 dark:text-primary-400 hover:underline">soporte@agendando.com.ar</a></p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
