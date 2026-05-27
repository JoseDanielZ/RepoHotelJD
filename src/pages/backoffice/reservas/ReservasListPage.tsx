import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservasApi } from '../../../api/reservas.api';
import { extractError } from '../../../api/client';
import { Alert } from '../../../components/ui/Alert';
import { PageSpinner } from '../../../components/ui/Spinner';
import { StatusBadge } from '../../../components/ui/Badge';
import { Search, Filter, ChevronRight, RefreshCw } from 'lucide-react';
import type { ReservaSummaryDTO } from '../../../types';

const ESTADOS = ['', 'PEN', 'CON', 'CAN', 'CHI', 'CHO', 'FIN'];

export default function ReservasListPage() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState<ReservaSummaryDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [pagina, setPagina] = useState(1);
  const limite = 15;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await reservasApi.list({
        codigoReserva: search || undefined,
        estadoReserva: estado || undefined,
        pagina,
        limite,
      });
      const items = Array.isArray(data) ? data : (data as any).items ?? (data as any).data ?? [];
      setReservas(items);
      setTotal((data as any).totalCount ?? items.length);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [search, estado, pagina]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limite);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-gray-800">Reservas</h1>
        <button onClick={load} className="btn-outline flex items-center gap-2 text-sm">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-5 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Buscar por código</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="input-field pl-9"
              type="text"
              placeholder="RES-..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPagina(1); }}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
          <select className="input-field" value={estado} onChange={e => { setEstado(e.target.value); setPagina(1); }}>
            {ESTADOS.map(s => <option key={s} value={s}>{s || 'Todos'}</option>)}
          </select>
        </div>
      </div>

      {error && <Alert message={error} className="mb-4" />}

      {loading ? <PageSpinner /> : (
        <>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Alojamiento</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fechas</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {reservas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">No hay reservas</td>
                  </tr>
                ) : reservas.map(r => (
                  <tr key={r.reservaGuid} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-navy-600">{r.codigoReserva}</td>
                    <td className="px-4 py-3 text-gray-700">{r.nombreCliente ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{r.nombreSucursal}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.fechaInicio} → {r.fechaFin}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.estadoReserva} /></td>
                    <td className="px-4 py-3 font-medium">{r.montoTotal > 0 ? `$${r.montoTotal.toFixed(2)}` : '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/backoffice/reservas/${r.reservaGuid}`)} className="text-navy-600 hover:text-navy-800">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-gray-500">{total} reservas en total</span>
              <div className="flex gap-2">
                <button disabled={pagina <= 1} onClick={() => setPagina(p => p - 1)} className="btn-outline px-3 py-1.5 disabled:opacity-40">
                  Anterior
                </button>
                <span className="px-3 py-1.5 text-gray-600">{pagina} / {totalPages}</span>
                <button disabled={pagina >= totalPages} onClick={() => setPagina(p => p + 1)} className="btn-outline px-3 py-1.5 disabled:opacity-40">
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
