import { useState, useEffect } from 'react';
import { seguridadApi } from '../../../api/seguridad.api';
import { extractError } from '../../../api/client';
import { Alert } from '../../../components/ui/Alert';
import { PageSpinner, Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/Badge';
import { Plus, Edit, RefreshCw, Users, Shield } from 'lucide-react';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '', roleNames: [] as string[] });

  const load = () => {
    setLoading(true);
    Promise.all([seguridadApi.listUsuarios(), seguridadApi.listRoles()])
      .then(([u, r]) => {
        setUsuarios(Array.isArray(u.data) ? u.data : (u.data as any).data ?? (u.data as any).items ?? []);
        setRoles(Array.isArray(r.data) ? r.data : (r.data as any).data ?? (r.data as any).items ?? []);
      })
      .catch(err => setError(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ username: '', email: '', password: '', roleNames: [] });
    setSaveError('');
    setShowModal(true);
  };

  const openEdit = (u: any) => {
    setEditing(u);
    setForm({ username: u.username, email: u.email ?? '', password: '', roleNames: u.roles ?? [] });
    setSaveError('');
    setShowModal(true);
  };

  const save = async () => {
    if (!form.username || (!editing && !form.password)) {
      setSaveError('Usuario y contraseña son obligatorios.');
      return;
    }
    setSaveLoading(true);
    setSaveError('');
    try {
      if (editing) {
        await seguridadApi.updateUsuario(editing.usuarioGuid ?? editing.id, {
          email: form.email,
          roleNames: form.roleNames,
        });
      } else {
        await seguridadApi.createUsuario({ username: form.username, email: form.email, password: form.password, roleNames: form.roleNames });
      }
      setShowModal(false);
      load();
    } catch (err) {
      setSaveError(extractError(err));
    } finally {
      setSaveLoading(false);
    }
  };

  const toggleRole = (roleName: string) => {
    setForm(f => ({
      ...f,
      roleNames: f.roleNames.includes(roleName)
        ? f.roleNames.filter(r => r !== roleName)
        : [...f.roleNames, roleName],
    }));
  };

  if (loading) return <PageSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-gray-800">Usuarios</h1>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline text-sm"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-2"><Plus className="h-4 w-4" /> Nuevo usuario</button>
        </div>
      </div>

      {error && <Alert message={error} className="mb-4" />}

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Usuario</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Roles</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400">No hay usuarios</p>
                </td>
              </tr>
            ) : usuarios.map((u: any) => (
              <tr key={u.usuarioGuid ?? u.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{u.username}</td>
                <td className="px-4 py-3 text-gray-600">{u.email ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(u.roles ?? []).slice(0, 3).map((r: string) => (
                      <span key={r} className="bg-navy-50 text-navy-600 text-xs px-2 py-0.5 rounded-full">{r}</span>
                    ))}
                    {(u.roles ?? []).length > 3 && <span className="text-xs text-gray-400">+{u.roles.length - 3}</span>}
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={u.activo !== false ? 'ACT' : 'INA'} /></td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(u)} className="text-gray-400 hover:text-navy-600">
                    <Edit className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar usuario' : 'Nuevo usuario'}>
        <div className="space-y-3">
          {saveError && <Alert message={saveError} />}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Usuario *</label>
            <input className="input-field" type="text" value={form.username} disabled={!!editing}
              onChange={e => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input className="input-field" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          {!editing && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña *</label>
              <input className="input-field" type="password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
          )}
          {roles.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Roles</label>
              <div className="flex flex-wrap gap-2">
                {roles.map((r: any) => {
                  const name = r.nombre ?? r.name ?? r;
                  const active = form.roleNames.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleRole(name)}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all ${
                        active ? 'bg-navy-600 text-white border-navy-600' : 'bg-white text-gray-600 border-gray-200 hover:border-navy-400'
                      }`}
                    >
                      <Shield className="h-3 w-3" />{name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
