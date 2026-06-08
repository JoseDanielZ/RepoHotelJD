import { View, ActivityIndicator } from 'react-native';

type SpinnerProps = { size?: 'sm' | 'md' | 'lg'; color?: string };

export function Spinner({ size = 'md', color = '#C9A840' }: SpinnerProps) {
  const sizeMap = { sm: 'small', md: 'large', lg: 'large' } as const;
  return <ActivityIndicator size={sizeMap[size]} color={color} />;
}

export function PageSpinner() {
  return (
    <View className="flex-1 items-center justify-center min-h-[300px]">
      <Spinner size="lg" />
    </View>
  );
}
