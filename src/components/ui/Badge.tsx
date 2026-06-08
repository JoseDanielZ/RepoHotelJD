import { View, Text } from 'react-native';

const variants: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 border border-yellow-300',
  CONFIRMADA: 'bg-blue-100 border border-blue-300',
  ACTIVA: 'bg-green-100 border border-green-300',
  COMPLETADA: 'bg-gray-100 border border-gray-300',
  CANCELADA: 'bg-red-100 border border-red-300',
  CHECKED_IN: 'bg-indigo-100 border border-indigo-300',
  CHECKED_OUT: 'bg-purple-100 border border-purple-300',
  PAGADO: 'bg-green-100 border border-green-300',
  PAGADA: 'bg-green-100 border border-green-300',
  PENDIENTE_PAGO: 'bg-orange-100 border border-orange-300',
  EMITIDA: 'bg-blue-100 border border-blue-300',
  ANULADA: 'bg-red-100 border border-red-300',
  ACTIVO: 'bg-green-100 border border-green-300',
  INACTIVO: 'bg-gray-100 border border-gray-300',
  DISPONIBLE: 'bg-green-100 border border-green-300',
  OCUPADA: 'bg-red-100 border border-red-300',
  MANTENIMIENTO: 'bg-yellow-100 border border-yellow-300',
  default: 'bg-gray-100 border border-gray-300',
};

const textColors: Record<string, string> = {
  PENDIENTE: 'text-yellow-700',
  CONFIRMADA: 'text-blue-700',
  ACTIVA: 'text-green-700',
  COMPLETADA: 'text-gray-700',
  CANCELADA: 'text-red-700',
  CHECKED_IN: 'text-indigo-700',
  CHECKED_OUT: 'text-purple-700',
  PAGADO: 'text-green-700',
  PAGADA: 'text-green-700',
  PENDIENTE_PAGO: 'text-orange-700',
  EMITIDA: 'text-blue-700',
  ANULADA: 'text-red-700',
  ACTIVO: 'text-green-700',
  INACTIVO: 'text-gray-700',
  DISPONIBLE: 'text-green-700',
  OCUPADA: 'text-red-700',
  MANTENIMIENTO: 'text-yellow-700',
  default: 'text-gray-700',
};

export function Badge({ value }: { value: string }) {
  const bg = variants[value] ?? variants.default;
  const tc = textColors[value] ?? textColors.default;
  return (
    <View className={`self-start px-2.5 py-0.5 rounded-full ${bg}`}>
      <Text className={`text-xs font-semibold ${tc}`}>{value}</Text>
    </View>
  );
}
