import { useState, useEffect } from 'react';
import { alojamientoApi } from '../../../api/alojamiento.api';
import { extractError } from '../../../api/client';
import { Alert } from '../../../components/ui/Alert';
import { PageSpinner, Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/Badge';
import { Plus, Edit, RefreshCw, MapPin } from 'lucide-react';

export default function SucursalesPage() {
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState({ nombre: '', destino: '', direccion: '', descripcion: '', tipoAlojamiento: 'HOTEL' });

  const load = () => {
    setLoading(true);
    alojamientoApi.listSucursales()
      .then(({ data }) => {
        const items = Array.isArray(data) ? data : (data as any).items ?? (data as any).data ?? [];
        setSucursales(items);
      })
      .catch(err => setError(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', destino: '', direccion: '', descripcion: '', tipoAlojamiento: 'HOTEL' });
    setSaveError('');
    setShowModal(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      nombre: s.nombre ?? s.nombreSucursal,
      destino: s.destino,
      direccion: s.direccion ?? '',
      descripcion: s.descripcion ?? '',
      tipoAlojamiento: s.tipoAlojamiento ?? 'HOTEL',
    });
    setSaveError('');
    setShowModal(true);
  };

  const save = async () => {
    if (!form.nombre || !form.destino) { setSaveError('Nombre y destino son obligatorios.'); return; }
    setSaveLoading(true);
    setSaveError('');
    try {
      if (editing) {
        await alojamientoApi.updateSucursal(editing.sucursalGuid, form);
      } else {
        await alojamientoApi.createSucursal(form);
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
        <h1 className="font-serif text-2xl font-bold text-gray-800">Sucursales</h1>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline text-sm flex items-center gap-2"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-2"><Plus className="h-4 w-4" /> Nueva sucursal</button>
        </div>
      </div>

      {error && <Alert message={error} className="mb-4" />}

      <div className="grid md:grid-cols-2 gap-4">
        {sucursales.length === 0 ? (
          <div className="col-span-2 card text-center py-10 text-gray-400">
            <MapPin className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            No hay sucursales registradas
          </div>
        ) : sucursales.map((s: any) => (
          <div key={s.sucursalGuid} className="card">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-800">{s.nombre ?? s.nombreSucursal}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <MapPin className="h-3 w-3" />{s.destino}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={s.estado ?? s.activo ? 'ACT' : 'INA'} />
                <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-navy-600 transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">{s.descripcion || s.direccion}</p>
            <span className="mt-2 inline-block text-xs bg-navy-50 text-navy-600 rounded-full px-2 py-0.5">{s.tipoAlojamiento}</span>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar sucursal' : 'Nueva sucursal'}>
        <div className="space-y-3">
          {saveError && <Alert message={saveError} />}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
            <input className="input-field" type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Destino / Ciudad *</label>
            <input className="input-field" type="text" value={form.destino} onChange={e => setForm({ ...form, destino: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Dirección</label>
            <input className="input-field" type="text" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <select className="input-field" value={form.tipoAlojamiento} onChange={e => setForm({ ...form, tipoAlojamiento: e.target.value })}>
              {['HOTEL', 'HOSTAL', 'APART_HOTEL', 'RESORT', 'BOUTIQUE'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
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
