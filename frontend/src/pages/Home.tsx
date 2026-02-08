import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export function Home() {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Agendando</h1>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button>{language === 'es' ? 'Ir al Dashboard' : 'Go to Dashboard'}</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">{language === 'es' ? 'Iniciar Sesion' : 'Sign In'}</Button>
              </Link>
              <Link to="/register">
                <Button>{language === 'es' ? 'Registrarse' : 'Sign Up'}</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es'
              ? 'Programa reuniones sin el ida y vuelta'
              : 'Schedule meetings without the back and forth'}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            {language === 'es'
              ? 'Comparte tu disponibilidad y deja que otros reserven tiempo contigo. Simple, rapido y profesional.'
              : 'Share your availability and let others book time with you. Simple, fast and professional.'}
          </p>
          <Link to="/register">
            <Button size="lg" className="gap-2">
              {language === 'es' ? 'Comenzar gratis' : 'Get started for free'}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'es' ? 'Configura tu disponibilidad' : 'Set your availability'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'es'
                ? 'Define los dias y horarios en que estas disponible para reuniones.'
                : 'Define the days and times when you are available for meetings.'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'es' ? 'Crea tipos de eventos' : 'Create event types'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'es'
                ? 'Reunion de 15 min, llamada de 30 min, consulta de 1 hora... lo que necesites.'
                : '15 min meeting, 30 min call, 1 hour consultation... whatever you need.'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'es' ? 'Comparte tu link' : 'Share your link'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'es'
                ? 'Los demas eligen un horario que les funcione y listo. Ambos reciben confirmacion.'
                : 'Others choose a time that works for them and done. Both receive confirmation.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
