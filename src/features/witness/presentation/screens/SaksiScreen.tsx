import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../../../../context/AppContext';
import { useTheme } from '../../../../context/ThemeContext';
import { Card, ConfirmDialog, EmptyState, Pill, PrimaryButton } from '../../../../components/ui';
import { fonts, radius, spacing } from '../../../../theme';
import { FEATURE_FLAGS } from '../../../../core/config/featureFlags';
import { pillToneFor } from '../../../../core/components/statusTone';
import { Result } from '../../../../core/result';
import { WitnessReviewDecision } from '../../application/simulateWitnessReview';
import { WitnessApplicationStatus } from '../../domain/witnessApplication';
import { WitnessUseCaseOutput } from '../../application/witnessUseCaseTypes';
import { useWitnessApplication } from '../hooks/useWitnessApplication';
import WitnessStatusTimeline from '../components/WitnessStatusTimeline';
import HariHChecklist, { HariHChecklistItem } from '../components/HariHChecklist';

type Dialog = { title: string; message: string; tone: 'success' | 'danger' } | null;

/** Tombol simulasi keputusan Web Command Center per status (khusus demo). */
const DEMO_DECISIONS: Partial<Record<WitnessApplicationStatus, { label: string; decision: WitnessReviewDecision | 'TRAINING_DONE' }[]>> = {
  SCREENING: [
    { label: 'Setujui data', decision: 'APPROVE' },
    { label: 'Minta perbaikan', decision: 'REQUEST_REVISION' },
    { label: 'Tolak', decision: 'REJECT' },
  ],
  TRAINING: [{ label: 'Tandai pelatihan selesai', decision: 'TRAINING_DONE' }],
  APPROVED: [{ label: 'Tempatkan di TPS', decision: 'ASSIGN_TPS' }],
  ASSIGNED: [{ label: 'Cabut penugasan', decision: 'REVOKE' }],
  REVOKED: [{ label: 'Tempatkan kembali', decision: 'ASSIGN_TPS' }],
};

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

/**
 * Satu layar untuk seluruh jalur Saksi TPS: terkunci → daftar → verifikasi → pelatihan →
 * siaga → bertugas (hub Checklist Hari-H). Setiap status hanya punya satu aksi utama.
 */
