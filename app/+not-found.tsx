import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center bg-kairos-bg px-6">
      <Text className="text-6xl font-bold text-navy-600 mb-2">404</Text>
      <Text className="text-lg text-gray-600 mb-6 text-center">Página no encontrada</Text>
      <Link href="/" className="text-gold-500 font-semibold text-base">
        Volver al inicio
      </Link>
    </View>
  );
}
