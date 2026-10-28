import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button, Input, ErrorText, C, F } from '../components/UI';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [fullName, setFullName]     = useState('');
  const [mobile, setMobile]         = useState('');
  const [pin, setPin]               = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  async function handleRegister() {
    if (!fullName.trim() || !mobile.trim() || !pin.trim() || !confirmPin.trim()) {
      setError('All fields are required.'); return;
    }
    if (pin !== confirmPin) { setError('PINs do not match.'); return; }
    if (pin.length < 4)     { setError('PIN must be at least 4 digits.'); return; }
    setError('');
    setLoading(true);
    try {
      await register(mobile.trim(), pin.trim(), fullName.trim());
    } catch (e: any) {
      setError(e.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoRing}>
            <View style={styles.logoInner}>
              <Text style={styles.logoSymbol}>₱</Text>
            </View>
          </View>
          <Text style={styles.appName}>MobiCash</Text>
          <Text style={styles.tagline}>Create your free account</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Get started</Text>
          <Text style={styles.cardSub}>Fill in your details below</Text>

          <Input
            label="Full Name"
            placeholder="Juan Dela Cruz"
            value={fullName}
            onChangeText={t => { setFullName(t); setError(''); }}
            maxLength={50}
            autoCapitalize="words"
          />
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
            placeholder="4–6 digits"
            secureTextEntry
            keyboardType="number-pad"
            value={pin}
            onChangeText={t => { setPin(t); setError(''); }}
            maxLength={6}
          />
          <Input
            label="Confirm PIN"
            placeholder="Re-enter PIN"
            secureTextEntry
            keyboardType="number-pad"
            value={confirmPin}
            onChangeText={t => { setConfirmPin(t); setError(''); }}
            maxLength={6}
          />

          <ErrorText message={error} />

          <Button label="Create Account" onPress={handleRegister} loading={loading} style={styles.registerBtn} />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Sign in</Text>
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

  hero: { alignItems: 'center', marginBottom: 32 },
  logoRing: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(49,92,255,0.12)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  logoInner: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: C.cobalt,
    justifyContent: 'center', alignItems: 'center',
  },
  logoSymbol: { fontSize: 34, color: C.white, fontWeight: '800' },
  appName: { fontSize: F.xxl, fontWeight: '800', color: C.navy, letterSpacing: -0.5 },
  tagline: { fontSize: F.sm, color: C.slate, marginTop: 6 },

  card: {
    backgroundColor: C.white, borderRadius: 24, padding: 28,
    shadowColor: '#1A2B6B', shadowOpacity: 0.09,
    shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  cardTitle: { fontSize: F.xl, fontWeight: '800', color: C.navy, marginBottom: 4 },
  cardSub: { fontSize: F.sm, color: C.slate, marginBottom: 24 },

  registerBtn: { marginTop: 8 },

  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { fontSize: F.sm, color: C.slate },
  loginLink: { fontSize: F.sm, color: C.cobalt, fontWeight: '700' },

  footer: { textAlign: 'center', color: C.slate, fontSize: F.xs, marginTop: 28, opacity: 0.7 },
});
