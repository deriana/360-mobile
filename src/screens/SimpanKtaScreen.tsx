import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fontSize, radius, shadow, spacing } from '../theme';
import { BRAND_ASSETS, getWitnessAvatar } from '../data/images';
import { CURRENT_KADER_KTA } from '../data/simpan';

export default function SimpanKtaScreen() {
  const { colors } = useTheme();
  const kta = CURRENT_KADER_KTA;
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      Alert.alert('e-KTA Tersimpan', 'File e-KTA digital resmi PAN telah diunduh ke galeri perangkat Anda.');
    }, 1200);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>e-KTA Digital simPAN</Text>
        <Text style={[styles.subTitle, { color: colors.textMuted }]}>
          Kartu Tanda Anggota Elektronik resmi Partai Amanat Nasional dengan autentikasi satu pintu.
        </Text>
      </View>

      {/* Physical-style Digital Membership Card */}
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

        {/* Card Footer with QR Code simulation */}
        <View style={styles.cardFooter}>
          <View style={{ flex: 1 }}>
            <Text style={styles.footerNote}>Berlaku: {kta.masaBerlaku}</Text>
            <Text style={styles.footerNote}>Ketua Umum: {kta.tandaTanganKetum}</Text>
          </View>
          <View style={styles.qrMock}>
            <Feather name="maximize" size={28} color="#003366" />
          </View>
        </View>
      </View>

      <PrimaryButton
        label="Simpan / Cetak e-KTA Digital"
        icon="download"
        variant="primary"
        loading={downloading}
        onPress={handleDownload}
      />

      {/* Member Details */}
      <Card style={{ gap: spacing.sm }}>
        <SectionTitle style={{ marginBottom: 0 }}>Data Keanggotaan Terdaftar</SectionTitle>
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Nomor KTA Nasional</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{kta.noKta}</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Nama Lengkap</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{kta.nama}</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Tempat, Tanggal Lahir</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{kta.tempatTglLahir}</Text>
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
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Tanggal Bergabung</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{kta.tglBergabung}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Status Anggota</Text>
          <Pill label="Aktif Terverifikasi" tone="success" icon="check-circle" />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  header: { gap: 2 },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  subTitle: { fontSize: fontSize.xs },
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
    width: 38,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs, borderBottomWidth: 0.5 },
  infoLabel: { fontSize: fontSize.xs },
  infoValue: { fontSize: fontSize.xs, fontWeight: '700' },
});
