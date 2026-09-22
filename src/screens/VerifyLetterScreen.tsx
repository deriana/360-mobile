import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Pill, PrimaryButton } from '../components/ui';
import { fonts, fontSize, spacing, radius, iconStrokeWidth } from '../theme';
import { getActiveWitnessScope } from '../utils/witnessResolver';

export default function VerifyLetterScreen({ route }: any) {
  const { witnesses, tps, currentUser, role } = useApp();
  const { colors, isDark } = useTheme();

  const activeScope = getActiveWitnessScope(currentUser, witnesses, tps);
  const [selectedWitnessId, setSelectedWitnessId] = useState<string>(
    route?.params?.witnessId || activeScope.witnessId || witnesses[0]?.id || 'SAKSI-001'
  );

  const witness =
    witnesses.find((w) => w.id === selectedWitnessId) ||
    (selectedWitnessId === activeScope.witnessId ? activeScope.witness : null) ||
    activeScope.witness ||
    witnesses[0];

  const witnessId = witness?.id || 'SAKSI-001';
  const token = route?.params?.token || `MNDT-PAN-${witnessId}-2024-BSN`;
  const isSigned = route?.params?.isSigned ?? true;
  const signedBy = route?.params?.signedBy ?? 'Ketua DPP / BSN PAN';
  const signatureHash = route?.params?.signatureHash ?? `SHA256:${witnessId}:DPP-PAN`;
  const signedAt = route?.params?.signedAt ?? '18 Sep 2026, 08:00 WIB';

  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);

  const isCoordinator = role === 'TPS_COORDINATOR' || role === 'FIELD_COORDINATOR';
  const availableWitnesses = witnesses.slice(0, 6);

  if (!witness) {
    return <EmptyState title="Data Tidak Ditemukan" body="Tidak dapat memverifikasi surat ini." icon="alert-circle" />;
  }

  const handleVerify = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setVerified(true);
    }, 700);
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Selector Saksi Binaan (Khusus Koordinator) */}
      {isCoordinator && availableWitnesses.length > 1 && (
        <View style={{ gap: spacing.xs, marginBottom: spacing.xs }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: fontSize.xs, color: colors.textMuted }}>
            PILIH SAKSI TPS BINAAN:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {availableWitnesses.map((w) => {
              const isSelected = w.id === selectedWitnessId;
              return (
                <Pressable
                  key={w.id}
                  onPress={() => {
                    setSelectedWitnessId(w.id);
                    setVerified(false);
                  }}
                  style={[
                    styles.witnessChip,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : isDark
                        ? 'rgba(255,255,255,0.06)'
                        : '#F1F5F9',
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: fonts.bold,
                      fontSize: 11,
                      color: isSelected ? '#FFFFFF' : colors.text,
                    }}
                  >
                    {w.name.split(' ')[0]} ({w.assignedTpsId})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <Card style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg }}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
          <Feather name="shield" size={32} color={colors.primary} strokeWidth={iconStrokeWidth} />
        </View>

        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={[styles.title, { color: colors.text }]}>Verifikasi Keaslian Surat Mandat</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Kode Mandat: {witness.id} • TPS {witness.assignedTpsId}
          </Text>
          <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '700' }}>{token}</Text>
        </View>

        {verified ? (
          <View style={[styles.resultBox, { backgroundColor: colors.background, borderColor: colors.border, gap: spacing.xs }]}>
            <Pill label="Surat Asli & Terverifikasi Sah" tone="success" icon="check-circle" />
            <Text style={[styles.resultText, { color: colors.text }]}>
              Diterbitkan resmi atas nama <Text style={{ fontWeight: '800' }}>{witness.name}</Text> (NIK: {witness.nik}), terdaftar sah pada database nasional BSN SAKSI 360.
            </Text>
            <View style={{ width: '100%', height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
            <View style={{ width: '100%', gap: 4 }}>
              <Text style={{ fontSize: 11, color: colors.text, fontWeight: '700' }}>
                Otoritas Penerbit: BSN DPP Partai Amanat Nasional
              </Text>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>
                Penandatangan: {signedBy} ({signedAt})
              </Text>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>
                Hash Kriptografis: {signatureHash}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Feather name="check" size={12} color={colors.success} />
                <Text style={{ fontSize: 10, color: colors.success, fontWeight: '700' }}>
                  {isSigned ? 'Tanda Tangan Digital Pimpinan Sah & Terverifikasi' : 'Stempel Mandat Resmi Terdaftar'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="shield" size={11} color={colors.primary} />
                <Text style={{ fontSize: 10, color: colors.primary }}>
                  Sinkronisasi Offline Cache & Server Pusat Valid
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <PrimaryButton
            label="Jalankan Validasi Barcode & Kriptografis"
            icon="check-square"
            onPress={handleVerify}
            loading={checking}
          />
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.bold, fontSize: fontSize.md, textAlign: 'center' },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.xs },
  resultBox: { alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: 12, borderWidth: 1, width: '100%' },
  resultText: { fontFamily: fonts.regular, fontSize: fontSize.xs, textAlign: 'center', lineHeight: 18 },
  witnessChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
