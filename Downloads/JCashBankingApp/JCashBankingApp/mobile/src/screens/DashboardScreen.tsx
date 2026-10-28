import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { C, F } from '../components/UI';

type Props = { navigation: any };
type Tx = { type: string; typeLabel: string; amount: number; details: string; dateTime: string };

const TX_META: Record<string, { icon: string; color: string; sign: string; bg: string }> = {
  CASH_IN:      { icon: '↓', color: C.success, sign: '+', bg: '#E6F9F3' },
  TRANSFER_IN:  { icon: '↓', color: C.cobalt,  sign: '+', bg: '#EBF0FF' },
  TRANSFER_OUT: { icon: '↑', color: '#E03E3E',  sign: '−', bg: '#FDEAEA' },
};

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',     screen: 'Dashboard' },
  { icon: '💳', label: 'Cash In',  screen: 'CashIn' },
  { icon: '📤', label: 'Transfer', screen: 'Transfer' },
  { icon: '📋', label: 'History',  screen: 'Transactions' },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function fmtBalance(v: number) {
  return `₱ ${v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DashboardScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [balance, setBalance]         = useState<number | null>(null);
  const [txs, setTxs]                 = useState<Tx[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [activeTab, setActiveTab]     = useState('Dashboard');

  const fetchData = useCallback(async () => {
    try {
      const [balData, txData] = await Promise.all([api.getBalance(), api.getTransactions()]);
      setBalance(balData.balance);
      setTxs([...txData].reverse().slice(0, 5));
    } catch {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => {
    setActiveTab('Dashboard');
    fetchData();
  }, [fetchData]));

  async function onRefresh() {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }

  function navigate(screen: string) {
    setActiveTab(screen);
    navigation.navigate(screen);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topGreeting}>{greeting()},</Text>
          <Text style={styles.topName} numberOfLines={1}>{user?.fullName} 👋</Text>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity
            style={styles.avatarBtn}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0).toUpperCase() ?? 'U'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.cobalt} />}
      >
        {/* ── Balance card ── */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceCardTop}>
            <View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.mobileNum}>{user?.mobile}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setBalanceHidden(h => !h)}
              style={styles.eyeBtn}
              activeOpacity={0.6}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            >
              <Text style={styles.eyeIcon}>{balanceHidden ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={C.white} style={{ marginTop: 18, alignSelf: 'flex-start' }} />
          ) : (
            <Text style={styles.balanceAmount}>
              {balanceHidden ? '₱ ••••••' : balance === null ? '—' : fmtBalance(balance)}
            </Text>
          )}

          <View style={styles.balanceFooter}>
            <View style={styles.balancePill}>
              <Text style={styles.balancePillText}>● Active</Text>
            </View>
            <Text style={styles.balanceUpdated}>Tap 👁️ to {balanceHidden ? 'show' : 'hide'}</Text>
          </View>
        </View>

        {/* ── Primary action buttons ── */}
        <View style={styles.primaryActions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigate('CashIn')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnIcon}>＋</Text>
            <Text style={styles.primaryBtnLabel}>Cash In</Text>
          </TouchableOpacity>

          <View style={styles.primaryBtnGap} />

          <TouchableOpacity
            style={[styles.primaryBtn, styles.primaryBtnMint]}
            onPress={() => navigate('Transfer')}
            activeOpacity={0.85}
          >
            <Text style={[styles.primaryBtnIcon, { color: C.navy }]}>↑</Text>
            <Text style={[styles.primaryBtnLabel, { color: C.navy }]}>Send Money</Text>
          </TouchableOpacity>
        </View>

        {/* ── Quick actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {[
            { icon: '💳', label: 'Cash In',  screen: 'CashIn' },
            { icon: '📤', label: 'Transfer', screen: 'Transfer' },
            { icon: '📋', label: 'History',  screen: 'Transactions' },
          ].map(a => (
            <TouchableOpacity
              key={a.screen}
              style={styles.quickItem}
              onPress={() => navigate(a.screen)}
              activeOpacity={0.75}
            >
              <View style={styles.quickIconWrap}>
                <Text style={styles.quickIcon}>{a.icon}</Text>
              </View>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Recent transactions ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigate('Transactions')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={C.cobalt} style={{ marginVertical: 24 }} />
        ) : txs.length === 0 ? (
          <View style={styles.emptyTx}>
            <Text style={styles.emptyTxIcon}>📭</Text>
            <Text style={styles.emptyTxTitle}>No transactions yet</Text>
            <Text style={styles.emptyTxSub}>Your cash-ins and transfers will appear here.</Text>
          </View>
        ) : (
          txs.map((tx, i) => {
            const meta = TX_META[tx.type] ?? { icon: '•', color: C.slate, sign: '', bg: C.offWhite };
            const date = new Date(tx.dateTime).toLocaleString('en-PH', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            });
            return (
              <View key={i} style={styles.txRow}>
                <View style={[styles.txIconWrap, { backgroundColor: meta.bg }]}>
                  <Text style={[styles.txIcon, { color: meta.color }]}>{meta.icon}</Text>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txLabel} numberOfLines={1}>{tx.typeLabel}</Text>
                  <Text style={styles.txDetails} numberOfLines={1}>{tx.details}</Text>
                  <Text style={styles.txDate}>{date}</Text>
                </View>
                <Text style={[styles.txAmount, { color: meta.color }]}>
                  {balanceHidden
                    ? '••••'
                    : `${meta.sign}₱${Number(tx.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
                </Text>
              </View>
            );
          })
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Bottom nav ── */}
      <View style={styles.bottomNav}>
        {NAV_ITEMS.map(item => {
          const isActive = activeTab === item.screen;
          return (
            <TouchableOpacity
              key={item.screen}
              style={styles.navItem}
              onPress={() => navigate(item.screen)}
              activeOpacity={0.75}
            >
              <View style={[styles.navIconWrap, isActive && styles.navIconWrapActive]}>
                <Text style={styles.navIcon}>{item.icon}</Text>
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.navItem} onPress={logout} activeOpacity={0.75}>
          <View style={styles.navIconWrap}>
            <Text style={styles.navIcon}>🚪</Text>
          </View>
          <Text style={styles.navLabel}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.navy },

  // Top bar
  topBar: {
    backgroundColor: C.navy,
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  topGreeting: { color: 'rgba(255,255,255,0.6)', fontSize: F.sm },
  topName: { color: C.white, fontSize: F.md, fontWeight: '700', marginTop: 2, maxWidth: 220 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: C.cobalt, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarText: { color: C.white, fontWeight: '800', fontSize: F.base },

  // Scroll
  scroll: { flex: 1, backgroundColor: C.offWhite, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4 },

  // Balance card — NO overflow:hidden so eye button is always tappable
  balanceCard: {
    backgroundColor: C.cobalt,
    borderRadius: 24, padding: 24,
    marginTop: 24, marginBottom: 20,
    shadowColor: C.cobalt, shadowOpacity: 0.4,
    shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  balanceCardTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  balanceLabel: { color: 'rgba(255,255,255,0.75)', fontSize: F.sm, fontWeight: '500' },
  mobileNum: { color: 'rgba(255,255,255,0.5)', fontSize: F.xs, marginTop: 3 },
  eyeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  eyeIcon: { fontSize: 18 },
  balanceAmount: {
    color: C.white, fontSize: 34, fontWeight: '800',
    marginTop: 16, letterSpacing: -0.5,
  },
  balanceFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 16,
  },
  balancePill: {
    backgroundColor: 'rgba(54,214,195,0.25)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  balancePillText: { color: C.mint, fontSize: F.xs, fontWeight: '700' },
  balanceUpdated: { color: 'rgba(255,255,255,0.45)', fontSize: F.xs },

  // Primary actions
  primaryActions: { flexDirection: 'row', marginBottom: 28 },
  primaryBtn: {
    flex: 1, backgroundColor: C.cobalt, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center',
    shadowColor: C.cobalt, shadowOpacity: 0.3,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  primaryBtnMint: { backgroundColor: C.mint, shadowColor: C.mint },
  primaryBtnGap: { width: 12 },
  primaryBtnIcon: { color: C.white, fontSize: 18, fontWeight: '800', marginRight: 8 },
  primaryBtnLabel: { color: C.white, fontSize: F.base, fontWeight: '700' },

  // Quick actions
  sectionTitle: { fontSize: F.base, fontWeight: '700', color: C.navy, marginBottom: 14 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  seeAll: { fontSize: F.sm, color: C.cobalt, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', marginBottom: 28 },
  quickItem: { flex: 1, alignItems: 'center' },
  quickIconWrap: {
    width: 58, height: 58, borderRadius: 18,
    backgroundColor: C.white, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1A2B6B', shadowOpacity: 0.07,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    marginBottom: 8,
  },
  quickIcon: { fontSize: 26 },
  quickLabel: { fontSize: F.xs, fontWeight: '600', color: C.navy },

  // Transactions
  txRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#1A2B6B', shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  txIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  txIcon: { fontSize: 18, fontWeight: '800' },
  txInfo: { flex: 1 },
  txLabel: { fontSize: F.sm, fontWeight: '700', color: C.navy },
  txDetails: { fontSize: F.xs, color: C.slate, marginTop: 2 },
  txDate: { fontSize: F.xs, color: C.slate, opacity: 0.65, marginTop: 3 },
  txAmount: { fontSize: F.base, fontWeight: '800' },

  emptyTx: { alignItems: 'center', paddingVertical: 40 },
  emptyTxIcon: { fontSize: 44, marginBottom: 12 },
  emptyTxTitle: { fontSize: F.md, fontWeight: '700', color: C.navy, marginBottom: 6 },
  emptyTxSub: { fontSize: F.sm, color: C.slate, textAlign: 'center', paddingHorizontal: 24 },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row', backgroundColor: C.white,
    paddingVertical: 8, paddingHorizontal: 4,
    borderTopWidth: 1, borderTopColor: C.border,
    shadowColor: '#000', shadowOpacity: 0.07,
    shadowRadius: 12, shadowOffset: { width: 0, height: -3 }, elevation: 10,
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  navIconWrap: {
    width: 36, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  navIconWrapActive: { backgroundColor: '#EBF0FF' },
  navIcon: { fontSize: 18 },
  navLabel: { fontSize: 10, color: C.slate, fontWeight: '600', marginTop: 2 },
  navLabelActive: { color: C.cobalt, fontWeight: '700' },
});
