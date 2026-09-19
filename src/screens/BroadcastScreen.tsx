import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, EmptyState, Pill, PrimaryButton } from '../components/ui';
import { fonts, fontSize, radius, spacing, iconStrokeWidth } from '../theme';
import { Broadcast, Role } from '../types';

type FilterCategory = 'ALL' | 'DPP' | 'BSN' | 'KORLAP';

export default function BroadcastScreen() {
  const { broadcasts, addBroadcast, role } = useApp();
  const { colors, isDark } = useTheme();

  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('ALL');
  const [acknowledgedIds, setAcknowledgedIds] = useState<Record<string, string>>({
    'BC-001': '08:15 WIB',
  });

  // Modal Kirim Siaran
  const [showSendModal, setShowSendModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTargetRole, setNewTargetRole] = useState<Role>('TPS_WITNESS');
  const [newTargetRegion, setNewTargetRegion] = useState('Dapil Jabar I');

  const canSendBroadcast =
    role === 'TPS_COORDINATOR' ||
    role === 'FIELD_COORDINATOR' ||
    role === 'OPERATOR' ||
    role === 'DPD' ||
    role === 'DPP' ||
    role === 'WITNESS' ||
    role === 'TPS_WITNESS';

  const handleAcknowledge = (id: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    setAcknowledgedIds((prev) => ({ ...prev, [id]: timeStr }));
  };

  const handleSendBroadcast = () => {
    if (!newTitle.trim() || !newBody.trim()) {
      Alert.alert('Form Belum Lengkap', 'Harap isi judul dan pesan instruksi siaran.');
      return;
    }

    addBroadcast({
      title: newTitle.trim(),
      body: newBody.trim(),
      targetRoles: [newTargetRole],
      targetRegions: [newTargetRegion],
      sentBy: role === 'TPS_COORDINATOR' || role === 'FIELD_COORDINATOR' ? 'Koordinator Lapangan' : 'Pusat Komando BSN',
    });

    setNewTitle('');
    setNewBody('');
    setShowSendModal(false);
    Alert.alert('Siaran Terkirim', 'Instruksi komando berhasil dipancarkan ke seluruh personel target wilayah.');
  };

  const filteredBroadcasts = broadcasts.filter((b) => {
    if (selectedFilter === 'DPP') {
      return b.sentBy.toLowerCase().includes('dpp') || b.sentBy.toLowerCase().includes('ketua umum');
    }
    if (selectedFilter === 'BSN') {
      return b.sentBy.toLowerCase().includes('bsn');
    }
    if (selectedFilter === 'KORLAP') {
      return b.sentBy.toLowerCase().includes('koordinator') || b.sentBy.toLowerCase().includes('korlap');
    }
    return true;
  });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* 1. Header Pusat Komando Siaran */}
      <View
        style={[
          styles.commandHeader,
          {
            backgroundColor: isDark ? '#08172E' : '#002B52',
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.commandHeaderTop}>
          <View style={styles.transmitterBadge}>
            <View style={styles.livePulseDot} />
            <Text style={styles.transmitterText}>BSN GATEWAY SATELLITE ONLINE</Text>
          </View>
          <Pill label={`${broadcasts.length} SIARAN`} tone="primary" />
        </View>

        <View style={{ gap: 2 }}>
          <Text style={styles.headerTitle}>Pusat Siaran Komando Wilayah</Text>
          <Text style={styles.headerSubtitle}>
            Transmisi instruksi resmi Ketua Umum, BSN PAN Nasional, dan Koordinator Lapangan.
          </Text>
        </View>

        {/* Quick Send CTA Button */}
        {canSendBroadcast && (
          <TouchableOpacity
            onPress={() => setShowSendModal(true)}
            style={styles.headerActionBtn}
            activeOpacity={0.85}
          >
            <Feather name="send" size={13} color="#FFFFFF" />
            <Text style={styles.headerActionBtnText}>Pancarkan Instruksi Komando Baru</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Filter Bar Channels */}
      <View style={styles.filterRow}>
        <FilterChip
          label="Semua Siaran"
          icon="layers"
          selected={selectedFilter === 'ALL'}
          onPress={() => setSelectedFilter('ALL')}
          colors={colors}
        />
        <FilterChip
          label="Ketua Umum / DPP"
          icon="award"
          selected={selectedFilter === 'DPP'}
          onPress={() => setSelectedFilter('DPP')}
          colors={colors}
        />
        <FilterChip
          label="Siaga BSN"
          icon="shield"
          selected={selectedFilter === 'BSN'}
          onPress={() => setSelectedFilter('BSN')}
          colors={colors}
        />
        <FilterChip
          label="Korlap Wilayah"
          icon="users"
          selected={selectedFilter === 'KORLAP'}
          onPress={() => setSelectedFilter('KORLAP')}
          colors={colors}
        />
      </View>

      {/* 3. Broadcast Feed List */}
      {filteredBroadcasts.length === 0 ? (
        <EmptyState
          title="Tidak Ada Siaran"
          body="Belum ada pesan siaran atau instruksi pimpinan pada kategori yang dipilih."
          icon="radio"
        />
      ) : (
        <FlatList
          data={filteredBroadcasts}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isAcknowledged = !!acknowledgedIds[item.id];
            const isDpp = item.sentBy.toLowerCase().includes('dpp') || item.sentBy.toLowerCase().includes('ketua umum');
            const isBsn = item.sentBy.toLowerCase().includes('bsn');

            return (
              <Card
                style={[
                  styles.broadcastCard,
                  {
                    borderColor: isDpp ? '#E60012' : isBsn ? colors.primary : colors.border,
                    borderLeftWidth: 4,
                  },
                ]}
              >
                {/* Header Row */}
                <View style={styles.cardHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                    <View
                      style={[
                        styles.senderIconBox,
                        {
                          backgroundColor: isDpp
                            ? 'rgba(230,0,18,0.12)'
                            : isBsn
                            ? 'rgba(0,102,179,0.12)'
                            : 'rgba(16,185,129,0.12)',
                        },
                      ]}
                    >
                      <Feather
                        name={isDpp ? 'award' : isBsn ? 'shield' : 'radio'}
                        size={14}
                        color={isDpp ? '#E60012' : isBsn ? colors.primary : '#10B981'}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.senderName, { color: colors.text }]} numberOfLines={1}>
                        {item.sentBy}
                      </Text>
                      <Text style={[styles.timestampText, { color: colors.textMuted }]}>
                        {item.sentAt}
                      </Text>
                    </View>
                  </View>

                  <Pill
                    label={isDpp ? 'INSTRUKSI KHUSUS' : isBsn ? 'SIAGA NASIONAL' : 'KOMANDO WILAYAH'}
                    tone={isDpp ? 'danger' : isBsn ? 'primary' : 'success'}
                  />
                </View>

                {/* Content Title & Body */}
                <View style={{ gap: 4 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.cardBody, { color: colors.textMuted }]}>{item.body}</Text>
                </View>

                {/* Scope Badges */}
                <View style={[styles.scopeRow, { borderTopColor: colors.border }]}>
                  <View style={styles.scopeBadge}>
                    <Feather name="map-pin" size={11} color={colors.primary} />
                    <Text style={[styles.scopeBadgeText, { color: colors.textMuted }]}>
                      {item.targetRegions?.join(' | ') || 'Seluruh Indonesia'}
                    </Text>
                  </View>
                  <View style={styles.scopeBadge}>
                    <Feather name="target" size={11} color="#6366F1" />
                    <Text style={[styles.scopeBadgeText, { color: colors.textMuted }]}>
                      {item.targetRoles?.join(', ') || 'Semua Peran'}
                    </Text>
                  </View>
                </View>

                {/* Footer Action: Acknowledge */}
                <View style={styles.cardFooter}>
                  {isAcknowledged ? (
                    <View style={styles.acknowledgedBadge}>
                      <Feather name="check-circle" size={13} color="#16A34A" />
                      <Text style={styles.acknowledgedText}>
                        Dikonfirmasi Diterima: {acknowledgedIds[item.id]}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleAcknowledge(item.id)}
                      style={[styles.ackButton, { backgroundColor: isDark ? 'rgba(0,102,179,0.15)' : '#EFF6FF', borderColor: colors.primary }]}
                      activeOpacity={0.8}
                    >
                      <Feather name="check" size={13} color={colors.primary} />
                      <Text style={[styles.ackButtonText, { color: colors.primary }]}>
                        Konfirmasi Penerimaan Instruksi
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            );
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: KIRIM SIARAN INSTRUKSI KOMANDO BARU                                */}
      {/* ========================================================================= */}
      <Modal visible={showSendModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ gap: 2, flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Pancarkan Siaran Baru</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                  Instruksi Resmi Pusat Komando BSN PAN Lapangan
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowSendModal(false)}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10, marginVertical: 8 }}>
              <View style={{ gap: 4 }}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Judul Instruksi Siaran:</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Mis: Siaga Penuh Penghitungan C1 Plano Sore Ini"
                  placeholderTextColor={colors.textMuted}
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Isi Pesan Instruksi:</Text>
                <TextInput
                  style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Tuliskan petunjuk teknis, arahan pengamanan suara, atau protokol darurat..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  value={newBody}
                  onChangeText={setNewBody}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Wilayah Sasaran:</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  value={newTargetRegion}
                  onChangeText={setNewTargetRegion}
                  placeholder="Mis: Dapil Jabar I, Seluruh Indonesia"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.sm }}>
              <PrimaryButton
                label="Batal"
                variant="secondary"
                onPress={() => setShowSendModal(false)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                label="Transmisikan Pesan"
                icon="send"
                onPress={handleSendBroadcast}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FilterChip({
  label,
  icon,
  selected,
  onPress,
  colors,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  selected: boolean;
  onPress: () => void;
  colors: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterChip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      <Feather
        name={icon}
        size={12}
        color={selected ? '#FFFFFF' : colors.textMuted}
        strokeWidth={iconStrokeWidth}
      />
      <Text
        style={[
          styles.filterChipText,
          { color: selected ? '#FFFFFF' : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.md, gap: spacing.sm },

  // Command Header
  commandHeader: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  commandHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transmitterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  transmitterText: {
    fontSize: 9.5,
    fontFamily: fonts.bold,
    color: '#34D399',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#BAE6FD',
    lineHeight: 15,
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E60012',
    paddingVertical: 8,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  headerActionBtnText: {
    fontSize: 11.5,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },

  // Filters
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
    fontFamily: fonts.medium,
  },

  // Cards
  broadcastCard: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  senderIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderName: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
  },
  timestampText: {
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    lineHeight: 19,
  },
  cardBody: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  scopeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  scopeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scopeBadgeText: {
    fontSize: 10.5,
    fontFamily: fonts.medium,
  },
  cardFooter: {
    marginTop: 4,
  },
  acknowledgedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(22,163,74,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  acknowledgedText: {
    fontSize: 10.5,
    fontFamily: fonts.bold,
    color: '#15803D',
  },
  ackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  ackButtonText: {
    fontSize: 11,
    fontFamily: fonts.bold,
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
  inputLabel: {
    fontSize: 11.5,
    fontFamily: fonts.bold,
  },
  textInput: {
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: 9,
    fontSize: 11.5,
    fontFamily: fonts.regular,
  },
  textArea: {
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: 9,
    fontSize: 11.5,
    fontFamily: fonts.regular,
    height: 75,
    textAlignVertical: 'top',
  },
});
