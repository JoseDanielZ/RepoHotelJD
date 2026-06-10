import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { InputField } from './InputField';
import { Calendar } from '../../lib/icons';

type DateFieldProps = {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  error?: string;
  containerClassName?: string;
};

export function DateField({
  label, value, onChange, min, max, placeholder = 'Seleccionar fecha',
  error, containerClassName = '',
}: DateFieldProps) {
  const [show, setShow] = useState(false);
  const date = value ? new Date(value + 'T12:00:00') : new Date();

  if (Platform.OS === 'web') {
    return (
      <View className={`gap-1 ${containerClassName}`}>
        {label && (
          <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </Text>
        )}
        {React.createElement('input', {
          type: 'date',
          value: value || '',
          min: min || '',
          max: max || '',
          onChange: (e: any) => onChange(e.target.value),
          style: {
            border: `1px solid ${error ? '#f87171' : '#D1D5DB'}`,
            borderRadius: 8,
            padding: '10px 12px',
            fontSize: 14,
            color: value ? '#1F2937' : '#9CA3AF',
            backgroundColor: 'white',
            width: '100%',
            outline: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          },
        })}
        {error && <Text className="text-xs text-red-600">{error}</Text>}
      </View>
    );
  }

  return (
    <View className={`gap-1 ${containerClassName}`}>
      {label && (
        <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</Text>
      )}
      <Pressable
        onPress={() => setShow(true)}
        className={`flex-row items-center border rounded-lg px-3 py-2.5 bg-white ${error ? 'border-red-400' : 'border-gray-300'}`}
      >
        <Calendar size={16} className="text-gray-400 mr-2" />
        <Text className={`text-sm flex-1 ${value ? 'text-gray-800' : 'text-gray-400'}`}>
          {value || placeholder}
        </Text>
      </Pressable>
      {error && <Text className="text-xs text-red-600">{error}</Text>}
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          minimumDate={min ? new Date(min + 'T12:00:00') : undefined}
          maximumDate={max ? new Date(max + 'T12:00:00') : undefined}
          onChange={(_, selectedDate) => {
            setShow(false);
            if (selectedDate) {
              onChange(selectedDate.toISOString().split('T')[0]);
            }
          }}
        />
      )}
    </View>
  );
}
