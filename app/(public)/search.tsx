import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { DateField } from '../../src/components/ui/DateField';
import { Alert } from '../../src/components/ui/Alert';
import { alojamientoApi } from '../../src/api/alojamiento.api';
import { extractError } from '../../src/api/client';
import type { AccommodationSearchItemDTO } from '../../src/types';
import { Search, MapPin, Star, BedDouble } from '../../src/lib/icons';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    Destino?: string;
    fechaInicio?: string;
    fechaFin?: string;
    NumAdultos?: string;
    PrecioMax?: string;
  }>();

  const [results, setResults] = useState<AccommodationSearchItemDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [destino, setDestino] = useState(params.Destino ?? '');
  const [fechaInicio, setFechaInicio] = useState(params.fechaInicio ?? '');
  const [fechaFin, setFechaFin] = useState(params.fechaFin ?? '');
  const [adultos, setAdultos] = useState(Number(params.NumAdultos ?? 1));

  const precioMax = Number(params.PrecioMax ?? 0);
  const today = new Date().toISOString().split('T')[0];

  const doSearch = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const { data } = await alojamientoApi.search({
        Destino: destino || undefined,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        NumAdultos: adultos > 0 ? adultos : undefined,
        PrecioMax: precioMax > 0 ? precioMax : undefined,
        Pagina: 1,
        Limite: 20,
      });
      const items = Array.isArray(data) ? data : ((data as any).items ?? []);
      setResults(items);
      setTotal((data as any).totalResultados ?? (data as any).totalCount ?? items.length);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [destino, fechaInicio, fechaFin, adultos, precioMax]);

  useEffect(() => {
    doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    const p: Record<string, string> = {};
    if (destino) p['Destino'] = destino;
    if (fechaInicio) p['fechaInicio'] = fechaInicio;
    if (fechaFin) p['fechaFin'] = fechaFin;
    if (adultos > 0) p['NumAdultos'] = String(adultos);
    router.push({ pathname: '/(public)/search', params: p });
    doSearch();
  };

  const plural = total === 1 ? '' : 's';
  const resumen = `${total} alojamiento${plural} encontrado${plural}`;

  const ListHeader = (
    <View>
      {/* Filter bar */}
      <View className="bg-white rounded-2xl border border-kairos-border p-4 mb-4 shadow-sm">
        {/* Destino */}
        <View className="mb-3">
          <Text className="text-xs font-medium text-gray-500 mb-1">Destino</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white"
            placeholder="Ciudad o hotel"
            placeholderTextColor="#9CA3AF"
            value={destino}
            onChangeText={setDestino}
          />
        </View>

        {/* Dates row */}
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1">
            <Text className="text-xs font-medium text-gray-500 mb-1">Llegada</Text>
            <DateField
              value={fechaInicio}
              onChange={setFechaInicio}
              min={today}
              placeholder="Fecha llegada"
            />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-medium text-gray-500 mb-1">Salida</Text>
            <DateField
              value={fechaFin}
              onChange={setFechaFin}
              min={fechaInicio || today}
              placeholder="Fecha salida"
            />
          </View>
        </View>

        {/* Adultos + Search button */}
        <View className="flex-row items-end gap-3">
          <View className="flex-1">
            <Text className="text-xs font-medium text-gray-500 mb-1">Adultos</Text>
            <View className="border border-gray-300 rounded-lg bg-white overflow-hidden">
              <Picker
                selectedValue={adultos}
                onValueChange={(val) => setAdultos(Number(val))}
                style={{ height: 44, color: '#1F2937' }}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <Picker.Item key={n} label={String(n)} value={n} />
                ))}
              </Picker>
            </View>
          </View>

          <Pressable
            onPress={handleSearch}
            disabled={loading}
            className="flex-row items-center justify-center gap-2 rounded-lg px-4 py-3"
            style={{ backgroundColor: '#C9A840', height: 46, opacity: loading ? 0.6 : 1 }}
          >
            <Search size={16} className="text-white" />
            <Text className="text-white font-semibold text-sm">Buscar</Text>
          </Pressable>
        </View>
      </View>

      {/* Error */}
      {error ? <Alert message={error} className="mb-4" /> : null}

      {/* Results count */}
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        {loading ? 'Buscando...' : resumen}
      </Text>

      {/* Loading state inside list */}
      {loading && (
        <View className="items-center justify-center py-16">
          <ActivityIndicator size="large" color="#C9A840" />
        </View>
      )}
    </View>
  );

  const EmptyComponent = !loading ? (
    <View className="bg-white rounded-2xl border border-kairos-border p-8 items-center">
      <BedDouble size={48} className="text-gray-300 mb-3" />
      <Text className="text-gray-500 text-center">No encontramos alojamientos disponibles.</Text>
      <Text className="text-sm text-gray-400 text-center mt-1">
        Intenta con otros criterios de búsqueda.
      </Text>
    </View>
  ) : null;

  return (
    <View className="flex-1 bg-kairos-bg">
      <FlatList<AccommodationSearchItemDTO>
        data={loading ? [] : results}
        keyExtractor={(item) => item.sucursalGuid}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => doSearch(true)}
            tintColor="#C9A840"
            colors={['#C9A840']}
          />
        }
        renderItem={({ item }) => (
          <AlojamientoCard
            item={item}
            onPress={() =>
              router.push({
                pathname: '/(public)/alojamiento/[sucursalGuid]',
                params: {
                  sucursalGuid: item.sucursalGuid,
                  fechaInicio,
                  fechaFin,
                  adultos: String(adultos),
                },
              })
            }
          />
        )}
      />
    </View>
  );
}

