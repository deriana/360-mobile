import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, Modal, Pill, PrimaryButton } from '../components/ui';
import { fontSize, radius, spacing, iconStrokeWidth } from '../theme';
import { CURRENT_WITNESS_ID } from '../utils/scope';

export default function PaymentScreen() {
  const { payments } = useApp();
  const { colors } = useTheme();
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const myPayment = payments.find((p) => p.witnessId === CURRENT_WITNESS_ID) || {
    witnessId: CURRENT_WITNESS_ID,
    amount: 350000,
    status: 'paid' as const,
    proofRef: 'TRX-82910482',
  };

  const isPaid = myPayment.status === 'paid';

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Card style={{ gap: spacing.md }}>
        <View style={styles.statusRow}>
          <View style={[styles.iconWrap, { backgroundColor: isPaid ? colors.successBg : colors.warningBg }]}>
            <Feather
              name={isPaid ? 'check-circle' : 'clock'}
              size={24}
              color={isPaid ? colors.success : colors.warning}
              strokeWidth={iconStrokeWidth}
            />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.statusLabelText, { color: colors.textMuted }]}>Status Pembayaran</Text>
            <Text style={[styles.statusTitle, { color: isPaid ? colors.success : colors.warning }]}>
              {isPaid ? 'Sudah Dibayar (Lunas)' : 'Belum Dibayar (Proses Processing)'}
            </Text>
          </View>
          <Pill label={isPaid ? 'Terbayar' : 'Belum'} tone={isPaid ? 'success' : 'warning'} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Jumlah Honorarium</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            Rp {myPayment.amount.toLocaleString('id-ID')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Referensi Transfer</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {myPayment.proofRef || 'Dalam Antrean Transfer'}
          </Text>
        </View>

        {isPaid ? (
          <PrimaryButton
            label="Lihat Invoice & Rincian Pembayaran"
            icon="file-text"
            variant="secondary"
            onPress={() => setInvoiceOpen(true)}
            style={{ marginTop: spacing.xs }}
          />
        ) : (
          <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.xs }}>
            Honorarium akan ditransfer setelah rekapitulasi kluster selesai diverifikasi koordinator.
          </Text>
        )}
      </Card>

      <Modal
        visible={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        title="Invoice Pembayaran"
        subtitle={myPayment.proofRef ?? undefined}
      >
        <View style={{ gap: spacing.sm }}>
          <View style={[styles.invoiceMetaBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <InvoiceMetaRow icon="calendar" label="Tanggal Dibayar" value={myPayment.paidAt ?? '-'} />
            <InvoiceMetaRow icon="credit-card" label="Metode Pembayaran" value={myPayment.method ?? '-'} />
            <InvoiceMetaRow icon="hash" label="No. Rekening Tujuan" value={myPayment.accountMasked ?? '-'} />
          </View>

          <Text style={[styles.invoiceSectionLabel, { color: colors.textMuted }]}>Rincian Komponen</Text>
          <View style={{ gap: 2 }}>
            {(myPayment.invoiceItems ?? []).map((item) => (
              <View key={item.label} style={[styles.invoiceItemRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.invoiceItemLabel, { color: colors.text }]}>{item.label}</Text>
                <Text style={[styles.invoiceItemAmount, { color: item.amount < 0 ? colors.danger : colors.text }]}>
                  {item.amount < 0 ? '-' : ''}Rp {Math.abs(item.amount).toLocaleString('id-ID')}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.invoiceTotalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.invoiceTotalLabel, { color: colors.text }]}>Total Diterima</Text>
            <Text style={[styles.invoiceTotalAmount, { color: colors.success }]}>
              Rp {myPayment.amount.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function InvoiceMetaRow({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.invoiceMetaRow}>
      <Feather name={icon} size={14} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
      <Text style={[styles.invoiceMetaLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.invoiceMetaValue, { color: colors.text }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statusLabelText: { fontSize: 11, fontWeight: '600' },
  statusTitle: { fontSize: fontSize.sm, fontWeight: '800' },
  divider: { height: 1, width: '100%', marginVertical: spacing.xs },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  detailLabel: { fontSize: fontSize.xs },
  detailValue: { fontSize: fontSize.xs, fontWeight: '800' },
  invoiceMetaBox: { borderWidth: 1, borderRadius: radius.md, padding: spacing.sm, gap: spacing.sm },
  invoiceMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  invoiceMetaLabel: { fontSize: fontSize.xs, width: 110 },
  invoiceMetaValue: { fontSize: fontSize.xs, fontWeight: '700', flex: 1 },
  invoiceSectionLabel: { fontSize: fontSize.xs, fontWeight: '700', marginTop: spacing.xs },
  invoiceItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5 },
  invoiceItemLabel: { fontSize: fontSize.xs },
  invoiceItemAmount: { fontSize: fontSize.xs, fontWeight: '700' },
  invoiceTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm, borderTopWidth: 1 },
  invoiceTotalLabel: { fontSize: fontSize.sm, fontWeight: '800' },
  invoiceTotalAmount: { fontSize: fontSize.md, fontWeight: '800' },
});
