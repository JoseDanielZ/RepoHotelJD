import { View, Text, Pressable, ScrollView } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { CalendarCheck, FileText, LogOut, Search } from '../../lib/icons';
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

export function ClienteDrawerContent() {
  const { user, logout } = useAuth();
  const { profile } = useUserProfile();
  const pathname = usePathname();
  const router = useRouter();

  const displayName = profile
    ? `${profile.nombres} ${profile.apellidos}`.trim()
    : (user?.username ?? '');

  const tipoCliente = profile?.roles?.[0]?.nombreRol ?? 'Cliente';
  const correo = profile?.correo ?? user?.email ?? '';
  const initials = getInitials(displayName || (user?.username ?? ''));

  function isActive(href: string) {
    const normalized = href
      .replace('/(cliente)', '/cliente')
      .replace('/(public)', '/');
    return pathname.startsWith(normalized);
  }

  return (
    <View className="flex-1 bg-navy-600">
      {/* Brand */}
      <View className="px-6 py-5 border-b border-navy-700">
        <Text className="text-xl font-bold text-gold-400">Hotel Kairos</Text>
        <Text className="text-xs text-navy-300 mt-0.5">Mi Cuenta</Text>
      </View>

      {/* User info */}
      <View className="px-4 py-4 border-b border-navy-700">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 rounded-full bg-gold-500 items-center justify-center flex-shrink-0">
            <Text className="text-sm font-bold text-white">{initials}</Text>
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-sm font-semibold text-white" numberOfLines={1}>
              {displayName || user?.username}
            </Text>
            <Text className="text-xs text-gold-400 font-medium" numberOfLines={1}>
              {tipoCliente}
            </Text>
          </View>
        </View>
        {correo ? (
          <Text className="text-xs text-navy-300 mt-2 ml-1" numberOfLines={1}>
            {correo}
          </Text>
        ) : null}
      </View>

      {/* Navigation */}
      <ScrollView className="flex-1 px-3 py-4">
        <Text className="text-xs font-semibold text-navy-400 uppercase tracking-wider px-3 mb-2">
          Navegación
        </Text>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Pressable
              key={href}
              onPress={() => router.push(href as any)}
              className={`flex-row items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 ${
                active ? 'bg-gold-500' : ''
              }`}
            >
              <Icon size={16} className={active ? 'text-white' : 'text-navy-200'} />
              <Text
                className={`text-sm font-medium flex-1 ${
                  active ? 'text-white' : 'text-navy-200'
                }`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View className="px-3 py-4 border-t border-navy-700">
        <Pressable
          onPress={logout}
          className="flex-row items-center gap-3 px-3 py-2 rounded-lg"
        >
          <LogOut size={16} className="text-navy-300" />
          <Text className="text-sm text-navy-300">Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}
