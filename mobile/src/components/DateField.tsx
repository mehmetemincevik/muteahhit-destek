import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typeScale, radius, fonts } from '../theme/tokens';

interface DateFieldProps {
  label: string;
  // Backend'in beklediği biçim: YYYY-MM-DD. Boş dize seçim yapılmadığını gösterir.
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  // Zorunlu olmayan alanlarda seçimi temizleme imkânı verir.
  clearable?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

// Yerel saat diliminde YYYY-MM-DD üretir. toISOString() UTC'ye çevirdiği için
// gece yarısına yakın saatlerde bir gün kayması oluşturabiliyor.
function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISODate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date();
  // Ay değeri 0 tabanlı; ayrıca bileşenlerden kurmak, dize ayrıştırmasındaki
  // saat dilimi belirsizliğini önlüyor.
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

// Ekranda gösterilen biçim: 15.03.2026
function toDisplay(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return '';
  return `${match[3]}.${match[2]}.${match[1]}`;
}

export function DateField({
  label,
  value,
  onChange,
  placeholder = 'Tarih seçin',
  clearable,
  minimumDate,
  maximumDate,
}: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  // iOS'ta seçim onaylanana kadar geçici tutulur; Android'de sistem diyaloğu
  // kendi onayını yönettiği için doğrudan uygulanır.
  const [draft, setDraft] = useState<Date>(() => parseISODate(value));

  function open() {
    setDraft(parseISODate(value));
    setIsOpen(true);
  }

  function handleAndroidChange(event: any, selected?: Date) {
    setIsOpen(false);
    if (event.type === 'set' && selected) {
      onChange(toISODate(selected));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={typeScale.label}>{label}</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.field} onPress={open} activeOpacity={0.7}>
          <Text style={value ? styles.valueText : styles.placeholderText}>
            {value ? toDisplay(value) : placeholder}
          </Text>
        </TouchableOpacity>

        {clearable && value ? (
          <TouchableOpacity onPress={() => onChange('')} style={styles.clearButton}>
            <Text style={styles.clearText}>TEMİZLE</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {isOpen && Platform.OS === 'android' && (
        <DateTimePicker
          value={draft}
          mode="date"
          display="default"
          onChange={handleAndroidChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={isOpen} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <DateTimePicker
                value={draft}
                mode="date"
                display="spinner"
                locale="tr-TR"
                onChange={(_, selected) => selected && setDraft(selected)}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.modalButton}>
                  <Text style={styles.modalCancel}>Vazgeç</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    onChange(toISODate(draft));
                    setIsOpen(false);
                  }}
                  style={[styles.modalButton, styles.modalConfirm]}
                >
                  <Text style={styles.modalConfirmText}>Seç</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  field: {
    flex: 1,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.hairline,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  valueText: { fontSize: 16, color: colors.ink },
  placeholderText: { fontSize: 16, color: colors.inkMuted },
  clearButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.xs },
  clearText: { fontFamily: fonts.label, fontSize: 10, color: colors.inkMuted, letterSpacing: 0.6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(26,35,50,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    paddingBottom: spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  modalButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.hairline,
  },
  modalConfirm: { backgroundColor: colors.accent, borderColor: colors.accent },
  modalCancel: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.ink },
  modalConfirmText: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.accentInk },
});
