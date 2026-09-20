import React from 'react';
import {
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { fonts, radius, spacing } from '../../theme';
import { Pill, PrimaryButton } from '../ui';
import { PoskoLocation } from '../../data/gisRegionalData';
import { KantorSekretariat } from '../../data/simpan';

interface PoskoActionSheetProps {
  visible: boolean;
  onClose: () => void;
  posko: PoskoLocation | null;
  office: KantorSekretariat | null;
}

export default function PoskoActionSheet({
  visible,
  onClose,
  posko,
  office,
}: PoskoActionSheetProps) {
  const { colors, isDark } = useTheme();

  if (!posko && !office) return null;

  const isOffice = !!office;
  const title = isOffice ? office.namaKantor : posko!.name;
  const category = isOffice ? `Sekretariat Resmi (${office.tingkat})` : posko!.categoryLabel;
  const address = isOffice ? office.alamat : posko!.address;
  const city = isOffice ? `${office.kota}, ${office.provinsi}` : `${posko!.district}, ${posko!.regency}`;
  const phone = isOffice ? (office.whatsapp || office.telepon) : (posko!.phone || '0812-9900-1122');
  const pic = isOffice ? `${office.kepalaSekretariat} (${office.jabatanKepala})` : posko!.picName;
  const lat = isOffice ? office.lat : posko!.lat;
  const lng = isOffice ? office.lng : posko!.lng;

  // Buka Google Maps / Apple Maps dengan koordinat presisi
  const handleOpenDirections = () => {
    const scheme = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(title)}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${encodeURIComponent(title)})`,
    });
    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    
    Linking.canOpenURL(scheme || fallbackUrl)
      .then((supported) => {
        if (supported && scheme) {
          Linking.openURL(scheme);
        } else {
          Linking.openURL(fallbackUrl);
        }
      })
      .catch(() => {
        Linking.openURL(fallbackUrl);
      });
  };

  // Hubungi PIC / Hotline via WhatsApp atau Telepon
  const handleContactHotline = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
    const waUrl = `whatsapp://send?phone=${intlPhone}&text=${encodeURIComponent(`Halo, saya kader/relawan PAN ingin koordinasi terkait ${title}.`)}`;
    const telUrl = `tel:${cleanPhone}`;

    Linking.canOpenURL(waUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(waUrl);
        } else {
          Linking.openURL(telUrl);
        }
      })
      .catch(() => {
        Linking.openURL(telUrl);
      });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.sheetContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={[styles.badgeIcon, { backgroundColor: isOffice ? 'rgba(0,82,156,0.12)' : 'rgba(230,0,18,0.12)' }]}>
              <Feather
                name={isOffice ? 'home' : 'flag'}
                size={18}
                color={isOffice ? '#00529C' : '#E60012'}
              />
            </View>

            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text style={[styles.titleText, { color: colors.text }]} numberOfLines={2}>
                  {title}
                </Text>
                <Pill
                  label={isOffice ? 'Kantor Resmi' : 'Posko Lapangan'}
                  tone={isOffice ? 'primary' : 'danger'}
                />
              </View>
              <Text style={[styles.subText, { color: colors.textMuted }]}>{category}</Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Info Rows */}
          <View style={[styles.infoCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Feather name="map-pin" size={14} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Alamat Lengkap</Text>
                <Text style={[styles.infoVal, { color: colors.text }]}>{address}</Text>
                <Text style={[styles.infoSub, { color: colors.textMuted }]}>{city}</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoRow}>
              <Feather name="user-check" size={14} color="#10B981" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  {isOffice ? 'Penanggung Jawab Kantor' : 'PIC Posko Lapangan'}
                </Text>
                <Text style={[styles.infoVal, { color: colors.text }]}>{pic}</Text>
              </View>
            </View>

            {!isOffice && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.infoRow}>
                  <Feather name="users" size={14} color={isDark ? '#FBBF24' : '#B45309'} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Kekuatan Siaga</Text>
                    <Text style={[styles.infoVal, { color: isDark ? '#FBBF24' : '#B45309', fontFamily: fonts.bold }]}>
                      {posko!.activeVolunteers} Relawan Siaga Lapangan
                    </Text>
                  </View>
                </View>
              </>
            )}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoRow}>
              <Feather name="compass" size={14} color="#0284C7" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Koordinat GPS</Text>
                <Text style={[styles.infoSub, { color: colors.text, fontFamily: fonts.medium }]}>
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <PrimaryButton
              label="Petunjuk Arah (GPS)"
              icon="navigation"
              onPress={handleOpenDirections}
              style={{ flex: 1 }}
            />

            <TouchableOpacity
              onPress={handleContactHotline}
              style={[styles.contactBtn, { backgroundColor: '#10B981' }]}
              activeOpacity={0.8}
            >
              <Feather name="phone-call" size={16} color="#FFFFFF" />
              <Text style={styles.contactBtnText}>Hubungi Posko</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handleBar: {
    width: 38,
    height: 4.5,
    borderRadius: radius.full,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  subText: {
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoLabel: {
    fontSize: 10,
    fontFamily: fonts.regular,
  },
  infoVal: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  infoSub: {
    fontSize: 10.5,
    fontFamily: fonts.regular,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: radius.md,
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 13,
  },
});
