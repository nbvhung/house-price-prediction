import { useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Field from './components/Field';
import { API_URL } from './api';

const FIELDS = [
  { key: 'area', label: 'Diện tích (m²)', def: '80' },
  { key: 'frontage', label: 'Mặt tiền (m)', def: '4' },
  { key: 'access_road', label: 'Đường vào (m)', def: '3' },
  { key: 'floors', label: 'Số tầng', def: '3' },
  { key: 'bedrooms', label: 'Số phòng ngủ', def: '3' },
  { key: 'bathrooms', label: 'Số WC', def: '2' },
];

export default function App() {
  const [form, setForm] = useState(
    Object.fromEntries(FIELDS.map((f) => [f.key, f.def]))
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const setValue = (key) => (text) => setForm((p) => ({ ...p, [key]: text }));

  async function predict() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const body = Object.fromEntries(FIELDS.map((f) => [f.key, parseFloat(form[f.key]) || 0]));
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError('Không kết nối được API. Kiểm tra link server trong api.js hoặc thử lại (lần đầu server có thể cần ~1 phút để khởi động).');
    }
    setLoading(false);
  }

  return (
    <>
      <StatusBar style="light" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🏠 Dự đoán Giá nhà</Text>
          <Text style={styles.headerSub}>RandomForest • Đơn vị: Tỷ VNĐ</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.grid}>
            {FIELDS.map((f) => (
              <Field key={f.key} label={f.label} value={form[f.key]} onChange={setValue(f.key)} />
            ))}
          </View>

          <Pressable style={({ pressed }) => [styles.button, pressed && { transform: [{ scale: 0.98 }] }]} onPress={predict} disabled={loading}>
            {loading ? (
              <View style={styles.rowCenter}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.buttonText}>  Đang ước tính...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Dự đoán giá</Text>
            )}
          </Pressable>

          {error !== '' && (
            <View style={[styles.result, { backgroundColor: '#fef9c3', borderColor: '#ca8a04' }]}>
              <Text style={[styles.resultTitle, { fontSize: 17, color: '#a16207' }]}>Lỗi kết nối</Text>
              <Text style={styles.resultMsg}>{error}</Text>
            </View>
          )}

          {result && result.status === 'success' && (
            <View style={styles.result}>
              <Text style={styles.price}>{result.predicted_price_ty_vnd} Tỷ VNĐ</Text>
              <Text style={styles.resultMsg}>{result.message}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ecfdf5' },
  content: { padding: 16, paddingBottom: 40 },
  header: { borderRadius: 16, padding: 20, marginBottom: 16, backgroundColor: '#059669' },
  headerTitle: { color: '#fff', fontSize: 21, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.85)', marginTop: 6, fontSize: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  button: { marginTop: 8, backgroundColor: '#059669', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  result: { marginTop: 16, padding: 18, borderRadius: 14, borderWidth: 1.5, backgroundColor: '#ecfdf5', borderColor: '#059669' },
  price: { fontSize: 26, fontWeight: '800', color: '#047857', textAlign: 'center' },
  resultTitle: { fontWeight: '800', textAlign: 'center' },
  resultMsg: { color: '#475569', fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 19 },
});
