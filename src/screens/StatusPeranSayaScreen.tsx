import React, { useLayoutEffect, useState } from 'react';
import {
  Image,
  Pressable,
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
import { Card, Pill, PrimaryButton } from '../components/ui';
import { fonts, fontSize, radius, spacing } from '../theme';
import { getWitnessAvatar } from '../data/images';
import { maskNik, maskPhone } from '../utils/masking';
import { ROLE_LABEL } from '../utils/scope';
import { ROLE_ACTIVITY_TIMELINE } from '../utils/userContext';

interface LifecycleEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  authority: string;
  skNumber?: string;
  icon: keyof typeof Feather.glyphMap;
  tone: 'primary' | 'success' | 'warning' | 'info';
}

const LIFECYCLE_HISTORY: LifecycleEvent[] = [
  {
    id: 'LH-01',
    date: '01 September 2026',
    title: 'Penetapan Mandat Saksi Resmi TPS',
    description: 'Ditetapkan sebagai Saksi Resmi TPS 001 Kel. Dago, Kec. Coblong untuk Pemilu 2029.',
    authority: 'Badan Saksi Nasional (BSN) DPP PAN',
    skNumber: '042/SM-DPP/2026',
    icon: 'check-circle',
    tone: 'success',
  },
  {
    id: 'LH-02',
    date: '10 Maret 2026',
    title: 'Verifikasi Lolos Berkas Bakal Caleg 2029',
    description: 'Audit 7 dokumen persyaratan pencalonan DPRD Provinsi dinyatakan lengkap & sah.',
    authority: 'Komite Pemenangan Pemilu Nasional (KPPN)',
    skNumber: 'REG-CALEG-PAN-2029-089',
    icon: 'award',
    tone: 'primary',
  },
  {
    id: 'LH-03',
    date: '15 Agustus 2024',
    title: 'Kelulusan Diklat Formal Kader LKK Madya',
    description: 'Lulus dengan predikat Sangat Baik dalam Latihan Kader Kepemimpinan Tingkat Menengah.',
    authority: 'Lembaga Kaderisasi & Keanggotaan PAN (LKKPAN)',
    skNumber: 'LKK-PAN-JB-2024-441',
    icon: 'bookmark',
    tone: 'info',
  },
  {
    id: 'LH-04',
    date: '15 Januari 2024',
    title: 'Penerbitan e-KTA Digital simPAN Nasional',
    description: 'Registrasi mandiri terverifikasi dan tercatat resmi pada database keanggotaan DPP PAN.',
    authority: 'Sekretariat Jenderal DPP PAN',
    skNumber: '32.73.01.2024.08912',
    icon: 'credit-card',
    tone: 'primary',
  },
];

