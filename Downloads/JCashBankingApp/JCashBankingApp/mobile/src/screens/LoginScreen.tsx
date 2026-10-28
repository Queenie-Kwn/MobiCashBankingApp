import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Button, Input, ErrorText, C, F } from '../components/UI';

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<any>();
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!mobile.trim() || !pin.trim()) { setError('Please enter your mobile number and PIN.'); return; }
    setError('');
    setLoading(true);
    try {
      await login(mobile.trim(), pin.trim());
    } catch (e: any) {
      setError(e.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoFrame}>
            <Image
              source={require('../../assets/splash-icon.png')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSub}>Sign in to your account</Text>

          <Input
            label="Mobile Number"
            placeholder="09XXXXXXXXX"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={t => { setMobile(t); setError(''); }}
            maxLength={11}
            autoComplete="tel"
          />

          <Input
            label="PIN"
            placeholder="Enter your PIN"
            secureTextEntry
            keyboardType="number-pad"
            value={pin}
            onChangeText={t => { setPin(t); setError(''); }}
            maxLength={6}
          />

          <ErrorText message={error} />

          <Button label="Sign In" onPress={handleLogin} loading={loading} style={styles.loginBtn} />

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Create one</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>Secured with SHA-256 encryption</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.offWhite },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },

  hero: { alignItems: 'center', marginBottom: 28 },
  logoFrame: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 4, borderColor: C.cobalt,
    overflow: 'hidden',
    shadowColor: C.cobalt, shadowOpacity: 0.35,
    shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  logo: { width: '100%', height: '100%' },

  card: {
    backgroundColor: C.white, borderRadius: 24, padding: 28,
    shadowColor: '#1A2B6B', shadowOpacity: 0.09,
    shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  cardTitle: { fontSize: F.xl, fontWeight: '800', color: C.navy, marginBottom: 4 },
  cardSub: { fontSize: F.sm, color: C.slate, marginBottom: 24 },

  loginBtn: { marginTop: 8 },

  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerText: { fontSize: F.sm, color: C.slate },
  registerLink: { fontSize: F.sm, color: C.cobalt, fontWeight: '700' },

  footer: { textAlign: 'center', color: C.slate, fontSize: F.xs, marginTop: 28, opacity: 0.7 },
});
