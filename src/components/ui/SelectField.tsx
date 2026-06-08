import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

type SelectOption = { label: string; value: string };

type SelectFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  containerClassName?: string;
};

export function SelectField({
  label, value, onChange, options, placeholder,
  error, containerClassName = '',
}: SelectFieldProps) {
  return (
    <View className={`gap-1 ${containerClassName}`}>
      {label && (
        <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</Text>
      )}
      <View className={`border rounded-lg bg-white overflow-hidden ${error ? 'border-red-400' : 'border-gray-300'}`}>
        <Picker
          selectedValue={value}
          onValueChange={(v) => onChange(String(v))}
          style={{ height: 44 }}
        >
          {placeholder && <Picker.Item label={placeholder} value="" />}
          {options.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>
      {error && <Text className="text-xs text-red-600">{error}</Text>}
    </View>
  );
}
