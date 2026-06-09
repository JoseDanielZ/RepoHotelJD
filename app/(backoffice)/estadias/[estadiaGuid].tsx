import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { hospedajeApi } from '../../../src/api/hospedaje.api';
import { extractError } from '../../../src/api/client';
import { PageSpinner } from '../../../src/components/ui/Spinner';
import { Alert } from '../../../src/components/ui/Alert';
import { Badge } from '../../../src/components/ui/Badge';
import { Modal } from '../../../src/components/ui/Modal';
import { ArrowLeft, Plus, Receipt } from '../../../src/lib/icons';

export default function EstadiaDetailScreen() {
  const { estadiaGuid } = useLocalSearchParams<{ estadiaGuid: string }>();
  const router = useRouter();
  const [estadia, setEstadia] = useState<any>(null);
  const [cargos, setCargos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCargo, setShowAddCargo] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [cargo, setCargo] = useState({ descripcion: '', monto: '', categoria: '' });

  const loadData = () => {
    if (!estadiaGuid) return;
    setLoading(true);
    Promise.all([
      hospedajeApi.getEstadia(estadiaGuid),
      hospedajeApi.getCargos(estadiaGuid),
    ]).then(([e, c]) => {
      setEstadia((e.data as any).data ?? e.data);
      const cs = Array.isArray(c.data) ? c.data : (c.data as any).data ?? (c.data as any).items ?? [];
      setCargos(cs);
    }).catch(err => setError(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, [estadiaGuid]);

  const addCargo = async () => {
    if (!cargo.descripcion || !cargo.monto) { setAddError('Descripción y monto son obligatorios.'); return; }
    setAddLoading(true);
    setAddError('');
    try {
      await hospedajeApi.addCargo(estadiaGuid!, { descripcion: cargo.descripcion, monto: Number(cargo.monto), categoria: cargo.categoria || 'CONSUMO' });
      setShowAddCargo(false);
      setCargo({ descripcion: '', monto: '', categoria: '' });
      loadData();
    } catch (err) {
      setAddError(extractError(err));
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) return <PageSpinner />;

  const totalCargos = cargos.reduce((s: number, c: any) => s + (c.monto ?? 0), 0);

  return (
    <ScrollView className="flex-1 bg-kairos-bg" contentContainerStyle={{ padding: 16 }}>
      <Pressable onPress={() => router.push('/(backoffice)/estadias' as any)} className="flex-row items-center gap-1 mb-5">
        <ArrowLeft size={16} className="text-gray-500" />
        <Text className="text-sm text-gray-500">Estadías</Text>
      </Pressable>

      {error ? <Alert message={error} type="error" /> : null}

      {estadia && (
        <View className="gap-4">
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-800">Estadía</Text>
              <Badge value={estadia.estadoEstadia ?? estadia.estado ?? 'ACT'} />
            </View>
            <View className="flex-row flex-wrap gap-3">
              <InfoBox label="Cliente ID" value={String(estadia.idCliente ?? '—')} />
              <InfoBox label="Habitación" value={estadia.habitacionGuid?.slice(0, 8) ?? '—'} />
              <InfoBox label="Check-in" value={estadia.checkinUtc ?? '—'} />
              <InfoBox label="Check-out" value={estadia.checkoutUtc ?? 'En curso'} />
            </View>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-semibold text-gray-700">Cargos adicionales</Text>
              <Pressable onPress={() => setShowAddCargo(true)} className="flex-row items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5">
                <Plus size={14} className="text-gray-600" />
                <Text className="text-sm text-gray-600">Agregar</Text>
              </Pressable>
            </View>
            {cargos.length === 0 ? (
              <Text className="text-sm text-gray-400 text-center py-4">Sin cargos adicionales</Text>
            ) : (
              <View>
                {cargos.map((c: any, i: number) => (
                  <View key={i} className="flex-row items-center justify-between py-2.5 border-b border-gray-50">
                    <View className="flex-1">
                      <Text className="font-medium text-gray-700 text-sm">{c.descripcion ?? c.concepto}</Text>
                      {c.categoria ? <Text className="text-xs text-gray-400">{c.categoria}</Text> : null}
                    </View>
                    <Text className="font-semibold text-navy-600 text-sm">${Number(c.monto).toFixed(2)}</Text>
                  </View>
                ))}
                <View className="flex-row justify-between pt-3">
                  <Text className="font-bold text-sm">Total cargos</Text>
                  <Text className="font-bold text-sm text-navy-600">${totalCargos.toFixed(2)}</Text>
                </View>
              </View>
            )}
          </View>

          <Pressable onPress={() => router.push('/(backoffice)/facturas' as any)}
            className="flex-row items-center gap-2 bg-gold-500 rounded-xl px-4 py-3 self-start">
            <Receipt size={16} className="text-white" />
            <Text className="text-white font-semibold text-sm">Ver facturación</Text>
          </Pressable>
        </View>
      )}

      <Modal isOpen={showAddCargo} onClose={() => setShowAddCargo(false)} title="Agregar cargo">
        <View className="gap-3">
          {addError ? <Alert message={addError} type="error" /> : null}
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Descripción *</Text>
            <TextInput className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={cargo.descripcion} onChangeText={t => setCargo({ ...cargo, descripcion: t })} />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Monto *</Text>
            <TextInput className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={cargo.monto} onChangeText={t => setCargo({ ...cargo, monto: t })} keyboardType="decimal-pad" />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-1">Categoría</Text>
            <TextInput className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
              value={cargo.categoria} onChangeText={t => setCargo({ ...cargo, categoria: t })}
              placeholder="CONSUMO" placeholderTextColor="#9CA3AF" />
          </View>
          <View className="flex-row gap-2 pt-2">
            <Pressable onPress={() => setShowAddCargo(false)} className="flex-1 border border-gray-200 rounded-lg py-2.5 items-center">
              <Text className="text-sm text-gray-700 font-medium">Cancelar</Text>
            </Pressable>
            <Pressable onPress={addCargo} disabled={addLoading}
              className={`flex-1 bg-gold-500 rounded-lg py-2.5 items-center flex-row justify-center gap-2 ${addLoading ? 'opacity-50' : ''}`}>
              {addLoading && <ActivityIndicator size="small" color="#fff" />}
              <Text className="text-white font-semibold text-sm">Agregar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 min-w-[40%] bg-gray-50 rounded-lg px-3 py-2">
      <Text className="text-xs text-gray-400 mb-0.5">{label}</Text>
      <Text className="font-medium text-gray-700 text-sm">{value}</Text>
    </View>
  );
}
