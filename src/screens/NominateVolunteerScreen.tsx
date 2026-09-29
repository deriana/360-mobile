import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, Input, PrimaryButton } from '../components/ui';
import { fonts, radius, spacing } from '../theme';
import CheckboxRow from '../core/components/CheckboxRow';
import { FEATURE_FLAGS } from '../core/config/featureFlags';
import { NOMINATION_STATUS_INFO, NominationErrors, useNominations, validateNomination } from '../features/recruitment';

/**
 * Ajak Relawan — daftarkan calon relawan baru.
 *
 * Relawan terdaftar dapat langsung mengajukan/mendaftarkan calon relawan
 * baru di wilayahnya TANPA calon tersebut harus membuat akun terlebih
 * dahulu. Verifikasi data dilakukan sepenuhnya oleh tim pusat via Web
 * Command Center; setelah diverifikasi, kredensial akun (email + password)
 * dikirim otomatis via WhatsApp ke calon relawan — bagian pengiriman
 * kredensial itu sendiri adalah pekerjaan backend/notifikasi, di luar
 * cakupan layar ini.
 *
 * Aturan (siapa boleh mengajak, validasi, batas harian) ada di `src/features/recruitment`.
 */
export default function NominateVolunteerScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { nominations, summary, recruitAccess, submit, simulateReview } = useNominations();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [interest, setInterest] = useState('');
  const [note, setNote] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [errors, setErrors] = useState<NominationErrors>({});
  const [dialog, setDialog] = useState<{ title: string; message: string; success: boolean } | null>(null);

  const form = { fullName, phone, region, interest, note, consentGiven };

  const handleSubmit = () => {
    // Validasi format di layar dulu agar pesan muncul di kolom yang tepat; cek nomor ganda di use case.
    const fieldErrors = validateNomination(form, []);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    const result = submit(form);
    setDialog(
      result.ok
        ? { title: result.value.notice.title, message: result.value.notice.body, success: true }
        : { title: 'Pengajuan Belum Terkirim', message: result.error, success: false },
    );
  };

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setRegion('');
    setInterest('');
    setNote('');
    setConsentGiven(false);
    setErrors({});
  };

  const statusColor = (status: keyof typeof NOMINATION_STATUS_INFO) => {
    const tone = NOMINATION_STATUS_INFO[status].tone;
    return tone === 'done' ? colors.success : tone === 'action' ? colors.danger : colors.warning;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={[styles.introCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.introIconWrap, { backgroundColor: colors.primary + '18' }]}>
            <Feather name="user-plus" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.introTitle, { color: colors.text }]}>Daftarkan Calon Relawan Baru</Text>
            <Text style={[styles.introDesc, { color: colors.textMuted }]}>
              Calon relawan belum perlu membuat akun. Tim pusat memverifikasi lalu mengirim akses login via WhatsApp.
            </Text>
            <Text style={[styles.introMeta, { color: colors.primary }]}>
              {summary.verified} terverifikasi · {summary.pending} menunggu · sisa {recruitAccess.remainingToday} hari ini
            </Text>
          </View>
        </Card>

        <Card style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Input
            label="Nama Lengkap Calon Relawan"
            icon="user"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Contoh: Rina Kusuma Wardani"
            error={errors.fullName}
          />
          <Input
            label="Nomor WhatsApp Aktif"
            icon="phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="08xxxxxxxxxx"
            error={errors.phone}
            helperText="Akses akun dikirim ke nomor ini setelah diverifikasi pusat"
          />
          <Input
            label="Wilayah (Kecamatan / Kelurahan)"
            icon="map-pin"
            value={region}
            onChangeText={setRegion}
            placeholder="Contoh: Kec. Coblong, Kel. Dago"
            error={errors.region}
          />
          <Input
            label="Minat / Keahlian (Opsional)"
            icon="star"
            value={interest}
            onChangeText={setInterest}
            placeholder="Contoh: Dokumentasi, Logistik posko"
          />
          <Input
            label="Catatan Tambahan (Opsional)"
            icon="file-text"
            value={note}
            onChangeText={setNote}
            placeholder="Info tambahan untuk tim verifikasi"
            multiline
          />
          <CheckboxRow
            checked={consentGiven}
            onToggle={() => setConsentGiven((v) => !v)}
            label="Calon sudah setuju didaftarkan"
            description="Calon setuju datanya dikirim ke tim pusat dan dihubungi via WhatsApp (UU PDP No. 27/2022)."
            error={errors.consentGiven}
          />

          <PrimaryButton label="Kirim Pengajuan" icon="send" onPress={handleSubmit} style={{ marginTop: spacing.sm }} />
        </Card>

        {nominations.length > 0 ? (
          <Card style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.historyTitle, { color: colors.text }]}>Pengajuan Saya ({nominations.length})</Text>
            {nominations.map((item) => (
              <View key={item.id} style={[styles.historyRow, { borderColor: colors.border }]}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.historyName, { color: colors.text }]} numberOfLines={1}>
                    {item.fullName}
                  </Text>
                  <Text style={[styles.historyRegion, { color: colors.textMuted }]} numberOfLines={1}>
                    {item.phoneMasked} · {item.region}
                  </Text>
                  {item.reviewNote ? (
                    <Text style={[styles.historyRegion, { color: colors.danger }]} numberOfLines={2}>
                      {item.reviewNote}
                    </Text>
                  ) : null}
                  {FEATURE_FLAGS.demoControls && item.status === 'PENDING_VERIFICATION' ? (
                    <View style={styles.demoRow}>
                      <Text style={[styles.demoLabel, { color: colors.textMuted }]}>Demo:</Text>
                      <Text style={[styles.demoLink, { color: colors.success }]} onPress={() => simulateReview(item.id, 'VERIFIED')}>
                        Verifikasi
                      </Text>
                      <Text style={[styles.demoLink, { color: colors.danger }]} onPress={() => simulateReview(item.id, 'REJECTED')}>
                        Tolak
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={[styles.historyBadge, { backgroundColor: statusColor(item.status) + '1A' }]}>
                  <Text style={[styles.historyBadgeText, { color: statusColor(item.status) }]}>
                    {NOMINATION_STATUS_INFO[item.status].label}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        ) : null}
      </ScrollView>

      <ConfirmDialog
        visible={dialog !== null}
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        confirmLabel={dialog?.success ? 'Selesai' : 'Tutup'}
        tone={dialog?.success ? 'success' : 'danger'}
        singleButton
        onConfirm={() => {
          const success = dialog?.success;
          setDialog(null);
          if (success) {
            resetForm();
            navigation.goBack();
          }
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  introCard: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
  introIconWrap: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  introTitle: { fontFamily: fonts.bold, fontSize: 14, marginBottom: 3 },
  introDesc: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17 },
  introMeta: { fontFamily: fonts.semiBold, fontSize: 11.5, marginTop: 6 },
  formCard: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm },
  historyCard: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, gap: spacing.xs },
  historyTitle: { fontFamily: fonts.bold, fontSize: 13, marginBottom: spacing.xs },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  historyName: { fontFamily: fonts.semiBold, fontSize: 12.5 },
  historyRegion: { fontFamily: fonts.regular, fontSize: 10.5 },
  historyBadge: { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  historyBadgeText: { fontFamily: fonts.semiBold, fontSize: 9.5 },
  demoRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 2 },
  demoLabel: { fontFamily: fonts.medium, fontSize: 10.5 },
  demoLink: { fontFamily: fonts.semiBold, fontSize: 10.5, textDecorationLine: 'underline' },
});
