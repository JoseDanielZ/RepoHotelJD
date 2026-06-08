import { useEffect } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { PageSpinner } from '../../src/components/ui/Spinner';
import { DrawerContent } from '../../src/components/layout/DrawerContent';

const BACKOFFICE_ROLES = ['ADMINISTRADOR', 'ADMIN', 'RECEPCIONISTA', 'OPERATIVO', 'DESK_SERVICE'];

export default function BackofficeLayout() {
  const { user, loading, roles } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/(auth)/login'); return; }
    if (!roles.some(r => BACKOFFICE_ROLES.includes(r))) {
      router.replace('/(cliente)/reservas');
    }
  }, [loading, user, roles]);

  if (loading) return <PageSpinner />;
  if (!user) return null;

  return (
    <Drawer
      drawerContent={() => <DrawerContent />}
      screenOptions={{
        drawerType: isDesktop ? 'permanent' : 'slide',
        drawerStyle: { width: 256, backgroundColor: '#1C3361' },
        headerStyle: { backgroundColor: '#1C3361' },
        headerTintColor: '#C9A840',
        headerTitleStyle: { fontWeight: '700', color: '#fff' },
        headerTitleAlign: 'left',
      }}
    >
      <Drawer.Screen name="index" options={{ title: 'Dashboard', drawerLabel: 'Dashboard' }} />
      <Drawer.Screen name="reservas/index" options={{ title: 'Reservas', drawerLabel: 'Reservas' }} />
      <Drawer.Screen name="reservas/[reservaGuid]" options={{ drawerItemStyle: { display: 'none' }, title: 'Detalle Reserva' }} />
      <Drawer.Screen name="checkin" options={{ title: 'Check-In', drawerLabel: 'Check-In' }} />
      <Drawer.Screen name="estadias/index" options={{ title: 'Estadías', drawerLabel: 'Estadías' }} />
      <Drawer.Screen name="estadias/[estadiaGuid]" options={{ drawerItemStyle: { display: 'none' }, title: 'Detalle Estadía' }} />
      <Drawer.Screen name="facturas/index" options={{ title: 'Facturas', drawerLabel: 'Facturas' }} />
      <Drawer.Screen name="pagos/index" options={{ title: 'Pagos', drawerLabel: 'Pagos' }} />
      <Drawer.Screen name="alojamiento/sucursales" options={{ title: 'Sucursales', drawerLabel: 'Sucursales' }} />
      <Drawer.Screen name="alojamiento/habitaciones" options={{ title: 'Habitaciones', drawerLabel: 'Habitaciones' }} />
      <Drawer.Screen name="alojamiento/tipos" options={{ title: 'Tipos Hab.', drawerLabel: 'Tipos' }} />
      <Drawer.Screen name="seguridad/usuarios" options={{ title: 'Usuarios', drawerLabel: 'Usuarios' }} />
      <Drawer.Screen name="seguridad/roles" options={{ title: 'Roles', drawerLabel: 'Roles' }} />
    </Drawer>
  );
}
