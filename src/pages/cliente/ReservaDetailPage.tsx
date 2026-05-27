import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reservasApi } from '../../api/reservas.api';
import { extractError } from '../../api/client';
import { PageSpinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { StatusBadge } from '../../components/ui/Badge';
import { ArrowLeft, Calendar, Users, MapPin, CreditCard, BedDouble } from 'lucide-react';
import type { ReservaDetailDTO } from '../../types';

export default function ReservaDetailPage() {
  const { reservaGuid } = useParams<{ reservaGuid: string }>();
  const navigate = useNavigate();
  const [reserva, setReserva] = useState<ReservaDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reservaGuid) return;
    reservasApi.getMiReserva(reservaGuid)
      .then(({ data }) => setReserva((data as any).data ?? data))
      .catch(err => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, [reservaGuid]);

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button onClick={() => navigate('/cliente/reservas')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-navy-600 mb-5 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Mis reservas
      </button>

      {error && <Alert message={error} className="mb-4" />}

      {reserva && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-serif text-xl font-bold text-gray-800 mb-1">{reserva.nombreSucursal}</h1>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />{reserva.destino}
                </div>
              </div>
              <StatusBadge status={reserva.estadoReserva} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow icon={<Calendar className="h-4 w-4" />} label="Check-in" value={reserva.fechaInicio} />
              <InfoRow icon={<Calendar className="h-4 w-4" />} label="Check-out" value={reserva.fechaFin} />
              <InfoRow icon={<Users className="h-4 w-4" />} label="Adultos" value={String(reserva.numAdultos)} />
              {reserva.numNinos > 0 && (
                <InfoRow icon={<Users className="h-4 w-4" />} label="Niños" value={String(reserva.numNinos)} />
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-gray-500">Código de reserva</span>
              <span className="font-mono font-bold text-navy-600">{reserva.codigoReserva}</span>
            </div>
          </div>

          {reserva.habitaciones?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-700 mb-3">Habitaciones</h2>
              <div className="space-y-2">
                {reserva.habitaciones.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <BedDouble className="h-4 w-4 text-navy-400" />
                      <span>{h.tipoNombre} {h.numeroHabitacion && `· Hab. ${h.numeroHabitacion}`}</span>
                    </div>
                    {h.precioNoche > 0 && (
                      <span className="font-medium text-navy-600">${h.precioNoche}/noche</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {reserva.montoTotal > 0 && (
            <div className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Total</span>
                </div>
                <span className="text-xl font-bold text-navy-600">${reserva.montoTotal.toFixed(2)}</span>
              </div>
              {reserva.estadoPago && (
                <div className="mt-2 text-sm text-right">
                  <StatusBadge status={reserva.estadoPago} />
                </div>
              )}
            </div>
          )}

          {reserva.observaciones && (
            <div className="card text-sm">
              <p className="text-gray-500 font-medium mb-1">Observaciones</p>
              <p className="text-gray-700">{reserva.observaciones}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
      <span className="text-navy-400">{icon}</span>
      <span className="text-gray-500">{label}</span>
      <span className="ml-auto font-medium text-gray-800">{value}</span>
    </div>
  );
}
