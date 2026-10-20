import { TouchableOpacity, Text } from 'react-native';
import { s, colors } from './ui';

export default function Chip({ label, selected, disabled, onPress }:
  { label: string; selected?: boolean; disabled?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress}
      style={[s.chip, selected && s.chipSel, disabled && s.chipDis]}>
      <Text style={{ color: selected ? '#1a1a1a' : colors.text, fontWeight: selected ? '700' : '400' }}>{label}</Text>
    </TouchableOpacity>
  );
}
