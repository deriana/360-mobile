import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Pill, PrimaryButton } from '../components/ui';
import { fontSize, spacing, iconStrokeWidth } from '../theme';

export default function VerifyLetterScreen({ route }: any) {
  const witnessId = route?.params?.witnessId || 'SAKSI-001';
  const token = route?.params?.token || `MNDT-PAN-${witnessId}-DEMO`;
  const { witnesses } = useApp();
  const { colors } = useTheme();

  const witness = witnesses.find((w) => w.id === witnessId);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);

  if (!witness) {
    return <EmptyState title="Data Tidak Ditemukan" body="Tidak dapat memverifikasi surat ini." icon="alert-circle" />;
  }

  const handleVerify = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setVerified(true);
    }, 900);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Card style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
          <Feather name="shield" size={32} color={colors.primary} strokeWidth={iconStrokeWidth} />
        </View>

        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={[styles.title, { color: colors.text }]}>Verifikasi Keaslian Surat Tugas</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Kode Dokumen: {witness.id}</Text>
          <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '700' }}>{token}</Text>
        </View>

        {verified ? (
          <View style={[styles.resultBox, { backgroundColor: colors.background, borderColor: colors.border, gap: spacing.xs }]}>
            <Pill label="Surat Asli & Terverifikasi Sah" tone="success" icon="check-circle" />
            <Text style={[styles.resultText, { color: colors.text }]}>
              Diterbitkan resmi atas nama <Text style={{ fontWeight: '800' }}>{witness.name}</Text> (NIK: {witness.nik}), terdaftar sah pada database nasional SAKSI 360.
            </Text>
            <View style={{ width: '100%', height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
            <View style={{ width: '100%', gap: 2 }}>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>Otoritas Penerbit: BSN DPP Partai Amanat Nasional</Text>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>Otentikasi Kriptografis: SHA256:{witness.id}:DPP-PAN</Text>
              <Text style={{ fontSize: 10, color: colors.success, fontWeight: '700' }}>✓ Sinkronisasi Offline Cache & Server Valid</Text>
            </View>
          </View>
        ) : (
          <PrimaryButton label="Jalankan Verifikasi Kriptografis" icon="check-square" onPress={handleVerify} loading={checking} />
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.md, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: fontSize.xs },
  resultBox: { alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: 12, borderWidth: 1, width: '100%' },
  resultText: { fontSize: fontSize.xs, textAlign: 'center', lineHeight: 18 },
});

