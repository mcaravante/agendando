import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';

export function PublicLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <header className="border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-[72px] flex items-center justify-between">
          <Link to="/">
            <img src="/logo.png" alt="Agendando" className="h-10" />
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm">Ir al Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Iniciar Sesión</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center gap-6">
            <img src="/logo.png" alt="Agendando" className="h-8 opacity-60" />
            <nav className="flex flex-wrap justify-center gap-8">
              <Link to="/privacidad" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Privacidad
              </Link>
              <Link to="/condiciones" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Condiciones
              </Link>
              <Link to="/soporte" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Soporte
              </Link>
              <Link to="/documentacion" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Documentación
              </Link>
              <Link to="/contacto" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Contacto
              </Link>
            </nav>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              &copy; {new Date().getFullYear()} Agendando. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
