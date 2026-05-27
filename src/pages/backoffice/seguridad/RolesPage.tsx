import { useState, useEffect } from 'react';
import { seguridadApi } from '../../../api/seguridad.api';
import { extractError } from '../../../api/client';
import { Alert } from '../../../components/ui/Alert';
import { PageSpinner, Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';
import { Plus, RefreshCw, Shield } from 'lucide-react';

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState({ nombre: '', descripcion: '' });

  const load = () => {
    setLoading(true);
    seguridadApi.listRoles()
      .then(({ data }) => {
        setRoles(Array.isArray(data) ? data : (data as any).data ?? (data as any).items ?? []);
      })
      .catch(err => setError(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const save = async () => {
    if (!form.nombre) { setSaveError('El nombre del rol es obligatorio.'); return; }
    setSaveLoading(true);
    setSaveError('');
    try {
      await seguridadApi.createRol(form);
      setShowModal(false);
      setForm({ nombre: '', descripcion: '' });
      load();
    } catch (err) {
      setSaveError(extractError(err));
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <PageSpinner />;

  const systemRoles = ['ADMINISTRADOR', 'ADMIN', 'RECEPCIONISTA', 'OPERATIVO', 'DESK_SERVICE', 'CLIENTE'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-gray-800">Roles</h1>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline text-sm"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={() => { setForm({ nombre: '', descripcion: '' }); setSaveError(''); setShowModal(true); }}
            className="btn-primary text-sm flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nuevo rol
          </button>
        </div>
      </div>

      {error && <Alert message={error} className="mb-4" />}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.length === 0 ? (
          <div className="col-span-3 card text-center py-10 text-gray-400">
            <Shield className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            No hay roles registrados
          </div>
        ) : roles.map((r: any) => {
          const name = r.nombre ?? r.name ?? String(r);
          const isSystem = systemRoles.includes(name.toUpperCase());
          return (
            <div key={r.rolGuid ?? r.id ?? name} className="card">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  isSystem ? 'bg-navy-100 text-navy-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{name}</h3>
                  {r.descripcion && <p className="text-xs text-gray-500">{r.descripcion}</p>}
                  {isSystem && <span className="text-xs text-navy-500 font-medium">Rol del sistema</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo rol">
        <div className="space-y-3">
          {saveError && <Alert message={saveError} />}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del rol *</label>
            <input className="input-field" type="text" placeholder="NOMBRE_ROL" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <input className="input-field" type="text" value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancelar</button>
            <button onClick={save} disabled={saveLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saveLoading && <Spinner size="sm" />}
              Crear rol
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
