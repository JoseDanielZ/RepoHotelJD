import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Image, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { alojamientoApi } from '../../../src/api/alojamiento.api';
import { extractError } from '../../../src/api/client';
import { PageSpinner } from '../../../src/components/ui/Spinner';
import { Alert } from '../../../src/components/ui/Alert';
import { Badge } from '../../../src/components/ui/Badge';
import {
  ArrowLeft, MapPin, Star, Calendar, Users, BedDouble,
} from '../../../src/lib/icons';
import type { AccommodationDetailDTO, TipoHabitacionPublicDTO } from '../../../src/types';

export default function AlojamientoDetailScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { sucursalGuid, fechaInicio, fechaFin, adultos } = useLocalSearchParams<{
    sucursalGuid: string;
    fechaInicio?: string;
    fechaFin?: string;
    adultos?: string;
  }>();

  const [detail, setDetail] = useState<AccommodationDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sucursalGuid) return;
    alojamientoApi
      .getDetail(sucursalGuid, { fechaInicio, fechaFin })
      .then(({ data }) => setDetail((data as any).data ?? data))
      .catch(err => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, [sucursalGuid]);

  const handleBook = (tipoHabitacionGuid: string) => {
    router.push({
      pathname: '/(public)/booking',
      params: {
        sucursalGuid,
        tipoHabitacionGuid,
        fechaInicio: fechaInicio ?? '',
        fechaFin: fechaFin ?? '',
        adultos: adultos ?? '1',
        nombre: detail?.nombre ?? '',
      },
    } as any);
  };

  if (loading) return <PageSpinner />;

  return (
    <ScrollView className="flex-1 bg-kairos-bg">
      {/* Image carousel */}
      {detail && detail.imagenes.length > 0 ? (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {detail.imagenes.map((uri, i) => (
            <Image
              key={i}
              source={{ uri }}
              style={{ width: screenWidth, height: 240 }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      ) : (
        <View
          className="bg-navy-100 items-center justify-center"
          style={{ height: 240 }}
        >
          <BedDouble size={48} color="#94a3b8" />
        </View>
      )}

      {/* Type badge overlay */}
      {detail && (
        <View style={{ position: 'absolute', top: 12, right: 12 }}>
          <Badge value={detail.tipoAlojamiento} />
        </View>
      )}

      {/* Back button overlay */}
      <Pressable
        onPress={() => router.back()}
        className="flex-row items-center gap-1"
        style={{ position: 'absolute', top: 12, left: 12 }}
      >
        <View className="bg-white/80 rounded-full p-2 flex-row items-center gap-1">
          <ArrowLeft size={16} color="#374151" />
        </View>
      </Pressable>

      <View style={{ padding: 16 }} className="gap-4">
        {error ? <Alert message={error} className="mb-2" /> : null}

        {detail && (
          <>
            {/* Hotel info card */}
            <View className="bg-white rounded-2xl border border-kairos-border shadow-sm p-5">
              <Text className="text-2xl font-bold text-gray-800 mb-1">{detail.nombre}</Text>

              <View className="flex-row items-center gap-1 mb-2">
                <MapPin size={14} color="#9ca3af" />
                <Text className="text-sm text-gray-500">
                  {detail.ciudad}, {detail.provincia}, {detail.pais}
                </Text>
              </View>

              {/* Rating */}
              {detail.promedioValoracion != null && (
                <View className="flex-row items-center gap-1 mb-3">
                  <Star size={14} color="#C9A840" />
                  <Text className="text-sm font-semibold text-gray-700">
                    {detail.promedioValoracion.toFixed(1)}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    ({detail.totalValoraciones} valoraciones)
                  </Text>
                </View>
              )}

              {/* Stars */}
              {detail.estrellas != null && detail.estrellas > 0 && (
                <View className="flex-row gap-0.5 mb-3">
                  {Array.from({ length: detail.estrellas }).map((_, i) => (
                    <Star key={i} size={14} color="#C9A840" />
                  ))}
                </View>
              )}

              {/* Description */}
              {(detail.descripcionCompleta ?? detail.descripcion) ? (
                <Text className="text-gray-600 text-sm leading-relaxed mb-4">
                  {detail.descripcionCompleta ?? detail.descripcion}
                </Text>
              ) : null}

              {/* Amenities */}
              {detail.amenities.length > 0 && (
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Servicios</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {detail.amenities.map((a, i) => (
                      <View key={i} className="bg-gray-100 rounded-full px-3 py-1">
                        <Text className="text-xs text-gray-600">{a}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Politicas */}
              {detail.politicas && (
                <View className="mt-4 pt-4 border-t border-gray-100 gap-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-1">Políticas</Text>
                  <Text className="text-xs text-gray-500">
                    Check-in: {detail.politicas.horaCheckIn} · Check-out: {detail.politicas.horaCheckOut}
                  </Text>
                  <View className="flex-row gap-3 mt-1">
                    {detail.politicas.aceptaNinos && (
                      <View className="bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                        <Text className="text-xs text-green-700">Acepta niños</Text>
                      </View>
                    )}
                    {detail.politicas.permiteMascotas && (
                      <View className="bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                        <Text className="text-xs text-green-700">Mascotas permitidas</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* Dates info bar */}
            {fechaInicio && fechaFin && (
              <View className="bg-white rounded-2xl border border-kairos-border shadow-sm p-4">
                <View className="flex-row items-center gap-3">
                  <Calendar size={16} color="#5081cc" />
                  <Text className="text-sm text-gray-600">
                    {fechaInicio} → {fechaFin}
                  </Text>
                  {adultos && (
                    <>
                      <View className="w-px h-4 bg-gray-200" />
                      <Users size={16} color="#5081cc" />
                      <Text className="text-sm text-gray-600">{adultos} adulto{Number(adultos) !== 1 ? 's' : ''}</Text>
                    </>
                  )}
                </View>
              </View>
            )}

            {/* Room types */}
            {detail.tiposHabitacion.length > 0 && (
              <View>
                <Text className="text-lg font-bold text-gray-800 mb-3">Tipos de habitación</Text>
                <View className="gap-3">
                  {detail.tiposHabitacion.map((tipo) => (
                    <TipoHabitacionCard
                      key={tipo.tipoHabitacionGuid}
                      tipo={tipo}
                      onBook={() => handleBook(tipo.tipoHabitacionGuid)}
                      hasDates={!!(fechaInicio && fechaFin)}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function TipoHabitacionCard({
  tipo,
  onBook,
  hasDates,
}: {
  tipo: TipoHabitacionPublicDTO;
  onBook: () => void;
  hasDates: boolean;
}) {
  const isAvailable = tipo.disponiblesEnRango == null || tipo.disponiblesEnRango > 0;

  return (
    <View className="bg-white rounded-2xl border border-kairos-border shadow-sm overflow-hidden">
      <View className="flex-row">
        {/* Small image */}
        {tipo.imagenes.length > 0 ? (
          <Image
            source={{ uri: tipo.imagenes[0] }}
            style={{ width: 80, height: 80 }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="bg-gray-100 items-center justify-center"
            style={{ width: 80, height: 80 }}
          >
            <BedDouble size={28} color="#d1d5db" />
          </View>
        )}

        {/* Info */}
        <View className="flex-1 p-3 gap-1">
          <Text className="font-semibold text-gray-800" numberOfLines={1}>{tipo.nombre}</Text>

          {/* Capacity */}
          <View className="flex-row items-center gap-1">
            <Users size={12} color="#9ca3af" />
            <Text className="text-xs text-gray-500">
              {tipo.capacidadAdultos} adultos
              {tipo.capacidadNinos > 0 ? `, ${tipo.capacidadNinos} niños` : ''}
            </Text>
          </View>

          {/* Tip de cama */}
          {tipo.tipoCama && (
            <View className="flex-row items-center gap-1">
              <BedDouble size={12} color="#9ca3af" />
              <Text className="text-xs text-gray-500">{tipo.tipoCama}</Text>
            </View>
          )}

          {/* Area */}
          {tipo.areaM2 && (
            <Text className="text-xs text-gray-400">{tipo.areaM2} m²</Text>
          )}
        </View>
      </View>

      {/* Amenities row */}
      {tipo.amenities.length > 0 && (
        <View className="px-3 pb-2 flex-row flex-wrap gap-1">
          {tipo.amenities.slice(0, 4).map((a, i) => (
            <View key={i} className="bg-gray-100 rounded-full px-2 py-0.5">
              <Text className="text-xs text-gray-500">{a}</Text>
            </View>
          ))}
          {tipo.amenities.length > 4 && (
            <View className="bg-gray-100 rounded-full px-2 py-0.5">
              <Text className="text-xs text-gray-500">+{tipo.amenities.length - 4}</Text>
            </View>
          )}
        </View>
      )}

      {/* Price + Book */}
      <View className="flex-row items-center justify-between px-3 py-2.5 border-t border-gray-100">
        <View>
          <Text className="text-xs text-gray-400">Precio desde</Text>
          <Text className="font-bold text-navy-600 text-base">${tipo.precioBase.toFixed(2)}/noche</Text>
        </View>

        <View className="items-end gap-1">
          {hasDates && tipo.disponiblesEnRango != null && (
            <Text className="text-xs text-gray-400">
              {tipo.disponiblesEnRango} disponible{tipo.disponiblesEnRango !== 1 ? 's' : ''}
            </Text>
          )}
          <Pressable
            onPress={onBook}
            disabled={hasDates && !isAvailable}
            className={`px-4 py-2 rounded-lg ${hasDates && !isAvailable ? 'bg-gray-200' : 'bg-gold-500'}`}
          >
            <Text className={`font-semibold text-sm ${hasDates && !isAvailable ? 'text-gray-400' : 'text-white'}`}>
              {hasDates && !isAvailable ? 'No disponible' : 'Reservar'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
