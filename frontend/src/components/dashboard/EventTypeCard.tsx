import { useState, useRef, useEffect } from 'react';
import { Clock, Link as LinkIcon, Copy, Edit, Trash2, Code2, MoreVertical, ExternalLink } from 'lucide-react';
import { EventType } from '../../types';
import { EmbedModal } from '../embed/EmbedModal';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';

interface EventTypeCardProps {
  eventType: EventType;
  username: string;
  onEdit: (eventType: EventType) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export function EventTypeCard({
  eventType,
  username,
  onEdit,
  onDelete,
  onToggleActive,
}: EventTypeCardProps) {
  const { language } = useLanguage();
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const publicUrl = `${window.location.origin}/${username}/${eventType.slug}`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success(language === 'es' ? 'Link copiado' : 'Link copied');
  };

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-opacity ${
          !eventType.isActive ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-3 h-12 rounded-full flex-shrink-0"
              style={{ backgroundColor: eventType.color }}
            />
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white">{eventType.title}</h3>
              {eventType.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{eventType.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {eventType.duration} min
                </span>
                <span className="flex items-center gap-1">
                  <LinkIcon className="w-4 h-4" />
                  /{eventType.slug}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onToggleActive(eventType.id, !eventType.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                eventType.isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
              title={eventType.isActive ? (language === 'es' ? 'Desactivar' : 'Deactivate') : (language === 'es' ? 'Activar' : 'Activate')}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  eventType.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {language === 'es' ? 'Copiar link' : 'Copy link'}
            </button>

            {/* Three dots menu */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                  <button
                    onClick={() => { window.open(publicUrl, '_blank'); setMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    {language === 'es' ? 'Ver página' : 'View page'}
                  </button>
                  <button
                    onClick={() => { onEdit(eventType); setMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-400" />
                    {language === 'es' ? 'Editar' : 'Edit'}
                  </button>
                  <button
                    onClick={() => { setEmbedModalOpen(true); setMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Code2 className="w-4 h-4 text-gray-400" />
                    {language === 'es' ? 'Agregar a sitio web' : 'Add to website'}
                  </button>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

                  <button
                    onClick={() => { onDelete(eventType.id); setMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {language === 'es' ? 'Eliminar' : 'Delete'}
                  </button>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <EmbedModal
        isOpen={embedModalOpen}
        onClose={() => setEmbedModalOpen(false)}
        eventUrl={publicUrl}
        eventTitle={eventType.title}
        userName={username}
      />
    </>
  );
}
