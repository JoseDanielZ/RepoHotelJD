import { useState } from 'react';
import {
  View, Text, Pressable, Modal, FlatList,
  Platform, SafeAreaView,
} from 'react-native';
import { ChevronDown, Check, X } from '../../lib/icons';

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
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? placeholder ?? 'Seleccionar…';
  const hasValue = Boolean(selected);

  // ── Web: delegamos al <select> nativo del navegador ─────────────────────────
  if (Platform.OS === 'web') {
    return (
      <View className={`gap-1 ${containerClassName}`}>
        {label && (
          <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </Text>
        )}
        <View
          className={`border rounded-lg bg-white overflow-hidden ${
            error ? 'border-red-400' : 'border-gray-300'
          }`}
        >
          {/* @ts-ignore — select es elemento web válido */}
          <select
            value={value}
            title={label ?? placeholder ?? 'Seleccionar'}
            onChange={(e: any) => onChange(e.target.value)}
            style={{
              height: 44,
              width: '100%',
              paddingLeft: 12,
              paddingRight: 12,
              fontSize: 14,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: hasValue ? '#111827' : '#9CA3AF',
              appearance: 'auto',
            }}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </View>
        {error && <Text className="text-xs text-red-600">{error}</Text>}
      </View>
    );
  }

  // ── Nativo: botón que abre un Modal con lista ────────────────────────────────
  return (
    <View className={`gap-1 ${containerClassName}`}>
      {label && (
        <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </Text>
      )}

      {/* Trigger */}
      <Pressable
        onPress={() => setOpen(true)}
        className={`flex-row items-center justify-between px-3 bg-white border rounded-lg ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
        style={{ height: 44 }}
      >
        <Text
          className={`text-sm flex-1 ${hasValue ? 'text-gray-900' : 'text-gray-400'}`}
          numberOfLines={1}
        >
          {displayLabel}
        </Text>
        <ChevronDown size={16} className="text-gray-400 ml-2" />
      </Pressable>

      {error && <Text className="text-xs text-red-600">{error}</Text>}

      {/* Modal de opciones */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <SafeAreaView style={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70%' }}>
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: '#E5E7EB',
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
                {label ?? 'Seleccionar'}
              </Text>
              <Pressable onPress={() => setOpen(false)} style={{ padding: 4 }}>
                <X size={20} className="text-gray-500" />
              </Pressable>
            </View>

            {/* Lista de opciones */}
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              ListHeaderComponent={
                placeholder ? (
                  <Pressable
                    onPress={() => { onChange(''); setOpen(false); }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: '#F3F4F6',
                    }}
                  >
                    <Text style={{ fontSize: 15, color: '#9CA3AF' }}>{placeholder}</Text>
                  </Pressable>
                ) : null
              }
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    onPress={() => { onChange(item.value); setOpen(false); }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: '#F3F4F6',
                      backgroundColor: pressed ? '#F9FAFB' : '#fff',
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: active ? '#1C3361' : '#111827',
                        fontWeight: active ? '600' : '400',
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </Text>
                    {active && <Check size={18} className="text-navy-600" />}
                  </Pressable>
                );
              }}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
