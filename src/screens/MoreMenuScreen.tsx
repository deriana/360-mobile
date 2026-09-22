import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { fontSize, fonts, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { CURRENT_WITNESS_ID, ROLE_PERMISSIONS, RolePermission, getUserProfile } from '../utils/scope';
import { getActiveWitnessScope } from '../utils/witnessResolver';
import { getWitnessAvatar } from '../data/images';
import { CandidateExplorerModal } from '../components/CandidateExplorerModal';
import { ConfirmDialog } from '../components/ui';
import { Role, Witness } from '../types';

interface GridMenuItem {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  badge?: string;
  params?: any;
  modalAction?: 'CandidateExplorer';
}

interface ListMenuItem {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  desc: string;
  badge?: string;
  params?: any;
  modalAction?: 'CandidateExplorer';
}

interface RoleMenuConfiguration {
  gridSectionTitle: string;
  gridItems: GridMenuItem[];
  listSections: Array<{
    title: string;
    items: ListMenuItem[];
  }>;
}

function getRoleMenuConfig(
  role: Role,
  permissions: RolePermission,
  currentWitness: Witness | undefined,
): RoleMenuConfiguration {
  switch (role) {
    case 'KADER_ANGGOTA':
      return {
        gridSectionTitle: 'Layanan Cepat Calon Parlemen',
        gridItems: [
          { key: 'PartyLeaderboard', icon: 'bar-chart-2', label: 'Tabulasi Suara', badge: 'PT 4%' },
          { key: 'PartyRoster', icon: 'users', label: 'Roster Caleg', params: { party: 'PAN' } },
          { key: 'Supervision', icon: 'grid', label: 'Kawal TPS' },
          { key: 'RegisterMember', icon: 'camera', label: 'Rekrut Kader', badge: 'AI' },
        ],
        listSections: [
          {
            title: 'Layanan Operasional & Organisasi',
            items: [
              {
                key: 'SimpanBacaleg',
                icon: 'award',
                label: 'Verifikasi Berkas Caleg KPU',
                desc: 'Status 7 dokumen persyaratan calon legislatif KPU',
              },
              {
                key: 'SimpanStructure',
                icon: 'users',
                label: 'Struktur Pengurus Organisasi',
                desc: 'Direktori kepengurusan berjenjang DPP, DPW, DPD, DPC, & DPRt',
              },
              {
                key: 'CandidateExplorer',
                icon: 'user-check',
                label: 'Profil Paslon & Caleg DPR RI',
                desc: 'Visi, misi, program unggulan, & rekam jejak KPU',
                modalAction: 'CandidateExplorer',
              },
              {
                key: 'Broadcast',
                icon: 'inbox',
                label: 'Kotak Masuk Broadcast DPP',
                desc: 'Instruksi pemenangan resmi dari DPP & BSN PAN',
              },
              {
                key: 'EmergencyList',
                icon: 'alert-triangle',
                label: 'Laporan Kendala Lapangan Saksi',
                desc: 'Pantau laporan dugaan kecurangan & kendala saksi di TPS',
              },
            ],
          },
        ],
      };

    case 'CALEG':
      return {
        gridSectionTitle: 'Aksi Strategis Parlemen',
        gridItems: [
          { key: 'PartyLeaderboard', icon: 'bar-chart-2', label: 'Simulasi Kursi', badge: 'PT 4%' },
          { key: 'PartyRoster', icon: 'users', label: 'Roster Caleg', params: { party: 'PAN' } },
          { key: 'SimpanBacaleg', icon: 'award', label: 'Berkas KPU', badge: '7 DOK' },
          { key: 'EmergencyList', icon: 'alert-triangle', label: 'Kendala Saksi', badge: 'SOS' },
        ],
        listSections: [
          {
            title: 'Pengawalan & Administrasi Caleg',
            items: [
              {
                key: 'CandidateExplorer',
                icon: 'user-check',
                label: 'Profil Paslon & Caleg DPR RI',
                desc: 'Visi, misi, & rekam jejak kandidat Pemilu',
                modalAction: 'CandidateExplorer',
              },
              {
                key: 'Broadcast',
                icon: 'inbox',
                label: 'Kotak Masuk Broadcast DPP',
                desc: 'Instruksi & maklumat pemenangan resmi pusat komando',
              },
              {
                key: 'SimpanKta',
                icon: 'credit-card',
                label: 'e-KTA Digital simPAN',
                desc: 'Kartu Tanda Anggota elektronik resmi ber-QR autentikasi',
                badge: 'RESMI',
              },
              {
                key: 'SimpanStructure',
                icon: 'users',
                label: 'Struktur Pengurus Organisasi',
                desc: 'Direktori kepengurusan partai di Dapil Jawa Barat 1',
              },
              {
                key: 'SimpanOffices',
                icon: 'map-pin',
                label: 'Kantor Sekretariat & Posko',
                desc: 'Alamat, peta arah & posko pemenangan dapil',
              },
            ],
          },
        ],
      };

    case 'TPS_WITNESS':
      return {
        gridSectionTitle: 'Aksi Hari-H Saksi TPS',
        gridItems: [
          { key: 'ReportForm', icon: 'edit-3', label: 'Input C1 TPS' },
          { key: 'C1Ocr', icon: 'camera', label: 'Scan C1 Plano', badge: 'AI' },
          {
            key: 'Documentation',
            icon: 'image',
            label: 'Foto TPS',
            params: { tpsId: currentWitness?.assignedTpsId },
          },
          { key: 'Payment', icon: 'dollar-sign', label: 'Status Honor' },
        ],
        listSections: [
          {
            title: 'Pengawalan & Dokumen Saksi',
            items: [
              {
                key: 'EmergencyForm',
                icon: 'alert-triangle',
                label: 'Lapor Kejadian TPS (SOS)',
                desc: 'Kirim laporan kendala / kecurangan ke koordinator',
              },
              {
                key: 'EmergencyList',
                icon: 'alert-circle',
                label: 'Cek Status Laporan Kendala',
                desc: 'Pantau status penanganan kendala di TPS Anda',
              },
              {
                key: 'Broadcast',
                icon: 'inbox',
                label: 'Kotak Masuk Broadcast BSN',
                desc: 'Instruksi & pengumuman resmi dari pimpinan BSN',
              },
              {
                key: 'CandidateExplorer',
                icon: 'user-check',
                label: 'Profil Paslon & Caleg DPR RI',
                desc: 'Visi, misi, program unggulan, & rekam jejak kandidat',
                modalAction: 'CandidateExplorer',
              },
              {
                key: 'PartyLeaderboard',
                icon: 'bar-chart-2',
                label: 'Tabulasi Suara & Parlemen',
                desc: 'Simulasi Sainte-Laguë perolehan kursi DPR-RI & PT 4%',
              },
            ],
          },
        ],
      };

    case 'RELAWAN':
      return {
        gridSectionTitle: 'Aksi Pengawalan Relawan',
        gridItems: [
          { key: 'QuickCountGame', icon: 'zap', label: 'Tally Suara', badge: 'QC' },
          { key: 'Documentation', icon: 'camera', label: 'Foto TPS', params: { tpsId: 'TPS-001' } },
          { key: 'EmergencyForm', icon: 'alert-triangle', label: 'Lapor SOS', badge: 'SOS' },
          { key: 'EmergencyList', icon: 'alert-circle', label: 'Kendala' },
        ],
        listSections: [
          {
            title: 'Informasi & Koordinasi Posko',
            items: [
              {
                key: 'CandidateExplorer',
                icon: 'user-check',
                label: 'Profil Paslon & Caleg DPR RI',
                desc: 'Visi, misi, dan rekam jejak kandidat Pemilu',
                modalAction: 'CandidateExplorer',
              },
              {
                key: 'PartyLeaderboard',
                icon: 'bar-chart-2',
                label: 'Tabulasi Suara & Parlemen',
                desc: 'Simulasi Sainte-Laguë perolehan kursi DPR-RI & PT 4%',
              },
              {
                key: 'Broadcast',
                icon: 'inbox',
                label: 'Kotak Masuk Broadcast Posko',
                desc: 'Instruksi koordinator relawan & pimpinan cabang',
              },
              {
                key: 'SimpanKta',
                icon: 'credit-card',
                label: 'e-KTA Digital simPAN',
                desc: 'Kartu Tanda Anggota relawan resmi partai',
                badge: 'RESMI',
              },
              {
                key: 'SimpanNews',
                icon: 'file-text',
                label: 'Warta & Maklumat DPP PAN',
                desc: 'Instruksi resmi Ketua Umum & maklumat BSN PAN',
              },
            ],
          },
        ],
      };

    case 'TPS_COORDINATOR':
      return {
        gridSectionTitle: 'Supervisi Kluster TPS',
        gridItems: [
          { key: 'WitnessList', icon: 'users', label: 'Saksi Kluster' },
          { key: 'KtpOcr', icon: 'credit-card', label: 'Scan KTP', badge: 'AI' },
          { key: 'EmergencyList', icon: 'alert-triangle', label: 'Kendala TPS', badge: 'SOS' },
          { key: 'Payment', icon: 'dollar-sign', label: 'Honor Saksi' },
        ],
        listSections: [
          {
            title: 'Operasional & Organisasi Kluster',
            items: [
              {
                key: 'Broadcast',
                icon: 'inbox',
                label: 'Kotak Masuk Broadcast Komando',
                desc: 'Instruksi & dokumen resmi dari pusat komando',
              },
              {
                key: 'PartyLeaderboard',
                icon: 'bar-chart-2',
                label: 'Tabulasi Suara & Parlemen',
                desc: 'Simulasi Sainte-Laguë perolehan kursi DPR-RI & PT 4%',
              },
              {
                key: 'Documentation',
                icon: 'image',
                label: 'Dokumentasi Kluster TPS',
                desc: 'Dokumentasi foto kegiatan di 6 TPS binaan kluster',
                params: { tpsId: 'TPS-001' },
              },
              {
                key: 'SimpanOffices',
                icon: 'map-pin',
                label: 'Kantor Sekretariat & Posko',
                desc: 'Alamat kantor dan posko pengaduan terpadu',
              },
              {
                key: 'SimpanStructure',
                icon: 'users',
                label: 'Struktur Pengurus Organisasi',
                desc: 'Direktori kepengurusan berjenjang DPP-DPRt',
              },
            ],
          },
        ],
      };

    case 'OPERATOR':
      return {
        gridSectionTitle: 'Operasional Saksi Kota',
        gridItems: [
          { key: 'WitnessList', icon: 'users', label: 'Saksi Kota' },
          { key: 'CoordinatorList', icon: 'shield', label: 'Koordinator' },
          { key: 'KtpOcr', icon: 'credit-card', label: 'Scan KTP', badge: 'AI' },
          { key: 'EmergencyList', icon: 'alert-triangle', label: 'Kendala TPS', badge: 'SOS' },
        ],
        listSections: [
          {
            title: 'Administrasi & Tabulasi Kota',
            items: [
              {
                key: 'PartyLeaderboard',
                icon: 'bar-chart-2',
                label: 'Tabulasi Suara & Parlemen',
                desc: 'Simulasi Sainte-Laguë perolehan kursi DPR-RI & PT 4%',
              },
              {
                key: 'Broadcast',
                icon: 'inbox',
                label: 'Kotak Masuk Broadcast Komando',
                desc: 'Instruksi teknis & pengumuman dari BSN pusat',
              },
              {
                key: 'EmergencyForm',
                icon: 'alert-circle',
                label: 'Lapor Kendala Lapangan',
                desc: 'Kirim laporan hambatan teknis operasional kota',
              },
              {
                key: 'Payment',
                icon: 'dollar-sign',
                label: 'Status Honorarium Saksi Kota',
                desc: 'Status pencairan honor saksi se-Kota Bandung',
              },
              {
                key: 'SimpanOffices',
                icon: 'map-pin',
                label: 'Kantor Sekretariat & Posko',
                desc: 'Alamat kantor DPD dan posko pengawalan',
              },
            ],
          },
        ],
      };

    case 'DPP':
      return {
        gridSectionTitle: 'Komando Eksekutif Nasional',
        gridItems: [
          { key: 'PartyLeaderboard', icon: 'bar-chart-2', label: 'Kursi Parlemen', badge: 'PT 4%' },
          { key: 'Broadcast', icon: 'inbox', label: 'Broadcast', badge: 'DPP' },
          { key: 'Security', icon: 'shield', label: 'Audit Sistem', badge: '2FA' },
          { key: 'Insights', icon: 'activity', label: 'AI Pemilu', badge: 'AI' },
        ],
        listSections: [
          {
            title: 'Tata Kelola & Struktural Nasional',
            items: [
              {
                key: 'SimpanStructure',
                icon: 'users',
                label: 'Struktur Pengurus Nasional',
                desc: 'Direktori kepengurusan DPP, DPW, DPD se-Indonesia',
              },
              {
                key: 'SimpanBacaleg',
                icon: 'award',
                label: 'Verifikasi Bacaleg DPR-RI & DPRD',
                desc: 'Portal pendaftaran dan verifikasi berkas persyaratan caleg',
              },
              {
                key: 'RegisterMember',
                icon: 'camera',
                label: 'Pendaftaran Anggota (AI Scan KTP)',
                desc: 'Perekrutan kader baru & terbitkan e-KTA instan dengan AI OCR',
                badge: 'AI SCAN',
              },
              {
                key: 'EmergencyList',
                icon: 'alert-triangle',
                label: 'Monitoring Kendala TPS Nasional',
                desc: 'Pemantauan kejadian darurat & pelanggaran di 38 provinsi',
              },
              {
                key: 'Payment',
                icon: 'dollar-sign',
                label: 'Anggaran & Honor Saksi Nasional',
                desc: 'Status pencairan anggaran saksi BSN seluruh Indonesia',
              },
              {
                key: 'SimpanNews',
                icon: 'file-text',
                label: 'Warta & Maklumat DPP PAN',
                desc: 'Instruksi resmi Ketua Umum & maklumat pemenangan',
              },
            ],
          },
        ],
      };

    case 'DPW':
    case 'DPD':
    case 'DPC':
    case 'PAC':
    default: {
      const items: ListMenuItem[] = [
        {
          key: 'SimpanBacaleg',
          icon: 'award',
          label: 'Pendaftaran & Berkas Bacaleg',
          desc: 'Portal verifikasi berkas persyaratan calon legislatif',
        },
        {
          key: 'EmergencyList',
          icon: 'alert-triangle',
          label: 'Monitoring Kendala TPS Wilayah',
          desc: 'Pantau laporan kendala dan potensi kecurangan saksi',
        },
      ];

      if (permissions.canAccessInsights) {
        items.push({
          key: 'Insights',
          icon: 'activity',
          label: 'AI Pemantauan Suara Wilayah',
          desc: 'Analitik prediksi suara & anomali TPS wilayah',
        });
      }

      if (permissions.canAccessAllPayments) {
        items.push({
          key: 'Payment',
          icon: 'dollar-sign',
          label: 'Status Honorarium Saksi Wilayah',
          desc: 'Status pencairan honor saksi wilayah (Read-Only)',
        });
      }

      items.push({
        key: 'SimpanNews',
        icon: 'file-text',
        label: 'Warta & Instruksi DPP PAN',
        desc: 'Instruksi resmi Ketua Umum, siaran pers, & maklumat partai',
      });

      return {
        gridSectionTitle: 'Pengelolaan Wilayah Partai',
        gridItems: [
          { key: 'PartyLeaderboard', icon: 'bar-chart-2', label: 'Suara Parlemen', badge: 'PT 4%' },
          { key: 'SimpanStructure', icon: 'users', label: 'Struktur Pengurus' },
          { key: 'RegisterMember', icon: 'camera', label: 'Rekrut Kader', badge: 'AI' },
          { key: 'Broadcast', icon: 'inbox', label: 'Broadcast' },
        ],
        listSections: [
          {
            title: 'Administrasi & Pengawalan Wilayah',
            items,
          },
        ],
      };
    }
  }
}

export default function MoreMenuScreen({ navigation }: any) {
  const { role, logout, witnesses, currentUser, tps } = useApp();
  const { colors, isDark, toggleTheme } = useTheme();
  const [showCandidateExplorer, setShowCandidateExplorer] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const permissions = ROLE_PERMISSIONS[role];
  const userProfile = getUserProfile(role);
  const avatarUrl = getWitnessAvatar(userProfile.avatarIndex);
  const activeScope = getActiveWitnessScope(currentUser, witnesses, tps);
  const currentWitness = activeScope.witness;

  const menuConfig = getRoleMenuConfig(role, permissions, currentWitness);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleAction = (item: { key: string; params?: any; modalAction?: string }) => {
    if (item.modalAction === 'CandidateExplorer' || item.key === 'CandidateExplorer') {
      setShowCandidateExplorer(true);
    } else {
      navigation.navigate(item.key, item.params);
    }
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* 1. Compact Profile Hero Card */}
      <Pressable
        onPress={() => navigation.navigate('Profile')}
        style={({ pressed }) => [
          styles.profileHeroCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && { opacity: 0.9, transform: [{ scale: 0.995 }] },
        ]}
      >
        <View style={styles.profileHeroTop}>
          <View style={styles.profileAvatarWrapper}>
            <Image source={avatarUrl} style={styles.profileHeaderAvatar} />
            <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
          </View>

          <View style={{ flex: 1, gap: 3 }}>
            <View style={styles.profileHeaderTopRow}>
              <Text style={[styles.profileHeaderName, { color: colors.text }]} numberOfLines={1}>
                {userProfile.name}
              </Text>
              <View style={[styles.badgeIdPill, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.badgeIdPillText, { color: colors.primary }]}>{userProfile.badgeId}</Text>
              </View>
            </View>

            <View style={styles.roleBadgeRow}>
              <Text style={[styles.profileHeaderRole, { color: colors.primary }]} numberOfLines={1}>
                {userProfile.roleLabel}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="map-pin" size={11} color={colors.textMuted} />
              <Text style={[styles.profileHeaderScope, { color: colors.textMuted }]} numberOfLines={1}>
                {userProfile.scopeLocation}
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </View>
      </Pressable>

      {/* 2. Hybrid Quick Actions Grid (4-Column Bento/Tiles) */}
      <View style={styles.sectionWrap}>
        <Text style={[styles.sectionHeaderTitle, { color: colors.textMuted }]}>
          {menuConfig.gridSectionTitle}
        </Text>
        <View style={[styles.quickGridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {menuConfig.gridItems.map((item) => (
            <Pressable
              key={item.key}
              hitSlop={6}
              style={({ pressed }) => [
                styles.gridTile,
                pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] },
              ]}
              onPress={() => handleAction(item)}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: colors.primaryLight }]}>
                <Feather name={item.icon} size={20} color={colors.primary} strokeWidth={iconStrokeWidth} />
                {item.badge && (
                  <View style={[styles.gridMicroBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.gridMicroBadgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.gridTileLabel, { color: colors.text }]} numberOfLines={2}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 3. Compact Inset Lists for Operational / Organizational Features */}
      {menuConfig.listSections.map((sec, secIdx) => (
        <View key={secIdx} style={styles.sectionWrap}>
          <Text style={[styles.sectionHeaderTitle, { color: colors.textMuted }]}>{sec.title}</Text>
          <View style={[styles.compactInsetContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {sec.items.map((item, idx) => {
              const isLast = idx === sec.items.length - 1;
              return (
                <React.Fragment key={item.key}>
                  <Pressable
                    hitSlop={4}
                    style={({ pressed }) => [
                      styles.compactRow,
                      pressed && { backgroundColor: colors.primaryLight },
                    ]}
                    onPress={() => handleAction(item)}
                  >
                    <View style={[styles.compactIconWrap, { backgroundColor: colors.primaryLight }]}>
                      <Feather name={item.icon} size={16} color={colors.primary} strokeWidth={iconStrokeWidth} />
                    </View>
                    <View style={{ flex: 1, gap: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.compactRowTitle, { color: colors.text }]}>{item.label}</Text>
                        {item.badge && (
                          <View style={[styles.inlineBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.inlineBadgeText}>{item.badge}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.compactRowDesc, { color: colors.textMuted }]} numberOfLines={1}>
                        {item.desc}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={15} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                  </Pressable>
                  {!isLast && <View style={[styles.hairlineDivider, { backgroundColor: colors.border }]} />}
                </React.Fragment>
              );
            })}
          </View>
        </View>
      ))}

      {/* 4. Compact Inset List for Help, Theme & Account Control */}
      <View style={styles.sectionWrap}>
        <Text style={[styles.sectionHeaderTitle, { color: colors.textMuted }]}>Bantuan & Pengaturan Sistem</Text>
        <View style={[styles.compactInsetContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Pusat Bantuan */}
          <Pressable
            hitSlop={4}
            style={({ pressed }) => [
              styles.compactRow,
              pressed && { backgroundColor: colors.primaryLight },
            ]}
            onPress={() => navigation.navigate('HelpCenter')}
          >
            <View style={[styles.compactIconWrap, { backgroundColor: colors.primaryLight }]}>
              <Feather name="help-circle" size={16} color={colors.primary} strokeWidth={iconStrokeWidth} />
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={[styles.compactRowTitle, { color: colors.text }]}>Pusat Bantuan & Regulasi</Text>
              <Text style={[styles.compactRowDesc, { color: colors.textMuted }]} numberOfLines={1}>
                FAQ, SOP saksi TPS, regulasi KPU & panduan teknis
              </Text>
            </View>
            <Feather name="chevron-right" size={15} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
          </Pressable>

          <View style={[styles.hairlineDivider, { backgroundColor: colors.border }]} />

          {/* Dynamic Theme Toggle Row */}
          <Pressable
            hitSlop={4}
            style={({ pressed }) => [
              styles.compactRow,
              pressed && { backgroundColor: colors.primaryLight },
            ]}
            onPress={toggleTheme}
          >
            <View style={[styles.compactIconWrap, { backgroundColor: colors.primaryLight }]}>
              <Feather name={isDark ? 'sun' : 'moon'} size={16} color={colors.primary} strokeWidth={iconStrokeWidth} />
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={[styles.compactRowTitle, { color: colors.text }]}>
                {isDark ? 'Mode Gelap (Dark Navy)' : 'Mode Terang (Light Mode)'}
              </Text>
              <Text style={[styles.compactRowDesc, { color: colors.textMuted }]} numberOfLines={1}>
                Ketuk untuk beralih ke {isDark ? 'Mode Terang' : 'Mode Gelap'}
              </Text>
            </View>
            <View style={[styles.statusBadgeSmall, { backgroundColor: isDark ? 'rgba(59, 158, 224, 0.2)' : '#EBF4FF' }]}>
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: colors.primary }}>
                {isDark ? 'GELAP' : 'TERANG'}
              </Text>
            </View>
          </Pressable>

          <View style={[styles.hairlineDivider, { backgroundColor: colors.border }]} />

          {/* Logout Row with Confirmation */}
          <Pressable
            hitSlop={4}
            style={({ pressed }) => [
              styles.compactRow,
              pressed && { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2' },
            ]}
            onPress={handleLogout}
          >
            <View style={[styles.compactIconWrap, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' }]}>
              <Feather name="log-out" size={16} color={colors.danger} strokeWidth={iconStrokeWidth} />
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={[styles.compactRowTitle, { color: colors.danger }]}>Logout</Text>
            </View>
            <Feather name="chevron-right" size={15} color={colors.danger} strokeWidth={iconStrokeWidth} />
          </Pressable>
        </View>
      </View>

      <CandidateExplorerModal
        visible={showCandidateExplorer}
        onClose={() => setShowCandidateExplorer(false)}
      />

      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Konfirmasi Keluar Sesi"
        message="Apakah Anda yakin ingin keluar dari sesi akun simPAN pada perangkat ini?"
        icon="log-out"
        tone="danger"
        confirmLabel="Keluar Sesi"
        cancelLabel="Batal"
        onConfirm={logout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 1.5,
    gap: spacing.md,
  },

  // 1. Profile Hero Card
  profileHeroCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    ...shadow.card,
  },
  profileHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  profileAvatarWrapper: { position: 'relative' },
  profileHeaderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#0066B3',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  profileHeaderName: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs + 1.5,
    fontWeight: '800',
    flex: 1,
  },
  badgeIdPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeIdPillText: {
    fontFamily: fonts.extraBold,
    fontSize: 8.5,
    fontWeight: '800',
  },
  roleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'nowrap',
  },
  profileHeaderRole: {
    fontFamily: fonts.semiBold,
    fontSize: 10.5,
    fontWeight: '700',
    flexShrink: 1,
  },
  rbacBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
    borderWidth: 0.8,
  },
  rbacText: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    fontWeight: '800',
  },
  profileHeaderScope: {
    fontFamily: fonts.medium,
    fontSize: 10,
  },

  // Sections
  sectionWrap: {
    gap: 6,
  },
  sectionHeaderTitle: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 2,
  },

  // 2. Quick Action Grid (4 Kolom / Bento Tiles)
  quickGridCard: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.xs,
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    ...shadow.card,
  },
  gridTile: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 6,
  },
  gridIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gridMicroBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
  },
  gridMicroBadgeText: {
    fontFamily: fonts.extraBold,
    fontSize: 7.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  gridTileLabel: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },

  // 3. Compact Inset Lists
  compactInsetContainer: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadow.card,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    minHeight: 48,
  },
  compactIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactRowTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs + 0.5,
    fontWeight: '700',
  },
  compactRowDesc: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14,
  },
  inlineBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  inlineBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hairlineDivider: {
    height: 0.5,
    marginLeft: 32 + spacing.md + (spacing.sm + 2),
  },

  // System Badges
  statusBadgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: radius.pill,
  },
});
