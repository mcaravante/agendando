import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, Check } from 'lucide-react';
import { Button } from '../components/common/Button';
import api from '../utils/api';

export function CancelBooking() {
  const { token } = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await api.post(`/bookings/cancel/${token}`, { reason });
      setIsCancelled(true);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('Reserva no encontrada o ya fue cancelada.');
      } else {
        setError(error.response?.data?.error || 'Error al cancelar la reunión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isCancelled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl border p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Reunión Cancelada
            </h1>
            <p className="text-gray-600 mb-4">
              La reunión ha sido cancelada exitosamente. Ambas partes recibirán un email de confirmación.
            </p>
            <Link to="/">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl border p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link to="/">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl border p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Cancelar Reunión
            </h1>
            <p className="text-gray-600">
              ¿Estás seguro de que deseas cancelar esta reunión?
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de cancelación (opcional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Cuéntanos por qué cancelas..."
            />
          </div>

          <div className="flex gap-3">
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                No, volver
              </Button>
            </Link>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleCancel}
              isLoading={isLoading}
            >
              Sí, cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
