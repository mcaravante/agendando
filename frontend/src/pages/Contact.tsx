import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { PublicLayout } from '../components/layout/PublicLayout';

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoSubject = encodeURIComponent(form.subject || 'Contacto desde Agendando');
    const mailtoBody = encodeURIComponent(
      `Nombre: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    window.location.href = `mailto:soporte@agendando.com.ar?subject=${mailtoSubject}&body=${mailtoBody}`;
    setSubmitted(true);
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Contacto
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Ponete en contacto con nosotros. Te respondemos lo antes posible.
        </p>

        {/* Email card */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
            <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Escribinos directamente a nuestro email.
          </p>
          <a href="mailto:soporte@agendando.com.ar" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            soporte@agendando.com.ar
          </a>
        </div>

        {/* Contact form */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Enviar un mensaje
          </h2>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-900 dark:text-white font-medium mb-2">
                Se abrió tu cliente de email
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completá el envío desde tu aplicación de email.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                className="mt-4 text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tu email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Asunto
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Asunto del mensaje"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mensaje
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Escribí tu mensaje..."
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <Send className="w-4 h-4" />
                Enviar mensaje
              </button>
            </form>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
