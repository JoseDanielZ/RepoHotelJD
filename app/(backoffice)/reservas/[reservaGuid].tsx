import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { reservasApi } from '../../../src/api/reservas.api';
import { alojamientoApi } from '../../../src/api/alojamiento.api';
import { extractError } from '../../../src/api/client';
import { PageSpinner } from '../../../src/components/ui/Spinner';
import { Alert } from '../../../src/components/ui/Alert';
import { Badge } from '../../../src/components/ui/Badge';
import { ArrowLeft, CheckCircle2, XCircle, LogIn } from '../../../src/lib/icons';

export default function BackofficeReservaDetailScreen() {
  const { reservaGuid } = useLocalSearchParams<{ reservaGuid: string }>();
  const router = useRouter();
  const [reserva, setReserva] = useState<any>(null);
  const [cliente, setCliente] = useState<any>(null);
  const [sucursalNombre, setSucursalNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadReserva = () => {
    if (!reservaGuid) return;
    setLoading(true);
    reservasApi.getReserva(reservaGuid)
      .then(({ data }) => {
        const r = (data as any).data ?? data;
        setReserva(r);
        if (r.idCliente) reservasApi.getCliente(r.idCliente)
          .then(({ data: c }) => setCliente((c as any).data ?? c))
          .catch(() => {});
        if (r.idSucursal) alojamientoApi.getSucursal(r.idSucursal)
          .then(({ data: s }) => setSucursalNombre(((s as any).data ?? s)?.nombreSucursal ?? ''))
          .catch(() => {});
      })
      .catch(err => setError(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadReserva, [reservaGuid]);

  const doAction = async (action: () => Promise<any>, msg: string) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await action();
      setSuccess(msg);
      loadReserva();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <PageSpinner />;

  function fmt(iso: string) {
    return new Date(iso).toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <ScrollView className="flex-1 bg-kairos-bg" contentContainerStyle={{ padding: 16 }}>
      <Pressable onPress={() => router.push('/(backoffice)/reservas' as any)} className="flex-row items-center gap-1 mb-5">
        <ArrowLeft size={16} className="text-gray-500" />
        <Text className="text-sm text-gray-500">Reservas</Text>
      </Pressable>

      {error ? <Alert message={error} type="error" /> : null}
      {success ? <Alert message={success} type="success" /> : null}

      {reserva && (
        <View className="gap-4">
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1 mr-3">
                {sucursalNombre ? <Text className="text-xl font-bold text-gray-800 mb-1">{sucursalNombre}</Text> : null}
                <Text className="font-mono text-sm text-navy-600">{reserva.codigoReserva}</Text>
              </View>
              <Badge value={reserva.estadoReserva} />
            </View>
            <View className="flex-row flex-wrap gap-3">
              <InfoBox label="Check-in" value={reserva.fechaInicio ? fmt(reserva.fechaInicio) : '—'} />
              <InfoBox label="Check-out" value={reserva.fechaFin ? fmt(reserva.fechaFin) : '—'} />
              <InfoBox label="Adultos" value={String(reserva.habitaciones?.reduce((s: number, h: any) => s + (h.numAdultos ?? 0), 0) ?? 0)} />
              <InfoBox label="Niños" value={String(reserva.habitaciones?.reduce((s: number, h: any) => s + (h.numNinos ?? 0), 0) ?? 0)} />
            </View>
            {reserva.observaciones ? (
              <Text className="text-sm text-gray-500 italic mt-3">{reserva.observaciones}</Text>
            ) : null}
          </View>

          {cliente && (
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <Text className="font-semibold text-gray-700 mb-3">Cliente</Text>
              <View className="flex-row flex-wrap gap-3">
                <InfoBox label="Nombre" value={`${cliente.nombres} ${cliente.apellidos}`} />
                <InfoBox label="Documento" value={`${cliente.tipoIdentificacion} ${cliente.numeroIdentificacion}`} />
                <InfoBox label="Correo" value={cliente.correo} />
                <InfoBox label="Teléfono" value={cliente.telefono ?? '—'} />
              </View>
            </View>
          )}

          {reserva.habitaciones?.length > 0 && (
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <Text className="font-semibold text-gray-700 mb-3">Habitaciones</Text>
              {reserva.habitaciones.map((h: any, i: number) => (
                <View key={i} className="flex-row justify-between py-2 border-b border-gray-50">
                  <Text className="text-sm text-gray-700">
                    {`Habitación #${h.idHabitacion}`}
                    {h.numAdultos ? `  ·  ${h.numAdultos}A${h.numNinos > 0 ? ` ${h.numNinos}N` : ''}` : ''}
                  </Text>
                  {h.precioNocheAplicado > 0 && (
                    <Text className="text-sm font-medium text-navy-600">${h.precioNocheAplicado}/noche</Text>
                  )}
                </View>
              ))}
              {reserva.totalReserva > 0 && (
                <View className="flex-row justify-between pt-3">
                  <Text className="font-bold text-sm">Total</Text>
                  <Text className="font-bold text-sm text-navy-600">${reserva.totalReserva.toFixed(2)}</Text>
                </View>
              )}
            </View>
          )}

          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="font-semibold text-gray-700 mb-3">Acciones</Text>
            <View className="flex-row flex-wrap gap-3">
              {reserva.estadoReserva === 'PEN' && (
                <>
                  <Pressable disabled={actionLoading}
                    onPress={() => doAction(() => reservasApi.confirmarReserva(reservaGuid!), 'Reserva confirmada.')}
                    className="flex-row items-center gap-2 bg-gold-500 px-4 py-2.5 rounded-lg">
                    {actionLoading
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <CheckCircle2 size={16} className="text-white" />}
                    <Text className="text-white font-semibold text-sm">Confirmar</Text>
                  </Pressable>
                  <Pressable disabled={actionLoading}
                    onPress={() => doAction(() => reservasApi.cancelarReserva(reservaGuid!, { motivo: 'Cancelado por operador' }), 'Reserva cancelada.')}
                    className="flex-row items-center gap-2 border border-red-200 bg-white px-4 py-2.5 rounded-lg">
                    <XCircle size={16} className="text-red-600" />
                    <Text className="text-red-600 font-semibold text-sm">Cancelar</Text>
                  </Pressable>
                </>
              )}
              {reserva.estadoReserva === 'CON' && (
                <Pressable onPress={() => router.push('/(backoffice)/checkin' as any)}
                  className="flex-row items-center gap-2 bg-gold-500 px-4 py-2.5 rounded-lg">
                  <LogIn size={16} className="text-white" />
                  <Text className="text-white font-semibold text-sm">Ir a Check-in</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}
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
