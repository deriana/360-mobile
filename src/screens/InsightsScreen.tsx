import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, Pill, SectionTitle } from '../components/ui';
import { fonts, fontSize, radius, spacing, iconStrokeWidth } from '../theme';
import { insightsList } from '../data/insights';

export default function InsightsScreen() {
  const { colors, isDark } = useTheme();
  const [selectedCluster, setSelectedCluster] = useState<'ALL' | 'JABAR_1' | 'NASIONAL'>('JABAR_1');

  const TONE_CONFIG: Record<
    string,
    { border: string; bg: string; icon: keyof typeof Feather.glyphMap; color: string; label: string }
  > = {
    danger: {
      border: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      icon: 'alert-triangle',
      color: '#EF4444',
      label: 'PERHATIAN KHUSUS',
    },
    warning: {
      border: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.1)',
      icon: 'alert-circle',
      color: '#F59E0B',
      label: 'AUDIT DISPARITAS',
    },
    info: {
      border: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.1)',
      icon: 'info',
      color: '#3B82F6',
      label: 'DINAMIKA DATA',
    },
    success: {
      border: '#10B981',
      bg: 'rgba(16, 185, 129, 0.1)',
      icon: 'check-circle',
      color: '#10B981',
      label: 'PROGRES POSITIF',
    },
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Command Center Intelligence */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: isDark ? '#06162E' : '#002B52',
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.intelBadge}>
            <Feather name="activity" size={12} color="#38BDF8" strokeWidth={iconStrokeWidth} />
            <Text style={styles.intelBadgeText}>INTELIJEN ELEKTORAL BSN</Text>
          </View>
          <View style={styles.syncBadge}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>Live Sync</Text>
          </View>
        </View>

        <View style={{ gap: 2 }}>
          <Text style={styles.headerTitle}>Analisis Tabulasi & Dinamika TPS</Text>
          <Text style={styles.headerSubtitle}>
            Meja Audit C1 Plano, Real-Time Quick Count, & Indikator Pengawalan Suara Nasional
          </Text>
        </View>

        {/* Scope Selector */}
        <View style={styles.scopeRow}>
          <ScopeButton
            label="Dapil Jabar I"
            active={selectedCluster === 'JABAR_1'}
            onPress={() => setSelectedCluster('JABAR_1')}
          />
          <ScopeButton
            label="Skala Nasional"
            active={selectedCluster === 'NASIONAL'}
            onPress={() => setSelectedCluster('NASIONAL')}
          />
          <ScopeButton
            label="Semua Kluster"
            active={selectedCluster === 'ALL'}
            onPress={() => setSelectedCluster('ALL')}
          />
        </View>
      </View>

      {/* 2. Empat Kartu Metrik KPI Utama (Web Command Center Pattern) */}
      <View style={styles.kpiGrid}>
        {/* KPI 1: Kehadiran Saksi */}
        <Card style={[styles.kpiCard, { borderColor: colors.border }]}>
          <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
            <Feather name="user-check" size={18} color="#10B981" />
          </View>
          <Text style={styles.kpiValue}>94.8%</Text>
          <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Presensi Saksi</Text>
          <Text style={[styles.kpiSub, { color: colors.success }]}>+4.2% vs target</Text>
        </Card>

        {/* KPI 2: C1 Plano Masuk */}
        <Card style={[styles.kpiCard, { borderColor: colors.border }]}>
          <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(0, 102, 179, 0.12)' }]}>
            <Feather name="file-text" size={18} color="#0066B3" />
          </View>
          <Text style={styles.kpiValue}>82.4%</Text>
          <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>C1 Terhimpun</Text>
          <Text style={[styles.kpiSub, { color: colors.primary }]}>675k TPS Sah</Text>
        </Card>

        {/* KPI 3: AI OCR Accuracy */}
        <Card style={[styles.kpiCard, { borderColor: colors.border }]}>
          <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
            <Feather name="cpu" size={18} color="#A855F7" />
          </View>
          <Text style={styles.kpiValue}>98.2%</Text>
          <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Akurasi AI OCR</Text>
          <Text style={[styles.kpiSub, { color: '#A855F7' }]}>High Confidence</Text>
        </Card>

        {/* KPI 4: Insiden Selesai */}
        <Card style={[styles.kpiCard, { borderColor: colors.border }]}>
          <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(230, 0, 18, 0.12)' }]}>
            <Feather name="shield" size={18} color="#E60012" />
          </View>
          <Text style={styles.kpiValue}>14/15</Text>
          <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Insiden Selesai</Text>
          <Text style={[styles.kpiSub, { color: '#E60012' }]}>1 Dalam Proses</Text>
        </Card>
      </View>

      {/* 3. Parliamentary Threshold & Proyeksi Kursi */}
      <Card style={{ gap: spacing.sm, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ gap: 2 }}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Ambang Batas Parlemen (PT 4.0%)</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>
              Proyeksi Suara Nasional PAN Hasil Quick Count Terpadu
            </Text>
          </View>
          <Pill label="LOLOS PT (7.24%)" tone="success" />
        </View>

        {/* Threshold Bar */}
        <View style={{ gap: 4, marginTop: 4 }}>
          <View style={styles.barLabelsRow}>
            <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted }}>
              Perolehan Suara: 7.24% (10.842.000 Suara)
            </Text>
            <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.success }}>
              Aman di Atas Batas Minimal
            </Text>
          </View>

          <View style={[styles.trackBg, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
            <View style={[styles.trackFill, { width: '72.4%', backgroundColor: '#0066B3' }]} />
            <View style={[styles.thresholdMarker, { left: '40%' }]}>
              <View style={styles.thresholdLine} />
              <Text style={styles.thresholdMarkerText}>PT 4.0%</Text>
            </View>
          </View>
        </View>

        {/* Proyeksi Kursi */}
        <View style={[styles.seatRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: colors.border }]}>
          <View style={styles.seatCol}>
            <Text style={[styles.seatNum, { color: colors.primary }]}>52 Kursi</Text>
            <Text style={[styles.seatLabel, { color: colors.textMuted }]}>Proyeksi DPR RI Nasional</Text>
          </View>
          <View style={[styles.seatDivider, { backgroundColor: colors.border }]} />
          <View style={styles.seatCol}>
            <Text style={[styles.seatNum, { color: '#10B981' }]}>1 Kursi Aman</Text>
            <Text style={[styles.seatLabel, { color: colors.textMuted }]}>Dapil Jabar I (DPR RI)</Text>
          </View>
          <View style={[styles.seatDivider, { backgroundColor: colors.border }]} />
          <View style={styles.seatCol}>
            <Text style={[styles.seatNum, { color: '#F59E0B' }]}>8 Kursi</Text>
            <Text style={[styles.seatLabel, { color: colors.textMuted }]}>DPRD Kota Bandung</Text>
          </View>
        </View>
      </Card>

      {/* 4. Meja Audit C1 Plano & Disparitas (Web Ref: MON-02 & MON-03) */}
      <Card style={{ gap: spacing.sm, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="search" size={16} color={colors.primary} />
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Meja Audit Integritas C1</Text>
          </View>
          <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.primary }}>
            3 TPS Ditinjau
          </Text>
        </View>

        <View style={{ gap: spacing.xs }}>
          <TpsAuditRow
            tpsName="TPS 001 Kel. Dago, Coblong"
            status="VALID"
            votesParty="84 Suara"
            notes="Match 100% antara AI OCR dan formulir fisik KPPS"
            colors={colors}
            isDark={isDark}
          />
          <TpsAuditRow
            tpsName="TPS 004 Kel. Sukajadi, Sukajadi"
            status="MANUAL_REVIEW"
            votesParty="68 Suara"
            notes="Disparitas +2 suara sah vs pemilih hadir. Diverifikasi Tim Saksi"
            colors={colors}
            isDark={isDark}
          />
          <TpsAuditRow
            tpsName="TPS 012 Kel. Sadang Serang, Coblong"
            status="VALID"
            votesParty="92 Suara"
            notes="Tanda tangan KPPS & saksi partai terverifikasi lengkap"
            colors={colors}
            isDark={isDark}
          />
        </View>
      </Card>

      {/* 5. Catatan Taktis & Rekomendasi Lapangan (insightsList) */}
      <View style={{ gap: spacing.xs }}>
        <SectionTitle style={{ marginBottom: 2 }}>Rekomendasi Komando & Catatan Lapangan</SectionTitle>
        <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>
          Arahan berbasis AI dan evaluasi pelaporan saksi di 38 provinsi.
        </Text>

        {insightsList.map((insight) => {
          const cfg = TONE_CONFIG[insight.tone] ?? TONE_CONFIG.info;
          return (
            <Card
              key={insight.id}
              style={[
                styles.insightCard,
                {
                  borderLeftColor: cfg.border,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.insightHeaderRow}>
                <View style={[styles.insightIconBox, { backgroundColor: cfg.bg }]}>
                  <Feather name={cfg.icon} size={15} color={cfg.color} strokeWidth={iconStrokeWidth} />
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={[styles.insightTitle, { color: colors.text }]}>{insight.title}</Text>
                  <Text style={[styles.insightToneBadge, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>
              <Text style={[styles.insightBody, { color: colors.textMuted }]}>{insight.body}</Text>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

function ScopeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.scopeBtn,
        active && { backgroundColor: '#FFFFFF' },
      ]}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.scopeBtnText,
          { color: active ? '#002B52' : 'rgba(255,255,255,0.85)' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function TpsAuditRow({
  tpsName,
  status,
  votesParty,
  notes,
  colors,
  isDark,
}: {
  tpsName: string;
  status: 'VALID' | 'MANUAL_REVIEW';
  votesParty: string;
  notes: string;
  colors: any;
  isDark: boolean;
}) {
  const isValid = status === 'VALID';
  return (
    <View
      style={[
        styles.auditRow,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
          borderColor: colors.border,
        },
      ]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[styles.auditTpsName, { color: colors.text }]}>{tpsName}</Text>
          <Pill
            label={isValid ? 'C1 MATCH' : 'PERIKSA FISIK'}
            tone={isValid ? 'success' : 'warning'}
          />
        </View>
        <Text style={[styles.auditNotes, { color: colors.textMuted }]}>{notes}</Text>
        <Text style={{ fontSize: 10.5, fontFamily: fonts.bold, color: colors.primary, marginTop: 2 }}>
          Perolehan Suara PAN: {votesParty}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },

  // Command Header
  headerCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  intelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  intelBadgeText: {
    fontSize: 9.5,
    fontFamily: fonts.bold,
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  syncText: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: '#34D399',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#BAE6FD',
    lineHeight: 15,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  scopeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  scopeBtnText: {
    fontSize: 10.5,
    fontFamily: fonts.bold,
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  kpiCard: {
    width: '48%',
    padding: spacing.sm + 2,
    gap: 2,
  },
  kpiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontFamily: fonts.bold,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  kpiSub: {
    fontSize: 10,
    fontFamily: fonts.bold,
    marginTop: 2,
  },

  // Section
  sectionHeading: {
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  barLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackBg: {
    height: 10,
    borderRadius: 5,
    position: 'relative',
    overflow: 'visible',
    marginVertical: 4,
  },
  trackFill: {
    height: '100%',
    borderRadius: 5,
  },
  thresholdMarker: {
    position: 'absolute',
    top: -4,
    alignItems: 'center',
  },
  thresholdLine: {
    width: 2,
    height: 18,
    backgroundColor: '#EF4444',
  },
  thresholdMarkerText: {
    fontSize: 8.5,
    fontFamily: fonts.bold,
    color: '#EF4444',
    marginTop: 1,
  },

  // Seats
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: 4,
  },
  seatCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  seatNum: {
    fontSize: 14,
    fontFamily: fonts.bold,
    fontWeight: '800',
  },
  seatLabel: {
    fontSize: 9.5,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  seatDivider: {
    width: 1,
    height: 28,
  },

  // Audit
  auditRow: {
    padding: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  auditTpsName: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  auditNotes: {
    fontSize: 10.5,
    fontFamily: fonts.regular,
    lineHeight: 15,
  },

  // Insights List
  insightCard: {
    borderLeftWidth: 4,
    gap: 6,
    padding: spacing.sm + 2,
  },
  insightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  insightIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  insightToneBadge: {
    fontSize: 9.5,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
  insightBody: {
    fontSize: 11,
    fontFamily: fonts.regular,
    lineHeight: 16,
  },
});
