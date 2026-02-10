import { useState, useEffect } from 'react';
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

interface Notification {
  id: string;
  name: { es: string; en: string };
  description: { es: string; en: string };
  trigger: string;
  defaultSubject: { es: string; en: string };
  defaultBody: { es: string; en: string };
}

const defaultNotifications: Notification[] = [
  {
    id: 'reminder-24h',
    name: { es: 'Recordatorio 24h', en: '24h Reminder' },
    description: {
      es: 'Enviar un email recordatorio 24 horas antes de la reunión',
      en: 'Send a reminder email 24 hours before the meeting',
    },
    trigger: 'BOOKING_REMINDER_24H',
    defaultSubject: {
      es: 'Recordatorio: {{eventTitle}} mañana',
      en: 'Reminder: {{eventTitle}} tomorrow',
    },
    defaultBody: {
      es: 'Hola {{guestName}},\n\nTe recordamos que tenés una reunión programada:\n\n{{eventTitle}}\nCon: {{hostName}}\nCuándo: {{startTime}}\nDuración: {{duration}} minutos\n\n¡Te esperamos!',
      en: 'Hi {{guestName}},\n\nThis is a reminder that you have an upcoming meeting:\n\n{{eventTitle}}\nWith: {{hostName}}\nWhen: {{startTime}}\nDuration: {{duration}} minutes\n\nSee you soon!',
    },
  },
  {
    id: 'reminder-1h',
    name: { es: 'Recordatorio 1h', en: '1h Reminder' },
    description: {
      es: 'Enviar un email recordatorio 1 hora antes de la reunión',
      en: 'Send a reminder email 1 hour before the meeting',
    },
    trigger: 'BOOKING_REMINDER_1H',
    defaultSubject: {
      es: 'Tu reunión {{eventTitle}} comienza en 1 hora',
      en: 'Your {{eventTitle}} meeting starts in 1 hour',
    },
    defaultBody: {
      es: 'Hola {{guestName}},\n\nTu reunión comienza en 1 hora:\n\n{{eventTitle}}\nCon: {{hostName}}\nCuándo: {{startTime}}\nDuración: {{duration}} minutos\n\n¡Te esperamos!',
      en: 'Hi {{guestName}},\n\nYour meeting starts in 1 hour:\n\n{{eventTitle}}\nWith: {{hostName}}\nWhen: {{startTime}}\nDuration: {{duration}} minutes\n\nSee you soon!',
    },
  },
  {
    id: 'booking-confirmation',
    name: { es: 'Confirmación de reserva', en: 'Booking Confirmation' },
    description: {
      es: 'Enviar un email de confirmación cuando se crea una reserva',
      en: 'Send a confirmation email when a booking is created',
    },
    trigger: 'BOOKING_CREATED',
    defaultSubject: {
      es: 'Reserva confirmada: {{eventTitle}}',
      en: 'Booking confirmed: {{eventTitle}}',
    },
    defaultBody: {
      es: 'Hola {{guestName}},\n\nTu reunión con {{hostName}} ha sido programada.\n\n{{eventTitle}}\nCuándo: {{startTime}}\nDuración: {{duration}} minutos\n\n¡Te esperamos!',
      en: 'Hi {{guestName}},\n\nYour meeting with {{hostName}} has been scheduled.\n\n{{eventTitle}}\nWhen: {{startTime}}\nDuration: {{duration}} minutes\n\nSee you there!',
    },
  },
  {
    id: 'booking-cancellation',
    name: { es: 'Cancelación de reserva', en: 'Booking Cancellation' },
    description: {
      es: 'Enviar un email de aviso cuando se cancela una reserva',
      en: 'Send a notification email when a booking is cancelled',
    },
    trigger: 'BOOKING_CANCELLED',
    defaultSubject: {
      es: 'Reserva cancelada: {{eventTitle}}',
      en: 'Booking cancelled: {{eventTitle}}',
    },
    defaultBody: {
      es: 'Hola {{guestName}},\n\nTu reunión con {{hostName}} ha sido cancelada.\n\n{{eventTitle}}\nEstaba programada para: {{startTime}}\n\nSi tenés alguna consulta, no dudes en comunicarte.',
      en: 'Hi {{guestName}},\n\nYour meeting with {{hostName}} has been cancelled.\n\n{{eventTitle}}\nWas scheduled for: {{startTime}}\n\nIf you have any questions, feel free to reach out.',
    },
  },
];

