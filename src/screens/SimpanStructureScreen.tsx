import React, { useMemo, useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, Modal, Pill } from '../components/ui';
import { fonts, fontSize, radius, spacing } from '../theme';
import { STRUKTUR_PENGURUS, PengurusOrg } from '../data/simpan';
import { getWitnessAvatar } from '../data/images';

export interface HierarchyNode {
  key: PengurusOrg['tingkat'];
  level: number;
  levelCode: string;
  categoryLabel: string;
  title: string;
  scope: string;
  periode: string;
  subordinatesTo?: string;
  supervises?: string;
  officers: PengurusOrg[];
}

const HIERARCHY_NODES: HierarchyNode[] = [
  {
    key: 'DPP',
    level: 0,
    levelCode: 'L0',
    categoryLabel: 'Pusat (Nasional)',
    title: 'Dewan Pimpinan Pusat (DPP)',
    scope: 'Nasional • 38 Provinsi',
    periode: '2020 – 2025',
    supervises: 'Membawahi 38 DPW Provinsi',
    officers: STRUKTUR_PENGURUS.filter((p) => p.tingkat === 'DPP'),
  },
  {
    key: 'DPW',
    level: 1,
    levelCode: 'L1',
    categoryLabel: 'Wilayah (Provinsi)',
    title: 'DPW Jawa Barat',
    scope: 'Provinsi Jawa Barat',
    periode: '2020 – 2025',
    subordinatesTo: 'DPP Pusat',
    supervises: 'Membawahi 27 DPD Kota/Kabupaten',
    officers: STRUKTUR_PENGURUS.filter((p) => p.tingkat === 'DPW'),
  },
  {
    key: 'DPD',
    level: 2,
    levelCode: 'L2',
    categoryLabel: 'Daerah (Kota/Kab)',
    title: 'DPD Kota Bandung',
    scope: 'Kota Bandung',
    periode: '2020 – 2025',
    subordinatesTo: 'DPW Jawa Barat',
    supervises: 'Membawahi 30 DPC Kecamatan',
    officers: STRUKTUR_PENGURUS.filter((p) => p.tingkat === 'DPD'),
  },
  {
    key: 'DPC',
    level: 3,
    levelCode: 'L3',
    categoryLabel: 'Cabang (Kecamatan)',
    title: 'DPC Coblong',
    scope: 'Kecamatan Coblong',
    periode: '2021 – 2026',
    subordinatesTo: 'DPD Kota Bandung',
    supervises: 'Membawahi 6 DPRt Kelurahan',
    officers: STRUKTUR_PENGURUS.filter((p) => p.tingkat === 'DPC'),
  },
  {
    key: 'DPRT',
    level: 4,
    levelCode: 'L4',
    categoryLabel: 'Ranting (Kelurahan)',
    title: 'DPRt Dago',
    scope: 'Kelurahan Dago',
    periode: '2022 – 2027',
    subordinatesTo: 'DPC Coblong',
    supervises: 'Membawahi Kader & Saksi TPS',
    officers: STRUKTUR_PENGURUS.filter((p) => p.tingkat === 'DPRT'),
  },
];

/**
 * Menyederhanakan nama jabatan di kartu agar tidak mengulang nama lembaga
 * yang sudah menjadi judul wadah (misal "Ketua DPW PAN Jawa Barat" -> "Ketua DPW")
 */
function getConciseJabatan(jabatan: string): string {
  return jabatan
    .replace(' DPP PAN', '')
    .replace(' DPW PAN Jawa Barat', ' DPW')
    .replace(' DPD PAN Kota Bandung', ' DPD')
    .replace(' DPC PAN Coblong', ' DPC')
    .replace(' DPRt PAN Dago', ' DPRt')
    .replace(' / Kepala BSN PAN', ' / Ka. BSN');
}

