import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, spacing, typeScale } from '../theme/tokens';

interface TextFieldProps extends TextInputProps {
  label: string;
}

// Alt çizgili giriş alanı. Etiket üstte, sabit görünür (placeholder etiket yerine geçmez).
export function TextField({ label, style, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={typeScale.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.inkMuted}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  input: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.hairline,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.ink,
    marginTop: spacing.xs,
  },
});
