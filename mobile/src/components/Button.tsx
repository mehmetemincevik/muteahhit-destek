import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { colors, radius, spacing, fonts } from '../theme/tokens';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

// Bilerek KÖŞELERİ AZ YUVARLAK (radius.sm = 4) -- jenerik "her buton hap şeklinde" görünümünden
// kaçınmak için. 'primary' amber dolgu (ana aksiyon), 'ghost' sadece ince çerçeve (ikincil aksiyon).
export function Button({ label, onPress, variant = 'primary', isLoading, disabled, style }: ButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      style={[styles.base, isPrimary ? styles.primary : styles.ghost, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.75}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? colors.accentInk : colors.ink} />
      ) : (
        <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelGhost]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.accent },
  ghost: { borderWidth: 1.5, borderColor: colors.ink, backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  label: { fontFamily: fonts.displayMedium, fontSize: 15 },
  labelPrimary: { color: colors.accentInk },
  labelGhost: { color: colors.ink },
});
