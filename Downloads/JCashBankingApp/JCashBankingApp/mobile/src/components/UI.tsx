import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  View, ViewStyle, TextStyle, TextInput, TextInputProps,
} from 'react-native';

// ── Design Tokens ────────────────────────────────────────────────────────────
export const C = {
  navy:    '#101B3F',
  cobalt:  '#315CFF',
  mint:    '#36D6C3',
  offWhite:'#F5F7FC',
  white:   '#FFFFFF',
  slate:   '#667085',
  success: '#18A875',
  amber:   '#F5B544',
  error:   '#E03E3E',
  border:  '#E4E9F2',
  cardShadow: '#315CFF',
};

export const F = {
  xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, xxl: 32,
};

// ── Button ───────────────────────────────────────────────────────────────────
type BtnProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  style?: ViewStyle;
  disabled?: boolean;
};

export function Button({ label, onPress, loading, variant = 'primary', style, disabled }: BtnProps) {
  const s = btnVariant[variant];
  return (
    <TouchableOpacity
      style={[styles.btn, s.container, (disabled || loading) && styles.btnDisabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? C.white : C.cobalt} size="small" />
        : <Text style={[styles.btnText, s.text]}>{label}</Text>}
    </TouchableOpacity>
  );
}

const btnVariant = {
  primary:   { container: { backgroundColor: C.cobalt }, text: { color: C.white } },
  secondary: { container: { backgroundColor: C.mint },   text: { color: C.navy } },
  outline:   { container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.cobalt }, text: { color: C.cobalt } },
  ghost:     { container: { backgroundColor: 'transparent' }, text: { color: C.cobalt } },
};

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── Input ────────────────────────────────────────────────────────────────────
type InputProps = TextInputProps & { label?: string; error?: string };

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.inputWrap}>
      {!!label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[styles.input, !!error && styles.inputError, style as TextStyle]}
        placeholderTextColor={C.slate}
        {...props}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ── ErrorText ────────────────────────────────────────────────────────────────
export function ErrorText({ message }: { message: string }) {
  if (!message) return null;
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorBannerText}>{message}</Text>
    </View>
  );
}

// ── SuccessBanner ────────────────────────────────────────────────────────────
export function SuccessBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <View style={styles.successBanner}>
      <Text style={styles.successBannerText}>{message}</Text>
    </View>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'success' | 'error' | 'info' | 'warning';
export function Badge({ label, variant = 'info' }: { label: string; variant?: BadgeVariant }) {
  return (
    <View style={[styles.badge, badgeColors[variant].bg]}>
      <Text style={[styles.badgeText, badgeColors[variant].text]}>{label}</Text>
    </View>
  );
}
const badgeColors: Record<BadgeVariant, { bg: ViewStyle; text: TextStyle }> = {
  success: { bg: { backgroundColor: '#E6F9F3' }, text: { color: C.success } },
  error:   { bg: { backgroundColor: '#FDEAEA' }, text: { color: C.error } },
  info:    { bg: { backgroundColor: '#EBF0FF' }, text: { color: C.cobalt } },
  warning: { bg: { backgroundColor: '#FEF6E4' }, text: { color: '#B45309' } },
};

// ── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  btn: {
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.55 },
  btnText: { fontSize: F.base, fontWeight: '700', letterSpacing: 0.2 },

  card: {
    backgroundColor: C.white, borderRadius: 20, padding: 20,
    shadowColor: '#1A2B6B', shadowOpacity: 0.08,
    shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },

  inputWrap: { marginBottom: 16 },
  inputLabel: { fontSize: F.sm, fontWeight: '600', color: C.navy, marginBottom: 7 },
  input: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: F.base,
    color: C.navy, backgroundColor: C.offWhite,
  },
  inputError: { borderColor: C.error },
  errorText: { fontSize: F.xs, color: C.error, marginTop: 4 },

  errorBanner: {
    backgroundColor: '#FDEAEA', borderRadius: 10, padding: 12, marginVertical: 8,
  },
  errorBannerText: { color: C.error, fontSize: F.sm, fontWeight: '600', textAlign: 'center' },

  successBanner: {
    backgroundColor: '#E6F9F3', borderRadius: 10, padding: 12, marginVertical: 8,
  },
  successBannerText: { color: C.success, fontSize: F.sm, fontWeight: '600', textAlign: 'center' },

  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: F.xs, fontWeight: '700' },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 16 },
});