export default function StatusPeranSayaScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const { currentUser, role } = useApp();

  const user = currentUser?.identity;
  const officialMembership = currentUser?.memberships?.find((m) => m.type === 'member');
  const volunteerMembership = currentUser?.memberships?.find((m) => m.type === 'volunteer');
  const isOfficialMember = Boolean(officialMembership);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isOfficialMember ? 'Status & Peran Kader' : 'Partisipasi Relawan',
    });
  }, [navigation, isOfficialMember]);

  const dims = currentUser?.dimensions || {
    membership: 'active',
    kader: 'kader_aktif',
    position: { position: 'NONE', region: 'Kota Bandung' },
    electoral: { status: 'NONE' },
    volunteer: 'active',
    programs: { amanatAcademy: 'NONE', pandawa: 'NONE', programSaksi: 'NONE' },
    operationalRole: 'MEMBER',
  };

  // Dynamic Subtitle Elements
  const kaderSub = isOfficialMember
    ? (dims.kader === 'kader_aktif' ? 'Kader Aktif simPAN' : dims.kader === 'calon_kader' ? 'Calon Kader (Orientasi)' : 'Anggota simPAN')
    : 'Relawan Simpatisan';
  const posSub = isOfficialMember ? (dims.position?.roleTitle || (dims.position?.position !== 'NONE' ? dims.position?.position : null)) : null;
  const elecSub = isOfficialMember ? (dims.electoral?.status === 'CALEG' ? 'Caleg 2029' : dims.electoral?.status === 'BACALEG' ? 'Bacaleg 2029' : null) : null;
  const heroSubtitleText = dims.membership === 'resignation_requested' && isOfficialMember
    ? 'Dalam Proses Pengunduran Diri (DPD)'
    : isOfficialMember
    ? [kaderSub, posSub, elecSub].filter(Boolean).join(' | ') || 'Anggota Resmi simPAN'
    : 'Relawan Simpatisan simPAN';

  // Personalized Audit / Lifecycle Timeline
  const userTimeline = (user?.email && ROLE_ACTIVITY_TIMELINE[user.email])
    ? ROLE_ACTIVITY_TIMELINE[user.email].map((item) => ({
        id: item.id,
        date: item.date,
        title: item.title,
        description: item.desc,
        authority: isOfficialMember ? 'DPD PAN Kota Bandung' : 'Koordinator Posko Lapangan',
        skNumber: undefined,
        icon: item.icon,
      }))
    : LIFECYCLE_HISTORY;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Identitas Multi-Layer */}
      <View
        style={[
          styles.heroHeader,
          {
            backgroundColor: isDark ? '#0F1E36' : '#003666',
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.heroTopRow}>
          <Image
            source={getWitnessAvatar(user?.avatarIndex ?? 0)}
            style={styles.heroAvatar}
          />
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={styles.heroName}>{user?.name || 'Rudi Saputra'}</Text>
              <Feather name="check-circle" size={15} color="#38BDF8" />
            </View>
            <Text style={styles.heroSubtitle}>
              {heroSubtitleText}
            </Text>
            <Text style={styles.heroNik}>
              NIK: {maskNik(user?.nikFull || user?.nikMasked || '3273011204920001')} | HP: {maskPhone(user?.phone || '081234567890')}
            </Text>
          </View>
        </View>

        {/* Quick Identity Pills */}
        <View style={styles.heroPillsRow}>
          {isOfficialMember ? (
            dims.membership === 'resignation_requested' ? (
              <View style={[styles.quickTag, { backgroundColor: 'rgba(245, 158, 11, 0.25)' }]}>
                <Feather name="clock" size={11} color="#FDE047" />
                <Text style={styles.quickTagText}>Proses Resign</Text>
              </View>
            ) : (
              <View style={styles.quickTag}>
                <Feather name="shield" size={11} color="#67E8F9" />
                <Text style={styles.quickTagText}>Anggota Aktif</Text>
              </View>
            )
          ) : (
            <View style={styles.quickTag}>
              <Feather name="user" size={11} color="#BAE6FD" />
              <Text style={styles.quickTagText}>
                {dims.volunteer === 'paused'
                  ? 'Cuti Relawan'
                  : dims.volunteer === 'inactive'
                  ? 'Relawan Nonaktif'
                  : 'Relawan Aktif'}
              </Text>
            </View>
          )}

          {isOfficialMember && dims.kader === 'kader_aktif' && (
            <View style={styles.quickTag}>
              <Feather name="award" size={11} color="#FDE047" />
              <Text style={styles.quickTagText}>LKK Madya</Text>
            </View>
          )}

          {isOfficialMember && (dims.electoral?.status === 'CALEG' || dims.electoral?.status === 'BACALEG') && (
            <View style={styles.quickTag}>
              <Feather name="briefcase" size={11} color="#F472B6" />
              <Text style={styles.quickTagText}>
                Caleg {dims.electoral.legislativeLevel?.replace('_', ' ') || '2029'}
              </Text>
            </View>
          )}

          <View style={styles.quickTag}>
            <Feather name="check-square" size={11} color="#86EFAC" />
            <Text style={styles.quickTagText}>{ROLE_LABEL[role] || role}</Text>
          </View>
        </View>
      </View>

      {/* Resignation Review Alert Banner */}
      {isOfficialMember && dims.membership === 'resignation_requested' && (
        <View style={[styles.infoBanner, { backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : '#FEF3C7', borderColor: '#F59E0B' }]}>
          <Feather name="alert-triangle" size={18} color="#D97706" style={{ marginTop: 2 }} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.infoBannerTitle, { color: '#B45309' }]}>
              Permohonan Pengunduran Diri Dalam Proses
            </Text>
            <Text style={[styles.infoBannerDesc, { color: '#92400E' }]}>
              Pengajuan Anda sedang menunggu verifikasi DPD PAN Kota Bandung. Seluruh histori kegiatan lapangan dan sertifikasi tetap terlindungi secara permanen.
            </Text>
          </View>
        </View>
      )}

      {/* 2. Banner Penjelasan Multi-Dimensi */}
      <View style={[styles.infoBanner, { backgroundColor: isDark ? 'rgba(0,102,179,0.15)' : '#EFF6FF', borderColor: colors.border }]}>
        <Feather name="info" size={18} color={colors.primary} style={{ marginTop: 2 }} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[styles.infoBannerTitle, { color: colors.text }]}>
            {isOfficialMember ? 'Transparansi Portofolio 7 Dimensi Kader' : 'Transparansi Status Relawan Lapangan'}
          </Text>
          <Text style={[styles.infoBannerDesc, { color: colors.textMuted }]}>
            {isOfficialMember
              ? 'Setiap lapisan peran dan mandat memiliki siklus pengesahan independen yang saling melengkapi tanpa tumpang tindih hak maupun kewajiban.'
              : 'Informasi keaktifan penugasan lapangan, posko binaan, dan akreditasi pelatihan pengawal suara simPAN.'}
          </Text>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 4 LAYER KARTU STRUKTUR & KADERISASI (KHUSUS KADER & ANGGOTA RESMI)        */}
      {/* ========================================================================= */}
      {isOfficialMember && (
        <>
          {/* DIMENSI 1: KARTU KEANGGOTAAN (MEMBERSHIP) */}
          <Card style={[styles.dimensionCard, { borderColor: colors.border }]}>
            <View style={styles.dimensionHeader}>
              <View style={[styles.dimIconBox, { backgroundColor: 'rgba(0, 102, 179, 0.12)' }]}>
                <Feather name="credit-card" size={18} color="#0066B3" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.dimNumber, { color: colors.primary }]}>DIMENSI 1</Text>
                  <Pill
                    label={
                      dims.membership === 'resignation_requested'
                        ? 'PROSES RESIGN (REVIEW DPD)'
                        : dims.membership === 'inactive'
                        ? 'NONAKTIF'
                        : officialMembership
                        ? 'ANGGOTA AKTIF RESMI'
                        : 'BELUM BER-KTA'
                    }
                    tone={
                      dims.membership === 'resignation_requested'
                        ? 'warning'
                        : dims.membership === 'inactive'
                        ? 'danger'
                        : officialMembership
                        ? 'success'
                        : 'info'
                    }
                  />
                </View>
                <Text style={[styles.dimTitle, { color: colors.text }]}>Status Keanggotaan simPAN</Text>
              </View>
            </View>

            <View style={[styles.dimBody, { borderTopColor: colors.border }]}>
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textMuted }]}>Nomor e-KTA Digital</Text>
                <Text style={[styles.propValue, { color: colors.text, fontFamily: fonts.bold }]}>
                  {officialMembership?.ktaNumber || '32.73.01.2024.08912'}
                </Text>
              </View>
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textMuted }]}>Tanggal Registrasi Sah</Text>
                <Text style={[styles.propValue, { color: colors.text }]}>
                  {officialMembership?.registeredAt || '15 Januari 2024'}
                </Text>
              </View>
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textMuted }]}>Asal Teritorial</Text>
                <Text style={[styles.propValue, { color: colors.text }]}>
                  {officialMembership?.dpc || 'DPC Coblong'} | {officialMembership?.dpd || 'DPD Kota Bandung'}
                </Text>
              </View>
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textMuted }]}>Otoritas Verifikasi</Text>
                <Text style={[styles.propValue, { color: colors.text }]}>Sekretariat Jenderal DPP PAN</Text>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('SimpanKta')}
                style={[styles.dimActionBtn, { backgroundColor: isDark ? 'rgba(0,102,179,0.2)' : '#EFF6FF' }]}
                activeOpacity={0.8}
              >
                <Feather name="eye" size={14} color={colors.primary} />
                <Text style={[styles.dimActionBtnText, { color: colors.primary }]}>Buka Kartu e-KTA Digital simPAN</Text>
                <Feather name="arrow-right" size={13} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </Card>

          {/* DIMENSI 2: KARTU PERKADERAN (KADER STATUS) */}
          <Card style={[styles.dimensionCard, { borderColor: colors.border }]}>
            <View style={styles.dimensionHeader}>
              <View style={[styles.dimIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Feather name="award" size={18} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.dimNumber, { color: '#10B981' }]}>DIMENSI 2</Text>
                  <Pill
                    label={
                      dims.kader === 'kader_aktif'
                        ? 'KADER FORMAL MADYA'
                        : dims.kader === 'calon_kader'
                        ? 'CALON KADER (ORIENTASI)'
                        : 'SIMPATISAN / NON-KADER'
                    }
                    tone={dims.kader === 'kader_aktif' ? 'success' : dims.kader === 'calon_kader' ? 'warning' : 'info'}
                  />
                </View>
                <Text style={[styles.dimTitle, { color: colors.text }]}>Status Perkaderan Formal (LKK PAN)</Text>
              </View>
            </View>

            <View style={[styles.dimBody, { borderTopColor: colors.border }]}>
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textMuted }]}>Jenjang Perkaderan</Text>
                <Text style={[styles.propValue, { color: colors.text, fontFamily: fonts.bold }]}>
                  {dims.kader === 'kader_aktif'
                    ? 'LKK Madya (Latihan Kepemimpinan Tingkat Menengah)'
                    : dims.kader === 'calon_kader'
                    ? 'Orientasi Kader Dasar (LKK Pertama)'
                    : 'Belum Mengikuti Diklat Formal'}
                </Text>
              </View>
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textMuted }]}>Jalur Kaderisasi</Text>
                <Text style={[styles.propValue, { color: colors.text }]}>Kader Murni LKKPAN Jawa Barat</Text>
              </View>
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textMuted }]}>No. Sertifikat Kelulusan</Text>
                <Text style={[styles.propValue, { color: colors.text }]}>LKK-PAN-JB-2024-441</Text>
              </View>
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textMuted }]}>Kepatuhan Iuran Kader</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Feather name="check-circle" size={12} color={colors.success} />
                  <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.success }}>Taat & Terverifikasi</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* DIMENSI 3: KARTU ORGANISASI (KEPENGURUSAN) */}
          <Card style={[styles.dimensionCard, { borderColor: colors.border }]}>
            <View style={styles.dimensionHeader}>
              <View style={[styles.dimIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                <Feather name="briefcase" size={18} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.dimNumber, { color: '#3B82F6' }]}>DIMENSI 3</Text>
                  <Pill
                    label={
                      dims.position?.position === 'PENGURUS'
                        ? `PENGURUS ${dims.position.level || 'DPD'}`
                        : dims.position?.position === 'KOORDINATOR'
                        ? 'KOORDINATOR WILAYAH'
                        : dims.position?.position === 'FUNGSIONAR'
                        ? 'FUNGSIONARIS'
                        : 'ANGGOTA BIASA'
                    }
                    tone="info"
                  />
                </View>
                <Text style={[styles.dimTitle, { color: colors.text }]}>Struktur Organisasi & Fungsionaris</Text>
              </View>
            </View>

            <View style={[styles.dimBody, { borderTopColor: colors.border }]}>
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textMuted }]}>Jabatan Struktural</Text>
                <Text style={[styles.propValue, { color: colors.text, fontFamily: fonts.bold }]}>
                  {dims.position?.roleTitle || (dims.position?.position !== 'NONE' ? dims.position?.position : 'Anggota Biasa (Non-Pengurus)')}
                </Text>
              </View>
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textMuted }]}>Masa Khidmat</Text>
                <Text style={[styles.propValue, { color: colors.text }]}>Periode 2020 – 2025</Text>
              </View>
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textMuted }]}>SK Keputusan DPP</Text>
                <Text style={[styles.propValue, { color: colors.text }]}>
                  {dims.position?.skNumber || 'PAN/A/Kpts/KU-SJ/082/2020'}
                </Text>
              </View>
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textMuted }]}>Kluster Penugasan</Text>
                <Text style={[styles.propValue, { color: colors.text }]}>
                  {dims.position?.region || 'Dapil Jabar I (Bandung & Cimahi)'}
                </Text>
              </View>
            </View>
          </Card>

          {/* DIMENSI 4: KARTU ELEKTORAL & PENCALEGAN 2029 */}
          <Card style={[styles.dimensionCard, { borderColor: colors.border }]}>
            <View style={styles.dimensionHeader}>
              <View style={[styles.dimIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
                <Feather name="flag" size={18} color="#A855F7" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.dimNumber, { color: '#A855F7' }]}>DIMENSI 4</Text>
                  <Pill
                    label={
                      dims.electoral?.status === 'CALEG'
                        ? 'CALEG RESMI 2029'
                        : dims.electoral?.status === 'BACALEG'
                        ? 'BACALEG 2029 LOLOS'
                        : 'NON-KONTENSTAN'
                    }
                    tone={dims.electoral?.status !== 'NONE' ? 'primary' : 'info'}
                  />
                </View>
                <Text style={[styles.dimTitle, { color: colors.text }]}>Status Elektoral & Pencalonan</Text>
              </View>
            </View>

            <View style={[styles.dimBody, { borderTopColor: colors.border }]}>
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textMuted }]}>Tingkat Pencalonan</Text>
                <Text style={[styles.propValue, { color: colors.text, fontFamily: fonts.bold }]}>
                  {dims.electoral?.legislativeLevel?.replace('_', ' ') || (dims.electoral?.status !== 'NONE' ? 'DPRD Provinsi Jawa Barat' : 'Non-Calon Legislatif')}
                </Text>
              </View>
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textMuted }]}>Daerah Pemilihan (Dapil)</Text>
                <Text style={[styles.propValue, { color: colors.text }]}>
                  {dims.electoral?.dapil || 'Dapil Jabar I (Kota Bandung - Kota Cimahi)'}
                </Text>
              </View>
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textMuted }]}>Nomor Rekomendasi Urut</Text>
                <Text style={[styles.propValue, { color: '#E60012', fontFamily: fonts.bold }]}>
                  {dims.electoral?.ballotNumber ? `#${dims.electoral.ballotNumber} (Prioritas Pemenangan)` : 'Dalam Proses DCS'}
                </Text>
              </View>
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textMuted }]}>Audit Berkas KPPN</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Feather name="check-circle" size={12} color={colors.success} />
                  <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.success }}>7/7 Dokumen Lengkap</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('SimpanBacaleg')}
                style={[styles.dimActionBtn, { backgroundColor: isDark ? 'rgba(168,85,247,0.15)' : '#FAF5FF' }]}
                activeOpacity={0.8}
              >
                <Feather name="file-text" size={14} color="#A855F7" />
                <Text style={[styles.dimActionBtnText, { color: '#A855F7' }]}>Tinjau Berkas Pencalegan KPPN</Text>
                <Feather name="arrow-right" size={13} color="#A855F7" />
              </TouchableOpacity>
            </View>
          </Card>
        </>
      )}

      {/* DIMENSI 5: KARTU KERELAWANAN (VOLUNTEER) */}
      {(!isOfficialMember || (dims.volunteer !== 'none' && dims.volunteer !== 'inactive')) && (
        <Card style={[styles.dimensionCard, { borderColor: colors.border }]}>
          <View style={styles.dimensionHeader}>
            <View style={[styles.dimIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
              <Feather name="users" size={18} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[styles.dimNumber, { color: '#F59E0B' }]}>
                  {isOfficialMember ? 'DIMENSI 5' : 'STATUS UTAMA'}
                </Text>
                <Pill
                  label={
                    dims.volunteer === 'paused'
                      ? 'BERHENTI SEMENTARA'
                      : dims.volunteer === 'inactive'
                      ? 'NONAKTIF'
                      : 'RELAWAN AKTIF'
                  }
                  tone={
                    dims.volunteer === 'paused'
                      ? 'warning'
                      : dims.volunteer === 'inactive'
                      ? 'danger'
                      : 'success'
                  }
                />
              </View>
              <Text style={[styles.dimTitle, { color: colors.text }]}>
                {isOfficialMember ? 'Status Kerelawanan & Aksi Lapangan' : 'Status Partisipasi Relawan Lapangan'}
              </Text>
            </View>
          </View>

          <View style={[styles.dimBody, { borderTopColor: colors.border }]}>
            <View style={styles.propRow}>
              <Text style={[styles.propLabel, { color: colors.textMuted }]}>Total Aksi Lapangan</Text>
              <Text style={[styles.propValue, { color: colors.text, fontFamily: fonts.bold }]}>
                {currentUser?.volunteerStats?.tasksCompleted || 15} Kegiatan Selesai
              </Text>
            </View>
            <View style={styles.propRow}>
              <Text style={[styles.propLabel, { color: colors.textMuted }]}>Jam Pelatihan / Bimtek</Text>
              <Text style={[styles.propValue, { color: colors.text }]}>
                {currentUser?.volunteerStats?.trainingHours || 12} Jam Terverifikasi
              </Text>
            </View>
            <View style={styles.propRow}>
              <Text style={[styles.propLabel, { color: colors.textMuted }]}>Koordinator Pendamping</Text>
              <Text style={[styles.propValue, { color: colors.text }]}>
                {currentUser?.coordinatorContact?.name || 'Asep Ridwan'} ({currentUser?.coordinatorContact?.region || currentUser?.coordinatorContact?.posko || 'Coblong'})
              </Text>
            </View>
            <View style={styles.propRow}>
              <Text style={[styles.propLabel, { color: colors.textMuted }]}>Hak Portofolio</Text>
              <Text style={[styles.propValue, { color: colors.success, fontFamily: fonts.medium }]}>
                Tersimpan Permanen di Database
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* DIMENSI 6: PROGRAM PEMBINAAN EKOSISTEM */}
      <Card style={[styles.dimensionCard, { borderColor: colors.border }]}>
        <View style={styles.dimensionHeader}>
          <View style={[styles.dimIconBox, { backgroundColor: 'rgba(230, 0, 18, 0.12)' }]}>
            <Feather name="layers" size={18} color="#E60012" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[styles.dimNumber, { color: '#E60012' }]}>
                {isOfficialMember ? 'DIMENSI 6' : 'PROGRAM DIKLAT'}
              </Text>
              <Pill label={isOfficialMember ? '3 PROGRAM AKTIF' : 'MODUL DIKLAT'} tone="danger" />
            </View>
            <Text style={[styles.dimTitle, { color: colors.text }]}>
              {isOfficialMember ? 'Ekosistem Program Pembinaan' : 'Program Pelatihan & Diklat'}
            </Text>
          </View>
        </View>

        <View style={[styles.dimBody, { borderTopColor: colors.border, gap: spacing.xs }]}>
          {/* Sub program 1: Amanat Academy */}
          <View style={[styles.subProgramRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: colors.border }]}>
            <Feather name="book-open" size={16} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.subProgTitle, { color: colors.text }]}>Amanat Academy</Text>
              <Text style={[styles.subProgDesc, { color: colors.textMuted }]}>
                8 Modul tuntas, 3 Sertifikat Kelulusan Resmi
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('AmanatAcademy')}>
              <Feather name="external-link" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Sub program 2: PANdawa */}
          <View style={[styles.subProgramRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: colors.border }]}>
            <Feather name="shield" size={16} color="#D97706" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.subProgTitle, { color: colors.text }]}>PANdawa Satgas Siaga</Text>
              <Text style={[styles.subProgDesc, { color: colors.textMuted }]}>
                Peserta Aktif Diklat Kesiapsiagaan & Tanggap Bencana
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('PandawaProgram')}>
              <Feather name="external-link" size={14} color="#D97706" />
            </TouchableOpacity>
          </View>

          {/* Sub program 3: Saksi BSN PAN */}
          <View style={[styles.subProgramRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: colors.border }]}>
            <Feather name="check-square" size={16} color="#15803D" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.subProgTitle, { color: colors.text }]}>Badan Saksi Nasional (BSN)</Text>
              <Text style={[styles.subProgDesc, { color: colors.textMuted }]}>
                Tersertifikasi Saksi TPS Mandat No. 042/SM-DPP/2026
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('WitnessAcademy')}>
              <Feather name="external-link" size={14} color="#15803D" />
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* DIMENSI 7: TIMELINE RIWAYAT STATUS */}
      <Card style={[styles.dimensionCard, { borderColor: colors.border }]}>
        <View style={styles.dimensionHeader}>
          <View style={[styles.dimIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
            <Feather name="clock" size={18} color="#6366F1" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[styles.dimNumber, { color: '#6366F1' }]}>
                {isOfficialMember ? 'DIMENSI 7' : 'RIWAYAT'}
              </Text>
              <Pill label="TERVERIFIKASI" tone="info" />
            </View>
            <Text style={[styles.dimTitle, { color: colors.text }]}>
              {isOfficialMember ? 'Jejak Audit Siklus Hidup Peran' : 'Riwayat Penugasan & Pelatihan'}
            </Text>
          </View>
        </View>

        <View style={[styles.dimBody, { borderTopColor: colors.border }]}>
          {userTimeline.map((item, idx) => (
            <View key={item.id} style={styles.timelineItem}>
              <View style={styles.timelineLeftCol}>
                <View style={[styles.timelineDot, { backgroundColor: colors.primary }]}>
                  <Feather name={item.icon} size={11} color="#FFFFFF" />
                </View>
                {idx < userTimeline.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineDate, { color: colors.primary }]}>{item.date}</Text>
                <Text style={[styles.timelineTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.timelineDesc, { color: colors.textMuted }]}>{item.description}</Text>
                <View style={styles.timelineMeta}>
                  <Text style={{ fontSize: 10, fontFamily: fonts.medium, color: colors.textMuted }}>
                    Otoritas: <Text style={{ fontFamily: fonts.bold, color: colors.text }}>{item.authority}</Text>
                  </Text>
                  {item.skNumber && (
                    <Text style={{ fontSize: 10, fontFamily: fonts.medium, color: colors.textMuted }}>
                      Ref: <Text style={{ fontFamily: fonts.bold, color: colors.text }}>{item.skNumber}</Text>
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* ========================================================================= */}
      {/* 8. ACTION BAR BAWAH: KELOLA STATUS SAYA                                    */}
      {/* ========================================================================= */}
      <View style={[styles.bottomCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={{ gap: 4, flex: 1 }}>
          <Text style={[styles.bottomCardTitle, { color: colors.text }]}>
            {officialMembership ? 'Tata Kelola Keanggotaan' : 'Kelola Partisipasi Relawan'}
          </Text>
          <Text style={[styles.bottomCardSub, { color: colors.textMuted }]}>
            {officialMembership
              ? 'Pengaturan status keanggotaan resmi partai, pengunduran diri berjenjang, dan hak privasi UU PDP.'
              : 'Pengaturan masa jeda tugas relawan, bursa aksi lapangan, dan status keaktifan.'}
          </Text>
        </View>
        <PrimaryButton
          label={officialMembership ? 'Tata Kelola Keanggotaan' : 'Kelola Partisipasi Relawan'}
          icon="settings"
          onPress={() => navigation.navigate('KelolaStatus')}
          style={{ width: '100%', marginTop: spacing.sm }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },

  // Hero Header
  heroHeader: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  heroName: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  heroSubtitle: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: '#BAE6FD',
  },
  heroNik: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.7)',
  },
  heroPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  quickTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  quickTagText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    gap: 10,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  infoBannerTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  infoBannerDesc: {
    fontSize: 10.5,
    fontFamily: fonts.regular,
    lineHeight: 15,
  },

  // Dimension Cards
  dimensionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  dimensionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
  },
  dimIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimNumber: {
    fontSize: 9.5,
    fontFamily: fonts.bold,
    letterSpacing: 0.8,
  },
  dimTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
    marginTop: 2,
  },
  dimBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    gap: 8,
  },
  propRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  propLabel: {
    fontSize: 11,
    fontFamily: fonts.regular,
    flex: 1,
  },
  propValue: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    textAlign: 'right',
  },
  dimActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  dimActionBtnText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    flex: 1,
    marginLeft: 8,
  },

  // Sub Programs
  subProgramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  subProgTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  subProgDesc: {
    fontSize: 10,
    fontFamily: fonts.regular,
    marginTop: 1,
  },

  // Timeline
  timelineItem: {
    flexDirection: 'row',
    gap: 10,
    position: 'relative',
  },
  timelineLeftCol: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    gap: 2,
    paddingBottom: 14,
  },
  timelineDate: {
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  timelineTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  timelineDesc: {
    fontSize: 11,
    fontFamily: fonts.regular,
    lineHeight: 16,
  },
  timelineMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 3,
  },

  // Bottom Card
  bottomCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  bottomCardTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  bottomCardSub: {
    fontSize: 11,
    fontFamily: fonts.regular,
    lineHeight: 16,
  },
});
