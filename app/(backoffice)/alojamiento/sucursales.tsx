import { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { alojamientoApi } from '../../../src/api/alojamiento.api';
import { extractError } from '../../../src/api/client';
import { Alert } from '../../../src/components/ui/Alert';
import { PageSpinner } from '../../../src/components/ui/Spinner';
import { Modal } from '../../../src/components/ui/Modal';
import { Badge } from '../../../src/components/ui/Badge';
import { Plus, Edit, RefreshCw, MapPin } from '../../../src/lib/icons';

const TIPOS = ['HOTEL', 'HOSTAL', 'APART_HOTEL', 'RESORT', 'BOUTIQUE'];

export default function SucursalesScreen() {
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState({ nombre: '', destino: '', direccion: '', descripcion: '', tipoAlojamiento: 'HOTEL', telefono: '', correo: '' });

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
    setForm({ nombre: '', destino: '', direccion: '', descripcion: '', tipoAlojamiento: 'HOTEL', telefono: '', correo: '' });
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
      telefono: s.telefono ?? '',
      correo: s.correo ?? '',
    });
    setSaveError('');
    setShowModal(true);
  };

  const save = async () => {
    if (!form.nombre || !form.destino) { setSaveError('Nombre y destino son obligatorios.'); return; }
    setSaveLoading(true);
    setSaveError('');
    try {
      const payload = {
        nombreSucursal: form.nombre,
        destino: form.destino,
        direccion: form.direccion,
        descripcion: form.descripcion,
        tipoAlojamiento: form.tipoAlojamiento,
        telefono: form.telefono,
        correo: form.correo,
        estado: editing?.estado ?? 'ACT',
      };
      if (editing) {
        await alojamientoApi.updateSucursal(editing.sucursalGuid, payload);
      } else {
        await alojamientoApi.createSucursal(payload);
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
    <View className="flex-1 bg-kairos-bg">
      <FlatList
        data={sucursales}
        keyExtractor={item => item.sucursalGuid}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
        ListHeaderComponent={
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-gray-800">Sucursales</Text>
              <View className="flex-row gap-2">
                <Pressable onPress={load} className="border border-gray-200 rounded-lg p-2 bg-white">
                  <RefreshCw size={16} className="text-gray-600" />
                </Pressable>
                <Pressable onPress={openCreate} className="flex-row items-center gap-2 bg-gold-500 rounded-lg px-3 py-2">
                  <Plus size={16} className="text-white" />
                  <Text className="text-white font-semibold text-sm">Nueva sucursal</Text>
                </Pressable>
              </View>
            </View>
            {error ? <Alert message={error} type="error" /> : null}
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-16">
            <MapPin size={40} className="text-gray-300 mb-2" />
            <Text className="text-gray-400">No hay sucursales registradas</Text>
          </View>
        }
        renderItem={({ item: s }) => (
          <View className="bg-white mx-4 mb-3 rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1 mr-3">
                <Text className="font-semibold text-gray-800 mb-0.5">{s.nombre ?? s.nombreSucursal}</Text>
                <View className="flex-row items-center gap-1">
                  <MapPin size={12} className="text-gray-400" />
                  <Text className="text-xs text-gray-500">{s.destino}</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                <Badge value={s.estado ?? (s.activo ? 'ACT' : 'INA')} />
                <Pressable onPress={() => openEdit(s)} className="p-1">
                  <Edit size={16} className="text-gray-400" />
                </Pressable>
              </View>
            </View>
            {(s.descripcion || s.direccion) ? (
              <Text className="text-sm text-gray-500 mb-2" numberOfLines={2}>{s.descripcion || s.direccion}</Text>
            ) : null}
            <View className="self-start bg-blue-50 rounded-full px-3 py-0.5">
              <Text className="text-xs text-navy-600">{s.tipoAlojamiento}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={<View className="h-4" />}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar sucursal' : 'Nueva sucursal'}>
        <View className="gap-3">
          {saveError ? <Alert message={saveError} type="error" /> : null}
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Nombre *</Text>
            <TextInput className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.nombre} onChangeText={t => setForm({ ...form, nombre: t })} />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Destino / Ciudad *</Text>
            <TextInput className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.destino} onChangeText={t => setForm({ ...form, destino: t })} />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Dirección</Text>
            <TextInput className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.direccion} onChangeText={t => setForm({ ...form, direccion: t })} />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Teléfono</Text>
            <TextInput className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.telefono} onChangeText={t => setForm({ ...form, telefono: t })} keyboardType="phone-pad" />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Correo</Text>
            <TextInput className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.correo} onChangeText={t => setForm({ ...form, correo: t })} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Tipo</Text>
            <View className="border border-gray-200 rounded-lg overflow-hidden">
              <Picker selectedValue={form.tipoAlojamiento} onValueChange={v => setForm({ ...form, tipoAlojamiento: v })} style={{ height: 44 }}>
                {TIPOS.map(t => <Picker.Item key={t} label={t} value={t} />)}
              </Picker>
            </View>
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Descripción</Text>
            <TextInput className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.descripcion} onChangeText={t => setForm({ ...form, descripcion: t })} multiline numberOfLines={3} />
          </View>
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
