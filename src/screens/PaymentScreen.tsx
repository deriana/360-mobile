import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, Modal, Pill, PrimaryButton } from '../components/ui';
import { fonts, fontSize, radius, spacing, iconStrokeWidth } from '../theme';
import { CURRENT_WITNESS_ID } from '../utils/scope';
import { getActiveWitnessScope } from '../utils/witnessResolver';

export default function PaymentScreen() {
  const { payments, currentUser, witnesses, tps } = useApp();
  const { colors } = useTheme();
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const activeScope = getActiveWitnessScope(currentUser, witnesses, tps);
  const myPayment = payments.find((p) => p.witnessId === activeScope.witnessId) || {
    witnessId: activeScope.witnessId,
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
  statusLabelText: { fontFamily: fonts.semiBold, fontSize: 11 },
  statusTitle: { fontFamily: fonts.bold, fontSize: fontSize.sm },
  divider: { height: 1, width: '100%', marginVertical: spacing.xs },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  detailLabel: { fontFamily: fonts.medium, fontSize: fontSize.xs },
  detailValue: { fontFamily: fonts.bold, fontSize: fontSize.xs },
  invoiceMetaBox: { borderWidth: 1, borderRadius: radius.md, padding: spacing.sm, gap: spacing.sm },
  invoiceMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  invoiceMetaLabel: { fontFamily: fonts.medium, fontSize: fontSize.xs, width: 110 },
  invoiceMetaValue: { fontFamily: fonts.bold, fontSize: fontSize.xs, flex: 1 },
  invoiceSectionLabel: { fontFamily: fonts.bold, fontSize: fontSize.xs, marginTop: spacing.xs },
  invoiceItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5 },
  invoiceItemLabel: { fontFamily: fonts.regular, fontSize: fontSize.xs },
  invoiceItemAmount: { fontFamily: fonts.bold, fontSize: fontSize.xs },
  invoiceTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm, borderTopWidth: 1 },
  invoiceTotalLabel: { fontFamily: fonts.bold, fontSize: fontSize.sm },
  invoiceTotalAmount: { fontFamily: fonts.extraBold, fontSize: fontSize.md },
});
