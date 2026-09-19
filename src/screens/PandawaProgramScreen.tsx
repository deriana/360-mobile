import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { fonts, fontSize, radius, spacing } from '../theme';
import { Card, ConfirmDialog, Pill, PrimaryButton } from '../components/ui';
import QrPlaceholder from '../components/QrPlaceholder';

interface PandawaModule {
  id: string;
  title: string;
  category: string;
  hours: number;
  completed: boolean;
  desc: string;
  icon: string;
}

const PANDAWA_MODULES: PandawaModule[] = [
  {
    id: 'pdw-mod-1',
    title: 'Disiplin Baris Berbaris & Kesamaptaan Fisik',
    category: 'Kesamaptaan',
    hours: 12,
    completed: true,
    desc: 'Latihan postur tegap, ketahanan lapangan, aba-aba formasi satgas, dan etika apel siaga partai.',
    icon: 'activity',
  },
  {
    id: 'pdw-mod-2',
    title: 'SOP Pengawalan Rapat Akbar & Crowd Control',
    category: 'Pengamanan',
    hours: 8,
    completed: true,
    desc: 'Protokol pengamanan tamu VVIP partai, penataan perimeter panggung, dan pengaturan arus massa simpatisan.',
    icon: 'shield',
  },
  {
    id: 'pdw-mod-3',
    title: 'Tanggap Darurat Medis & Bantuan Bencana (Baksos)',
    category: 'Kemanusiaan',
    hours: 10,
    completed: true,
    desc: 'Pertolongan pertama lapangan (P3K), penanganan korban pingsan/dehidrasi, dan penyaluran logistik bencana alam.',
    icon: 'heart',
  },
  {
    id: 'pdw-mod-4',
    title: 'Komunikasi Taktis Radio & Deteksi Dini Provokasi',
    category: 'Intelijen Sipil',
    hours: 6,
    completed: false,
    desc: 'Tata cara sandi komunikasi HT posko, deteksi dini penyusup provokasi, dan de-eskalasi kericuhan damai.',
    icon: 'radio',
  },
];

