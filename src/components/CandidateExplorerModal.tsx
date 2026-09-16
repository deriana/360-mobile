import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, Modal, Pill, PrimaryButton, SectionTitle } from './ui';
import { fonts, fontSize, radius, spacing } from '../theme';
import { CANDIDATE_PROFILES } from '../data/candidates';
import { CandidateDetailModal } from './CandidateDetailModal';

interface CandidateExplorerModalProps {
  visible: boolean;
  onClose: () => void;
}

type ExplorerFilter = 'all' | 'pilpres' | 'dpr';

export function CandidateExplorerModal({ visible, onClose }: CandidateExplorerModalProps) {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<ExplorerFilter>('all');
  const [selectedCandidateName, setSelectedCandidateName] = useState<string | null>(null);

  if (!visible) return null;

  const profilesList = Object.entries(CANDIDATE_PROFILES).filter(([, p]) => {
    if (filter === 'pilpres') return p.category === 'pilpres';
    if (filter === 'dpr') return p.category === 'dpr';
    return true;
  });

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      variant="bottomSheet"
      title="Profil Paslon & Caleg Pemilu"
      subtitle="Pilih kandidat untuk melihat visi, misi, program kerja, dan rekam jejak."
    >

          {/* Filter Pills */}
          <View style={{ flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.xs }}>
            <Pressable
              onPress={() => setFilter('all')}
              style={[
                styles.filterPill,
                {
                  backgroundColor: filter === 'all' ? colors.primary : colors.background,
                  borderColor: filter === 'all' ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: filter === 'all' ? '#FFFFFF' : colors.text }]}>
                Semua Kandidat
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setFilter('pilpres')}
              style={[
                styles.filterPill,
                {
                  backgroundColor: filter === 'pilpres' ? colors.primary : colors.background,
                  borderColor: filter === 'pilpres' ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: filter === 'pilpres' ? '#FFFFFF' : colors.text }]}>
                Paslon Pilpres
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setFilter('dpr')}
              style={[
                styles.filterPill,
                {
                  backgroundColor: filter === 'dpr' ? colors.primary : colors.background,
                  borderColor: filter === 'dpr' ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: filter === 'dpr' ? '#FFFFFF' : colors.text }]}>
                Caleg DPR RI
              </Text>
            </Pressable>
          </View>

          {/* Candidate List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.xs }}>
            {profilesList.map(([key, cand]) => (
              <Pressable
                key={key}
                onPress={() => setSelectedCandidateName(key)}
                style={({ pressed }) => [pressed && { opacity: 0.8 }]}
              >
                <Card style={{ gap: spacing.xs, backgroundColor: colors.background }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    {cand.runningMateAvatarUri ? (
                      <View style={{ flexDirection: 'row' }}>
                        <Image source={cand.avatarUri} style={[styles.avatar, { borderColor: colors.primary }]} />
                        <Image source={cand.runningMateAvatarUri} style={[styles.avatar, styles.avatarOverlap, { borderColor: colors.primary }]} />
                      </View>
                    ) : (
                      <Image source={cand.avatarUri} style={[styles.avatar, { borderColor: colors.primary }]} />
                    )}
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: colors.primary, textTransform: 'uppercase' }}>
                        {cand.numberLabel}
                      </Text>
                      <Text style={[styles.candTitle, { color: colors.text }]} numberOfLines={2}>
                        {cand.name}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted }} numberOfLines={1}>
                        {cand.partyOrCoalition}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={colors.textMuted} />
                  </View>
                </Card>
              </Pressable>
            ))}

            <PrimaryButton label="Tutup Penjelajah Kandidat" icon="check" variant="secondary" onPress={onClose} />
          </ScrollView>

          {/* Candidate Detail Modal */}
          <CandidateDetailModal
            candidateName={selectedCandidateName}
            onClose={() => setSelectedCandidateName(null)}
          />
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
    gap: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  avatarOverlap: {
    marginLeft: -16,
  },
  candTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs + 1,
  },
});
