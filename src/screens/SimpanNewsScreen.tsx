import React, { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, EmptyState, Modal, Pill, PrimaryButton } from '../components/ui';
import { WARTA_DPP_LIST, WartaPartai } from '../data/simpan';

type CategoryFilter = 'ALL' | WartaPartai['kategori'];

interface FilterOption {
  key: CategoryFilter;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'ALL', label: 'Semua' },
  { key: 'INTRUKSI_KETUM', label: 'Instruksi' },
  { key: 'BSN_PAN', label: 'BSN PAN' },
  { key: 'KONSOLIDASI', label: 'Konsolidasi' },
  { key: 'RILIS_PERS', label: 'Rilis Pers' },
];

export default function SimpanNewsScreen() {
  const { colors, fontSize, radius, spacing, isDark, iconStrokeWidth } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [selectedNews, setSelectedNews] = useState<WartaPartai | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const timer = setTimeout(() => {
      setRefreshing(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectNews = (item: WartaPartai) => {
    setSelectedNews(item);
    if (!readIds.includes(item.id)) {
      setReadIds((prev) => [...prev, item.id]);
    }
  };

  const handleShare = async (item: WartaPartai) => {
    try {
      await Share.share({
        title: item.judul,
        message: `📢 *[WARTA RESMI DPP PAN]*\n\n*${item.judul}*\n_${item.tanggal} • ${item.penulis}_\n\n${item.isiLengkap}\n\n📲 _Disiarkan melalui Aplikasi simPAN (Partai Amanat Nasional)_`,
      });
    } catch (error: any) {
      setShareError(error?.message || 'Terjadi kesalahan saat membagikan warta.');
    }
  };

  const getTone = (kat: WartaPartai['kategori']) => {
    switch (kat) {
      case 'INTRUKSI_KETUM': return 'primary';
      case 'BSN_PAN': return 'success';
      case 'KONSOLIDASI': return 'warning';
      default: return 'neutral';
    }
  };

  const getLabel = (kat: WartaPartai['kategori']) => {
    switch (kat) {
      case 'INTRUKSI_KETUM': return 'Instruksi Ketum';
      case 'BSN_PAN': return 'BSN PAN';
      case 'KONSOLIDASI': return 'Konsolidasi';
      default: return 'Rilis Pers';
    }
  };

  const filteredNews = WARTA_DPP_LIST.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.kategori === selectedCategory;
  });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Category Filter Chips */}
      <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_OPTIONS.map((filter) => {
            const isActive = selectedCategory === filter.key;
            return (
              <Pressable
                key={filter.key}
                onPress={() => setSelectedCategory(filter.key)}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isActive ? '#FFFFFF' : colors.textMuted,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main List */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {filteredNews.length === 0 ? (
          <EmptyState
            title="Tidak Ada Warta"
            body="Belum ada warta DPP pada kategori ini."
            icon="file-text"
            actionLabel="Tampilkan Semua Warta"
            onAction={() => setSelectedCategory('ALL')}
            style={{ marginTop: spacing.xl }}
          />
        ) : (
          <View style={{ gap: spacing.md }}>
            {filteredNews.map((item, index) => {
              const isHero = item.pinned && (selectedCategory === 'ALL' || selectedCategory === 'INTRUKSI_KETUM') && index === 0;
              const isRead = readIds.includes(item.id);

              if (isHero) {
                // FEATURED HERO CARD (Instruksi Utama)
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handleSelectNews(item)}
                    style={({ pressed }) => [pressed && { opacity: 0.9, transform: [{ scale: 0.995 }] }]}
                  >
                    <Card
                      style={[
                        styles.heroCard,
                        {
                          borderColor: colors.primary,
                          backgroundColor: isDark ? 'rgba(0, 102, 179, 0.18)' : colors.surface,
                        },
                      ]}
                    >
                      {/* Top Meta */}
                      <View style={styles.cardHeaderRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Pill label="Instruksi Utama" tone="primary" icon="flag" />
                          {!isRead && (
                            <View
                              style={[styles.unreadDot, { backgroundColor: colors.primary }]}
                              accessible={true}
                              accessibilityLabel="Belum dibaca"
                            />
                          )}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Feather name="calendar" size={11} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                          <Text style={[styles.dateText, { color: colors.textMuted }]}>{item.tanggal}</Text>
                        </View>
                      </View>

                      {/* Judul & Ringkasan */}
                      <Text style={[styles.heroTitle, { color: colors.text }]}>{item.judul}</Text>
                      <Text style={[styles.heroSummary, { color: colors.textMuted }]} numberOfLines={3}>
                        {item.ringkasan}
                      </Text>

                      {/* Footer Atribusi Lugas */}
                      <View style={[styles.heroFooter, { borderTopColor: colors.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                          <View
                            style={[
                              styles.authorBadgeIcon,
                              { backgroundColor: isDark ? 'rgba(0, 102, 179, 0.3)' : colors.primaryLight },
                            ]}
                          >
                            <Feather name="shield" size={14} color={colors.primary} strokeWidth={iconStrokeWidth} />
                          </View>
                          <Text style={[styles.heroAuthor, { color: colors.text }]} numberOfLines={1}>
                            {item.penulis}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={[styles.actionText, { color: colors.primary }]}>Buka Instruksi</Text>
                          <Feather name="chevron-right" size={15} color={colors.primary} strokeWidth={iconStrokeWidth} />
                        </View>
                      </View>
                    </Card>
                  </Pressable>
                );
              }

              // STANDARD NEWS CARD
              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelectNews(item)}
                  style={({ pressed }) => [pressed && { opacity: 0.9, transform: [{ scale: 0.995 }] }]}
                >
                  <Card style={[styles.standardCard, { borderColor: colors.border }]}>
                    {/* Top Meta */}
                    <View style={styles.cardHeaderRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Pill label={getLabel(item.kategori)} tone={getTone(item.kategori)} />
                        {!isRead && (
                          <View
                            style={[styles.unreadDot, { backgroundColor: colors.primary }]}
                            accessible={true}
                            accessibilityLabel="Belum dibaca"
                          />
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Feather name="clock" size={11} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                        <Text style={[styles.dateText, { color: colors.textMuted }]}>{item.tanggal}</Text>
                      </View>
                    </View>

                    {/* Judul & Ringkasan */}
                    <Text style={[styles.newsTitle, { color: colors.text }]}>{item.judul}</Text>
                    <Text style={[styles.newsSummary, { color: colors.textMuted }]} numberOfLines={2}>
                      {item.ringkasan}
                    </Text>

                    {/* Footer Penulis & Aksi */}
                    <View style={[styles.newsFooter, { borderTopColor: colors.border }]}>
                      <Text style={[styles.newsAuthor, { color: colors.textMuted }]} numberOfLines={1}>
                        Oleh: <Text style={{ color: colors.primary, fontWeight: '700' }}>{item.penulis}</Text>
                      </Text>
                      <Feather name="chevron-right" size={16} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Expanded Bottom Sheet Detail Reader */}
      {selectedNews && (
        <Modal
          visible={true}
          title={getLabel(selectedNews.kategori)}
          subtitle={`${selectedNews.tanggal} • simPAN 360 Resmi`}
          onClose={() => setSelectedNews(null)}
          variant="bottomSheet"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.lg }}
          >
            {/* Judul Utuh */}
            <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedNews.judul}</Text>

            {/* Kotak Otoritas Penerbit Terverifikasi */}
            <View
              style={[
                styles.authorityBox,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.primaryLight,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={[styles.authorityAvatar, { backgroundColor: colors.primary }]}>
                <Feather name="check" size={16} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.authorityLabel, { color: colors.textMuted }]}>
                  Diterbitkan Resmi Oleh
                </Text>
                <Text style={[styles.authorityName, { color: colors.text }]}>
                  {selectedNews.penulis}
                </Text>
              </View>
            </View>

            {/* Pembatas Elegan */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Isi Instruksi / Berita */}
            <Text style={[styles.detailBody, { color: colors.text }]}>
              {selectedNews.isiLengkap}
            </Text>

            {/* Tombol Aksi Nyata */}
            <View style={styles.actionButtonsContainer}>
              <PrimaryButton
                label="Bagikan ke WhatsApp / Ranting"
                icon="share-2"
                variant="primary"
                onPress={() => handleShare(selectedNews)}
              />
              <PrimaryButton
                label="Saya Telah Membaca & Memahami"
                icon="check-circle"
                variant="outline"
                onPress={() => setSelectedNews(null)}
              />
            </View>
          </ScrollView>
        </Modal>
      )}

      <ConfirmDialog
        visible={!!shareError}
        title="Gagal Membagikan"
        message={shareError || ''}
        tone="danger"
        singleButton
        confirmLabel="Mengerti"
        onConfirm={() => setShareError(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  filterBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: {
    fontSize: 12,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  // Hero Card Styles
  heroCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginTop: 2,
  },
  heroSummary: {
    fontSize: 12,
    lineHeight: 18,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    marginTop: 2,
  },
  authorBadgeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAuthor: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  // Standard Card Styles
  standardCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 2,
  },
  newsSummary: {
    fontSize: 12,
    lineHeight: 17,
  },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    marginTop: 2,
  },
  newsAuthor: {
    fontSize: 11,
    flex: 1,
    marginRight: 8,
  },
  // Detail Modal Styles
  detailTitle: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
  },
  authorityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  authorityAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorityLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  authorityName: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  detailBody: {
    fontSize: 13.5,
    lineHeight: 22,
  },
  actionButtonsContainer: {
    gap: 10,
    marginTop: 8,
  },
});
