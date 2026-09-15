import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, Modal, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fontSize, radius, shadow, spacing } from '../theme';
import { BRAND_ASSETS, getWitnessAvatar } from '../data/images';
import { CURRENT_KADER_KTA } from '../data/simpan';
import QrPlaceholder from '../components/QrPlaceholder';

export default function SimpanKtaScreen() {
  const { colors } = useTheme();
  const kta = CURRENT_KADER_KTA;
  const [downloading, setDownloading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [downloadSuccessVisible, setDownloadSuccessVisible] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccessVisible(true);
    }, 1200);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.topStatusRow}>
        <Pill label="Status: Kader Aktif Terverifikasi" tone="success" icon="check-circle" />
        <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' }}>SIPOL KPU Terdaftar</Text>
      </View>

      {/* Physical-style Digital Membership Card (Visual Primary Asset) */}
      <View style={[styles.cardContainer, { backgroundColor: '#004F8A', borderColor: '#0066B3' }]}>
        {/* Top Header of the Card */}
        <View style={styles.cardHeader}>
          <Image source={BRAND_ASSETS.official} style={{ width: 44, height: 44 }} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={styles.ktaOrgTitle}>PARTAI AMANAT NASIONAL</Text>
            <Text style={styles.ktaSubTitle}>KARTU TANDA ANGGOTA ELEKTRONIK (e-KTA)</Text>
          </View>
          <View style={styles.chipSimpan}>
            <Text style={styles.chipText}>simPAN</Text>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          <View style={styles.photoContainer}>
            <Image source={getWitnessAvatar(1)} style={styles.memberPhoto} />
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>TERVERIFIKASI</Text>
            </View>
          </View>

          <View style={styles.memberInfo}>
            <Text style={styles.memberNoKta}>{kta.noKta}</Text>
            <Text style={styles.memberName}>{kta.nama}</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>NIK:</Text>
              <Text style={styles.detailVal}>{kta.nik}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>DPD / Kota:</Text>
              <Text style={styles.detailVal}>{kta.dpd}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Kecamatan:</Text>
              <Text style={styles.detailVal}>{kta.dpc}</Text>
            </View>
          </View>
        </View>

        {/* Card Footer with QR Code */}
        <View style={styles.cardFooter}>
          <View style={{ flex: 1 }}>
            <Text style={styles.footerNote}>Masa Berlaku: {kta.masaBerlaku}</Text>
            <Text style={styles.footerNote}>Ketua Umum: {kta.tandaTanganKetum}</Text>
          </View>
          <Pressable
            onPress={() => setShowQrModal(true)}
            style={({ pressed }) => [styles.qrMock, pressed && { opacity: 0.8 }]}
            accessibilityRole="button"
            accessibilityLabel="Perbesar QR Code e-KTA"
          >
            <QrPlaceholder seed={kta.noKta} size={34} />
          </Pressable>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionBtnRow}>
        <PrimaryButton
          label="Simpan e-KTA"
          icon="download"
          variant="primary"
          style={{ flex: 1 }}
          loading={downloading}
          onPress={handleDownload}
        />
        <PrimaryButton
          label="Perbesar QR"
          icon="maximize"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => setShowQrModal(true)}
        />
      </View>

      {/* Supplementary Administrative Details (Non-redundant) */}
      <Card style={{ gap: spacing.sm }}>
        <SectionTitle style={{ marginBottom: 2 }}>Data Administrasi & Wilayah</SectionTitle>

        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Tempat, Tanggal Lahir</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{kta.tempatTglLahir}</Text>
        </View>

        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Jenis Kelamin</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{kta.jenisKelamin}</Text>
        </View>

        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Alamat Domisili</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{kta.alamat}</Text>
        </View>

        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Struktur Induk (DPW)</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{kta.dpw}</Text>
        </View>

        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Tingkat Ranting (DPRt)</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{kta.dprt}</Text>
        </View>

        <View style={[styles.infoRow, { borderBottomColor: 'transparent' }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Tanggal Terdaftar</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{kta.tglBergabung}</Text>
        </View>
      </Card>

      {/* Hak & Fasilitas Kader Aktif */}
      <Card style={{ gap: spacing.sm }}>
        <SectionTitle style={{ marginBottom: 2 }}>Hak & Fasilitas Kader Aktif</SectionTitle>
        <View style={styles.benefitRow}>
          <Feather name="check-circle" size={16} color={colors.success} style={{ marginTop: 2 }} />
          <Text style={[styles.benefitText, { color: colors.text }]}>
            Hak suara dan bicara dalam Musyawarah Daerah (Musda) & Wilayah (Muswil) PAN.
          </Text>
        </View>
        <View style={styles.benefitRow}>
          <Feather name="check-circle" size={16} color={colors.success} style={{ marginTop: 2 }} />
          <Text style={[styles.benefitText, { color: colors.text }]}>
            Akses pendaftaran program kaderisasi dan seleksi Calon Anggota Legislatif (Bacaleg).
          </Text>
        </View>
        <View style={styles.benefitRow}>
          <Feather name="check-circle" size={16} color={colors.success} style={{ marginTop: 2 }} />
          <Text style={[styles.benefitText, { color: colors.text }]}>
            Terdaftar sah pada Sistem Informasi Partai Politik Komisi Pemilihan Umum (SIPOL KPU).
          </Text>
        </View>
      </Card>

      {/* QR Code Magnification Modal */}
      <Modal
        visible={showQrModal}
        onClose={() => setShowQrModal(false)}
        title="QR Code e-KTA"
        subtitle="Pindai untuk verifikasi keabsahan keanggotaan PAN"
      >
        <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm }}>
          <View style={[styles.qrModalBox, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
            <QrPlaceholder seed={kta.noKta} size={180} />
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: fontSize.sm, fontWeight: '800', color: colors.text }}>
              {kta.nama}
            </Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.primary, fontWeight: '800', fontFamily: 'monospace' }}>
              {kta.noKta}
            </Text>
            <Pill label="Keanggotaan Sah & Aktif" tone="success" icon="check-circle" style={{ marginTop: 4 }} />
          </View>
          <PrimaryButton
            label="Tutup"
            icon="x"
            variant="secondary"
            style={{ width: '100%', marginTop: spacing.xs }}
            onPress={() => setShowQrModal(false)}
          />
        </View>
      </Modal>

      <ConfirmDialog
        visible={downloadSuccessVisible}
        title="e-KTA Tersimpan"
        message="File e-KTA digital resmi PAN telah disimpan ke galeri perangkat Anda."
        tone="success"
        singleButton
        confirmLabel="Selesai"
        onConfirm={() => setDownloadSuccessVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  topStatusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 },
  cardContainer: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: spacing.md,
    gap: spacing.md,
    ...shadow.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingBottom: spacing.sm,
  },
  ktaOrgTitle: { fontSize: 13, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  ktaSubTitle: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.3 },
  chipSimpan: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  chipText: { fontSize: 10, fontWeight: '900', color: '#004F8A' },
  cardBody: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  photoContainer: { alignItems: 'center', gap: 4 },
  memberPhoto: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: '#FFFFFF' },
  statusBadge: { backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
  statusBadgeText: { fontSize: 8, fontWeight: '800', color: '#FFFFFF' },
  memberInfo: { flex: 1, gap: 2 },
  memberNoKta: { fontSize: 11, color: '#38BDF8', fontWeight: '800', fontFamily: 'monospace' },
  memberName: { fontSize: fontSize.md, fontWeight: '800', color: '#FFFFFF' },
  detailRow: { flexDirection: 'row', gap: 4 },
  detailLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', width: 68 },
  detailVal: { fontSize: 10, color: '#FFFFFF', fontWeight: '600', flex: 1 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: spacing.xs,
  },
  footerNote: { fontSize: 9, color: 'rgba(255,255,255,0.75)' },
  qrMock: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    gap: spacing.md,
  },
  infoLabel: { fontSize: fontSize.xs, width: '40%' },
  infoValue: { fontSize: fontSize.xs, fontWeight: '700', flex: 1, textAlign: 'right' },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  benefitText: { fontSize: fontSize.xs, flex: 1, lineHeight: 18 },
  qrModalBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
