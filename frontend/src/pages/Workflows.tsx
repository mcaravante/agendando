import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../utils/api';

interface WorkflowTrigger {
  id: string;
  type: string;
  config?: any;
}

interface WorkflowAction {
  id: string;
  type: string;
  config: any;
  order: number;
}

interface Workflow {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
}

const triggerLabels: Record<string, { en: string; es: string }> = {
  BOOKING_CREATED: { en: 'When a booking is created', es: 'Cuando se crea una reserva' },
  BOOKING_CANCELLED: { en: 'When a booking is cancelled', es: 'Cuando se cancela una reserva' },
  BOOKING_REMINDER_1H: { en: '1 hour before meeting', es: '1 hora antes de la reunion' },
  BOOKING_REMINDER_24H: { en: '24 hours before meeting', es: '24 horas antes de la reunion' },
};

const actionLabels: Record<string, { en: string; es: string }> = {
  SEND_EMAIL: { en: 'Send email', es: 'Enviar email' },
  SEND_WEBHOOK: { en: 'Send webhook', es: 'Enviar webhook' },
};

export function Workflows() {
  const { t, language } = useLanguage();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await api.get('/workflows');
      setWorkflows(response.data);
    } catch (error) {
      toast.error(language === 'es' ? 'Error al cargar workflows' : 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (id: string, currentState: boolean) => {
    try {
      await api.patch(`/workflows/${id}`, { isActive: !currentState });
      setWorkflows(workflows.map(w =>
        w.id === id ? { ...w, isActive: !currentState } : w
      ));
      toast.success(
        !currentState
          ? (language === 'es' ? 'Workflow activado' : 'Workflow activated')
          : (language === 'es' ? 'Workflow desactivado' : 'Workflow deactivated')
      );
    } catch (error) {
      toast.error(language === 'es' ? 'Error al actualizar workflow' : 'Failed to update workflow');
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (!confirm(language === 'es' ? '¿Estas seguro de eliminar este workflow?' : 'Are you sure you want to delete this workflow?')) {
      return;
    }

    try {
      await api.delete(`/workflows/${id}`);
      setWorkflows(workflows.filter(w => w.id !== id));
      toast.success(language === 'es' ? 'Workflow eliminado' : 'Workflow deleted');
    } catch (error) {
      toast.error(language === 'es' ? 'Error al eliminar workflow' : 'Failed to delete workflow');
    }
  };

  const getTriggerLabel = (type: string) => triggerLabels[type]?.[language] || type;
  const getActionLabel = (type: string) => actionLabels[type]?.[language] || type;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.workflows')}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {language === 'es'
              ? 'Automatiza acciones cuando se crean o cancelan reservas, o como recordatorios.'
              : 'Automate actions when bookings are created, cancelled, or as reminders.'}
          </p>
        </div>
        <Link
          to="/workflows/new"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {language === 'es' ? 'Crear Workflow' : 'Create Workflow'}
        </Link>
      </div>

      {workflows.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === 'es' ? 'Sin workflows aun' : 'No workflows yet'}
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {language === 'es'
              ? 'Crea tu primer workflow para automatizar recordatorios, enviar emails personalizados, o integrar con otros servicios via webhooks.'
              : 'Create your first workflow to automate reminders, send custom emails, or integrate with other services via webhooks.'}
          </p>
          <Link
            to="/workflows/new"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {language === 'es' ? 'Crear tu primer workflow' : 'Create your first workflow'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{workflow.name}</h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        workflow.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {workflow.isActive ? (language === 'es' ? 'Activo' : 'Active') : (language === 'es' ? 'Inactivo' : 'Inactive')}
                    </span>
                  </div>

                  {/* Triggers */}
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {language === 'es' ? 'Disparadores:' : 'Triggers:'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {workflow.triggers.map((trigger) => (
                        <span
                          key={trigger.id}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        >
                          {getTriggerLabel(trigger.type)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {language === 'es' ? 'Acciones:' : 'Actions:'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {workflow.actions.map((action) => (
                        <span
                          key={action.id}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                        >
                          {getActionLabel(action.type)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Toggle switch */}
                  <button
                    onClick={() => toggleWorkflow(workflow.id, workflow.isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      workflow.isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        workflow.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  {/* Edit button */}
                  <Link
                    to={`/workflows/${workflow.id}`}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteWorkflow(workflow.id)}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates section */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {language === 'es' ? 'Plantillas Rapidas' : 'Quick Start Templates'}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <WorkflowTemplate
            name={language === 'es' ? 'Recordatorio 24h' : '24h Reminder'}
            description={
              language === 'es'
                ? 'Enviar un email recordatorio a los invitados 24 horas antes de su reunion'
                : 'Send a reminder email to guests 24 hours before their meeting'
            }
            trigger="BOOKING_REMINDER_24H"
            action="SEND_EMAIL"
            language={language}
          />
          <WorkflowTemplate
            name={language === 'es' ? 'Recordatorio 1h' : '1h Reminder'}
            description={
              language === 'es'
                ? 'Enviar un email recordatorio a los invitados 1 hora antes de su reunion'
                : 'Send a reminder email to guests 1 hour before their meeting'
            }
            trigger="BOOKING_REMINDER_1H"
            action="SEND_EMAIL"
            language={language}
          />
          <WorkflowTemplate
            name={language === 'es' ? 'Webhook al reservar' : 'Webhook on Booking'}
            description={
              language === 'es'
                ? 'Enviar una notificacion webhook cuando se crea una nueva reserva'
                : 'Send a webhook notification when a new booking is created'
            }
            trigger="BOOKING_CREATED"
            action="SEND_WEBHOOK"
            language={language}
          />
        </div>
      </div>
    </div>
  );
}

interface WorkflowTemplateProps {
  name: string;
  description: string;
  trigger: string;
  action: string;
  language: 'en' | 'es';
}

function WorkflowTemplate({ name, description, trigger, action, language }: WorkflowTemplateProps) {
  const getTriggerLabel = (type: string) => triggerLabels[type]?.[language] || type;
  const getActionLabel = (type: string) => actionLabels[type]?.[language] || type;

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
      <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
          {getTriggerLabel(trigger)}
        </span>
        <span className="text-gray-400">→</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
          {getActionLabel(action)}
        </span>
      </div>
      <Link
        to={`/workflows/new?template=${trigger}-${action}`}
        className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {language === 'es' ? 'Usar esta plantilla' : 'Use this template'}
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
