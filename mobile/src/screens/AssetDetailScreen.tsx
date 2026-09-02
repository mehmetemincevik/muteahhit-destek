import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  createRentalPaymentRequest,
  createTransactionRequest,
  createValueSnapshotRequest,
  fetchAssetDetail,
} from '../api/assets';
import { AssetDetail, AssetTransactionType, TransactionDirection } from '../types/asset';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { DateField } from '../components/DateField';
import { colors, spacing, typeScale, fonts, radius } from '../theme/tokens';
import { formatCurrency, formatDate, parseAmount } from '../utils/format';

const TRANSACTION_LABELS: Record<AssetTransactionType, string> = {
  unit_sale_payment: 'Daire tahsilatı',
  rental_income: 'Kira geliri',
  manual_addition: 'Giriş',
  manual_deduction: 'Çıkış',
  cost_payment: 'Maliyet ödemesi',
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Açık form türü. Aynı anda yalnızca biri görünür.
type OpenForm = 'none' | 'transaction' | 'valuation' | 'rentPayment';

export default function AssetDetailScreen({ route, navigation }: any) {
  const { assetId } = route.params;
  const [detail, setDetail] = useState<AssetDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openForm, setOpenForm] = useState<OpenForm>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [amount, setAmount] = useState('');
  const [entryDate, setEntryDate] = useState(todayISO());
  const [description, setDescription] = useState('');
  const [direction, setDirection] = useState<TransactionDirection>('manual_addition');
  const [activeRentalId, setActiveRentalId] = useState<string | null>(null);

  async function load() {
    try {
      const data = await fetchAssetDetail(assetId);
      setDetail(data);
    } catch (error) {
      Alert.alert('Hata', 'Varlık bilgileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [assetId]),
  );

  function resetForm() {
    setAmount('');
    setEntryDate(todayISO());
    setDescription('');
    setOpenForm('none');
    setActiveRentalId(null);
  }

  function validateInput(): number | null {
    const parsed = parseAmount(amount);
    if (parsed == null || parsed <= 0) {
      Alert.alert('Geçersiz tutar', 'Sıfırdan büyük bir tutar girin');
      return null;
    }
    if (!entryDate) {
      Alert.alert('Eksik bilgi', 'Tarih seçin');
      return null;
    }
    return parsed;
  }

  async function submitForm() {
    const parsed = validateInput();
    if (parsed == null) return;

    setIsSubmitting(true);
    try {
      if (openForm === 'transaction') {
        await createTransactionRequest(assetId, {
          direction,
          amount: parsed,
          transactionDate: entryDate,
          description: description || undefined,
        });
      } else if (openForm === 'valuation') {
        await createValueSnapshotRequest(assetId, {
          estimatedValue: parsed,
          snapshotDate: entryDate,
          source: 'manual',
        });
      } else if (openForm === 'rentPayment' && activeRentalId) {
        await createRentalPaymentRequest(activeRentalId, {
          amount: parsed,
          paymentDate: entryDate,
          note: description || undefined,
        });
      }
      resetForm();
      await load();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'İşlem kaydedilemedi';
      Alert.alert('Hata', Array.isArray(message) ? message.join('\n') : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !detail) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  const { asset, transactions, rentals, snapshots } = detail;
  const isRealEstate = asset.assetType === 'real_estate';
  const activeRental = rentals.find((r) => r.isActive);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typeScale.label}>
        {isRealEstate ? 'GAYRİMENKUL' : asset.assetType === 'cash' ? 'NAKİT' : 'VARLIK'}
      </Text>
      <Text style={[typeScale.display, styles.title]}>{asset.name}</Text>

      <View style={styles.valueCard}>
        <Text style={styles.currentValue}>{formatCurrency(asset.currentValue)}</Text>
        <Text style={typeScale.label}>
          {isRealEstate ? 'SON DEĞERLEME' : 'GÜNCEL BAKİYE'}
        </Text>
        {asset.valueUpdatedAt && (
          <Text style={styles.updatedAt}>
            Güncelleme: {formatDate(asset.valueUpdatedAt.slice(0, 10))}
          </Text>
        )}
      </View>

      {isRealEstate && (asset.province || asset.roomLayout || asset.areaM2) && (
        <Text style={[typeScale.bodyMuted, styles.meta]}>
          {[
            [asset.district, asset.province].filter(Boolean).join(', '),
            asset.roomLayout,
            asset.areaM2 ? `${parseFloat(asset.areaM2)} m²` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      )}

      {/* Eylem düğmeleri varlık tipine göre değişir: nakit ve emtiada bakiye
          hareketlerden oluşur, gayrimenkulde değerleme kaydından gelir. */}
      {openForm === 'none' && (
        <View style={styles.actions}>
          {isRealEstate ? (
            <>
              <Button label="+ Değerleme Ekle" onPress={() => setOpenForm('valuation')} />
              {activeRental ? (
                <Button
                  label="+ Kira Tahsilatı"
                  variant="ghost"
                  onPress={() => {
                    setActiveRentalId(activeRental.id);
                    setOpenForm('rentPayment');
                  }}
                  style={{ marginTop: spacing.sm }}
                />
              ) : (
                <Button
                  label="+ Kira Sözleşmesi"
                  variant="ghost"
                  onPress={() => navigation.navigate('CreateRental', { assetId, assetName: asset.name })}
                  style={{ marginTop: spacing.sm }}
                />
              )}
            </>
          ) : (
            <Button label="+ Hareket Ekle" onPress={() => setOpenForm('transaction')} />
          )}
        </View>
      )}

      {openForm !== 'none' && (
        <View style={styles.form}>
          <Text style={[typeScale.label, { marginBottom: spacing.md }]}>
            {openForm === 'transaction'
              ? 'YENİ HAREKET'
              : openForm === 'valuation'
                ? 'YENİ DEĞERLEME'
                : 'KİRA TAHSİLATI'}
          </Text>

          {openForm === 'transaction' && (
            <View style={styles.directionRow}>
              <TouchableOpacity
                style={[
                  styles.directionOption,
                  direction === 'manual_addition' && styles.directionInActive,
                ]}
                onPress={() => setDirection('manual_addition')}
              >
                <Text
                  style={
                    direction === 'manual_addition' ? styles.directionTextActive : styles.directionText
                  }
                >
                  Giriş
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.directionOption,
                  direction === 'manual_deduction' && styles.directionOutActive,
                ]}
                onPress={() => setDirection('manual_deduction')}
              >
                <Text
                  style={
                    direction === 'manual_deduction' ? styles.directionTextActive : styles.directionText
                  }
                >
                  Çıkış
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TextField
            label={openForm === 'valuation' ? 'Değer (TL) *' : 'Tutar (TL) *'}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="örn. 50000"
          />
          <DateField label="Tarih *" value={entryDate} onChange={setEntryDate} />
          {openForm !== 'valuation' && (
            <TextField
              label="Açıklama"
              value={description}
              onChangeText={setDescription}
              placeholder="opsiyonel"
            />
          )}

          <Button label="Kaydet" onPress={submitForm} isLoading={isSubmitting} />
          <Button label="Vazgeç" variant="ghost" onPress={resetForm} style={{ marginTop: spacing.sm }} />
        </View>
      )}

      {activeRental && (
        <View style={styles.rentalCard}>
          <Text style={typeScale.label}>AKTİF KİRA SÖZLEŞMESİ</Text>
          <Text style={styles.rentAmount}>{formatCurrency(activeRental.monthlyRent)} / ay</Text>
          <Text style={typeScale.bodyMuted}>
            {activeRental.tenantName || 'Kiracı adı girilmemiş'}
            {activeRental.tenantPhone ? ` · ${activeRental.tenantPhone}` : ''}
          </Text>
        </View>
      )}

      {isRealEstate && snapshots.length > 0 && (
        <>
          <SectionTitle label="DEĞERLEME GEÇMİŞİ" />
          {snapshots.map((snapshot) => (
            <View key={snapshot.id} style={styles.listRow}>
              <Text style={typeScale.bodyMuted}>{formatDate(snapshot.snapshotDate)}</Text>
              <Text style={styles.listValue}>{formatCurrency(snapshot.estimatedValue)}</Text>
            </View>
          ))}
        </>
      )}

      {transactions.length > 0 && (
        <>
          <SectionTitle label="HAREKETLER" />
          {transactions.map((tx) => {
            const value = parseFloat(tx.amount);
            const isInflow = value >= 0;
            return (
              <View key={tx.id} style={styles.listRow}>
                <View style={styles.txLeft}>
                  <Text style={typeScale.body}>{TRANSACTION_LABELS[tx.transactionType]}</Text>
                  <Text style={typeScale.bodyMuted}>
                    {formatDate(tx.transactionDate)}
                    {tx.description ? ` · ${tx.description}` : ''}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.listValue,
                    { color: isInflow ? colors.statusAvailable : colors.danger },
                  ]}
                >
                  {isInflow ? '+' : '−'}
                  {formatCurrency(Math.abs(value))}
                </Text>
              </View>
            );
          })}
        </>
      )}

      {transactions.length === 0 && snapshots.length === 0 && (
        <Text style={[typeScale.bodyMuted, { marginTop: spacing.xl }]}>
          Henüz kayıt yok.
        </Text>
      )}
    </ScrollView>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={typeScale.label}>{label}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.paper,
  },
  container: { flexGrow: 1, backgroundColor: colors.paper, padding: spacing.lg, paddingTop: 60 },
  title: { marginBottom: spacing.md },
  valueCard: {
    backgroundColor: colors.paperElevated,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  currentValue: { fontFamily: fonts.display, fontSize: 28, color: colors.ink },
  updatedAt: { ...typeScale.bodyMuted, fontSize: 12, marginTop: spacing.xs },
  meta: { marginBottom: spacing.md },
  actions: { marginBottom: spacing.lg },
  form: {
    backgroundColor: colors.paperElevated,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  directionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  directionOption: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  directionInActive: { borderColor: colors.statusAvailable, backgroundColor: colors.statusAvailable },
  directionOutActive: { borderColor: colors.danger, backgroundColor: colors.danger },
  directionText: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.ink },
  directionTextActive: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.paper },
  rentalCard: {
    backgroundColor: colors.paperElevated,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: 2,
  },
  rentAmount: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.ink, marginTop: 2 },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.hairline },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    gap: spacing.md,
  },
  txLeft: { flex: 1, gap: 2 },
  listValue: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.ink },
});