export default function SimpanStructureScreen() {
  const { colors, isDark } = useTheme();

  // Filter & Search states
  const [activeLevelFilter, setActiveLevelFilter] = useState<PengurusOrg['tingkat'] | 'SEMUA'>('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'diagram'>('tree');

  // Accordion state
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    DPP: true,
    DPW: true,
    DPD: true,
    DPC: true,
    DPRT: true,
  });

  // Modal state
  const [selectedOfficer, setSelectedOfficer] = useState<{
    officer: PengurusOrg;
    node: HierarchyNode;
  } | null>(null);
  const [contactDialog, setContactDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const toggleNode = (key: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const areAllExpanded = useMemo(() => {
    return Object.values(expandedNodes).every(Boolean);
  }, [expandedNodes]);

  const toggleAll = () => {
    const nextState = !areAllExpanded;
    setExpandedNodes({
      DPP: nextState,
      DPW: nextState,
      DPD: nextState,
      DPC: nextState,
      DPRT: nextState,
    });
  };

  const handleCall = (phone: string, name: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${clean}`).catch(() => {
      setContactDialog({
        visible: true,
        title: 'Kontak Pengurus',
        message: `Nomor telepon ${name}:\n${phone}`,
      });
    });
  };

  const handleEmail = (email: string, name: string) => {
    Linking.openURL(`mailto:${email}?subject=Koordinasi%20Struktur%20simPAN`).catch(() => {
      setContactDialog({
        visible: true,
        title: 'Kontak Pengurus',
        message: `Alamat email ${name}:\n${email}`,
      });
    });
  };

  // Filter nodes
  const filteredNodes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return HIERARCHY_NODES.map((node) => {
      const isMatch = activeLevelFilter === 'SEMUA' || node.key === activeLevelFilter;
      if (!isMatch) return { ...node, officers: [] };
      if (!query) return node;

      const matched = node.officers.filter(
        (o) =>
          o.nama.toLowerCase().includes(query) ||
          o.jabatan.toLowerCase().includes(query) ||
          node.title.toLowerCase().includes(query)
      );

      return { ...node, officers: matched };
    }).filter((node) => {
      if (activeLevelFilter !== 'SEMUA' && node.key !== activeLevelFilter) return false;
      if (searchQuery.trim().length > 0) return node.officers.length > 0;
      return true;
    });
  }, [activeLevelFilter, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. TOP FUNCTIONAL TOOLBAR (Bebas dari Banner Judul Duplikat) */}
      <View style={[styles.topToolbar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {/* Search input + Action Buttons */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Feather name="search" size={14} color={colors.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari pengurus atau jabatan..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <Feather name="x-circle" size={14} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          {/* Toggle All Expand/Collapse */}
          <Pressable
            onPress={toggleAll}
            hitSlop={6}
            style={[styles.toolBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
          >
            <Feather
              name={areAllExpanded ? 'minimize-2' : 'maximize-2'}
              size={14}
              color={colors.primary}
            />
          </Pressable>

          {/* View Mode Toggle */}
          <Pressable
            onPress={() => setViewMode((m) => (m === 'tree' ? 'diagram' : 'tree'))}
            hitSlop={6}
            style={[
              styles.toolBtn,
              {
                backgroundColor: viewMode === 'diagram' ? colors.primary : colors.background,
                borderColor: viewMode === 'diagram' ? colors.primary : colors.border,
              },
            ]}
          >
            <Feather
              name={viewMode === 'tree' ? 'git-branch' : 'list'}
              size={14}
              color={viewMode === 'diagram' ? '#FFFFFF' : colors.primary}
            />
          </Pressable>
        </View>

        {/* Formal Stepper Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stepperScroll}
        >
          <Pressable
            onPress={() => setActiveLevelFilter('SEMUA')}
            style={[
              styles.stepPill,
              {
                backgroundColor: activeLevelFilter === 'SEMUA' ? colors.primary : colors.background,
                borderColor: activeLevelFilter === 'SEMUA' ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.stepPillText,
                {
                  color: activeLevelFilter === 'SEMUA' ? '#FFFFFF' : colors.text,
                  fontWeight: activeLevelFilter === 'SEMUA' ? '800' : '600',
                },
              ]}
            >
              Semua
            </Text>
          </Pressable>

          {HIERARCHY_NODES.map((node) => {
            const isSelected = activeLevelFilter === node.key;

            return (
              <React.Fragment key={node.key}>
                <View style={styles.stepChevron}>
                  <Feather name="chevron-right" size={11} color={colors.textMuted} />
                </View>

                <Pressable
                  onPress={() => {
                    setActiveLevelFilter(node.key);
                    setExpandedNodes((prev) => ({ ...prev, [node.key]: true }));
                  }}
                  style={[
                    styles.stepPill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.background,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.stepPillText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.text,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                  >
                    {node.title.split(' ')[0]} {node.key}
                  </Text>
                </Pressable>
              </React.Fragment>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. MAIN TREE CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'diagram' ? (
          /* ========================================================
             DIAGRAM VIEW (Bagan Alur Ringkas)
             ======================================================== */
          <View style={styles.diagramContainer}>
            {HIERARCHY_NODES.map((node, index) => {
              const isLast = index === HIERARCHY_NODES.length - 1;
              const isRoot = node.level === 0;

              return (
                <View key={node.key} style={styles.diagramBlock}>
                  <Pressable
                    onPress={() => {
                      setViewMode('tree');
                      setActiveLevelFilter(node.key);
                      setExpandedNodes((prev) => ({ ...prev, [node.key]: true }));
                    }}
                    style={({ pressed }) => [
                      styles.diagramCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isRoot ? colors.primary : colors.border,
                        borderWidth: isRoot ? 1.5 : 1,
                      },
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    <View style={styles.diagramHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.diagramTitleRow}>
                          <Text style={[styles.diagramNodeTitle, { color: colors.text }]}>{node.title}</Text>
                          <Pill label={`${node.officers.length} Pengurus`} tone="primary" />
                        </View>
                        <Text style={[styles.diagramNodeMeta, { color: colors.textMuted }]}>
                          {node.scope} • Periode {node.periode}
                        </Text>
                      </View>
                      <Feather name="arrow-up-right" size={15} color={colors.primary} />
                    </View>

                    {/* Preview Leader Avatar */}
                    <View style={[styles.diagramLeaderRow, { borderTopColor: colors.border }]}>
                      <Image
                        source={getWitnessAvatar(node.officers[0]?.avatarIndex ?? 0)}
                        style={[styles.diagramLeaderAvatar, { borderColor: colors.primary }]}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.diagramLeaderRole, { color: colors.primary }]}>
                          {getConciseJabatan(node.officers[0]?.jabatan || '')}
                        </Text>
                        <Text style={[styles.diagramLeaderName, { color: colors.text }]} numberOfLines={1}>
                          {node.officers[0]?.nama || '-'}
                        </Text>
                      </View>
                    </View>
                  </Pressable>

                  {!isLast && (
                    <View style={styles.diagramConnectorWrap}>
                      <View style={[styles.diagramLine, { backgroundColor: colors.borderStrong }]} />
                      <View style={[styles.diagramDot, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                        <Feather name="chevron-down" size={10} color={colors.primary} />
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          /* ========================================================
             TRUE ROOT TREE (Tanpa Redundansi Wilayah/Periode di Kartu)
             ======================================================== */
          <View style={styles.treeRoot}>
            {filteredNodes.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Feather name="search" size={24} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Pengurus Tidak Ditemukan</Text>
                <Text style={[styles.emptySub, { color: colors.textMuted }]}>
                  Tidak ada data untuk "{searchQuery}".
                </Text>
                <Pressable
                  onPress={() => {
                    setSearchQuery('');
                    setActiveLevelFilter('SEMUA');
                  }}
                  style={[styles.emptyResetBtn, { backgroundColor: colors.primaryLight }]}
                >
                  <Text style={[styles.emptyResetText, { color: colors.primary }]}>Reset Pencarian</Text>
                </Pressable>
              </Card>
            ) : (
              filteredNodes.map((node, nodeIdx) => {
                const isExpanded = expandedNodes[node.key] ?? true;
                const isRoot = node.level === 0;
                const isLastNode = nodeIdx === filteredNodes.length - 1;

                return (
                  <View key={node.key} style={styles.treeBranch}>
                    {/* LEFT TRUNK RAIL */}
                    <View style={styles.trunkRail}>
                      <View
                        style={[
                          styles.trunkBullet,
                          isRoot
                            ? { backgroundColor: colors.primary, borderColor: colors.primaryLight }
                            : { backgroundColor: colors.surface, borderColor: colors.primary },
                        ]}
                      >
                        {isRoot ? (
                          <Feather name="shield" size={11} color="#FFFFFF" />
                        ) : (
                          <View style={[styles.innerDot, { backgroundColor: colors.primary }]} />
                        )}
                      </View>

                      {!isLastNode && (
                        <View style={[styles.trunkVerticalLine, { backgroundColor: colors.borderStrong }]} />
                      )}
                    </View>

                    {/* RIGHT COLUMN */}
                    <View style={styles.branchColumn}>
                      {/* NODE HEADER (Single Source of Truth untuk Wilayah, Periode & Status Wadah) */}
                      <Pressable
                        onPress={() => toggleNode(node.key)}
                        style={({ pressed }) => [
                          styles.nodeHeader,
                          {
                            backgroundColor: isRoot
                              ? (isDark ? '#002B52' : '#EBF4FF')
                              : (isDark ? '#001E3C' : '#F8FAFC'),
                            borderColor: isRoot ? colors.primary : colors.borderStrong,
                            borderWidth: isRoot ? 1.5 : 1,
                          },
                          pressed && { opacity: 0.9 },
                        ]}
                      >
                        <View style={styles.nodeHeaderContent}>
                          <View style={{ flex: 1, gap: 1 }}>
                            {/* Badges: Kategori Wadah & Periode Masa Bakti (Cukup disini!) */}
                            {/* Badges: Kategori Wadah & Periode Masa Bakti */}
                            <View style={styles.nodeBadgesRow}>
                              <View style={[styles.categoryBadge, { backgroundColor: isRoot ? colors.primary : colors.primaryLight }]}>
                                <Text style={[styles.categoryBadgeText, { color: isRoot ? '#FFFFFF' : colors.primary }]}>
                                  {isRoot ? 'ROOT • PUSAT' : node.categoryLabel.toUpperCase()}
                                </Text>
                              </View>
                              <Text style={[styles.nodePeriodeText, { color: colors.textMuted }]}>
                                Periode {node.periode}
                              </Text>
                            </View>

                            {/* Nama Lembaga Resmi & Wilayah Cakupan */}
                            <Text style={[styles.nodeTitle, { color: colors.text }]}>{node.title}</Text>
                            <Text style={[styles.nodeScope, { color: colors.textMuted }]}>
                              {node.scope}
                            </Text>

                            {/* Rantai Komando: Naungan Induk */}
                            {node.subordinatesTo && (
                              <View style={styles.subordinationRow}>
                                <Feather name="corner-down-right" size={9} color={colors.primary} />
                                <Text style={[styles.subordinationText, { color: colors.textMuted }]}>
                                  Naungan: <Text style={{ color: colors.primary, fontWeight: '600' }}>{node.subordinatesTo}</Text>
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Tombol Ciutkan/Bentangkan + Jumlah Pengurus */}
                          <View style={styles.headerRightToggle}>
                            <View style={[styles.officerCountPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                              <Text style={[styles.officerCountText, { color: colors.text }]}>
                                {node.officers.length}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.chevronCircle,
                                { backgroundColor: isExpanded ? colors.primary : colors.surface, borderColor: colors.border },
                              ]}
                            >
                              <Feather
                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                size={13}
                                color={isExpanded ? '#FFFFFF' : colors.text}
                              />
                            </View>
                          </View>
                        </View>
                      </Pressable>

                      {/* OFFICERS CARDS (Bebas Redundansi: Tidak Mengulang Wilayah & Periode!) */}
                      {isExpanded && (
                        <View style={styles.officersList}>
                          {node.officers.map((officer, officerIdx) => {
                            const isChief =
                              officer.jabatan.toLowerCase().includes('ketua umum') ||
                              officer.jabatan.toLowerCase().startsWith('ketua');
                            const isLastOfficer = officerIdx === node.officers.length - 1;

                            return (
                              <View key={officer.id} style={styles.officerRow}>
                                {/* ELBOW CONNECTOR (├─ atau └─) */}
                                <View style={styles.elbowRail}>
                                  <View style={[styles.elbowTopLine, { backgroundColor: colors.borderStrong }]} />
                                  <View
                                    style={[
                                      styles.elbowCurve,
                                      {
                                        borderColor: colors.borderStrong,
                                        borderLeftWidth: 2,
                                        borderBottomWidth: 2,
                                      },
                                    ]}
                                  />
                                  {!isLastOfficer && (
                                    <View style={[styles.elbowBottomLine, { backgroundColor: colors.borderStrong }]} />
                                  )}
                                </View>

                                {/* OFFICER COMPACT CARD */}
                                <Pressable
                                  onPress={() => setSelectedOfficer({ officer, node })}
                                  style={({ pressed }) => [
                                    styles.officerCard,
                                    {
                                      backgroundColor: colors.surface,
                                      borderColor: isChief ? colors.primary : colors.border,
                                      borderWidth: isChief ? 1.5 : 1,
                                    },
                                    pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
                                  ]}
                                >
                                  {/* Avatar */}
                                  <View style={styles.avatarWrap}>
                                    <Image
                                      source={getWitnessAvatar(officer.avatarIndex)}
                                      style={[styles.avatar, { borderColor: isChief ? colors.primary : colors.border }]}
                                    />
                                    {isChief && (
                                      <View style={[styles.crownBadge, { backgroundColor: colors.primary }]}>
                                        <Feather name="award" size={8} color="#FFFFFF" />
                                      </View>
                                    )}
                                  </View>

                                  {/* Info Bersih: Hanya Jabatan Esensial + Nama Lengkap */}
                                  <View style={styles.infoCol}>
                                    <View style={styles.roleLine}>
                                      <Text style={[styles.conciseRoleText, { color: colors.primary }]} numberOfLines={1}>
                                        {getConciseJabatan(officer.jabatan)}
                                      </Text>
                                      {isChief && (
                                        <View style={[styles.chiefPill, { backgroundColor: colors.primaryLight }]}>
                                          <Text style={[styles.chiefPillText, { color: colors.primary }]}>Pimpinan</Text>
                                        </View>
                                      )}
                                    </View>

                                    <Text style={[styles.officerName, { color: colors.text }]} numberOfLines={1}>
                                      {officer.nama}
                                    </Text>
                                  </View>

                                  {/* Quick Actions (Direct Phone & Email) */}
                                  <View style={styles.actionsCol}>
                                    {officer.telepon && (
                                      <Pressable
                                        onPress={() => handleCall(officer.telepon!, officer.nama)}
                                        hitSlop={6}
                                        style={({ pressed }) => [
                                          styles.actionIconBtn,
                                          { backgroundColor: colors.primaryLight },
                                          pressed && { opacity: 0.6 },
                                        ]}
                                      >
                                        <Feather name="phone" size={12} color={colors.primary} />
                                      </Pressable>
                                    )}

                                    {officer.email && (
                                      <Pressable
                                        onPress={() => handleEmail(officer.email!, officer.nama)}
                                        hitSlop={6}
                                        style={({ pressed }) => [
                                          styles.actionIconBtn,
                                          { backgroundColor: isDark ? '#001E3C' : '#F1F5F9' },
                                          pressed && { opacity: 0.6 },
                                        ]}
                                      >
                                        <Feather name="mail" size={12} color={colors.textMuted} />
                                      </Pressable>
                                    )}

                                    <Feather name="chevron-right" size={13} color={colors.textMuted} style={{ marginLeft: 2 }} />
                                  </View>
                                </Pressable>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* 3. DETAIL BOTTOM SHEET MODAL (Informasi Lengkap Tanpa Batasan) */}
      <Modal
        visible={!!selectedOfficer}
        onClose={() => setSelectedOfficer(null)}
        variant="bottomSheet"
        title={selectedOfficer?.node.title}
        subtitle="IDENTITAS PENGURUS RESMI simPAN"
      >
        {selectedOfficer && (
          <View style={{ gap: spacing.md }}>
            {/* Profile Card Banner */}
            <View
              style={[
                styles.modalProfileCard,
                {
                  backgroundColor: isDark ? '#002B52' : '#F0F7FF',
                  borderColor: colors.border,
                },
              ]}
            >
              <Image
                source={getWitnessAvatar(selectedOfficer.officer.avatarIndex)}
                style={[styles.modalAvatar, { borderColor: colors.primary }]}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <View style={styles.modalBadgeRow}>
                  <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.categoryBadgeText, { color: '#FFFFFF' }]}>
                      {selectedOfficer.node.levelCode} • {selectedOfficer.officer.tingkat}
                    </Text>
                  </View>
                  <Pill label="Terverifikasi" tone="success" />
                </View>
                <Text style={[styles.modalName, { color: colors.text }]}>
                  {selectedOfficer.officer.nama}
                </Text>
                <Text style={[styles.modalRole, { color: colors.primary }]}>
                  {selectedOfficer.officer.jabatan}
                </Text>
              </View>
            </View>

            {/* Credentials Table */}
            <View style={styles.modalCredList}>
              <View style={[styles.credRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.credLabel, { color: colors.textMuted }]}>Tingkatan Hirarki</Text>
                <Text style={[styles.credVal, { color: colors.text }]}>
                  Tingkat {selectedOfficer.node.level} ({selectedOfficer.node.categoryLabel})
                </Text>
              </View>

              <View style={[styles.credRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.credLabel, { color: colors.textMuted }]}>Wilayah Komando</Text>
                <Text style={[styles.credVal, { color: colors.text }]}>
                  {selectedOfficer.officer.wilayah}
                </Text>
              </View>

              <View style={[styles.credRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.credLabel, { color: colors.textMuted }]}>Masa Bakti SK</Text>
                <Text style={[styles.credVal, { color: colors.text }]}>
                  Periode {selectedOfficer.node.periode}
                </Text>
              </View>

              <View style={[styles.credRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.credLabel, { color: colors.textMuted }]}>Nomor ID Fungsionaris</Text>
                <Text style={[styles.credVal, { color: colors.primary, fontWeight: '700' }]}>
                  PAN-{selectedOfficer.officer.tingkat}-{selectedOfficer.officer.id}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              {selectedOfficer.officer.telepon && (
                <Pressable
                  onPress={() => handleCall(selectedOfficer.officer.telepon!, selectedOfficer.officer.nama)}
                  style={[styles.modalCallBtn, { backgroundColor: colors.primary }]}
                >
                  <Feather name="phone" size={14} color="#FFFFFF" />
                  <Text style={styles.modalCallText}>Panggil Telepon</Text>
                </Pressable>
              )}

              {selectedOfficer.officer.email && (
                <Pressable
                  onPress={() => handleEmail(selectedOfficer.officer.email!, selectedOfficer.officer.nama)}
                  style={[
                    styles.modalMailBtn,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                  ]}
                >
                  <Feather name="mail" size={14} color={colors.text} />
                  <Text style={[styles.modalMailText, { color: colors.text }]}>Kirim Email</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </Modal>

      <ConfirmDialog
        visible={contactDialog.visible}
        title={contactDialog.title}
        message={contactDialog.message}
        tone="info"
        singleButton
        confirmLabel="Mengerti"
        onConfirm={() => setContactDialog((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },

  // 1. Top Functional Toolbar (Compact & No Title Redundancy)
  topToolbar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    gap: spacing.xs,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.xs,
    padding: 0,
  },
  toolBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 2,
  },
  stepPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  stepPillText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  stepChevron: {
    paddingHorizontal: 1,
  },

  // 2. Tree Layout
  treeRoot: {
    gap: 2,
  },
  treeBranch: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  trunkRail: {
    width: 26,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  trunkBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginTop: 8,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trunkVerticalLine: {
    width: 2,
    flex: 1,
    marginTop: -2,
    marginBottom: -6,
  },
  branchColumn: {
    flex: 1,
    gap: 4,
    paddingBottom: spacing.sm,
  },

  // Node Header
  nodeHeader: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.md,
  },
  nodeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  nodeBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  categoryBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.sm - 4,
  },
  categoryBadgeText: {
    fontFamily: fonts.extraBold,
    fontSize: 9,
    letterSpacing: 0.3,
  },
  nodePeriodeText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  nodeTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs + 2,
  },
  nodeScope: {
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  subordinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  subordinationText: {
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  headerRightToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  officerCountPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  officerCountText: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  chevronCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Officers List (Zero Redundancy)
  officersList: {
    gap: 4,
  },
  officerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  elbowRail: {
    width: 16,
    alignSelf: 'stretch',
    position: 'relative',
  },
  elbowTopLine: {
    position: 'absolute',
    left: 4,
    top: 0,
    width: 2,
    height: '50%',
  },
  elbowCurve: {
    position: 'absolute',
    left: 4,
    top: '25%',
    width: 12,
    height: '25%',
    borderBottomLeftRadius: 6,
  },
  elbowBottomLine: {
    position: 'absolute',
    left: 4,
    top: '50%',
    width: 2,
    height: '50%',
  },

  // Officer Card (Ultra Compact & Crisp)
  officerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    gap: 9,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  crownBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  infoCol: {
    flex: 1,
    gap: 1,
  },
  roleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  conciseRoleText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  chiefPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  chiefPillText: {
    fontFamily: fonts.extraBold,
    fontSize: 8,
  },
  officerName: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  actionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIconBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Diagram View
  diagramContainer: {
    gap: 4,
  },
  diagramBlock: {
    alignItems: 'stretch',
  },
  diagramCard: {
    padding: 10,
    borderRadius: radius.md,
    gap: 6,
  },
  diagramHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  diagramTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  diagramNodeTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs + 1,
  },
  diagramNodeMeta: {
    fontFamily: fonts.regular,
    fontSize: 10,
    marginTop: 1,
  },
  diagramLeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 6,
    borderTopWidth: 0.5,
  },
  diagramLeaderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  diagramLeaderRole: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  diagramLeaderName: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  diagramConnectorWrap: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  diagramLine: {
    width: 2,
    height: '100%',
  },
  diagramDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyCard: {
    padding: spacing.lg,
    alignItems: 'center',
    textAlign: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  emptyResetBtn: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  emptyResetText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },

  // Modal Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  modalHandleWrap: {
    alignItems: 'center',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  modalHeaderKicker: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalHeaderTitle: {
    fontSize: fontSize.sm + 1,
    fontWeight: '800',
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  modalAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
  },
  modalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalName: {
    fontSize: fontSize.xs + 2,
    fontWeight: '800',
  },
  modalRole: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalCredList: {
    gap: 4,
  },
  credRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
  },
  credLabel: {
    fontSize: 11,
  },
  credVal: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
  },
  modalCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  modalCallText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  modalMailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  modalMailText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});
