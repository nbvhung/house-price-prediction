import { Text, TextInput, View, StyleSheet } from 'react-native';

export default function Field({ label, value, onChange, placeholder, keyboard = 'numeric' }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
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
  wrap: { flex: 1, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 5 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0f172a',
  },
});
