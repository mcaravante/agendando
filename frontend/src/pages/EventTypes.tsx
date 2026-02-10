import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { EventTypeCard } from '../components/dashboard/EventTypeCard';
import { CreateEventTypeModal } from '../components/event-types/CreateEventTypeModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import api from '../utils/api';
import { EventType } from '../types';
import toast from 'react-hot-toast';

export function EventTypes() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadEventTypes();
  }, []);

  const loadEventTypes = async () => {
    try {
      const res = await api.get('/event-types');
      setEventTypes(res.data);
    } catch (error) {
      toast.error(language === 'es' ? 'Error al cargar los eventos' : 'Error loading events');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingEventType(null);
    setIsModalOpen(true);
  };

  const openEditModal = (eventType: EventType) => {
    setEditingEventType(eventType);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/event-types/${deletingId}`);
      toast.success(language === 'es' ? 'Evento eliminado' : 'Event deleted');
      loadEventTypes();
    } catch (error) {
      toast.error(language === 'es' ? 'Error al eliminar' : 'Error deleting');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/event-types/${id}`, { isActive });
      loadEventTypes();
    } catch (error) {
      toast.error(language === 'es' ? 'Error al actualizar' : 'Error updating');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.eventTypes')}</h1>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'es' ? 'Nuevo Evento' : 'New Event'}
        </Button>
      </div>

      {isLoading ? (
        <Loading />
      ) : eventTypes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {language === 'es' ? 'No tienes tipos de eventos todavía' : "You don't have any event types yet"}
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            {language === 'es' ? 'Crear tu primer evento' : 'Create your first event'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {eventTypes.map((eventType) => (
            <EventTypeCard
              key={eventType.id}
              eventType={eventType}
              username={user?.username || ''}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      <CreateEventTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadEventTypes}
        editingEventType={editingEventType}
      />

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title={language === 'es' ? 'Eliminar tipo de evento' : 'Delete event type'}
        message={language === 'es'
          ? '¿Estás seguro de eliminar este tipo de evento? Esta acción no se puede deshacer.'
          : 'Are you sure you want to delete this event type? This action cannot be undone.'}
        confirmLabel={language === 'es' ? 'Eliminar' : 'Delete'}
        cancelLabel={language === 'es' ? 'Cancelar' : 'Cancel'}
        isLoading={isDeleting}
      />
    </div>
  );
}
