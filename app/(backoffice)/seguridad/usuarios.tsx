import { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { seguridadApi } from '../../../src/api/seguridad.api';
import { extractError } from '../../../src/api/client';
import { Alert } from '../../../src/components/ui/Alert';
import { PageSpinner } from '../../../src/components/ui/Spinner';
import { Modal } from '../../../src/components/ui/Modal';
import { Badge } from '../../../src/components/ui/Badge';
import { Plus, Edit, RefreshCw, Users, Shield } from '../../../src/lib/icons';

export default function UsuariosScreen() {
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
        await seguridadApi.createUsuario({
          username: form.username,
          email: form.email,
          password: form.password,
          roleNames: form.roleNames,
        });
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
    <View className="flex-1 bg-kairos-bg">
      <FlatList
        data={usuarios}
        keyExtractor={item => item.usuarioGuid ?? item.id}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
        ListHeaderComponent={
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-gray-800">Usuarios</Text>
              <View className="flex-row gap-2">
                <Pressable onPress={load} className="border border-gray-200 rounded-lg p-2 bg-white">
                  <RefreshCw size={16} className="text-gray-600" />
                </Pressable>
                <Pressable onPress={openCreate} className="flex-row items-center gap-2 bg-gold-500 rounded-lg px-3 py-2">
                  <Plus size={16} className="text-white" />
                  <Text className="text-white font-semibold text-sm">Nuevo usuario</Text>
                </Pressable>
              </View>
            </View>
            {error ? <Alert message={error} type="error" /> : null}
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-16">
            <Users size={40} className="text-gray-300 mb-2" />
            <Text className="text-gray-400">No hay usuarios</Text>
          </View>
        }
        renderItem={({ item: u }) => (
          <View className="bg-white mx-4 mb-2 rounded-xl p-4 shadow-sm flex-row items-center">
            <View className="flex-1">
              <Text className="font-medium text-gray-800 text-sm mb-0.5">{u.username}</Text>
              <Text className="text-xs text-gray-500 mb-1">{u.email ?? '—'}</Text>
              <View className="flex-row flex-wrap gap-1">
                {(u.roles ?? []).slice(0, 3).map((r: string) => (
                  <View key={r} className="bg-blue-50 rounded-full px-2 py-0.5">
                    <Text className="text-xs text-navy-600">{r}</Text>
                  </View>
                ))}
                {(u.roles ?? []).length > 3 && (
                  <Text className="text-xs text-gray-400">+{u.roles.length - 3}</Text>
                )}
              </View>
            </View>
            <View className="items-end gap-2">
              <Badge value={u.activo !== false ? 'ACTIVO' : 'INACTIVO'} />
              <Pressable onPress={() => openEdit(u)} className="p-1">
                <Edit size={16} className="text-gray-400" />
              </Pressable>
            </View>
          </View>
        )}
        ListFooterComponent={<View className="h-4" />}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar usuario' : 'Nuevo usuario'}>
        <View className="gap-3">
          {saveError ? <Alert message={saveError} type="error" /> : null}
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Usuario *</Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.username}
              onChangeText={t => setForm({ ...form, username: t })}
              editable={!editing}
              style={editing ? { opacity: 0.5 } : undefined}
            />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Email</Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.email}
              onChangeText={t => setForm({ ...form, email: t })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {!editing && (
            <View>
              <Text className="text-xs font-medium text-gray-600 mb-1">Contraseña *</Text>
              <TextInput
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
                value={form.password}
                onChangeText={t => setForm({ ...form, password: t })}
                secureTextEntry
              />
            </View>
          )}
          {roles.length > 0 && (
            <View>
              <Text className="text-xs font-medium text-gray-600 mb-2">Roles</Text>
              <View className="flex-row flex-wrap gap-2">
                {roles.map((r: any) => {
                  const name = r.nombre ?? r.name ?? String(r);
                  const active = form.roleNames.includes(name);
                  return (
                    <Pressable
                      key={name}
                      onPress={() => toggleRole(name)}
                      className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full border ${
                        active ? 'bg-navy-600 border-navy-600' : 'bg-white border-gray-200'
                      }`}
                    >
                      <Shield size={12} className={active ? 'text-white' : 'text-gray-600'} />
                      <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-gray-600'}`}>{name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
          <View className="flex-row gap-2 pt-2">
            <Pressable onPress={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2.5 items-center">
              <Text className="text-sm text-gray-700 font-medium">Cancelar</Text>
            </Pressable>
            <Pressable onPress={save} disabled={saveLoading}
              className={`flex-1 bg-gold-500 rounded-lg py-2.5 items-center flex-row justify-center gap-2 ${saveLoading ? 'opacity-50' : ''}`}>
              {saveLoading && <ActivityIndicator size="small" color="#fff" />}
              <Text className="text-white font-semibold text-sm">{editing ? 'Actualizar' : 'Crear'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
