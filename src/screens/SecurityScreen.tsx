import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, Pill } from '../components/ui';
import { fonts, fontSize, radius, spacing } from '../theme';
import { maskNik, maskPhone } from '../utils/masking';

interface DeviceSession {
  id: string;
  name: string;
  model: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function SecurityScreen({ navigation }: any) {
  const { currentUser } = useApp();
  const { colors, isDark } = useTheme();

  // Settings State
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [pinOnReportEnabled, setPinOnReportEnabled] = useState(true);
  const [offlineEncryptionEnabled, setOfflineEncryptionEnabled] = useState(true);

  // Dialog State
  const [confirmRevokeVisible, setConfirmRevokeVisible] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const user = currentUser.identity;

  const activeSessions: DeviceSession[] = [
    {
      id: 'dev-1',
      name: 'Samsung Galaxy A54 (Perangkat Ini)',
      model: 'SM-A546E • Android 14',
      location: 'Coblong, Kota Bandung',
      lastActive: 'Aktif Sekarang',
      isCurrent: true,
    },
    {
      id: 'dev-2',
      name: 'Redmi Note 12',
      model: '22111317G • Android 13',
      location: 'Dago, Kota Bandung',
      lastActive: '16 Sep 2026, 14:20 WIB',
      isCurrent: false,
    },
  ];

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. STATUS PROTEKSI KEAMANAN AKUN */}
      <View
        style={[
          styles.statusBanner,
          {
            backgroundColor: isDark ? 'rgba(5, 150, 105, 0.15)' : '#F0FDF4',
            borderColor: isDark ? 'rgba(5, 150, 105, 0.3)' : '#BBF7D0',
          },
        ]}
      >
        <View style={[styles.statusIconWrap, { backgroundColor: '#059669' }]}>
          <Feather name="shield" size={18} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[styles.statusTitle, { color: isDark ? '#34D399' : '#14532D' }]}>
              Proteksi Akun Aktif
            </Text>
            <View style={styles.verifiedBadge}>
              <Feather name="check" size={11} color="#059669" />
              <Text style={styles.verifiedBadgeText}>Aman</Text>
            </View>
          </View>
          <Text style={[styles.statusDesc, { color: isDark ? '#A7F3D0' : '#166534' }]}>
            Enkripsi AES-256 GCM • Sesuai UU PDP No. 27/2022
          </Text>
        </View>
      </View>

      {/* 2. PROTEKSI AKSES APLIKASI (BAB 25) */}
      <Card style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Autentikasi & Kunci Aplikasi</Text>
          <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
            Proteksi akses saat perangkat digunakan di area penugasan lapangan
          </Text>
        </View>

        <View style={styles.settingRow}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(0, 66, 128, 0.3)' : '#F0F7FF' }]}>
            <Feather name="lock" size={16} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Kunci Biometrik (Fingerprint / Face ID)</Text>
            <Text style={[styles.settingSub, { color: colors.textMuted }]}>Kunci aplikasi saat tidak digunakan</Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={setBiometricEnabled}
            trackColor={{ false: isDark ? '#334155' : '#E2E8F0', true: colors.primary }}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.settingRow}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(217, 119, 6, 0.15)' : '#FFFBEB' }]}>
            <Feather name="shield" size={16} color="#D97706" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Verifikasi PIN Saat Kirim C1</Text>
            <Text style={[styles.settingSub, { color: colors.textMuted }]}>Konfirmasi keamanan aksi berisiko tinggi</Text>
          </View>
          <Switch
            value={pinOnReportEnabled}
            onValueChange={setPinOnReportEnabled}
            trackColor={{ false: isDark ? '#334155' : '#E2E8F0', true: colors.primary }}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Pressable
          onPress={() => setNoticeMessage('Fitur Ubah PIN Pengamanan: PIN saat ini aktif. Masukkan 6 digit PIN lama Anda untuk memperbarui.')}
          style={({ pressed }) => [styles.actionLinkRow, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF' }]}>
            <Feather name="key" size={16} color="#4F46E5" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Ubah 6-Digit PIN Petugas</Text>
            <Text style={[styles.settingSub, { color: colors.textMuted }]}>Terakhir diperbarui: 01 September 2026</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </Pressable>
      </Card>

      {/* 3. PRIVASI & MINIMALISASI DATA SENSITIF (BAB 24) */}
      <Card style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Privasi & Perlindungan Data</Text>
          <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
            Penerapan penyandian identitas sesuai regulasi UU PDP
          </Text>
        </View>

        <View style={styles.dataPolicyRow}>
          <View style={styles.dataPolicyLeft}>
            <View style={[styles.miniIconBox, { backgroundColor: isDark ? 'rgba(5,150,105,0.15)' : '#ECFDF5' }]}>
              <Feather name="eye-off" size={13} color="#059669" />
            </View>
            <Text style={[styles.dataPolicyText, { color: colors.text }]}>Penyandian NIK</Text>
          </View>
          <Text style={[styles.dataPolicyValue, { color: colors.textMuted }]}>
            {maskNik(user.nikFull || user.nikMasked)}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.dataPolicyRow}>
          <View style={styles.dataPolicyLeft}>
            <View style={[styles.miniIconBox, { backgroundColor: isDark ? 'rgba(5,150,105,0.15)' : '#ECFDF5' }]}>
              <Feather name="phone" size={13} color="#059669" />
            </View>
            <Text style={[styles.dataPolicyText, { color: colors.text }]}>Penyandian Nomor Ponsel</Text>
          </View>
          <Text style={[styles.dataPolicyValue, { color: colors.textMuted }]}>
            {maskPhone(user.phone)}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.settingRow}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(0, 66, 128, 0.3)' : '#F0F7FF' }]}>
            <Feather name="database" size={16} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Enkripsi Dokumen & Cache Lokal</Text>
            <Text style={[styles.settingSub, { color: colors.textMuted }]}>Draft C1 terenkripsi aman di perangkat</Text>
          </View>
          <Switch
            value={offlineEncryptionEnabled}
            onValueChange={setOfflineEncryptionEnabled}
            trackColor={{ false: isDark ? '#334155' : '#E2E8F0', true: colors.primary }}
          />
        </View>
      </Card>

      {/* 4. SESI & MANAJEMEN PERANGKAT TERDAFTAR (BAB 24 & 25) */}
      <Card style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={styles.cardHeader}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Perangkat & Sesi Terdaftar</Text>
            <Text style={[styles.sectionSub, { color: colors.textMuted }]}>Akses aktif akun pada perangkat petugas</Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: isDark ? 'rgba(0, 66, 128, 0.35)' : '#F0F7FF', borderColor: colors.primary }]}>
            <Text style={[styles.countBadgeText, { color: colors.primary }]}>{activeSessions.length} Perangkat</Text>
          </View>
        </View>

        <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
          {activeSessions.map((session) => (
            <View
              key={session.id}
              style={[
                styles.sessionCard,
                {
                  backgroundColor: session.isCurrent
                    ? isDark
                      ? 'rgba(0, 66, 128, 0.3)'
                      : '#F0F9FF'
                    : isDark
                      ? 'rgba(255, 255, 255, 0.03)'
                      : '#F8FAFC',
                  borderColor: session.isCurrent ? colors.primary : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.sessionIconBox,
                  {
                    backgroundColor: session.isCurrent ? colors.primary : isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                  },
                ]}
              >
                <Feather
                  name={session.isCurrent ? 'smartphone' : 'monitor'}
                  size={16}
                  color={session.isCurrent ? '#FFFFFF' : colors.textMuted}
                />
              </View>

              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={[styles.sessionName, { color: colors.text }]}>{session.name}</Text>
                  {session.isCurrent && (
                    <View style={styles.currentDeviceTag}>
                      <Text style={styles.currentDeviceTagText}>Perangkat Ini</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.sessionDetails, { color: colors.textMuted }]}>
                  {session.model} • {session.location}
                </Text>
                <Text style={[styles.sessionTime, { color: session.isCurrent ? colors.primary : colors.textMuted }]}>
                  {session.lastActive}
                </Text>
              </View>

              {!session.isCurrent && (
                <Pressable
                  onPress={() => setConfirmRevokeVisible(true)}
                  style={({ pressed }) => [
                    styles.revokeBtn,
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <Feather name="trash-2" size={12} color="#DC2626" />
                  <Text style={styles.revokeBtnText}>Cabut</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </Card>

      {/* Notice Dialog */}
      <ConfirmDialog
        visible={Boolean(noticeMessage)}
        title="Pengaturan Keamanan"
        message={noticeMessage || ''}
        tone="primary"
        singleButton
        confirmLabel="Mengerti"
        onConfirm={() => setNoticeMessage(null)}
      />

      {/* Revoke Confirmation Dialog */}
      <ConfirmDialog
        visible={confirmRevokeVisible}
        title="Cabut Akses Perangkat"
        message="Apakah Anda yakin ingin mengeluarkan akun dari perangkat Redmi Note 12? Perangkat tersebut harus masuk kembali dengan kode OTP resmi."
        tone="danger"
        confirmLabel="Ya, Cabut Sesi"
        cancelLabel="Batal"
        onConfirm={() => {
          setConfirmRevokeVisible(false);
          setNoticeMessage('Sesi perangkat Redmi Note 12 berhasil dicabut. Akses akun pada perangkat tersebut telah dinonaktifkan.');
        }}
        onCancel={() => setConfirmRevokeVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },

  // Status Banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  statusIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  statusDesc: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 15,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  verifiedBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    color: '#15803D',
  },

  // Section Cards
  sectionCard: {
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  cardHeader: {
    gap: 2,
    marginBottom: 2,
  },
  sectionHeading: {
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  sectionSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
  },

  // Rows & Settings
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  actionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  settingSub: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },
  divider: {
    height: 1,
    opacity: 0.6,
  },

  // Data Policy Rows
  dataPolicyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dataPolicyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dataPolicyText: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  dataPolicyValue: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.3,
  },

  // Count Badge
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  countBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
  },

  // Session Cards
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  sessionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionName: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  currentDeviceTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
  },
  currentDeviceTagText: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    color: '#1D4ED8',
  },
  sessionDetails: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },
  sessionTime: {
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  revokeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  revokeBtnText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#DC2626',
  },
});

