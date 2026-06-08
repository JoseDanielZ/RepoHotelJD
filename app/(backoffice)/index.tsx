import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { reservasApi } from '../../src/api/reservas.api';
import { hospedajeApi } from '../../src/api/hospedaje.api';
import { BedDouble, CalendarCheck, TrendingUp, Users, ChevronRight } from '../../src/lib/icons';
import { Badge } from '../../src/components/ui/Badge';

export default function BackofficeDashboard() {
  const router = useRouter();
  const [reservasPendientes, setReservasPendientes] = useState<any[]>([]);
  const [estadiasActivas, setEstadiasActivas] = useState<any[]>([]);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [loadingEstadias, setLoadingEstadias] = useState(true);

  useEffect(() => {
    reservasApi.list({ estadoReserva: 'PEN', pagina: 1, limite: 5 })
      .then(({ data }) => {
        const items = Array.isArray(data) ? data : (data as any).items ?? (data as any).data ?? [];
        setReservasPendientes(items);
      })
      .catch(() => {})
      .finally(() => setLoadingReservas(false));

    hospedajeApi.listEstadias({ estado: 'ACT', pagina: 1, limite: 5 })
      .then(({ data }) => {
        const items = Array.isArray(data) ? data : (data as any).items ?? (data as any).data ?? [];
        setEstadiasActivas(items);
      })
      .catch(() => {})
      .finally(() => setLoadingEstadias(false));
  }, []);

  const stats = [
    { label: 'Reservas pendientes', value: loadingReservas ? '…' : String(reservasPendientes.length), Icon: CalendarCheck, bg: 'bg-amber-50', ic: 'text-amber-600', href: '/(backoffice)/reservas' },
    { label: 'Estadías activas', value: loadingEstadias ? '…' : String(estadiasActivas.length), Icon: BedDouble, bg: 'bg-green-50', ic: 'text-green-600', href: '/(backoffice)/estadias' },
    { label: 'Check-in / Check-out', value: 'Gestionar', Icon: Users, bg: 'bg-blue-50', ic: 'text-navy-600', href: '/(backoffice)/checkin' },
    { label: 'Facturación', value: 'Ver facturas', Icon: TrendingUp, bg: 'bg-purple-50', ic: 'text-purple-600', href: '/(backoffice)/facturas' },
  ];

  return (
    <ScrollView className="flex-1 bg-kairos-bg" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-2xl font-bold text-gray-800 mb-6">Panel de control</Text>

      <View className="flex-row flex-wrap gap-3 mb-6">
        {stats.map(s => (
          <Pressable key={s.label} onPress={() => router.push(s.href as any)}
            className="flex-1 min-w-[45%] bg-white rounded-2xl p-4 shadow-sm">
            <View className={`h-12 w-12 rounded-xl items-center justify-center mb-3 ${s.bg}`}>
              <s.Icon size={24} className={s.ic} />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-0.5">{s.value}</Text>
            <Text className="text-sm text-gray-500">{s.label}</Text>
          </Pressable>
        ))}
      </View>

      <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-semibold text-gray-800">Reservas pendientes</Text>
          <Pressable onPress={() => router.push('/(backoffice)/reservas' as any)} className="flex-row items-center gap-1">
            <Text className="text-xs text-navy-600">Ver todas</Text>
            <ChevronRight size={12} className="text-navy-600" />
          </Pressable>
        </View>
        {loadingReservas ? (
          <ActivityIndicator size="small" color="#1e3a5f" style={{ marginVertical: 16 }} />
        ) : reservasPendientes.length === 0 ? (
          <View className="items-center py-6">
            <CalendarCheck size={32} className="text-gray-300 mb-2" />
            <Text className="text-sm text-gray-400">No hay reservas pendientes</Text>
          </View>
        ) : reservasPendientes.map((r: any) => (
          <Pressable key={r.reservaGuid}
            onPress={() => router.push(`/(backoffice)/reservas/${r.reservaGuid}` as any)}
            className="flex-row items-center justify-between py-2.5 border-b border-gray-50">
            <View className="flex-1 mr-2">
              <Text className="text-sm font-medium text-gray-800">{r.nombreCliente ?? r.codigoReserva}</Text>
              <Text className="text-xs text-gray-500">{r.fechaInicio} → {r.fechaFin}</Text>
            </View>
            <Badge value={r.estadoReserva} />
          </Pressable>
        ))}
      </View>

      <View className="bg-white rounded-2xl p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-semibold text-gray-800">Estadías activas</Text>
          <Pressable onPress={() => router.push('/(backoffice)/estadias' as any)} className="flex-row items-center gap-1">
            <Text className="text-xs text-navy-600">Ver todas</Text>
            <ChevronRight size={12} className="text-navy-600" />
          </Pressable>
        </View>
        {loadingEstadias ? (
          <ActivityIndicator size="small" color="#1e3a5f" style={{ marginVertical: 16 }} />
        ) : estadiasActivas.length === 0 ? (
          <View className="items-center py-6">
            <BedDouble size={32} className="text-gray-300 mb-2" />
            <Text className="text-sm text-gray-400">No hay estadías activas</Text>
          </View>
        ) : estadiasActivas.map((e: any) => (
          <Pressable key={e.estadiaGuid}
            onPress={() => router.push(`/(backoffice)/estadias/${e.estadiaGuid}` as any)}
            className="flex-row items-center justify-between py-2.5 border-b border-gray-50">
            <View className="flex-1 mr-2">
              <Text className="text-sm font-medium text-gray-800">{e.nombreCliente ?? e.estadiaGuid}</Text>
              <Text className="text-xs text-gray-500">Hab. {e.numeroHabitacion} · {e.fechaCheckIn}</Text>
            </View>
            <Badge value={e.estadoEstadia ?? 'ACT'} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
