import { httpPost, ApiError } from './apiClient';
import type { FormspreeOk, NotificationPayload, NotificationResult } from './types';

const ENDPOINT = process.env.EXPO_PUBLIC_FORMSPREE_URL;

// POST https://formspree.io/f/{FORM_ID}  ->  { "ok": true, "next": "..." }
export async function sendAppointmentNotification(p: NotificationPayload): Promise<NotificationResult> {
  if (!ENDPOINT) throw new ApiError('client', 'Falta EXPO_PUBLIC_FORMSPREE_URL en el archivo .env.');

  const data = await httpPost<FormspreeOk>(ENDPOINT, {
    email: p.email, // Formspree lo usa como reply-to
    name: p.name,
    _subject: `🔔 Nueva cita - ${p.service} con ${p.barber}`,
    message:
      `Nueva cita solicitada\n` +
      `Cliente: ${p.name} (${p.email})\n` +
      `Teléfono: ${p.phone}\n` +
      `Servicio: ${p.service}\n` +
      `Barbero: ${p.barber}\n` +
      `Fecha: ${p.date}`,
  });

  // Validación de la estructura JSON esperada
  if (!data || typeof data !== 'object' || data.ok !== true) throw new ApiError('invalid_response');

  return { sent: true, nextUrl: data.next, sentAt: new Date().toISOString(), raw: data };
}
