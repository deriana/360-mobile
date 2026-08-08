import React from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, KpiCard, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { CURRENT_WITNESS_ID } from '../utils/scope';
import { IMAGES, getWitnessAvatar } from '../data/images';

export default function WitnessHomeScreen({ navigation }: any) {
  const { witnesses, tps, emergencyReports } = useApp();
  const { colors, isDark, toggleTheme } = useTheme();
  const witness = witnesses.find((w) => w.id === CURRENT_WITNESS_ID)!;
  const assignedTps = tps.find((t) => t.id === witness.assignedTpsId);
  const avatar = getWitnessAvatar(0);

  const tpsReports = emergencyReports.filter((r) => r.tpsId === witness.assignedTpsId);
  const openReports = tpsReports.filter((r) => r.status !== 'resolved').length;

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Welcome Banner Card with Profile Avatar */}
      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.profileHeaderRow}>
          <Image source={{ uri: avatar }} style={styles.avatarImage} />
          <View style={{ flex: 1, gap: 2 }}>
            <View style={styles.nameStatusRow}>
              <Text style={[styles.greeting, { color: colors.text }]}>{witness.name}</Text>
              <Pill
                label={witness.status === 'checked_in' ? 'Sudah Check-in' : witness.status === 'assigned' ? 'Belum Check-in' : 'Tidak Hadir'}
                tone={witness.status === 'checked_in' ? 'success' : witness.status === 'assigned' ? 'warning' : 'danger'}
              />
            </View>
            <Text style={[styles.sub, { color: colors.textMuted }]}>Saksi Resmi TPS • NIK: {witness.nik ?? '3271048291040002'}</Text>
          </View>
        </View>
      </View>

      {/* Assigned TPS Photo Card */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <ImageBackground source={{ uri: IMAGES.tpsSchool }} style={styles.tpsPhotoHeader}>
          <View style={styles.tpsPhotoOverlay}>
            <Text style={styles.tpsTag}>LOKASI PENUGASAN SAKSI</Text>
            <Text style={styles.tpsHeadline}>
              TPS {assignedTps?.tpsNumber ?? '01'} — {assignedTps?.district ?? 'Kecamatan'}
            </Text>
          </View>
        </ImageBackground>

        <View style={[styles.tpsBody, { backgroundColor: colors.surface }]}>
          {assignedTps ? (
            <View style={{ gap: spacing.xs }}>
              <Text style={[styles.tpsId, { color: colors.primary }]}>{assignedTps.id}</Text>
              <Text style={[styles.tpsTitle, { color: colors.text }]}>
                TPS {assignedTps.tpsNumber} — {assignedTps.village || assignedTps.district}
              </Text>
              <Text style={[styles.tpsSub, { color: colors.textMuted }]}>
                Kec. {assignedTps.district}, {assignedTps.regency}, {assignedTps.province}
              </Text>
            </View>
          ) : (
            <Text style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Belum ada TPS yang ditugaskan.</Text>
          )}

          {witness.checkInTime && (
            <View style={[styles.checkInBox, { backgroundColor: colors.successBg }]}>
              <Feather name="check-circle" size={16} color={colors.success} strokeWidth={iconStrokeWidth} />
              <Text style={[styles.checkInTimeText, { color: colors.success }]}>
                Waktu Check-in: <Text style={{ fontWeight: '800' }}>{witness.checkInTime}</Text> (Lokasi GPS Terverifikasi)
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Grid Statistik TPS Saya */}
      {assignedTps && (
        <View style={{ gap: spacing.xs }}>
          <SectionTitle>Statistik TPS Saya</SectionTitle>
          <View style={styles.statGrid}>
            <KpiCard label="DPT Terdaftar" value={assignedTps.dpt} icon="users" style={styles.statGridItem} />
            <KpiCard label="Pemilih Hadir" value={assignedTps.votersPresent} tone={colors.success} icon="check-circle" style={styles.statGridItem} />
            <KpiCard label="Suara Tidak Sah" value={assignedTps.votes.invalidVotes} tone={colors.danger} icon="x-circle" style={styles.statGridItem} />
            <KpiCard
              label="Total Suara Masuk"
              value={Object.values(assignedTps.votes.partyVotes).reduce((a, b) => a + b, 0)}
              icon="bar-chart-2"
              style={styles.statGridItem}
            />
          </View>
        </View>
      )}

      {/* Panel Kendala TPS */}
      <Pressable onPress={() => navigation.navigate('EmergencyList')}>
        <Card style={styles.issuePanel}>
          <View style={[styles.issueIconWrap, { backgroundColor: openReports > 0 ? colors.warningBg : colors.successBg }]}>
            <Feather
              name={openReports > 0 ? 'alert-circle' : 'shield'}
              size={18}
              color={openReports > 0 ? colors.warning : colors.success}
              strokeWidth={iconStrokeWidth}
            />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.issueTitle, { color: colors.text }]}>Kendala TPS</Text>
            <Text style={[styles.issueSub, { color: colors.textMuted }]}>
              {tpsReports.length === 0
                ? 'Belum ada laporan kendala di TPS Anda'
                : `${openReports} dari ${tpsReports.length} laporan masih ditindaklanjuti`}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
        </Card>
      </Pressable>

      {/* Action Buttons Stack */}
      <View style={{ gap: spacing.md }}>
        <PrimaryButton
          label="Presensi / Check-in Mandiri GPS"
          icon="map-pin"
          onPress={() => navigation.navigate('CheckIn')}
        />
        <PrimaryButton
          label="Lihat Surat Tugas Digital Saksi"
          icon="file-text"
          variant="secondary"
          onPress={() => navigation.navigate('AssignmentLetter', { witnessId: witness.id })}
        />
        <PrimaryButton
          label="Isi Formulir Laporan Hasil C1"
          icon="edit-3"
          variant="secondary"
          onPress={() => navigation.navigate('ReportForm', { tpsId: witness.assignedTpsId })}
        />
        <PrimaryButton
          label="Lihat Statistik TPS Saya"
          icon="bar-chart-2"
          variant="secondary"
          onPress={() => navigation.navigate('TpsDetail', { tpsId: witness.assignedTpsId })}
        />
        <PrimaryButton
          label="Laporkan Kejadian / Darurat TPS"
          icon="alert-triangle"
          variant="danger"
          onPress={() => navigation.navigate('EmergencyForm')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl + 40 },
  profileCard: { padding: spacing.md, borderRadius: radius.xl, borderWidth: 1 },
  profileHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatarImage: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#4F46E5' },
  nameStatusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  greeting: { fontSize: fontSize.md, fontWeight: '800' },
  sub: { fontSize: fontSize.xs },
  themePill: { padding: 8, borderRadius: 20 },
  tpsPhotoHeader: { width: '100%', height: 130, justifyContent: 'flex-end' },
  tpsPhotoOverlay: { padding: spacing.md, backgroundColor: 'rgba(255,255,255,0.92)' },
  tpsTag: { fontSize: 10, fontWeight: '800', color: '#4F46E5', letterSpacing: 0.8 },
  tpsHeadline: { fontSize: fontSize.lg, fontWeight: '800', color: '#0F172A' },
  tpsBody: { padding: spacing.md, gap: spacing.sm },
  tpsId: { fontSize: fontSize.xs, fontWeight: '800', textTransform: 'uppercase' },
  tpsTitle: { fontSize: fontSize.md, fontWeight: '700' },
  tpsSub: { fontSize: fontSize.xs },
  checkInBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: spacing.sm, borderRadius: radius.md, marginTop: 4 },
  checkInTimeText: { fontSize: fontSize.xs },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statGridItem: { minWidth: '46%' },
  issuePanel: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  issueIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  issueTitle: { fontSize: fontSize.sm, fontWeight: '800' },
  issueSub: { fontSize: fontSize.xs },
});
