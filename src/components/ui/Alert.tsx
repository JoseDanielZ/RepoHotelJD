import { View, Text } from 'react-native';
import { AlertCircle, CheckCircle2, Info } from '../../lib/icons';

type AlertType = 'error' | 'success' | 'info';
type AlertProps = { type?: AlertType; message: string; className?: string };

const styles: Record<AlertType, string> = {
  error: 'bg-red-50 border border-red-200',
  success: 'bg-green-50 border border-green-200',
  info: 'bg-blue-50 border border-blue-200',
};
const textColors: Record<AlertType, string> = {
  error: 'text-red-700',
  success: 'text-green-700',
  info: 'text-blue-700',
};
const IconMap = { error: AlertCircle, success: CheckCircle2, info: Info };

export function Alert({ type = 'error', message, className = '' }: AlertProps) {
  const Icon = IconMap[type];
  return (
    <View className={`flex-row items-start gap-3 rounded-lg px-4 py-3 ${styles[type]} ${className}`}>
      <Icon size={16} className={textColors[type]} />
      <Text className={`text-sm flex-1 ${textColors[type]}`}>{message}</Text>
    </View>
  );
}
