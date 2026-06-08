import { Pressable, Text, ActivityIndicator } from 'react-native';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

type PrimaryButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  className?: string;
};

const variantStyles: Record<Variant, string> = {
  primary: 'bg-gold-500',
  secondary: 'bg-navy-600',
  danger: 'bg-red-600',
  ghost: 'bg-transparent border border-gray-300',
};

const textStyles: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-white',
  danger: 'text-white',
  ghost: 'text-gray-700',
};

export function PrimaryButton({
  children, onPress, disabled = false, loading = false,
  variant = 'primary', className = '',
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center px-4 py-2.5 rounded-lg gap-2 ${variantStyles[variant]} ${isDisabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading && <ActivityIndicator size="small" color={variant === 'ghost' ? '#374151' : '#fff'} />}
      {typeof children === 'string'
        ? <Text className={`font-semibold text-sm ${textStyles[variant]}`}>{children}</Text>
        : children}
    </Pressable>
  );
}
