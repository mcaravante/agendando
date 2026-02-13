import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Check, Copy, Code, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventUrl: string;
  eventTitle: string;
  userName: string;
}

type EmbedType = 'inline' | 'popup-widget' | 'popup-text';

export function EmbedModal({ isOpen, onClose, eventUrl, eventTitle, userName }: EmbedModalProps) {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState<EmbedType | null>(null);
  const [copied, setCopied] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
  const widgetUrl = `${apiUrl}/widget/agendando-widget.js`;

  const embedOptions: { type: EmbedType; title: string; description: string; icon: React.ReactNode }[] = [
    {
      type: 'inline',
      title: t('embed.inline'),
      description: t('embed.inlineDesc'),
      icon: (
        <div className="w-full h-24 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
          <div className="grid grid-cols-3 gap-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-primary-500' : 'bg-gray-300'}`} />
            ))}
          </div>
        </div>
      ),
    },
    {
      type: 'popup-widget',
      title: t('embed.popupWidget'),
      description: t('embed.popupWidgetDesc'),
      icon: (
        <div className="w-full h-24 border-2 border-gray-200 rounded-lg flex items-end justify-end p-2 bg-gray-50">
          <div className="w-12 h-6 bg-primary-500 rounded-full" />
        </div>
      ),
    },
    {
      type: 'popup-text',
      title: t('embed.popupText'),
      description: t('embed.popupTextDesc'),
      icon: (
        <div className="w-full h-24 border-2 border-gray-200 rounded-lg flex items-start p-3 bg-gray-50">
          <div className="space-y-2">
            <div className="w-20 h-2 bg-gray-300 rounded" />
            <div className="w-16 h-2 bg-primary-500 rounded" />
          </div>
        </div>
      ),
    },
  ];

  const getEmbedCode = (): string => {
    switch (selectedType) {
      case 'inline':
        return `<!-- Agendando Inline Embed -->
<div data-agendando-inline="${eventUrl}"></div>
<script src="${widgetUrl}" async></script>`;

      case 'popup-widget':
        return `<!-- Agendando Popup Widget -->
<div
  data-agendando-badge="${eventUrl}"
  data-agendando-text="${t('embed.scheduleEvent')} ${eventTitle}"
  data-agendando-color="#3b82f6"
></div>
<script src="${widgetUrl}" async></script>`;

      case 'popup-text':
        return `<!-- Agendando Popup Link -->
<a href="#" data-agendando-popup="${eventUrl}">
  ${t('embed.scheduleAMeeting')}
</a>
<script src="${widgetUrl}" async></script>`;

      default:
        return '';
    }
  };

  const copyCode = () => {
    const code = getEmbedCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(t('embed.codeCopied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  const handleClose = () => {
    setSelectedType(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('embed.title')} size="lg">
      {!selectedType ? (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">{userName}</p>

          <div>
            <p className="text-gray-700 mb-4">{t('embed.howToAdd')}</p>

            <div className="grid grid-cols-3 gap-4">
              {embedOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => setSelectedType(option.type)}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 transition-colors text-left group"
                >
                  {option.icon}
                  <h3 className="font-semibold text-gray-900 mt-3 group-hover:text-primary-600">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <button
            onClick={handleBack}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            ← {t('embed.backToOptions')}
          </button>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {embedOptions.find((o) => o.type === selectedType)?.title}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('embed.copyInstructions')}
            </p>

            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{getEmbedCode()}</code>
              </pre>
              <Button
                size="sm"
                onClick={copyCode}
                className="absolute top-2 right-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    {t('common.copied')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    {t('common.copy')}
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Code className="w-4 h-4" />
              {t('embed.advancedUsage')}
            </h4>
            <p className="text-sm text-blue-800 mb-2">
              {t('embed.advancedDesc')}
            </p>
            <pre className="bg-blue-100 text-blue-900 p-3 rounded text-xs overflow-x-auto">
{`// Abrir popup
Agendando.popup('${eventUrl}');

// Cerrar popup
Agendando.close();

// Embed inline en un contenedor
Agendando.inline('#mi-contenedor', '${eventUrl}');

// Escuchar cuando se completa una reserva
document.addEventListener('agendando:booked', (e) => {
  console.log('Reserva completada:', e.detail);
});`}
            </pre>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <a
              href={eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              {t('embed.viewPublicPage')}
              <ExternalLink className="w-4 h-4" />
            </a>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleClose}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
