import { useRef, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarCheck, FileText, LogOut, Search, X } from '../../lib/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';

const navItems = [
  { href: '/(cliente)/reservas', label: 'Mis Reservas', icon: CalendarCheck },
  { href: '/(cliente)/facturas', label: 'Mis Facturas', icon: FileText },
  { href: '/(public)', label: 'Buscar Alojamiento', icon: Search },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase() || 'U';
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function UserSidePanel({ visible, onClose }: Props) {
  const { user, logout } = useAuth();
  const { profile } = useUserProfile();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(320, Math.floor(width * 0.85));

  // Track whether the Modal is mounted (stays mounted during close animation)
  const [mounted, setMounted] = useState(false);
  const slideAnim = useRef(new Animated.Value(panelWidth)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      slideAnim.setValue(panelWidth);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: panelWidth,
        duration: 200,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, panelWidth]);

  const displayName = profile
    ? `${profile.nombres} ${profile.apellidos}`.trim()
    : (user?.username ?? '');

  const tipoCliente = profile?.roles?.[0]?.nombreRol ?? 'Cliente';
  const correo = profile?.correo ?? user?.email ?? '';
  const initials = getInitials(displayName || (user?.username ?? ''));

  function navigate(href: string) {
    onClose();
    router.push(href as any);
  }

  async function handleLogout() {
    onClose();
    await logout();
  }

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Overlay */}
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}
          onPress={onClose}
        />

        {/* Sliding panel */}
        <Animated.View
          style={{
            width: panelWidth,
            transform: [{ translateX: slideAnim }],
            backgroundColor: '#1C3361',
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 16,
          }}
        >
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 52,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#162A50',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#C9A840' }}>
                Hotel Kairos
              </Text>
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                Mi Cuenta
              </Text>
            </View>
            <Pressable onPress={onClose} style={{ padding: 4 }}>
              <X size={20} className="text-navy-300" />
            </Pressable>
          </View>

          {/* User info */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#162A50',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  height: 44,
                  width: 44,
                  borderRadius: 22,
                  backgroundColor: '#C9A840',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
                  {initials}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}
                  numberOfLines={1}
                >
                  {displayName || user?.username}
                </Text>
                <Text style={{ fontSize: 11, color: '#C9A840', fontWeight: '500', marginTop: 2 }}>
                  {tipoCliente}
                </Text>
              </View>
            </View>
            {correo ? (
              <Text
                style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}
                numberOfLines={1}
              >
                {correo}
              </Text>
            ) : null}
          </View>

          {/* Nav links */}
          <ScrollView style={{ flex: 1, paddingHorizontal: 12, paddingTop: 16 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                color: '#64748B',
                letterSpacing: 1,
                textTransform: 'uppercase',
                paddingHorizontal: 12,
                marginBottom: 8,
              }}
            >
              Accesos rápidos
            </Text>
            {navItems.map(({ href, label, icon: Icon }) => (
              <Pressable
                key={href}
                onPress={() => navigate(href)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 13,
                  borderRadius: 10,
                  marginBottom: 2,
                  backgroundColor: pressed ? '#162A50' : 'transparent',
                })}
              >
                <Icon size={17} className="text-navy-200" />
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#CBD5E1', flex: 1 }}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Logout */}
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: '#162A50',
            }}
          >
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: pressed ? '#162A50' : 'transparent',
              })}
            >
              <LogOut size={17} className="text-navy-300" />
              <Text style={{ fontSize: 14, color: '#94A3B8' }}>Cerrar sesión</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
