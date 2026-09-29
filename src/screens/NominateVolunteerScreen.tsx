import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { Card, ConfirmDialog, Input, PrimaryButton } from '../components/ui';
import { fonts, radius, spacing } from '../theme';

/**
 * Daftarkan Relawan Baru (Nominasi)
 *
 * Relawan terdaftar dapat langsung mengajukan/mendaftarkan calon relawan
 * baru di wilayahnya TANPA calon tersebut harus membuat akun terlebih
 * dahulu. Verifikasi data dilakukan sepenuhnya oleh tim pusat via Web
 * Command Center; setelah diverifikasi, kredensial akun (email + password)
 * dikirim otomatis via WhatsApp ke calon relawan — bagian pengiriman
 * kredensial itu sendiri adalah pekerjaan backend/notifikasi, di luar
 * cakupan layar ini (lihat catatan analisis terkait).
 */
export default function NominateVolunteerScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { nominateVolunteerCandidate, nominatedVolunteers } = useApp();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [interest, setInterest] = useState('');
  const [note, setNote] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = 'Nama lengkap wajib diisi';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 9) next.phone = 'Nomor WhatsApp aktif wajib diisi & valid';
    if (!region.trim()) next.region = 'Wilayah (kecamatan/kelurahan) wajib diisi';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    nominateVolunteerCandidate({
      fullName: fullName.trim(),
      phone: phone.trim(),
      region: region.trim(),
      interest: interest.trim() || undefined,
      note: note.trim() || undefined,
    });
    setShowSuccessDialog(true);
  };

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setRegion('');
    setInterest('');
    setNote('');
    setErrors({});
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
              Calon relawan belum perlu membuat akun. Cukup isi data di bawah — tim pusat akan memverifikasi dan
              mengirim akses login secara otomatis via WhatsApp ke calon relawan.
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
            helperText="Kredensial akun akan dikirim ke nomor ini setelah diverifikasi pusat"
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
            placeholder="Contoh: Pengawalan Suara TPS, Logistik"
          />
          <Input
            label="Catatan Tambahan (Opsional)"
            icon="file-text"
            value={note}
            onChangeText={setNote}
            placeholder="Info tambahan untuk tim verifikasi"
            multiline
          />

          <PrimaryButton label="Kirim Pengajuan" icon="send" onPress={handleSubmit} style={{ marginTop: spacing.sm }} />
        </Card>

        {nominatedVolunteers.length > 0 ? (
          <Card style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.historyTitle, { color: colors.text }]}>Pengajuan Saya ({nominatedVolunteers.length})</Text>
            {nominatedVolunteers.map((item) => (
              <View key={item.id} style={[styles.historyRow, { borderColor: colors.border }]}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.historyName, { color: colors.text }]} numberOfLines={1}>
                    {item.fullName}
                  </Text>
                  <Text style={[styles.historyRegion, { color: colors.textMuted }]} numberOfLines={1}>
                    {item.region}
                  </Text>
                </View>
                <View
                  style={[
                    styles.historyBadge,
                    { backgroundColor: (item.status === 'VERIFIED' ? colors.success : item.status === 'REJECTED' ? colors.danger : colors.warning) + '1A' },
                  ]}
                >
                  <Text
                    style={[
                      styles.historyBadgeText,
                      { color: item.status === 'VERIFIED' ? colors.success : item.status === 'REJECTED' ? colors.danger : colors.warning },
                    ]}
                  >
                    {item.status === 'VERIFIED' ? 'Terverifikasi' : item.status === 'REJECTED' ? 'Ditolak' : 'Menunggu Verifikasi'}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        ) : null}
      </ScrollView>

      <ConfirmDialog
        visible={showSuccessDialog}
        title="Pengajuan Terkirim"
        message="Data calon relawan telah dikirim ke tim pusat untuk verifikasi. Status pengajuan dapat dipantau di halaman ini."
        confirmLabel="Selesai"
        tone="success"
        singleButton
        onConfirm={() => {
          setShowSuccessDialog(false);
          resetForm();
          navigation.goBack();
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
});
