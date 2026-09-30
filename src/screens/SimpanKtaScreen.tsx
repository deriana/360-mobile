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

  // State untuk copy feedback
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (val: string, label: string) => {
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Evaluasi jenis keanggotaan terdaftar
  const officialMembership = currentUser.memberships.find(
    (m) => m.type === 'member' && m.status !== 'ended' && m.status !== 'inactive'
  );
  const isOfficialMember = Boolean(officialMembership);
  const volunteerMembership = currentUser.memberships.find((m) => m.type === 'volunteer');
  const volunteerRole = currentUser.roles.find((r) => r.role === 'VOLUNTEER');

  // Data KTA Kader Resmi (simPAN)
  const rawKaderNo = officialMembership?.ktaNumber ?? '32.73.01.2024.08912';
  const kaderKta = {
    noKta: rawKaderNo,
    barcodeClean: `*${rawKaderNo.replace(/[^A-Z0-9]/g, '')}*`,
    nama: currentUser.identity.name,
    nik: currentUser.identity.nikMasked,
    dpd: officialMembership?.dpd ?? 'DPD Kota Bandung',
    dpc: officialMembership?.dpc ?? 'DPC Coblong',
    tglBergabung: formatJoinDate(officialMembership?.registeredAt),
    masaBerlaku: CURRENT_KADER_KTA.masaBerlaku,
    tandaTanganKetum: CURRENT_KADER_KTA.tandaTanganKetum,
  };

  // Data KTA Relawan Lapangan (BSN Saksi360 adopsi presisi Saksi360-Admin)
  const rawRelawanNo = volunteerMembership?.ktaNumber || 'KTA-338171-000';
  const cleanRelawanNo = rawRelawanNo.startsWith('REL-') ? rawRelawanNo.replace('REL-', 'KTA-') : rawRelawanNo;
  const relawanKta = {
    noKta: cleanRelawanNo,
    barcodeClean: `*${cleanRelawanNo.replace(/[^A-Z0-9]/g, '')}*`,
    nama: currentUser.identity.name,
    nik: currentUser.identity.nikMasked,
    roleTitle: volunteerRole?.scope?.name ? 'Koordinator Posko' : 'Relawan Posko',
    poskoName: volunteerMembership?.dpc || volunteerRole?.scope?.name || 'Posko Kel. Dago, Kec. Coblong',
    unitTugas: 'Divisi Penggalangan Suara TPS 018',
    tglBergabung: formatJoinDate(volunteerMembership?.registeredAt || '2024-03-01'),
    masaBerlaku: '31 DESEMBER 2026',
    organisasi: 'PARTAI AMANAT NASIONAL · BSN SAKSI360',
  };

  const isVolunteerPending = volunteerMembership?.status === 'pending';
  const volunteerBadgeLabel = isVolunteerPending ? 'PROSES VALIDASI DPD' : 'AKTIF & SAH';
  const volunteerBadgeBg = isVolunteerPending ? '#D97706' : '#059669';

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
          KARTU FISIK-DIGITAL (PROPORSI STANDAR KARTU ISO/IEC 7810 ID-1 RATIO 1.58:1)
         ========================================================================= */}
      {isOfficialMember ? (
        // CARD A: e-KTA simPAN KADER RESMI
        <View style={styles.adminCardContainer}>
          {/* Watermark Logo PAN Transparan di Sudut Kanan Atas */}
          <Image source={BRAND_ASSETS.official} style={styles.adminCardWatermark} resizeMode="contain" />

          {/* Top Header Card */}
          <View style={styles.adminCardHeader}>
            <View style={styles.adminHeaderLeft}>
              <View style={styles.adminLogoBox}>
                <Image source={BRAND_ASSETS.official} style={styles.adminLogoImg} resizeMode="contain" />
              </View>
              <View style={styles.adminHeaderTitles}>
                <Text style={styles.adminCardMainTitle} numberOfLines={1}>KARTU TANDA ANGGOTA ELEKTRONIK</Text>
                <Text style={styles.adminCardSubTitle} numberOfLines={1}>PARTAI AMANAT NASIONAL · simPAN</Text>
              </View>
            </View>

            <View style={styles.adminHeaderBadges}>
              <View style={styles.adminPanBadge}>
                <Image source={BRAND_ASSETS.official} style={styles.adminPanMiniLogo} resizeMode="contain" />
                <Text style={styles.adminPanBadgeText}>PAN</Text>
              </View>
              <View style={styles.adminStatusBadge}>
                <Text style={styles.adminStatusBadgeText}>TERVERIFIKASI</Text>
              </View>
            </View>
          </View>

          {/* Card Middle: Foto Squircle + Chip simPAN + No KTA + QR */}
          <View style={styles.adminCardMiddleRow}>
            <View style={styles.adminPhotoAndInfo}>
              <View style={styles.adminPhotoWrap}>
                <Image source={getWitnessAvatar(currentUser.identity.avatarIndex)} style={styles.adminPhotoSquircle} />
                <View style={styles.adminOnlineDot}>
                  <View style={styles.adminOnlinePulse} />
                </View>
              </View>

              <View style={styles.adminKtaDetails}>
                <View style={styles.adminSimpanChipWrap}>
                  <Text style={styles.adminSimpanChipText}>simPAN PASS</Text>
                </View>
                <Text style={styles.adminLabelKta}>NOMOR ANGGOTA KTA</Text>
                <View style={styles.adminKtaNumberRow}>
                  <Text style={styles.adminKtaNumberText} numberOfLines={1}>{kaderKta.noKta}</Text>
                  <Pressable
                    onPress={() => handleCopy(kaderKta.noKta, 'kader')}
                    style={({ pressed }) => [styles.adminCopyBtn, pressed && { opacity: 0.6 }]}
                    accessibilityRole="button"
                    accessibilityLabel="Salin Nomor KTA"
                  >
                    <Feather
                      name={copiedField === 'kader' ? 'check' : 'copy'}
                      size={11}
                      color={copiedField === 'kader' ? '#10B981' : '#94A3B8'}
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* QR Code Card */}
            <Pressable
              onPress={() => setShowQrModal(true)}
              style={({ pressed }) => [styles.adminQrContainer, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel="Perbesar QR Code"
            >
              <View style={styles.adminQrInnerBox}>
                <QrPlaceholder seed={kaderKta.noKta} size={38} />
              </View>
              <Text style={styles.adminQrLabel}>VERIFIKASI QR</Text>
            </Pressable>
          </View>

          {/* Bento Grid 2x2 Info */}
          <View style={styles.adminBentoGrid}>
            <View style={styles.adminBentoRow}>
              <View style={styles.adminBentoTile}>
                <Text style={styles.adminBentoLabel}>NAMA ANGGOTA</Text>
                <Text style={styles.adminBentoValue} numberOfLines={1}>{kaderKta.nama}</Text>
              </View>
              <View style={styles.adminBentoTile}>
                <Text style={styles.adminBentoLabel}>KEPENGURUSAN / DPD</Text>
                <Text style={styles.adminBentoValue} numberOfLines={1}>{kaderKta.dpd}</Text>
              </View>
            </View>
            <View style={styles.adminBentoRow}>
              <View style={styles.adminBentoTile}>
                <Text style={styles.adminBentoLabel}>UNIT WILAYAH / DPC</Text>
                <Text style={styles.adminBentoValue} numberOfLines={1}>{kaderKta.dpc}</Text>
              </View>
              <View style={styles.adminBentoTile}>
                <Text style={styles.adminBentoLabel}>MASA BERLAKU</Text>
                <Text style={styles.adminBentoValueMono} numberOfLines={1}>{kaderKta.masaBerlaku}</Text>
              </View>
            </View>
          </View>

          {/* Card Footer Barcode & Legalitas */}
          <View style={styles.adminCardFooter}>
            <View style={styles.adminBarcodeGroup}>
              <View style={styles.barcodeLinesRow}>
                {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3].map((w, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: w,
                      height: 10,
                      backgroundColor: '#FFFFFF',
                      marginRight: idx % 2 === 0 ? 1 : 1.5,
                    }}
                  />
                ))}
              </View>
              <Text style={styles.adminBarcodeText}>{`*${kaderKta.noKta.replace(/[^A-Z0-9]/g, '')}*`}</Text>
            </View>

            <View style={styles.adminBrandingWrap}>
              <Text style={styles.adminBrandTitle}>simPAN</Text>
              <View style={styles.adminBrandDot} />
              <Text style={styles.adminBrandSub}>EDISI 2026</Text>
            </View>
          </View>
        </View>
      ) : (
        // CARD B: KTA DIGITAL RELAWAN (PROPORSI KARTU FISIK ASLI 1.58:1)
        <View style={styles.adminCardContainer}>
          {/* Watermark Logo PAN Transparan di Sudut Kanan Atas */}
          <Image source={BRAND_ASSETS.official} style={styles.adminCardWatermark} resizeMode="contain" />

          {/* Top Header Card */}
          <View style={styles.adminCardHeader}>
            <View style={styles.adminHeaderLeft}>
              <View style={styles.adminLogoBox}>
                <Image source={BRAND_ASSETS.official} style={styles.adminLogoImg} resizeMode="contain" />
              </View>
              <View style={styles.adminHeaderTitles}>
                <Text style={styles.adminCardMainTitle} numberOfLines={1}>KARTU TANDA ANGGOTA RELAWAN</Text>
                <Text style={styles.adminCardSubTitle} numberOfLines={1}>PARTAI AMANAT NASIONAL · BSN SAKSI360</Text>
              </View>
            </View>

            <View style={styles.adminHeaderBadges}>
              <View style={styles.adminPanBadge}>
                <Image source={BRAND_ASSETS.official} style={styles.adminPanMiniLogo} resizeMode="contain" />
                <Text style={styles.adminPanBadgeText}>PAN</Text>
              </View>
              <View style={[styles.adminStatusBadge, { backgroundColor: volunteerBadgeBg }]}>
                <Text style={styles.adminStatusBadgeText}>{volunteerBadgeLabel}</Text>
              </View>
            </View>
          </View>

          {/* Card Middle: Foto Squircle + Chip NFC + No KTA + QR Code */}
          <View style={styles.adminCardMiddleRow}>
            <View style={styles.adminPhotoAndInfo}>
              <View style={styles.adminPhotoWrap}>
                <Image source={getWitnessAvatar(currentUser.identity.avatarIndex)} style={styles.adminPhotoSquircle} />
                <View style={styles.adminOnlineDot}>
                  <View style={styles.adminOnlinePulse} />
                </View>
              </View>

              <View style={styles.adminKtaDetails}>
                <View style={styles.adminNfcChipWrap}>
                  <View style={styles.adminNfcMicrochip}>
                    <View style={styles.adminNfcLines} />
                  </View>
                  <Text style={styles.adminNfcChipText}>NFC SMARTPASS</Text>
                </View>
                <Text style={styles.adminLabelKta}>NOMOR ANGGOTA KTA</Text>
                <View style={styles.adminKtaNumberRow}>
                  <Text style={styles.adminKtaNumberText} numberOfLines={1}>{relawanKta.noKta}</Text>
                  <Pressable
                    onPress={() => handleCopy(relawanKta.noKta, 'relawan')}
                    style={({ pressed }) => [styles.adminCopyBtn, pressed && { opacity: 0.6 }]}
                    accessibilityRole="button"
                    accessibilityLabel="Salin Nomor KTA"
                  >
                    <Feather
                      name={copiedField === 'relawan' ? 'check' : 'copy'}
                      size={11}
                      color={copiedField === 'relawan' ? '#10B981' : '#94A3B8'}
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* QR Code Card */}
            <Pressable
              onPress={() => setShowQrModal(true)}
              style={({ pressed }) => [styles.adminQrContainer, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel="Perbesar QR Code"
            >
              <View style={styles.adminQrInnerBox}>
                <QrPlaceholder seed={relawanKta.noKta} size={38} />
              </View>
              <Text style={styles.adminQrLabel}>VERIFIKASI QR</Text>
            </Pressable>
          </View>

          {/* Bento Grid 2x2 Info (Sesuai Persis Tangkapan Layar Admin) */}
          <View style={styles.adminBentoGrid}>
            <View style={styles.adminBentoRow}>
              <View style={styles.adminBentoTile}>
                <Text style={styles.adminBentoLabel}>NAMA ANGGOTA</Text>
                <Text style={styles.adminBentoValue} numberOfLines={1}>{relawanKta.nama}</Text>
              </View>
              <View style={styles.adminBentoTile}>
                <Text style={styles.adminBentoLabel}>JABATAN / ROLE</Text>
                <Text style={styles.adminBentoValue} numberOfLines={1}>{relawanKta.roleTitle}</Text>
              </View>
            </View>
            <View style={styles.adminBentoRow}>
              <View style={styles.adminBentoTile}>
                <Text style={styles.adminBentoLabel}>UNIT PENUGASAN</Text>
                <Text style={styles.adminBentoValueSmall} numberOfLines={1}>{relawanKta.unitTugas}</Text>
              </View>
              <View style={styles.adminBentoTile}>
                <Text style={styles.adminBentoLabel}>MASA BERLAKU</Text>
                <Text style={styles.adminBentoValueMono} numberOfLines={1}>{relawanKta.masaBerlaku}</Text>
              </View>
            </View>
          </View>

          {/* Card Footer Barcode & Legalitas */}
          <View style={styles.adminCardFooter}>
            <View style={styles.adminBarcodeGroup}>
              <View style={styles.barcodeLinesRow}>
                {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3].map((w, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: w,
                      height: 10,
                      backgroundColor: '#FFFFFF',
                      marginRight: idx % 2 === 0 ? 1 : 1.5,
                    }}
                  />
                ))}
              </View>
              <Text style={styles.adminBarcodeText}>{relawanKta.barcodeClean}</Text>
            </View>

            <View style={styles.adminBrandingWrap}>
              <Text style={styles.adminBrandTitle}>Saksi360</Text>
              <View style={styles.adminBrandDot} />
              <Text style={styles.adminBrandSub}>EDISI 2026</Text>
            </View>
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
              { label: 'Status Akreditasi', value: isVolunteerPending ? 'Menunggu Validasi Admin DPD' : 'Terdaftar Sah BSN Saksi360' },
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

      {/* Banner Menunggu Validasi DPD untuk Relawan Baru */}
      {!isOfficialMember && isVolunteerPending && (
        <Card
          style={{
            gap: spacing.xs,
            borderColor: isDark ? '#78350F' : '#FDE68A',
            backgroundColor: isDark ? 'rgba(217, 119, 6, 0.08)' : '#FFFBEB',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="clock" size={18} color="#D97706" />
            <Text style={{ fontFamily: fonts.bold, fontSize: fontSize.sm, fontWeight: '800', color: '#B45309' }}>
              Status: Menunggu Validasi Admin DPD
            </Text>
          </View>
          <Text style={[styles.benefitText, { color: isDark ? '#FDE047' : '#92400E' }]}>
            Pendaftaran relawan Anda sedang dalam proses verifikasi oleh admin DPD melalui Web Command Center. Selama masa peninjauan, kartu identitas berstatus pratinjau informasi. Fitur penugasan lapangan dan Ajak Relawan akan aktif otomatis setelah disetujui.
          </Text>
        </Card>
      )}

      {/* Banner Konversi Kaderisasi */}
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
              label={
                isOfficialMember
                  ? 'Keanggotaan Sah & Aktif'
                  : isVolunteerPending
                  ? 'Menunggu Validasi DPD'
                  : 'Relawan Sah & Aktif BSN'
              }
              tone={isVolunteerPending ? 'warning' : 'success'}
              icon={isVolunteerPending ? 'clock' : 'check-circle'}
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
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  topStatusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 },

  // =========================================================================
  // GAYA SMARTCARD DENGAN PROPORSI STANDAR KARTU IDENTITAS ISO/IEC 7810 ID-1 (1.58:1)
  // =========================================================================
  adminCardContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#0A3D6B',
    backgroundColor: '#030D1A',
    padding: 12,
    aspectRatio: 1.58, // Standar rasio kartu fisik (85.6mm x 53.98mm = 1.586 : 1)
    justifyContent: 'space-between',
    ...shadow.lg,
  },
  adminCardWatermark: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 110,
    height: 110,
    opacity: 0.08,
  },
  adminCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(56, 189, 248, 0.2)',
    paddingBottom: 6,
  },
  adminHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  adminLogoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    ...shadow.sm,
  },
  adminLogoImg: {
    width: 26,
    height: 26,
  },
  adminHeaderTitles: {
    flex: 1,
    minWidth: 0,
  },
  adminCardMainTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  adminCardSubTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.2,
    marginTop: 1,
  },
  adminHeaderBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  adminPanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  adminPanMiniLogo: {
    width: 10,
    height: 10,
  },
  adminPanBadgeText: {
    fontFamily: fonts.extraBold,
    fontSize: 8.5,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 0.4,
  },
  adminStatusBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adminStatusBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Middle Row
  adminCardMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  adminPhotoAndInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  adminPhotoWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  adminPhotoSquircle: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  adminOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#030D1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminOnlinePulse: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  adminKtaDetails: {
    flex: 1,
    minWidth: 0,
    gap: 0.5,
  },
  adminNfcChipWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adminNfcMicrochip: {
    width: 15,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
    borderWidth: 0.8,
    borderColor: '#D97706',
    padding: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminNfcLines: {
    width: 10,
    height: 5,
    borderWidth: 0.6,
    borderColor: '#78350F',
    borderRadius: 0.5,
  },
  adminNfcChipText: {
    fontFamily: fonts.bold,
    fontSize: 7.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
  adminSimpanChipWrap: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  adminSimpanChipText: {
    fontFamily: fonts.bold,
    fontSize: 7.5,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.3,
  },
  adminLabelKta: {
    fontFamily: fonts.bold,
    fontSize: 7,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginTop: 1.5,
  },
  adminKtaNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  adminKtaNumberText: {
    fontFamily: fonts.extraBold,
    fontSize: 12.5,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  adminCopyBtn: {
    padding: 2,
    borderRadius: 3,
  },

  // QR Container
  adminQrContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 8,
    padding: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  adminQrInnerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminQrLabel: {
    fontFamily: fonts.bold,
    fontSize: 6.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.4,
    marginTop: 2,
  },

  // Bento Grid
  adminBentoGrid: {
    gap: 3.5,
  },
  adminBentoRow: {
    flexDirection: 'row',
    gap: 4,
  },
  adminBentoTile: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3.5,
  },
  adminBentoLabel: {
    fontFamily: fonts.bold,
    fontSize: 6.8,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
  adminBentoValue: {
    fontFamily: fonts.bold,
    fontSize: 9.8,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  adminBentoValueSmall: {
    fontFamily: fonts.semiBold,
    fontSize: 8.8,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  adminBentoValueMono: {
    fontFamily: fonts.bold,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
    letterSpacing: 0.4,
  },

  // Card Footer
  adminCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(56, 189, 248, 0.2)',
    paddingTop: 5,
  },
  adminBarcodeGroup: {
    flexDirection: 'column',
    gap: 1,
  },
  barcodeLinesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminBarcodeText: {
    fontFamily: fonts.semiBold,
    fontSize: 6.5,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 1,
  },
  adminBrandingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  adminBrandTitle: {
    fontFamily: fonts.bold,
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.3,
  },
  adminBrandDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  adminBrandSub: {
    fontFamily: fonts.extraBold,
    fontSize: 7.5,
    color: '#38BDF8',
    letterSpacing: 0.4,
  },

  // Supplementary details
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
