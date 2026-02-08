import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

type TriggerType = 'BOOKING_CREATED' | 'BOOKING_CANCELLED' | 'BOOKING_REMINDER_1H' | 'BOOKING_REMINDER_24H';
type ActionType = 'SEND_EMAIL' | 'SEND_WEBHOOK';

interface Trigger {
  type: TriggerType;
  config?: any;
}

interface Action {
  type: ActionType;
  config: any;
}

const triggerOptions = [
  { value: 'BOOKING_CREATED', label: 'When a booking is created' },
  { value: 'BOOKING_CANCELLED', label: 'When a booking is cancelled' },
  { value: 'BOOKING_REMINDER_24H', label: '24 hours before meeting' },
  { value: 'BOOKING_REMINDER_1H', label: '1 hour before meeting' },
];

const actionOptions = [
  { value: 'SEND_EMAIL', label: 'Send email' },
  { value: 'SEND_WEBHOOK', label: 'Send webhook' },
];

const emailRecipientOptions = [
  { value: 'guest', label: 'Guest' },
  { value: 'host', label: 'Host (you)' },
];

const defaultEmailConfig = {
  to: 'guest',
  subject: 'Reminder: {{eventTitle}} with {{hostName}}',
  body: `<p>Hi {{guestName}},</p>
<p>This is a reminder that you have an upcoming meeting:</p>
<p><strong>{{eventTitle}}</strong><br>
With: {{hostName}}<br>
When: {{startTime}}</p>
<p>See you soon!</p>`,
};

const defaultWebhookConfig = {
  url: '',
  method: 'POST',
};

export function WorkflowEditor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [triggers, setTriggers] = useState<Trigger[]>([{ type: 'BOOKING_CREATED' }]);
  const [actions, setActions] = useState<Action[]>([{ type: 'SEND_EMAIL', config: { ...defaultEmailConfig } }]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchWorkflow();
    } else {
      // Check for template
      const template = searchParams.get('template');
      if (template) {
        const [triggerType, actionType] = template.split('-');
        if (triggerType) {
          setTriggers([{ type: triggerType as TriggerType }]);
        }
        if (actionType === 'SEND_EMAIL') {
          setActions([{ type: 'SEND_EMAIL', config: { ...defaultEmailConfig } }]);
        } else if (actionType === 'SEND_WEBHOOK') {
          setActions([{ type: 'SEND_WEBHOOK', config: { ...defaultWebhookConfig } }]);
        }
      }
    }
  }, [id, isEditing, searchParams]);

  const fetchWorkflow = async () => {
    try {
      const response = await api.get(`/workflows/${id}`);
      const workflow = response.data;
      setName(workflow.name);
      setTriggers(workflow.triggers.map((t: any) => ({ type: t.type, config: t.config })));
      setActions(workflow.actions.map((a: any) => ({ type: a.type, config: a.config })));
    } catch (error) {
      toast.error('Failed to load workflow');
      navigate('/workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    if (triggers.length === 0) {
      toast.error('Please add at least one trigger');
      return;
    }

    if (actions.length === 0) {
      toast.error('Please add at least one action');
      return;
    }

    // Validate actions
    for (const action of actions) {
      if (action.type === 'SEND_EMAIL') {
        if (!action.config.subject || !action.config.body) {
          toast.error('Please fill in the email subject and body');
          return;
        }
      } else if (action.type === 'SEND_WEBHOOK') {
        if (!action.config.url) {
          toast.error('Please enter a webhook URL');
          return;
        }
      }
    }

    setSaving(true);
    try {
      if (isEditing) {
        await api.patch(`/workflows/${id}`, { name, triggers, actions });
        toast.success('Workflow updated');
      } else {
        await api.post('/workflows', { name, triggers, actions });
        toast.success('Workflow created');
      }
      navigate('/workflows');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const addTrigger = () => {
    setTriggers([...triggers, { type: 'BOOKING_CREATED' }]);
  };

  const removeTrigger = (index: number) => {
    setTriggers(triggers.filter((_, i) => i !== index));
  };

  const updateTrigger = (index: number, type: TriggerType) => {
    const newTriggers = [...triggers];
    newTriggers[index] = { type };
    setTriggers(newTriggers);
  };

  const addAction = () => {
    setActions([...actions, { type: 'SEND_EMAIL', config: { ...defaultEmailConfig } }]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, updates: Partial<Action>) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], ...updates };
    setActions(newActions);
  };

  const updateActionConfig = (index: number, configUpdates: any) => {
    const newActions = [...actions];
    newActions[index] = {
      ...newActions[index],
      config: { ...newActions[index].config, ...configUpdates },
    };
    setActions(newActions);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <button
          onClick={() => navigate('/workflows')}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Workflows
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Workflow' : 'Create Workflow'}
        </h1>
      </div>

      <div className="space-y-8">
        {/* Workflow Name */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workflow Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., 24 Hour Reminder"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Triggers */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Triggers</h2>
              <p className="text-sm text-gray-600">When should this workflow run?</p>
            </div>
            {triggers.length < 4 && (
              <button
                onClick={addTrigger}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add trigger
              </button>
            )}
          </div>

          <div className="space-y-3">
            {triggers.map((trigger, index) => (
              <div key={index} className="flex items-center gap-3">
                <select
                  value={trigger.type}
                  onChange={(e) => updateTrigger(index, e.target.value as TriggerType)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {triggerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {triggers.length > 1 && (
                  <button
                    onClick={() => removeTrigger(index)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
              <p className="text-sm text-gray-600">What should happen when triggered?</p>
            </div>
            {actions.length < 5 && (
              <button
                onClick={addAction}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add action
              </button>
            )}
          </div>

          <div className="space-y-6">
            {actions.map((action, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <select
                    value={action.type}
                    onChange={(e) => {
                      const newType = e.target.value as ActionType;
                      updateAction(index, {
                        type: newType,
                        config: newType === 'SEND_EMAIL' ? { ...defaultEmailConfig } : { ...defaultWebhookConfig },
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {actionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {actions.length > 1 && (
                    <button
                      onClick={() => removeAction(index)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {action.type === 'SEND_EMAIL' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Send to
                      </label>
                      <select
                        value={action.config.to}
                        onChange={(e) => updateActionConfig(index, { to: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {emailRecipientOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={action.config.subject}
                        onChange={(e) => updateActionConfig(index, { subject: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Body (HTML)
                      </label>
                      <textarea
                        value={action.config.body}
                        onChange={(e) => updateActionConfig(index, { body: e.target.value })}
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-medium mb-1">Available variables:</p>
                      <p className="text-xs text-gray-500">
                        {'{{guestName}}'}, {'{{guestEmail}}'}, {'{{hostName}}'}, {'{{eventTitle}}'}, {'{{startTime}}'}, {'{{duration}}'}
                      </p>
                    </div>
                  </div>
                )}

                {action.type === 'SEND_WEBHOOK' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        value={action.config.url}
                        onChange={(e) => updateActionConfig(index, { url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HTTP Method
                      </label>
                      <select
                        value={action.config.method}
                        onChange={(e) => updateActionConfig(index, { method: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                      </select>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-medium mb-1">Payload will include:</p>
                      <p className="text-xs text-gray-500">
                        event, booking.id, booking.guestName, booking.guestEmail, booking.startTime, booking.endTime, booking.eventTitle, booking.hostName
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={() => navigate('/workflows')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Workflow'}
          </button>
        </div>
      </div>
    </div>
  );
}
