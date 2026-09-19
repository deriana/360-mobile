import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { fonts } from '../theme';
import { ROLE_LABEL, ROLE_SCOPE_DESCRIPTION } from '../utils/scope';

export default function StatusPeranSayaScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { currentUser, role } = useApp();

  const dims = currentUser.dimensions || {
    membership: 'active',
    kader: 'kader_aktif',
    position: { position: 'NONE', region: 'Kota Bandung' },
    electoral: { status: 'NONE' },
    volunteer: 'active',
    programs: { amanatAcademy: 'NONE', pandawa: 'NONE', programSaksi: 'NONE' },
    operationalRole: 'MEMBER',
  };

  const primaryMembership = currentUser.memberships.find((m) => m.type === 'member');
  const primaryVolunteer = currentUser.memberships.find((m) => m.type === 'volunteer');

  // Dimension 1: Membership Status Info
  const getMembershipBadge = () => {
    switch (dims.membership) {
      case 'active':
        return { label: 'Aktif Penuh', bg: '#DCFCE7', text: '#166534', icon: 'check-circle' as const };
      case 'resignation_requested':
        return { label: 'Proses Resign (Review DPD)', bg: '#FEF3C7', text: '#92400E', icon: 'clock' as const };
      case 'inactive':
        return { label: 'Nonaktif', bg: '#FEE2E2', text: '#991B1B', icon: 'slash' as const };
      case 'suspended':
        return { label: 'Dibekukan', bg: '#FEE2E2', text: '#991B1B', icon: 'alert-triangle' as const };
      case 'ended':
        return { label: 'Berhenti', bg: '#F3F4F6', text: '#4B5563', icon: 'x-circle' as const };
      default:
        return { label: 'Belum Terdaftar', bg: '#F3F4F6', text: '#4B5563', icon: 'help-circle' as const };
    }
  };

  // Dimension 2: Kader Status Info
  const getKaderBadge = () => {
    switch (dims.kader) {
      case 'kader_aktif':
        return { label: 'Kader Aktif', bg: '#E0F2FE', text: '#0369A1' };
      case 'calon_kader':
        return { label: 'Calon Kader (Orientasi)', bg: '#FEF3C7', text: '#92400E' };
      case 'non_kader':
      default:
        return { label: 'Simpatisan / Non-Kader', bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  // Dimension 3: Organizational Position
  const getPositionTitle = () => {
    if (dims.position.position === 'PENGURUS') {
      return dims.position.roleTitle || `Pengurus ${dims.position.level || 'DPD'}`;
    }
    if (dims.position.position === 'KOORDINATOR') return dims.position.roleTitle || 'Koordinator Wilayah';
    if (dims.position.position === 'FUNGSIONAR') return dims.position.roleTitle || 'Fungsionaris Partai';
    if (dims.position.position === 'ANGGOTA_LEGISLATIF') return dims.position.roleTitle || 'Anggota Fraksi PAN';
    return 'Anggota Biasa (Non-Pengurus)';
  };

  // Dimension 4: Electoral Status
  const getElectoralInfo = () => {
    if (dims.electoral.status === 'CALEG' || dims.electoral.status === 'BACALEG') {
      return {
        badge: dims.electoral.status === 'CALEG' ? `Caleg ${dims.electoral.legislativeLevel?.replace('_', ' ') || 'DPR-RI'}` : 'Bakal Calon Legislatif',
        dapil: dims.electoral.dapil || 'Dapil Jawa Barat I',
        noUrut: dims.electoral.ballotNumber ? `No. Urut ${dims.electoral.ballotNumber}` : 'Dalam Proses DCS',
      };
    }
    if (dims.electoral.status === 'TERPILIH' || dims.electoral.status === 'ANGGOTA_LEGISLATIF') {
      return {
        badge: 'Anggota Legislatif Terpilih',
        dapil: dims.electoral.dapil || 'Dapil Jawa Barat I',
        noUrut: 'Kursi Parlemen PAN',
      };
    }
    return {
      badge: 'Bukan Calon Legislatif',
      dapil: 'Fokus Pengawalan & Pemenangan',
      noUrut: 'Non-Kontestan Pemilu',
    };
  };

  // Dimension 5: Volunteer Status
  const getVolunteerBadge = () => {
    switch (dims.volunteer) {
      case 'active':
        return { label: 'Relawan Aktif', bg: '#DCFCE7', text: '#166534' };
      case 'paused':
        return { label: 'Dijeda Sementara', bg: '#FEF3C7', text: '#92400E' };
      case 'inactive':
        return { label: 'Nonaktif', bg: '#FEE2E2', text: '#991B1B' };
      default:
        return { label: 'Belum Terdaftar', bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const memBadge = getMembershipBadge();
  const kaderBadge = getKaderBadge();
  const electInfo = getElectoralInfo();
  const volBadge = getVolunteerBadge();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Identity Summary Header */}
      <View style={[styles.headerCard, { backgroundColor: '#002B52' }]}>
        <View style={styles.headerTop}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {currentUser.identity.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </Text>
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.headerName}>{currentUser.identity.name}</Text>
            <Text style={styles.headerEmail}>{currentUser.identity.email}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.pillBadge, { backgroundColor: memBadge.bg }]}>
                <Feather name={memBadge.icon} size={11} color={memBadge.text} />
                <Text style={[styles.pillText, { color: memBadge.text }]}>{memBadge.label}</Text>
              </View>
              <View style={[styles.pillBadge, { backgroundColor: '#F0F9FF' }]}>
                <Text style={[styles.pillText, { color: '#0369A1' }]}>
                  {ROLE_LABEL[role] || role}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Status Action CTA */}
        <TouchableOpacity
          style={styles.manageCtaButton}
          onPress={() => navigation.navigate('KelolaStatus')}
          activeOpacity={0.8}
        >
          <Feather name="settings" size={15} color="#FFFFFF" />
          <Text style={styles.manageCtaText}>Kelola Status & Pengunduran Diri</Text>
          <Feather name="chevron-right" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Resignation Review Warning if requested */}
      {dims.membership === 'resignation_requested' && (
        <View style={styles.warningBanner}>
          <Feather name="alert-circle" size={18} color="#92400E" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Permohonan Pengunduran Diri Dalam Proses</Text>
            <Text style={styles.warningDesc}>
              Pengajuan Anda sedang menunggu verifikasi DPD PAN Kota Bandung. Histori aktivitas tetap aman.
            </Text>
          </View>
        </View>
      )}

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          7 Dimensi Identitas & Peran
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
          Pondasi arsitektur peran terintegrasi simPAN DPP PAN
        </Text>
      </View>

      {/* Card 1: Status Keanggotaan */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
            <Feather name="credit-card" size={18} color="#0066B3" />
          </View>
          <View style={styles.cardHeaderTitle}>
            <Text style={[styles.dimensionNumber, { color: '#0066B3' }]}>DIMENSI 1</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Status Keanggotaan</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: memBadge.bg }]}>
            <Text style={[styles.badgeText, { color: memBadge.text }]}>{memBadge.label}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: colors.textMuted }]}>Nomor e-KTA</Text>
            <Text style={[styles.dataValue, { color: colors.text }]}>
              {primaryMembership?.ktaNumber || 'Belum memiliki e-KTA (Non-KTA)'}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: colors.textMuted }]}>Wilayah DPD / DPC</Text>
            <Text style={[styles.dataValue, { color: colors.text }]}>
              {primaryMembership?.dpd || 'DPD PAN Kota Bandung'} • {primaryMembership?.dpc || 'DPC Sumur Bandung'}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: colors.textMuted }]}>Terdaftar Sejak</Text>
            <Text style={[styles.dataValue, { color: colors.text }]}>
              {primaryMembership?.registeredAt || '10 Jan 2024'}
            </Text>
          </View>
        </View>
      </View>

      {/* Card 2: Status Perkaderan */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
            <Feather name="book-open" size={18} color="#D97706" />
          </View>
          <View style={styles.cardHeaderTitle}>
            <Text style={[styles.dimensionNumber, { color: '#D97706' }]}>DIMENSI 2</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Jenjang Perkaderan</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: kaderBadge.bg }]}>
            <Text style={[styles.badgeText, { color: kaderBadge.text }]}>{kaderBadge.label}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: colors.textMuted }]}>Kualifikasi</Text>
            <Text style={[styles.dataValue, { color: colors.text }]}>
              {dims.kader === 'kader_aktif' ? 'Latihan Kader Dasar (LK I) & LKK' : 'Simpatisan Umum'}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: colors.textMuted }]}>Lembaga Pengkader</Text>
            <Text style={[styles.dataValue, { color: colors.text }]}>
              Badan Perkaderan DPP / DPD PAN
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: colors.textMuted }]}>Sertifikasi</Text>
            <Text style={[styles.dataValue, { color: colors.text }]}>
              Terakreditasi Amanat Academy
            </Text>
          </View>
        </View>
      </View>

      {/* Card 3: Posisi Keorganisasian */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: '#EDE9FE' }]}>
            <Feather name="layers" size={18} color="#7C3AED" />
          </View>
          <View style={styles.cardHeaderTitle}>
            <Text style={[styles.dimensionNumber, { color: '#7C3AED' }]}>DIMENSI 3</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Posisi Keorganisasian</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#EDE9FE' }]}>
            <Text style={[styles.badgeText, { color: '#6D28D9' }]}>
              {dims.position.position}
            </Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: colors.textMuted }]}>Jabatan Struktural</Text>
            <Text style={[styles.dataValue, { color: colors.text }]}>{getPositionTitle()}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: colors.textMuted }]}>Wilayah / Struktur</Text>
            <Text style={[styles.dataValue, { color: colors.text }]}>
              {dims.position.region || 'DPD PAN Kota Bandung'}
            </Text>
          </View>
        </View>
      </View>

      {/* Card 4: Status Pencalegan */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
            <Feather name="award" size={18} color="#DC2626" />
          </View>
          <View style={styles.cardHeaderTitle}>
            <Text style={[styles.dimensionNumber, { color: '#DC2626' }]}>DIMENSI 4</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Status Elektoral (Bacaleg)</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: dims.electoral.status === 'CALEG' ? '#FEE2E2' : '#F3F4F6' }]}>
            <Text style={[styles.badgeText, { color: dims.electoral.status === 'CALEG' ? '#991B1B' : '#4B5563' }]}>
              {electInfo.badge}
            </Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: colors.textMuted }]}>Daerah Pemilihan</Text>
            <Text style={[styles.dataValue, { color: colors.text }]}>{electInfo.dapil}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: colors.textMuted }]}>Status Nominasi</Text>
            <Text style={[styles.dataValue, { color: colors.text }]}>{electInfo.noUrut}</Text>
          </View>
        </View>
      </View>

      {/* Card 5: Status Kerelawanan */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
            <Feather name="heart" size={18} color="#16A34A" />
          </View>
          <View style={styles.cardHeaderTitle}>
            <Text style={[styles.dimensionNumber, { color: '#16A34A' }]}>DIMENSI 5</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Status Kerelawanan</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: volBadge.bg }]}>
            <Text style={[styles.badgeText, { color: volBadge.text }]}>{volBadge.label}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: colors.textMuted }]}>Posko Wilayah</Text>
            <Text style={[styles.dataValue, { color: colors.text }]}>
              {primaryVolunteer?.dpc || 'Posko Kawal Suara Dago Atas'}
            </Text>
          </View>
          {currentUser.volunteerPauseInfo?.isPaused && (
            <View style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: '#D97706' }]}>Keterangan Jeda</Text>
              <Text style={[styles.dataValue, { color: '#D97706' }]}>
                {currentUser.volunteerPauseInfo.reason} ({currentUser.volunteerPauseInfo.durationMonths} bln)
              </Text>
            </View>
          )}
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: colors.textMuted }]}>Total Partisipasi Giat</Text>
            <Text style={[styles.dataValue, { color: colors.text }]}>
              {currentUser.volunteerStats?.activitiesCount ?? 12} Penugasan & Acara
            </Text>
          </View>
        </View>
      </View>

      {/* Card 6: Partisipasi Program Partai */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: '#F0F9FF' }]}>
            <Feather name="target" size={18} color="#0284C7" />
          </View>
          <View style={styles.cardHeaderTitle}>
            <Text style={[styles.dimensionNumber, { color: '#0284C7' }]}>DIMENSI 6</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Program Unggulan Partai</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.programItem}>
            <View style={styles.programTitleRow}>
              <Text style={[styles.programName, { color: colors.text }]}>Amanat Academy</Text>
              <Text style={[styles.programProgress, { color: '#0066B3' }]}>
                {dims.programs.academyProgress ?? (dims.programs.amanatAcademy === 'GRADUATED' ? 100 : 80)}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${dims.programs.academyProgress ?? (dims.programs.amanatAcademy === 'GRADUATED' ? 100 : 80)}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.programItem}>
            <View style={styles.programTitleRow}>
              <Text style={[styles.programName, { color: colors.text }]}>Satgas PANdawa</Text>
              <Text style={[styles.programBadge, { color: '#16A34A' }]}>
                {dims.programs.pandawa === 'ACTIVE' ? 'Aktif Bertugas' : 'Belum Bergabung'}
              </Text>
            </View>
          </View>

          <View style={styles.programItem}>
            <View style={styles.programTitleRow}>
              <Text style={[styles.programName, { color: colors.text }]}>Program Saksi BSN</Text>
              <Text style={[styles.programBadge, { color: dims.programs.programSaksi === 'MANDATED' ? '#0066B3' : '#D97706' }]}>
                {dims.programs.programSaksi === 'MANDATED'
                  ? 'Ber-SK Mandat Resmi'
                  : dims.programs.programSaksi === 'TRAINING'
                  ? 'Diklat Berjalan (80%)'
                  : 'Belum Terdaftar'}
              </Text>
            </View>
            {dims.programs.skMandatNumber && (
              <Text style={[styles.skText, { color: colors.textMuted }]}>
                No. SK: {dims.programs.skMandatNumber}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Card 7: Peran Operasional Mobile Saat Ini */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
            <Feather name="user-check" size={18} color="#B45309" />
          </View>
          <View style={styles.cardHeaderTitle}>
            <Text style={[styles.dimensionNumber, { color: '#B45309' }]}>DIMENSI 7</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Peran Operasional Aktif</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#0066B3' }]}>
            <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>{ROLE_LABEL[role] || role}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: colors.textMuted }]}>Cakupan Kerja</Text>
            <Text style={[styles.dataValue, { color: colors.text }]}>
              {ROLE_SCOPE_DESCRIPTION[role] || 'Penugasan terverifikasi di wilayah'}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: colors.textMuted }]}>Hak Akses Sistem</Text>
            <Text style={[styles.dataValue, { color: '#16A34A' }]}>
              {currentUser.permissions.length} Hak Akses Granular Aktif
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Padding */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0066B3',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  headerMeta: {
    flex: 1,
  },
  headerName: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerEmail: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#BAE6FD',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  manageCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  manageCtaText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#92400E',
    marginBottom: 2,
  },
  warningDesc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#B45309',
    lineHeight: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardHeaderTitle: {
    flex: 1,
  },
  dimensionNumber: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  cardBody: {
    gap: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  dataValue: {
    fontFamily: fonts.medium,
    fontSize: 12,
    textAlign: 'right',
    maxWidth: '55%',
  },
  programItem: {
    marginBottom: 6,
  },
  programTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  programName: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  programProgress: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  programBadge: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0066B3',
    borderRadius: 3,
  },
  skText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 2,
  },
});
