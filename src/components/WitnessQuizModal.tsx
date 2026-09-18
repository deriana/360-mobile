import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { fonts, fontSize, radius, spacing } from '../theme';
import { BSN_PAN_ACADEMY_DATA, QuizQuestion, WitnessCertificate } from '../data/witnessAcademy';
import QrPlaceholder from './QrPlaceholder';

const { width } = Dimensions.get('window');

interface WitnessQuizModalProps {
  visible: boolean;
  witnessName?: string;
  witnessNik?: string;
  assignedTps?: string;
  onClose: () => void;
  onPassQuiz: (cert: WitnessCertificate) => void;
}

export const WitnessQuizModal: React.FC<WitnessQuizModalProps> = ({
  visible,
  witnessName = 'Saksi Mandat BSN PAN',
  witnessNik = '3273260101980001',
  assignedTps = 'TPS 014 Sukajadi, Kota Bandung',
  onClose,
  onPassQuiz,
}) => {
  const { colors, isDark } = useTheme();
  const questions: QuizQuestion[] = BSN_PAN_ACADEMY_DATA.quiz_questions;

  const [currentQIdx, setCurrentQIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    new Array(questions.length).fill(-1)
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [certificateData, setCertificateData] = useState<WitnessCertificate | null>(null);

  const activeQuestion = questions[currentQIdx];

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQIdx] = optIdx;
    setSelectedAnswers(newAnswers);
  };

  const handleNextOrSubmit = () => {
    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx(currentQIdx + 1);
    } else {
      let correct = 0;
      selectedAnswers.forEach((ans, idx) => {
        if (ans === questions[idx].correctAnswerIndex) correct++;
      });

      const scorePercent = Math.round((correct / questions.length) * 100);
      setIsSubmitted(true);

      if (correct >= 4) {
        const cert: WitnessCertificate = {
          certificateNo: `BSN-PAN/CERT/2026/${Math.floor(10000 + Math.random() * 90000)}`,
          witnessName,
          nik: witnessNik,
          score: scorePercent,
          passedAt: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          assignedTps,
          qrToken: `BSN-ACADEMY-PASS-${Date.now()}`,
        };
        setCertificateData(cert);
        setShowCertificate(true);
        onPassQuiz(cert);
      }
    }
  };

  const handleResetQuiz = () => {
    setCurrentQIdx(0);
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setIsSubmitted(false);
    setShowCertificate(false);
    setCertificateData(null);
  };

  const correctCount = selectedAnswers.filter(
    (ans, idx) => ans === questions[idx].correctAnswerIndex
  ).length;
  const isPassed = correctCount >= 4;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={styles.tagRow}>
                <Feather name="award" size={12} color={colors.primary} />
                <Text style={[styles.tag, { color: colors.primary }]}>EVALUASI AKREDITASI SAKSI</Text>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {showCertificate ? 'Sertifikat Kelulusan Resmi' : 'Uji Pemahaman SOP Saksi TPS'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.background }]} hitSlop={8}>
              <Feather name="x" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {showCertificate && certificateData ? (
              /* CERTIFICATE VIEW */
              <View style={[styles.certContainer, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.primary }]}>
                <View style={styles.certHeader}>
                  <View style={[styles.certLogoBadge, { backgroundColor: colors.primaryLight }]}>
                    <Feather name="shield" size={28} color={colors.primary} />
                  </View>
                  <Text style={[styles.certOrg, { color: colors.primary }]}>BADAN SAKSI NASIONAL (BSN PAN)</Text>
                  <Text style={[styles.certMainTitle, { color: colors.text }]}>SERTIFIKAT KOMPETENSI SAKSI TPS</Text>
                  <Text style={[styles.certSub, { color: colors.textMuted }]}>
                    No. Dokumen: {certificateData.certificateNo}
                  </Text>
                </View>

                <View style={[styles.certDivider, { backgroundColor: colors.border }]} />

                <View style={styles.certBody}>
                  <Text style={[styles.certGivenText, { color: colors.textMuted }]}>Diberikan secara sah dan terdaftar kepada:</Text>
                  <Text style={[styles.certName, { color: colors.text }]}>{certificateData.witnessName}</Text>
                  <Text style={[styles.certNik, { color: colors.textMuted }]}>NIK: {certificateData.nik}</Text>

                  <View style={[styles.certScoreBadge, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: colors.success }]}>
                    <Feather name="check-circle" size={16} color={colors.success} />
                    <Text style={[styles.certScoreText, { color: colors.success }]}>
                      LULUS AKREDITASI • NILAI: {certificateData.score}% (SANGAT BAIK)
                    </Text>
                  </View>

                  <Text style={[styles.certDesc, { color: colors.textMuted }]}>
                    Telah menyelesaikan seluruh rangkaian pelatihan teknis pemungutan, penghitungan suara, dan pengawalan formulir C.Hasil-KWK Plano Pemilu 2026.
                  </Text>
                </View>

                <View style={[styles.certDivider, { backgroundColor: colors.border }]} />

                <View style={styles.certFooter}>
                  <View style={styles.certQrBox}>
                    <QrPlaceholder seed={certificateData.qrToken} size={64} />
                    <Text style={[styles.certQrLabel, { color: colors.textMuted }]}>Verifikasi Kriptografis</Text>
                  </View>
                  <View style={styles.certSignBox}>
                    <Text style={[styles.certDate, { color: colors.textMuted }]}>Jakarta, {certificateData.passedAt}</Text>
                    <Text style={[styles.certSigner, { color: colors.text }]}>Direktur Eksekutif BSN DPP PAN</Text>
                    <Text style={[styles.certAuthStatus, { color: colors.primary }]}>✓ Dokumen Sah Terakreditasi</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.btnAction, { backgroundColor: colors.primary }]}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <Feather name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.btnActionText}>Selesai & Simpan ke Profil</Text>
                </TouchableOpacity>
              </View>
            ) : isSubmitted ? (
              /* QUIZ RESULT VIEW (IF FAILED) */
              <View style={styles.resultContainer}>
                <View style={[styles.resultBadge, { backgroundColor: isPassed ? '#ECFDF5' : '#FEF2F2' }]}>
                  <Feather
                    name={isPassed ? 'check-circle' : 'alert-triangle'}
                    size={36}
                    color={isPassed ? colors.success : colors.danger}
                  />
                  <Text style={[styles.resultTitle, { color: colors.text }]}>
                    {isPassed ? 'Selamat, Anda Lulus Akreditasi!' : 'Belum Mencapai Nilai Kelulusan'}
                  </Text>
                  <Text style={[styles.resultScore, { color: isPassed ? colors.success : colors.danger }]}>
                    Skor Anda: {Math.round((correctCount / questions.length) * 100)}% ({correctCount} dari {questions.length} Soal Benar)
                  </Text>
                  <Text style={[styles.resultDesc, { color: colors.textMuted }]}>
                    {isPassed
                      ? 'Anda telah menguasai kompetensi dasar saksi TPS dan berhak menerima sertifikat resmi BSN PAN.'
                      : 'Standar akreditasi saksi BSN PAN minimal 80% (minimal 4 soal benar). Silakan pelajari kembali ringkasan materi dan ulangi kuis.'}
                  </Text>
                </View>

                {/* Review explanations */}
                <View style={{ gap: spacing.sm, width: '100%' }}>
                  <Text style={[styles.reviewHeader, { color: colors.text }]}>Pembahasan Soal:</Text>
                  {questions.map((q, idx) => {
                    const isCorrect = selectedAnswers[idx] === q.correctAnswerIndex;
                    return (
                      <View
                        key={q.id}
                        style={[
                          styles.reviewCard,
                          {
                            backgroundColor: colors.background,
                            borderColor: isCorrect ? colors.success : colors.danger,
                          },
                        ]}
                      >
                        <View style={styles.reviewCardTop}>
                          <Text style={[styles.reviewQNum, { color: colors.text }]}>Soal {idx + 1}</Text>
                          <View style={[styles.statusPill, { backgroundColor: isCorrect ? '#ECFDF5' : '#FEF2F2' }]}>
                            <Feather
                              name={isCorrect ? 'check' : 'x'}
                              size={12}
                              color={isCorrect ? colors.success : colors.danger}
                            />
                            <Text style={{ fontSize: 10, fontWeight: '700', color: isCorrect ? colors.success : colors.danger }}>
                              {isCorrect ? 'Benar' : 'Salah'}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.reviewQText, { color: colors.text }]}>{q.question}</Text>
                        <Text style={[styles.reviewAnswerText, { color: colors.primary }]}>
                          Kunci: {q.options[q.correctAnswerIndex]}
                        </Text>
                        <Text style={[styles.reviewExplanation, { color: colors.textMuted }]}>
                          {q.explanation}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.btnAction, { backgroundColor: colors.primary, flex: 1 }]}
                    onPress={handleResetQuiz}
                    activeOpacity={0.85}
                  >
                    <Feather name="rotate-ccw" size={16} color="#FFFFFF" />
                    <Text style={styles.btnActionText}>Ulangi Kuis</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btnSecondary, { borderColor: colors.border, flex: 1 }]}
                    onPress={onClose}
                  >
                    <Text style={[styles.btnSecondaryText, { color: colors.text }]}>Tutup</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* ACTIVE QUESTION VIEW */
              <View style={styles.questionContainer}>
                {/* Progress bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressTextRow}>
                    <Text style={[styles.qCounter, { color: colors.textMuted }]}>
                      Pertanyaan {currentQIdx + 1} dari {questions.length}
                    </Text>
                    <Text style={[styles.qPercent, { color: colors.primary }]}>
                      {Math.round(((currentQIdx + 1) / questions.length) * 100)}%
                    </Text>
                  </View>
                  <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          backgroundColor: colors.primary,
                          width: `${((currentQIdx + 1) / questions.length) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Question box */}
                <View style={[styles.qBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.questionText, { color: colors.text }]}>
                    {activeQuestion.question}
                  </Text>
                </View>

                {/* Options list */}
                <View style={styles.optionsList}>
                  {activeQuestion.options.map((opt, idx) => {
                    const isSelected = selectedAnswers[currentQIdx] === idx;
                    return (
                      <TouchableOpacity
                        key={`opt-${idx}`}
                        style={[
                          styles.optionCard,
                          {
                            backgroundColor: isSelected ? colors.primaryLight : colors.background,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => handleSelectOption(idx)}
                        activeOpacity={0.75}
                      >
                        <View
                          style={[
                            styles.optionLetter,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.surface,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionLetterText,
                              { color: isSelected ? '#FFFFFF' : colors.text },
                            ]}
                          >
                            {String.fromCharCode(65 + idx)}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.optionText,
                            { color: isSelected ? colors.primary : colors.text, fontWeight: isSelected ? '700' : '400' },
                          ]}
                        >
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Question Footer Buttons */}
                <View style={styles.questionNavRow}>
                  {currentQIdx > 0 ? (
                    <TouchableOpacity
                      style={[styles.btnNav, { borderColor: colors.border }]}
                      onPress={() => setCurrentQIdx(currentQIdx - 1)}
                    >
                      <Feather name="arrow-left" size={16} color={colors.text} />
                      <Text style={[styles.btnNavText, { color: colors.text }]}>Sebelumnya</Text>
                    </TouchableOpacity>
                  ) : <View />}

                  <TouchableOpacity
                    style={[
                      styles.btnNext,
                      {
                        backgroundColor: selectedAnswers[currentQIdx] === -1 ? colors.border : colors.primary,
                      },
                    ]}
                    disabled={selectedAnswers[currentQIdx] === -1}
                    onPress={handleNextOrSubmit}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.btnNextText}>
                      {currentQIdx === questions.length - 1 ? 'Kirim Jawaban' : 'Selanjutnya'}
                    </Text>
                    <Feather
                      name={currentQIdx === questions.length - 1 ? 'check' : 'arrow-right'}
                      size={16}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tag: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxs,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingVertical: spacing.md,
  },
  questionContainer: {
    gap: spacing.md,
  },
  progressBarContainer: {
    gap: 4,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qCounter: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
  },
  qPercent: {
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
  qBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  questionText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
  optionsList: {
    gap: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
  },
  optionText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  questionNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  btnNavText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
  },
  btnNext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  btnNextText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
  },
  resultContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  resultBadge: {
    width: '100%',
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 6,
  },
  resultTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  resultScore: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  resultDesc: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  reviewHeader: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 4,
  },
  reviewCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewQNum: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  reviewQText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  reviewAnswerText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
  },
  reviewExplanation: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xxs,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.xs,
  },
  btnAction: {
    height: 44,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
  },
  btnActionText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
  },
  btnSecondary: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
  },
  certContainer: {
    borderWidth: 2,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  certHeader: {
    alignItems: 'center',
    gap: 4,
  },
  certLogoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  certOrg: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxs,
    letterSpacing: 1,
  },
  certMainTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  certSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xxs,
  },
  certDivider: {
    height: 1,
    width: '100%',
  },
  certBody: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
  },
  certGivenText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xxs,
  },
  certName: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  certNik: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
  },
  certScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 4,
  },
  certScoreText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxs,
  },
  certDesc: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xxs,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: spacing.xs,
  },
  certFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  certQrBox: {
    alignItems: 'center',
    gap: 4,
  },
  certQrLabel: {
    fontFamily: fonts.regular,
    fontSize: 8,
  },
  certSignBox: {
    alignItems: 'flex-end',
    gap: 2,
  },
  certDate: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xxs,
  },
  certSigner: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
  },
  certAuthStatus: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xxs,
  },
});