export default function PandawaProgramScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const { currentUser } = useApp();

  const [modules, setModules] = useState<PandawaModule[]>(PANDAWA_MODULES);
  const [satgasStatus, setSatgasStatus] = useState<'ACTIVE' | 'TRAINING' | 'REGISTERED'>('ACTIVE');
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone?: 'success' | 'info' | 'warning';
  }>({ visible: false, title: '', message: '' });

  const completedCount = modules.filter((m) => m.completed).length;
  const progressPct = Math.round((completedCount / modules.length) * 100);

  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextVal = !m.completed;
          return { ...m, completed: nextVal };
        }
        return m;
      })
    );
  };

  const handleOpenEmergency = () => {
    navigation.navigate('EmergencyForm');
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Hero Header Banner PANdawa */}
      <View style={[styles.heroBanner, { backgroundColor: '#0B1329', borderColor: '#1E293B' }]}>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={styles.badgeSatgas}>
            <Feather name="shield" size={11} color="#F59E0B" />
            <Text style={styles.badgeSatgasText}>SATGAS KESIAPSIAGAAN & PENGAMANAN PAN</Text>
          </View>
          <Text style={styles.heroTitle}>Satgas PANdawa</Text>
          <Text style={styles.heroMotto}>"Pasukan Muda Tangguh dan Waspada"</Text>
          <Text style={styles.heroSub}>
            Wadah generasi muda kader dan simpatisan PAN yang berdisiplin tinggi, sigap menjaga marwah partai, dan terdepan dalam aksi kemanusiaan.
          </Text>
        </View>

        <View style={styles.heroEmblem}>
          <Feather name="shield" size={38} color="#F59E0B" />
        </View>
      </View>

      {/* 2. Status Keikutsertaan Satgas */}
      <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
        <View style={styles.statusHeaderRow}>
          <View style={{ gap: 2 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Status Penugasan Personel</Text>
            <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
              Reg. Satgas: PDW-3273-2024-0019 • Bataliyon Kota Bandung
            </Text>
          </View>
          <Pill
            label={satgasStatus === 'ACTIVE' ? 'SIAGA AKTIF' : satgasStatus === 'TRAINING' ? 'DIKLAT' : 'TERDAFTAR'}
            tone={satgasStatus === 'ACTIVE' ? 'success' : 'warning'}
            icon="check-circle"
          />
        </View>

        {/* Info Grid Satgas */}
        <View style={[styles.satgasInfoBox, { backgroundColor: isDark ? 'rgba(0,43,82,0.3)' : '#F0F9FF', borderColor: colors.border }]}>
          <View style={styles.satgasInfoRow}>
            <View style={styles.infoCol}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Nama Personel</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{currentUser?.identity?.name || 'Ahmad Fauzan'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Satuan Komando</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>Kompi Dago Coblong</Text>
            </View>
          </View>
          <View style={styles.satgasInfoRow}>
            <View style={styles.infoCol}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Pangkat / Tingkat</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>Kader Utama Satgas</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Kesiapan Lapangan</Text>
              <Text style={[styles.infoValue, { color: colors.success }]}>100% Siap Operasi</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionBtnRow}>
          <TouchableOpacity
            style={[styles.btnIdCard, { backgroundColor: colors.primary }]}
            onPress={() => setShowIdCardModal(true)}
            activeOpacity={0.85}
          >
            <Feather name="credit-card" size={14} color="#FFFFFF" />
            <Text style={styles.btnIdCardText}>Buka Digital ID Satgas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnEmergency, { borderColor: '#EF4444' }]}
            onPress={handleOpenEmergency}
            activeOpacity={0.85}
          >
            <Feather name="alert-triangle" size={14} color="#EF4444" />
            <Text style={[styles.btnEmergencyText, { color: '#EF4444' }]}>Lapor Darurat</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* 3. Modul Diklat & Kesamaptaan */}
      <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
        <View style={styles.statusHeaderRow}>
          <View style={{ gap: 2 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Kurikulum Diklat Kesamaptaan</Text>
            <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
              {completedCount} dari {modules.length} modul selesai ({progressPct}%)
            </Text>
          </View>
          <Pill label={`${progressPct}% Tuntas`} tone={progressPct === 100 ? 'success' : 'primary'} />
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPct}%`, backgroundColor: progressPct === 100 ? colors.success : colors.primary },
            ]}
          />
        </View>

        <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
          {modules.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => toggleModule(m.id)}
              style={({ pressed }) => [
                styles.moduleItem,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                  borderColor: m.completed ? colors.success : colors.border,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <View
                style={[
                  styles.checkCircle,
                  {
                    backgroundColor: m.completed ? colors.success : 'transparent',
                    borderColor: m.completed ? colors.success : colors.textMuted,
                  },
                ]}
              >
                {m.completed && <Feather name="check" size={12} color="#FFFFFF" />}
              </View>

              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.modCategory, { color: colors.primary }]}>{m.category.toUpperCase()}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 10 }}>•</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: fonts.regular }}>{m.hours} Jam Pelatihan</Text>
                </View>
                <Text
                  style={[
                    styles.modTitle,
                    { color: colors.text, textDecorationLine: m.completed ? 'none' : 'none' },
                  ]}
                >
                  {m.title}
                </Text>
                <Text style={[styles.modDesc, { color: colors.textMuted }]}>{m.desc}</Text>
              </View>

              <Feather name={m.icon as any} size={18} color={m.completed ? colors.success : colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </Card>

      {/* 4. Agenda Aksi Satgas Terdekat */}
      <Card style={{ gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border }}>
        <View style={styles.statusHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="calendar" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Instruksi Tugas Satgas Terdekat</Text>
          </View>
          <Pill label="Wajib Hadir" tone="danger" />
        </View>

        <View style={[styles.agendaCard, { backgroundColor: isDark ? 'rgba(230, 0, 18, 0.1)' : '#FEF2F2', borderColor: '#FCA5A5' }]}>
          <View style={{ gap: 4 }}>
            <Text style={[styles.agendaHeading, { color: '#B91C1C' }]}>Apel Siaga Satgas PANdawa Se-Jawa Barat</Text>
            <Text style={{ fontSize: 12, color: colors.text, fontFamily: fonts.medium }}>
              Hari Minggu, 20 September 2026 • 07.00 WIB
            </Text>
            <Text style={{ fontSize: 11.5, color: colors.textMuted, fontFamily: fonts.regular }}>
              Lokasi: Lapangan Gasibu, Kota Bandung. Pakaian seragam lengkap satgas, topi komando, dan sepatu PDL.
            </Text>
          </View>

          <View style={styles.agendaFooter}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="user-check" size={13} color={colors.success} />
              <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.success }}>Status: Terkonfirmasi Siap Hadir</Text>
            </View>
            <TouchableOpacity
              style={[styles.btnCheckinAction, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('CheckIn')}
              activeOpacity={0.85}
            >
              <Feather name="map-pin" size={12} color="#FFFFFF" />
              <Text style={styles.btnCheckinActionText}>Presensi Lokasi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* Modal Digital ID Satgas PANdawa */}
      <Modal
        visible={showIdCardModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIdCardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.idCardContainer, { backgroundColor: '#0B1329', borderColor: '#F59E0B' }]}>
            {/* Header ID Card */}
            <View style={styles.idCardTop}>
              <View style={{ gap: 2 }}>
                <Text style={styles.idCardGovText}>PARTAI AMANAT NASIONAL</Text>
                <Text style={styles.idCardTitle}>KARTU TANDA SATGAS PANDAWA</Text>
                <Text style={styles.idCardSubTitle}>Pasukan Muda Tangguh dan Waspada</Text>
              </View>
              <Feather name="shield" size={28} color="#F59E0B" />
            </View>

            <View style={styles.idCardDivider} />

            {/* Profile Content */}
            <View style={styles.idCardBody}>
              <View style={styles.idCardAvatarBox}>
                <Feather name="user" size={36} color="#FFFFFF" />
              </View>

              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.idCardName}>{currentUser?.identity?.name || 'Ahmad Fauzan'}</Text>
                <Text style={styles.idCardReg}>ID: PDW-3273-2024-0019</Text>
                <Text style={styles.idCardRole}>PANGKAT: KADER UTAMA SATGAS</Text>
                <Text style={styles.idCardUnit}>KOMPI: DAGO COBLONG — KOTA BANDUNG</Text>
              </View>
            </View>

            {/* QR Verification */}
            <View style={styles.idCardQrSection}>
              <QrPlaceholder seed="PANDAWA-3273-0019" size={70} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.idCardQrTitle}>QR PASS RESMI SATGAS</Text>
                <Text style={styles.idCardQrDesc}>
                  Pindai untuk verifikasi surat penugasan komando dan akses perimeter internal DPP PAN.
                </Text>
                <View style={styles.idCardValidTag}>
                  <Feather name="check-circle" size={10} color="#10B981" />
                  <Text style={styles.idCardValidText}>STATUS: AKTIF & TERVERIFIKASI</Text>
                </View>
              </View>
            </View>

            <View style={styles.idCardFooter}>
              <Text style={styles.idCardIssuer}>
                Komando Satgas PANdawa Nasional • DPP PAN Jakarta
              </Text>
            </View>

            <PrimaryButton
              label="Tutup Kartu Satgas"
              onPress={() => setShowIdCardModal(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Global Dialog */}
      <ConfirmDialog
        visible={dialogConfig.visible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        tone={dialogConfig.tone}
        confirmLabel="Tutup"
        onConfirm={() => setDialogConfig({ visible: false, title: '', message: '' })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 40,
  },
  heroBanner: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  badgeSatgas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeSatgasText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  heroMotto: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: '#FBBF24',
    fontStyle: 'italic',
  },
  heroSub: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#CBD5E1',
    lineHeight: 15,
  },
  heroEmblem: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  sectionSub: {
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  satgasInfoBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  satgasInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
    gap: 1,
  },
  infoLabel: {
    fontSize: 9.5,
    fontFamily: fonts.medium,
  },
  infoValue: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btnIdCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  btnIdCardText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  btnEmergency: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
  },
  btnEmergencyText: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modCategory: {
    fontSize: 9.5,
    fontFamily: fonts.bold,
    letterSpacing: 0.4,
  },
  modTitle: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  modDesc: {
    fontSize: 11,
    fontFamily: fonts.regular,
    lineHeight: 15,
  },
  agendaCard: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  agendaHeading: {
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  agendaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  btnCheckinAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.xs,
  },
  btnCheckinActionText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  idCardContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.md,
    gap: spacing.sm,
  },
  idCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idCardGovText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  idCardTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  idCardSubTitle: {
    fontSize: 9.5,
    fontFamily: fonts.medium,
    color: '#94A3B8',
  },
  idCardDivider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 4,
  },
  idCardBody: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  idCardAvatarBox: {
    width: 60,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  idCardName: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  idCardReg: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: '#F59E0B',
  },
  idCardRole: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: '#94A3B8',
  },
  idCardUnit: {
    fontSize: 9.5,
    fontFamily: fonts.regular,
    color: '#64748B',
  },
  idCardQrSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  idCardQrTitle: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: '#F59E0B',
  },
  idCardQrDesc: {
    fontSize: 8.5,
    fontFamily: fonts.regular,
    color: '#94A3B8',
  },
  idCardValidTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  idCardValidText: {
    fontSize: 8,
    fontFamily: fonts.bold,
    color: '#34D399',
  },
  idCardFooter: {
    alignItems: 'center',
    marginTop: 4,
  },
  idCardIssuer: {
    fontSize: 8.5,
    fontFamily: fonts.medium,
    color: '#64748B',
  },
});
