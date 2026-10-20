import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s } from './ui';

// Contenedor común de pantallas:
// - Se desplaza cuando el teclado tapa los campos (KeyboardAvoidingView + ScrollView).
// - Deja libre el espacio de la barra de navegación de Android / iPhone (safe area).
// - Permite tocar botones con el teclado abierto (keyboardShouldPersistTaps).
export default function Screen({ children, contentStyle }: { children: ReactNode; contentStyle?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={s.screen} behavior="padding">
      <ScrollView
        style={s.screen}
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 32 }, contentStyle]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
