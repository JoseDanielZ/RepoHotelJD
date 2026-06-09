import { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { alojamientoApi } from '../../../src/api/alojamiento.api';
import { extractError } from '../../../src/api/client';
import { Alert } from '../../../src/components/ui/Alert';
import { PageSpinner } from '../../../src/components/ui/Spinner';
import { Modal } from '../../../src/components/ui/Modal';
import { Plus, Edit, RefreshCw, BedDouble } from '../../../src/lib/icons';

export default function TiposScreen() {
  const [tipos, setTipos] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState({
    nombreTipoHabitacion: '', descripcion: '', capacidadTotal: '2', sucursalGuid: '',
  });

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
    setForm({ nombreTipoHabitacion: '', descripcion: '', capacidadTotal: '2', sucursalGuid: sucursales[0]?.sucursalGuid ?? '' });
    setSaveError('');
    setShowModal(true);
  };

  const openEdit = (t: any) => {
    setEditing(t);
    setForm({
      nombreTipoHabitacion: t.nombreTipoHabitacion ?? t.nombre ?? '',
      descripcion: t.descripcion ?? '',
      capacidadTotal: String(t.capacidadTotal ?? t.capacidadMaxima ?? 2),
      sucursalGuid: t.sucursalGuid ?? '',
    });
    setSaveError('');
    setShowModal(true);
  };

  const save = async () => {
    if (!form.nombreTipoHabitacion) {
      setSaveError('El nombre es obligatorio.');
      return;
    }
    setSaveLoading(true);
    setSaveError('');
    try {
      const payload = {
        nombreTipoHabitacion: form.nombreTipoHabitacion,
        descripcion: form.descripcion,
        capacidadTotal: Number(form.capacidadTotal),
        sucursalGuid: form.sucursalGuid || undefined,
        estadoTipoHabitacion: editing?.estadoTipoHabitacion ?? 'ACT',
        permitReservaPublica: true,
      };
      if (editing) {
        await alojamientoApi.updateTipoHabitacion(editing.tipoHabitacionGuid, payload);
      } else {
        await alojamientoApi.createTipoHabitacion(payload);
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
        data={tipos}
        keyExtractor={item => item.tipoHabitacionGuid}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
        ListHeaderComponent={
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-gray-800">Tipos de habitación</Text>
              <View className="flex-row gap-2">
                <Pressable onPress={load} className="border border-gray-200 rounded-lg p-2 bg-white">
                  <RefreshCw size={16} className="text-gray-600" />
                </Pressable>
                <Pressable onPress={openCreate} className="flex-row items-center gap-2 bg-gold-500 rounded-lg px-3 py-2">
                  <Plus size={16} className="text-white" />
                  <Text className="text-white font-semibold text-sm">Nuevo tipo</Text>
                </Pressable>
              </View>
            </View>
            {error ? <Alert message={error} type="error" /> : null}
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-16">
            <BedDouble size={40} className="text-gray-300 mb-2" />
            <Text className="text-gray-400">No hay tipos de habitación</Text>
          </View>
        }
        renderItem={({ item: t }) => (
          <View className="bg-white mx-4 mb-3 rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-start justify-between mb-2">
              <Text className="font-semibold text-gray-800 flex-1 mr-3">
                {t.nombreTipoHabitacion ?? t.nombre ?? '—'}
              </Text>
              <Pressable onPress={() => openEdit(t)} className="p-1">
                <Edit size={16} className="text-gray-400" />
              </Pressable>
            </View>
            <Text className="text-sm text-gray-500 mb-3" numberOfLines={2}>{t.descripcion || 'Sin descripción'}</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-500">
                {t.capacidadTotal ?? t.capacidadMaxima ?? '—'} personas máx.
              </Text>
              <Text className="text-xs text-gray-400">
                {t.estadoTipoHabitacion ?? t.estado ?? 'ACT'}
              </Text>
            </View>
            {t.nombreSucursal ? <Text className="text-xs text-gray-400 mt-1">{t.nombreSucursal}</Text> : null}
          </View>
        )}
        ListFooterComponent={<View className="h-4" />}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar tipo' : 'Nuevo tipo de habitación'}>
        <View className="gap-3">
          {saveError ? <Alert message={saveError} type="error" /> : null}
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Nombre *</Text>
            <TextInput className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.nombreTipoHabitacion} onChangeText={t => setForm({ ...form, nombreTipoHabitacion: t })} />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Capacidad máx.</Text>
            <TextInput className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.capacidadTotal} onChangeText={t => setForm({ ...form, capacidadTotal: t })} keyboardType="number-pad" />
          </View>
          {sucursales.length > 0 && (
            <View>
              <Text className="text-xs font-medium text-gray-600 mb-1">Sucursal</Text>
              <View className="border border-gray-200 rounded-lg overflow-hidden">
                <Picker selectedValue={form.sucursalGuid} onValueChange={v => setForm({ ...form, sucursalGuid: v })} style={{ height: 44 }}>
                  <Picker.Item label="Sin asignar" value="" />
                  {sucursales.map(s => <Picker.Item key={s.sucursalGuid} label={s.nombre ?? s.nombreSucursal} value={s.sucursalGuid} />)}
                </Picker>
              </View>
            </View>
          )}
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
