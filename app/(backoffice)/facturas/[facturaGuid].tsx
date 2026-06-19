import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { facturacionApi } from '../../../src/api/facturacion.api';
import { reservasApi } from '../../../src/api/reservas.api';
import { extractError } from '../../../src/api/client';
import { PageSpinner } from '../../../src/components/ui/Spinner';
import { Alert } from '../../../src/components/ui/Alert';
import { Badge } from '../../../src/components/ui/Badge';
import { Modal } from '../../../src/components/ui/Modal';
import { ArrowLeft, XCircle } from '../../../src/lib/icons';

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' });
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 min-w-[40%] bg-gray-50 rounded-lg px-3 py-2">
      <Text className="text-xs text-gray-400 mb-0.5">{label}</Text>
      <Text className="font-medium text-gray-700 text-sm">{value}</Text>
    </View>
  );
}

export default function BackofficeFacturaDetailScreen() {
  const { facturaGuid } = useLocalSearchParams<{ facturaGuid: string }>();
  const router = useRouter();
  const [factura, setFactura] = useState<any>(null);
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAnular, setShowAnular] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [anulando, setAnulando] = useState(false);

  const loadFactura = () => {
    if (!facturaGuid) return;
    setLoading(true);
    facturacionApi.getFactura(facturaGuid)
      .then(({ data }) => {
        const f = (data as any).data ?? data;
        setFactura(f);
        if (f.idCliente) reservasApi.getCliente(f.idCliente)
          .then(({ data: c }) => setCliente((c as any).data ?? c))
          .catch(() => {});
      })
      .catch(err => setError(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadFactura, [facturaGuid]);

  const anular = async () => {
    if (!motivo.trim()) return;
    setAnulando(true);
    try {
      await facturacionApi.anularFactura(facturaGuid!, motivo.trim());
      setSuccess('Factura anulada correctamente.');
      setShowAnular(false);
      setMotivo('');
      loadFactura();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setAnulando(false);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <ScrollView className="flex-1 bg-kairos-bg" contentContainerStyle={{ padding: 16 }}>
      <Pressable
        onPress={() => router.push('/(backoffice)/facturas' as any)}
        className="flex-row items-center gap-1 mb-5"
      >
        <ArrowLeft size={16} className="text-gray-500" />
        <Text className="text-sm text-gray-500">Facturas</Text>
      </Pressable>

      {error ? <Alert message={error} type="error" className="mb-3" /> : null}
      {success ? <Alert message={success} type="success" className="mb-3" /> : null}

      {factura && (
        <View className="gap-4">
          {/* Header */}
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text className="font-mono font-bold text-navy-600 text-base mb-1">
                  {factura.numeroFactura}
                </Text>
                <Text className="text-xs text-gray-500 uppercase tracking-wide">
                  {factura.tipoFactura}
                </Text>
              </View>
              <Badge value={factura.estado} />
            </View>
            <View className="flex-row flex-wrap gap-3">
              <InfoBox label="Fecha emisión" value={factura.fechaEmision ? fmt(factura.fechaEmision) : '—'} />
              <InfoBox label="Moneda" value={factura.moneda ?? 'USD'} />
            </View>
          </View>

          {/* Totales */}
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="font-semibold text-gray-700 mb-3">Totales</Text>
            <View className="flex-row flex-wrap gap-3">
              <InfoBox label="Subtotal" value={`$${Number(factura.subtotal ?? 0).toFixed(2)}`} />
              <InfoBox label="IVA" value={`$${Number(factura.valorIva ?? 0).toFixed(2)}`} />
              <InfoBox label="Descuento" value={`$${Number(factura.descuentoTotal ?? 0).toFixed(2)}`} />
              <InfoBox label="Total" value={`$${Number(factura.total ?? 0).toFixed(2)}`} />
            </View>
            {factura.saldoPendiente > 0 && (
              <View className="mt-3 bg-amber-50 rounded-lg px-3 py-2">
                <Text className="text-xs text-amber-600 font-medium">
                  Saldo pendiente: ${Number(factura.saldoPendiente).toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          {/* Cliente */}
          {cliente && (
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <Text className="font-semibold text-gray-700 mb-3">Cliente</Text>
              <View className="flex-row flex-wrap gap-3">
                <InfoBox label="Nombre" value={`${cliente.nombres} ${cliente.apellidos}`} />
                <InfoBox label="Documento" value={`${cliente.tipoIdentificacion} ${cliente.numeroIdentificacion}`} />
                <InfoBox label="Correo" value={cliente.correo} />
                {cliente.telefono ? <InfoBox label="Teléfono" value={cliente.telefono} /> : null}
              </View>
            </View>
          )}

          {/* Acciones */}
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="font-semibold text-gray-700 mb-3">Acciones</Text>
            <View className="flex-row flex-wrap gap-3">
              {factura.idReserva ? (
                <Pressable
                  onPress={() => router.push(`/(backoffice)/reservas/${factura.idReserva}` as any)}
                  className="border border-navy-200 bg-white px-4 py-2.5 rounded-lg"
                >
                  <Text className="text-navy-600 font-semibold text-sm">Ver Reserva</Text>
                </Pressable>
              ) : null}
              {factura.estado === 'EMI' && (
                <Pressable
                  onPress={() => { setMotivo(''); setShowAnular(true); }}
                  className="flex-row items-center gap-2 border border-red-200 bg-white px-4 py-2.5 rounded-lg"
                >
                  <XCircle size={16} className="text-red-600" />
                  <Text className="text-red-600 font-semibold text-sm">Anular</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}

      <Modal isOpen={showAnular} onClose={() => setShowAnular(false)} title="Anular factura">
        <View className="gap-3">
          <Text className="text-sm text-gray-600">Ingresa el motivo de anulación.</Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50"
            placeholder="Motivo..."
            value={motivo}
            onChangeText={setMotivo}
            multiline
            numberOfLines={3}
          />
          <View className="flex-row gap-2 pt-1">
            <Pressable
              onPress={() => setShowAnular(false)}
              className="flex-1 border border-gray-200 rounded-lg py-2.5 items-center"
            >
              <Text className="text-sm text-gray-700 font-medium">Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={anular}
              disabled={anulando || !motivo.trim()}
              className={`flex-1 bg-red-500 rounded-lg py-2.5 items-center flex-row justify-center gap-2 ${(anulando || !motivo.trim()) ? 'opacity-50' : ''}`}
            >
              {anulando && <ActivityIndicator size="small" color="#fff" />}
              <Text className="text-white font-semibold text-sm">Confirmar anulación</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
