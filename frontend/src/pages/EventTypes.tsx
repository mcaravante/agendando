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
  const { t } = useLanguage();
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
      toast.error(t('eventTypes.loadError'));
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
      toast.success(t('eventTypes.deleted'));
      loadEventTypes();
    } catch (error) {
      toast.error(t('toast.deleteError'));
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
      toast.error(t('eventTypes.updateError'));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.eventTypes')}</h1>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          {t('eventTypes.new')}
        </Button>
      </div>

      {isLoading ? (
        <Loading />
      ) : eventTypes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t('eventTypes.noEvents')}
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            {t('eventTypes.createFirst')}
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
        title={t('eventTypes.deleteTitle')}
        message={t('eventTypes.confirmDeleteMessage')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        isLoading={isDeleting}
      />
    </div>
  );
}
