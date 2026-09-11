import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fontSize, radius, spacing } from '../theme';
import { MOCK_BACALEG_DATA } from '../data/simpan';

export default function SimpanBacalegScreen() {
  const { colors } = useTheme();
  const data = MOCK_BACALEG_DATA;
  const [submitting, setSubmitting] = useState(false);

  const handleAjukan = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert('Pendaftaran Terkirim', 'Berkas pencalonan legislatif Anda sedang ditinjau oleh Komite Pemenangan Pemilu Nasional (KPPN) PAN.');
    }, 1000);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Pendaftaran Bacaleg simPAN</Text>
        <Text style={[styles.subTitle, { color: colors.textMuted }]}>
          Portal pendaftaran dan verifikasi berkas Bakal Calon Anggota Legislatif Partai Amanat Nasional.
        </Text>
      </View>

      {/* Candidate Status Summary */}
      <Card style={{ gap: spacing.sm, backgroundColor: '#004F8A' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={styles.badgeReg}>
            <Text style={styles.badgeRegText}>{data.idRegistrasi}</Text>
          </View>
          <Pill label="Berkas Lengkap" tone="success" icon="check-circle" />
        </View>

        <View style={{ gap: 2 }}>
          <Text style={{ fontSize: fontSize.lg, fontWeight: '900', color: '#FFFFFF' }}>{data.namaKader}</Text>
          <Text style={{ fontSize: 11, color: '#38BDF8', fontWeight: '700' }}>No. KTA: {data.noKta}</Text>
        </View>

        <View style={styles.dapilBox}>
          <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>Pencalonan / Daerah Pemilihan:</Text>
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>
            {data.tingkatPencalonan} — {data.dapil}
          </Text>
          <Text style={{ fontSize: 10, color: '#FCD34D', fontWeight: '700', marginTop: 2 }}>
            Rekomendasi Nomor Urut: #{data.nomorUrutRekomendasi}
          </Text>
        </View>
      </Card>

      {/* Checklist Berkas KPU / Internal */}
      <Card style={{ gap: spacing.sm }}>
        <SectionTitle style={{ marginBottom: 0 }}>Kelengkapan Berkas Persyaratan</SectionTitle>
        <Text style={{ fontSize: 11, color: colors.textMuted }}>
          7 dari 7 dokumen wajib telah lolos audit verifikasi KPPN & DPP PAN.
        </Text>

        {data.berkas.map((item, idx) => (
          <View key={item.id} style={[styles.berkasItem, { borderBottomColor: colors.border }]}>
            <View style={[styles.numBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.numText, { color: colors.primary }]}>{idx + 1}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.docName, { color: colors.text }]}>{item.namaDokumen}</Text>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>Diupload: {item.tglUpload}</Text>
            </View>
            <Pill label="Lolos" tone="success" icon="check" />
          </View>
        ))}
      </Card>

      <PrimaryButton
        label="Perbarui Berkas / Ajukan Ulang"
        icon="upload"
        variant="secondary"
        loading={submitting}
        onPress={handleAjukan}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  header: { gap: 2 },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  subTitle: { fontSize: fontSize.xs },
  badgeReg: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  badgeRegText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', fontFamily: 'monospace' },
  dapilBox: { backgroundColor: 'rgba(0,0,0,0.15)', padding: spacing.sm, borderRadius: radius.md, gap: 2 },
  berkasItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: 0.5 },
  numBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  numText: { fontSize: 10, fontWeight: '800' },
  docName: { fontSize: fontSize.xs, fontWeight: '700' },
});
