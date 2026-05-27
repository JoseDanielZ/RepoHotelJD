import { useState, useEffect } from 'react';
import { alojamientoApi } from '../../../api/alojamiento.api';
import { extractError } from '../../../api/client';
import { Alert } from '../../../components/ui/Alert';
import { PageSpinner, Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/Badge';
import { Plus, Edit, RefreshCw, BedDouble } from 'lucide-react';

export default function HabitacionesPage() {
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [filterSucursal, setFilterSucursal] = useState('');
  const [form, setForm] = useState({
    numeroHabitacion: '',
    piso: 1,
    sucursalGuid: '',
    tipoHabitacionGuid: '',
    descripcion: '',
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      alojamientoApi.listHabitaciones({ sucursalGuid: filterSucursal || undefined }),
      alojamientoApi.listSucursales(),
      alojamientoApi.listTiposHabitacion(),
    ]).then(([h, s, t]) => {
      setHabitaciones(Array.isArray(h.data) ? h.data : (h.data as any).items ?? (h.data as any).data ?? []);
      setSucursales(Array.isArray(s.data) ? s.data : (s.data as any).items ?? (s.data as any).data ?? []);
      setTipos(Array.isArray(t.data) ? t.data : (t.data as any).items ?? (t.data as any).data ?? []);
    })
    .catch(err => setError(extractError(err)))
    .finally(() => setLoading(false));
  };

  useEffect(load, [filterSucursal]);

  const openCreate = () => {
    setEditing(null);
    setForm({ numeroHabitacion: '', piso: 1, sucursalGuid: sucursales[0]?.sucursalGuid ?? '', tipoHabitacionGuid: tipos[0]?.tipoHabitacionGuid ?? '', descripcion: '' });
    setSaveError('');
    setShowModal(true);
  };

  const openEdit = (h: any) => {
    setEditing(h);
    setForm({
      numeroHabitacion: h.numeroHabitacion,
      piso: h.piso ?? 1,
      sucursalGuid: h.sucursalGuid,
      tipoHabitacionGuid: h.tipoHabitacionGuid,
      descripcion: h.descripcion ?? '',
    });
    setSaveError('');
    setShowModal(true);
  };

  const save = async () => {
    if (!form.numeroHabitacion || !form.sucursalGuid || !form.tipoHabitacionGuid) {
      setSaveError('Número, sucursal y tipo son obligatorios.');
      return;
    }
    setSaveLoading(true);
    setSaveError('');
    try {
      if (editing) {
        await alojamientoApi.updateHabitacion(editing.habitacionGuid, form);
      } else {
        await alojamientoApi.createHabitacion(form);
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
        <h1 className="font-serif text-2xl font-bold text-gray-800">Habitaciones</h1>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline text-sm"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-2"><Plus className="h-4 w-4" /> Nueva habitación</button>
        </div>
      </div>

      <div className="card mb-5 flex gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Sucursal</label>
          <select className="input-field" value={filterSucursal} onChange={e => setFilterSucursal(e.target.value)}>
            <option value="">Todas</option>
            {sucursales.map(s => <option key={s.sucursalGuid} value={s.sucursalGuid}>{s.nombre ?? s.nombreSucursal}</option>)}
          </select>
        </div>
      </div>

      {error && <Alert message={error} className="mb-4" />}

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Número</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Piso</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Sucursal</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {habitaciones.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <BedDouble className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400">No hay habitaciones</p>
                </td>
              </tr>
            ) : habitaciones.map((h: any) => (
              <tr key={h.habitacionGuid} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-navy-600">{h.numeroHabitacion}</td>
                <td className="px-4 py-3 text-gray-600">{h.piso}</td>
                <td className="px-4 py-3 text-gray-600">{h.tipoNombre ?? h.tipoHabitacionGuid?.slice(0, 8)}</td>
                <td className="px-4 py-3 text-gray-600">{h.nombreSucursal ?? h.sucursalGuid?.slice(0, 8)}</td>
                <td className="px-4 py-3"><StatusBadge status={h.estadoHabitacion ?? h.estado ?? 'DIS'} /></td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(h)} className="text-gray-400 hover:text-navy-600">
                    <Edit className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar habitación' : 'Nueva habitación'}>
        <div className="space-y-3">
          {saveError && <Alert message={saveError} />}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Número de habitación *</label>
            <input className="input-field" type="text" value={form.numeroHabitacion} onChange={e => setForm({ ...form, numeroHabitacion: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Piso</label>
            <input className="input-field" type="number" min="1" value={form.piso} onChange={e => setForm({ ...form, piso: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sucursal *</label>
            <select className="input-field" value={form.sucursalGuid} onChange={e => setForm({ ...form, sucursalGuid: e.target.value })}>
              <option value="">Seleccionar</option>
              {sucursales.map(s => <option key={s.sucursalGuid} value={s.sucursalGuid}>{s.nombre ?? s.nombreSucursal}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de habitación *</label>
            <select className="input-field" value={form.tipoHabitacionGuid} onChange={e => setForm({ ...form, tipoHabitacionGuid: e.target.value })}>
              <option value="">Seleccionar</option>
              {tipos.map(t => <option key={t.tipoHabitacionGuid} value={t.tipoHabitacionGuid}>{t.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <input className="input-field" type="text" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
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
