import { View, Text, TextInput, type TextInputProps } from 'react-native';

type InputFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  containerClassName?: string;
};

export function InputField({ label, error, containerClassName = '', className = '', ...props }: InputFieldProps) {
  return (
    <View className={`gap-1 ${containerClassName}`}>
      {label && (
        <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</Text>
      )}
      <TextInput
        className={`border rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white ${error ? 'border-red-400' : 'border-gray-300'} ${className}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text className="text-xs text-red-600">{error}</Text>}
    </View>
  );
}
