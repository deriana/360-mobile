import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, EmptyState, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import {
  FINANCIAL_REPORT_2024,
  POLICY_DOCUMENTS,
  PolicyDocumentItem,
  PUBLIC_AID_REPORT_2024,
  STRATEGIC_PROGRAMS,
} from '../data/transparency';
import { STRUKTUR_PENGURUS } from '../data/simpan';

type TransparencyTab = 'keuangan' | 'bantuan' | 'program' | 'kebijakan' | 'struktur';

interface TabItem {
  key: TransparencyTab;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  badge?: string;
}

const TABS: TabItem[] = [
  { key: 'keuangan', label: 'Laporan Keuangan', icon: 'pie-chart', badge: 'WTP' },
  { key: 'bantuan', label: 'Bantuan Publik', icon: 'shield', badge: 'BPK' },
  { key: 'program', label: 'Program Strategis', icon: 'check-square', badge: `${STRATEGIC_PROGRAMS.length}` },
  { key: 'kebijakan', label: 'Kebijakan & PO', icon: 'file-text', badge: `${POLICY_DOCUMENTS.length}` },
  { key: 'struktur', label: 'Struktur Organisasi', icon: 'layers' },
];

function formatRupiah(amount: number): string {
  if (amount >= 1000000000) {
    const miliar = (amount / 1000000000).toFixed(2);
    return `Rp ${miliar.replace(/\.00$/, '')} M`;
  }
  if (amount >= 1000000) {
    const juta = (amount / 1000000).toFixed(1);
    return `Rp ${juta.replace(/\.0$/, '')} Jt`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export default function TransparencyHubScreen({ navigation, route }: any) {
  const { colors, isDark } = useTheme();

  // Tab default can be passed via route.params.initialTab
  const initialTab: TransparencyTab = route?.params?.initialTab || 'keuangan';
  const [activeTab, setActiveTab] = useState<TransparencyTab>(initialTab);

  // States for Program Tab
  const [programFilter, setProgramFilter] = useState<'SEMUA' | 'SELESAI' | 'BERLANGSUNG'>('SEMUA');

  // States for Dokumen Tab
  const [documentSearch, setDocumentSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [selectedDoc, setSelectedDoc] = useState<PolicyDocumentItem | null>(null);

  // PDF Export States
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone?: 'success' | 'danger';
  }>({ visible: false, title: '', message: '' });

  // Filtered Programs
  const filteredPrograms = useMemo(() => {
    if (programFilter === 'SEMUA') return STRATEGIC_PROGRAMS;
    return STRATEGIC_PROGRAMS.filter((p) => p.status === programFilter);
  }, [programFilter]);

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return POLICY_DOCUMENTS.filter((doc) => {
      const matchSearch =
        doc.title.toLowerCase().includes(documentSearch.toLowerCase()) ||
        doc.codeNumber.toLowerCase().includes(documentSearch.toLowerCase()) ||
        doc.summary.toLowerCase().includes(documentSearch.toLowerCase());
      const matchCat = selectedCategory === 'SEMUA' || doc.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [documentSearch, selectedCategory]);

  // Export Financial Summary to PDF
  const handleExportFinancialPdf = async () => {
    try {
      setIsExportingPdf(true);
      const fin = FINANCIAL_REPORT_2024;
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Laporan Transparansi Keuangan PAN 2024</title>
            <style>
              body { font-family: sans-serif; margin: 36px; color: #0F172A; }
              .header { border-bottom: 2px solid #0066B3; padding-bottom: 12px; margin-bottom: 20px; }
              .title { font-size: 20px; font-weight: bold; color: #0066B3; margin: 0; }
              .subtitle { font-size: 13px; color: #64748B; margin-top: 4px; }
              .badge-wtp { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; display: inline-block; margin-top: 8px; }
              .grid { display: flex; gap: 16px; margin: 20px 0; }
              .card { flex: 1; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; background: #F8FAFC; }
              .card-title { font-size: 11px; color: #64748B; text-transform: uppercase; margin: 0; }
              .card-value { font-size: 18px; font-weight: bold; color: #0F172A; margin: 4px 0 0 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
              th, td { border: 1px solid #CBD5E1; padding: 8px 10px; text-align: left; }
              th { background-color: #F1F5F9; color: #334155; }
              .footer { margin-top: 40px; font-size: 11px; color: #94A3B8; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">PARTAI AMANAT NASIONAL (PAN)</h1>
              <p class="subtitle">Publikasi Resmi Transparansi Keuangan Tahunan • Tahun Anggaran ${fin.fiscalYear}</p>
              <div class="badge-wtp">Opini Audit: ${fin.auditOpinionLabel}</div>
            </div>

            <p style="font-size: 12px; color: #475569;">
              Audit independen dilaksanakan oleh <strong>${fin.auditorFirm}</strong> pada ${fin.auditDate} (Nomor LHP: ${fin.auditNumber}).
            </p>

            <div class="grid">
              <div class="card">
                <p class="card-title">Total Penerimaan Kas</p>
                <p class="card-value" style="color: #059669;">Rp ${fin.totalIncome.toLocaleString('id-ID')}</p>
              </div>
              <div class="card">
                <p class="card-title">Total Pengeluaran Kas</p>
                <p class="card-value" style="color: #DC2626;">Rp ${fin.totalExpense.toLocaleString('id-ID')}</p>
              </div>
              <div class="card">
                <p class="card-title">Saldo Kas Akhir Tahun</p>
                <p class="card-value" style="color: #0066B3;">Rp ${fin.endingBalance.toLocaleString('id-ID')}</p>
              </div>
            </div>

            <h3>Rincian Penerimaan & Pengeluaran Kas</h3>
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kategori</th>
                  <th>Uraian Akun</th>
                  <th>Jumlah (Rp)</th>
                  <th>Porsi (%)</th>
                </tr>
              </thead>
              <tbody>
                ${fin.breakdown
                  .map(
                    (b, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td><strong>${b.category}</strong> (${b.subCategory})</td>
                    <td>${b.title}</td>
                    <td style="text-align: right;">${b.amount.toLocaleString('id-ID')}</td>
                    <td style="text-align: center;">${b.percentage}%</td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>

            <div class="footer">
              Dokumen ini dihasilkan secara otomatis melalui Sistem Informasi simPAN Mobile — Keterbukaan Informasi Publik PAN.<br/>
              Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Unduh Laporan Keuangan PAN 2024' });
      } else {
        setDialogConfig({
          visible: true,
          title: 'Laporan PDF Berhasil Dibuat',
          message: 'Berkas PDF laporan transparansi keuangan berhasil disusun dan disimpan pada memori perangkat Anda.',
          tone: 'success',
        });
      }
    } catch (e: any) {
      setDialogConfig({
        visible: true,
        title: 'Gagal Membuat Dokumen',
        message: 'Terjadi kendala saat menyusun berkas PDF laporan transparansi.',
        tone: 'danger',
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. HERO HEADER: KOMITMEN AKUNTABILITAS PUBLIK */}
      <View
        style={[
          styles.heroHeader,
          {
            backgroundColor: isDark ? 'rgba(0, 43, 82, 0.45)' : '#F0F7FF',
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.heroContentRow}>
          <View style={[styles.heroIconCircle, { backgroundColor: colors.primary }]}>
            <Feather name="shield" size={22} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <View style={styles.heroBadgeRow}>
              <View style={[styles.headerTag, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.headerTagText, { color: colors.primary }]}>Keterbukaan Informasi Publik</Text>
              </View>
              <View
                style={[
                  styles.auditPill,
                  {
                    backgroundColor: isDark ? 'rgba(5, 150, 105, 0.2)' : '#ECFDF5',
                    borderColor: isDark ? '#065F46' : '#A7F3D0',
                  },
                ]}
              >
                <Feather name="check-circle" size={12} color={isDark ? '#34D399' : '#059669'} />
                <Text style={[styles.auditPillText, { color: isDark ? '#34D399' : '#059669' }]}>Audit KAP: WTP</Text>
              </View>
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>Transparansi simPAN</Text>
            <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
              Komitmen akuntabilitas kepengurusan, tata kelola keuangan, dan bantuan publik Partai Amanat Nasional.
            </Text>
          </View>
        </View>

        {/* 2. TAB SEGMENTED SWITCHER (5 SUB-MENU) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContainer}
          style={styles.tabScrollView}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={({ pressed }) => [
                  styles.tabChip,
                  {
                    backgroundColor: isActive
                      ? colors.primary
                      : isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Feather
                  name={tab.icon}
                  size={14}
                  color={isActive ? '#FFFFFF' : colors.textMuted}
                  strokeWidth={iconStrokeWidth}
                />
                <Text
                  style={[
                    styles.tabChipText,
                    {
                      color: isActive ? '#FFFFFF' : colors.text,
                      fontFamily: isActive ? fonts.bold : fonts.medium,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
                {tab.badge && (
                  <View
                    style={[
                      styles.tabBadge,
                      {
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : colors.primaryLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabBadgeText,
                        { color: isActive ? '#FFFFFF' : colors.primary },
                      ]}
                    >
                      {tab.badge}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. TAB CONTENT AREA */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================================= */}
        {/* TAB 1: STRUKTUR ORGANISASI                                               */}
        {/* ========================================================================= */}
        {activeTab === 'struktur' && (
          <View style={styles.tabSectionWrapper}>
            {/* Banner Quick Link to SimpanStructureScreen */}
            <Card
              style={[
                styles.featureCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIconBox, { backgroundColor: colors.primaryLight }]}>
                  <Feather name="layers" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Hierarki Kepengurusan Partai</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                    Direktori struktur pimpinan berjenjang dari Pusat hingga Ranting TPS
                  </Text>
                </View>
              </View>

              {/* 5 Jenjang Strip */}
              <View style={styles.levelsGrid}>
                {[
                  { code: 'DPP', name: 'Tingkat Nasional', desc: 'Dewan Pimpinan Pusat (Jakarta)' },
                  { code: 'DPW', name: 'Tingkat Provinsi', desc: '38 Wilayah se-Indonesia' },
                  { code: 'DPD', name: 'Kota / Kabupaten', desc: '514 Daerah se-Indonesia' },
                  { code: 'DPC', name: 'Tingkat Kecamatan', desc: 'Pengurus Cabang' },
                  { code: 'DPRt', name: 'Kelurahan / Desa', desc: 'Basis Ranting & TPS' },
                ].map((lvl, idx) => (
                  <View
                    key={lvl.code}
                    style={[
                      styles.levelCard,
                      {
                        backgroundColor: isDark ? 'rgba(0, 43, 82, 0.25)' : '#F8FAFC',
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.levelBadgeText}>{lvl.code}</Text>
                    </View>
                    <Text style={[styles.levelName, { color: colors.text }]} numberOfLines={1}>
                      {lvl.name}
                    </Text>
                    <Text style={[styles.levelDesc, { color: colors.textMuted }]} numberOfLines={1}>
                      {lvl.desc}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.actionRowDivider, { backgroundColor: colors.border }]} />

              <View style={{ gap: 8 }}>
                <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, lineHeight: 17 }}>
                  Seluruh fungsionaris partai terdaftar secara resmi di Kementerian Hukum dan HAM serta KPU. Anda dapat
                  melihat bagan interaktif struktur lengkap dan kontak sekretariat masing-masing wilayah.
                </Text>

                <PrimaryButton
                  label="Buka Struktur & Direktori Pengurus Lengkap"
                  onPress={() => navigation.navigate('SimpanStructure')}
                  style={{ marginTop: 4 }}
                />
              </View>
            </Card>

            {/* Pimpinan Utama DPP PAN Preview */}
            <Card style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <SectionTitle>Pimpinan Utama DPP PAN</SectionTitle>
              <View style={{ gap: 10, marginTop: 4 }}>
                {STRUKTUR_PENGURUS.slice(0, 3).map((p) => (
                  <View
                    key={p.id}
                    style={[
                      styles.officerRow,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: colors.primaryLight,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Feather name="user" size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.text }}>{p.nama}</Text>
                      <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.primary }}>
                        {p.jabatan}
                      </Text>
                      <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted }}>
                        {p.periode} • {p.wilayah}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PROGRAM & KEGIATAN STRATEGIS                                      */}
        {/* ========================================================================= */}
        {activeTab === 'program' && (
          <View style={styles.tabSectionWrapper}>
            {/* Filter Status Chips */}
            <View style={styles.chipFilterRow}>
              {(['SEMUA', 'SELESAI', 'BERLANGSUNG'] as const).map((filter) => (
                <Pressable
                  key={filter}
                  onPress={() => setProgramFilter(filter)}
                  style={[
                    styles.subFilterChip,
                    {
                      backgroundColor:
                        programFilter === filter
                          ? colors.primary
                          : isDark
                          ? 'rgba(255,255,255,0.05)'
                          : colors.surface,
                      borderColor: programFilter === filter ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.subFilterChipText,
                      {
                        color: programFilter === filter ? '#FFFFFF' : colors.textMuted,
                        fontFamily: programFilter === filter ? fonts.bold : fonts.medium,
                      },
                    ]}
                  >
                    {filter === 'SEMUA' ? 'Semua Program' : filter === 'SELESAI' ? 'Terealisasi' : 'Sedang Berjalan'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* List of Strategic Programs */}
            {filteredPrograms.map((prog) => {
              const isCompleted = prog.status === 'SELESAI';
              return (
                <Card
                  key={prog.id}
                  style={[
                    styles.featureCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.programHeaderRow}>
                    <View style={[styles.fieldTag, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.fieldTagText, { color: colors.primary }]}>{prog.field}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: isCompleted
                            ? isDark ? 'rgba(5, 150, 105, 0.2)' : '#ECFDF5'
                            : isDark ? 'rgba(37, 99, 235, 0.2)' : '#EFF6FF',
                          borderColor: isCompleted
                            ? isDark ? '#065F46' : '#A7F3D0'
                            : isDark ? '#1E40AF' : '#BFDBFE',
                        },
                      ]}
                    >
                      <Feather
                        name={isCompleted ? 'check-circle' : 'clock'}
                        size={11}
                        color={isCompleted ? (isDark ? '#34D399' : '#059669') : (isDark ? '#60A5FA' : '#2563EB')}
                      />
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: isCompleted ? (isDark ? '#34D399' : '#059669') : (isDark ? '#60A5FA' : '#2563EB') },
                        ]}
                      >
                        {isCompleted ? 'Terealisasi 100%' : `${prog.progressPercentage}% Progres`}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.programTitle, { color: colors.text }]}>{prog.title}</Text>

                  {/* Progress Bar Visualizer */}
                  <View style={styles.progressTrackWrapper}>
                    <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(prog.progressPercentage, 100)}%`,
                            backgroundColor: isCompleted ? '#059669' : colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.progressLabelRow}>
                      <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                        Realisasi Dana: {formatRupiah(prog.budgetRealized)} / {formatRupiah(prog.budgetAllocated)}
                      </Text>
                      <Text style={[styles.progressValue, { color: colors.text }]}>
                        {prog.progressPercentage}%
                      </Text>
                    </View>
                  </View>

                  {/* Target & Realized Box */}
                  <View
                    style={[
                      styles.targetBox,
                      {
                        backgroundColor: isDark ? 'rgba(0, 43, 82, 0.2)' : '#F8FAFC',
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={{ gap: 2 }}>
                      <Text style={[styles.boxLabel, { color: colors.textMuted }]}>Target Capaian:</Text>
                      <Text style={[styles.boxText, { color: colors.text }]}>{prog.targetOutput}</Text>
                    </View>
                    <View style={{ gap: 2, marginTop: 4 }}>
                      <Text style={[styles.boxLabel, { color: colors.primary }]}>Output Terverifikasi:</Text>
                      <Text style={[styles.boxText, { color: colors.text }]}>{prog.realizedOutput}</Text>
                    </View>
                  </View>

                  {/* Footer Info */}
                  <View style={[styles.programFooterRow, { borderTopColor: colors.border }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Feather name="user-check" size={12} color={colors.textMuted} />
                      <Text style={[styles.programPicText, { color: colors.textMuted }]} numberOfLines={1}>
                        {prog.pic}
                      </Text>
                    </View>
                    <Text style={[styles.programPeriodText, { color: colors.textMuted }]}>
                      {prog.startDate} – {prog.endDate}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LAPORAN KEUANGAN                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'keuangan' && (
          <View style={styles.tabSectionWrapper}>
            {/* Opini Audit KAP Card */}
            <Card
              style={[
                styles.featureCard,
                {
                  backgroundColor: isDark ? 'rgba(5, 150, 105, 0.15)' : '#ECFDF5',
                  borderColor: isDark ? '#059669' : '#A7F3D0',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#059669',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather name="award" size={24} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: fonts.bold,
                      fontSize: 11,
                      color: isDark ? '#34D399' : '#047857',
                      letterSpacing: 0.5,
                    }}
                  >
                    OPINI AUDIT INDEPENDEN RESMI
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.bold,
                      fontSize: 16,
                      color: isDark ? '#6EE7B7' : '#065F46',
                      marginTop: 1,
                    }}
                  >
                    {FINANCIAL_REPORT_2024.auditOpinionLabel}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.regular,
                      fontSize: 11,
                      color: isDark ? '#A7F3D0' : '#047857',
                      marginTop: 4,
                    }}
                  >
                    Diaudit oleh: {FINANCIAL_REPORT_2024.auditorFirm}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.regular,
                      fontSize: 10,
                      color: isDark ? '#34D399' : '#059669',
                      marginTop: 2,
                    }}
                  >
                    No. LHP: {FINANCIAL_REPORT_2024.auditNumber} • {FINANCIAL_REPORT_2024.auditDate}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Metrik 3 Kartu Keuangan */}
            <View style={styles.metricRow}>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="arrow-down-left" size={16} color="#059669" />
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Penerimaan Kas</Text>
                <Text style={[styles.metricValue, { color: '#059669' }]}>
                  {formatRupiah(FINANCIAL_REPORT_2024.totalIncome)}
                </Text>
                <Text style={[styles.metricSub, { color: colors.textMuted }]}>TA 2024</Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="arrow-up-right" size={16} color="#DC2626" />
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Pengeluaran Kas</Text>
                <Text style={[styles.metricValue, { color: '#DC2626' }]}>
                  {formatRupiah(FINANCIAL_REPORT_2024.totalExpense)}
                </Text>
                <Text style={[styles.metricSub, { color: colors.textMuted }]}>TA 2024</Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="briefcase" size={16} color={colors.primary} />
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Saldo Akhir</Text>
                <Text style={[styles.metricValue, { color: colors.primary }]}>
                  {formatRupiah(FINANCIAL_REPORT_2024.endingBalance)}
                </Text>
                <Text style={[styles.metricSub, { color: colors.textMuted }]}>Kas & Bank</Text>
              </View>
            </View>

            {/* Rincian Pos Penerimaan */}
            <Card style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <SectionTitle>Sumber Penerimaan Kas Partai (TA 2024)</SectionTitle>
              <View style={{ gap: 12, marginTop: 8 }}>
                {FINANCIAL_REPORT_2024.breakdown
                  .filter((item) => item.category === 'PENERIMAAN')
                  .map((item) => (
                    <View key={item.id} style={styles.breakdownRow}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.breakdownTitle, { color: colors.text }]}>{item.title}</Text>
                          {item.isMandatoryPublicAid && (
                            <View style={[styles.miniTag, { backgroundColor: colors.primaryLight }]}>
                              <Text style={[styles.miniTagText, { color: colors.primary }]}>Banpar APBN</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.breakdownDesc, { color: colors.textMuted }]}>{item.description}</Text>
                        {/* Bar Proporsi */}
                        <View style={[styles.miniTrack, { backgroundColor: colors.border }]}>
                          <View
                            style={[
                              styles.miniFill,
                              { width: `${item.percentage}%`, backgroundColor: '#059669' },
                            ]}
                          />
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end', minWidth: 80 }}>
                        <Text style={[styles.breakdownAmount, { color: '#059669' }]}>
                          {formatRupiah(item.amount)}
                        </Text>
                        <Text style={[styles.breakdownPct, { color: colors.textMuted }]}>{item.percentage}%</Text>
                      </View>
                    </View>
                  ))}
              </View>
            </Card>

            {/* Rincian Pos Pengeluaran */}
            <Card style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <SectionTitle>Alokasi Belanja & Operasional Partai (TA 2024)</SectionTitle>
              <View style={{ gap: 12, marginTop: 8 }}>
                {FINANCIAL_REPORT_2024.breakdown
                  .filter((item) => item.category === 'PENGELUARAN')
                  .map((item) => (
                    <View key={item.id} style={styles.breakdownRow}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={[styles.breakdownTitle, { color: colors.text }]}>{item.title}</Text>
                        <Text style={[styles.breakdownDesc, { color: colors.textMuted }]}>{item.description}</Text>
                        {/* Bar Proporsi */}
                        <View style={[styles.miniTrack, { backgroundColor: colors.border }]}>
                          <View
                            style={[
                              styles.miniFill,
                              { width: `${item.percentage}%`, backgroundColor: '#DC2626' },
                            ]}
                          />
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end', minWidth: 80 }}>
                        <Text style={[styles.breakdownAmount, { color: '#DC2626' }]}>
                          {formatRupiah(item.amount)}
                        </Text>
                        <Text style={[styles.breakdownPct, { color: colors.textMuted }]}>{item.percentage}%</Text>
                      </View>
                    </View>
                  ))}
              </View>

              {/* Action Button: Unduh PDF Laporan */}
              <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                <PrimaryButton
                  label={isExportingPdf ? 'Menyiapkan PDF...' : 'Unduh Laporan Keuangan Resmi (PDF)'}
                  onPress={handleExportFinancialPdf}
                  loading={isExportingPdf}
                  icon="download"
                />
              </View>
            </Card>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PENGGUNAAN BANTUAN PUBLIK (BANPAR APBN/APBD)                       */}
        {/* ========================================================================= */}
        {activeTab === 'bantuan' && (
          <View style={styles.tabSectionWrapper}>
            {/* Status Kepatuhan Audit BPK */}
            <Card
              style={[
                styles.featureCard,
                {
                  backgroundColor: isDark ? 'rgba(0, 102, 179, 0.15)' : '#EFF6FF',
                  borderColor: isDark ? '#1E40AF' : '#BFDBFE',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather name="shield" size={24} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: colors.primary, letterSpacing: 0.5 }}>
                    HASIL AUDIT BADAN PEMERIKSA KEUANGAN (BPK RI)
                  </Text>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: colors.text, marginTop: 1 }}>
                    Pertanggungjawaban Sesuai Kriteria (Nihil Temuan Krusial)
                  </Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                    Dasar Hukum: {PUBLIC_AID_REPORT_2024.legalBasis}
                  </Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                    No. LHP BPK: {PUBLIC_AID_REPORT_2024.bpkAuditNumber} • {PUBLIC_AID_REPORT_2024.bpkAuditDate}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Indikator Mandat Hukum: Rasio 60% Pendidikan Politik : 40% Operasional */}
            <Card style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <SectionTitle>Kepatuhan Alokasi Bantuan Keuangan Parpol (Banpar)</SectionTitle>
              <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                Sesuai Permendagri No. 78/2020: Minimal 60% dialokasikan untuk Pendidikan Politik Kader/Warga, maksimal
                40% untuk Operasional Sekretariat.
              </Text>

              {/* Progress visualizer rasio */}
              <View style={{ marginTop: 14, gap: 10 }}>
                {/* 1. Pendidikan Politik */}
                <View style={{ gap: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text }}>
                      1. Pendidikan Politik (Min. 60%)
                    </Text>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: '#059669' }}>
                      {PUBLIC_AID_REPORT_2024.politicalEducationPercentage}% (TERPENUHI)
                    </Text>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${PUBLIC_AID_REPORT_2024.politicalEducationPercentage}%`, backgroundColor: '#059669' },
                      ]}
                    />
                  </View>
                </View>

                {/* 2. Operasional Kesekretariatan */}
                <View style={{ gap: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text }}>
                      2. Operasional Sekretariat (Maks. 40%)
                    </Text>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.primary }}>
                      {PUBLIC_AID_REPORT_2024.operationalPercentage}% (TERKONTROL)
                    </Text>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${PUBLIC_AID_REPORT_2024.operationalPercentage}%`, backgroundColor: colors.primary },
                      ]}
                    />
                  </View>
                </View>
              </View>

              {/* Serapan Kas Total */}
              <View
                style={[
                  styles.absorptionBox,
                  {
                    backgroundColor: isDark ? 'rgba(0, 43, 82, 0.25)' : '#F8FAFC',
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted }}>
                    Tingkat Serapan Banpar TA 2024
                  </Text>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.text }}>
                    {formatRupiah(PUBLIC_AID_REPORT_2024.totalRealized)} dari {formatRupiah(PUBLIC_AID_REPORT_2024.totalReceived)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.rateBadge,
                    {
                      backgroundColor: isDark ? 'rgba(5, 150, 105, 0.2)' : '#ECFDF5',
                      borderColor: isDark ? '#065F46' : '#A7F3D0',
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: fonts.bold,
                      fontSize: 13,
                      color: isDark ? '#34D399' : '#059669',
                    }}
                  >
                    {PUBLIC_AID_REPORT_2024.absorptionRate}%
                  </Text>
                </View>
              </View>
            </Card>

            {/* Rincian Kegiatan yang Dibiayai Bantuan Publik */}
            <Card style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <SectionTitle>Daftar Realisasi Program Bantuan Publik</SectionTitle>
              <View style={{ gap: 10, marginTop: 8 }}>
                {PUBLIC_AID_REPORT_2024.activities.map((act) => {
                  const isDiklat = act.allocationCategory === 'PENDIDIKAN_POLITIK';
                  return (
                    <View
                      key={act.id}
                      style={[
                        styles.activityRowCard,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View
                          style={[
                            styles.miniCatTag,
                            {
                              backgroundColor: isDiklat
                                ? isDark ? 'rgba(5, 150, 105, 0.2)' : '#ECFDF5'
                                : isDark ? 'rgba(37, 99, 235, 0.2)' : '#EFF6FF',
                            },
                          ]}
                        >
                          <Text
                            style={{
                              fontFamily: fonts.bold,
                              fontSize: 9,
                              color: isDiklat
                                ? isDark ? '#34D399' : '#059669'
                                : isDark ? '#60A5FA' : '#2563EB',
                            }}
                          >
                            {isDiklat ? 'PENDIDIKAN POLITIK' : 'OPERASIONAL KANTOR'}
                          </Text>
                        </View>
                        <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text }}>
                          {formatRupiah(act.amount)}
                        </Text>
                      </View>

                      <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text }}>{act.title}</Text>

                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Feather name="calendar" size={11} color={colors.textMuted} />
                          <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted }}>
                            {act.executionDate}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Feather name="map-pin" size={11} color={colors.textMuted} />
                          <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted }}>
                            {act.location}
                          </Text>
                        </View>
                        {act.realizedParticipants && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Feather name="users" size={11} color={colors.primary} />
                            <Text style={{ fontFamily: fonts.medium, fontSize: 10, color: colors.primary }}>
                              {act.realizedParticipants.toLocaleString('id-ID')} Peserta
                            </Text>
                          </View>
                        )}
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 4,
                          paddingTop: 6,
                          borderTopWidth: 1,
                          borderTopColor: colors.border,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Feather name="file-text" size={11} color="#059669" />
                          <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted }}>
                            SPJ Terverifikasi: {act.evidenceDocumentName}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.verifiedBpkTag,
                            {
                              backgroundColor: isDark ? 'rgba(5, 150, 105, 0.2)' : '#ECFDF5',
                              borderColor: isDark ? '#065F46' : '#A7F3D0',
                            },
                          ]}
                        >
                          <Feather name="check" size={10} color={isDark ? '#34D399' : '#059669'} />
                          <Text
                            style={[
                              styles.verifiedBpkTagText,
                              { color: isDark ? '#34D399' : '#059669' },
                            ]}
                          >
                            BPK RI
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: KEBIJAKAN & DOKUMEN RESMI                                          */}
        {/* ========================================================================= */}
        {activeTab === 'kebijakan' && (
          <View style={styles.tabSectionWrapper}>
            {/* Search Input Bar */}
            <View
              style={[
                styles.searchBarWrap,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather name="search" size={16} color={colors.textMuted} />
              <TextInput
                value={documentSearch}
                onChangeText={setDocumentSearch}
                placeholder="Cari AD/ART, Peraturan Organisasi, Pakta..."
                placeholderTextColor={colors.textMuted}
                style={[styles.searchInput, { color: colors.text }]}
              />
              {documentSearch.length > 0 && (
                <Pressable onPress={() => setDocumentSearch('')} hitSlop={8}>
                  <Feather name="x" size={16} color={colors.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Category Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6, paddingVertical: 4 }}
            >
              {[
                { key: 'SEMUA', label: 'Semua Dokumen' },
                { key: 'AD_ART', label: 'AD / ART' },
                { key: 'PERATURAN_ORGANISASI', label: 'Peraturan Partai (PO)' },
                { key: 'PAKTA_INTEGRITAS', label: 'Pakta Integritas' },
                { key: 'PEDOMAN_AKUNTANSI', label: 'Pedoman Akuntansi' },
                { key: 'KEBIJAKAN_PUBLIK', label: 'Keterbukaan KIP' },
              ].map((cat) => (
                <Pressable
                  key={cat.key}
                  onPress={() => setSelectedCategory(cat.key)}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor:
                        selectedCategory === cat.key
                          ? colors.primary
                          : isDark
                          ? 'rgba(255,255,255,0.05)'
                          : colors.surface,
                      borderColor: selectedCategory === cat.key ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      {
                        color: selectedCategory === cat.key ? '#FFFFFF' : colors.textMuted,
                        fontFamily: selectedCategory === cat.key ? fonts.bold : fonts.medium,
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Documents List */}
            {filteredDocuments.length === 0 ? (
              <EmptyState
                title="Dokumen Tidak Ditemukan"
                body="Tidak ada dokumen atau kebijakan yang sesuai dengan kriteria pencarian."
                icon="file-text"
              />
            ) : (
              filteredDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  style={[
                    styles.featureCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 8,
                        backgroundColor: colors.primaryLight,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Feather name="file-text" size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.docTag, { backgroundColor: colors.primaryLight }]}>
                          <Text style={[styles.docTagText, { color: colors.primary }]}>{doc.categoryLabel}</Text>
                        </View>
                        <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted }}>
                          {doc.year} • {doc.fileSize}
                        </Text>
                      </View>
                      <Text style={[styles.docTitle, { color: colors.text }]}>{doc.title}</Text>
                      <Text style={[styles.docNumber, { color: colors.primary }]}>{doc.codeNumber}</Text>
                      <Text style={[styles.docSummary, { color: colors.textMuted }]} numberOfLines={2}>
                        {doc.summary}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 10,
                      paddingTop: 8,
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                    }}
                  >
                    <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted }}>
                      Berlaku: {doc.effectiveDate}
                    </Text>
                    <Pressable
                      onPress={() => setSelectedDoc(doc)}
                      style={({ pressed }) => [
                        styles.readDocBtn,
                        { backgroundColor: colors.primaryLight },
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text style={[styles.readDocBtnText, { color: colors.primary }]}>Baca Ringkasan Pasal</Text>
                      <Feather name="chevron-right" size={13} color={colors.primary} />
                    </Pressable>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL: DETAIL PASAL DOKUMEN KEBIJAKAN */}
      <Modal
        visible={!!selectedDoc}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDoc(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={[styles.docTag, { backgroundColor: colors.primaryLight, alignSelf: 'flex-start' }]}>
                  <Text style={[styles.docTagText, { color: colors.primary }]}>{selectedDoc?.categoryLabel}</Text>
                </View>
                <Text style={[styles.modalDocTitle, { color: colors.text }]}>{selectedDoc?.title}</Text>
                <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.primary }}>
                  {selectedDoc?.codeNumber}
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedDoc(null)}
                style={({ pressed }) => [
                  styles.modalCloseBtn,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' },
                  pressed && { opacity: 0.7 },
                ]}
                hitSlop={8}
              >
                <Feather name="x" size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 14, paddingVertical: 10 }}>
                {/* Ringkasan Umum */}
                <View
                  style={[
                    styles.docSummaryBox,
                    {
                      backgroundColor: isDark ? 'rgba(0, 43, 82, 0.25)' : '#F8FAFC',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text }}>Ringkasan Kebijakan:</Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, lineHeight: 18, marginTop: 4 }}>
                    {selectedDoc?.summary}
                  </Text>
                </View>

                {/* Pasal-Pasal Kunci */}
                <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.text }}>
                  Pasal & Ketentuan Pokok:
                </Text>

                {selectedDoc?.keyArticles.map((art, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.articleCard,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.articleHeader}>
                      <View style={[styles.articlePill, { backgroundColor: colors.primary }]}>
                        <Text style={styles.articlePillText}>{art.articleNumber}</Text>
                      </View>
                      <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text, flex: 1 }}>
                        {art.title}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, lineHeight: 18 }}>
                      "{art.content}"
                    </Text>
                  </View>
                ))}

                {/* Metadata Penandatangan */}
                <View
                  style={{
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    gap: 2,
                  }}
                >
                  <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>
                    Otoritas Penandatangan:
                  </Text>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text }}>
                    {selectedDoc?.signedBy}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <PrimaryButton
                label="Tutup Ringkasan"
                onPress={() => setSelectedDoc(null)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* CONFIRM DIALOG */}
      <ConfirmDialog
        visible={dialogConfig.visible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        tone={dialogConfig.tone}
        confirmLabel="Tutup"
        singleButton
        onConfirm={() => setDialogConfig((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroHeader: {
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  heroContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  headerTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  headerTagText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  auditPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  auditPillText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#059669',
  },
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 22,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  tabScrollView: {
    marginTop: 4,
  },
  tabScrollContainer: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  tabChipText: {
    fontSize: 12,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
  },
  tabBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 9,
  },
  contentScroll: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
    gap: 14,
  },
  tabSectionWrapper: {
    gap: 14,
  },
  featureCard: {
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 10,
    ...shadow.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  levelCard: {
    flex: 1,
    minWidth: '45%',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 2,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  levelBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#FFFFFF',
  },
  levelName: {
    fontFamily: fonts.bold,
    fontSize: 12,
    marginTop: 2,
  },
  levelDesc: {
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  actionRowDivider: {
    height: 1,
    marginVertical: 4,
  },
  officerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  chipFilterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  subFilterChip: {
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subFilterChipText: {
    fontSize: 11,
  },
  programHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  fieldTagText: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  programTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    lineHeight: 18,
  },
  progressTrackWrapper: {
    gap: 4,
    marginVertical: 4,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  progressValue: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  targetBox: {
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  boxLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  boxText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  programFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
  },
  programPicText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    maxWidth: 180,
  },
  programPeriodText: {
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
    ...shadow.sm,
  },
  metricLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    textAlign: 'center',
  },
  metricValue: {
    fontFamily: fonts.bold,
    fontSize: 12,
    textAlign: 'center',
  },
  metricSub: {
    fontFamily: fonts.regular,
    fontSize: 9,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  breakdownTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  breakdownDesc: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14,
  },
  miniTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniTagText: {
    fontFamily: fonts.bold,
    fontSize: 8,
  },
  miniTrack: {
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 2,
  },
  breakdownAmount: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  breakdownPct: {
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  absorptionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: 6,
  },
  rateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  activityRowCard: {
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
  },
  miniCatTag: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  verifiedBpkTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  verifiedBpkTagText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#059669',
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    padding: 0,
  },
  catChip: {
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catChipText: {
    fontSize: 11,
  },
  docTag: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  docTagText: {
    fontFamily: fonts.bold,
    fontSize: 9,
  },
  docTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
  },
  docNumber: {
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  docSummary: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  readDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  readDocBtnText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    padding: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  modalDocTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 19,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docSummaryBox: {
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  articleCard: {
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 6,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  articlePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  articlePillText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#FFFFFF',
  },
  modalFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
  },
});
