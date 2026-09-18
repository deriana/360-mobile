import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { fonts, fontSize, radius, spacing } from '../theme';
import {
  BSN_PAN_ACADEMY_DATA,
  AcademyModule,
  WitnessCertificate,
} from '../data/witnessAcademy';
import { Card, ConfirmDialog, Pill, PrimaryButton } from '../components/ui';
import { WitnessQuizModal } from '../components/WitnessQuizModal';

export default function WitnessAcademyScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [modules, setModules] = useState<AcademyModule[]>(
    BSN_PAN_ACADEMY_DATA.syllabus_modules
  );
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [certificate, setCertificate] = useState<WitnessCertificate | null>(null);
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone?: 'success' | 'info' | 'danger';
  }>({ visible: false, title: '', message: '' });

  // Calculate global progress
  let totalLessons = 0;
  let completedLessons = 0;
  modules.forEach((mod) => {
    totalLessons += mod.lessons.length;
    completedLessons += mod.lessons.filter((l) => l.is_completed).length;
  });
  const globalPercent = Math.round((completedLessons / totalLessons) * 100);

  const handleOpenModule = (mod: AcademyModule, lessonIdx = 0) => {
    navigation.navigate('WitnessLesson', {
      module: mod,
      initialLessonIdx: lessonIdx,
    });
  };

  const handlePassQuiz = (cert: WitnessCertificate) => {
    setCertificate(cert);
    setDialogConfig({
      visible: true,
      title: 'Akreditasi Saksi Sah!',
      message: `Selamat, Anda lulus dengan nilai ${cert.score}% dan terakreditasi resmi ber-nomor ${cert.certificateNo}.`,
      tone: 'success',
    });
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Academy Banner */}
      <View style={[styles.banner, { backgroundColor: isDark ? '#1E293B' : '#003366', borderColor: colors.border }]}>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={styles.tagRow}>
            <Feather name="award" size={12} color="#93C5FD" />
            <Text style={styles.bannerTag}>KURIKULUM RESMI BSN PAN</Text>
          </View>
          <Text style={styles.bannerTitle}>BSN PAN Witness Academy</Text>
          <Text style={styles.bannerDesc}>
            Pelatihan terstruktur pengawalan suara bilik TPS, pemahaman PKPU, dan verifikasi formulir C1 Plano.
          </Text>
        </View>
        <View style={[styles.bannerIconBox, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
          <Feather name="shield" size={32} color="#FFFFFF" />
        </View>
      </View>

      {/* Global Certification Progress Card */}
      <Card style={{ gap: spacing.md }}>
        <View style={styles.progressHeaderRow}>
          <View style={{ gap: 2 }}>
            <Text style={[styles.progressHeading, { color: colors.text }]}>
              Progres Akreditasi Saksi TPS
            </Text>
            <Text style={[styles.progressSub, { color: colors.textMuted }]}>
              {completedLessons} dari {totalLessons} materi pelajaran telah diselesaikan
            </Text>
          </View>
          <Text style={[styles.globalPercentText, { color: colors.primary }]}>{globalPercent}%</Text>
        </View>

        <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBarFill,
              { backgroundColor: colors.primary, width: `${globalPercent}%` },
            ]}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pill
            label={certificate ? 'Sertifikat Aktif' : globalPercent >= 50 ? 'Siap Uji Sertifikasi' : 'Tahap Pelatihan'}
            tone={certificate ? 'success' : globalPercent >= 50 ? 'warning' : 'info'}
            icon={certificate ? 'award' : 'clock'}
          />

          <TouchableOpacity
            style={[styles.btnQuizQuick, { backgroundColor: colors.primary }]}
            onPress={() => setShowQuizModal(true)}
            activeOpacity={0.85}
          >
            <Feather name="award" size={14} color="#FFFFFF" />
            <Text style={styles.btnQuizQuickText}>
              {certificate ? 'Lihat Sertifikat' : 'Mulai Uji Akreditasi'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Certificate Banner (if unlocked) */}
      {certificate && (
        <View style={[styles.unlockedCertBanner, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: colors.success }]}>
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="check-circle" size={16} color={colors.success} />
              <Text style={[styles.unlockedTitle, { color: colors.success }]}>
                Sertifikat Kompetensi Saksi Aktif
              </Text>
            </View>
            <Text style={[styles.unlockedSub, { color: colors.text }]}>
              No: {certificate.certificateNo} • Nilai: {certificate.score}%
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.btnViewCert, { backgroundColor: colors.success }]}
            onPress={() => setShowQuizModal(true)}
          >
            <Text style={styles.btnViewCertText}>Buka Sertifikat</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modules Syllabus List */}
      <View style={{ gap: spacing.md }}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>
          Silabus Kurikulum Akreditasi Saksi
        </Text>

        {modules.map((mod, modIdx) => {
          const modCompleted = mod.lessons.filter((l) => l.is_completed).length;
          const modPercent = Math.round((modCompleted / mod.lessons.length) * 100);

          return (
            <Card key={mod.module_id} style={{ gap: spacing.sm }}>
              <View style={styles.modTopRow}>
                <View style={[styles.modIconWrap, { backgroundColor: colors.primaryLight }]}>
                  <Feather
                    name={mod.icon as any || 'book-open'}
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={[styles.diffPill, { backgroundColor: colors.border }]}>
                      <Text style={[styles.diffPillText, { color: colors.text }]}>{mod.difficulty}</Text>
                    </View>
                    <Text style={{ fontSize: fontSize.xxs, color: colors.textMuted }}>
                      {mod.estimated_time}
                    </Text>
                  </View>
                  <Text style={[styles.modTitle, { color: colors.text }]}>{mod.module_title}</Text>
                </View>
              </View>

              {/* Module Progress */}
              <View style={{ gap: 4, marginVertical: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: fontSize.xxs, color: colors.textMuted }}>
                    {modCompleted} dari {mod.lessons.length} Pelajaran Selesai
                  </Text>
                  <Text style={{ fontSize: fontSize.xxs, fontWeight: '700', color: colors.primary }}>
                    {modPercent}%
                  </Text>
                </View>
                <View style={[styles.progressBarBgSmall, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { backgroundColor: colors.primary, width: `${modPercent}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Lessons preview items */}
              <View style={{ gap: 6 }}>
                {mod.lessons.map((lesson, lIdx) => (
                  <TouchableOpacity
                    key={lesson.lesson_id}
                    style={[
                      styles.lessonRow,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => handleOpenModule(mod, lIdx)}
                    activeOpacity={0.75}
                  >
                    <Feather
                      name={lesson.is_completed ? 'check-circle' : 'circle'}
                      size={14}
                      color={lesson.is_completed ? colors.success : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.lessonTitle,
                        { color: colors.text, fontWeight: lesson.is_completed ? '600' : '400' },
                      ]}
                      numberOfLines={1}
                    >
                      {lesson.title}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>
                      {lesson.duration}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Action */}
              <PrimaryButton
                label={`Pelajari ${mod.module_title.split(':')[0]}`}
                icon="play-circle"
                variant="secondary"
                onPress={() => handleOpenModule(mod, 0)}
              />
            </Card>
          );
        })}
      </View>

      <WitnessQuizModal
        visible={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        onPassQuiz={handlePassQuiz}
      />

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

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bannerTag: {
    color: '#93C5FD',
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    letterSpacing: 0.3,
  },
  bannerDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  bannerIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressHeading: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
  },
  progressSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
  },
  globalPercentText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarBgSmall: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  btnQuizQuick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  btnQuizQuickText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
  },
  unlockedCertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  unlockedTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
  },
  unlockedSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xxs,
  },
  btnViewCert: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  btnViewCertText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: fontSize.xxs,
  },
  sectionHeading: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    letterSpacing: 0.3,
  },
  modTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  modIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  diffPillText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  modTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  lessonTitle: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
  },
});
