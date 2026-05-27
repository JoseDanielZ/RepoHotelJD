import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reservasApi } from '../../../api/reservas.api';
import { extractError } from '../../../api/client';
import { PageSpinner } from '../../../components/ui/Spinner';
import { Alert } from '../../../components/ui/Alert';
import { StatusBadge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { ArrowLeft, CheckCircle2, XCircle, LogIn } from 'lucide-react';
import type { ReservaDetailDTO } from '../../../types';

export default function ReservaDetailPage() {
  const { reservaGuid } = useParams<{ reservaGuid: string }>();
  const navigate = useNavigate();
  const [reserva, setReserva] = useState<ReservaDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadReserva = () => {
    if (!reservaGuid) return;
    setLoading(true);
    reservasApi.getReserva(reservaGuid)
      .then(({ data }) => setReserva((data as any).data ?? data))
      .catch(err => setError(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadReserva, [reservaGuid]);

  const doAction = async (action: () => Promise<any>, msg: string) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await action();
      setSuccess(msg);
      loadReserva();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate('/backoffice/reservas')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-navy-600 mb-5 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Reservas
      </button>

      {error && <Alert message={error} className="mb-4" />}
      {success && <Alert message={success} type="success" className="mb-4" />}

      {reserva && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h1 className="font-serif text-xl font-bold text-gray-800 mb-1">{reserva.nombreSucursal}</h1>
                <p className="font-mono text-sm text-navy-600">{reserva.codigoReserva}</p>
              </div>
              <StatusBadge status={reserva.estadoReserva} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-400 mb-0.5">Check-in</p>
                <p className="font-medium">{reserva.fechaInicio}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-400 mb-0.5">Check-out</p>
                <p className="font-medium">{reserva.fechaFin}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-400 mb-0.5">Adultos</p>
                <p className="font-medium">{reserva.numAdultos}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-400 mb-0.5">Niños</p>
                <p className="font-medium">{reserva.numNinos}</p>
              </div>
            </div>

            {reserva.observaciones && (
              <p className="text-sm text-gray-500 italic">{reserva.observaciones}</p>
            )}
          </div>

          {/* Cliente */}
          {reserva.cliente && (
            <div className="card">
              <h2 className="font-semibold text-gray-700 mb-3">Cliente</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <DataItem label="Nombre" value={`${reserva.cliente.nombres} ${reserva.cliente.apellidos}`} />
                <DataItem label="Documento" value={`${reserva.cliente.tipoIdentificacion} ${reserva.cliente.numeroIdentificacion}`} />
                <DataItem label="Correo" value={reserva.cliente.correo} />
                <DataItem label="Teléfono" value={reserva.cliente.telefono} />
              </div>
            </div>
          )}

          {/* Habitaciones */}
          {reserva.habitaciones?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-700 mb-3">Habitaciones</h2>
              {reserva.habitaciones.map((h, i) => (
                <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                  <span>{h.tipoNombre} {h.numeroHabitacion && `· #${h.numeroHabitacion}`}</span>
                  {h.precioNoche > 0 && <span className="font-medium text-navy-600">${h.precioNoche}/noche</span>}
                </div>
              ))}
              {reserva.montoTotal > 0 && (
                <div className="flex justify-between font-bold text-sm pt-3">
                  <span>Total</span>
                  <span className="text-navy-600">${reserva.montoTotal.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="card">
            <h2 className="font-semibold text-gray-700 mb-3">Acciones</h2>
            <div className="flex flex-wrap gap-3">
              {reserva.estadoReserva === 'PEN' && (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() => doAction(() => reservasApi.confirmarReserva(reservaGuid!), 'Reserva confirmada.')}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    {actionLoading ? <Spinner size="sm" /> : <CheckCircle2 className="h-4 w-4" />}
                    Confirmar
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => doAction(() => reservasApi.cancelarReserva(reservaGuid!, { motivo: 'Cancelado por operador' }), 'Reserva cancelada.')}
                    className="btn-outline flex items-center gap-2 text-sm text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" /> Cancelar
                  </button>
                </>
              )}
              {reserva.estadoReserva === 'CON' && (
                <button
                  disabled={actionLoading}
                  onClick={() => navigate('/backoffice/checkin')}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <LogIn className="h-4 w-4" /> Ir a Check-in
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium text-gray-700">{value}</p>
    </div>
  );
}
