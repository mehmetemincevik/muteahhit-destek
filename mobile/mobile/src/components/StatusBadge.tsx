import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme/tokens';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  available: { label: 'Boşta', color: colors.statusAvailable },
  sold: { label: 'Satıldı', color: colors.statusSold },
  given_to_land_owner: { label: 'Arsa Sahibine Verildi', color: colors.statusGiven },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: colors.inkMuted };
  return (
    <View style={[styles.badge, { borderColor: config.color }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

export function statusColor(status: string): string {
  return STATUS_CONFIG[status]?.color ?? colors.inkMuted;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.6 },
});
