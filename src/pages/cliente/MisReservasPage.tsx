import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservasApi } from '../../api/reservas.api';
import { extractError } from '../../api/client';
import { PageSpinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { StatusBadge } from '../../components/ui/Badge';
import { BedDouble, Calendar, ChevronRight, MapPin } from 'lucide-react';
import type { ReservaSummaryDTO } from '../../types';

export default function MisReservasPage() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState<ReservaSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reservasApi.getMisReservas()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data as any).data ?? (data as any).items ?? [];
        setReservas(list);
      })
      .catch(err => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-serif text-2xl font-bold text-navy-600 mb-6">Mis reservas</h1>

      {error && <Alert message={error} className="mb-4" />}

      {reservas.length === 0 ? (
        <div className="card text-center py-16">
          <BedDouble className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-1">No tienes reservas aún.</p>
          <p className="text-sm text-gray-400 mb-6">Explora nuestros alojamientos y haz tu primera reserva.</p>
          <button onClick={() => navigate('/search')} className="btn-primary">Buscar alojamiento</button>
        </div>
      ) : (
        <div className="space-y-4">
          {reservas.map(r => (
            <div
              key={r.reservaGuid}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/cliente/reservas/${r.reservaGuid}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={r.estadoReserva} />
                    <span className="font-mono text-xs text-gray-400">{r.codigoReserva}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 truncate mb-1">{r.nombreSucursal}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{r.fechaInicio}</span>
                    <span>→</span>
                    <span>{r.fechaFin}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.montoTotal > 0 && (
                    <span className="font-bold text-navy-600">${r.montoTotal.toFixed(2)}</span>
                  )}
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
