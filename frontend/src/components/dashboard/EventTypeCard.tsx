import { useState } from 'react';
import { Clock, Link as LinkIcon, Copy, ToggleLeft, ToggleRight, Edit, Trash2, Code2 } from 'lucide-react';
import { EventType } from '../../types';
import { Button } from '../common/Button';
import { EmbedModal } from '../embed/EmbedModal';
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
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const publicUrl = `${window.location.origin}/${username}/${eventType.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success('Link copiado al portapapeles');
  };

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-opacity ${
          !eventType.isActive ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className="w-3 h-12 rounded-full"
              style={{ backgroundColor: eventType.color }}
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{eventType.title}</h3>
              {eventType.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{eventType.description}</p>
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

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={copyLink} title="Copiar link">
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEmbedModalOpen(true)}
              title="Agregar a sitio web"
            >
              <Code2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(eventType)} title="Editar">
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleActive(eventType.id, !eventType.isActive)}
              title={eventType.isActive ? 'Desactivar' : 'Activar'}
            >
              {eventType.isActive ? (
                <ToggleRight className="w-5 h-5 text-green-600" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-gray-400" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(eventType.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
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
