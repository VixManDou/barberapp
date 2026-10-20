import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ApiError } from '../lib/apiClient';
import { useAuth } from '../lib/AuthContext';
import Chip from '../lib/Chip';
import { sendAppointmentNotification } from '../lib/formspree';
import { supabase } from '../lib/supabase';
import type { Barber, Service } from '../lib/types';
import { colors, fmtDay, fmtHour, s } from '../lib/ui';

const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18]; // horario de atención

export default function Book() {
  const { session, profile } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [barber, setBarber] = useState<Barber | null>(null);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<Date | null>(null);
  const [booked, setBooked] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ mailOk: boolean; message: string; raw?: string } | null>(null);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d;
  }), []);
  const slots = useMemo(() => HOURS.map((h) => {
    const d = new Date(days[dayIdx]); d.setHours(h, 0, 0, 0); return d;
  }), [days, dayIdx]);

  // 1) Catálogo desde Supabase
  useEffect(() => {
    (async () => {
      const [sv, br] = await Promise.all([
        supabase.from('services').select('*').order('id'),
        supabase.from('barbers').select('*').eq('is_active', true).order('id'),
      ]);
      if (sv.error || br.error) setError('No se pudo cargar el catálogo. Revisa tu conexión.');
      else { setServices(sv.data as Service[]); setBarbers(br.data as Barber[]); }
      setLoading(false);
    })();
  }, []);

  // 2) Horarios ocupados del barbero en el día elegido
  useEffect(() => {
    if (!barber) return;
    setSlot(null); setBooked([]);
    const from = new Date(days[dayIdx]);
    const to = new Date(from); to.setDate(to.getDate() + 1);
    supabase.rpc('get_booked_slots', { p_barber_id: barber.id, p_from: from.toISOString(), p_to: to.toISOString() })
      .then(({ data, error }) => {
        if (error) setError('No se pudieron consultar los horarios ocupados.');
        else setBooked((data as { appointment_date: string }[]).map((r) => new Date(r.appointment_date).getTime()));
      });
  }, [barber, dayIdx, days]);

  // 3) Guardar cita en Supabase + notificar por API remota (Formspree)
  const confirm = async () => {
    if (!service || !barber || !slot || !session) return;
    setSaving(true); setError(null);

    const { error: err } = await supabase.from('appointments').insert({
      user_id: session.user.id, barber_id: barber.id, service_id: service.id,
      appointment_date: slot.toISOString(),
    });
    if (err) {
      setSaving(false);
      setError(err.code === '23505' ? 'Ese horario acaba de ser ocupado. Elige otro.' : 'No se pudo guardar la cita: ' + err.message);
      return;
    }

    try {
      const n = await sendAppointmentNotification({
        email: session.user.email ?? '', name: profile?.full_name ?? '', phone: profile?.phone ?? '',
        service: service.name, barber: barber.name, date: `${fmtDay(slot)} ${fmtHour(slot)}`,
      });
      setResult({ mailOk: true, message: 'Notificación enviada a la barbería.', raw: JSON.stringify(n.raw, null, 2) });
    } catch (e) {
      setResult({ mailOk: false, message: e instanceof ApiError ? e.message : 'Error inesperado al notificar.' });
    }
    setSaving(false);
  };

  if (loading) return <View style={[s.screen, { justifyContent: 'center' }]}><ActivityIndicator color={colors.primary} /></View>;

  if (result) {
    return (
      <ScrollView style={s.screen} contentContainerStyle={s.content}>
        <Text style={s.title}>✅ Cita registrada</Text>
        <Text style={s.text}>{service?.name} con {barber?.name}{'\n'}{slot && `${fmtDay(slot)} · ${fmtHour(slot)}`}</Text>
        <View style={s.card}>
          <Text style={[s.text, { color: result.mailOk ? colors.ok : colors.danger }]}>
            {result.mailOk ? '✉️ ' : '⚠️ '}{result.message}
          </Text>
          {!result.mailOk && <Text style={s.muted}>Tu cita sí quedó guardada; solo falló el aviso por correo.</Text>}
          {result.raw && <><Text style={s.muted}>Respuesta de Formspree:</Text><Text style={[s.muted, { fontFamily: 'monospace' }]}>{result.raw}</Text></>}
        </View>
        <TouchableOpacity style={s.btn} onPress={() => router.replace('/appointments')}>
          <Text style={s.btnText}>Ver mis citas</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Text style={s.h2}>1. Servicio</Text>
      <View style={s.row}>{services.map((x) => (
        <Chip key={x.id} label={`${x.name} · $${x.price}`} selected={service?.id === x.id} onPress={() => setService(x)} />))}</View>

      <Text style={s.h2}>2. Barbero</Text>
      <View style={s.row}>{barbers.map((x) => (
        <Chip key={x.id} label={x.name} selected={barber?.id === x.id} onPress={() => setBarber(x)} />))}</View>

      <Text style={s.h2}>3. Día</Text>
      <View style={s.row}>{days.map((d, i) => (
        <Chip key={i} label={fmtDay(d)} selected={dayIdx === i} onPress={() => setDayIdx(i)} />))}</View>

      <Text style={s.h2}>4. Hora</Text>
      {!barber ? <Text style={s.muted}>Elige un barbero para ver los horarios.</Text> : (
        <View style={s.row}>{slots.map((d) => {
          const unavailable = booked.includes(d.getTime()) || d.getTime() < Date.now();
          return <Chip key={d.getTime()} label={fmtHour(d)} disabled={unavailable}
            selected={slot?.getTime() === d.getTime()} onPress={() => setSlot(d)} />;
        })}</View>)}

      {error && <Text style={s.error}>{error}</Text>}
      <TouchableOpacity style={[s.btn, (!service || !barber || !slot) && { opacity: 0.4 }]}
        disabled={!service || !barber || !slot || saving} onPress={confirm}>
        {saving ? <ActivityIndicator color="#1a1a1a" /> : <Text style={s.btnText}>Confirmar reserva</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}
