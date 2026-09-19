import React, { useState } from 'react';
import {
  Image,
  Modal as RnModal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { fonts, fontSize, radius, spacing } from '../theme';
import { Card, Pill, PrimaryButton, ConfirmDialog } from '../components/ui';
import { BSN_PAN_ACADEMY_DATA, AcademyModule, WitnessCertificate } from '../data/witnessAcademy';
import { WitnessQuizModal } from '../components/WitnessQuizModal';
import QrPlaceholder from '../components/QrPlaceholder';

export interface AmanatCourse {
  id: string;
  title: string;
  category: 'kaderisasi' | 'kampanye' | 'advokasi' | 'bsn';
  categoryLabel: string;
  categoryColor: string;
  level: 'Dasar' | 'Inti' | 'Madya' | 'Utama';
  duration: string;
  lessonsCount: number;
  completedLessons: number;
  instructor: string;
  roleRequired: string;
  thumbnailIcon: string;
  isMandatoryForCadre?: boolean;
  description: string;
}

const COURSES_DATA: AmanatCourse[] = [
  {
    id: 'crs-01',
    title: 'Kepemimpinan Politik & AD/ART PAN (LKK)',
    category: 'kaderisasi',
    categoryLabel: 'Kaderisasi Formal',
    categoryColor: '#0066B3',
    level: 'Madya',
    duration: '120 Menit',
    lessonsCount: 6,
    completedLessons: 6,
    instructor: 'Badan Diklat DPP PAN',
    roleRequired: 'Wajib Seluruh Kader',
    thumbnailIcon: 'award',
    isMandatoryForCadre: true,
    description: 'Materi baku Latihan Kader Amanat (LKK) meliputi sejarah perjuangan PAN, reformasi, tata kelola partai, dan etika kepemimpinan nasional.',
  },
  {
    id: 'crs-02',
    title: 'Public Speaking & Retorika Kampanye Lapangan',
    category: 'kampanye',
    categoryLabel: 'Komunikasi & Pemenangan',
    categoryColor: '#7C3AED',
    level: 'Dasar',
    duration: '75 Menit',
    lessonsCount: 5,
    completedLessons: 4,
    instructor: 'Dr. H. Viva Yoga Mauladi, M.Si.',
    roleRequired: 'Bacaleg & Juru Kampanye',
    thumbnailIcon: 'mic',
    description: 'Teknik persuasi pemilih cerdas, narasi solutif di ruang terbuka, menyusun poin pidato 3 menit, serta manajemen media digital.',
  },
  {
    id: 'crs-03',
    title: 'Strategi Advokasi & Solusi Masalah Rakyat',
    category: 'advokasi',
    categoryLabel: 'Aksi Kerakyatan',
    categoryColor: '#059669',
    level: 'Dasar',
    duration: '90 Menit',
    lessonsCount: 4,
    completedLessons: 2,
    instructor: 'Lembaga Advokasi Kebijakan Publik PAN',
    roleRequired: 'Relawan & Koordinator Posko',
    thumbnailIcon: 'heart',
    description: 'SOP pencatatan aspirasi warga, rujukan darurat sosial, pendampingan kesehatan/pendidikan gratis, dan integrasi data posko.',
  },
  {
    id: 'crs-04',
    title: 'Etika, Integritas Partai, & Anti-Korupsi',
    category: 'kaderisasi',
    categoryLabel: 'Disiplin Organisasi',
    categoryColor: '#DC2626',
    level: 'Dasar',
    duration: '60 Menit',
    lessonsCount: 4,
    completedLessons: 4,
    instructor: 'Mahkamah Partai PAN',
    roleRequired: 'Seluruh Anggota & Fungsionaris',
    thumbnailIcon: 'shield',
    isMandatoryForCadre: true,
    description: 'Pakta integritas fungsionaris, tata kelola dana operasional transparan, kode etik kader, dan pencegahan benturan kepentingan.',
  },
  {
    id: 'crs-05',
    title: 'Pengawalan Suara TPS & Audit C1 Plano BSN',
    category: 'bsn',
    categoryLabel: 'BSN PAN Pengawal Suara',
    categoryColor: '#E60012',
    level: 'Inti',
    duration: '110 Menit',
    lessonsCount: 6,
    completedLessons: 5,
    instructor: 'Kepala BSN PAN Nasional',
    roleRequired: 'Saksi TPS & Koordinator BSN',
    thumbnailIcon: 'check-circle',
    description: 'Buku saku PKPU, deteksi kecurangan C1 Plano, presensi geofence bilik suara, dan eskalasi formulir keberatan saksi.',
  },
];

export default function AmanatAcademyScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const { currentUser, role } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'kaderisasi' | 'kampanye' | 'advokasi' | 'bsn'>('all');
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [certificate, setCertificate] = useState<WitnessCertificate | null>(null);
  const [selectedCertModal, setSelectedCertModal] = useState<any | null>(null);
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone?: 'success' | 'info' | 'warning';
  }>({ visible: false, title: '', message: '' });

  const activeCourses = COURSES_DATA.filter((c) => {
    if (selectedCategory === 'all') return true;
    return c.category === selectedCategory;
  });

  const totalCompleted = COURSES_DATA.reduce((acc, c) => acc + c.completedLessons, 0);
  const totalLessons = COURSES_DATA.reduce((acc, c) => acc + c.lessonsCount, 0);
  const overallPct = Math.round((totalCompleted / totalLessons) * 100);

  const handleOpenCourse = (course: AmanatCourse) => {
    if (course.category === 'bsn') {
      navigation.navigate('WitnessAcademy');
    } else {
      setDialogConfig({
        visible: true,
        title: course.title,
        message: `Modul diklat digital: "${course.description}". Diselenggarakan oleh ${course.instructor}. Progres Anda: ${course.completedLessons}/${course.lessonsCount} bab tuntas.`,
        tone: 'info',
      });
    }
  };

  const handlePassQuiz = (cert: WitnessCertificate) => {
    setCertificate(cert);
    setDialogConfig({
      visible: true,
      title: 'Akreditasi Saksi BSN Sah!',
      message: `Selamat, Anda lulus dengan nilai ${cert.score}% dan terakreditasi nomor: ${cert.certificateNo}. Prasyarat Saksi TPS Anda kini terpenuhi.`,
      tone: 'success',
    });
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Banner Amanat Academy */}
      <View style={[styles.heroBanner, { backgroundColor: isDark ? '#002B52' : '#003366', borderColor: colors.border }]}>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={styles.tagPill}>
            <Feather name="book-open" size={12} color="#93C5FD" />
            <Text style={styles.tagPillText}>PUSAT KOMPETENSI KADER & RELAWAN</Text>
          </View>
          <Text style={styles.heroTitle}>Amanat Academy</Text>
          <Text style={styles.heroSub}>
            Platform e-learning strategis DPP PAN untuk mencetak kader unggul, juru kampanye andal, dan pengawal suara berintegritas.
          </Text>
        </View>
        <View style={styles.heroIconBox}>
          <Feather name="award" size={32} color="#FFFFFF" />
        </View>
      </View>

      {/* 2. Personal Learning Progress (Lanjutkan Belajar) */}
      <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
        <View style={styles.sectionHeaderBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="clock" size={16} color={colors.primary} />
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Lanjutkan Belajar</Text>
          </View>
          <Pill label={`${overallPct}% Tuntas`} tone="primary" />
        </View>

        <View style={[styles.resumeCard, { backgroundColor: isDark ? 'rgba(0, 102, 179, 0.15)' : '#F0F9FF', borderColor: colors.border }]}>
          <View style={{ gap: 4, flex: 1 }}>
            <Text style={[styles.resumeCat, { color: colors.primary }]}>KOMUNIKASI & PEMENANGAN</Text>
            <Text style={[styles.resumeTitle, { color: colors.text }]}>
              Public Speaking & Retorika Kampanye Lapangan
            </Text>
            <Text style={[styles.resumeDesc, { color: colors.textMuted }]}>
              Bab 4: Teknik Menghadapi Pertanyaan Kritis Warga (80% selesai)
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.resumeBtn, { backgroundColor: colors.primary }]}
            onPress={() => handleOpenCourse(COURSES_DATA[1])}
            activeOpacity={0.85}
          >
            <Feather name="play" size={14} color="#FFFFFF" />
            <Text style={styles.resumeBtnText}>Lanjutkan</Text>
          </TouchableOpacity>
        </View>

        {/* Global Progress Track */}
        <View style={{ gap: 4, marginTop: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted }}>
              Progres Pembelajaran Keseluruhan ({totalCompleted}/{totalLessons} Materi)
            </Text>
            <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.primary }}>
              {overallPct}%
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${overallPct}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>
      </Card>

      {/* 3. Program Khusus / Special Pathways (PANdawa & BSN PAN) */}
      <View style={{ gap: spacing.xs }}>
        <Text style={[styles.sectionHeading, { color: colors.text, paddingHorizontal: 4 }]}>
          Jalur Program Unggulan
        </Text>

        <View style={styles.specialProgramsRow}>
          {/* Card PANdawa */}
          <Pressable
            onPress={() => navigation.navigate('PandawaProgram')}
            style={({ pressed }) => [
              styles.specialCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#0F172A',
                borderColor: '#334155',
              },
              pressed && { opacity: 0.9 },
            ]}
          >
            <View style={styles.specialCardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(234, 179, 8, 0.2)' }]}>
                <Feather name="shield" size={18} color="#FBBF24" />
              </View>
              <Pill label="Satgas Muda" tone="warning" />
            </View>
            <Text style={styles.specialCardTitle}>PANdawa</Text>
            <Text style={styles.specialCardSub}>
              Pasukan Muda Tangguh & Waspada. Pengawalan ketertiban rapat umum & tanggap baksos.
            </Text>
            <View style={[styles.specialCardFooter, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
              <Text style={[styles.specialCardLink, { color: '#FBBF24' }]}>Buka Modul Satgas</Text>
              <Feather name="arrow-right" size={13} color="#FBBF24" />
            </View>
          </Pressable>

          {/* Card Saksi BSN */}
          <Pressable
            onPress={() => navigation.navigate('WitnessAcademy')}
            style={({ pressed }) => [
              styles.specialCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#002B52',
                borderColor: '#1D4ED8',
              },
              pressed && { opacity: 0.9 },
            ]}
          >
            <View style={styles.specialCardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(230, 0, 18, 0.2)' }]}>
                <Feather name="check-square" size={18} color="#F87171" />
              </View>
              <Pill label="Akreditasi KPU" tone="danger" />
            </View>
            <Text style={styles.specialCardTitle}>Saksi BSN PAN</Text>
            <Text style={styles.specialCardSub}>
              Bimtek pengawalan bilik TPS, simulasi C1 Plano, dan uji sertifikasi resmi.
            </Text>
            <View style={[styles.specialCardFooter, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
              <Text style={[styles.specialCardLink, { color: '#60A5FA' }]}>Buka Diklat BSN</Text>
              <Feather name="arrow-right" size={13} color="#60A5FA" />
            </View>
          </Pressable>
        </View>
      </View>

      {/* 4. Filter Kategori Kursus */}
      <View style={{ gap: spacing.xs }}>
        <Text style={[styles.sectionHeading, { color: colors.text, paddingHorizontal: 4 }]}>
          Katalog Kursus Pilihan
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { key: 'all' as const, label: 'Semua Bidang' },
            { key: 'kaderisasi' as const, label: 'Kaderisasi LKK' },
            { key: 'kampanye' as const, label: 'Kampanye & Caleg' },
            { key: 'advokasi' as const, label: 'Advokasi Posko' },
            { key: 'bsn' as const, label: 'Kawal Suara BSN' },
          ].map((tab) => {
            const active = selectedCategory === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setSelectedCategory(tab.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: active ? '#FFFFFF' : colors.textMuted, fontFamily: active ? fonts.bold : fonts.medium },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 5. Daftar Kursus */}
      <View style={{ gap: spacing.sm }}>
        {activeCourses.map((course) => {
          const isDone = course.completedLessons === course.lessonsCount;
          const pct = Math.round((course.completedLessons / course.lessonsCount) * 100);

          return (
            <Card key={course.id} style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
              <View style={styles.courseHeader}>
                <View style={[styles.courseIconBox, { backgroundColor: `${course.categoryColor}15` }]}>
                  <Feather name={course.thumbnailIcon as any} size={20} color={course.categoryColor} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.courseCategoryLabel, { color: course.categoryColor }]}>
                      {course.categoryLabel}
                    </Text>
                    {course.isMandatoryForCadre && (
                      <View style={styles.mandatoryBadge}>
                        <Text style={styles.mandatoryBadgeText}>WAJIB KADER</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.courseTitle, { color: colors.text }]}>{course.title}</Text>
                  <Text style={[styles.courseInstructor, { color: colors.textMuted }]}>
                    Pengampu: {course.instructor}
                  </Text>
                </View>
              </View>

              <Text style={[styles.courseDesc, { color: colors.textMuted }]}>
                {course.description}
              </Text>

              {/* Progress & Meta */}
              <View style={[styles.courseMetaRow, { borderColor: colors.border }]}>
                <View style={styles.metaItem}>
                  <Feather name="clock" size={12} color={colors.textMuted} />
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>{course.duration}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Feather name="layers" size={12} color={colors.textMuted} />
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>Tingkat {course.level}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Feather name="check-circle" size={12} color={isDone ? colors.success : colors.primary} />
                  <Text style={[styles.metaText, { color: isDone ? colors.success : colors.text }]}>
                    {course.completedLessons}/{course.lessonsCount} Bab ({pct}%)
                  </Text>
                </View>
              </View>

              <View style={styles.courseActionRow}>
                <TouchableOpacity
                  style={[
                    styles.btnCourseAction,
                    {
                      backgroundColor: isDone ? colors.surface : colors.primary,
                      borderColor: isDone ? colors.border : colors.primary,
                      borderWidth: isDone ? 1 : 0,
                    },
                  ]}
                  onPress={() => handleOpenCourse(course)}
                  activeOpacity={0.85}
                >
                  <Feather name={isDone ? 'rotate-cw' : 'play'} size={13} color={isDone ? colors.text : '#FFFFFF'} />
                  <Text style={[styles.btnCourseActionText, { color: isDone ? colors.text : '#FFFFFF' }]}>
                    {isDone ? 'Ulas Kembali' : 'Buka Materi'}
                  </Text>
                </TouchableOpacity>

                {course.category === 'bsn' && (
                  <TouchableOpacity
                    style={[styles.btnQuizBadge, { borderColor: colors.primary }]}
                    onPress={() => setShowQuizModal(true)}
                    activeOpacity={0.85}
                  >
                    <Feather name="award" size={13} color={colors.primary} />
                    <Text style={[styles.btnQuizBadgeText, { color: colors.primary }]}>Uji Akreditasi</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          );
        })}
      </View>

      {/* 6. Koleksi Sertifikat Digital */}
      <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
        <View style={styles.sectionHeaderBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="file-text" size={16} color={colors.primary} />
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Sertifikat Digital Anda</Text>
          </View>
          <Pill label="Terverifikasi DPP" tone="success" />
        </View>

        <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.regular }}>
          Sertifikat kelulusan diklat resmi yang diakui dalam portofolio kaderisasi dan mandat saksi partai:
        </Text>

        <View style={{ gap: spacing.xs }}>
          {[
            {
              id: 'cert-1',
              title: 'Sertifikat Kelulusan Latihan Kader Amanat (LKK Madya)',
              no: 'PAN/LKK-DPD/BDG/2024/0082',
              date: '15 Maret 2024',
              issuer: 'Badan Perkaderan DPP PAN',
              verified: true,
            },
            {
              id: 'cert-2',
              title: 'Akreditasi Pengawal Suara & Saksi Pemilu BSN PAN',
              no: 'BSN-PAN/BDG-014/2024/091',
              date: '02 September 2026',
              issuer: 'Badan Saksi Nasional PAN',
              verified: true,
            },
            {
              id: 'cert-3',
              title: 'Sertifikat Kesamaptaan Satgas Muda PANdawa',
              no: 'PDW-SATGAS/JB-01/2025/112',
              date: '20 November 2025',
              issuer: 'Komando Satgas PANdawa Jawa Barat',
              verified: true,
            },
          ].map((cert) => (
            <Pressable
              key={cert.id}
              onPress={() => setSelectedCertModal(cert)}
              style={({ pressed }) => [
                styles.certRow,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: colors.border },
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={styles.certIcon}>
                <Feather name="award" size={18} color="#D97706" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.certTitle, { color: colors.text }]} numberOfLines={1}>
                  {cert.title}
                </Text>
                <Text style={[styles.certSub, { color: colors.textMuted }]}>
                  {cert.no} • {cert.date}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Modal Detail Sertifikat Digital */}
      {selectedCertModal && (
        <RnModal
          visible={!!selectedCertModal}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedCertModal(null)}
        >
          <View style={styles.certModalOverlay}>
            <View style={[styles.certModalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.certModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name="award" size={18} color={colors.primary} />
                  <Text style={[styles.certModalTitle, { color: colors.text }]}>E-Sertifikat Terverifikasi</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedCertModal(null)} hitSlop={8}>
                  <Feather name="x" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.certPreviewBox}>
                <Text style={styles.certPreviewOrg}>PARTAI AMANAT NASIONAL</Text>
                <Text style={styles.certPreviewSubOrg}>AMANAT ACADEMY DIGITAL CREDENTIAL</Text>
                <View style={styles.certDivider} />
                <Text style={styles.certPresentedTo}>DIBERIKAN KEPADA:</Text>
                <Text style={styles.certRecipientName}>{currentUser?.identity?.name || 'Ahmad Fauzan'}</Text>
                <Text style={styles.certCourseName}>{selectedCertModal.title}</Text>
                <Text style={styles.certSerialNo}>No. Sertifikat: {selectedCertModal.no}</Text>
                <Text style={styles.certDateIssuer}>Diterbitkan oleh {selectedCertModal.issuer} pada {selectedCertModal.date}</Text>

                <View style={styles.certQrRow}>
                  <QrPlaceholder seed="AMANAT-CERT-3273" size={72} />
                  <View style={{ gap: 2 }}>
                    <Text style={styles.certQrLabel}>VERIFIKASI KEABSAHAN</Text>
                    <Text style={styles.certQrSub}>Pindai QR untuk validasi ke database pusat DPP PAN.</Text>
                    <View style={styles.badgeValid}>
                      <Feather name="check" size={11} color="#059669" />
                      <Text style={styles.badgeValidText}>STATUS: SAH & AKTIF</Text>
                    </View>
                  </View>
                </View>
              </View>

              <PrimaryButton
                label="Tutup Pratinjau"
                onPress={() => setSelectedCertModal(null)}
              />
            </View>
          </View>
        </RnModal>
      )}

      {/* Witness Quiz Modal */}
      <WitnessQuizModal
        visible={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        onPassQuiz={handlePassQuiz}
      />

      {/* Global Dialog */}
      <ConfirmDialog
        visible={dialogConfig.visible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        tone={dialogConfig.tone}
        confirmLabel="Tutup"
        onConfirm={() => setDialogConfig({ visible: false, title: '', message: '' })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 40,
  },
  heroBanner: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  tagPillText: {
    fontSize: 9.5,
    fontFamily: fonts.bold,
    color: '#93C5FD',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  heroSub: {
    fontSize: 11.5,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
  },
  heroIconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  resumeCat: {
    fontSize: 9.5,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
  resumeTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  resumeDesc: {
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontFamily: fonts.bold,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  specialProgramsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  specialCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 6,
  },
  specialCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialCardTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  specialCardSub: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#CBD5E1',
    lineHeight: 15,
  },
  specialCardFooter: {
    marginTop: 4,
  },
  specialCardLink: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  courseHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  courseIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseCategoryLabel: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 0.4,
  },
  mandatoryBadge: {
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  mandatoryBadgeText: {
    fontSize: 8.5,
    fontFamily: fonts.bold,
    color: '#DC2626',
  },
  courseTitle: {
    fontSize: 13.5,
    fontFamily: fonts.bold,
  },
  courseInstructor: {
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  courseDesc: {
    fontSize: 11.5,
    fontFamily: fonts.regular,
    lineHeight: 16,
  },
  courseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 10.5,
    fontFamily: fonts.medium,
  },
  courseActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  btnCourseAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    flex: 1,
  },
  btnCourseActionText: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  btnQuizBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
  btnQuizBadgeText: {
    fontSize: 11.5,
    fontFamily: fonts.bold,
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  certIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  certTitle: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  certSub: {
    fontSize: 10.5,
    fontFamily: fonts.regular,
  },
  certModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  certModalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  certModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  certModalTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  certPreviewBox: {
    backgroundColor: '#0F172A',
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: '#D97706',
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  certPreviewOrg: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: '#FBBF24',
    letterSpacing: 0.8,
  },
  certPreviewSubOrg: {
    fontSize: 9,
    fontFamily: fonts.medium,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  certDivider: {
    height: 1,
    width: '80%',
    backgroundColor: '#334155',
    marginVertical: 6,
  },
  certPresentedTo: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  certRecipientName: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    marginVertical: 2,
  },
  certCourseName: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: '#60A5FA',
    textAlign: 'center',
  },
  certSerialNo: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: '#CBD5E1',
    marginTop: 2,
  },
  certDateIssuer: {
    fontSize: 9,
    fontFamily: fonts.regular,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
  },
  certQrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 8,
    borderRadius: radius.sm,
    width: '100%',
  },
  certQrLabel: {
    fontSize: 9.5,
    fontFamily: fonts.bold,
    color: '#FBBF24',
  },
  certQrSub: {
    fontSize: 8.5,
    fontFamily: fonts.regular,
    color: '#94A3B8',
    maxWidth: 180,
  },
  badgeValid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  badgeValidText: {
    fontSize: 8.5,
    fontFamily: fonts.bold,
    color: '#34D399',
  },
});
