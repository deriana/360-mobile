import React, { useEffect, useLayoutEffect, useState } from 'react';
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

const RESIGN_REASONS = [
  'Fokus Karir Profesional / Bisnis Swasta',
  'Menjabat di Lembaga Pemerintahan / Lolos ASN/TNI/Polri',
  'Pindah Domisili Tetap ke Luar Negeri',
  'Alasan Kesehatan / Pertimbangan Keluarga Pribadi',
  'Lainnya',
];

const VOLUNTEER_PAUSE_DURATIONS = [
  { label: '1 Bulan', value: '1_month', months: 1 },
  { label: '3 Bulan', value: '3_months', months: 3 },
  { label: '6 Bulan', value: '6_months', months: 6 },
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
  const {
    currentUser,
    tasks,
    events,
    requestMembershipResignation,
    cancelMembershipResignation,
    setVolunteerPause,
    stopVolunteer,
  } = useApp();

  const officialMembership = currentUser.memberships?.find((m) => m.type === 'member');
  const isMember = Boolean(
    officialMembership && (officialMembership.status === 'verified' || officialMembership.status === 'active')
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isMember ? 'Status Keanggotaan' : 'Partisipasi Relawan',
    });
  }, [navigation, isMember]);

  const dims = currentUser.dimensions || {
    membership: 'active',
    volunteer: 'active',
  };

  // Membership Resignation State
  const [selectedResignReason, setSelectedResignReason] = useState<string>(RESIGN_REASONS[0]);
  const [resignNotes, setResignNotes] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);

  // Derive initial status from AppContext dims
  const isResignationRequested = dims.membership === 'resignation_requested';
  const [membershipStatus, setMembershipStatus] = useState<'ACTIVE' | 'RESIGNATION_REQUESTED'>(
    isResignationRequested ? 'RESIGNATION_REQUESTED' : 'ACTIVE'
  );

  // Volunteer State derived from AppContext dims
  const isVolPaused = dims.volunteer === 'paused' || currentUser.volunteerPauseInfo?.isPaused;
  const isVolInactive = dims.volunteer === 'inactive';
  const initialVolStatus: 'ACTIVE' | 'PAUSED' | 'INACTIVE' = isVolPaused
    ? 'PAUSED'
    : isVolInactive
    ? 'INACTIVE'
    : 'ACTIVE';

  const [volunteerStatus, setVolunteerStatus] = useState<'ACTIVE' | 'PAUSED' | 'INACTIVE'>(initialVolStatus);
  const [pauseDuration, setPauseDuration] = useState('3_months');
  const [selectedVolReason, setSelectedVolReason] = useState<string>(VOLUNTEER_REASONS[0]);
  const [showTaskGuardModal, setShowTaskGuardModal] = useState(false);
  const [pendingVolunteerAction, setPendingVolunteerAction] = useState<'pause' | 'stop' | null>(null);

  // Realtime synchronization with AppContext dimensions
  useEffect(() => {
    const isPaused = dims.volunteer === 'paused' || Boolean(currentUser.volunteerPauseInfo?.isPaused);
    const isInactive = dims.volunteer === 'inactive';
    setVolunteerStatus(isPaused ? 'PAUSED' : isInactive ? 'INACTIVE' : 'ACTIVE');
  }, [dims.volunteer, currentUser.volunteerPauseInfo?.isPaused]);

  useEffect(() => {
    setMembershipStatus(dims.membership === 'resignation_requested' ? 'RESIGNATION_REQUESTED' : 'ACTIVE');
  }, [dims.membership]);

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
  const activeTasksCount = tasks?.filter((t) => t.status === 'in_progress' || t.status === 'pending').length || 0;
  const registeredEventsCount = events?.filter((e) => e.isRegistered).length || 0;

  const handleApplyResignation = () => {
    if (!agreedTerms) {
      Alert.alert('Persetujuan Diperlukan', 'Harap centang persetujuan konsekuensi hak anggota sebelum melanjutkan.');
      return;
    }
    setShowResignModal(false);
    requestMembershipResignation({
      reason: selectedResignReason,
      note: resignNotes,
      requestedAt: new Date().toISOString().slice(0, 10),
    });
    setMembershipStatus('RESIGNATION_REQUESTED');
    setDialogInfo({
      visible: true,
      title: 'Pengajuan Pengunduran Diri Dikirim',
      message:
        'Berkas pengunduran diri keanggotaan Anda telah dicatat dengan status RESIGNATION_REQUESTED. Tim verifikasi administrasi DPD PAN Kota Bandung akan melakukan reviu dalam 7 hari kerja.',
      tone: 'warning',
    });
  };

  const handleCancelResign = () => {
    cancelMembershipResignation();
    setMembershipStatus('ACTIVE');
    setDialogInfo({
      visible: true,
      title: 'Pengajuan Dibatalkan',
      message: 'Pengajuan pengunduran diri telah dibatalkan. Status keanggotaan Anda tetap Aktif Penuh di simPAN.',
      tone: 'success',
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
      const durMonths = pauseDuration === '1_month' ? 1 : pauseDuration === '6_months' ? 6 : 3;
      setVolunteerPause({
        isPaused: true,
        reason: selectedVolReason,
        durationMonths: durMonths,
      });
      setVolunteerStatus('PAUSED');
      setDialogInfo({
        visible: true,
        title: 'Status Kerelawanan Dijeda',
        message:
          'Status relawan Anda saat ini dalam masa cuti rehat sementara. Penugasan darurat dinonaktifkan tanpa menghapus portofolio. Anda dapat mengaktifkannya kembali kapan saja.',
        tone: 'primary',
      });
    } else {
      stopVolunteer({
        reason: selectedVolReason,
        note: '',
      });
      setVolunteerStatus('INACTIVE');
      setDialogInfo({
        visible: true,
        title: 'Berhenti dari Relawan Lapangan',
        message:
          'Status kerelawanan lapangan telah dinonaktifkan. Seluruh rekam jejak kegiatan dan sertifikat pelatihan tetap tersimpan secara utuh di database.',
        tone: 'warning',
      });
    }
  };

  const handleReactivateVolunteer = () => {
    setVolunteerPause({ isPaused: false });
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
            <Feather name={isMember ? 'shield' : 'user-check'} size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.headerTitle}>
              {isMember ? 'Tata Kelola Keanggotaan' : 'Kelola Partisipasi Relawan'}
            </Text>
            <Text style={styles.headerSub}>
              {isMember
                ? 'Pengaturan status keaktifan dan administrasi keanggotaan partai'
                : 'Pengaturan masa jeda tugas dan status keaktifan relawan lapangan'}
            </Text>
          </View>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* TATA KELOLA ROLE-BASED: ANGGOTA RESMI vs RELAWAN                           */}
      {/* ========================================================================= */}
      {isMember ? (
        /* KELOLA KEANGGOTAAN RESMI PARTAI */
        <View style={{ gap: spacing.md }}>
          {/* Card Status Saat Ini */}
          <Card style={{ gap: spacing.sm }}>
            <View style={styles.statusCardHeader}>
              <View style={{ flex: 1, minWidth: 150, gap: 2 }}>
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
                  Status Keanggotaan Partai
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }} numberOfLines={1} ellipsizeMode="tail">
                  Nomor e-KTA: {officialMembership?.ktaNumber || '32.73.01.2024.08912'} • {officialMembership?.dpc || 'DPC Coblong'}
                </Text>
              </View>
              <View style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
                <Pill
                  label={membershipStatus === 'ACTIVE' ? 'ANGGOTA AKTIF' : 'PROSES RESIGN'}
                  tone={membershipStatus === 'ACTIVE' ? 'success' : 'warning'}
                />
              </View>
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
                Alasan: {currentUser.resignationRequest?.reason || selectedResignReason}. Permohonan ini sedang dievaluasi oleh Tim Bidang Organisasi & Keanggotaan DPD PAN Kota Bandung.
              </Text>
              <PrimaryButton
                label="Batalkan Pengajuan Resign"
                variant="secondary"
                icon="rotate-ccw"
                onPress={handleCancelResign}
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
              Anda memiliki hak atas pembatasan pemrosesan data pribadi. Histori audit transaksi pemilu tetap dilindungi enkripsi kriptografis untuk integritas data partai.
            </Text>
          </Card>
        </View>
      ) : (
        /* KELOLA PARTISIPASI RELAWAN */
        <View style={{ gap: spacing.md }}>
          {/* Status Relawan Saat Ini */}
          <Card style={{ gap: spacing.sm }}>
            <View style={styles.statusCardHeader}>
              <View style={{ flex: 1, minWidth: 150, gap: 2 }}>
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
                  Status Kerelawanan Lapangan
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }} numberOfLines={1} ellipsizeMode="tail">
                  Wilayah: {currentUser?.coordinatorContact?.region || currentUser?.coordinatorContact?.posko || 'Coblong Kluster 6'} • Korlap: {currentUser?.coordinatorContact?.name || 'Asep Ridwan'}
                </Text>
              </View>
              <View style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
                <Pill
                  label={
                    volunteerStatus === 'ACTIVE'
                      ? 'RELAWAN AKTIF'
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
            </View>

            {volunteerStatus === 'PAUSED' && (
              <View style={[styles.calloutWarning, { backgroundColor: isDark ? 'rgba(245,158,11,0.1)' : '#FEF3C7', borderColor: '#F59E0B' }]}>
                <Feather name="pause-circle" size={16} color="#D97706" />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.calloutTitle, { color: '#B45309' }]}>Masa Jeda Aktif</Text>
                  <Text style={[styles.calloutBody, { color: '#92400E' }]}>
                    Anda sedang rehat sementara ({currentUser?.volunteerPauseInfo?.reason || 'Cuti terencana'}). Penugasan darurat tidak akan masuk. Ketuk tombol di bawah untuk mengaktifkan kembali sewaktu-waktu.
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

              {/* Cuti Relawan Sementara */}
              <View style={[styles.optionCard, { borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.optIconBox, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                    <Feather name="clock" size={18} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optTitle, { color: colors.text }]}>Cuti Relawan Sementara</Text>
                    <Text style={[styles.optSub, { color: colors.textMuted }]}>
                      Ambil jeda tugas lapangan 1 s/d 6 bulan tanpa menghapus status relawan.
                    </Text>
                  </View>
                </View>

                {/* Duration Pills */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
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

              {/* Berhenti Menjadi Relawan */}
              <View style={[styles.optionCard, { borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.optIconBox, { backgroundColor: 'rgba(230,0,18,0.15)' }]}>
                    <Feather name="user-x" size={18} color="#E60012" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optTitle, { color: colors.text }]}>Berhenti Menjadi Relawan</Text>
                    <Text style={[styles.optSub, { color: colors.textMuted }]}>
                      Penghentian peran relawan lapangan dengan arsip rekam jejak kontribusi tetap tersimpan.
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

          {/* Perlindungan Rekam Jejak Kontribusi */}
          <Card style={[styles.historyGuardCard, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#F0FDF4', borderColor: '#86EFAC' }]}>
            <Feather name="check-circle" size={20} color="#16A34A" />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[styles.guardTitle, { color: '#15803D' }]}>
                Perlindungan Rekam Jejak Kontribusi
              </Text>
              <Text style={[styles.guardDesc, { color: '#166534' }]}>
                Seluruh tugas selesai, riwayat bimtek, dan sertifikat pelatihan Anda tetap tersimpan utuh di database simPAN DPP PAN. Arsip kontribusi Anda aman dan dapat ditinjau kapan saja.
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
    flexShrink: 0,
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

  // Cards
  statusCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    flexWrap: 'wrap',
  },
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
    lineHeight: 15,
  },

  // Options
  optionCard: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
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
    fontSize: 11,
    fontFamily: fonts.regular,
    lineHeight: 15,
  },
  durChip: {
    flex: 1,
    minWidth: 75,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durChipText: {
    fontSize: 11,
    fontFamily: fonts.medium,
  },

  // History Guard Card
  historyGuardCard: {
    flexDirection: 'row',
    gap: 10,
    padding: spacing.md,
  },
  guardTitle: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  guardDesc: {
    fontSize: 11,
    fontFamily: fonts.regular,
    lineHeight: 15,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
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
    gap: 8,
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
    fontSize: 11.5,
    fontFamily: fonts.medium,
    flex: 1,
  },
  textInputArea: {
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: 12,
    textAlignVertical: 'top',
    height: 70,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: spacing.sm,
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
