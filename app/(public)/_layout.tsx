import { Stack } from 'expo-router';
import { PublicNavbar } from '../../src/components/layout/PublicNavbar';

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => <PublicNavbar />,
      }}
    />
  );
}
