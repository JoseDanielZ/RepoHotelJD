import { Modal as RNModal, View, Text, Pressable, ScrollView } from 'react-native';
import { X } from '../../lib/icons';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const maxWidths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 items-center justify-center p-4"
        onPress={onClose}
      >
        <Pressable
          className={`bg-white rounded-2xl w-full ${maxWidths[size]} max-h-[90%] shadow-2xl`}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-800 flex-1 mr-4">{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} className="text-gray-400" />
            </Pressable>
          </View>
          <ScrollView className="px-6 py-4" keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
