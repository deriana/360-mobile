import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { EmptyState, Pill, PrimaryButton, Card, DropdownPicker, Modal } from '../components/ui';
import { fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { EmergencyCategory, EmergencyReport, EmergencySeverity, EmergencyStatus } from '../types';
import { ROLE_PERMISSIONS, scopeTps } from '../utils/scope';

const CATEGORY_LABEL: Record<EmergencyCategory, string> = {
  intimidation: 'Intimidasi Saksi',
  unrest: 'Kerusuhan',
  ballot_shortage: 'Kekurangan Surat Suara',
  violation: 'Pelanggaran Prosedur',
  vote_buying: 'Politik Uang',
  security_disturbance: 'Gangguan Keamanan',
};
const SEVERITY_TONE: Record<EmergencySeverity, 'danger' | 'warning' | 'info'> = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
};
const STATUS_LABEL: Record<EmergencyStatus, string> = {
  open: 'Terbuka',
  investigating: 'Diselidiki',
  resolved: 'Selesai',
};

const NAV_CLEARANCE = spacing.xl;

export default function EmergencyListScreen({ navigation }: any) {
  const { role, emergencyReports, tps, witnesses } = useApp();
  const { colors } = useTheme();

  const permissions = ROLE_PERMISSIONS[role];
  const [tpsFilter, setTpsFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<EmergencyReport | null>(null);
  const [previewSource, setPreviewSource] = useState<any>(null);

  const scopedTps = scopeTps(role, tps, witnesses);
  const clusterTpsIds = new Set(scopedTps.map((t) => t.id));

  const scopedReports = emergencyReports.filter((r) => !r.tpsId || clusterTpsIds.has(r.tpsId));
  const filteredReports = tpsFilter === 'all' ? scopedReports : scopedReports.filter((r) => r.tpsId === tpsFilter);

  const tpsOptions = useMemo(
    () => [
      { label: 'Semua TPS di Cakupan Anda', value: 'all' },
      ...scopedTps.map((t) => ({ label: `TPS ${t.tpsNumber} — Kec. ${t.district}`, value: t.id })),
    ],
    [scopedTps],
  );

  if (!permissions.canAccessEmergencyList) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, padding: spacing.lg, paddingBottom: NAV_CLEARANCE }]}>
        <EmptyState
          title="Akses Terbatas Monitoring"
          body="Saksi TPS dapat melaporkan kendala atau kejadan darurat secara langsung melalui tombol 'Formulir Lapor Kejadian TPS'."
          icon="alert-triangle"
          actionLabel="Buka Formulir Laporan"
          onAction={() => navigation.navigate('EmergencyForm')}
        />
      </View>
    );
  }

  const selectedTps = selectedReport ? tps.find((t) => t.id === selectedReport.tpsId) : null;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Laporan Darurat</Text>
        <PrimaryButton label="Buat Laporan" icon="plus" onPress={() => navigation.navigate('EmergencyForm')} fullWidth={false} />
      </View>

      {scopedTps.length > 1 && (
        <DropdownPicker
          label="Filter TPS"
          icon="map-pin"
          value={tpsFilter}
          options={tpsOptions}
          onSelect={setTpsFilter}
          style={{ marginBottom: spacing.md }}
        />
      )}

      {filteredReports.length === 0 ? (
        <EmptyState
          title="Belum Ada Laporan Darurat"
          body="Situasi aman. Belum ada laporan darurat yang tercatat di cakupan TPS Anda."
          icon="shield"
        />
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: NAV_CLEARANCE }}
          renderItem={({ item }) => {
            const itemTps = tps.find((t) => t.id === item.tpsId);
            return (
              <Card style={styles.cardItem} onPress={() => setSelectedReport(item)}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.category, { color: colors.text }]}>{CATEGORY_LABEL[item.category]}</Text>
                  <Pill label={item.severity.toUpperCase()} tone={SEVERITY_TONE[item.severity]} />
                </View>
                <Text style={[styles.desc, { color: colors.textMuted }]} numberOfLines={2}>{item.description}</Text>
                <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.meta, { color: colors.textMuted }]}>
                    {itemTps ? `TPS ${itemTps.tpsNumber} • ${itemTps.district}` : 'Lokasi Umum'} • {item.createdAt}
                  </Text>
                  <Pill label={STATUS_LABEL[item.status]} tone="info" />
                </View>
              </Card>
            );
          }}
        />
      )}

      <Modal
        visible={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={selectedReport ? CATEGORY_LABEL[selectedReport.category] : ''}
        subtitle={selectedReport?.id}
      >
        {selectedReport && (
          <View style={{ gap: spacing.sm }}>
            <View style={styles.detailBadgeRow}>
              <Pill label={selectedReport.severity.toUpperCase()} tone={SEVERITY_TONE[selectedReport.severity]} />
              <Pill label={STATUS_LABEL[selectedReport.status]} tone="info" />
            </View>

            <Text style={[styles.detailDesc, { color: colors.text }]}>{selectedReport.description}</Text>

            <View style={[styles.detailInfoBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <DetailRow icon="map-pin" label="Lokasi TPS" value={selectedTps ? `TPS ${selectedTps.tpsNumber} — Kec. ${selectedTps.district}, ${selectedTps.regency}` : 'Lokasi Umum'} />
              <DetailRow icon="user" label="Dilaporkan Oleh" value={selectedReport.reportedBy} />
              <DetailRow icon="clock" label="Waktu Laporan" value={selectedReport.createdAt} />
            </View>

            {selectedReport.photos && selectedReport.photos.length > 0 && (
              <View style={{ gap: spacing.xs }}>
                <Text style={[styles.photosLabel, { color: colors.textMuted }]}>
                  Foto Bukti Lapangan ({selectedReport.photos.length})
                </Text>
                <View style={styles.photosGrid}>
                  {selectedReport.photos.map((photo, photoIdx) => (
                    <Pressable key={photoIdx} onPress={() => setPreviewSource(photo)} style={styles.photoThumbWrap}>
                      <Image source={photo} style={styles.photoThumb} resizeMode="cover" />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </Modal>

      <Modal visible={!!previewSource} onClose={() => setPreviewSource(null)} variant="floating" title="Pratinjau Foto">
        {previewSource && (
          <View style={styles.previewImageWrap}>
            <Image source={previewSource} style={styles.previewImage} resizeMode="contain" />
          </View>
        )}
      </Modal>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.detailRow}>
      <Feather name={icon} size={14} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
      <Text style={[styles.detailRowLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailRowValue, { color: colors.text }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  title: { fontSize: fontSize.xl, fontWeight: '800' },
  cardItem: { gap: spacing.xs },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { fontSize: fontSize.sm, fontWeight: '700' },
  desc: { fontSize: fontSize.xs, lineHeight: 18 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.xs, borderTopWidth: 0.5, marginTop: 4 },
  meta: { fontSize: fontSize.xs },
  detailBadgeRow: { flexDirection: 'row', gap: spacing.xs },
  detailDesc: { fontSize: fontSize.sm, lineHeight: 20 },
  detailInfoBox: { borderWidth: 1, borderRadius: radius.md, padding: spacing.sm, gap: spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  detailRowLabel: { fontSize: fontSize.xs, width: 92 },
  detailRowValue: { fontSize: fontSize.xs, fontWeight: '700', flex: 1 },
  photosLabel: { fontSize: fontSize.xs, fontWeight: '700' },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoThumbWrap: { width: 92, height: 92, borderRadius: radius.md, overflow: 'hidden' },
  photoThumb: { width: '100%', height: '100%' },
  previewImageWrap: { width: '100%', aspectRatio: 1, borderRadius: radius.md, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
});
