import { useState, useEffect } from 'react';
import { alojamientoApi } from '../../../api/alojamiento.api';
import { extractError } from '../../../api/client';
import { Alert } from '../../../components/ui/Alert';
import { PageSpinner, Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';
import { Plus, Edit, RefreshCw, BedDouble } from 'lucide-react';

export default function TiposHabitacionPage() {
  const [tipos, setTipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    capacidadMaxima: 2,
    precioPorNoche: 0,
    sucursalGuid: '',
  });
  const [sucursales, setSucursales] = useState<any[]>([]);

  const load = () => {
    setLoading(true);
    Promise.all([
      alojamientoApi.listTiposHabitacion(),
      alojamientoApi.listSucursales(),
    ]).then(([t, s]) => {
      setTipos(Array.isArray(t.data) ? t.data : (t.data as any).items ?? (t.data as any).data ?? []);
      setSucursales(Array.isArray(s.data) ? s.data : (s.data as any).items ?? (s.data as any).data ?? []);
    })
    .catch(err => setError(extractError(err)))
    .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', descripcion: '', capacidadMaxima: 2, precioPorNoche: 0, sucursalGuid: sucursales[0]?.sucursalGuid ?? '' });
    setSaveError('');
    setShowModal(true);
  };

  const openEdit = (t: any) => {
    setEditing(t);
    setForm({
      nombre: t.nombre,
      descripcion: t.descripcion ?? '',
      capacidadMaxima: t.capacidadMaxima,
      precioPorNoche: t.precioPorNoche,
      sucursalGuid: t.sucursalGuid ?? '',
    });
    setSaveError('');
    setShowModal(true);
  };

  const save = async () => {
    if (!form.nombre || form.precioPorNoche <= 0) {
      setSaveError('Nombre y precio son obligatorios.');
      return;
    }
    setSaveLoading(true);
    setSaveError('');
    try {
      if (editing) {
        await alojamientoApi.updateTipoHabitacion(editing.tipoHabitacionGuid, form);
      } else {
        await alojamientoApi.createTipoHabitacion(form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setSaveError(extractError(err));
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-gray-800">Tipos de habitación</h1>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline text-sm"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-2"><Plus className="h-4 w-4" /> Nuevo tipo</button>
        </div>
      </div>

      {error && <Alert message={error} className="mb-4" />}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tipos.length === 0 ? (
          <div className="col-span-3 card text-center py-10 text-gray-400">
            <BedDouble className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            No hay tipos de habitación
          </div>
        ) : tipos.map((t: any) => (
          <div key={t.tipoHabitacionGuid} className="card">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{t.nombre}</h3>
              <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-navy-600 transition-colors ml-2 flex-shrink-0">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{t.descripcion || 'Sin descripción'}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{t.capacidadMaxima} personas máx.</span>
              <span className="font-bold text-navy-600">${Number(t.precioPorNoche).toFixed(2)}/noche</span>
            </div>
            {t.nombreSucursal && (
              <p className="text-xs text-gray-400 mt-2">{t.nombreSucursal}</p>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar tipo' : 'Nuevo tipo de habitación'}>
        <div className="space-y-3">
          {saveError && <Alert message={saveError} />}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
            <input className="input-field" type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Capacidad máx.</label>
              <input className="input-field" type="number" min="1" max="20" value={form.capacidadMaxima}
                onChange={e => setForm({ ...form, capacidadMaxima: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio/noche *</label>
              <input className="input-field" type="number" min="0" step="0.01" value={form.precioPorNoche}
                onChange={e => setForm({ ...form, precioPorNoche: Number(e.target.value) })} />
            </div>
          </div>
          {sucursales.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sucursal</label>
              <select className="input-field" value={form.sucursalGuid} onChange={e => setForm({ ...form, sucursalGuid: e.target.value })}>
                <option value="">Sin asignar</option>
                {sucursales.map(s => <option key={s.sucursalGuid} value={s.sucursalGuid}>{s.nombre ?? s.nombreSucursal}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <textarea className="input-field" rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancelar</button>
            <button onClick={save} disabled={saveLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saveLoading && <Spinner size="sm" />}
              {editing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
