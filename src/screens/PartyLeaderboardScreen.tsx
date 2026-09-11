import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, Pill, SectionTitle } from '../components/ui';
import { PartyBadge } from '../components/PartyBadge';
import { fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { NATIONAL_PARTIES, getCoalitionStandings } from '../data/legislative';

export default function PartyLeaderboardScreen({ navigation }: any) {
  const { colors } = useTheme();

  const coalitions = getCoalitionStandings();
  const totalSeats = coalitions.reduce((sum, c) => sum + c.seats, 0);
  const sortedParties = [...NATIONAL_PARTIES].sort((a, b) => b.pct - a.pct);

  // Find PAN's rank
  const panRank = sortedParties.findIndex((p) => p.name === 'PAN') + 1;
  const panData = NATIONAL_PARTIES.find((p) => p.name === 'PAN');

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Peta Kekuatan Partai & Legislatif</Text>
        <Text style={[styles.subTitle, { color: colors.textMuted }]}>
          Perolehan suara Pileg DPR RI nasional & susunan {totalSeats} kursi hasil Pemilu.
        </Text>
      </View>

      {/* PAN Highlight Card */}
      {panData && (
        <View style={[styles.panHighlight, { backgroundColor: '#0066B3', borderColor: '#004F8A' }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 }}>
              PARTAI PENGELOLA SISTEM INI
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>Partai Amanat Nasional (PAN)</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 }}>
              Ranking #{panRank} Nasional • {panData.pct}% suara • {panData.seats} kursi DPR RI
            </Text>
          </View>
          <View style={{ alignItems: 'center', gap: 2 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '900' }}>{panData.seats}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10 }}>Kursi DPR RI</Text>
          </View>
        </View>
      )}

      <Card style={{ gap: spacing.sm }}>
        <SectionTitle style={{ marginBottom: 0 }}>Koalisi Pengusung Paslon</SectionTitle>
        <Text style={{ fontSize: 11, color: colors.textMuted }}>
          Gabungan kursi partai pendukung tiap Paslon Presiden — cek koalisi mana yang menang gede di parlemen.
        </Text>
        {coalitions.map((c, idx) => {
          const percent = totalSeats > 0 ? Math.round((c.seats / totalSeats) * 100) : 0;
          return (
            <View key={c.name} style={[styles.coalitionRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.coalitionName, { color: colors.text }]}>{c.name}</Text>
                  {idx === 0 && <Pill label="Terbesar di Parlemen" tone="success" icon="award" />}
                </View>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>{c.paslon}</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>{c.parties.join(', ')}</Text>
                <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressBarFill, { width: `${percent}%`, backgroundColor: colors.primary }]} />
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Text style={[styles.seatCount, { color: colors.text }]}>{c.seats}</Text>
                <Text style={{ fontSize: 10, color: colors.textMuted }}>kursi ({percent}%)</Text>
              </View>
            </View>
          );
        })}
      </Card>

      <Card style={{ gap: spacing.xs }}>
        <SectionTitle style={{ marginBottom: 0 }}>Peringkat Partai Nasional</SectionTitle>
        <Text style={{ fontSize: 11, color: colors.textMuted }}>
          Ketuk partai untuk melihat anggota legislatif terpilih & posisi yang mereka bina.
        </Text>
        {sortedParties.map((p, idx) => (
          <Pressable
            key={p.name}
            onPress={() => navigation.navigate('PartyRoster', { party: p.name })}
            style={({ pressed }) => [
              styles.partyRow,
              { borderBottomColor: colors.border },
              p.name === 'PAN' && { backgroundColor: '#EBF4FF' },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.rank, { color: colors.textMuted }]}>{idx + 1}</Text>
            <PartyBadge party={p.name} size={36} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.partyName, { color: p.name === 'PAN' ? '#0066B3' : colors.text }]} numberOfLines={1}>{p.name}</Text>
                {p.name === 'PAN' && <Pill label="Partai Kami" tone="primary" icon="star" />}
              </View>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>
                {p.isLocal
                  ? 'Partai Lokal Aceh (DPRA/DPRK, tidak ikut kursi DPR RI)'
                  : `${p.pct}% suara • ${p.seats > 0 ? `${p.seats} kursi DPR RI` : 'Tidak lolos ambang batas 4%'}`}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
          </Pressable>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  header: { gap: 2 },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  subTitle: { fontSize: fontSize.xs },
  panHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  coalitionRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 0.5, alignItems: 'center' },
  coalitionName: { fontSize: fontSize.sm, fontWeight: '800' },
  seatCount: { fontSize: fontSize.md, fontWeight: '800' },
  progressBarBg: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden', marginTop: 2 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  partyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: 0.5, paddingHorizontal: 4, borderRadius: 8 },
  rank: { width: 18, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  partyName: { fontSize: fontSize.sm, fontWeight: '700' },
});
