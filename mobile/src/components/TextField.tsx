import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, spacing, typeScale } from '../theme/tokens';

interface TextFieldProps extends TextInputProps {
  label: string;
}

// Ağır, dolgun kutu yerine İNCE ALT ÇİZGİ kullanıyoruz -- teknik bir form/ölçüm belgesi
// hissi veriyor, jenerik "her input kalın gri kutu" görünümünden ayrışıyor.
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
