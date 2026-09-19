import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { Card, ConfirmDialog, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fonts, fontSize, radius, spacing } from '../theme';

type TabMode = 'membership' | 'volunteer';

const RESIGN_REASONS = [
  'Fokus Karir Profesional / Bisnis Swasta',
  'Menjabat di Lembaga Pemerintahan / Lolos ASN/TNI/Polri',
  'Pindah Domisili Tetap ke Luar Negeri',
  'Alasan Kesehatan / Pertimbangan Keluarga Pribadi',
  'Lainnya',
];

const VOLUNTEER_PAUSE_DURATIONS = [
  { label: '1 Bulan', value: '1_month' },
  { label: '3 Bulan', value: '3_months' },
  { label: '6 Bulan', value: '6_months' },
];

const VOLUNTEER_REASONS = [
  'Kesibukan pekerjaan / dinas luar kota',
  'Fokus pendidikan / studi semester akhir',
  'Pindah domisili wilayah tempat tinggal',
  'Alasan kesehatan dan kebugaran',
  'Rehat sementara waktu dari kegiatan lapangan',
  'Lainnya',
];

export default function KelolaStatusScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const { currentUser, tasks, events } = useApp();

  const [activeTab, setActiveTab] = useState<TabMode>('membership');

  // Membership Resignation State
  const [selectedResignReason, setSelectedResignReason] = useState<string>(RESIGN_REASONS[0]);
  const [resignNotes, setResignNotes] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState<'ACTIVE' | 'RESIGNATION_REQUESTED'>('ACTIVE');

  // Volunteer State
  const [volunteerStatus, setVolunteerStatus] = useState<'ACTIVE' | 'PAUSED' | 'INACTIVE'>('ACTIVE');
  const [pauseDuration, setPauseDuration] = useState('3_months');
  const [selectedVolReason, setSelectedVolReason] = useState<string>(VOLUNTEER_REASONS[0]);
  const [showTaskGuardModal, setShowTaskGuardModal] = useState(false);
  const [pendingVolunteerAction, setPendingVolunteerAction] = useState<'pause' | 'stop' | null>(null);

  // Success Dialog
  const [dialogInfo, setDialogInfo] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone: 'success' | 'warning' | 'primary';
  }>({
    visible: false,
    title: '',
    message: '',
    tone: 'success',
  });

  // Check active tasks & assignments
  const activeTasksCount = tasks.filter((t) => t.status === 'in_progress' || t.status === 'pending').length || 1;
  const registeredEventsCount = events.filter((e) => e.isRegistered).length || 1;

  const handleApplyResignation = () => {
    if (!agreedTerms) {
      Alert.alert('Persetujuan Diperlukan', 'Harap centang persetujuan konsekuensi hak anggota sebelum melanjutkan.');
      return;
    }
    setShowResignModal(false);
    setMembershipStatus('RESIGNATION_REQUESTED');
    setDialogInfo({
      visible: true,
      title: 'Pengajuan Pengunduran Diri Dikirim',
      message:
        'Berkas pengunduran diri keanggotaan Anda telah dicatat dengan status RESIGNATION_REQUESTED. Tim verifikasi administrasi DPD PAN Kota Bandung akan melakukan reviu dalam 7 hari kerja.',
      tone: 'warning',
    });
  };

  const handleVolunteerActionClick = (action: 'pause' | 'stop') => {
    // Active task guard check
    if (activeTasksCount > 0 || registeredEventsCount > 0) {
      setPendingVolunteerAction(action);
      setShowTaskGuardModal(true);
    } else {
      executeVolunteerAction(action);
    }
  };

  const executeVolunteerAction = (action: 'pause' | 'stop') => {
    setShowTaskGuardModal(false);
    if (action === 'pause') {
      setVolunteerStatus('PAUSED');
      setDialogInfo({
        visible: true,
        title: 'Status Kerelawanan Dijeda (PAUSED)',
        message:
          'Status relawan Anda saat ini dalam masa cuti rehat sementara. Penugasan darurat dinonaktifkan tanpa menghapus portofolio. Anda dapat mengaktifkannya kembali kapan saja.',
        tone: 'primary',
      });
    } else {
      setVolunteerStatus('INACTIVE');
      setDialogInfo({
        visible: true,
        title: 'Berhenti dari Relawan Lapangan',
        message:
          'Status kerelawanan lapangan telah dinonaktifkan. Seluruh rekam jejak 15 kegiatan dan sertifikat pelatihan tetap tersimpan secara utuh di database (Zero History Loss).',
        tone: 'warning',
      });
    }
  };

  const handleReactivateVolunteer = () => {
    setVolunteerStatus('ACTIVE');
    setDialogInfo({
      visible: true,
      title: 'Relawan Aktif Kembali',
      message: 'Selamat kembali bertugas! Anda kini siap menerima notifikasi penugasan lapangan dan bursa aksi terdekat.',
      tone: 'success',
    });
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Tata Kelola */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: isDark ? '#0A1E38' : '#003366',
            borderColor: colors.border,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={styles.headerIconCircle}>
            <Feather name="settings" size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.headerTitle}>Tata Kelola Status Mandiri</Text>
            <Text style={styles.headerSub}>
              Prinsip Perlindungan Akun: Never Delete User Hard & Zero History Loss
            </Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => setActiveTab('membership')}
            style={[
              styles.tabBtn,
              activeTab === 'membership' && { backgroundColor: '#FFFFFF' },
            ]}
          >
            <Feather
              name="user"
              size={13}
              color={activeTab === 'membership' ? '#003366' : 'rgba(255,255,255,0.7)'}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'membership' ? '#003366' : 'rgba(255,255,255,0.85)' },
              ]}
            >
              1. Keanggotaan simPAN
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('volunteer')}
            style={[
              styles.tabBtn,
              activeTab === 'volunteer' && { backgroundColor: '#FFFFFF' },
            ]}
          >
            <Feather
              name="users"
              size={13}
              color={activeTab === 'volunteer' ? '#003366' : 'rgba(255,255,255,0.7)'}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'volunteer' ? '#003366' : 'rgba(255,255,255,0.85)' },
              ]}
            >
              2. Kerelawanan
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* TAB 1: KEANGGOTAAN SIMPAN (MEMBERSHIP GOVERNANCE)                          */}
      {/* ========================================================================= */}
      {activeTab === 'membership' && (
        <View style={{ gap: spacing.md }}>
          {/* Card Status Saat Ini */}
          <Card style={{ gap: spacing.sm }}>
            <View style={styles.rowBetween}>
              <View style={{ gap: 2 }}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Status Keanggotaan Partai</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                  Nomor e-KTA: 32.73.01.2024.08912 | DPC Coblong
                </Text>
              </View>
              <Pill
                label={membershipStatus === 'ACTIVE' ? 'ANGGOTA RESMI AKTIF' : 'DALAM PROSES RESIGN'}
                tone={membershipStatus === 'ACTIVE' ? 'success' : 'warning'}
              />
            </View>

            <View style={[styles.statusNoticeBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: colors.border }]}>
              <Feather name="shield" size={16} color={colors.primary} />
              <Text style={[styles.statusNoticeText, { color: colors.textMuted }]}>
                {membershipStatus === 'ACTIVE'
                  ? 'Keanggotaan Anda sah dan tercatat di Sistem Informasi Manajemen PAN (simPAN). Hak suara permusyawaratan aktif.'
                  : 'Pengajuan pengunduran diri sedang ditinjau Dewan Pimpinan Daerah (DPD). e-KTA berstatus Dalam Proses Pengunduran Diri.'}
              </Text>
            </View>
          </Card>

          {/* Prosedur Pengunduran Diri Berjenjang */}
          {membershipStatus === 'ACTIVE' ? (
            <Card style={{ gap: spacing.md }}>
              <View style={{ gap: 4 }}>
                <SectionTitle style={{ marginBottom: 0 }}>Pengajuan Pengunduran Diri Anggota</SectionTitle>
                <Text style={{ fontSize: 11.5, color: colors.textMuted, lineHeight: 17 }}>
                  Sesuai AD/ART PAN Pasal 14, permohonan pengunduran diri diproses berjenjang melalui verifikasi administrasi pengurus tanpa menghapus rekam jejak kontribusi historis Anda.
                </Text>
              </View>

              <View style={[styles.calloutWarning, { backgroundColor: isDark ? 'rgba(245,158,11,0.1)' : '#FEF3C7', borderColor: '#F59E0B' }]}>
                <Feather name="alert-triangle" size={16} color="#D97706" />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.calloutTitle, { color: '#B45309' }]}>Konsekuensi Pengunduran Diri</Text>
                  <Text style={[styles.calloutBody, { color: '#92400E' }]}>
                    Hak memilih dan dipilih dalam musyawarah partai dibekukan. Penugasan struktural dan surat mandat saksi akan dicabut.
                  </Text>
                </View>
              </View>

              <PrimaryButton
                label="Buka Formulir Pengunduran Diri"
                icon="file-text"
                variant="danger"
                onPress={() => setShowResignModal(true)}
              />
            </Card>
          ) : (
            <Card style={{ gap: spacing.sm, borderColor: '#F59E0B' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="clock" size={20} color="#D97706" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Pengajuan Sedang Diverifikasi</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>No. Tiket: RESIGN-2026-00412</Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, color: colors.textMuted, lineHeight: 18 }}>
                Alasan: {selectedResignReason}. Permohonan ini akan dievaluasi oleh Tim Bidang Organisasi & Keanggotaan DPD PAN Kota Bandung.
              </Text>
              <PrimaryButton
                label="Batalkan Pengajuan Resign"
                variant="secondary"
                icon="rotate-ccw"
                onPress={() => {
                  setMembershipStatus('ACTIVE');
                  Alert.alert('Dibatalkan', 'Pengajuan pengunduran diri telah dibatalkan. Status keanggotaan Anda tetap Aktif.');
                }}
              />
            </Card>
          )}

          {/* Jaminan Hak & Regulasi UU PDP */}
          <Card style={{ gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="lock" size={16} color={colors.primary} />
              <SectionTitle style={{ marginBottom: 0 }}>Hak Privasi Data (UU PDP No. 27/2022)</SectionTitle>
            </View>
            <Text style={{ fontSize: 11, color: colors.textMuted, lineHeight: 16 }}>
              Anda memiliki hak atas pembatasan pemrosesan data pribadi. Histori audit transaksi pemilu tetap dilindungi enkripsi kriptografis negara untuk transparansi saksi pemilu.
            </Text>
          </Card>
        </View>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KERELAWANAN & PARTISIPASI LAPANGAN (VOLUNTEER GOVERNANCE)           */}
      {/* ========================================================================= */}
      {activeTab === 'volunteer' && (
        <View style={{ gap: spacing.md }}>
          {/* Status Relawan Saat Ini */}
          <Card style={{ gap: spacing.sm }}>
            <View style={styles.rowBetween}>
              <View style={{ gap: 2 }}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Status Kerelawanan Lapangan</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                  Wilayah Binaan: Coblong Kluster 6 | Korlap: Asep Ridwan
                </Text>
              </View>
              <Pill
                label={
                  volunteerStatus === 'ACTIVE'
                    ? 'RELAWAN SIAGA AKTIF'
                    : volunteerStatus === 'PAUSED'
                    ? 'CUTI SEMENTARA'
                    : 'NONAKTIF'
                }
                tone={
                  volunteerStatus === 'ACTIVE'
                    ? 'success'
                    : volunteerStatus === 'PAUSED'
                    ? 'warning'
                    : 'danger'
                }
              />
            </View>

            {volunteerStatus === 'PAUSED' && (
              <View style={[styles.calloutWarning, { backgroundColor: isDark ? 'rgba(245,158,11,0.1)' : '#FEF3C7', borderColor: '#F59E0B' }]}>
                <Feather name="pause-circle" size={16} color="#D97706" />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.calloutTitle, { color: '#B45309' }]}>Masa Jeda Aktif (3 Bulan)</Text>
                  <Text style={[styles.calloutBody, { color: '#92400E' }]}>
                    Anda sedang rehat sementara. Penugasan darurat tidak akan masuk. Ketuk tombol di bawah untuk mengaktifkan kembali sewaktu-waktu.
                  </Text>
                </View>
              </View>
            )}

            {volunteerStatus !== 'ACTIVE' && (
              <PrimaryButton
                label="Aktifkan Kembali Kerelawanan Saya"
                icon="play"
                variant="primary"
                onPress={handleReactivateVolunteer}
              />
            )}
          </Card>

          {/* Opsi Kontrol Kerelawanan */}
          {volunteerStatus === 'ACTIVE' && (
            <Card style={{ gap: spacing.md }}>
              <SectionTitle style={{ marginBottom: 0 }}>Pilihan Pengaturan Partisipasi</SectionTitle>

              {/* Opsi 1: Berhenti Sementara (Cuti Relawan) */}
              <View style={[styles.optionCard, { borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.optIconBox, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                    <Feather name="clock" size={18} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optTitle, { color: colors.text }]}>1. Berhenti Sementara (Cuti Relawan)</Text>
                    <Text style={[styles.optSub, { color: colors.textMuted }]}>
                      Untuk yang sedang sibuk kerja/studi 1 s/d 6 bulan tanpa keluar permanen.
                    </Text>
                  </View>
                </View>

                {/* Duration Pills */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  {VOLUNTEER_PAUSE_DURATIONS.map((dur) => (
                    <Pressable
                      key={dur.value}
                      onPress={() => setPauseDuration(dur.value)}
                      style={[
                        styles.durChip,
                        { borderColor: pauseDuration === dur.value ? colors.primary : colors.border },
                        pauseDuration === dur.value && { backgroundColor: isDark ? 'rgba(0,102,179,0.2)' : '#EFF6FF' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.durChipText,
                          { color: pauseDuration === dur.value ? colors.primary : colors.textMuted },
                        ]}
                      >
                        {dur.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <PrimaryButton
                  label="Ambil Cuti Relawan"
                  icon="pause"
                  variant="secondary"
                  onPress={() => handleVolunteerActionClick('pause')}
                  style={{ marginTop: 4 }}
                />
              </View>

              {/* Opsi 2: Berhenti Menjadi Relawan */}
              <View style={[styles.optionCard, { borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.optIconBox, { backgroundColor: 'rgba(230,0,18,0.15)' }]}>
                    <Feather name="user-x" size={18} color="#E60012" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optTitle, { color: colors.text }]}>2. Berhenti Menjadi Relawan</Text>
                    <Text style={[styles.optSub, { color: colors.textMuted }]}>
                      Penghentian peran relawan lapangan tanpa menghapus rekam jejak kontribusi.
                    </Text>
                  </View>
                </View>

                <PrimaryButton
                  label="Berhenti Menjadi Relawan"
                  icon="slash"
                  variant="danger"
                  onPress={() => handleVolunteerActionClick('stop')}
                  style={{ marginTop: 4 }}
                />
              </View>
            </Card>
          )}

          {/* Jaminan Zero History Loss */}
          <Card style={[styles.historyGuardCard, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#F0FDF4', borderColor: '#86EFAC' }]}>
            <Feather name="check-circle" size={20} color="#16A34A" />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[styles.guardTitle, { color: '#15803D' }]}>
                Jaminan Perlindungan Histori (Zero History Loss)
              </Text>
              <Text style={[styles.guardDesc, { color: '#166534' }]}>
                15 tugas selesai, 12 jam bimtek, dan sertifikat pelatihan Anda tetap tersimpan utuh selamanya. Independen dari status keanggotaan atau alumni akademi.
              </Text>
            </View>
          </Card>
        </View>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FORM PENGAJUAN PENGUNDURAN DIRI ANGGOTA (MEMBERSHIP)              */}
      {/* ========================================================================= */}
      <Modal visible={showResignModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ gap: 2, flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Formulir Pengunduran Diri</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>Kader & Anggota simPAN Nasional</Text>
              </View>
              <TouchableOpacity onPress={() => setShowResignModal(false)}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Pilih Alasan Pengunduran Diri:</Text>
              <View style={{ gap: 6, marginVertical: 6 }}>
                {RESIGN_REASONS.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setSelectedResignReason(r)}
                    style={[
                      styles.reasonOption,
                      { borderColor: selectedResignReason === r ? colors.primary : colors.border },
                      selectedResignReason === r && { backgroundColor: isDark ? 'rgba(0,102,179,0.15)' : '#EFF6FF' },
                    ]}
                  >
                    <View style={[styles.radioCircle, { borderColor: selectedResignReason === r ? colors.primary : colors.border }]}>
                      {selectedResignReason === r && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                    </View>
                    <Text style={[styles.reasonText, { color: colors.text }]}>{r}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.formLabel, { color: colors.text, marginTop: 8 }]}>Catatan Tambahan (Opsional):</Text>
              <TextInput
                style={[styles.textInputArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Tuliskan keterangan detail alasan Anda..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={resignNotes}
                onChangeText={setResignNotes}
              />

              {/* Checkbox Konsekuensi */}
              <Pressable
                onPress={() => setAgreedTerms(!agreedTerms)}
                style={styles.checkboxRow}
              >
                <View style={[styles.checkboxBox, { borderColor: agreedTerms ? colors.primary : colors.border, backgroundColor: agreedTerms ? colors.primary : 'transparent' }]}>
                  {agreedTerms && <Feather name="check" size={12} color="#FFFFFF" />}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  Saya memahami bahwa pengunduran diri ini mencabut hak suara saya di partai dan surat mandat yang saya pegang.
                </Text>
              </Pressable>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.md }}>
              <PrimaryButton
                label="Batal"
                variant="secondary"
                onPress={() => setShowResignModal(false)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                label="Kirim Pengajuan"
                variant="danger"
                onPress={handleApplyResignation}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: ACTIVE TASK & ASSIGNMENT GUARD                                     */}
      {/* ========================================================================= */}
      <Modal visible={showTaskGuardModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ alignItems: 'center', gap: 10, paddingVertical: spacing.sm }}>
              <View style={styles.guardIconWrap}>
                <Feather name="alert-triangle" size={32} color="#D97706" />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text, textAlign: 'center' }]}>
                Proteksi Tugas Aktif Terdeteksi
              </Text>
              <Text style={[styles.modalDesc, { color: colors.textMuted, textAlign: 'center' }]}>
                Anda memiliki <Text style={{ fontFamily: fonts.bold, color: colors.text }}>{activeTasksCount} tugas lapangan</Text> dan <Text style={{ fontFamily: fonts.bold, color: colors.text }}>{registeredEventsCount} agenda terdaftar</Text> yang masih aktif.
              </Text>
            </View>

            <View style={[styles.guardNoticeBox, { backgroundColor: isDark ? 'rgba(245,158,11,0.1)' : '#FEF3C7', borderColor: '#F59E0B' }]}>
              <Feather name="info" size={16} color="#D97706" />
              <Text style={{ fontSize: 11, color: '#92400E', flex: 1, lineHeight: 16 }}>
                Mengubah status sekarang akan mengembalikan tugas tersebut ke Bursa Tugas agar dapat diambil alih oleh Koordinator Lapangan ({currentUser?.coordinatorContact?.name || 'Asep Ridwan'}).
              </Text>
            </View>

            <View style={{ gap: 8, marginTop: spacing.md }}>
              <PrimaryButton
                label="Selesaikan Tugas Dahulu"
                variant="secondary"
                icon="check-square"
                onPress={() => setShowTaskGuardModal(false)}
              />
              <PrimaryButton
                label="Lanjutkan & Alihkan ke Korlap"
                variant="danger"
                icon="arrow-right"
                onPress={() => pendingVolunteerAction && executeVolunteerAction(pendingVolunteerAction)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Dialog Konfirmasi Sukses */}
      <ConfirmDialog
        visible={dialogInfo.visible}
        title={dialogInfo.title}
        message={dialogInfo.message}
        tone={dialogInfo.tone}
        singleButton
        confirmLabel="Mengerti"
        onConfirm={() => setDialogInfo((prev) => ({ ...prev, visible: false }))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },

  // Header Card
  headerCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: '#BAE6FD',
    lineHeight: 15,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: radius.md,
    padding: 3,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  tabText: {
    fontSize: 11.5,
    fontFamily: fonts.bold,
  },

  // Cards
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13.5,
    fontFamily: fonts.bold,
  },
  statusNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  statusNoticeText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    flex: 1,
    lineHeight: 16,
  },
  calloutWarning: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  calloutTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  calloutBody: {
    fontSize: 11,
    fontFamily: fonts.regular,
    lineHeight: 16,
  },

  // Options
  optionCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    gap: 8,
  },
  optIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optTitle: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  optSub: {
    fontSize: 10.5,
    fontFamily: fonts.regular,
    lineHeight: 15,
    marginTop: 1,
  },
  durChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  durChipText: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },

  // Guard Card
  historyGuardCard: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  guardTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  guardDesc: {
    fontSize: 10.5,
    fontFamily: fonts.regular,
    lineHeight: 15,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  modalDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    lineHeight: 17,
  },
  formLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reasonText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    flex: 1,
  },
  textInputArea: {
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: 10,
    fontSize: 11.5,
    fontFamily: fonts.regular,
    textAlignVertical: 'top',
    height: 70,
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 12,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxLabel: {
    fontSize: 11,
    fontFamily: fonts.regular,
    flex: 1,
    lineHeight: 16,
  },
  guardIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245,158,11,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardNoticeBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
});
