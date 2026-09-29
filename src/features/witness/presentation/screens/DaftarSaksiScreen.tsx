import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import { Card, ConfirmDialog, EmptyState, Input, PrimaryButton } from '../../../../components/ui';
import { fonts, radius, spacing } from '../../../../theme';
import { pickImage } from '../../../../utils/pickImage';
import { scanKtpWithVisionAi } from '../../../../utils/ocrApi';
import { maskNik } from '../../../../utils/masking';
import CheckboxRow from '../../../../core/components/CheckboxRow';
import { EMPTY_KTP_DATA, KtpData, WitnessApplicationForm, WitnessEligibilityAnswers } from '../../domain/witnessApplication';
import {
  hasErrors,
  validateDeclaration,
  validateEligibility,
  validateIdentity,
  WitnessFormErrors,
} from '../../domain/witnessFormRules';
import { useWitnessApplication } from '../hooks/useWitnessApplication';

const STEP_TITLES = ['Cek syarat', 'Data diri & TPS', 'Pernyataan'] as const;

const ELIGIBILITY_ITEMS: { key: keyof WitnessEligibilityAnswers; label: string; description?: string }[] = [
  { key: 'ageAtLeast17', label: 'Berusia minimal 17 tahun atau sudah/pernah menikah' },
  { key: 'hasKtpEl', label: 'Memiliki KTP elektronik (KTP-el)' },
  {
    key: 'notElectionOrganizer',
    label: 'Bukan petugas KPPS, PPS, atau Pengawas TPS',
    description: 'Saksi tidak boleh merangkap sebagai penyelenggara pemilu.',
  },
  {
    key: 'notCivilServantOrSecurity',
    label: 'Bukan ASN, TNI, atau Polri aktif',
    description: 'Sesuai aturan netralitas.',
  },
];

const NO_ELIGIBILITY: WitnessEligibilityAnswers = {
  ageAtLeast17: false,
  hasKtpEl: false,
  notElectionOrganizer: false,
  notCivilServantOrSecurity: false,
};

/**
 * Pendaftaran saksi 3 langkah dengan input minimal: data KTP diisi otomatis dari foto,
 * pengguna cukup memeriksa. Juga dipakai untuk kirim ulang setelah "Perlu perbaikan"/"Ditolak".
 */
