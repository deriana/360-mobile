import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, KpiCard, Pill, SectionTitle, StatusBadge } from '../components/ui';
import { fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { CURRENT_WITNESS_ID, ROLE_LABEL, getUserProfile, scopeTps, scopeWitnesses } from '../utils/scope';
import { BRAND_ASSETS, IMAGES, getWitnessAvatar, getTpsPhoto } from '../data/images';

const ITEMS_PER_PAGE = 5;

interface BentoItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  tone?: 'primary' | 'danger' | 'success' | 'warning';
  badge?: string;
  onPress: () => void;
}

export default function DashboardScreen({ navigation }: any) {
  const { role, tps, witnesses } = useApp();
  const { colors } = useTheme();

  const isCoordinator = role === 'TPS_COORDINATOR';
  const isOperator = role === 'OPERATOR';

  const [tpsPage, setTpsPage] = useState(1);
  const [witnessPage, setWitnessPage] = useState(1);

  const scopedTps = scopeTps(role, tps, witnesses);
  const scopedWitnesses = scopeWitnesses(role, witnesses, scopedTps);

  const checkedInCount = scopedWitnesses.filter((w) => w.status === 'checked_in').length;
  const reportedCount = scopedTps.filter((t) => t.status === 'done').length;

  // Pagination calculations for Operator Scope
  const totalTpsPages = Math.ceil(scopedTps.length / ITEMS_PER_PAGE);
  const paginatedTps = scopedTps.slice((tpsPage - 1) * ITEMS_PER_PAGE, tpsPage * ITEMS_PER_PAGE);

  const totalWitnessPages = Math.ceil(scopedWitnesses.length / ITEMS_PER_PAGE);
  const paginatedWitnesses = scopedWitnesses.slice((witnessPage - 1) * ITEMS_PER_PAGE, witnessPage * ITEMS_PER_PAGE);

  // -------------------------------------------------------------
  // VIEW FOR OPERATOR LAPANGAN (KOTA BANDUNG REGENCY SCOPE)
  // -------------------------------------------------------------
  if (isOperator) {
    const operatorBentoItems: BentoItem[] = [
      {
        id: 'ktp',
        icon: 'credit-card',
        title: 'Scan KTP Saksi',
        subtitle: 'Registrasi & Entri NIK',
        badge: 'Utama',
        onPress: () => navigation.navigate('KtpOcr'),
      },
      {
        id: 'supervision',
        icon: 'grid',
        title: 'Pengawasan TPS',
        subtitle: 'Monitoring Kota Bandung',
        onPress: () => navigation.navigate('Supervision'),
      },
      {
        id: 'doc',
        icon: 'camera',
        title: 'Foto Lapangan',
        subtitle: 'Upload Dokumentasi',
        onPress: () => navigation.navigate('Documentation'),
      },
      {
        id: 'checkin',
        icon: 'map-pin',
        title: 'Absen GPS',
        subtitle: 'Pendampingan Presensi',
        onPress: () => navigation.navigate('CheckIn'),
      },
      {
        id: 'c1',
        icon: 'edit-3',
        title: 'Input Form C1',
        subtitle: 'Bantu Entri Suara TPS',
        onPress: () => navigation.navigate('ReportForm', { tpsId: 'TPS-001' }),
      },
      {
        id: 'emergency',
        icon: 'alert-triangle',
        title: 'Lapor Kendala',
        subtitle: 'Eskalasi Operasional',
        tone: 'danger',
        onPress: () => navigation.navigate('EmergencyForm'),
      },
      {
        id: 'emergencies',
        icon: 'alert-circle',
        title: 'Cek Kendala TPS',
        subtitle: 'Monitoring Laporan Kota Bandung',
        tone: 'warning',
        onPress: () => navigation.navigate('EmergencyList'),
      },
    ];

    return (
      <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        {/* Personnel Profile Header Card */}
        <PersonnelHeaderCard role={role} navigation={navigation} />

        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.heroHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Image source={BRAND_ASSETS.emblem} style={{ width: 22, height: 22 }} resizeMode="contain" />
              <Image source={BRAND_ASSETS.logoText} style={{ width: 75, height: 15 }} resizeMode="contain" />
            </View>
            <Pill label="Kota Bandung" tone="primary" />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Dashboard Operator Lapangan</Text>
          <Text style={[styles.heroSub, { color: colors.textMuted }]}>
            Monitoring TPS, Saksi Binaan, & Bantuan Registrasi se-Kabupaten/Kota Bandung.
          </Text>

          <View style={[styles.statRow, { borderTopColor: colors.border }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{scopedTps.length}</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Total TPS Bandung</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.success }]}>{checkedInCount}</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Saksi Hadir GPS</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.success }]}>{reportedCount}</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Form C1 Masuk</Text>
            </View>
          </View>
        </View>

        {/* Bento Grid Shortcut for Operator */}
        <View style={{ gap: spacing.xs }}>
          <SectionTitle style={{ marginBottom: spacing.xs }}>Menu Aksi Operator Lapangan</SectionTitle>
          <BentoGridShortcut items={operatorBentoItems} />
        </View>

        {/* Saksi Management List per Regency (Kota Bandung) with Pagination */}
        <Card style={{ gap: spacing.md }}>
          <SectionTitle style={{ marginBottom: 0 }}>Manajemen Saksi & Penugasan TPS (Kota Bandung)</SectionTitle>
          <Text style={[styles.subHint, { color: colors.textMuted }]}>
            Daftar Saksi terdaftar di Kota Bandung (Menampilkan 5 dari {scopedWitnesses.length} Saksi).
          </Text>

          {paginatedWitnesses.map((w, idx) => {
            const assigned = tps.find((t) => t.id === w.assignedTpsId);
            return (
              <Pressable
                key={w.id}
                onPress={() => navigation.navigate('WitnessDetail', { witnessId: w.id })}
                style={({ pressed }) => [
                  styles.witnessRowItem,
                  { borderBottomColor: colors.border },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Image source={{ uri: getWitnessAvatar(idx) }} style={styles.avatarImg} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.witnessName, { color: colors.text }]}>{w.name}</Text>
                  <Text style={[styles.witnessSub, { color: colors.primary, fontWeight: '700' }]}>
                    Ditugaskan di: {assigned ? `TPS ${assigned.tpsNumber} (${assigned.district})` : w.assignedTpsId}
                  </Text>
                  <Text style={[styles.witnessContact, { color: colors.textMuted }]}>NIK: {w.nik} • Telp: {w.phone}</Text>
                </View>
                <Pill
                  label={w.status === 'checked_in' ? 'Hadir GPS' : 'Belum Absen'}
                  tone={w.status === 'checked_in' ? 'success' : 'warning'}
                />
              </Pressable>
            );
          })}

          <PaginationBar
            currentPage={witnessPage}
            totalPages={totalWitnessPages}
            onPrev={() => setWitnessPage((p) => Math.max(1, p - 1))}
            onNext={() => setWitnessPage((p) => Math.min(totalWitnessPages, p + 1))}
          />
        </Card>

        {/* TPS Status Monitoring for Kota Bandung with Pagination */}
        <Card style={{ gap: spacing.md }}>
          <SectionTitle style={{ marginBottom: 0 }}>Status TPS di Kota Bandung ({scopedTps.length} TPS)</SectionTitle>
          <Text style={[styles.subHint, { color: colors.textMuted }]}>
            Menampilkan 5 TPS per halaman.
          </Text>
          {paginatedTps.map((item, idx) => (
            <Pressable
              key={item.id}
              onPress={() => navigation.navigate('TpsDetail', { tpsId: item.id })}
              style={[styles.witnessRowItem, { borderBottomColor: colors.border }]}
            >
              <Image source={getTpsPhoto(idx)} style={styles.avatarImg} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.witnessName, { color: colors.text }]}>TPS {item.tpsNumber} — Kec. {item.district}</Text>
                <Text style={[styles.witnessSub, { color: colors.textMuted }]}>Kel. {item.village || 'Dago'} • DPT: {item.dpt}</Text>
              </View>
              <StatusBadge status={item.status} />
            </Pressable>
          ))}

          <PaginationBar
            currentPage={tpsPage}
            totalPages={totalTpsPages}
            onPrev={() => setTpsPage((p) => Math.max(1, p - 1))}
            onNext={() => setTpsPage((p) => Math.min(totalTpsPages, p + 1))}
          />
        </Card>
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // VIEW FOR KOORDINATOR TPS (SUPERVISI 6 TPS BINAAN KLUSTER)
  // -------------------------------------------------------------
  if (isCoordinator) {
    const coordinatorBentoItems: BentoItem[] = [
      {
        id: 'supervision',
        icon: 'grid',
        title: 'Pengawasan Kluster',
        subtitle: 'Supervisi 6 TPS Dago',
        badge: 'Kluster 6',
        onPress: () => navigation.navigate('Supervision'),
      },
      {
        id: 'ktp',
        icon: 'credit-card',
        title: 'Scan KTP Saksi',
        subtitle: 'Registrasi & Entri NIK',
        onPress: () => navigation.navigate('KtpOcr'),
      },
      {
        id: 'doc',
        icon: 'camera',
        title: 'Foto Supervisi',
        subtitle: 'Upload Bukti Lapangan',
        onPress: () => navigation.navigate('Documentation'),
      },
      {
        id: 'emergencies',
        icon: 'alert-triangle',
        title: 'Insiden Kluster',
        subtitle: 'Monitoring Laporan Darurat',
        tone: 'danger',
        onPress: () => navigation.navigate('EmergencyList'),
      },
      {
        id: 'lapor',
        icon: 'alert-circle',
        title: 'Lapor Kendala',
        subtitle: 'Eskalasi Masalah TPS',
        tone: 'warning',
        onPress: () => navigation.navigate('EmergencyForm'),
      },
    ];

    return (
      <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        {/* Personnel Profile Header Card */}
        <PersonnelHeaderCard role={role} navigation={navigation} />

        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.heroHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Image source={BRAND_ASSETS.emblem} style={{ width: 22, height: 22 }} resizeMode="contain" />
              <Image source={BRAND_ASSETS.logoText} style={{ width: 75, height: 15 }} resizeMode="contain" />
            </View>
            <Pill label="Kluster COORD-1" tone="primary" />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Pemantauan Kluster TPS</Text>
          <Text style={[styles.heroSub, { color: colors.textMuted }]}>
            Supervisi 6 Saksi & 6 TPS Binaan di Wilayah Kelurahan Dago (Kluster COORD-1)
          </Text>

          <View style={[styles.statRow, { borderTopColor: colors.border }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.success }]}>{checkedInCount} / 6</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Saksi Hadir GPS</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{reportedCount} / 6</Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>Laporan C1 Masuk</Text>
            </View>
          </View>
        </View>

        {/* Bento Grid Shortcut for Koordinator */}
        <View style={{ gap: spacing.xs }}>
          <SectionTitle style={{ marginBottom: spacing.xs }}>Menu Aksi Koordinator TPS</SectionTitle>
          <BentoGridShortcut items={coordinatorBentoItems} />
        </View>

        {/* Supervision List 6 TPS */}
        <Card style={{ gap: spacing.md }}>
          <SectionTitle style={{ marginBottom: 0 }}>Daftar Presensi & C1 Saksi Binaan (6 TPS Kluster)</SectionTitle>
          {scopedWitnesses.map((w, idx) => {
            const assigned = tps.find((t) => t.id === w.assignedTpsId);
            const isDone = assigned?.status === 'done';
            return (
              <Pressable
                key={w.id}
                onPress={() => navigation.navigate('TpsDetail', { tpsId: w.assignedTpsId })}
                style={({ pressed }) => [
                  styles.witnessRowItem,
                  { borderBottomColor: colors.border },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Image source={{ uri: getWitnessAvatar(idx) }} style={styles.avatarImg} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.witnessName, { color: colors.text }]}>{w.name}</Text>
                  <Text style={[styles.witnessSub, { color: colors.primary, fontWeight: '700' }]}>
                    Penugasan: TPS {assigned?.tpsNumber ?? 1} Kel. Dago • Telp: {w.phone}
                  </Text>
                  <Text style={[styles.witnessContact, { color: colors.textMuted }]}>
                    NIK: {w.nik} • Status Lapor C1: {isDone ? 'Sudah Dikirim' : 'Belum'}
                  </Text>
                </View>
                <Pill
                  label={isDone ? 'C1 Selesai' : w.status === 'checked_in' ? 'Hadir GPS' : 'Belum Absen'}
                  tone={isDone ? 'success' : w.status === 'checked_in' ? 'info' : 'warning'}
                />
              </Pressable>
            );
          })}
        </Card>
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // VIEW FOR SAKSI TPS MANDIRI (1 TPS SCOPE)
  // -------------------------------------------------------------
  const witnessBentoItems: BentoItem[] = [
    {
      id: 'checkin',
      icon: 'map-pin',
      title: 'Absen GPS',
      subtitle: 'Presensi Swafoto',
      badge: 'Step 1',
      onPress: () => navigation.navigate('CheckIn'),
    },
    {
      id: 'mandate',
      icon: 'file-text',
      title: 'E-Mandat',
      subtitle: 'Surat Tugas Digital',
      badge: 'Step 2',
      onPress: () => navigation.navigate('AssignmentLetter', { witnessId: CURRENT_WITNESS_ID }),
    },
    {
      id: 'c1',
      icon: 'edit-3',
      title: 'Formulir C1',
      subtitle: 'Foto & Entri Suara',
      badge: 'Step 3',
      onPress: () => navigation.navigate('ReportForm', { tpsId: 'TPS-001' }),
    },
    {
      id: 'doc',
      icon: 'camera',
      title: 'Dokumentasi',
      subtitle: 'Foto Kegiatan TPS',
      badge: 'Step 4',
      onPress: () => navigation.navigate('Documentation'),
    },
    {
      id: 'emergency',
      icon: 'alert-triangle',
      title: 'Lapor Darurat',
      subtitle: 'Kirim Insiden TPS',
      tone: 'danger',
      badge: 'Step 5',
      onPress: () => navigation.navigate('EmergencyForm'),
    },
    {
      id: 'emergencies',
      icon: 'alert-circle',
      title: 'Cek Kendala TPS',
      subtitle: 'Status Laporan Anda & TPS',
      tone: 'warning',
      onPress: () => navigation.navigate('EmergencyList'),
    },
  ];

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Personnel Profile Header Card */}
      <PersonnelHeaderCard role={role} navigation={navigation} />

      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.heroHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Image source={BRAND_ASSETS.emblem} style={{ width: 22, height: 22 }} resizeMode="contain" />
            <Image source={BRAND_ASSETS.logoText} style={{ width: 75, height: 15 }} resizeMode="contain" />
          </View>
          <Pill label="TPS 001 Dago" tone="primary" />
        </View>
        <Text style={[styles.heroTitle, { color: colors.text }]}>Tugas Operasional Saksi TPS</Text>
        <Text style={[styles.heroSub, { color: colors.textMuted }]}>
          TPS 001 Kel. Dago, Kec. Coblong, Kota Bandung
        </Text>
      </View>

      {/* Statistik TPS Saya */}
      {scopedTps[0] && (
        <View style={{ gap: spacing.xs }}>
          <SectionTitle
            style={{ marginBottom: spacing.xs }}
            action={
              <Pressable onPress={() => navigation.navigate('TpsDetail', { tpsId: scopedTps[0].id })}>
                <Text style={[styles.roleBadgeText, { color: colors.primary }]}>Lihat Detail</Text>
              </Pressable>
            }
          >
            Statistik TPS Saya
          </SectionTitle>
          <View style={styles.statGrid}>
            <KpiCard label="DPT Terdaftar" value={scopedTps[0].dpt} icon="users" style={styles.statGridItem} />
            <KpiCard label="Pemilih Hadir" value={scopedTps[0].votersPresent} tone={colors.success} icon="check-circle" style={styles.statGridItem} />
            <KpiCard label="Suara Tidak Sah" value={scopedTps[0].votes.invalidVotes} tone={colors.danger} icon="x-circle" style={styles.statGridItem} />
            <KpiCard
              label="Total Suara Masuk"
              value={Object.values(scopedTps[0].votes.partyVotes).reduce((a, b) => a + b, 0)}
              icon="bar-chart-2"
              style={styles.statGridItem}
            />
          </View>
        </View>
      )}

      {/* Bento Grid Shortcut for Saksi */}
      <View style={{ gap: spacing.xs }}>
        <SectionTitle style={{ marginBottom: spacing.xs }}>Langkah Kerja Hari-H</SectionTitle>
        <BentoGridShortcut items={witnessBentoItems} />
      </View>
    </ScrollView>
  );
}

