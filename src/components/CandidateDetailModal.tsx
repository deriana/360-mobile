import React from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, Pill, PrimaryButton, SectionTitle } from './ui';
import { fontSize, radius, spacing } from '../theme';
import { getCandidateProfile } from '../data/candidates';

interface CandidateDetailModalProps {
  candidateName: string | null;
  onClose: () => void;
}

export function CandidateDetailModal({ candidateName, onClose }: CandidateDetailModalProps) {
  const { colors } = useTheme();

  if (!candidateName) return null;

  const profile = getCandidateProfile(candidateName);

  return (
    <Modal visible={!!candidateName} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Top Header Row */}
          <View style={styles.topRow}>
            <Pill label="Profil Resmi KPU" tone="success" icon="check-circle" />
            <Pressable hitSlop={12} onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingVertical: spacing.xs }}>
            {/* Candidate Header Badge */}
            <View style={{ alignItems: 'center', gap: spacing.xs, marginVertical: spacing.xs }}>
              <Image source={{ uri: profile.avatarUri }} style={[styles.avatarImage, { borderColor: colors.primary }]} />
              <Text style={[styles.candidateNumber, { color: colors.primary }]}>{profile.numberLabel}</Text>
              <Text style={[styles.candidateTitle, { color: colors.text }]}>{profile.name}</Text>
              <Pill label={profile.partyOrCoalition} tone="neutral" />
            </View>

            {/* Visi & Misi Card */}
            <Card style={{ gap: spacing.xs, backgroundColor: colors.background }}>
              <SectionTitle style={{ marginBottom: 0 }}>Visi Utama</SectionTitle>
              <Text style={[styles.visionText, { color: colors.text }]}>"{profile.vision}"</Text>
            </Card>

            <Card style={{ gap: spacing.xs, backgroundColor: colors.background }}>
              <SectionTitle style={{ marginBottom: 0 }}>Misi Strategis</SectionTitle>
              {profile.mission.map((item, idx) => (
                <View key={idx} style={styles.listItemRow}>
                  <Feather name="check" size={14} color={colors.primary} style={{ marginTop: 2 }} />
                  <Text style={[styles.listItemText, { color: colors.text }]}>{item}</Text>
                </View>
              ))}
            </Card>

            {/* Program Unggulan */}
            <Card style={{ gap: spacing.xs, backgroundColor: colors.background }}>
              <SectionTitle style={{ marginBottom: 0 }}>Program Kerja Unggulan</SectionTitle>
              {profile.programs.map((prog, idx) => (
                <View key={idx} style={styles.programPill}>
                  <Feather name="zap" size={13} color={colors.primary} />
                  <Text style={[styles.programText, { color: colors.text }]}>{prog}</Text>
                </View>
              ))}
            </Card>

            {/* Pendidikan & Pengalaman */}
            <Card style={{ gap: spacing.xs, backgroundColor: colors.background }}>
              <SectionTitle style={{ marginBottom: 0 }}>Latar Belakang & Rekam Jejak</SectionTitle>
              <View style={styles.infoRow}>
                <Feather name="book-open" size={14} color={colors.textMuted} />
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Pendidikan:</Text>
                <Text style={[styles.infoVal, { color: colors.text }]}>{profile.education}</Text>
              </View>
              <View style={styles.infoRow}>
                <Feather name="award" size={14} color={colors.textMuted} />
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Pengalaman:</Text>
                <Text style={[styles.infoVal, { color: colors.text }]}>{profile.experience}</Text>
              </View>
            </Card>

            <PrimaryButton label="Tutup Detail Profil" icon="check" onPress={onClose} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    maxHeight: '90%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    padding: 4,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
  },
  candidateNumber: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  candidateTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    textAlign: 'center',
  },
  visionText: {
    fontSize: fontSize.xs + 1,
    fontStyle: 'italic',
    lineHeight: 18,
    fontWeight: '600',
  },
  listItemRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  listItemText: {
    fontSize: fontSize.xs,
    flex: 1,
    lineHeight: 18,
  },
  programPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  programText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  infoVal: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    flex: 1,
  },
});
