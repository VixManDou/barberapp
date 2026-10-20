import { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import Screen from '../lib/Screen';
import { s, colors, fmtDay, fmtHour } from '../lib/ui';
import type { Appointment } from '../lib/types';

const LABEL = { pending: 'Pendiente', confirmed: 'Confirmada', cancelled: 'Cancelada' } as const;
const COLOR = { pending: '#e0a800', confirmed: colors.ok, cancelled: colors.danger } as const;

export default function Appointments() {
  const { profile } = useAuth();
  const isStaff = profile?.role === 'barber' || profile?.role === 'admin';
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // RLS decide qué filas llegan: el cliente solo las suyas, el staff todas.
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('appointments')
      .select('id,user_id,barber_id,service_id,appointment_date,status,barbers(name),services(name,price),profiles(full_name,phone)')
      .order('appointment_date', { ascending: true });
    if (error) setError('No se pudieron cargar las citas. Revisa tu conexión.');
    else { setError(null); setItems(data as unknown as Appointment[]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase.channel('appointments-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const setStatus = async (id: number, status: 'confirmed' | 'cancelled') => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) Alert.alert('Error', 'No se pudo actualizar la cita: ' + error.message);
    else load();
  };
  const askCancel = (id: number) => Alert.alert('Cancelar cita', '¿Seguro que deseas cancelarla?', [
    { text: 'No' }, { text: 'Sí, cancelar', style: 'destructive', onPress: () => setStatus(id, 'cancelled') },
  ]);

  if (loading) return <View style={[s.screen, { justifyContent: 'center' }]}><ActivityIndicator color={colors.primary} /></View>;

  return (
    <Screen>
      <Text style={s.muted}>{isStaff ? 'Todas las citas de la barbería' : 'Tus citas'}</Text>
      {error && <Text style={s.error}>{error}</Text>}
      {!error && items.length === 0 && <Text style={s.muted}>No hay citas todavía.</Text>}
      {items.map((a) => {
        const d = new Date(a.appointment_date);
        return (
          <View key={a.id} style={s.card}>
            <Text style={s.text}>{a.services?.name} — {a.barbers?.name}</Text>
            <Text style={s.muted}>{fmtDay(d)} · {fmtHour(d)}</Text>
            {isStaff && <Text style={s.muted}>Cliente: {a.profiles?.full_name} ({a.profiles?.phone})</Text>}
            <Text style={{ color: COLOR[a.status], fontWeight: '600' }}>{LABEL[a.status]}</Text>
            {a.status !== 'cancelled' && (
              <View style={[s.row, { marginTop: 8 }]}>
                {isStaff && a.status === 'pending' && (
                  <TouchableOpacity style={s.chip} onPress={() => setStatus(a.id, 'confirmed')}><Text style={{ color: colors.ok }}>Confirmar</Text></TouchableOpacity>)}
                <TouchableOpacity style={s.chip} onPress={() => askCancel(a.id)}><Text style={{ color: colors.danger }}>Cancelar</Text></TouchableOpacity>
              </View>)}
          </View>
        );
      })}
    </Screen>
  );
}
