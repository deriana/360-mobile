import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Svg, { Path } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, EmptyState, Pill, PrimaryButton } from '../components/ui';
import QrPlaceholder from '../components/QrPlaceholder';
import { fonts, fontSize, radius, spacing, iconStrokeWidth } from '../theme';
import {
  CachedAssignmentLetter,
  getCachedAssignmentLetter,
  saveAssignmentLetterToCache,
} from '../utils/letterCache';

export default function AssignmentLetterScreen({ route, navigation }: any) {
  const witnessId = route?.params?.witnessId || 'SAKSI-001';
  const { witnesses, tps } = useApp();
  const { colors } = useTheme();

  const witness = witnesses.find((w) => w.id === witnessId);
  const [downloading, setDownloading] = useState(false);
  const [cachedData, setCachedData] = useState<CachedAssignmentLetter | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone?: 'success' | 'danger';
  }>({ visible: false, title: '', message: '' });

  if (!witness) {
    return <EmptyState title="Surat Tidak Ditemukan" body="Data penugasan ini tidak tersedia." icon="file-text" />;
  }

  const assignedTps = tps.find((t) => t.id === witness.assignedTpsId);
  const letterNo = `ST/${witness.id}/PAN/2026`;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const html = `
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="font-family: Helvetica, Arial, sans-serif; padding: 32px; color: #003366;">
            <div style="text-align:center; border-bottom: 2px solid #0066B3; padding-bottom: 16px; margin-bottom: 24px;">
              <h2 style="margin: 0; letter-spacing: 1px; color: #0066B3;">SURAT TUGAS DIGITAL SAKSI</h2>
              <p style="margin: 4px 0 0; color: #6B7280; font-size: 13px;">Partai Amanat Nasional — ${letterNo}</p>
            </div>
            <table style="width:100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding:6px 0; color:#64748B; width:180px;">Nama Saksi TPS</td><td style="padding:6px 0; font-weight:700;">${witness.name}</td></tr>
              <tr><td style="padding:6px 0; color:#64748B;">NIK Terdaftar</td><td style="padding:6px 0; font-weight:700;">${witness.nik}</td></tr>
              <tr><td style="padding:6px 0; color:#64748B;">Lokasi Penugasan TPS</td><td style="padding:6px 0; font-weight:700;">${witness.assignedTpsId}${assignedTps ? ` — TPS ${assignedTps.tpsNumber}, ${assignedTps.district}, ${assignedTps.regency}` : ''}</td></tr>
              <tr><td style="padding:6px 0; color:#64748B;">Wilayah Provinsi</td><td style="padding:6px 0; font-weight:700;">${assignedTps?.province ?? '-'}</td></tr>
              <tr><td style="padding:6px 0; color:#64748B;">Partai</td><td style="padding:6px 0; font-weight:700; color:#0066B3;">Partai Amanat Nasional (PAN)</td></tr>
            </table>
            <div style="margin-top: 32px; text-align:center;">
              <p style="font-size:12px; color:#64748B;">Kode Otentikasi Digital</p>
              <p style="font-weight:700;">${witness.id}-${letterNo.slice(-4)}</p>
            </div>
            <div style="margin-top: 40px; text-align:center;">
              <p style="font-size:12px; color:#64748B;">Tanda Tangan Digital Pimpinan</p>
              <p style="font-style: italic; margin: 20px 0 4px; font-size: 20px;">Ketua DPP PAN</p>
              <p style="font-weight:700; font-size:13px;">Ketua DPP — Partai Amanat Nasional</p>
            </div>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Simpan Surat Tugas PDF' });
      } else {
        setDialogConfig({
          visible: true,
          title: 'PDF Dibuat',
          message: `File tersimpan sementara di: ${uri}`,
          tone: 'success',
        });
      }
    } catch (err) {
      setDialogConfig({
        visible: true,
        title: 'Gagal Membuat PDF',
        message: 'Terjadi kesalahan saat membuat dokumen PDF. Silakan coba lagi.',
        tone: 'danger',
      });
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    async function initOfflineCache() {
      if (!witness) return;
      const existing = await getCachedAssignmentLetter(witness.id);
      if (existing) {
        setCachedData(existing);
        setIsCached(true);
      } else {
        const token = `MNDT-PAN-${witness.id}-${Date.now().toString(36).toUpperCase()}`;
        const snapshot: CachedAssignmentLetter = {
          witnessId: witness.id,
          letterNo,
          witnessName: witness.name,
          nik: witness.nik,
          assignedTpsId: witness.assignedTpsId,
          tpsInfo: assignedTps ? `TPS ${assignedTps.tpsNumber}, ${assignedTps.district}, ${assignedTps.regency}` : '-',
          province: assignedTps?.province ?? 'Jawa Barat',
          verificationToken: token,
          verifyUrl: `https://saksi360.pan.or.id/verify/${token}`,
          digitalSealHash: `SHA256:${witness.id}:${witness.nik.slice(-4)}:DPP-PAN`,
          cachedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          isOfflineReady: true,
        };
        await saveAssignmentLetterToCache(snapshot);
        setCachedData(snapshot);
        setIsCached(true);
      }
    }
    initOfflineCache();
  }, [witness?.id]);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Card style={{ gap: spacing.sm }}>
        <View style={styles.headerBlock}>
          <Text style={[styles.docTitle, { color: colors.text }]}>SURAT TUGAS DIGITAL SAKSI</Text>
          <Text style={[styles.docSubtitle, { color: colors.textMuted }]}>{letterNo}</Text>
          <View style={{ marginTop: 6 }}>
            <Pill
              label={isCached ? `Tersimpan Offline (${cachedData?.cachedAt})` : 'Sinkronisasi Surat...'}
              tone="success"
              icon="check-circle"
            />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Field label="Nama Saksi TPS" value={witness.name} />
        <Field label="NIK Terdaftar" value={witness.nik} />
        <Field
          label="Lokasi Penugasan TPS"
          value={`${witness.assignedTpsId}${assignedTps ? ` — TPS ${assignedTps.tpsNumber}, ${assignedTps.district}, ${assignedTps.regency}` : ''}`}
        />
        <Field label="Wilayah Provinsi" value={assignedTps?.province ?? '-'} />

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.qrRow}>
          <QrPlaceholder seed={cachedData?.verificationToken ?? witness.id} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.qrLabel, { color: colors.textMuted }]}>Kode Otentikasi Digital</Text>
            <Text style={[styles.qrCode, { color: colors.text }]} numberOfLines={1}>
              {cachedData?.verificationToken ?? `${witness.id}-${letterNo.slice(-4)}`}
            </Text>
            <Text style={{ fontSize: 9, color: colors.textMuted }} numberOfLines={1}>
              {cachedData?.verifyUrl ?? `https://saksi360.pan.or.id/verify/${witness.id}`}
            </Text>
            <Pill label="Terverifikasi Resmi" tone="success" icon="check-circle" />
          </View>
        </View>

        <View style={styles.signatureBlock}>
          <Text style={[styles.qrLabel, { color: colors.textMuted }]}>Tanda Tangan Digital Pimpinan</Text>
          <Svg width={160} height={50}>
            <Path
              d="M5 35 Q 25 5, 45 30 T 85 15 T 125 35 T 155 18"
              stroke={colors.primary}
              strokeWidth={2.5}
              fill="none"
            />
          </Svg>
          <Text style={[styles.signName, { color: colors.text }]}>Ketua DPP — Partai Amanat Nasional</Text>
        </View>
      </Card>

      <View style={{ gap: spacing.sm }}>
        <PrimaryButton label="Unduh PDF Surat Tugas" icon="download" onPress={handleDownload} loading={downloading} />
        <PrimaryButton
          label="Verifikasi Keaslian Surat"
          icon="shield"
          variant="secondary"
          onPress={() =>
            navigation.navigate('VerifyLetter', {
              witnessId: witness.id,
              token: cachedData?.verificationToken,
            })
          }
        />
      </View>

      <ConfirmDialog
        visible={dialogConfig.visible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        tone={dialogConfig.tone}
        singleButton
        onConfirm={() => setDialogConfig((prev) => ({ ...prev, visible: false }))}
      />
    </ScrollView>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.fieldValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  headerBlock: { alignItems: 'center', gap: 2 },
  docTitle: { fontFamily: fonts.bold, fontSize: fontSize.md, textAlign: 'center', letterSpacing: 0.5 },
  docSubtitle: { fontFamily: fonts.regular, fontSize: fontSize.xs, textAlign: 'center' },
  divider: { height: 1, marginVertical: spacing.xs },
  field: { marginVertical: 2 },
  fieldLabel: { fontFamily: fonts.medium, fontSize: fontSize.xs },
  fieldValue: { fontFamily: fonts.bold, fontSize: fontSize.sm, marginTop: 2 },
  qrRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  qrLabel: { fontFamily: fonts.medium, fontSize: fontSize.xs },
  qrCode: { fontFamily: fonts.bold, fontSize: fontSize.sm },
  signatureBlock: { marginTop: spacing.md, alignItems: 'center', gap: 2 },
  signName: { fontFamily: fonts.bold, fontSize: fontSize.xs },
});

