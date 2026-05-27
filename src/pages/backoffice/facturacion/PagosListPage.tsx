import { useState, useEffect, useCallback } from 'react';
import { facturacionApi } from '../../../api/facturacion.api';
import { extractError } from '../../../api/client';
import { Alert } from '../../../components/ui/Alert';
import { PageSpinner } from '../../../components/ui/Spinner';
import { StatusBadge } from '../../../components/ui/Badge';
import { RefreshCw, DollarSign } from 'lucide-react';

export default function PagosListPage() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagina, setPagina] = useState(1);
  const limite = 15;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await facturacionApi.listPagos({ pagina, limite });
      const items = Array.isArray(data) ? data : (data as any).items ?? (data as any).data ?? [];
      setPagos(items);
      setTotal((data as any).totalCount ?? items.length);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [pagina]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limite);

  const totalMonto = pagos.reduce((s: number, p: any) => s + Number(p.monto ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-gray-800">Pagos</h1>
        <button onClick={load} className="btn-outline flex items-center gap-2 text-sm">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </button>
      </div>

      {pagos.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 mb-5 flex items-center gap-3 text-sm">
          <DollarSign className="h-5 w-5 text-green-600" />
          <span className="text-gray-600">Total página actual:</span>
          <span className="font-bold text-green-700">${totalMonto.toFixed(2)}</span>
        </div>
      )}

      {error && <Alert message={error} className="mb-4" />}

      {loading ? <PageSpinner /> : (
        <>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Pago</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Factura</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Método</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Monto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pagos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <DollarSign className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-400">No hay pagos registrados</p>
                    </td>
                  </tr>
                ) : pagos.map((p: any) => (
                  <tr key={p.pagoGuid} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.pagoGuid?.slice(0, 8)}…</td>
                    <td className="px-4 py-3 font-mono text-navy-600">{p.numeroFactura ?? p.facturaGuid?.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-gray-600">{p.fechaPago?.split('T')[0] ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.metodoPago ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-green-700">${Number(p.monto ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.estadoPago ?? p.estado ?? 'APR'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-gray-500">{total} pagos en total</span>
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