function BentoGridShortcut({ items }: { items: BentoItem[] }) {
  const { colors } = useTheme();
  return (
    <View style={styles.bentoGridContainer}>
      {items.map((item) => {
        const isDanger = item.tone === 'danger';
        const isSuccess = item.tone === 'success';
        const isWarning = item.tone === 'warning';

        const iconBg = isDanger
          ? colors.dangerBg
          : isSuccess
          ? colors.successBg
          : isWarning
          ? colors.warningBg
          : colors.primaryLight;

        const iconColor = isDanger
          ? colors.danger
          : isSuccess
          ? colors.success
          : isWarning
          ? colors.warning
          : colors.primary;

        return (
          <Pressable
            key={item.id}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.bentoCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <View style={styles.bentoCardHeader}>
              <View style={[styles.bentoIconBadge, { backgroundColor: iconBg }]}>
                <Feather name={item.icon} size={20} color={iconColor} strokeWidth={2} />
              </View>
              {item.badge && <Pill label={item.badge} tone={item.tone || 'primary'} />}
            </View>

            <View style={{ gap: 2, marginTop: spacing.xs }}>
              <Text style={[styles.bentoCardTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.bentoCardSub, { color: colors.textMuted }]} numberOfLines={2}>
                {item.subtitle}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function PaginationBar({ currentPage, totalPages, onPrev, onNext }: { currentPage: number; totalPages: number; onPrev: () => void; onNext: () => void }) {
  const { colors } = useTheme();
  if (totalPages <= 1) return null;
  return (
    <View style={styles.paginationRow}>
      <Pressable
        disabled={currentPage <= 1}
        onPress={onPrev}
        style={({ pressed }) => [
          styles.pageBtn,
          { backgroundColor: colors.surface, borderColor: colors.border },
          currentPage <= 1 && { opacity: 0.4 },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Feather name="chevron-left" size={16} color={colors.text} />
        <Text style={[styles.pageBtnText, { color: colors.text }]}>Prev</Text>
      </Pressable>

      <Text style={[styles.pageIndicator, { color: colors.textMuted }]}>
        Halaman <Text style={{ fontWeight: '800', color: colors.text }}>{currentPage}</Text> dari {totalPages}
      </Text>

      <Pressable
        disabled={currentPage >= totalPages}
        onPress={onNext}
        style={({ pressed }) => [
          styles.pageBtn,
          { backgroundColor: colors.surface, borderColor: colors.border },
          currentPage >= totalPages && { opacity: 0.4 },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Text style={[styles.pageBtnText, { color: colors.text }]}>Next</Text>
        <Feather name="chevron-right" size={16} color={colors.text} />
      </Pressable>
    </View>
  );
}

function PersonnelHeaderCard({ role, navigation }: { role: any; navigation: any }) {
  const { colors } = useTheme();
  const profile = getUserProfile(role);

  return (
    <Pressable
      onPress={() => navigation.navigate('Profile')}
      style={({ pressed }) => [
        styles.profileHeaderCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={styles.profileAvatarWrapper}>
        <Image source={{ uri: getWitnessAvatar(profile.avatarIndex) }} style={styles.profileHeaderAvatar} />
        <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.profileHeaderTopRow}>
          <Text style={[styles.profileHeaderName, { color: colors.text }]}>{profile.name}</Text>
          <View style={[styles.badgeIdPill, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.badgeIdPillText, { color: colors.primary }]}>{profile.badgeId}</Text>
          </View>
        </View>
        <Text style={[styles.profileHeaderRole, { color: colors.primary }]}>{profile.roleLabel}</Text>
        <Text style={[styles.profileHeaderScope, { color: colors.textMuted }]}>
          📍 {profile.scopeLocation}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    ...shadow.card,
  },
  profileAvatarWrapper: { position: 'relative' },
  profileHeaderAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: '#E60012' },
  onlineDot: { width: 12, height: 12, borderRadius: 6, position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: '#FFFFFF' },
  profileHeaderTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileHeaderName: { fontSize: fontSize.sm, fontWeight: '800' },
  badgeIdPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
  badgeIdPillText: { fontSize: 9, fontWeight: '800' },
  profileHeaderRole: { fontSize: 11, fontWeight: '700' },
  profileHeaderScope: { fontSize: 10 },
  heroCard: { padding: spacing.lg, gap: spacing.xs, borderRadius: radius.xl, borderWidth: 1 },
  heroHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  roleBadgeText: { fontSize: 11, fontWeight: '800' },
  heroTitle: { fontSize: fontSize.xl, fontWeight: '800' },
  heroSub: { fontSize: fontSize.xs, lineHeight: 18 },
  subHint: { fontSize: fontSize.xs, marginBottom: spacing.xs },
  statRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1 },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: fontSize.lg, fontWeight: '800' },
  statSub: { fontSize: 11, marginTop: 2 },
  divider: { width: 1, height: 28 },
  witnessRowItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: 0.5 },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  witnessName: { fontSize: fontSize.sm, fontWeight: '700' },
  witnessSub: { fontSize: 11 },
  witnessContact: { fontSize: 10 },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  pageBtnText: { fontSize: 12, fontWeight: '700' },
  pageIndicator: { fontSize: 12 },

  // Bento Grid Shortcut Styles
  bentoGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bentoCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 110,
    justifyContent: 'space-between',
    ...shadow.card,
  },
  bentoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bentoIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoCardTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  bentoCardSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statGridItem: { minWidth: '46%' },
});
