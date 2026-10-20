import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import { colors } from '../lib/ui';

function Guard() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inLogin = segments[0] === 'login';
    if (!session && !inLogin) router.replace('/login');
    else if (session && inLogin) router.replace('/');
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerTitleAlign: 'center', headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.text }}>
      <Stack.Screen name="index" options={{ title: 'BarberApp' }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="book" options={{ title: 'Reservar cita' }} />
      <Stack.Screen name="appointments" options={{ title: 'Citas' }} />
    </Stack>
  );
}

export default function Root() {
  return <AuthProvider><Guard /></AuthProvider>;
}
