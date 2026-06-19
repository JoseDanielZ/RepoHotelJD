import { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { seguridadApi } from '../../../src/api/seguridad.api';
import { extractError } from '../../../src/api/client';
import { Alert } from '../../../src/components/ui/Alert';
import { PageSpinner } from '../../../src/components/ui/Spinner';
import { Modal } from '../../../src/components/ui/Modal';
import { Plus, RefreshCw, Shield } from '../../../src/lib/icons';

const SYSTEM_ROLES = ['ADMINISTRADOR', 'ADMIN', 'RECEPCIONISTA', 'OPERATIVO', 'DESK_SERVICE', 'CLIENTE'];

export default function RolesScreen() {
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

  return (
    <View className="flex-1 bg-kairos-bg">
      <FlatList
        data={roles}
        keyExtractor={item => item.rolGuid ?? item.id ?? String(item.nombre ?? item.name)}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
        ListHeaderComponent={
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-gray-800">Roles</Text>
              <View className="flex-row gap-2">
                <Pressable onPress={load} className="border border-gray-200 rounded-lg p-2 bg-white">
                  <RefreshCw size={16} className="text-gray-600" />
                </Pressable>
                <Pressable
                  onPress={() => { setForm({ nombre: '', descripcion: '' }); setSaveError(''); setShowModal(true); }}
                  className="flex-row items-center gap-2 bg-gold-500 rounded-lg px-3 py-2">
                  <Plus size={16} className="text-white" />
                  <Text className="text-white font-semibold text-sm">Nuevo rol</Text>
                </Pressable>
              </View>
            </View>
            {error ? <Alert message={error} type="error" /> : null}
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-16">
            <Shield size={40} className="text-gray-300 mb-2" />
            <Text className="text-gray-400">No hay roles registrados</Text>
          </View>
        }
        renderItem={({ item: r }) => {
          const name = r.nombreRol ?? r.nombre ?? r.name ?? String(r);
          const isSystem = SYSTEM_ROLES.includes(name.toUpperCase());
          return (
            <View className="bg-white mx-4 mb-3 rounded-2xl p-4 shadow-sm flex-row items-center gap-3">
              <View className={`h-10 w-10 rounded-xl items-center justify-center ${isSystem ? 'bg-blue-50' : 'bg-gray-100'}`}>
                <Shield size={20} className={isSystem ? 'text-navy-600' : 'text-gray-600'} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">{name}</Text>
                {(r.descripcionRol ?? r.descripcion) ? <Text className="text-xs text-gray-500">{r.descripcionRol ?? r.descripcion}</Text> : null}
                {isSystem && <Text className="text-xs text-navy-500 font-medium">Rol del sistema</Text>}
              </View>
            </View>
          );
        }}
        ListFooterComponent={<View className="h-4" />}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo rol">
        <View className="gap-3">
          {saveError ? <Alert message={saveError} type="error" /> : null}
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Nombre del rol *</Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              placeholder="NOMBRE_ROL"
              value={form.nombre}
              onChangeText={t => setForm({ ...form, nombre: t.toUpperCase() })}
              autoCapitalize="characters"
            />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Descripción</Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.descripcion}
              onChangeText={t => setForm({ ...form, descripcion: t })}
            />
          </View>
          <View className="flex-row gap-2 pt-2">
            <Pressable onPress={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2.5 items-center">
              <Text className="text-sm text-gray-700 font-medium">Cancelar</Text>
            </Pressable>
            <Pressable onPress={save} disabled={saveLoading}
              className={`flex-1 bg-gold-500 rounded-lg py-2.5 items-center flex-row justify-center gap-2 ${saveLoading ? 'opacity-50' : ''}`}>
              {saveLoading && <ActivityIndicator size="small" color="#fff" />}
              <Text className="text-white font-semibold text-sm">Crear rol</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
