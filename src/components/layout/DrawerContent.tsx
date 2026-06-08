import { View, Text, Pressable, ScrollView } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import {
  LayoutDashboard, CalendarCheck, Hotel, BedDouble, Users,
  FileText, CreditCard, UserCheck, LogOut, Layers, Building2,
  Shield,
} from '../../lib/icons';
import { useAuth } from '../../contexts/AuthContext';

const navGroups = [
  {
    label: 'Principal',
    items: [{ href: '/(backoffice)', label: 'Dashboard', icon: LayoutDashboard, exact: true }],
  },
  {
    label: 'Operaciones',
    items: [
      { href: '/(backoffice)/reservas', label: 'Reservas', icon: CalendarCheck },
      { href: '/(backoffice)/checkin', label: 'Check-In', icon: UserCheck },
      { href: '/(backoffice)/estadias', label: 'Estadías', icon: Hotel },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { href: '/(backoffice)/facturas', label: 'Facturas', icon: FileText },
      { href: '/(backoffice)/pagos', label: 'Pagos', icon: CreditCard },
    ],
  },
  {
    label: 'Alojamiento',
    items: [
      { href: '/(backoffice)/alojamiento/sucursales', label: 'Sucursales', icon: Building2 },
      { href: '/(backoffice)/alojamiento/habitaciones', label: 'Habitaciones', icon: BedDouble },
      { href: '/(backoffice)/alojamiento/tipos', label: 'Tipos', icon: Layers },
    ],
  },
  {
    label: 'Seguridad',
    items: [
      { href: '/(backoffice)/seguridad/usuarios', label: 'Usuarios', icon: Users },
      { href: '/(backoffice)/seguridad/roles', label: 'Roles', icon: Shield },
    ],
  },
];

export function DrawerContent() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === '/backoffice' || pathname === '/(backoffice)';
    return pathname.includes(href.replace('/(backoffice)', '/backoffice'));
  }

  return (
    <View className="flex-1 bg-navy-600">
      {/* Brand */}
      <View className="px-6 py-5 border-b border-navy-700">
        <Text className="text-xl font-bold text-gold-400">Hotel Kairos</Text>
        <Text className="text-xs text-navy-300 mt-0.5">Panel de Gestión</Text>
      </View>

      {/* User info */}
      <View className="px-4 py-3 border-b border-navy-700 flex-row items-center gap-3">
        <View className="h-9 w-9 rounded-full bg-gold-500 items-center justify-center">
          <Text className="text-sm font-bold text-white">
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </Text>
        </View>
        <View className="flex-1 min-w-0">
          <Text className="text-sm font-medium text-white" numberOfLines={1}>{user?.username}</Text>
          <Text className="text-xs text-navy-300" numberOfLines={1}>{user?.roles?.[0] ?? 'Staff'}</Text>
        </View>
      </View>

      {/* Navigation */}
      <ScrollView className="flex-1 px-3 py-4">
        {navGroups.map((group) => (
          <View key={group.label} className="mb-5">
            <Text className="text-xs font-semibold text-navy-400 uppercase tracking-wider px-3 mb-1.5">
              {group.label}
            </Text>
            {group.items.map(({ href, label, icon: Icon, exact = false } : { href: string; label: string; icon: any; exact?: boolean }) => {
              const active = isActive(href, exact);
              return (
                <Pressable
                  key={href}
                  onPress={() => router.push(href as any)}
                  className={`flex-row items-center gap-3 px-3 py-2 rounded-lg mb-0.5 ${active ? 'bg-gold-500' : ''}`}
                >
                  <Icon size={16} className={active ? 'text-white' : 'text-navy-200'} />
                  <Text className={`text-sm font-medium flex-1 ${active ? 'text-white' : 'text-navy-200'}`}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
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