export default function DaftarSaksiScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { account, application, access, submit } = useWitnessApplication();
  const previous = application?.form;

  const [step, setStep] = useState(0);
  const [eligibility, setEligibility] = useState<WitnessEligibilityAnswers>(previous?.eligibility ?? NO_ELIGIBILITY);
  const [ktp, setKtp] = useState<KtpData>(previous?.ktpData ?? { ...EMPTY_KTP_DATA, nama: account.name });
  const [noHp, setNoHp] = useState(previous?.noHp ?? account.phone.replace(/\D/g, ''));
  const [facePhotoUri, setFacePhotoUri] = useState<string | null>(null);
  const [tpsKelurahan, setTpsKelurahan] = useState(previous?.tpsPreference.kelurahan ?? '');
  const [tpsNumber, setTpsNumber] = useState(previous?.tpsPreference.tpsNumber ?? '');
  const [pledge, setPledge] = useState(false);
  const [consent, setConsent] = useState(false);
  const [isEditingKtp, setIsEditingKtp] = useState(!previous);
  const [isScanning, setIsScanning] = useState(false);
  const [errors, setErrors] = useState<WitnessFormErrors>({});
  const [dialog, setDialog] = useState<{ title: string; message: string; success: boolean } | null>(null);
  // Setelah terkirim, `canApply` menjadi false — tetap tampilkan layar ini sampai dialog sukses ditutup.
  const [submitted, setSubmitted] = useState(false);

  const form: WitnessApplicationForm = useMemo(
    () => ({
      eligibility,
      ktpData: ktp,
      noHp,
      hasFacePhoto: Boolean(facePhotoUri) || Boolean(previous?.hasFacePhoto),
      tpsPreference: { kelurahan: tpsKelurahan, tpsNumber: tpsNumber || undefined },
      integrityPledgeAccepted: pledge,
      dataConsentAccepted: consent,
    }),
    [eligibility, ktp, noHp, facePhotoUri, previous, tpsKelurahan, tpsNumber, pledge, consent],
  );

  if (!access.canApply && !submitted) {
    const reason =
      access.blockedReason ??
      (access.unmetRequirements.length > 0
        ? `Lengkapi syarat dulu: ${access.unmetRequirements.map((r) => r.label).join(', ')}.`
        : 'Pengajuan Anda sedang diproses.');
    // Langkah berikutnya sesuai penyebab: status nonaktif → aktifkan; KTP/pengajuan berjalan → lihat status; lainnya → kembali.
    const next = access.unmetRequirements.some((r) => r.id === 'ACTIVE_STATUS')
      ? { label: 'Aktifkan Status Relawan', onPress: () => navigation.navigate('KelolaStatus') }
      : access.unmetRequirements.length > 0 || application
      ? { label: 'Lihat Status Saksi', onPress: () => navigation.navigate('Saksi') }
      : { label: 'Kembali', onPress: () => navigation.goBack() };
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="lock"
          title="Belum Bisa Mendaftar"
          body={reason}
          actionLabel={next.label}
          onAction={next.onPress}
        />
      </View>
    );
  }

  const updateKtp = (field: keyof KtpData, value: string) => setKtp((prev) => ({ ...prev, [field]: value }));

  const handleScanKtp = async (source: 'camera' | 'library') => {
    const uri = await pickImage(source);
    if (!uri) return;
    setIsScanning(true);
    try {
      const result = await scanKtpWithVisionAi(uri);
      setKtp((prev) => ({
        ...prev,
        nik: result.nik || prev.nik,
        nama: result.nama || prev.nama,
        tempatLahir: result.tempatLahir || prev.tempatLahir,
        tanggalLahir: result.tglLahir || prev.tanggalLahir,
        jenisKelamin: result.jenisKelamin || prev.jenisKelamin,
        alamat: result.alamat || prev.alamat,
        rtRw: result.rtRw || prev.rtRw,
        kelurahan: result.kelurahan || prev.kelurahan,
        kecamatan: result.kecamatan || prev.kecamatan,
        kabupaten: result.kota || prev.kabupaten,
        provinsi: result.provinsi || prev.provinsi,
        agama: result.agama || prev.agama,
        pekerjaan: result.pekerjaan || prev.pekerjaan,
      }));
      if (result.phone) setNoHp(result.phone.replace(/\D/g, ''));
      if (!tpsKelurahan && result.kelurahan) setTpsKelurahan(result.kelurahan);
      setIsEditingKtp(false);
    } catch {
      setDialog({ title: 'Scan KTP Gagal', message: 'Foto KTP belum terbaca. Coba lagi dengan cahaya cukup, atau isi manual.', success: false });
      setIsEditingKtp(true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFacePhoto = async () => {
    const uri = await pickImage('camera');
    if (uri) setFacePhotoUri(uri);
  };

  const validators = [
    () => validateEligibility(form),
    () => validateIdentity(form, new Date()),
    () => validateDeclaration(form),
  ];

  const handleNext = () => {
    const stepErrors = validators[step]();
    setErrors(stepErrors);
    if (hasErrors(stepErrors)) {
      if (step === 1) setIsEditingKtp(true);
      return;
    }
    if (step < STEP_TITLES.length - 1) {
      setStep(step + 1);
      return;
    }
    const result = submit(form);
    if (result.ok) setSubmitted(true);
    setDialog(
      result.ok
        ? { title: result.value.notice.title, message: result.value.notice.body, success: true }
        : { title: 'Pengajuan Belum Terkirim', message: result.error, success: false },
    );
  };

  const renderEligibility = () => (
    <View style={{ gap: spacing.sm }}>
      {ELIGIBILITY_ITEMS.map((item) => (
        <CheckboxRow
          key={item.key}
          checked={eligibility[item.key]}
          onToggle={() => setEligibility((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
          label={item.label}
          description={item.description}
        />
      ))}
      {errors.eligibility ? <Text style={[styles.error, { color: colors.danger }]}>{errors.eligibility}</Text> : null}
    </View>
  );

  const renderIdentity = () => (
    <View style={{ gap: spacing.md }}>
      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Data KTP</Text>
        <View style={styles.scanRow}>
          <PrimaryButton label="Foto KTP" icon="camera" onPress={() => handleScanKtp('camera')} disabled={isScanning} style={{ flex: 1 }} />
          <PrimaryButton label="Dari Galeri" icon="image" variant="secondary" onPress={() => handleScanKtp('library')} disabled={isScanning} style={{ flex: 1 }} />
        </View>
        {isScanning ? (
          <View style={styles.scanning}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.hint, { color: colors.textMuted }]}>Membaca data KTP…</Text>
          </View>
        ) : null}

        {isEditingKtp ? (
          <>
            <Input label="NIK" value={ktp.nik} onChangeText={(v) => updateKtp('nik', v)} keyboardType="number-pad" maxLength={16} error={errors.nik} />
            <Input label="Nama lengkap" value={ktp.nama} onChangeText={(v) => updateKtp('nama', v)} error={errors.nama} />
            <Input label="Tanggal lahir" value={ktp.tanggalLahir} onChangeText={(v) => updateKtp('tanggalLahir', v)} placeholder="12-06-1998" error={errors.tanggalLahir} />
            <Input label="Kelurahan/Desa" value={ktp.kelurahan} onChangeText={(v) => updateKtp('kelurahan', v)} error={errors.kelurahan} />
            <Input label="Kecamatan" value={ktp.kecamatan} onChangeText={(v) => updateKtp('kecamatan', v)} error={errors.kecamatan} />
            <Input label="Kabupaten/Kota" value={ktp.kabupaten} onChangeText={(v) => updateKtp('kabupaten', v)} error={errors.kabupaten} />
          </>
        ) : (
          <View style={{ gap: 4 }}>
            <SummaryRow label="Nama" value={ktp.nama} />
            <SummaryRow label="NIK" value={maskNik(ktp.nik)} />
            <SummaryRow label="Tanggal lahir" value={ktp.tanggalLahir || '-'} />
            <SummaryRow label="Domisili" value={[ktp.kelurahan, ktp.kecamatan, ktp.kabupaten].filter(Boolean).join(', ') || '-'} />
            <Pressable onPress={() => setIsEditingKtp(true)} hitSlop={8}>
              <Text style={[styles.link, { color: colors.primary }]}>Data tidak sesuai? Ubah</Text>
            </Pressable>
          </View>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Kontak & foto wajah</Text>
        <Input label="Nomor HP (WhatsApp)" value={noHp} onChangeText={setNoHp} keyboardType="phone-pad" placeholder="081234567890" error={errors.noHp} />
        <Pressable
          onPress={handleFacePhoto}
          style={({ pressed }) => [styles.faceRow, { borderColor: errors.hasFacePhoto ? colors.danger : colors.border }, pressed && { opacity: 0.8 }]}
        >
          {facePhotoUri ? (
            <Image source={{ uri: facePhotoUri }} style={styles.faceThumb} />
          ) : (
            <View style={[styles.faceThumb, { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }]}>
              <Feather name="user" size={18} color={colors.primary} />
            </View>
          )}
          <Text style={[styles.faceText, { color: colors.text }]}>
            {form.hasFacePhoto ? 'Foto wajah tersimpan — ketuk untuk ulang' : 'Ambil foto wajah'}
          </Text>
        </Pressable>
        {errors.hasFacePhoto ? <Text style={[styles.error, { color: colors.danger }]}>{errors.hasFacePhoto}</Text> : null}
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>TPS yang diinginkan</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>Pilih yang dekat domisili. Keputusan akhir oleh tim pusat.</Text>
        <Input label="Kelurahan TPS" value={tpsKelurahan} onChangeText={setTpsKelurahan} error={errors.tpsKelurahan} />
        <Input label="Nomor TPS (opsional)" value={tpsNumber} onChangeText={setTpsNumber} keyboardType="number-pad" placeholder="Contoh: 017" />
      </Card>
    </View>
  );

  const renderDeclaration = () => (
    <View style={{ gap: spacing.sm }}>
      <Card style={styles.card}>
        <SummaryRow label="Nama" value={ktp.nama} />
        <SummaryRow label="TPS pilihan" value={[tpsNumber && `TPS ${tpsNumber}`, tpsKelurahan].filter(Boolean).join(' · ')} />
      </Card>
      <CheckboxRow
        checked={pledge}
        onToggle={() => setPledge((v) => !v)}
        label="Pakta integritas saksi"
        description="Saya bersedia bertugas jujur, hadir sebelum pemungutan suara dimulai, dan melaporkan hasil sesuai formulir resmi."
        error={errors.integrityPledgeAccepted}
      />
      <CheckboxRow
        checked={consent}
        onToggle={() => setConsent((v) => !v)}
        label="Persetujuan pemrosesan data"
        description="Saya setuju data KTP dan foto saya diproses partai untuk verifikasi saksi (UU PDP No. 27/2022)."
        error={errors.dataConsentAccepted}
      />
    </View>
  );

  const isLastStep = step === STEP_TITLES.length - 1;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 6 }}>
          <Text style={[styles.stepLabel, { color: colors.primary }]}>
            Langkah {step + 1} dari {STEP_TITLES.length}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>{STEP_TITLES[step]}</Text>
          <View style={styles.progressTrack}>
            {STEP_TITLES.map((title, index) => (
              <View key={title} style={[styles.progressBar, { backgroundColor: index <= step ? colors.primary : colors.border }]} />
            ))}
          </View>
        </View>

        {step === 0 ? renderEligibility() : step === 1 ? renderIdentity() : renderDeclaration()}

        <View style={styles.actions}>
          {step > 0 ? (
            <PrimaryButton label="Kembali" variant="secondary" onPress={() => setStep(step - 1)} style={{ flex: 1 }} />
          ) : null}
          <PrimaryButton
            label={isLastStep ? 'Kirim Pengajuan' : 'Lanjut'}
            icon={isLastStep ? 'send' : undefined}
            iconRight={isLastStep ? undefined : 'arrow-right'}
            onPress={handleNext}
            style={{ flex: 2 }}
          />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={dialog !== null}
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        tone={dialog?.success ? 'success' : 'danger'}
        singleButton
        confirmLabel={dialog?.success ? 'Selesai' : 'Tutup'}
        onConfirm={() => {
          const success = dialog?.success;
          setDialog(null);
          if (success) navigation.goBack();
        }}
      />
    </KeyboardAvoidingView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={2}>
        {value || '-'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', padding: spacing.md },
  stepLabel: { fontFamily: fonts.semiBold, fontSize: 12 },
  title: { fontFamily: fonts.bold, fontSize: 18 },
  progressTrack: { flexDirection: 'row', gap: 6 },
  progressBar: { flex: 1, height: 4, borderRadius: 2 },
  card: { gap: spacing.sm },
  cardTitle: { fontFamily: fonts.bold, fontSize: 14 },
  scanRow: { flexDirection: 'row', gap: spacing.sm },
  scanning: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hint: { fontFamily: fonts.regular, fontSize: 12 },
  link: { fontFamily: fonts.semiBold, fontSize: 12, marginTop: 4 },
  error: { fontFamily: fonts.medium, fontSize: 11.5 },
  faceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderRadius: radius.md, padding: spacing.sm },
  faceThumb: { width: 44, height: 44, borderRadius: 22 },
  faceText: { flex: 1, fontFamily: fonts.medium, fontSize: 12.5 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  summaryLabel: { fontFamily: fonts.medium, fontSize: 12 },
  summaryValue: { flex: 1, textAlign: 'right', fontFamily: fonts.semiBold, fontSize: 12.5 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
});
