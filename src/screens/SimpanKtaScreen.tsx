import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, Modal, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fontSize, fonts, radius, shadow, spacing } from '../theme';
import { BRAND_ASSETS, getWitnessAvatar } from '../data/images';
import { CURRENT_KADER_KTA } from '../data/simpan';
import QrPlaceholder from '../components/QrPlaceholder';

export default function SimpanKtaScreen() {
  const { colors, isDark } = useTheme();
  const { currentUser } = useApp();
  const navigation = useNavigation<any>();

  // Evaluasi jenis keanggotaan terdaftar
  const officialMembership = currentUser.memberships.find(
    (m) => m.type === 'member' && m.status !== 'ended' && m.status !== 'inactive'
  );
  const isOfficialMember = Boolean(officialMembership);
  const volunteerMembership = currentUser.memberships.find((m) => m.type === 'volunteer');
  const volunteerRole = currentUser.roles.find((r) => r.role === 'VOLUNTEER');

  // Data KTA Kader Resmi (simPAN)
  const kaderKta = {
    noKta: officialMembership?.ktaNumber ?? 'Nomor KTA sedang diterbitkan',
    nama: currentUser.identity.name,
    nik: currentUser.identity.nikMasked,
    dpd: officialMembership?.dpd ?? 'DPD Kota Bandung',
    dpc: officialMembership?.dpc ?? 'DPC Coblong',
    tglBergabung: formatJoinDate(officialMembership?.registeredAt),
    masaBerlaku: CURRENT_KADER_KTA.masaBerlaku,
    tandaTanganKetum: CURRENT_KADER_KTA.tandaTanganKetum,
  };

  // Data KTA Relawan Lapangan (BSN Saksi360 adopsi dari Saksi360-Admin)
  const rawRelawanNo = volunteerMembership?.ktaNumber || 'KTA-3273-2024-0042';
  const relawanKta = {
    noKta: rawRelawanNo,
    barcodeClean: `*${rawRelawanNo.replace(/[^A-Z0-9]/g, '')}*`,
    nama: currentUser.identity.name,
    nik: currentUser.identity.nikMasked,
    roleTitle: 'Relawan Penggerak Posko & Door-to-Door',
    poskoName: volunteerMembership?.dpc || volunteerRole?.scope?.name || 'Posko Kel. Dago, Kec. Coblong',
    unitTugas: 'Divisi Penggalangan Suara & Posko Saksi TPS',
    tglBergabung: formatJoinDate(volunteerMembership?.registeredAt || '2024-03-01'),
    masaBerlaku: '31 Desember 2026',
    organisasi: 'PARTAI AMANAT NASIONAL · BSN SAKSI360',
  };

  const activeKtaNumber = isOfficialMember ? kaderKta.noKta : relawanKta.noKta;

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

  const handleNavigateToUpgrade = () => {
    navigation.navigate('RegisterMember', {
      source: 'profile_upgrade',
      prefillName: currentUser.identity.name,
      prefillNik: currentUser.identity.nikFull || currentUser.identity.nikMasked,
      prefillPhone: currentUser.identity.phone,
      prefillEmail: currentUser.identity.email,
    });
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Status Bar Atas */}
      <View style={styles.topStatusRow}>
        <Pill
          label={isOfficialMember ? 'Status: Kader Aktif Terverifikasi' : 'Status: Relawan Terverifikasi Sah'}
          tone="success"
          icon="check-circle"
        />
        <Text style={{ fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' }}>
          {isOfficialMember ? 'SIPOL KPU Terdaftar' : 'Basis Data BSN Saksi360'}
        </Text>
      </View>

      {/* =========================================================================
          KARTU FISIK-DIGITAL (ADAPTIF: KADER simPAN vs RELAWAN BSN SAKSI360)
         ========================================================================= */}
      {isOfficialMember ? (
        // CARD A: e-KTA simPAN KADER RESMI
        <View style={[styles.cardContainer, { backgroundColor: '#004F8A', borderColor: '#0066B3' }]}>
          {/* Top Header Card */}
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
              <Image source={getWitnessAvatar(currentUser.identity.avatarIndex)} style={styles.memberPhoto} />
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>TERVERIFIKASI</Text>
              </View>
            </View>

            <View style={styles.memberInfo}>
              <Text style={styles.memberNoKta}>{kaderKta.noKta}</Text>
              <Text style={styles.memberName}>{kaderKta.nama}</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>NIK:</Text>
                <Text style={styles.detailVal}>{kaderKta.nik}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>DPD / Kota:</Text>
                <Text style={styles.detailVal}>{kaderKta.dpd}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Kecamatan:</Text>
                <Text style={styles.detailVal}>{kaderKta.dpc}</Text>
              </View>
            </View>
          </View>

          {/* Card Footer with QR Code */}
          <View style={styles.cardFooter}>
            <View style={{ flex: 1 }}>
              <Text style={styles.footerNote}>Masa Berlaku: {kaderKta.masaBerlaku}</Text>
              <Text style={styles.footerNote}>Ketua Umum: {kaderKta.tandaTanganKetum}</Text>
            </View>
            <Pressable
              onPress={() => setShowQrModal(true)}
              style={({ pressed }) => [styles.qrMock, pressed && { opacity: 0.8 }]}
              accessibilityRole="button"
              accessibilityLabel="Perbesar QR Code e-KTA"
            >
              <QrPlaceholder seed={kaderKta.noKta} size={34} />
            </Pressable>
          </View>
        </View>
      ) : (
        // CARD B: KTA DIGITAL RELAWAN (ADOPSI RESMI DARI SAKSI360-ADMIN)
        <View style={[styles.cardContainer, { backgroundColor: '#00437A', borderColor: '#0066B3' }]}>
          {/* Top Header Card */}
          <View style={styles.cardHeader}>
            <Image source={BRAND_ASSETS.official} style={{ width: 44, height: 44 }} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text style={styles.ktaOrgTitle}>PARTAI AMANAT NASIONAL</Text>
              <Text style={styles.ktaSubTitle}>KARTU TANDA ANGGOTA RELAWAN</Text>
              <Text style={styles.ktaOrgAffiliation}>BSN SAKSI360 · SATGAS PEMENANGAN</Text>
            </View>
            <View style={styles.nfcChipWrap}>
              <View style={styles.nfcChipIcon}>
                <View style={styles.nfcChipInner} />
              </View>
              <Text style={styles.nfcChipText}>NFC PASS</Text>
            </View>
          </View>

          {/* Card Body */}
          <View style={styles.cardBody}>
            <View style={styles.photoContainer}>
              <Image source={getWitnessAvatar(currentUser.identity.avatarIndex)} style={styles.memberPhoto} />
              <View style={styles.statusBadgeGreen}>
                <Text style={styles.statusBadgeGreenText}>AKTIF & SAH</Text>
              </View>
            </View>

            <View style={styles.memberInfo}>
              <Text style={styles.memberNoKta}>{relawanKta.noKta}</Text>
              <Text style={styles.memberName}>{relawanKta.nama}</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>NIK:</Text>
                <Text style={styles.detailVal}>{relawanKta.nik}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Penugasan:</Text>
                <Text style={styles.detailVal} numberOfLines={1}>{relawanKta.poskoName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Peran:</Text>
                <Text style={styles.detailVal} numberOfLines={1}>{relawanKta.roleTitle}</Text>
              </View>
            </View>
          </View>

          {/* Card Footer Barcode & Legalitas (Saksi360-Admin Spec) */}
          <View style={styles.relawanFooterWrap}>
            <View style={styles.barcodeColumn}>
              <View style={styles.barcodeLinesRow}>
                {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3].map((w, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: w,
                      height: 16,
                      backgroundColor: '#FFFFFF',
                      marginRight: idx % 2 === 0 ? 1.5 : 2,
                    }}
                  />
                ))}
              </View>
              <Text style={styles.barcodeLabelText}>{relawanKta.barcodeClean}</Text>
            </View>

            <View style={styles.relawanBrandingWrap}>
              <Text style={styles.relawanBrandTitle}>Saksi360</Text>
              <View style={styles.relawanBrandDot} />
              <Text style={styles.relawanBrandSub}>EDISI 2026</Text>
            </View>

            <Pressable
              onPress={() => setShowQrModal(true)}
              style={({ pressed }) => [styles.qrMock, pressed && { opacity: 0.8 }]}
              accessibilityRole="button"
              accessibilityLabel="Perbesar QR Code KTA Relawan"
            >
              <QrPlaceholder seed={relawanKta.noKta} size={34} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionBtnRow}>
        <PrimaryButton
          label={isOfficialMember ? 'Simpan e-KTA' : 'Simpan KTA Relawan'}
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

      {/* Supplementary Administrative Details */}
      <Card style={{ gap: spacing.sm }}>
        <SectionTitle style={{ marginBottom: 2 }}>
          {isOfficialMember ? 'Keanggotaan & Wilayah' : 'Informasi & Penugasan Posko'}
        </SectionTitle>

        {(isOfficialMember
          ? [
              { label: 'Kepengurusan Kota (DPD)', value: kaderKta.dpd },
              { label: 'Kepengurusan Kecamatan (DPC)', value: kaderKta.dpc },
              { label: 'Tanggal Terdaftar', value: kaderKta.tglBergabung },
            ]
          : [
              { label: 'Posko Wilayah', value: relawanKta.poskoName },
              { label: 'Divisi Penugasan', value: relawanKta.unitTugas },
              { label: 'Terdaftar Sejak', value: relawanKta.tglBergabung },
              { label: 'Status Akreditasi', value: 'Terdaftar Sah BSN Saksi360' },
            ]
        ).map((row, index, list) => (
          <View
            key={row.label}
            style={[styles.infoRow, { borderBottomColor: index === list.length - 1 ? 'transparent' : colors.border }]}
          >
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{row.label}</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{row.value}</Text>
          </View>
        ))}
      </Card>

      {/* Hak & Fasilitas / Wewenang */}
      <Card style={{ gap: spacing.sm }}>
        <SectionTitle style={{ marginBottom: 2 }}>
          {isOfficialMember ? 'Hak & Fasilitas Kader Aktif' : 'Hak & Wewenang Relawan Lapangan'}
        </SectionTitle>
        {(isOfficialMember
          ? [
              'Hak suara dan bicara dalam Musyawarah Daerah (Musda) & Wilayah (Muswil) PAN.',
              'Akses pendaftaran program kaderisasi dan seleksi Calon Anggota Legislatif (Bacaleg).',
              'Terdaftar sah pada Sistem Informasi Partai Politik Komisi Pemilihan Umum (SIPOL KPU).',
            ]
          : [
              'Penugasan resmi posko pemenangan, sosialisasi program partai, dan sapa warga door-to-door.',
              'Akses modul pelatihan relawan dan sertifikasi saksi TPS di Amanat Academy.',
              'Pelaporan taktis lapangan, absensi kegiatan, dan pelaporan darurat (SOS) ke Koordinator.',
            ]
        ).map((benefit, i) => (
          <View key={i} style={styles.benefitRow}>
            <Feather name="check-circle" size={16} color={colors.success} style={{ marginTop: 2 }} />
            <Text style={[styles.benefitText, { color: colors.text }]}>{benefit}</Text>
          </View>
        ))}
      </Card>

      {/* =========================================================================
          BANNER KADERISASI STRATEGIS (HANYA MUNCUL PADA MODE RELAWAN)
          Menjelaskan perbedaan hak yuridis dan menyediakan jembatan konversi resmi
         ========================================================================= */}
      {!isOfficialMember && (
        <Card
          style={{
            gap: spacing.sm,
            borderColor: isDark ? '#78350F' : '#FDE68A',
            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : '#FFFBEB',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="award" size={18} color="#D97706" />
            <Text style={{ fontFamily: fonts.bold, fontSize: fontSize.sm, fontWeight: '800', color: '#B45309' }}>
              Ingin Memiliki Hak Suara & e-KTA Kader Resmi?
            </Text>
          </View>
          <Text style={[styles.benefitText, { color: isDark ? '#FDE047' : '#78350F' }]}>
            KTA Relawan ini adalah tanda identitas resmi penugasan lapangan BSN Saksi360. Untuk mendapatkan hak suara penuh dalam Musyawarah Daerah (Musda) & Wilayah (Muswil) PAN serta terdaftar sah pada SIPOL KPU, Anda dapat mengajukan peningkatan status menjadi Kader Resmi simPAN.
          </Text>
          <PrimaryButton
            label="Ajukan e-KTA Kader Resmi"
            icon="arrow-right"
            variant="primary"
            style={{ marginTop: 4 }}
            onPress={handleNavigateToUpgrade}
          />
        </Card>
      )}

      {/* QR Code Magnification Modal */}
      <Modal
        visible={showQrModal}
        onClose={() => setShowQrModal(false)}
        title={isOfficialMember ? 'QR Code e-KTA' : 'QR Code KTA Relawan'}
        subtitle={isOfficialMember ? 'Pindai untuk verifikasi keabsahan keanggotaan PAN' : 'Pindai untuk verifikasi identitas relawan lapangan'}
      >
        <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm }}>
          <View style={[styles.qrModalBox, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
            <QrPlaceholder seed={activeKtaNumber} size={180} />
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: fontSize.sm, fontWeight: '800', color: colors.text }}>
              {currentUser.identity.name}
            </Text>
            <Text style={{ fontFamily: fonts.bold, fontSize: fontSize.xs, color: colors.primary, fontWeight: '800' }}>
              {activeKtaNumber}
            </Text>
            <Pill
              label={isOfficialMember ? 'Keanggotaan Sah & Aktif' : 'Relawan Sah & Aktif BSN'}
              tone="success"
              icon="check-circle"
              style={{ marginTop: 4 }}
            />
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
        title={isOfficialMember ? 'e-KTA Tersimpan' : 'KTA Relawan Tersimpan'}
        message={
          isOfficialMember
            ? 'File e-KTA digital resmi PAN telah disimpan ke galeri perangkat Anda.'
            : 'File KTA digital Relawan BSN Saksi360 telah disimpan ke galeri perangkat Anda.'
        }
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
  ktaOrgTitle: { fontFamily: fonts.extraBold, fontSize: 13, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  ktaSubTitle: { fontFamily: fonts.semiBold, fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.3 },
  ktaOrgAffiliation: { fontFamily: fonts.bold, fontSize: 8, fontWeight: '700', color: '#38BDF8', letterSpacing: 0.4, marginTop: 1 },
  chipSimpan: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  chipText: { fontFamily: fonts.extraBold, fontSize: 10, fontWeight: '900', color: '#004F8A' },
  nfcChipWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  nfcChipIcon: {
    width: 14,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
    padding: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nfcChipInner: {
    width: 8,
    height: 5,
    borderRadius: 1,
    backgroundColor: '#B45309',
  },
  nfcChipText: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cardBody: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  photoContainer: { alignItems: 'center', gap: 4 },
  memberPhoto: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: '#FFFFFF' },
  statusBadge: { backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
  statusBadgeText: { fontFamily: fonts.bold, fontSize: 8, fontWeight: '800', color: '#FFFFFF' },
  statusBadgeGreen: { backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
  statusBadgeGreenText: { fontFamily: fonts.bold, fontSize: 8, fontWeight: '800', color: '#FFFFFF' },
  memberInfo: { flex: 1, gap: 2 },
  memberNoKta: { fontSize: 11, color: '#38BDF8', fontWeight: '800', fontFamily: fonts.bold },
  memberName: { fontFamily: fonts.extraBold, fontSize: fontSize.md, fontWeight: '800', color: '#FFFFFF' },
  detailRow: { flexDirection: 'row', gap: 4 },
  detailLabel: { fontFamily: fonts.medium, fontSize: 10, color: 'rgba(255,255,255,0.7)', width: 68 },
  detailVal: { fontFamily: fonts.semiBold, fontSize: 10, color: '#FFFFFF', fontWeight: '600', flex: 1 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: spacing.xs,
  },
  relawanFooterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: spacing.xs,
    gap: 8,
  },
  barcodeColumn: {
    flexDirection: 'column',
    gap: 2,
  },
  barcodeLinesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barcodeLabelText: {
    fontFamily: fonts.semiBold,
    fontSize: 7.5,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 1.2,
  },
  relawanBrandingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  relawanBrandTitle: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.4,
  },
  relawanBrandDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  relawanBrandSub: {
    fontFamily: fonts.extraBold,
    fontSize: 8.5,
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  footerNote: { fontFamily: fonts.regular, fontSize: 9, color: 'rgba(255,255,255,0.75)' },
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
  infoLabel: { fontFamily: fonts.medium, fontSize: fontSize.xs, width: '40%' },
  infoValue: { fontFamily: fonts.bold, fontSize: fontSize.xs, fontWeight: '700', flex: 1, textAlign: 'right' },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  benefitText: { fontFamily: fonts.regular, fontSize: fontSize.xs, flex: 1, lineHeight: 18 },
  qrModalBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatJoinDate(iso?: string) {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
