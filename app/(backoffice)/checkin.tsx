import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { reservasApi } from '../../src/api/reservas.api';
import { extractError } from '../../src/api/client';
import { Alert } from '../../src/components/ui/Alert';
import { Badge } from '../../src/components/ui/Badge';
import { Search, LogIn, LogOut } from '../../src/lib/icons';

type TabType = 'checkin' | 'checkout';

export default function CheckInScreen() {
  const [tab, setTab] = useState<TabType>('checkin');
  const [codigo, setCodigo] = useState('');
  const [reserva, setReserva] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const buscarReserva = async () => {
    if (!codigo.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    setReserva(null);
    try {
      const { data } = await reservasApi.buscarPorCodigo(codigo.trim());
      setReserva((data as any).data ?? data);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const doCheckIn = async () => {
    if (!reserva) return;
    setActionLoading(true);
    setError('');
    try {
      await reservasApi.checkIn(reserva.guidReserva);
      setSuccess('Check-in realizado correctamente.');
      setReserva(null);
      setCodigo('');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setActionLoading(false);
    }
  };

  const doCheckOut = async () => {
    if (!reserva) return;
    setActionLoading(true);
    setError('');
    try {
      await reservasApi.checkOut(reserva.guidReserva);
      setSuccess('Check-out realizado correctamente.');
      setReserva(null);
      setCodigo('');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setActionLoading(false);
    }
  };

  const switchTab = (t: TabType) => {
    setTab(t);
    setReserva(null);
    setError('');
    setSuccess('');
    setCodigo('');
  };

  return (
    <ScrollView className="flex-1 bg-kairos-bg" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-2xl font-bold text-gray-800 mb-6">Check-in / Check-out</Text>

      <View className="flex-row bg-gray-100 rounded-xl p-1 mb-6 self-start">
        {(['checkin', 'checkout'] as TabType[]).map(t => (
          <Pressable key={t} onPress={() => switchTab(t)}
            className={`px-5 py-2 rounded-lg ${tab === t ? 'bg-white shadow-sm' : ''}`}>
            <Text className={`text-sm font-medium ${tab === t ? 'text-navy-700' : 'text-gray-500'}`}>
              {t === 'checkin' ? 'Check-in' : 'Check-out'}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? <Alert message={error} type="error" /> : null}
      {success ? <Alert message={success} type="success" /> : null}

      <View className="bg-white rounded-2xl p-4 shadow-sm">
        <Text className="text-sm text-gray-500 mb-4">
          {tab === 'checkin'
            ? 'Ingresa el código de reserva confirmada para registrar el check-in.'
            : 'Ingresa el código de reserva para registrar el check-out.'}
        </Text>

        <View className="flex-row gap-2 mb-5">
          <View className="flex-1 flex-row items-center border border-gray-200 rounded-lg bg-gray-50 px-3">
            <Search size={16} className="text-gray-400 mr-2" />
            <TextInput
              className="flex-1 py-2.5 text-sm text-gray-700"
              placeholder="RES-XXXXXXXX"
              value={codigo}
              onChangeText={setCodigo}
              onSubmitEditing={buscarReserva}
              autoCapitalize="characters"
            />
          </View>
          <Pressable onPress={buscarReserva} disabled={loading}
            className="flex-row items-center gap-2 bg-gold-500 px-4 rounded-lg">
            {loading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Search size={16} className="text-white" />}
            <Text className="text-white font-semibold text-sm">Buscar</Text>
          </Pressable>
        </View>

        {reserva && (
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="font-semibold text-gray-800">{reserva.nombreSucursal ?? 'Reserva encontrada'}</Text>
              <Badge value={reserva.estadoReserva} />
            </View>
            <View className="flex-row flex-wrap gap-3">
              {[
                ['Código', reserva.codigoReserva],
                ['Cliente', reserva.nombreCliente ?? `${reserva.cliente?.nombres ?? ''} ${reserva.cliente?.apellidos ?? ''}`],
                ['Check-in', reserva.fechaInicio],
                ['Check-out', reserva.fechaFin],
              ].map(([label, value]) => (
                <View key={label} className="flex-1 min-w-[40%]">
                  <Text className="text-xs text-gray-500">{label}</Text>
                  <Text className="font-medium text-sm">{value}</Text>
                </View>
              ))}
            </View>

            {tab === 'checkin' && reserva.estadoReserva === 'CON' && (
              <Pressable onPress={doCheckIn} disabled={actionLoading}
                className="flex-row items-center justify-center gap-2 bg-gold-500 rounded-lg py-3 mt-2">
                {actionLoading ? <ActivityIndicator size="small" color="#fff" /> : <LogIn size={16} className="text-white" />}
                <Text className="text-white font-semibold">Confirmar Check-in</Text>
              </Pressable>
            )}
            {tab === 'checkout' && reserva.estadoReserva === 'CHI' && (
              <Pressable onPress={doCheckOut} disabled={actionLoading}
                className="flex-row items-center justify-center gap-2 bg-gold-500 rounded-lg py-3 mt-2">
                {actionLoading ? <ActivityIndicator size="small" color="#fff" /> : <LogOut size={16} className="text-white" />}
                <Text className="text-white font-semibold">Confirmar Check-out</Text>
              </Pressable>
            )}
            {tab === 'checkin' && reserva.estadoReserva !== 'CON' && (
              <Text className="text-sm text-amber-600 text-center mt-2">
                La reserva debe estar en estado CONFIRMADA para hacer check-in.
              </Text>
            )}
            {tab === 'checkout' && reserva.estadoReserva !== 'CHI' && (
              <Text className="text-sm text-amber-600 text-center mt-2">
                La reserva debe tener el check-in realizado para hacer check-out.
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
