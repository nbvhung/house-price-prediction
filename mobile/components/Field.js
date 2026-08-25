import { Text, TextInput, View, StyleSheet } from 'react-native';

export default function Field({ label, value, onChange, placeholder, keyboard = 'numeric' }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <TextInput
        style={styles.input}
        value={String(value)}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboard}
        inputMode="decimal"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '48.5%', marginBottom: 14 },
  label: { fontSize: 12.5, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: {
    height: 46,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#0f172a',
  },
});
