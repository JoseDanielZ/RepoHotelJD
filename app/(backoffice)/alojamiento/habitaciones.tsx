import { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { alojamientoApi } from '../../../src/api/alojamiento.api';
import { extractError } from '../../../src/api/client';
import { Alert } from '../../../src/components/ui/Alert';
import { PageSpinner } from '../../../src/components/ui/Spinner';
import { Modal } from '../../../src/components/ui/Modal';
import { Badge } from '../../../src/components/ui/Badge';
import { Plus, Edit, RefreshCw, BedDouble } from '../../../src/lib/icons';

export default function HabitacionesScreen() {
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
    numeroHabitacion: '', piso: '1', sucursalGuid: '', tipoHabitacionGuid: '',
    capacidad: '1', precioBase: '0', descripcion: '',
  });

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
      alojamientoApi.listHabitaciones(),
      alojamientoApi.listSucursales(),
      alojamientoApi.listTiposHabitacion(),
    ]).then(([h, s, t]) => {
      const allHabs = Array.isArray(h.data) ? h.data : (h.data as any).items ?? (h.data as any).data ?? [];
      const sucursalesData = Array.isArray(s.data) ? s.data : (s.data as any).items ?? (s.data as any).data ?? [];
      let filteredHabs = allHabs;
      if (filterSucursal) {
        const sel = sucursalesData.find((s: any) => s.sucursalGuid === filterSucursal);
        if (sel) filteredHabs = allHabs.filter((h: any) => h.idSucursal === sel.idSucursal);
      }
      setHabitaciones(filteredHabs);
      setSucursales(sucursalesData);
      setTipos(Array.isArray(t.data) ? t.data : (t.data as any).items ?? (t.data as any).data ?? []);
    })
    .catch(err => setError(extractError(err)))
    .finally(() => setLoading(false));
  };

  useEffect(load, [filterSucursal]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      numeroHabitacion: '', piso: '1',
      sucursalGuid: sucursales[0]?.sucursalGuid ?? '',
      tipoHabitacionGuid: tipos[0]?.tipoHabitacionGuid ?? '',
      capacidad: '1', precioBase: '0', descripcion: '',
    });
    setSaveError('');
    setShowModal(true);
  };

  const openEdit = (h: any) => {
    setEditing(h);
    setForm({
      numeroHabitacion: h.numeroHabitacion,
      piso: String(h.piso ?? 1),
      sucursalGuid: h.sucursalGuid ?? sucursales.find((s: any) => s.idSucursal === h.idSucursal)?.sucursalGuid ?? '',
      tipoHabitacionGuid: h.tipoHabitacionGuid ?? tipos.find((t: any) => t.idTipoHabitacion === h.idTipoHabitacion)?.tipoHabitacionGuid ?? '',
      capacidad: String(h.capacidadHabitacion ?? 1),
      precioBase: String(h.precioBase ?? 0),
      descripcion: h.descripcionHabitacion ?? h.descripcion ?? '',
    });
    setSaveError('');
    setShowModal(true);
  };

  const save = async () => {
    if (!form.numeroHabitacion || !form.sucursalGuid || !form.tipoHabitacionGuid) {
      setSaveError('Número, sucursal y tipo son obligatorios.');
      return;
    }
    if (Number(form.capacidad) <= 0 || Number(form.precioBase) <= 0) {
      setSaveError('La capacidad y el precio base deben ser mayores a cero.');
      return;
    }
    const sucursal = sucursales.find((s: any) => s.sucursalGuid === form.sucursalGuid);
    const tipo = tipos.find((t: any) => t.tipoHabitacionGuid === form.tipoHabitacionGuid);
    if (!sucursal || !tipo) {
      setSaveError('Sucursal o tipo de habitación no válidos.');
      return;
    }
    setSaveLoading(true);
    setSaveError('');
    try {
      const payload = {
        idSucursal: sucursal.idSucursal,
        idTipoHabitacion: tipo.idTipoHabitacion,
        numeroHabitacion: form.numeroHabitacion,
        piso: Number(form.piso),
        capacidadHabitacion: Number(form.capacidad),
        precioBase: Number(form.precioBase),
        descripcionHabitacion: form.descripcion,
      };
      if (editing) {
        await alojamientoApi.updateHabitacion(editing.idHabitacion, payload);
      } else {
        await alojamientoApi.createHabitacion(payload);
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
        data={habitaciones}
        keyExtractor={item => item.habitacionGuid}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
        ListHeaderComponent={
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-gray-800">Habitaciones</Text>
              <View className="flex-row gap-2">
                <Pressable onPress={load} className="border border-gray-200 rounded-lg p-2 bg-white">
                  <RefreshCw size={16} className="text-gray-600" />
                </Pressable>
                <Pressable onPress={openCreate} className="flex-row items-center gap-2 bg-gold-500 rounded-lg px-3 py-2">
                  <Plus size={16} className="text-white" />
                  <Text className="text-white font-semibold text-sm">Nueva habitación</Text>
                </Pressable>
              </View>
            </View>
            <View className="bg-white rounded-xl p-3 mb-4 shadow-sm">
              <Text className="text-xs font-medium text-gray-500 mb-1">Filtrar por sucursal</Text>
              <View className="border border-gray-200 rounded-lg overflow-hidden">
                <Picker selectedValue={filterSucursal} onValueChange={v => setFilterSucursal(v)} style={{ height: 44 }}>
                  <Picker.Item label="Todas" value="" />
                  {sucursales.map(s => <Picker.Item key={s.sucursalGuid} label={s.nombre ?? s.nombreSucursal} value={s.sucursalGuid} />)}
                </Picker>
              </View>
            </View>
            {error ? <Alert message={error} type="error" /> : null}
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-16">
            <BedDouble size={40} className="text-gray-300 mb-2" />
            <Text className="text-gray-400">No hay habitaciones</Text>
          </View>
        }
        renderItem={({ item: h }) => (
          <View className="bg-white mx-4 mb-2 rounded-xl p-4 shadow-sm flex-row items-center">
            <View className="flex-1">
              <Text className="font-bold text-navy-600 text-base mb-0.5">#{h.numeroHabitacion}</Text>
              <Text className="text-sm text-gray-600">Piso {h.piso} · {h.tipoNombre ?? h.tipoHabitacionGuid?.slice(0, 8)}</Text>
              <Text className="text-xs text-gray-400">{h.nombreSucursal ?? h.sucursalGuid?.slice(0, 8)}</Text>
            </View>
            <View className="items-end gap-2">
              <Badge value={h.estadoHabitacion ?? h.estado ?? 'DIS'} />
              <Pressable onPress={() => openEdit(h)} className="p-1">
                <Edit size={16} className="text-gray-400" />
              </Pressable>
            </View>
          </View>
        )}
        ListFooterComponent={<View className="h-4" />}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar habitación' : 'Nueva habitación'}>
        <View className="gap-3">
          {saveError ? <Alert message={saveError} type="error" /> : null}
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Número de habitación *</Text>
            <TextInput className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.numeroHabitacion} onChangeText={t => setForm({ ...form, numeroHabitacion: t })} />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Piso</Text>
            <TextInput className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.piso} onChangeText={t => setForm({ ...form, piso: t })} keyboardType="number-pad" />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Capacidad *</Text>
            <TextInput className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.capacidad} onChangeText={t => setForm({ ...form, capacidad: t })} keyboardType="number-pad" />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Precio base *</Text>
            <TextInput className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.precioBase} onChangeText={t => setForm({ ...form, precioBase: t })} keyboardType="decimal-pad" />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Sucursal *</Text>
            <View className="border border-gray-200 rounded-lg overflow-hidden">
              <Picker selectedValue={form.sucursalGuid} onValueChange={v => setForm({ ...form, sucursalGuid: v })} style={{ height: 44 }}>
                <Picker.Item label="Seleccionar..." value="" />
                {sucursales.map(s => <Picker.Item key={s.sucursalGuid} label={s.nombre ?? s.nombreSucursal} value={s.sucursalGuid} />)}
              </Picker>
            </View>
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Tipo de habitación *</Text>
            <View className="border border-gray-200 rounded-lg overflow-hidden">
              <Picker selectedValue={form.tipoHabitacionGuid} onValueChange={v => setForm({ ...form, tipoHabitacionGuid: v })} style={{ height: 44 }}>
                <Picker.Item label="Seleccionar..." value="" />
                {tipos.map(t => <Picker.Item key={t.tipoHabitacionGuid} label={t.nombreTipoHabitacion ?? t.nombre} value={t.tipoHabitacionGuid} />)}
              </Picker>
            </View>
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Descripción</Text>
            <TextInput className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={form.descripcion} onChangeText={t => setForm({ ...form, descripcion: t })} />
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
