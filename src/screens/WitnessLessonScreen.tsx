import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { fonts, fontSize, radius, spacing } from '../theme';
import { AcademyModule, AcademyLesson } from '../data/witnessAcademy';
import { Card, ConfirmDialog, Pill, PrimaryButton } from '../components/ui';
import { WitnessQuizModal } from '../components/WitnessQuizModal';

const { width } = Dimensions.get('window');

export default function WitnessLessonScreen({ route, navigation }: any) {
  const { colors, isDark } = useTheme();
  const passedModule: AcademyModule = route?.params?.module;

  // Local state for module lessons to track completions
  const [currentModule, setCurrentModule] = useState<AcademyModule>(passedModule);
  const [activeLessonIdx, setActiveLessonIdx] = useState<number>(
    route?.params?.initialLessonIdx ?? 0
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone?: 'success' | 'info' | 'danger';
  }>({ visible: false, title: '', message: '' });

  if (!currentModule || !currentModule.lessons || currentModule.lessons.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textMuted, fontFamily: fonts.medium }}>Materi tidak ditemukan.</Text>
      </View>
    );
  }

  const activeLesson: AcademyLesson = currentModule.lessons[activeLessonIdx];

  const handleMarkCompleted = () => {
    const updated = [...currentModule.lessons];
    updated[activeLessonIdx] = {
      ...updated[activeLessonIdx],
      is_completed: true,
    };
    setCurrentModule({
      ...currentModule,
      lessons: updated,
    });

    setDialogConfig({
      visible: true,
      title: 'Materi Selesai!',
      message: `Pelajaran "${activeLesson.title}" berhasil diselesaikan. Progres akreditasi saksi Anda bertambah.`,
      tone: 'success',
    });
  };

  const completedCount = currentModule.lessons.filter((l) => l.is_completed).length;
  const progressPercent = Math.round((completedCount / currentModule.lessons.length) * 100);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Banner Card */}
      <Card style={{ gap: spacing.xs }}>
        <View style={styles.moduleHeaderRow}>
          <View style={[styles.diffBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.diffBadgeText, { color: colors.primary }]}>{currentModule.difficulty}</Text>
          </View>
          <Text style={[styles.timeText, { color: colors.textMuted }]}>
            <Feather name="clock" size={12} color={colors.textMuted} /> {currentModule.estimated_time}
          </Text>
        </View>

        <Text style={[styles.moduleTitle, { color: colors.text }]}>{currentModule.module_title}</Text>

        {/* Progress Bar */}
        <View style={{ gap: 4, marginTop: spacing.xs }}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
              Kelengkapan Modul: {completedCount}/{currentModule.lessons.length} Pelajaran
            </Text>
            <Text style={[styles.progressPercent, { color: colors.primary }]}>{progressPercent}%</Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressBarFill,
                { backgroundColor: colors.primary, width: `${progressPercent}%` },
              ]}
            />
          </View>
        </View>
      </Card>

      {/* Video Simulation Player */}
      <View style={[styles.playerContainer, { backgroundColor: '#0B132B', borderColor: colors.border }]}>
        <View style={styles.watermarkRow}>
          <View style={styles.watermarkTag}>
            <Feather name="tv" size={12} color="#FFFFFF" />
            <Text style={styles.watermarkText}>BSN PAN STREAM HD</Text>
          </View>
          <View style={styles.liveIndicator}>
            <View style={styles.redDot} />
            <Text style={styles.liveText}>INTERAKTIF</Text>
          </View>
        </View>

        <View style={styles.playerCenter}>
          <TouchableOpacity
            style={styles.playBtnLarge}
            onPress={() => setIsPlaying(!isPlaying)}
            activeOpacity={0.85}
          >
            <Feather name={isPlaying ? 'pause' : 'play'} size={32} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.playerTitle} numberOfLines={2}>
            {activeLesson.title}
          </Text>
        </View>

        {/* Player Controls Bar */}
        <View style={styles.playerBottomBar}>
          <View style={styles.playerProgressBg}>
            <View style={[styles.playerProgressFill, { width: isPlaying ? '65%' : '35%' }]} />
          </View>
          <View style={styles.playerControlRow}>
            <Text style={styles.timeLabel}>{isPlaying ? '08:42' : '00:00'} / {activeLesson.duration}</Text>
            <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                <Feather name={isPlaying ? 'pause' : 'play'} size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <Feather name="volume-2" size={16} color="#FFFFFF" />
              <Feather name="maximize" size={16} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </View>

      {/* Lesson Content Body */}
      <Card style={{ gap: spacing.md }}>
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Pill
              label={activeLesson.is_completed ? 'Telah Diselesaikan' : 'Belum Selesai'}
              tone={activeLesson.is_completed ? 'success' : 'neutral'}
              icon={activeLesson.is_completed ? 'check-circle' : 'circle'}
            />
            <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
              Durasi: {activeLesson.duration}
            </Text>
          </View>
          <Text style={[styles.lessonHeading, { color: colors.text }]}>{activeLesson.title}</Text>
        </View>

        <Text style={[styles.lessonDesc, { color: colors.text }]}>{activeLesson.description}</Text>

        {/* Key takeaway points */}
        <View style={[styles.takeawaysCard, { backgroundColor: isDark ? '#1E293B' : '#F0F9FF', borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="bookmark" size={16} color={colors.primary} />
            <Text style={[styles.takeawaysTitle, { color: colors.primary }]}>Poin Kunci SOP Saksi TPS:</Text>
          </View>
          {activeLesson.summaryPoints.map((point, idx) => (
            <View key={`pt-${idx}`} style={styles.pointRow}>
              <View style={[styles.pointDot, { backgroundColor: colors.primary }]}>
                <Feather name="check" size={10} color="#FFFFFF" />
              </View>
              <Text style={[styles.pointText, { color: colors.text }]}>{point}</Text>
            </View>
          ))}
        </View>

        {/* Completion Action */}
        {!activeLesson.is_completed ? (
          <PrimaryButton
            label="Tandai Materi Ini Selesai"
            icon="check-circle"
            onPress={handleMarkCompleted}
          />
        ) : (
          <View style={[styles.completedBanner, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
            <Feather name="award" size={18} color={colors.success} />
            <Text style={[styles.completedBannerText, { color: colors.success }]}>
              Materi ini telah Anda selesaikan dengan baik.
            </Text>
          </View>
        )}
      </Card>

      {/* Lesson Navigation Selector */}
      <Card style={{ gap: spacing.sm }}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Daftar Materi Dalam Modul Ini:</Text>
        <View style={{ gap: spacing.xs }}>
          {currentModule.lessons.map((item, idx) => {
            const isActive = idx === activeLessonIdx;
            return (
              <TouchableOpacity
                key={item.lesson_id}
                style={[
                  styles.lessonItemRow,
                  {
                    backgroundColor: isActive ? colors.primaryLight : colors.background,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setActiveLessonIdx(idx)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.itemIndexCircle,
                    {
                      backgroundColor: item.is_completed
                        ? colors.success
                        : isActive
                        ? colors.primary
                        : colors.surface,
                    },
                  ]}
                >
                  {item.is_completed ? (
                    <Feather name="check" size={12} color="#FFFFFF" />
                  ) : (
                    <Text style={{ color: isActive ? '#FFFFFF' : colors.text, fontSize: fontSize.xs, fontWeight: '700' }}>
                      {idx + 1}
                    </Text>
                  )}
                </View>

                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={[
                      styles.itemTitle,
                      { color: isActive ? colors.primary : colors.text, fontWeight: isActive ? '700' : '500' },
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: fontSize.xxs, color: colors.textMuted }}>
                    {item.type.toUpperCase()} • {item.duration}
                  </Text>
                </View>

                <Feather
                  name={isActive ? 'play-circle' : 'chevron-right'}
                  size={18}
                  color={isActive ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Quiz trigger button */}
      <PrimaryButton
        label="Mulai Kuis Sertifikasi Akreditasi Saksi"
        icon="award"
        variant="secondary"
        onPress={() => setShowQuizModal(true)}
      />

      <WitnessQuizModal
        visible={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        onPassQuiz={() => {
          setDialogConfig({
            visible: true,
            title: 'Sertifikat Diterbitkan!',
            message: 'Selamat, Anda telah lulus uji pemahaman dan tersertifikasi resmi sebagai Saksi Mandat BSN PAN.',
            tone: 'success',
          });
        }}
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
  moduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diffBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  diffBadgeText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxs,
    textTransform: 'uppercase',
  },
  timeText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
  },
  moduleTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
  },
  progressPercent: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  playerContainer: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    height: 220,
    justifyContent: 'space-between',
  },
  watermarkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
  },
  watermarkTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  watermarkText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    color: '#EF4444',
    fontFamily: fonts.bold,
    fontSize: 9,
  },
  playerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  playBtnLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 102, 179, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  playerBottomBar: {
    padding: spacing.sm,
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  playerProgressBg: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  playerProgressFill: {
    height: '100%',
    backgroundColor: '#0066B3',
    borderRadius: 1.5,
  },
  playerControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    color: '#FFFFFF',
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  lessonHeading: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
  },
  lessonDesc: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    lineHeight: 20,
  },
  takeawaysCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  takeawaysTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  pointDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  pointText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  completedBannerText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
  },
  lessonItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  itemIndexCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
  },
});
