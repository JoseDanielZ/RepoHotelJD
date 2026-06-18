import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../src/contexts/AuthContext';
import { reservasApi } from '../../src/api/reservas.api';
import { extractError } from '../../src/api/client';
import { Alert } from '../../src/components/ui/Alert';
import { Spinner } from '../../src/components/ui/Spinner';
import { InputField } from '../../src/components/ui/InputField';
import { CheckCircle2, ChevronRight, Calendar, MapPin } from '../../src/lib/icons';
import { Copy } from 'lucide-react-native';

type Step = 1 | 2 | 3;

const tiposIdentificacion = ['CC', 'CE', 'PAS', 'NIT'];

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sucursalGuid: string;
    tipoHabitacionGuid: string;
    fechaInicio: string;
    fechaFin: string;
    nombre: string;
    adultos: string;
  }>();

  const sucursalGuid = params.sucursalGuid ?? '';
  const tipoHabitacionGuid = params.tipoHabitacionGuid ?? '';
  const fechaInicio = params.fechaInicio ?? '';
  const fechaFin = params.fechaFin ?? '';
  const nombreSucursal = params.nombre ?? 'Alojamiento seleccionado';

  const { user } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reservaCreada, setReservaCreada] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [cliente, setCliente] = useState({
    tipoIdentificacion: 'CC',
    numeroIdentificacion: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    direccion: '',
  });

  useEffect(() => {
    if (user?.email) {
      setCliente(prev => ({ ...prev, correo: user.email }));
    }
  }, [user?.email]);

  const [adultos, setAdultos] = useState(Number(params.adultos ?? 2));
  const [ninos, setNinos] = useState(0);

  const handleCreateReserva = async () => {
    if (!sucursalGuid || !fechaInicio || !fechaFin) {
      setError('Faltan datos de la reserva. Vuelve a seleccionar el alojamiento.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await reservasApi.createReservaPublic({
        sucursalGuid,
        fechaInicio,
        fechaFin,
        origenCanalReserva: 'MARKETPLACE',
        observaciones: null,
        cliente: {
          tipoIdentificacion: cliente.tipoIdentificacion,
          numeroIdentificacion: cliente.numeroIdentificacion,
          nombres: cliente.nombres,
          apellidos: cliente.apellidos,
          correo: cliente.correo,
          telefono: cliente.telefono,
          direccion: cliente.direccion || null,
        },
        habitaciones: [
          {
            tipoHabitacionGuid,
            numHabitaciones: 1,
            numAdultos: adultos,
            numNinos: ninos,
          },
        ],
      });

      const reservaData = (data as any).data ?? data;
      setReservaCreada(reservaData.codigoReserva ?? reservaData.reservaGuid ?? '');
      setStep(3);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    await Clipboard.setStringAsync(reservaCreada ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Step 3: Success ──────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1 bg-kairos-bg"
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-kairos-card rounded-2xl border border-kairos-border shadow-sm p-6 items-center">
            {/* Green checkmark */}
            <View
              className="rounded-full items-center justify-center mb-4"
              style={{ width: 64, height: 64, backgroundColor: '#f0fdf4' }}
            >
              <CheckCircle2 size={36} color="#22c55e" />
            </View>

            <Text className="text-2xl font-bold text-gray-800 mb-1 text-center">
              ¡Reserva creada!
            </Text>
            <Text className="text-gray-500 text-sm mb-5 text-center">
              Tu solicitud fue registrada exitosamente.
            </Text>

            {/* Código de reserva — copy button */}
            <Pressable
              onPress={copyCode}
              style={{ backgroundColor: '#eff3fb', width: '100%' }}
              className="border border-gray-200 rounded-xl px-4 py-3 mb-3 flex-row items-center justify-between"
            >
              <View>
                <Text className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-0.5">
                  Código de reserva
                </Text>
                <Text className="font-mono text-lg font-bold text-navy-700">
                  {reservaCreada}
                </Text>
              </View>
              <Copy
                size={16}
                color={copied ? '#22c55e' : '#93c5fd'}
              />
            </Pressable>

            {copied && (
              <Text className="text-xs text-green-600 mb-3 self-start">
                ¡Copiado!
              </Text>
            )}

            {/* Detalles — always from URL params */}
            <View className="flex-row flex-wrap gap-2 w-full mb-5">
              {/* Alojamiento — full width */}
              <View
                className="bg-gray-50 rounded-lg px-3 py-2"
                style={{ width: '100%' }}
              >
                <View className="flex-row items-center gap-1 mb-0.5">
                  <MapPin size={12} color="#9ca3af" />
                  <Text className="text-xs text-gray-400">Alojamiento</Text>
                </View>
                <Text className="font-medium text-gray-700">{nombreSucursal}</Text>
              </View>

              {/* Check-in */}
              <View
                className="bg-gray-50 rounded-lg px-3 py-2"
                style={{ width: '47%' }}
              >
                <View className="flex-row items-center gap-1 mb-0.5">
                  <Calendar size={12} color="#9ca3af" />
                  <Text className="text-xs text-gray-400">Check-in</Text>
                </View>
                <Text className="font-medium text-gray-700">{fechaInicio}</Text>
              </View>

              {/* Check-out */}
              <View
                className="bg-gray-50 rounded-lg px-3 py-2"
                style={{ width: '47%' }}
              >
                <View className="flex-row items-center gap-1 mb-0.5">
                  <Calendar size={12} color="#9ca3af" />
                  <Text className="text-xs text-gray-400">Check-out</Text>
                </View>
                <Text className="font-medium text-gray-700">{fechaFin}</Text>
              </View>
            </View>

            {/* Action buttons */}
            <View className="flex-row gap-3 w-full">
              <Pressable
                onPress={() => router.push('/(public)' as any)}
                className="flex-1 border border-gray-300 rounded-lg py-2.5 items-center justify-center"
              >
                <Text className="text-gray-700 font-semibold text-sm">Inicio</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/(cliente)/reservas' as any)}
                className="flex-1 bg-gold-500 rounded-lg py-2.5 flex-row items-center justify-center gap-1"
              >
                <Text className="text-white font-semibold text-sm">Mis reservas</Text>
                <ChevronRight size={16} color="#fff" />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─── Steps 1 & 2 ─────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1 bg-kairos-bg"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-navy-600 mb-1">
            Completar reserva
          </Text>
          <Text className="text-gray-500 text-sm">
            {nombreSucursal} · {fechaInicio} → {fechaFin}
          </Text>
        </View>

        {/* Steps indicator */}
        <View className="flex-row items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <View key={s} className="flex-row items-center gap-2">
              <View
                className="h-8 w-8 rounded-full items-center justify-center"
                style={{ backgroundColor: step >= s ? '#C9A840' : '#e5e7eb' }}
              >
                <Text
                  className="text-sm font-bold"
                  style={{ color: step >= s ? '#fff' : '#6b7280' }}
                >
                  {s}
                </Text>
              </View>
              <Text
                className="text-sm font-medium"
                style={{ color: step >= s ? '#1f2937' : '#9ca3af' }}
              >
                {s === 1 ? 'Datos del huésped' : 'Resumen'}
              </Text>
              {s < 2 && <ChevronRight size={16} color="#d1d5db" />}
            </View>
          ))}
        </View>

        {/* Error */}
        {error ? <Alert message={error} className="mb-4" /> : null}

        {/* ── Step 1: Guest data form ── */}
        {step === 1 && (
          <View className="bg-kairos-card rounded-2xl border border-kairos-border shadow-sm p-5 gap-4">
            <Text className="font-semibold text-gray-800">
              Información del huésped principal
            </Text>

            {/* Tipo + Número de documento */}
            <View className="flex-row flex-wrap gap-4">
              <View style={{ width: '47%' }}>
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Tipo de documento
                </Text>
                <View className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                  <Picker
                    selectedValue={cliente.tipoIdentificacion}
                    onValueChange={(v) =>
                      setCliente({ ...cliente, tipoIdentificacion: String(v) })
                    }
                    style={{ height: 44 }}
                  >
                    {tiposIdentificacion.map((t) => (
                      <Picker.Item key={t} label={t} value={t} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={{ width: '47%' }}>
                <InputField
                  label="Número de documento *"
                  value={cliente.numeroIdentificacion}
                  onChangeText={(v) =>
                    setCliente({ ...cliente, numeroIdentificacion: v })
                  }
                  keyboardType="default"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Nombres + Apellidos */}
            <View className="flex-row flex-wrap gap-4">
              <View style={{ width: '47%' }}>
                <InputField
                  label="Nombres *"
                  value={cliente.nombres}
                  onChangeText={(v) => setCliente({ ...cliente, nombres: v })}
                  autoCapitalize="words"
                />
              </View>

              <View style={{ width: '47%' }}>
                <InputField
                  label="Apellidos"
                  value={cliente.apellidos}
                  onChangeText={(v) => setCliente({ ...cliente, apellidos: v })}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Correo + Teléfono */}
            <View className="flex-row flex-wrap gap-4">
              <View style={{ width: '47%' }}>
                <InputField
                  label="Correo *"
                  value={cliente.correo}
                  onChangeText={(v) => setCliente({ ...cliente, correo: v })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={{ width: '47%' }}>
                <InputField
                  label="Teléfono *"
                  value={cliente.telefono}
                  onChangeText={(v) => setCliente({ ...cliente, telefono: v })}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Dirección — full width */}
            <View style={{ width: '100%' }}>
              <InputField
                label="Dirección"
                value={cliente.direccion}
                onChangeText={(v) => setCliente({ ...cliente, direccion: v })}
                autoCapitalize="sentences"
              />
            </View>

            {/* Divider */}
            <View className="border-t border-gray-100 pt-4">
              <View className="flex-row flex-wrap gap-4">
                {/* Adultos */}
                <View style={{ width: '47%' }}>
                  <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Adultos
                  </Text>
                  <View className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                    <Picker
                      selectedValue={adultos}
                      onValueChange={(v) => setAdultos(Number(v))}
                      style={{ height: 44 }}
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <Picker.Item key={n} label={String(n)} value={n} />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Niños */}
                <View style={{ width: '47%' }}>
                  <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Niños
                  </Text>
                  <View className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                    <Picker
                      selectedValue={ninos}
                      onValueChange={(v) => setNinos(Number(v))}
                      style={{ height: 44 }}
                    >
                      {[0, 1, 2, 3].map((n) => (
                        <Picker.Item key={n} label={String(n)} value={n} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            {/* Continuar */}
            <Pressable
              onPress={() => {
                if (
                  !cliente.nombres ||
                  !cliente.correo ||
                  !cliente.telefono ||
                  !cliente.numeroIdentificacion
                ) {
                  setError('Completa los campos obligatorios (*).');
                  return;
                }
                setError('');
                setStep(2);
              }}
              className="bg-gold-500 rounded-lg mt-1 py-3 flex-row items-center justify-center gap-2"
            >
              <Text className="text-white font-semibold text-sm">Continuar</Text>
              <ChevronRight size={16} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* ── Step 2: Summary + confirm ── */}
        {step === 2 && (
          <View className="bg-kairos-card rounded-2xl border border-kairos-border shadow-sm p-5 gap-4">
            <Text className="font-semibold text-gray-800 mb-2">
              Resumen de la reserva
            </Text>

            {/* Summary card */}
            <View
              className="rounded-lg p-4 gap-2"
              style={{ backgroundColor: '#eff3fb' }}
            >
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">Alojamiento</Text>
                <Text className="font-medium text-sm text-gray-800">{nombreSucursal}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">Check-in</Text>
                <Text className="text-sm text-gray-800">{fechaInicio}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">Check-out</Text>
                <Text className="text-sm text-gray-800">{fechaFin}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">Huéspedes</Text>
                <Text className="text-sm text-gray-800">
                  {adultos} adultos{ninos > 0 ? `, ${ninos} niños` : ''}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">Nombre</Text>
                <Text className="text-sm text-gray-800">
                  {cliente.nombres} {cliente.apellidos}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">Correo</Text>
                <Text className="text-sm text-gray-800 flex-1 text-right ml-4" numberOfLines={1}>
                  {cliente.correo}
                </Text>
              </View>
            </View>

            {/* Action buttons */}
            <View className="flex-row gap-3 pt-2">
              <Pressable
                onPress={() => setStep(1)}
                className="flex-1 border border-gray-300 rounded-lg py-2.5 items-center justify-center"
              >
                <Text className="text-gray-700 font-semibold text-sm">Atrás</Text>
              </Pressable>

              <Pressable
                onPress={handleCreateReserva}
                disabled={loading}
                className="flex-1 bg-gold-500 rounded-lg py-2.5 flex-row items-center justify-center gap-2"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                {loading && <Spinner size="sm" />}
                <Text className="text-white font-semibold text-sm">
                  {loading ? 'Procesando...' : 'Confirmar reserva'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
