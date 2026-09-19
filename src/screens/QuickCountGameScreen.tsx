import React, { useState } from 'react';
import {
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { PASLON_AVATARS } from '../data/images';
import { CURRENT_WITNESS_ID } from '../utils/scope';
import { addToOfflineQueue } from '../utils/offlineQueue';

const PASLON_KEYS = [
  'Paslon 01 — Anies & Muhaimin',
  'Paslon 02 — Prabowo & Gibran',
  'Paslon 03 — Ganjar & Mahfud',
];

function paslonParts(key: string) {
  const [number, name] = key.split(' — ');
  return { number, name };
}

const RANK_COLORS = ['#F59E0B', '#94A3B8', '#B45309'];

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental &&
  !(globalThis as any).nativeFabricUIManager
) {
  try {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  } catch {}
}

function Billboard({ votes, colors }: { votes: Record<string, number>; colors: any }) {
  const ranked = [...PASLON_KEYS].sort((a, b) => (votes[b] ?? 0) - (votes[a] ?? 0));
  const leaderVotes = Math.max(votes[ranked[0]] ?? 0, 1);

  return (
    <Card style={{ gap: spacing.sm }}>
      <SectionTitle>🏆 Papan Peringkat Suara TPS Anda</SectionTitle>
      {ranked.map((key, idx) => {
        const { number, name } = paslonParts(key);
        const count = votes[key] ?? 0;
        const pct = Math.round((count / leaderVotes) * 100);
        return (
          <View key={key} style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <View style={[styles.rankBadge, { backgroundColor: RANK_COLORS[idx] ?? colors.border }]}>
                <Text style={styles.rankBadgeText}>{idx + 1}</Text>
              </View>
              <Image source={PASLON_AVATARS[key]} style={styles.rankAvatar} />
              <Text style={[styles.rankName, { color: colors.text }]} numberOfLines={1}>
                {number} — {name}
              </Text>
              <Text style={[styles.rankVotes, { color: colors.primary }]}>{count}</Text>
            </View>
            <View style={[styles.rankBarTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.rankBarFill, { width: `${pct}%`, backgroundColor: RANK_COLORS[idx] ?? colors.primary }]} />
            </View>
          </View>
        );
      })}
    </Card>
  );
}

