import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import Screen from '../lib/Screen';
import { s, colors } from '../lib/ui';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || password.length < 6)
      return Alert.alert('Datos incompletos', 'Ingresa tu correo y una contraseña de al menos 6 caracteres.');
    if (mode === 'register' && (!name.trim() || !phone.trim()))
      return Alert.alert('Datos incompletos', 'Nombre y teléfono son obligatorios.');

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) Alert.alert('Error de autenticación',
          error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : error.message);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { full_name: name.trim(), phone: phone.trim() } },
        });
        if (error) Alert.alert('No se pudo registrar', error.message);
        else if (!data.session) Alert.alert('Revisa tu correo', 'Confirma tu cuenta con el enlace que te enviamos.');
      }
    } catch {
      Alert.alert('Sin conexión', 'No se pudo contactar al servidor. Revisa tu Internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={[s.title, { textAlign: 'center' }]}>💈 BarberApp</Text>
      <Text style={[s.muted, { textAlign: 'center', marginBottom: 12 }]}>
        {mode === 'login' ? 'Inicia sesión para reservar' : 'Crea tu cuenta'}
      </Text>

      {mode === 'register' && (<>
        <TextInput style={s.input} placeholder="Nombre completo" placeholderTextColor={colors.muted}
          value={name} onChangeText={setName} returnKeyType="next" />
        <TextInput style={s.input} placeholder="Teléfono" placeholderTextColor={colors.muted}
          keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      </>)}
      <TextInput style={s.input} placeholder="Correo electrónico" placeholderTextColor={colors.muted}
        autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={s.input} placeholder="Contraseña" placeholderTextColor={colors.muted}
        secureTextEntry value={password} onChangeText={setPassword}
        returnKeyType="done" onSubmitEditing={submit} />

      <TouchableOpacity style={s.btn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#1a1a1a" /> : <Text style={s.btnText}>{mode === 'login' ? 'Entrar' : 'Registrarme'}</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ padding: 10 }}>
        <Text style={[s.muted, { textAlign: 'center' }]}>
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}
