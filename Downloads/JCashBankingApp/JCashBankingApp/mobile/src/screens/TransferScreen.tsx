import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity,
} from 'react-native';
import { api } from '../services/api';
import { Button, Input, ErrorText, SuccessBanner, C, F } from '../components/UI';

type Props = { navigation: any };

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

export default function TransferScreen({ navigation }: Props) {
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  async function handleTransfer() {
    const parsed = parseFloat(amount.replace(/,/g, ''));
    if (!receiver.trim())                        { setError('Please enter the receiver\'s mobile number.'); return; }
    if (!amount || isNaN(parsed) || parsed <= 0) { setError('Please enter a valid amount.'); return; }
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const data = await api.transfer(receiver.trim(), parsed);
      const newBal = Number(data.balance).toLocaleString('en-PH', { minimumFractionDigits: 2 });
      setSuccess(`₱${parsed.toLocaleString('en-PH', { minimumFractionDigits: 2 })} sent successfully! New balance: ₱${newBal}`);
      setReceiver(''); setAmount('');
    } catch (e: any) {
      setError(e.message ?? 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Money</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Icon banner */}
        <View style={styles.iconBanner}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconSymbol}>↑</Text>
          </View>
          <Text style={styles.bannerTitle}>Send Money</Text>
          <Text style={styles.bannerSub}>Transfer funds to any MobiCash user</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Input
            label="Receiver Mobile Number"
            placeholder="09XXXXXXXXX"
            keyboardType="phone-pad"
            value={receiver}
            onChangeText={t => { setReceiver(t); setError(''); setSuccess(''); }}
            maxLength={11}
          />

          <Input
            label="Amount (₱)"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={t => { setAmount(t); setError(''); setSuccess(''); }}
          />

          {/* Quick amount chips */}
          <Text style={styles.quickLabel}>Quick amounts</Text>
          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map(v => (
              <TouchableOpacity
                key={v}
                style={[styles.chip, amount === String(v) && styles.chipActive]}
                onPress={() => { setAmount(String(v)); setError(''); setSuccess(''); }}
              >
                <Text style={[styles.chipText, amount === String(v) && styles.chipTextActive]}>
                  ₱{v.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <SuccessBanner message={success} />
          <ErrorText message={error} />

          <Button label="Send Money" onPress={handleTransfer} loading={loading} style={styles.actionBtn} />
          <Button label="Back to Dashboard" onPress={() => navigation.goBack()} variant="outline" style={styles.backDashBtn} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.offWhite },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.white, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  backIcon: { fontSize: 20, color: C.navy, fontWeight: '700' },
  headerTitle: { fontSize: F.md, fontWeight: '800', color: C.navy },

  iconBanner: { alignItems: 'center', paddingVertical: 28 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: C.mint, justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    shadowColor: C.mint, shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  iconSymbol: { fontSize: 36, color: C.navy, fontWeight: '800' },
  bannerTitle: { fontSize: F.xl, fontWeight: '800', color: C.navy },
  bannerSub: { fontSize: F.sm, color: C.slate, marginTop: 6 },

  card: {
    backgroundColor: C.white, borderRadius: 24, padding: 24,
    shadowColor: '#1A2B6B', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },

  quickLabel: { fontSize: F.sm, fontWeight: '600', color: C.slate, marginBottom: 10 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: C.offWhite,
  },
  chipActive: { borderColor: C.cobalt, backgroundColor: '#EBF0FF' },
  chipText: { fontSize: F.sm, color: C.slate, fontWeight: '600' },
  chipTextActive: { color: C.cobalt },

  actionBtn: { marginTop: 8 },
  backDashBtn: { marginTop: 4 },
});
