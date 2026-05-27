import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { hospedajeApi } from '../../../api/hospedaje.api';
import { extractError } from '../../../api/client';
import { Alert } from '../../../components/ui/Alert';
import { PageSpinner } from '../../../components/ui/Spinner';
import { StatusBadge } from '../../../components/ui/Badge';
import { ChevronRight, RefreshCw } from 'lucide-react';

const ESTADOS_ESTADIA = ['', 'ACT', 'FIN', 'PEN'];

export default function EstadiasListPage() {
  const navigate = useNavigate();
  const [estadias, setEstadias] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estado, setEstado] = useState('');
  const [pagina, setPagina] = useState(1);
  const limite = 15;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await hospedajeApi.listEstadias({ estado: estado || undefined, pagina, limite });
      const items = Array.isArray(data) ? data : (data as any).items ?? (data as any).data ?? [];
      setEstadias(items);
      setTotal((data as any).totalCount ?? items.length);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [estado, pagina]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limite);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-gray-800">Estadías</h1>
        <button onClick={load} className="btn-outline flex items-center gap-2 text-sm">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </button>
      </div>

      <div className="card mb-5 flex gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
          <select className="input-field" value={estado} onChange={e => { setEstado(e.target.value); setPagina(1); }}>
            {ESTADOS_ESTADIA.map(s => <option key={s} value={s}>{s || 'Todos'}</option>)}
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
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estadía</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Habitación</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Check-in</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Check-out</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {estadias.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">No hay estadías</td>
                  </tr>
                ) : estadias.map((e: any) => (
                  <tr key={e.estadiaGuid} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{e.estadiaGuid?.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-gray-700">{e.nombreCliente ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{e.numeroHabitacion ?? e.habitacionGuid?.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-gray-600">{e.fechaCheckIn}</td>
                    <td className="px-4 py-3 text-gray-600">{e.fechaCheckOut ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={e.estadoEstadia ?? e.estado ?? 'ACT'} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/backoffice/estadias/${e.estadiaGuid}`)} className="text-navy-600 hover:text-navy-800">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-gray-500">{total} estadías en total</span>
              <div className="flex gap-2">
                <button disabled={pagina <= 1} onClick={() => setPagina(p => p - 1)} className="btn-outline px-3 py-1.5 disabled:opacity-40">Anterior</button>
                <span className="px-3 py-1.5 text-gray-600">{pagina} / {totalPages}</span>
                <button disabled={pagina >= totalPages} onClick={() => setPagina(p => p + 1)} className="btn-outline px-3 py-1.5 disabled:opacity-40">Siguiente</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
