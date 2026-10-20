import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#101114', card: '#1b1d22', primary: '#c9a24b', text: '#f2f2f2',
  muted: '#9a9ca3', danger: '#d9534f', ok: '#3ba55d', border: '#2c2f36',
};

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 12 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  h2: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 8 },
  text: { color: colors.text, fontSize: 15 },
  muted: { color: colors.muted, fontSize: 13 },
  error: { color: colors.danger, fontSize: 14 },
  input: { backgroundColor: colors.card, color: colors.text, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: colors.border },
  btn: { backgroundColor: colors.primary, padding: 14, borderRadius: 10, alignItems: 'center' },
  btnOutline: { borderWidth: 1, borderColor: colors.primary, padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#1a1a1a', fontWeight: '700', fontSize: 15 },
  btnOutlineText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 14, gap: 4, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  chipSel: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipDis: { opacity: 0.35 },
});

export const fmtDay = (d: Date) =>
  d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
export const fmtHour = (d: Date) =>
  d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
