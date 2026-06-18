import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Hotel, LogIn, LogOut, User } from '../../lib/icons';
import { UserSidePanel } from './UserSidePanel';

export function PublicNavbar() {
  const { user, logout, isBackOffice } = useAuth();
  const router = useRouter();
  const [panelVisible, setPanelVisible] = useState(false);

  return (
    <>
      <View className="bg-navy-600 px-4 py-3 flex-row items-center justify-between">
        <Pressable onPress={() => router.push('/')} className="flex-row items-center gap-2">
          <Hotel size={20} className="text-gold-400" />
          <Text className="text-lg font-bold text-gold-400">Hotel Kairos</Text>
        </Pressable>

        <View className="flex-row items-center gap-3">
          {user ? (
            <>
              {isBackOffice ? (
                <Pressable onPress={() => router.push('/(backoffice)' as any)}>
                  <Text className="text-xs text-navy-200">Panel</Text>
                </Pressable>
              ) : (
                <Pressable onPress={() => setPanelVisible(true)}>
                  <User size={18} className="text-navy-200" />
                </Pressable>
              )}
              <Pressable onPress={logout}>
                <LogOut size={18} className="text-navy-200" />
              </Pressable>
            </>
          ) : (
            <Pressable onPress={() => router.push('/(auth)/login' as any)} className="flex-row items-center gap-1.5">
              <LogIn size={18} className="text-navy-200" />
              <Text className="text-sm text-navy-200">Ingresar</Text>
            </Pressable>
          )}
        </View>
      </View>

      <UserSidePanel visible={panelVisible} onClose={() => setPanelVisible(false)} />
    </>
  );
}
