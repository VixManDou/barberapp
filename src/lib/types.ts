// ===== Modelos de la base de datos (Supabase) =====
export type Role = 'client' | 'barber' | 'admin';
export type Status = 'pending' | 'confirmed' | 'cancelled';

export interface Profile { id: string; full_name: string; phone: string; role: Role }
export interface Service { id: number; name: string; price: number; duration_minutes: number; description: string | null }
export interface Barber { id: number; name: string; specialty: string; avatar_url: string | null; is_active: boolean }
export interface Appointment {
  id: number; user_id: string; barber_id: number; service_id: number;
  appointment_date: string; status: Status;
  barbers?: { name: string } | null;
  services?: { name: string; price: number } | null;
  profiles?: { full_name: string; phone: string } | null;
}

// ===== Modelos de la API remota (Formspree) =====
export interface FormspreeOk { ok: boolean; next?: string }
export interface NotificationPayload {
  email: string; name: string; phone: string;
  service: string; barber: string; date: string;
}
export interface NotificationResult { sent: boolean; nextUrl?: string; sentAt: string; raw: FormspreeOk }
