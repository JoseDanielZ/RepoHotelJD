import { View } from 'react-native';
import type { ViewProps } from 'react-native';

type CardProps = ViewProps & { className?: string };

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <View
      className={`bg-kairos-card rounded-2xl border border-kairos-border shadow-sm ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
