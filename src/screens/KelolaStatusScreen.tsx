import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { fonts } from '../theme';

const RESIGNATION_REASONS = [
  'Kesibukan Profesional / Karir',
  'Pindah Domisili ke Luar Wilayah',
  'Menjadi ASN / TNI / POLRI',
  'Alasan Kesehatan & Keluarga',
  'Lainnya',
];

const PAUSE_REASONS = [
  'Fokus Studi & Pendidikan',
  'Penugasan Dinas Luar Kota',
  'Keperluan Keluarga / Medis',
  'Lainnya',
];

export default function KelolaStatusScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const {
    currentUser,
    tasks,
    requestMembershipResignation,
    cancelMembershipResignation,
    setVolunteerPause,
    stopVolunteer,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'keanggotaan' | 'kerelawanan'>('keanggotaan');

  // Keanggotaan form state
  const [selectedResignReason, setSelectedResignReason] = useState(RESIGNATION_REASONS[0]);
  const [resignNote, setResignNote] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Volunteer pause form state
  const [selectedPauseReason, setSelectedPauseReason] = useState(PAUSE_REASONS[0]);
  const [pauseDuration, setPauseDuration] = useState<number>(3);

  // Volunteer stop form state
  const [stopReason, setStopReason] = useState('');
  const [stopFeedback, setStopFeedback] = useState('');

  const dims = currentUser.dimensions || {
    membership: 'active',
    volunteer: 'active',
  };

  const isMember = currentUser.memberships.some((m) => m.type === 'member');
  const activeTasks = tasks.filter((t) => t.status === 'in_progress' || t.status === 'pending');
  const isResignationPending = dims.membership === 'resignation_requested';
  const isVolunteerPaused = dims.volunteer === 'paused' || currentUser.volunteerPauseInfo?.isPaused;
  const isVolunteerInactive = dims.volunteer === 'inactive';

  const handleResignSubmit = () => {
    if (!agreeTerms) {
      Alert.alert('Persetujuan Diperlukan', 'Harap centang konfirmasi pelepasan hak keanggotaan sebelum mengajukan.');
      return;
    }

    if (activeTasks.length > 0) {
      Alert.alert(
        'Peringatan Active Task Guard',
        `Anda masih memiliki ${activeTasks.length} tugas lapangan aktif. Apakah Anda yakin tetap ingin mengajukan pengunduran diri ke DPD?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Tetap Ajukan',
            style: 'destructive',
            onPress: () => {
              requestMembershipResignation({
                reason: selectedResignReason,
                note: resignNote,
                requestedAt: new Date().toISOString().slice(0, 10),
              });
              Alert.alert(
                'Pengajuan Berhasil Dikirim',
                'Permohonan pengunduran diri Anda telah tercatat dan dikirimkan ke DPD PAN Kota Bandung untuk verifikasi resmi.',
              );
            },
          },
        ],
      );
    } else {
      requestMembershipResignation({
        reason: selectedResignReason,
        note: resignNote,
        requestedAt: new Date().toISOString().slice(0, 10),
      });
      Alert.alert(
        'Pengajuan Berhasil Dikirim',
        'Permohonan pengunduran diri Anda telah tercatat dan dikirimkan ke DPD PAN Kota Bandung untuk verifikasi resmi.',
      );
    }
  };

  const handleCancelResign = () => {
    Alert.alert(
      'Batalkan Pengunduran Diri',
      'Apakah Anda yakin ingin membatalkan pengajuan pengunduran diri dan mengaktifkan kembali keanggotaan?',
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          onPress: () => {
            cancelMembershipResignation();
            Alert.alert('Berhasil', 'Pengajuan pengunduran diri dibatalkan. Status Anda kembali Aktif Penuh.');
          },
        },
      ],
    );
  };

  const handlePauseToggle = () => {
    if (isVolunteerPaused) {
      setVolunteerPause({ isPaused: false });
      Alert.alert('Status Diaktifkan', 'Partisipasi relawan Anda telah aktif kembali!');
    } else {
      setVolunteerPause({
        isPaused: true,
        reason: selectedPauseReason,
        durationMonths: pauseDuration,
      });
      Alert.alert(
        'Jeda Dikonfirmasi',
        `Partisipasi relawan Anda dijeda selama ${pauseDuration} bulan. Anda dapat mengaktifkannya kembali kapan saja.`,
      );
    }
  };

  const handleStopVolunteer = () => {
    Alert.alert(
      'Konfirmasi Berhenti Relawan',
      'Status kerelawanan Anda akan dinonaktifkan. Seluruh riwayat pengawalan suara dan sertifikat Anda akan tetap tersimpan aman di simPAN.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Berhenti',
          style: 'destructive',
          onPress: () => {
            stopVolunteer({
              reason: stopReason || 'Pemberhentian sukarela',
              note: stopFeedback,
            });
            Alert.alert('Status Dinonaktifkan', 'Status kerelawanan Anda telah dinonaktifkan.');
          },
        },
      ],
    );
  };

  const handleReactivateVolunteer = () => {
    setVolunteerPause({ isPaused: false });
    Alert.alert('Selamat Datang Kembali!', 'Status kerelawanan Anda telah diaktifkan kembali.');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Tabs */}
        <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'keanggotaan' && styles.tabItemActive]}
            onPress={() => setActiveTab('keanggotaan')}
            activeOpacity={0.8}
          >
            <Feather
              name="credit-card"
              size={15}
              color={activeTab === 'keanggotaan' ? '#FFFFFF' : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'keanggotaan' ? '#FFFFFF' : colors.textMuted },
              ]}
            >
              Keanggotaan Partai
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'kerelawanan' && styles.tabItemActive]}
            onPress={() => setActiveTab('kerelawanan')}
            activeOpacity={0.8}
          >
            <Feather
              name="heart"
              size={15}
              color={activeTab === 'kerelawanan' ? '#FFFFFF' : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'kerelawanan' ? '#FFFFFF' : colors.textMuted },
              ]}
            >
              Status Kerelawanan
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: KEANGGOTAAN PARTAI */}
        {activeTab === 'keanggotaan' && (
          <View>
            {/* Non-member Fallback */}
            {!isMember && (
              <View style={[styles.infoCard, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                <Feather name="info" size={20} color="#0284C7" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.infoTitle, { color: '#0369A1' }]}>
                    Bukan Anggota Ber-eKTA
                  </Text>
                  <Text style={[styles.infoDesc, { color: '#0284C7' }]}>
                    Akun Anda saat ini terdaftar sebagai Relawan Simpatisan (Non-KTA). Opsi pengunduran diri resmi anggota hanya berlaku bagi pemegang e-KTA simPAN.
                  </Text>
                </View>
              </View>
            )}

            {isMember && isResignationPending && (
              <View style={[styles.pendingCard, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                <View style={styles.pendingHeader}>
                  <Feather name="clock" size={20} color="#B45309" />
                  <Text style={styles.pendingTitle}>Permohonan Pengunduran Diri Diproses</Text>
                </View>
                <Text style={styles.pendingDesc}>
                  Pengajuan Anda telah diteruskan ke Sekretariat DPD PAN Kota Bandung pada{' '}
                  <Text style={{ fontFamily: fonts.semiBold }}>
                    {currentUser.resignationRequest?.requestedAt || '18 Sep 2026'}
                  </Text>
                  . Status keanggotaan Anda saat ini: Resignation Requested (Menunggu Verifikasi & Penonaktifan e-KTA).
                </Text>
                {currentUser.resignationRequest?.reason && (
                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonLabel}>Alasan yang diajukan:</Text>
                    <Text style={styles.reasonValue}>{currentUser.resignationRequest.reason}</Text>
                    {currentUser.resignationRequest?.note && (
                      <Text style={styles.reasonNote}>"{currentUser.resignationRequest.note}"</Text>
                    )}
                  </View>
                )}
                <TouchableOpacity
                  style={styles.cancelResignButton}
                  onPress={handleCancelResign}
                  activeOpacity={0.8}
                >
                  <Feather name="rotate-ccw" size={15} color="#FFFFFF" />
                  <Text style={styles.cancelResignText}>Batalkan Pengajuan Pengunduran Diri</Text>
                </TouchableOpacity>
              </View>
            )}

            {isMember && !isResignationPending && (
              <View>
                {/* Active Task Guard Warning */}
                {activeTasks.length > 0 && (
                  <View style={styles.taskGuardBanner}>
                    <Feather name="shield" size={18} color="#92400E" />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.taskGuardTitle}>
                        Active Task Guard: {activeTasks.length} Tugas Berjalan
                      </Text>
                      <Text style={styles.taskGuardDesc}>
                        Anda memiliki penugasan lapangan yang belum selesai. Mohon berkoordinasi dengan Korlap atau pimpinan DPC setempat sebelum menyerahkan mandat keanggotaan.
                      </Text>
                    </View>
                  </View>
                )}

                {/* Resignation Form Card */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Pengajuan Pengunduran Diri Resmi
                  </Text>
                  <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
                    Sesuai Peraturan Organisasi DPP PAN, pengunduran diri kader memerlukan pencatatan alasan resmi dan validasi sekretariat DPD/DPP sebelum penerbitan Surat Keterangan Pemberhentian.
                  </Text>

                  {/* Reason Selection */}
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Pilih Alasan Utama
                  </Text>
                  <View style={styles.reasonChips}>
                    {RESIGNATION_REASONS.map((r) => {
                      const isSelected = selectedResignReason === r;
                      return (
                        <TouchableOpacity
                          key={r}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: isSelected ? '#0066B3' : colors.background,
                              borderColor: isSelected ? '#0066B3' : colors.border,
                            },
                          ]}
                          onPress={() => setSelectedResignReason(r)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              { color: isSelected ? '#FFFFFF' : colors.text },
                            ]}
                          >
                            {r}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Notes input */}
                  <Text style={[styles.inputLabel, { color: colors.text, marginTop: 14 }]}>
                    Catatan Tambahan / Uraian Singkat
                  </Text>
                  <TextInput
                    style={[
                      styles.textArea,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    multiline
                    numberOfLines={3}
                    placeholder="Tuliskan keterangan detail atau instansi penugasan baru..."
                    placeholderTextColor={colors.textMuted}
                    value={resignNote}
                    onChangeText={setResignNote}
                  />

                  {/* Confirmation Checkbox */}
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setAgreeTerms(!agreeTerms)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: agreeTerms ? '#0066B3' : colors.border,
                          backgroundColor: agreeTerms ? '#0066B3' : 'transparent',
                        },
                      ]}
                    >
                      {agreeTerms && <Feather name="check" size={14} color="#FFFFFF" />}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: colors.textMuted }]}>
                      Saya secara sadar memahami bahwa pengajuan ini akan diproses oleh DPD PAN Kota Bandung dan e-KTA digital simPAN akan dinonaktifkan setelah verifikasi.
                    </Text>
                  </TouchableOpacity>

                  {/* Submit Button */}
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      { backgroundColor: agreeTerms ? '#DC2626' : '#9CA3AF' },
                    ]}
                    onPress={handleResignSubmit}
                    disabled={!agreeTerms}
                    activeOpacity={0.8}
                  >
                    <Feather name="send" size={16} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Kirim Pengajuan ke DPD PAN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* TAB 2: STATUS KERELAWANAN */}
        {activeTab === 'kerelawanan' && (
          <View>
            {/* Current Volunteer State Summary */}
            <View
              style={[
                styles.volStateCard,
                {
                  backgroundColor: isVolunteerPaused
                    ? '#FEF3C7'
                    : isVolunteerInactive
                    ? '#FEE2E2'
                    : '#DCFCE7',
                  borderColor: isVolunteerPaused
                    ? '#F59E0B'
                    : isVolunteerInactive
                    ? '#EF4444'
                    : '#22C55E',
                },
              ]}
            >
              <Feather
                name={isVolunteerPaused ? 'clock' : isVolunteerInactive ? 'slash' : 'check-circle'}
                size={22}
                color={isVolunteerPaused ? '#B45309' : isVolunteerInactive ? '#DC2626' : '#16A34A'}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text
                  style={[
                    styles.volStateTitle,
                    {
                      color: isVolunteerPaused
                        ? '#92400E'
                        : isVolunteerInactive
                        ? '#991B1B'
                        : '#166534',
                    },
                  ]}
                >
                  Status Saat Ini:{' '}
                  {isVolunteerPaused
                    ? 'Partisipasi Dijeda'
                    : isVolunteerInactive
                    ? 'Nonaktif Sukarela'
                    : 'Relawan Aktif Penuh'}
                </Text>
                <Text
                  style={[
                    styles.volStateDesc,
                    {
                      color: isVolunteerPaused
                        ? '#B45309'
                        : isVolunteerInactive
                        ? '#B91C1C'
                        : '#15803D',
                    },
                  ]}
                >
                  {isVolunteerPaused
                    ? `Dijeda karena: ${currentUser.volunteerPauseInfo?.reason || 'Keperluan Pribadi'} (${currentUser.volunteerPauseInfo?.durationMonths || 3} bln).`
                    : isVolunteerInactive
                    ? 'Anda tidak akan menerima notifikasi tugas bursa & giat lapangan baru.'
                    : 'Siap menerima mandat pengawalan suara dan penugasan posko wilayah.'}
                </Text>
              </View>
            </View>

            {/* Option 1: Jeda Sementara Relawan (PAUSED) */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeaderWithIcon}>
                <View style={[styles.iconBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Feather name="pause" size={16} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Jeda Partisipasi Sementara (Pause)
                  </Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                    Istirahat tanpa kehilangan riwayat aktivitas dan sertifikat
                  </Text>
                </View>
              </View>

              {!isVolunteerPaused ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Pilih Durasi Jeda
                  </Text>
                  <View style={styles.durationRow}>
                    {[1, 3, 6].map((months) => (
                      <TouchableOpacity
                        key={months}
                        style={[
                          styles.durationButton,
                          pauseDuration === months && styles.durationButtonActive,
                          {
                            borderColor: pauseDuration === months ? '#0066B3' : colors.border,
                            backgroundColor: pauseDuration === months ? '#E0F2FE' : colors.background,
                          },
                        ]}
                        onPress={() => setPauseDuration(months)}
                      >
                        <Text
                          style={[
                            styles.durationText,
                            { color: pauseDuration === months ? '#0066B3' : colors.text },
                          ]}
                        >
                          {months} Bulan
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>
                    Alasan Jeda
                  </Text>
                  <View style={styles.reasonChips}>
                    {PAUSE_REASONS.map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: selectedPauseReason === r ? '#0066B3' : colors.background,
                            borderColor: selectedPauseReason === r ? '#0066B3' : colors.border,
                          },
                        ]}
                        onPress={() => setSelectedPauseReason(r)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            { color: selectedPauseReason === r ? '#FFFFFF' : colors.text },
                          ]}
                        >
                          {r}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.pauseActionButton, { backgroundColor: '#F59E0B' }]}
                    onPress={handlePauseToggle}
                    activeOpacity={0.8}
                  >
                    <Feather name="clock" size={15} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Aktifkan Jeda Sementara</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ marginTop: 12 }}>
                  <TouchableOpacity
                    style={[styles.pauseActionButton, { backgroundColor: '#16A34A' }]}
                    onPress={handlePauseToggle}
                    activeOpacity={0.8}
                  >
                    <Feather name="play" size={15} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Aktifkan Kembali Partisipasi Relawan</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Option 2: Berhenti Menjadi Relawan (INACTIVE) */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeaderWithIcon}>
                <View style={[styles.iconBadge, { backgroundColor: '#FEE2E2' }]}>
                  <Feather name="user-x" size={16} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Berhenti Menjadi Relawan
                  </Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                    Nonaktifkan status sukarela secara permanen
                  </Text>
                </View>
              </View>

              {!isVolunteerInactive ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Alasan Berhenti
                  </Text>
                  <TextInput
                    style={[
                      styles.inputField,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="Misal: Pindah domisili atau kesibukan keluarga"
                    placeholderTextColor={colors.textMuted}
                    value={stopReason}
                    onChangeText={setStopReason}
                  />

                  <Text style={[styles.inputLabel, { color: colors.text, marginTop: 10 }]}>
                    Saran & Masukan (Exit Survey)
                  </Text>
                  <TextInput
                    style={[
                      styles.textArea,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    multiline
                    numberOfLines={2}
                    placeholder="Masukan Anda sangat berharga bagi koordinasi posko pemenangan..."
                    placeholderTextColor={colors.textMuted}
                    value={stopFeedback}
                    onChangeText={setStopFeedback}
                  />

                  <TouchableOpacity
                    style={[styles.pauseActionButton, { backgroundColor: '#DC2626', marginTop: 14 }]}
                    onPress={handleStopVolunteer}
                    activeOpacity={0.8}
                  >
                    <Feather name="x-circle" size={15} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Konfirmasi Berhenti Relawan</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ marginTop: 12 }}>
                  <TouchableOpacity
                    style={[styles.pauseActionButton, { backgroundColor: '#0066B3' }]}
                    onPress={handleReactivateVolunteer}
                    activeOpacity={0.8}
                  >
                    <Feather name="check" size={15} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Daftar Ulang / Aktifkan Kembali</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: '#0066B3',
  },
  tabText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 4,
  },
  infoDesc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  pendingCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pendingTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: '#92400E',
  },
  pendingDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#B45309',
    lineHeight: 18,
    marginBottom: 12,
  },
  reasonBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  reasonLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#78350F',
    marginBottom: 2,
  },
  reasonValue: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#92400E',
  },
  reasonNote: {
    fontFamily: fonts.regular,
    fontStyle: 'italic',
    fontSize: 12,
    color: '#B45309',
    marginTop: 4,
  },
  cancelResignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0066B3',
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelResignText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  taskGuardBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  taskGuardTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#92400E',
  },
  taskGuardDesc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#B45309',
    lineHeight: 16,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  cardDesc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    marginBottom: 8,
  },
  reasonChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: fonts.regular,
    textAlignVertical: 'top',
    minHeight: 70,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxLabel: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  submitButtonText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  volStateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  volStateTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  volStateDesc: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  durationButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  durationButtonActive: {
    borderWidth: 1.5,
  },
  durationText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  pauseActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  actionButtonText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
