import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hospedajeApi } from '../../../api/hospedaje.api';
import { extractError } from '../../../api/client';
import { PageSpinner, Spinner } from '../../../components/ui/Spinner';
import { Alert } from '../../../components/ui/Alert';
import { StatusBadge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { ArrowLeft, Plus, Receipt } from 'lucide-react';

export default function EstadiaDetailPage() {
  const { estadiaGuid } = useParams<{ estadiaGuid: string }>();
  const navigate = useNavigate();
  const [estadia, setEstadia] = useState<any>(null);
  const [cargos, setCargos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCargo, setShowAddCargo] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [cargo, setCargo] = useState({ concepto: '', monto: 0, detalle: '' });

  const loadData = () => {
    if (!estadiaGuid) return;
    setLoading(true);
    Promise.all([
      hospedajeApi.getEstadia(estadiaGuid),
      hospedajeApi.getCargos(estadiaGuid),
    ]).then(([e, c]) => {
      setEstadia((e.data as any).data ?? e.data);
      const cs = Array.isArray(c.data) ? c.data : (c.data as any).data ?? (c.data as any).items ?? [];
      setCargos(cs);
    }).catch(err => setError(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, [estadiaGuid]);

  const addCargo = async () => {
    setAddLoading(true);
    setAddError('');
    try {
      await hospedajeApi.addCargo(estadiaGuid!, cargo);
      setShowAddCargo(false);
      setCargo({ concepto: '', monto: 0, detalle: '' });
      loadData();
    } catch (err) {
      setAddError(extractError(err));
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) return <PageSpinner />;

  const totalCargos = cargos.reduce((s: number, c: any) => s + (c.monto ?? 0), 0);

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate('/backoffice/estadias')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-navy-600 mb-5 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Estadías
      </button>

      {error && <Alert message={error} className="mb-4" />}

      {estadia && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-serif text-xl font-bold text-gray-800">Estadía</h1>
              <StatusBadge status={estadia.estadoEstadia ?? estadia.estado ?? 'ACT'} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <DataItem label="Cliente" value={estadia.nombreCliente ?? '—'} />
              <DataItem label="Habitación" value={estadia.numeroHabitacion ?? '—'} />
              <DataItem label="Check-in" value={estadia.fechaCheckIn ?? '—'} />
              <DataItem label="Check-out" value={estadia.fechaCheckOut ?? 'En curso'} />
            </div>
          </div>

          {/* Cargos */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-700">Cargos adicionales</h2>
              <button onClick={() => setShowAddCargo(true)} className="btn-outline flex items-center gap-1 text-sm">
                <Plus className="h-4 w-4" /> Agregar
              </button>
            </div>

            {cargos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sin cargos adicionales</p>
            ) : (
              <div className="space-y-2">
                {cargos.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-700">{c.concepto}</p>
                      {c.detalle && <p className="text-xs text-gray-400">{c.detalle}</p>}
                    </div>
                    <span className="font-semibold text-navy-600">${Number(c.monto).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-sm pt-2">
                  <span>Total cargos</span>
                  <span className="text-navy-600">${totalCargos.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/backoffice/facturas')}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Receipt className="h-4 w-4" /> Ver facturación
            </button>
          </div>
        </div>
      )}

      {/* Add cargo modal */}
      <Modal isOpen={showAddCargo} onClose={() => setShowAddCargo(false)} title="Agregar cargo">
        <div className="space-y-3">
          {addError && <Alert message={addError} />}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Concepto *</label>
            <input className="input-field" type="text" value={cargo.concepto}
              onChange={e => setCargo({ ...cargo, concepto: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Monto *</label>
            <input className="input-field" type="number" min="0" step="0.01" value={cargo.monto}
              onChange={e => setCargo({ ...cargo, monto: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Detalle</label>
            <input className="input-field" type="text" value={cargo.detalle}
              onChange={e => setCargo({ ...cargo, detalle: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setShowAddCargo(false)} className="btn-outline flex-1">Cancelar</button>
            <button onClick={addCargo} disabled={addLoading || !cargo.concepto} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {addLoading && <Spinner size="sm" />}
              Agregar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="font-medium text-gray-700 text-sm">{value}</p>
    </div>
  );
}
