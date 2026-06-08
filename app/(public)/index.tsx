import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { DateField } from '../../src/components/ui/DateField';
import { Star, Search, MapPin, Users, ChevronRight } from '../../src/lib/icons';

const highlights = [
  { icon: '🏊', title: 'Piscina Infinity', desc: 'Con vista panorámica al mar' },
  { icon: '🍽️', title: 'Restaurante Gourmet', desc: 'Cocina local e internacional' },
  { icon: '💆', title: 'Spa & Wellness', desc: 'Tratamientos de relajación' },
  { icon: '🎾', title: 'Actividades', desc: 'Tenis, golf y más deporte' },
];

const testimonials = [
  {
    name: 'María García',
    rating: 5,
    text: 'Una experiencia increíble. El servicio fue impecable y las instalaciones de lujo.',
    date: '2026-04-15',
  },
  {
    name: 'Carlos Mendoza',
    rating: 5,
    text: 'El mejor hotel en el que he estado. Habitaciones amplias y una vista espectacular.',
    date: '2026-03-22',
  },
  {
    name: 'Ana Rodríguez',
    rating: 4,
    text: 'Muy buen hotel, la atención del personal es excelente. Totalmente recomendable.',
    date: '2026-02-10',
  },
];

export default function PublicHome() {
  const router = useRouter();

  const [destino, setDestino] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [adultos, setAdultos] = useState(2);

  const today = new Date().toISOString().split('T')[0];

  const handleSearch = () => {
    const params: Record<string, string> = {};
    if (destino) params['Destino'] = destino;
    if (fechaInicio) params['fechaInicio'] = fechaInicio;
    if (fechaFin) params['fechaFin'] = fechaFin;
    if (adultos > 0) params['NumAdultos'] = String(adultos);
    router.push({ pathname: '/(public)/search', params });
  };

  return (
    <ScrollView className="flex-1 bg-kairos-bg">
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <View style={{ backgroundColor: '#1C3361', minHeight: 400 }} className="px-4 pt-12 pb-6">
        {/* Gold badge */}
        <View className="flex self-start flex-row items-center gap-2 rounded-full px-4 py-1.5 mb-6 border border-yellow-400/30"
          style={{ backgroundColor: 'rgba(201,168,64,0.2)' }}>
          <Star size={14} className="text-yellow-300" />
          <Text className="text-yellow-300 text-sm font-medium">Calidad 5 estrellas garantizada</Text>
        </View>

        {/* Title */}
        <Text className="text-5xl font-bold text-white leading-tight mb-1">Tu descanso</Text>
        <Text className="text-5xl font-bold leading-tight mb-4" style={{ color: '#C9A840' }}>
          comienza aquí
        </Text>

        {/* Subtitle */}
        <Text className="text-base text-blue-200 mb-8 leading-relaxed">
          Descubre la experiencia única del Hotel Kairos. Lujo, confort y servicio excepcional
          en los destinos más exclusivos.
        </Text>

        {/* Search box */}
        <View className="bg-white rounded-2xl shadow-xl p-4 mx-0 mt-2">
          {/* Destino */}
          <View className="mb-3">
            <View className="flex-row items-center mb-1.5">
              <MapPin size={12} className="text-gray-500 mr-1" />
              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Destino</Text>
            </View>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white"
              placeholder="¿A dónde vas?"
              placeholderTextColor="#9CA3AF"
              value={destino}
              onChangeText={setDestino}
            />
          </View>

          {/* Dates row */}
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <View className="flex-row items-center mb-1.5">
                <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Llegada</Text>
              </View>
              <DateField
                value={fechaInicio}
                onChange={setFechaInicio}
                min={today}
                placeholder="Fecha llegada"
              />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center mb-1.5">
                <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Salida</Text>
              </View>
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
              <View className="flex-row items-center mb-1.5">
                <Users size={12} className="text-gray-500 mr-1" />
                <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Huéspedes</Text>
              </View>
              <View className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                <Picker
                  selectedValue={adultos}
                  onValueChange={(val) => setAdultos(Number(val))}
                  style={{ height: 44, color: '#1F2937' }}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <Picker.Item key={n} label={`${n} adulto${n > 1 ? 's' : ''}`} value={n} />
                  ))}
                </Picker>
              </View>
            </View>

            <Pressable
              onPress={handleSearch}
              className="rounded-lg px-5 py-3 items-center justify-center"
              style={{ backgroundColor: '#C9A840', height: 46 }}
            >
              <Search size={20} className="text-white" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* ── Highlights ────────────────────────────────────────────────────────── */}
      <View className="px-4 py-8">
        <Text className="text-2xl font-bold text-center mb-1" style={{ color: '#1C3361' }}>
          Experiencias únicas
        </Text>
        <Text className="text-gray-500 text-center text-sm mb-6">
          Descubre todo lo que Hotel Kairos tiene para ofrecerte
        </Text>

        <View className="flex-row flex-wrap gap-4">
          {highlights.map((h) => (
            <View
              key={h.title}
              className="bg-white rounded-2xl border border-kairos-border p-4 items-center"
              style={{ width: '47%' }}
            >
              <Text style={{ fontSize: 36 }} className="mb-3">{h.icon}</Text>
              <Text className="font-semibold text-gray-800 text-center mb-1">{h.title}</Text>
              <Text className="text-sm text-gray-500 text-center">{h.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Testimonials ──────────────────────────────────────────────────────── */}
      <View style={{ backgroundColor: '#1C3361' }} className="py-12 px-4">
        <Text className="text-2xl font-bold text-white text-center mb-1">
          Lo que dicen nuestros huéspedes
        </Text>
        <Text className="text-blue-300 text-sm text-center mb-8">
          Opiniones verificadas de viajeros reales
        </Text>

        {testimonials.map((t) => (
          <View
            key={t.name}
            className="bg-white/10 rounded-xl p-4 border border-white/10 mb-4"
          >
            {/* Stars */}
            <View className="flex-row items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < t.rating ? 'text-yellow-400' : 'text-blue-400'}
                />
              ))}
            </View>

            <Text className="text-blue-100 text-sm leading-relaxed mb-4">"{t.text}"</Text>

            <View className="flex-row items-center justify-between">
              <Text className="font-medium text-white text-sm">{t.name}</Text>
              <Text className="text-xs text-blue-400">
                {new Date(t.date).toLocaleDateString('es-ES')}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <View className="px-4 py-16 items-center">
        <Text className="text-2xl font-bold text-center mb-3" style={{ color: '#1C3361' }}>
          ¿Listo para reservar?
        </Text>
        <Text className="text-gray-500 text-center text-sm mb-8 max-w-xs">
          Descubre nuestras suites y habitaciones disponibles para tu próxima estadía.
        </Text>
        <Pressable
          onPress={() => router.push('/(public)/search')}
          className="flex-row items-center gap-2 rounded-xl px-8 py-3"
          style={{ backgroundColor: '#C9A840' }}
        >
          <Text className="text-white font-semibold text-base">Ver disponibilidad</Text>
          <ChevronRight size={16} className="text-white" />
        </Pressable>
      </View>
    </ScrollView>
  );
}
