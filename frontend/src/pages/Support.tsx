import { Link } from 'react-router-dom';
import { Mail, FileText, Shield } from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout';

export function Support() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Soporte
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Estamos para ayudarte. Contactanos por cualquiera de los siguientes medios.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Escribinos y te respondemos lo antes posible.
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
              Documentación
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Consulta nuestra guía para resolver dudas comunes.
            </p>
            <Link to="/documentacion" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Ver documentación
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            <FaqItem
              question="¿Cómo configuro mi disponibilidad?"
              answer={'Andá a la sección "Disponibilidad" en tu panel. Ahí podés definir los días y horarios en que estás disponible para reuniones.'}
            />
            <FaqItem
              question="¿Cómo conecto Google Calendar?"
              answer={'Andá a "Integraciones" y hacé clic en "Conectar" en Google Calendar. Se abrirá una ventana para autorizar el acceso. Tus reuniones se sincronizarán automáticamente.'}
            />
            <FaqItem
              question="¿Cómo configuro eventos pagos con MercadoPago?"
              answer={'Primero conectá MercadoPago en "Integraciones". Luego, al crear o editar un tipo de evento, ingresá el precio. Los invitados pagarán antes de confirmar la reserva.'}
            />
            <FaqItem
              question="¿Cómo cancelo una reunión?"
              answer={'Desde el panel en "Reservas", hacé clic en la reunión que querés cancelar. También podés cancelar desde el enlace en el email de confirmación.'}
            />
          </div>
        </div>

        <div className="mt-10 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Privacidad y seguridad
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tu información está protegida. Leé nuestra{' '}
                <Link to="/privacidad" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Política de Privacidad
                </Link>
                {' '}y nuestras{' '}
                <Link to="/condiciones" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Condiciones del Servicio
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
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
