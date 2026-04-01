import { Redirect } from 'expo-router';

import { useAuth } from '@/providers/AuthProvider';

export default function IndexScreen() {
  const { authReady, hasPin, isAuthenticated } = useAuth();

  if (!authReady) {
    return null;
  }

  if (!hasPin) {
    return <Redirect href="/setup-pin" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/unlock" />;
  }

  return <Redirect href="/(tabs)" />;
}