function AlojamientoCard({
  item,
  onPress,
}: Readonly<{
  item: AccommodationSearchItemDTO;
  onPress: () => void;
}>) {
  const destino = [item.ciudad, item.provincia].filter(Boolean).join(', ');

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl border border-kairos-border mb-4 overflow-hidden shadow-sm"
    >
      {/* Image area */}
      {item.imagenPrincipalUrl ? (
        <Image
          source={{ uri: item.imagenPrincipalUrl }}
          style={{ width: '100%', height: 192 }}
          resizeMode="cover"
        />
      ) : (
        <View
          className="items-center justify-center"
          style={{ height: 192, backgroundColor: '#b8cded' }}
        >
          <BedDouble size={40} className="text-navy-300" />
        </View>
      )}

      {/* Badges over image */}
      <View
        className="absolute top-3 right-3 bg-white/90 rounded-lg px-2 py-1"
      >
        <Text className="text-xs font-bold text-navy-600">{item.tipoAlojamiento}</Text>
      </View>

      {item.habitacionesDisponibles > 0 && (
        <View className="absolute bottom-[136px] left-3 bg-green-500 rounded-full px-2 py-0.5">
          <Text className="text-white text-xs font-semibold">
            {item.habitacionesDisponibles} disponibles
          </Text>
        </View>
      )}

      {/* Content */}
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-2">
          <Text className="font-semibold text-gray-800 flex-1 leading-tight" numberOfLines={2}>
            {item.nombre}
          </Text>
          {(item.promedioValoracion ?? 0) > 0 && (
            <View className="flex-row items-center gap-1 ml-2">
              <Star size={13} className="text-yellow-400" />
              <Text className="text-sm font-semibold text-yellow-600">
                {item.promedioValoracion!.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {destino ? (
          <View className="flex-row items-center gap-1 mb-3">
            <MapPin size={12} className="text-gray-400" />
            <Text className="text-xs text-gray-500">{destino}</Text>
          </View>
        ) : null}

        {item.descripcion ? (
          <Text className="text-sm text-gray-500 mb-4" numberOfLines={2}>
            {item.descripcion}
          </Text>
        ) : null}

        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
          <View>
            <Text className="text-xs text-gray-400">desde</Text>
            <Text className="text-lg font-bold" style={{ color: '#1C3361' }}>
              ${(item.precioDesde ?? 0).toFixed(2)}
              <Text className="text-xs font-normal text-gray-500"> /noche</Text>
            </Text>
          </View>
          <View
            className="rounded-lg px-4 py-1.5"
            style={{ backgroundColor: '#C9A840' }}
          >
            <Text className="text-white font-semibold text-sm">Ver</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
