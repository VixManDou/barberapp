import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import Screen from '../lib/Screen';
import { s, colors } from '../lib/ui';
import type { Service } from '../lib/types';

export default function Home() {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isStaff = profile?.role === 'barber' || profile?.role === 'admin';

  const load = async () => {
    setLoading(true); setError(null);
    const { data, error } = await supabase.from('services').select('*').order('id');
    if (error) setError('No se pudieron cargar los servicios. Revisa tu conexión.');
    else setServices(data as Service[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <Screen>
      <Text style={s.title}>Hola, {profile?.full_name || 'bienvenido'}</Text>
      <Text style={s.muted}>Rol: {profile?.role ?? '...'}</Text>

      <TouchableOpacity style={s.btn} onPress={() => router.push('/book')}>
        <Text style={s.btnText}>Reservar cita</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btnOutline} onPress={() => router.push('/appointments')}>
        <Text style={s.btnOutlineText}>{isStaff ? 'Agenda de la barbería' : 'Mis citas'}</Text>
      </TouchableOpacity>

      <Text style={s.h2}>Servicios</Text>
      {loading && <ActivityIndicator color={colors.primary} />}
      {error && (<>
        <Text style={s.error}>{error}</Text>
        <TouchableOpacity onPress={load}><Text style={{ color: colors.primary }}>Reintentar</Text></TouchableOpacity>
      </>)}
      {services.map((sv) => (
        <View key={sv.id} style={s.card}>
          <Text style={s.text}>{sv.name} — ${sv.price}</Text>
          <Text style={s.muted}>{sv.duration_minutes} min · {sv.description}</Text>
        </View>
      ))}

      <TouchableOpacity style={[s.btnOutline, { borderColor: colors.danger, marginTop: 16 }]} onPress={signOut}>
        <Text style={[s.btnOutlineText, { color: colors.danger }]}>Cerrar sesión</Text>
      </TouchableOpacity>
    </Screen>
  );
}