export default function QuickCountGameScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { witnesses } = useApp();
  const witness = witnesses.find((w) => w.id === CURRENT_WITNESS_ID);
  const [votes, setVotes] = useState<Record<string, number>>(
    Object.fromEntries(PASLON_KEYS.map((k) => [k, 0])),
  );
  const [invalidVotes, setInvalidVotes] = useState(0);
  const [locked, setLocked] = useState(false);
  const [confirmFinishVisible, setConfirmFinishVisible] = useState(false);

  const totalCandidateVotes = PASLON_KEYS.reduce((sum, k) => sum + (votes[k] ?? 0), 0);
  const totalVotes = totalCandidateVotes + invalidVotes;

  const addVote = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVotes((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
  };

  const subtractVote = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVotes((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] ?? 0) - 1) }));
  };

  const addInvalid = () => setInvalidVotes((v) => v + 1);
  const subtractInvalid = () => setInvalidVotes((v) => Math.max(0, v - 1));

  const finishCounting = () => {
    setConfirmFinishVisible(true);
  };

  const resetCount = () => {
    setVotes(Object.fromEntries(PASLON_KEYS.map((k) => [k, 0])));
    setInvalidVotes(0);
    setLocked(false);
  };

  const sendToC1Report = () => {
    // Simpan telemetry sinkronisasi POST /api/v1/tps/quick-tally
    const tallyPayload = {
      tpsId: witness?.assignedTpsId || 'TPS-001',
      paslonVotes: votes,
      invalidVotes,
      totalCounted: totalVotes,
      timestamp: new Date().toISOString(),
      partialCount: !locked,
    };
    addToOfflineQueue('quick_tally', tallyPayload);

    navigation.navigate('ReportForm', {
      tpsId: witness?.assignedTpsId || 'TPS-001',
      prefillCandidateVotes: votes,
      prefillInvalidVotes: invalidVotes,
      source: 'quick_count',
      importedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Card style={{ gap: spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[styles.title, { color: colors.text }]}>Hitung Cepat Suara Pilpres</Text>
          <Pressable onPress={resetCount} hitSlop={8}>
            <Feather name="refresh-cw" size={18} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
          </Pressable>
        </View>
        <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
          Ketuk +1 setiap surat suara sah dibacakan petugas KPPS. Hasil tally ini bisa langsung dipakai mengisi
          Laporan C1 supaya angkanya cocok dan akurat.
        </Text>
        <Pill label={`${totalVotes} suara dihitung`} tone="info" />
      </Card>

      {!locked ? (
        <View style={{ gap: spacing.sm }}>
          {PASLON_KEYS.map((key) => {
            const { number, name } = paslonParts(key);
            return (
              <Card key={key} style={styles.candidateRow}>
                <Image source={PASLON_AVATARS[key]} style={styles.avatar} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>{number}</Text>
                  <Text style={[styles.candidateName, { color: colors.text }]} numberOfLines={1}>{name}</Text>
                  <Text style={[styles.voteCount, { color: colors.primary }]}>{votes[key] ?? 0}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Pressable
                    onPress={() => subtractVote(key)}
                    disabled={(votes[key] ?? 0) === 0}
                    style={({ pressed }) => [
                      styles.stepButton,
                      { backgroundColor: colors.dangerBg },
                      (votes[key] ?? 0) === 0 && { opacity: 0.4 },
                      pressed && (votes[key] ?? 0) > 0 && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                    ]}
                  >
                    <Text style={[styles.stepButtonText, { color: colors.danger }]}>-1</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => addVote(key)}
                    style={({ pressed }) => [
                      styles.stepButton,
                      { backgroundColor: colors.primary },
                      pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                    ]}
                  >
                    <Text style={styles.plusButtonText}>+1</Text>
                  </Pressable>
                </View>
              </Card>
            );
          })}

          <Card style={styles.candidateRow}>
            <View style={[styles.invalidIconWrap, { backgroundColor: colors.dangerBg }]}>
              <Feather name="x-circle" size={20} color={colors.danger} strokeWidth={iconStrokeWidth} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.candidateName, { color: colors.text }]}>Suara Tidak Sah</Text>
              <Text style={[styles.voteCount, { color: colors.danger }]}>{invalidVotes}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable
                onPress={subtractInvalid}
                disabled={invalidVotes === 0}
                style={({ pressed }) => [
                  styles.stepButton,
                  { backgroundColor: colors.dangerBg },
                  invalidVotes === 0 && { opacity: 0.4 },
                  pressed && invalidVotes > 0 && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                ]}
              >
                <Text style={[styles.stepButtonText, { color: colors.danger }]}>-1</Text>
              </Pressable>
              <Pressable
                onPress={addInvalid}
                style={({ pressed }) => [
                  styles.stepButton,
                  { backgroundColor: colors.danger },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                ]}
              >
                <Text style={styles.plusButtonText}>+1</Text>
              </Pressable>
            </View>
          </Card>

          <Billboard votes={votes} colors={colors} />

          <PrimaryButton label="Selesai Hitung" onPress={finishCounting} disabled={totalVotes === 0} />
        </View>
      ) : (
        <>
          <Billboard votes={votes} colors={colors} />
          <Card style={{ gap: spacing.sm, alignItems: 'center' }}>
            <Feather name="check-circle" size={36} color={colors.success} strokeWidth={iconStrokeWidth} />
            <Text style={[styles.title, { color: colors.text }]}>Hitungan Terkunci</Text>
            <View style={{ flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Pill label={`${totalCandidateVotes} Suara Sah`} tone="success" />
              <Pill label={`${invalidVotes} Suara Tidak Sah`} tone="danger" />
              <Pill label={`${totalVotes} Total Suara`} tone="info" />
            </View>
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
              Lanjutkan ke Laporan C1 supaya hasil hitungan ini tersimpan resmi dan diakurkan dengan formulir C1 Plano.
            </Text>
            <PrimaryButton label="Isi ke Laporan C1" icon="send" onPress={sendToC1Report} />
            <PrimaryButton label="Hitung Ulang" icon="refresh-cw" variant="outline" onPress={resetCount} />
          </Card>
        </>
      )}

      <ConfirmDialog
        visible={confirmFinishVisible}
        title="Selesai Hitung Suara?"
        message="Tally akan dikunci. Pastikan setiap surat suara sah sudah dihitung dan cocok dengan saksi lain sebelum lanjut ke laporan C1."
        tone="primary"
        confirmLabel="Ya, Selesai"
        cancelLabel="Batal"
        onConfirm={() => {
          setConfirmFinishVisible(false);
          setLocked(true);
        }}
        onCancel={() => setConfirmFinishVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg },
  candidateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: radius.md },
  candidateName: { fontFamily: fonts.semiBold, fontSize: fontSize.md },
  voteCount: { fontFamily: fonts.extraBold, fontSize: fontSize.xl },
  stepButton: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  stepButtonText: { fontFamily: fonts.bold, fontSize: fontSize.md },
  plusButtonText: { color: '#FFFFFF', fontFamily: fonts.bold, fontSize: fontSize.md },
  invalidIconWrap: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  rankBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rankBadgeText: { color: '#FFFFFF', fontFamily: fonts.bold, fontSize: fontSize.xs },
  rankAvatar: { width: 24, height: 24, borderRadius: 12 },
  rankName: { flex: 1, fontFamily: fonts.semiBold, fontSize: fontSize.sm },
  rankVotes: { fontFamily: fonts.bold, fontSize: fontSize.md },
  rankBarTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  rankBarFill: { height: '100%', borderRadius: 4 },
});