export function Workflows() {
  const { t, language } = useLanguage();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  // Close modals on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPreview) setShowPreview(false);
        else if (editingId) cancelEditing();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showPreview, editingId]);

  const fetchWorkflows = async () => {
    try {
      const response = await api.get('/workflows');
      setWorkflows(response.data);
    } catch (error) {
      // Silently fail - notifications will show as disabled
    } finally {
      setLoading(false);
    }
  };

  const isNotificationActive = (trigger: string) => {
    return workflows.some(w => w.isActive && w.triggers.some(t => t.type === trigger));
  };

  const getWorkflowForTrigger = (trigger: string) => {
    return workflows.find(w => w.triggers.some(t => t.type === trigger));
  };

  const htmlToPlainText = (html: string) => {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '');
  };

  const plainTextToHtml = (text: string) => {
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return escaped
      .split('\n\n')
      .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('');
  };

  const toggleNotification = async (notification: Notification) => {
    const existingWorkflow = getWorkflowForTrigger(notification.trigger);

    try {
      if (existingWorkflow) {
        await api.patch(`/workflows/${existingWorkflow.id}`, { isActive: !existingWorkflow.isActive });
        setWorkflows(workflows.map(w =>
          w.id === existingWorkflow.id ? { ...w, isActive: !existingWorkflow.isActive } : w
        ));
      } else {
        const response = await api.post('/workflows', {
          name: notification.name.en,
          triggers: [{ type: notification.trigger }],
          actions: [{
            type: 'SEND_EMAIL',
            config: {
              to: 'guest',
              subject: notification.defaultSubject[language],
              body: notification.defaultBody[language],
            },
          }],
        });
        setWorkflows([...workflows, response.data]);
      }
    } catch (error) {
      toast.error(language === 'es' ? 'Error al actualizar notificacion' : 'Failed to update notification');
    }
  };

  const isDefaultValue = (value: string | undefined, notification: Notification, field: 'defaultSubject' | 'defaultBody') => {
    if (!value) return true;
    const plain = value.includes('<') ? htmlToPlainText(value) : value;
    return plain === notification[field].en || plain === notification[field].es;
  };

  const startEditing = (notification: Notification) => {
    const workflow = getWorkflowForTrigger(notification.trigger);
    const config = workflow?.actions?.[0]?.config;
    const storedSubject = config?.subject;
    const storedBody = config?.body;
    setEditSubject(
      storedSubject && !isDefaultValue(storedSubject, notification, 'defaultSubject')
        ? storedSubject
        : notification.defaultSubject[language]
    );
    const body = storedBody && !isDefaultValue(storedBody, notification, 'defaultBody')
      ? storedBody
      : notification.defaultBody[language];
    setEditBody(body.includes('<') ? htmlToPlainText(body) : body);
    setShowPreview(false);
    setEditingId(notification.id);
  };

  const VALID_VARIABLES = ['guestName', 'guestEmail', 'hostName', 'eventTitle', 'startTime', 'duration'];

  const validateTemplate = (text: string): string[] => {
    const errors: string[] = [];

    // Detect unclosed braces: {{ without }}
    const unclosed = text.match(/\{\{(?![^{}]*\}\})/g);
    if (unclosed) {
      errors.push(language === 'es'
        ? 'Hay llaves abiertas {{ sin cerrar con }}'
        : 'There are opening {{ without closing }}');
    }

    // Detect }} without matching {{
    const unopened = text.match(/(?<!\{\{[^{}]*)\}\}/g);
    if (unopened) {
      errors.push(language === 'es'
        ? 'Hay llaves de cierre }} sin apertura {{'
        : 'There are closing }} without opening {{');
    }

    // Check for unknown variables
    const variables = text.match(/\{\{(\w+)\}\}/g) || [];
    for (const v of variables) {
      const name = v.replace(/\{|\}/g, '');
      if (!VALID_VARIABLES.includes(name)) {
        errors.push(language === 'es'
          ? `Campo desconocido: ${v}`
          : `Unknown field: ${v}`);
      }
    }

    return errors;
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditSubject('');
    setEditBody('');
    setShowPreview(false);
  };

  const saveEditing = async (notification: Notification) => {
    const errors = [
      ...validateTemplate(editSubject),
      ...validateTemplate(editBody),
    ];
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    const workflow = getWorkflowForTrigger(notification.trigger);
    setSaving(true);
    const htmlBody = plainTextToHtml(editBody);

    try {
      if (workflow) {
        const response = await api.patch(`/workflows/${workflow.id}`, {
          actions: [{
            type: 'SEND_EMAIL',
            config: {
              to: workflow.actions?.[0]?.config?.to || 'guest',
              subject: editSubject,
              body: htmlBody,
            },
          }],
        });
        setWorkflows(workflows.map(w => w.id === workflow.id ? response.data : w));
      } else {
        const response = await api.post('/workflows', {
          name: notification.name.en,
          triggers: [{ type: notification.trigger }],
          actions: [{
            type: 'SEND_EMAIL',
            config: {
              to: 'guest',
              subject: editSubject,
              body: htmlBody,
            },
          }],
        });
        setWorkflows([...workflows, response.data]);
      }
      toast.success(language === 'es' ? 'Email guardado' : 'Email saved');
      setEditingId(null);
      setEditSubject('');
      setEditBody('');
    } catch (error) {
      toast.error(language === 'es' ? 'Error al guardar' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const getTriggerLabel = (type: string) => triggerLabels[type]?.[language] || type;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.workflows')}</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {language === 'es'
            ? 'Configura los emails que se envian automaticamente.'
            : 'Configure the emails that are sent automatically.'}
        </p>
      </div>

      <div className="space-y-4">
        {defaultNotifications.map((notification) => {
          const active = isNotificationActive(notification.trigger);
          const isEditing = editingId === notification.id;
          return (
            <div
              key={notification.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {notification.name[language]}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        active
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {active
                        ? (language === 'es' ? 'Activo' : 'Active')
                        : (language === 'es' ? 'Inactivo' : 'Inactive')}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {notification.description[language]}
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      {getTriggerLabel(notification.trigger)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!isEditing && (
                    <button
                      onClick={() => startEditing(notification)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      {language === 'es' ? 'Editar' : 'Edit'}
                    </button>
                  )}
                  <button
                    onClick={() => toggleNotification(notification)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      active ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'es' ? 'Asunto' : 'Subject'}
                    </label>
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'es' ? 'Cuerpo' : 'Body'}
                    </label>
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={6}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <details className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                        {language === 'es' ? 'Ver campos dinámicos disponibles' : 'View available dynamic fields'}
                      </summary>
                      <div className="mt-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 space-y-1.5">
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          {language === 'es'
                            ? 'Usá estos campos en el asunto o cuerpo y se reemplazarán automáticamente con los datos de cada reserva:'
                            : 'Use these fields in the subject or body and they will be automatically replaced with each booking\'s data:'}
                        </p>
                        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                          <code className="text-blue-600 dark:text-blue-400">{'{{guestName}}'}</code>
                          <span>{language === 'es' ? 'Nombre del invitado — ej: Juan Pérez' : 'Guest name — e.g.: John Smith'}</span>
                          <code className="text-blue-600 dark:text-blue-400">{'{{guestEmail}}'}</code>
                          <span>{language === 'es' ? 'Email del invitado — ej: juan@email.com' : 'Guest email — e.g.: john@email.com'}</span>
                          <code className="text-blue-600 dark:text-blue-400">{'{{hostName}}'}</code>
                          <span>{language === 'es' ? 'Tu nombre (anfitrión) — ej: María López' : 'Your name (host) — e.g.: Maria Lopez'}</span>
                          <code className="text-blue-600 dark:text-blue-400">{'{{eventTitle}}'}</code>
                          <span>{language === 'es' ? 'Nombre del tipo de evento — ej: Consulta inicial' : 'Event type name — e.g.: Initial consultation'}</span>
                          <code className="text-blue-600 dark:text-blue-400">{'{{startTime}}'}</code>
                          <span>{language === 'es' ? 'Fecha y hora de la reunión' : 'Meeting date and time'}</span>
                          <code className="text-blue-600 dark:text-blue-400">{'{{duration}}'}</code>
                          <span>{language === 'es' ? 'Duración en minutos — ej: 30' : 'Duration in minutes — e.g.: 30'}</span>
                        </div>
                      </div>
                    </details>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEditing(notification)}
                      disabled={saving}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                    >
                      {saving
                        ? (language === 'es' ? 'Guardando...' : 'Saving...')
                        : (language === 'es' ? 'Guardar' : 'Save')}
                    </button>
                    <button
                      onClick={() => setShowPreview(true)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                    >
                      {language === 'es' ? 'Vista previa' : 'Preview'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      disabled={saving}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50"
                    >
                      {language === 'es' ? 'Cancelar' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPreview(false)}>
          <div
            className="w-full max-w-lg mx-4 max-h-[80vh] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {language === 'es' ? 'Vista previa del email' : 'Email preview'}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            <div className="overflow-y-auto bg-[#f3f4f6] dark:bg-gray-900" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
              <div className="max-w-[600px] mx-auto p-5">
                <div className="bg-blue-500 text-white text-center py-5 px-5 rounded-t-lg">
                  <h1 className="text-xl font-bold m-0">{editSubject}</h1>
                </div>
                <div className="bg-white px-6 py-6">
                  <div
                    className="text-sm text-gray-800 leading-relaxed [&_p]:my-2"
                    dangerouslySetInnerHTML={{ __html: plainTextToHtml(editBody) }}
                  />
                </div>
                <div className="text-center py-4 text-gray-500 text-xs bg-gray-50 rounded-b-lg">
                  <p className="m-0">Powered by Agendando</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
              >
                {language === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
