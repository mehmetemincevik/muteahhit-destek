import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme/tokens';

interface BadgeProps {
  count: number;
  // 'accent' bekleyen işi, 'danger' gecikmiş/acil durumu gösterir.
  tone?: 'accent' | 'danger';
}

// Sıfır değerinde hiçbir şey çizilmez; boş rozet göstermek dikkat dağıtıyor.
// 99 üzeri sayılar kısaltılır, hücre genişliğini taşırmamak için.
export function Badge({ count, tone = 'accent' }: BadgeProps) {
  if (count <= 0) return null;

  const isDanger = tone === 'danger';
  return (
    <View style={[styles.badge, isDanger ? styles.danger : styles.accent]}>
      <Text style={[styles.text, isDanger ? styles.dangerText : styles.accentText]}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accent: { backgroundColor: colors.accent },
  danger: { backgroundColor: colors.danger },
  text: { fontFamily: fonts.label, fontSize: 10, letterSpacing: 0 },
  accentText: { color: colors.accentInk },
  dangerText: { color: colors.paper },
});