export default function SaksiScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { witnesses, tps, payments, currentUser } = useApp();
  const { application, access, statusInfo, stepNumber, totalSteps, acceptLetter, completeTraining, simulateReview } =
    useWitnessApplication();
  const [dialog, setDialog] = useState<Dialog>(null);

  const showResult = (result: Result<WitnessUseCaseOutput>) => {
    setDialog(
      result.ok
        ? { title: result.value.notice.title, message: result.value.notice.body, tone: 'success' }
        : { title: 'Belum Bisa Diproses', message: result.error, tone: 'danger' },
    );
  };

  if (access.accountType === 'ANGGOTA') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="lock"
          title="Khusus Relawan"
          body={access.blockedReason ?? ''}
          actionLabel="Kembali"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  const renderStatusBody = () => {
    switch (access.nextAction) {
      case 'COMPLETE_REQUIREMENTS':
        return (
          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Lengkapi syarat dulu</Text>
            <Text style={[styles.body, { color: colors.textMuted }]}>
              Pendaftaran saksi terbuka untuk relawan yang sudah terverifikasi.
            </Text>
            {access.unmetRequirements.map((req) => (
              <View key={req.id} style={styles.reqRow}>
                <Feather name="x-circle" size={16} color={colors.danger} style={{ marginTop: 1 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.reqLabel, { color: colors.text }]}>{req.label}</Text>
                  <Text style={[styles.reqHint, { color: colors.textMuted }]}>{req.hint}</Text>
                </View>
              </View>
            ))}
            {/* KTP yang belum diverifikasi cukup ditunggu; status nonaktif bisa diaktifkan sendiri. */}
            {access.unmetRequirements.some((req) => req.id === 'ACTIVE_STATUS') ? (
              <PrimaryButton label="Aktifkan Status Relawan" icon="refresh-cw" onPress={() => navigation.navigate('KelolaStatus')} />
            ) : null}
          </Card>
        );

      case 'APPLY':
        return (
          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Anda memenuhi syarat</Text>
            <Text style={[styles.body, { color: colors.textMuted }]}>
              Daftar cukup 3 langkah: cek syarat, scan KTP, lalu setujui pernyataan. Setelah diverifikasi dan lulus
              pelatihan, Anda ditempatkan di TPS dekat domisili.
            </Text>
            <PrimaryButton label="Daftar Jadi Saksi" icon="user-check" onPress={() => navigation.navigate('DaftarSaksi')} />
          </Card>
        );

      case 'WAIT_REVIEW':
        return (
          <Card style={styles.card}>
            <InfoRow icon="send" label="Dikirim" value={formatDate(application?.submittedAt)} />
            <Text style={[styles.body, { color: colors.textMuted }]}>
              Anda akan mendapat notifikasi begitu tim pusat selesai memeriksa.
            </Text>
          </Card>
        );

      case 'FIX_DATA':
      case 'REAPPLY':
        return (
          <Card style={styles.card}>
            <View style={[styles.noteBox, { backgroundColor: colors.dangerBg }]}>
              <Text style={[styles.noteTitle, { color: colors.danger }]}>Catatan tim pusat</Text>
              <Text style={[styles.body, { color: colors.text }]}>{application?.reviewNote ?? '-'}</Text>
            </View>
            {access.canApply ? (
              <PrimaryButton
                label={access.nextAction === 'FIX_DATA' ? 'Perbaiki & Kirim Ulang' : 'Ajukan Ulang'}
                icon="edit-3"
                onPress={() => navigation.navigate('DaftarSaksi')}
              />
            ) : (
              <Text style={[styles.body, { color: colors.textMuted }]}>
                Pengajuan ulang terbuka setelah syarat relawan aktif terpenuhi kembali.
              </Text>
            )}
          </Card>
        );

      case 'START_TRAINING':
        return (
          <Card style={styles.card}>
            <Text style={[styles.body, { color: colors.textMuted }]}>
              Pelajari tata cara pengawalan suara, pengisian formulir hasil, dan pelaporan kejadian khusus.
            </Text>
            <PrimaryButton label="Mulai Pelatihan" icon="book-open" onPress={() => navigation.navigate('WitnessAcademy')} />
          </Card>
        );

      case 'WAIT_ASSIGNMENT':
        return (
          <Card style={styles.card}>
            <InfoRow icon="award" label="Lulus pelatihan" value={formatDate(application?.trainingCompletedAt)} />
            <Text style={[styles.body, { color: colors.textMuted }]}>
              Surat mandat dan lokasi TPS akan dikirim lewat notifikasi.
            </Text>
          </Card>
        );

      case 'OPEN_ASSIGNMENT':
        return renderAssignment();

      case 'CONTACT_COORDINATOR': {
        const contact = currentUser.coordinatorContact;
        return (
          <Card style={styles.card}>
            <Text style={[styles.body, { color: colors.text }]}>{application?.revokedReason ?? statusInfo.description}</Text>
            {contact ? (
              <PrimaryButton
                label={`Hubungi ${contact.name}`}
                icon="phone"
                variant="secondary"
                onPress={() => Linking.openURL(`tel:${contact.phone.replace(/\D/g, '')}`)}
              />
            ) : null}
          </Card>
        );
      }

      default:
        return null;
    }
  };

  const renderAssignment = () => {
    const tpsId = application?.assignedTpsId;
    const witness = witnesses.find((w) => w.assignedTpsId === tpsId);
    const tpsRecord = tps.find((t) => t.id === tpsId);
    const checkedIn = witness?.status === 'checked_in';
    const reportDone = tpsRecord?.status === 'done';
    const honorPaid = payments.some((p) => p.witnessId === witness?.id && p.status === 'paid');
    const letterAccepted = application?.letterStatus === 'diterima';
    const letterParams = { witnessId: witness?.id, tpsId };

    // Kemajuan dilacak dari data yang sudah ada: presensi, status laporan TPS, dan status honor.
    const checklist: HariHChecklistItem[] = [
      { id: 'absen', label: 'Absen masuk TPS', hint: 'GPS + swafoto, sebelum pukul 07.00', icon: 'map-pin', done: checkedIn, onPress: () => navigation.navigate('CheckIn') },
      { id: 'mandat', label: 'Tunjukkan surat mandat ke KPPS', hint: 'Bersama KTP-el Anda', icon: 'file-text', done: checkedIn && letterAccepted, onPress: () => navigation.navigate('AssignmentLetter', letterParams) },
      { id: 'tally', label: 'Hitung suara saat penghitungan', hint: 'Catat per surat suara yang dibuka', icon: 'check-square', done: reportDone, onPress: () => navigation.navigate('QuickCountGame') },
      { id: 'c1', label: 'Foto C1 plano & isi angka', hint: 'Pastikan angka terbaca jelas', icon: 'camera', done: reportDone, onPress: () => navigation.navigate('C1Ocr', { tpsId }) },
      { id: 'dokumentasi', label: 'Unggah dokumentasi & cek honor', hint: 'Foto suasana TPS', icon: 'image', done: honorPaid, onPress: () => navigation.navigate('Documentation', { tpsId }) },
    ];

    return (
      <>
        <Card style={styles.card}>
          <InfoRow icon="map-pin" label="Lokasi" value={application?.assignedTpsLabel ?? '-'} />
          <InfoRow icon="file-text" label="No. surat mandat" value={application?.mandateNumber ?? '-'} />
          <View style={styles.letterRow}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Surat tugas</Text>
            <Pill label={letterAccepted ? 'Sudah diterima' : 'Belum diterima'} tone={letterAccepted ? 'success' : 'warning'} />
          </View>
          {letterAccepted ? (
            <PrimaryButton label="Lihat Surat Mandat" icon="file-text" variant="secondary" onPress={() => navigation.navigate('AssignmentLetter', letterParams)} />
          ) : (
            <PrimaryButton label="Terima Surat Tugas" icon="check-circle" onPress={() => showResult(acceptLetter())} />
          )}
        </Card>

        <HariHChecklist items={checklist} />

        <PrimaryButton label="Lapor Kejadian" icon="alert-triangle" variant="outline" onPress={() => navigation.navigate('EmergencyForm')} />
      </>
    );
  };

  const demoButtons = FEATURE_FLAGS.demoControls ? DEMO_DECISIONS[access.status] : undefined;

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <View style={[styles.headerIcon, { backgroundColor: colors.primaryLight }]}>
            <Feather name={access.isUnlocked ? 'shield' : 'lock'} size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Saksi TPS</Text>
            <Pill label={statusInfo.label} tone={pillToneFor(statusInfo.tone)} style={{ alignSelf: 'flex-start' }} />
          </View>
          <Text style={[styles.stepText, { color: colors.primary }]}>
            {stepNumber}/{totalSteps}
          </Text>
        </View>
        <Text style={[styles.body, { color: colors.textMuted }]}>{statusInfo.description}</Text>
        {!access.isUnlocked ? <WitnessStatusTimeline status={access.status} /> : null}
      </Card>

      {renderStatusBody()}

      {demoButtons ? (
        <View style={[styles.demoBox, { borderColor: colors.border }]}>
          <Text style={[styles.demoTitle, { color: colors.textMuted }]}>Simulasi Web Command Center (demo)</Text>
          <View style={styles.demoRow}>
            {demoButtons.map((item) => (
              <PrimaryButton
                key={item.label}
                label={item.label}
                variant="outline"
                onPress={() => showResult(item.decision === 'TRAINING_DONE' ? completeTraining() : simulateReview(item.decision))}
                style={{ flexGrow: 1 }}
              />
            ))}
          </View>
        </View>
      ) : null}

      <ConfirmDialog
        visible={dialog !== null}
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        tone={dialog?.tone ?? 'success'}
        singleButton
        confirmLabel="Tutup"
        onConfirm={() => setDialog(null)}
      />
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.infoRow}>
      <Feather name={icon} size={14} color={colors.textMuted} />
      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', padding: spacing.md },
  card: { gap: spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.bold, fontSize: 16 },
  stepText: { fontFamily: fonts.bold, fontSize: 13 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 14 },
  body: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18 },
  reqRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  reqLabel: { fontFamily: fonts.semiBold, fontSize: 12.5 },
  reqHint: { fontFamily: fonts.regular, fontSize: 11.5 },
  noteBox: { borderRadius: radius.md, padding: spacing.md, gap: 4 },
  noteTitle: { fontFamily: fonts.bold, fontSize: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoLabel: { fontFamily: fonts.medium, fontSize: 12 },
  infoValue: { flex: 1, textAlign: 'right', fontFamily: fonts.semiBold, fontSize: 12.5 },
  letterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  demoBox: { borderWidth: 1, borderStyle: 'dashed', borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  demoTitle: { fontFamily: fonts.semiBold, fontSize: 11.5 },
  demoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
