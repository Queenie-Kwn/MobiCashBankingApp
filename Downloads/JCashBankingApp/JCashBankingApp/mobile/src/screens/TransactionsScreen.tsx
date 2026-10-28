import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  RefreshControl, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { C, F, Badge } from '../components/UI';

type Tx = { type: string; typeLabel: string; amount: number; details: string; dateTime: string };

const TX_META: Record<string, { icon: string; color: string; sign: string; bg: string; badge: 'success' | 'info' | 'error' }> = {
  CASH_IN:      { icon: '↓', color: C.success, sign: '+', bg: '#E6F9F3', badge: 'success' },
  TRANSFER_IN:  { icon: '↓', color: C.cobalt,  sign: '+', bg: '#EBF0FF', badge: 'info' },
  TRANSFER_OUT: { icon: '↑', color: '#E03E3E',  sign: '−', bg: '#FDEAEA', badge: 'error' },
};

type Props = { navigation: any };

function TxRow({ item }: { item: Tx }) {
  const meta = TX_META[item.type] ?? { icon: '•', color: C.slate, sign: '', bg: C.offWhite, badge: 'info' as const };
  const date = new Date(item.dateTime).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
        <Text style={[styles.icon, { color: meta.color }]}>{meta.icon}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.infoTop}>
          <Text style={styles.typeLabel}>{item.typeLabel}</Text>
          <Badge label={item.typeLabel} variant={meta.badge} />
        </View>
        <Text style={styles.details} numberOfLines={1}>{item.details}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <Text style={[styles.amount, { color: meta.color }]}>
        {meta.sign}₱{Number(item.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
      </Text>
    </View>
  );
}

export default function TransactionsScreen({ navigation }: Props) {
  const [txs, setTxs]           = useState<Tx[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTxs = useCallback(async () => {
    try {
      const data = await api.getTransactions();
      setTxs([...data].reverse());
    } catch {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); fetchTxs(); }, [fetchTxs]));

  async function onRefresh() { setRefreshing(true); await fetchTxs(); setRefreshing(false); }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={C.cobalt} />
        <Text style={styles.loadingText}>Loading transactions…</Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={txs}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <TxRow item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.cobalt} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySub}>Your cash-ins and transfers will appear here.</Text>
          </View>
        }
        ListHeaderComponent={
          txs.length > 0
            ? <Text style={styles.countLabel}>{txs.length} transaction{txs.length !== 1 ? 's' : ''}</Text>
            : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.offWhite },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.offWhite, paddingTop: 56, paddingBottom: 12, paddingHorizontal: 20,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.white, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  backIcon: { fontSize: 20, color: C.navy, fontWeight: '700' },
  headerTitle: { fontSize: F.md, fontWeight: '800', color: C.navy },

  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },

  countLabel: { fontSize: F.sm, color: C.slate, fontWeight: '600', marginBottom: 12 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 18, padding: 16, marginBottom: 10,
    shadowColor: '#1A2B6B', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  iconWrap: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  icon: { fontSize: 20, fontWeight: '800' },
  info: { flex: 1 },
  infoTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  typeLabel: { fontSize: F.sm, fontWeight: '700', color: C.navy },
  details: { fontSize: F.xs, color: C.slate, marginTop: 1 },
  date: { fontSize: F.xs, color: C.slate, opacity: 0.65, marginTop: 4 },
  amount: { fontSize: F.base, fontWeight: '800', marginLeft: 8 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.offWhite },
  loadingText: { color: C.slate, marginTop: 12, fontSize: F.sm },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: F.lg, fontWeight: '700', color: C.navy, marginBottom: 8 },
  emptySub: { fontSize: F.sm, color: C.slate, textAlign: 'center', paddingHorizontal: 32 },
});
