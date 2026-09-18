import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, EmptyState, Pill, PrimaryButton } from '../components/ui';
import { fonts } from '../theme';
import {
  PORTAL_NEWS_CATEGORIES,
  PORTAL_NEWS_LIST,
  NewsCategory,
  PortalNewsItem,
} from '../data/portalNews';
import { getWitnessAvatar } from '../data/images';

export default function SimpanNewsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, radius, spacing, isDark, iconStrokeWidth } = useTheme();

  // Screen State
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNews, setSelectedNews] = useState<PortalNewsItem | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['NEWS-001']);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [refreshing, setRefreshing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const timer = setTimeout(() => {
      setRefreshing(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleShare = async (item: PortalNewsItem) => {
    try {
      await Share.share({
        title: item.title,
        message: `📰 *${item.title}*\n\n_${item.summary}_\n\n📌 *Kategori:* ${item.categoryLabel}\n🗓 *Rilis:* ${item.publishedAt}\n✍️ *Oleh:* ${item.author.name} (${item.author.role})\n\n📲 _Baca selengkapnya di Aplikasi simPAN 360 (Partai Amanat Nasional)_`,
      });
    } catch (error: any) {
      setShareError(error?.message || 'Terjadi kesalahan saat membagikan berita.');
    }
  };

  // Filter Data
  const filteredList = useMemo(() => {
    return PORTAL_NEWS_LIST.filter((item) => {
      // Bookmark filter
      if (showBookmarksOnly && !bookmarkedIds.includes(item.id)) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(query);
        const inSummary = item.summary.toLowerCase().includes(query);
        const inAuthor = item.author.name.toLowerCase().includes(query);
        const inTags = item.tags.some((tag) => tag.toLowerCase().includes(query));
        return inTitle || inSummary || inAuthor || inTags;
      }
      return true;
    });
  }, [selectedCategory, searchQuery, showBookmarksOnly, bookmarkedIds]);

  // Determine Hero Item (Featured or Top item if no active search or bookmark filter)
  const isBrowsingAll = selectedCategory === 'ALL' && !searchQuery.trim() && !showBookmarksOnly;
  const heroItem = isBrowsingAll ? filteredList.find((item) => item.isFeatured) || filteredList[0] : null;
  const standardFeedItems = isBrowsingAll && heroItem
    ? filteredList.filter((item) => item.id !== heroItem.id)
    : filteredList;

  // Font scale calculation for article reader
  const readerFontStyles = useMemo(() => {
    switch (fontSizeScale) {
      case 'large':
        return { fontSize: 16, lineHeight: 26 };
      case 'xlarge':
        return { fontSize: 18, lineHeight: 30 };
      default:
        return { fontSize: 14.5, lineHeight: 24 };
    }
  }, [fontSizeScale]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Top Media Bar & Search */}
      <View style={[styles.headerContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.brandRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.brandBadgeRow}>
              <View style={[styles.liveDot, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.brandSuper, { color: colors.primary }]}>PORTAL MEDIA RESMI</Text>
            </View>
            <Text style={[styles.brandTitle, { color: colors.text }]}>Kabar & Liputan PAN</Text>
          </View>

          {/* Bookmark Filter Toggle */}
          <Pressable
            onPress={() => setShowBookmarksOnly((prev) => !prev)}
            style={({ pressed }) => [
              styles.headerIconButton,
              {
                backgroundColor: showBookmarksOnly
                  ? isDark ? 'rgba(0, 102, 179, 0.25)' : colors.primaryLight
                  : colors.surface,
                borderColor: showBookmarksOnly ? colors.primary : colors.border,
              },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityLabel="Tampilkan Berita Disimpan"
          >
            <Feather
              name="bookmark"
              size={18}
              color={showBookmarksOnly ? colors.primary : colors.textMuted}
              strokeWidth={iconStrokeWidth}
            />
            {bookmarkedIds.length > 0 && (
              <View style={[styles.badgeNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeNumberText}>{bookmarkedIds.length}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Search Input */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
              borderColor: colors.border,
            },
          ]}
        >
          <Feather name="search" size={16} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cari liputan, gerakan kader, atau isu..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Feather name="x-circle" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Category Scrollbar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContainer}
        >
          {PORTAL_NEWS_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key && !showBookmarksOnly;
            return (
              <Pressable
                key={cat.key}
                onPress={() => {
                  setShowBookmarksOnly(false);
                  setSelectedCategory(cat.key);
                }}
                style={({ pressed }) => [
                  styles.categoryPill,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Feather
                  name={cat.icon as any}
                  size={12}
                  color={isActive ? '#FFFFFF' : colors.textMuted}
                  strokeWidth={iconStrokeWidth}
                />
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: isActive ? '#FFFFFF' : colors.textMuted,
                      fontFamily: isActive ? fonts.bold : fonts.medium,
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Feed */}
      <ScrollView
        style={styles.feedScroll}
        contentContainerStyle={styles.feedContentContainer}
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
        {/* Active Filter Notice */}
        {showBookmarksOnly && (
          <View style={[styles.activeFilterNotice, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="bookmark" size={14} color={colors.primary} />
              <Text style={[styles.activeFilterText, { color: colors.primary }]}>
                Menampilkan Berita yang Anda Simpan ({filteredList.length})
              </Text>
            </View>
            <Pressable onPress={() => setShowBookmarksOnly(false)} hitSlop={6}>
              <Text style={[styles.activeFilterClear, { color: colors.primary }]}>Tampilkan Semua</Text>
            </Pressable>
          </View>
        )}

        {filteredList.length === 0 ? (
          <EmptyState
            title="Tidak Ditemukan Berita"
            body={
              showBookmarksOnly
                ? 'Belum ada berita yang Anda simpan. Tekan ikon bookmark pada artikel untuk menyimpan.'
                : searchQuery
                ? `Tidak ada artikel dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : 'Belum ada liputan pada kategori ini.'
            }
            icon="book-open"
            actionLabel={searchQuery || showBookmarksOnly ? 'Reset Pencarian' : undefined}
            onAction={() => {
              setSearchQuery('');
              setShowBookmarksOnly(false);
              setSelectedCategory('ALL');
            }}
            style={{ marginTop: spacing.xl }}
          />
        ) : (
          <View style={{ gap: spacing.lg }}>
            {/* HERO FEATURED STORY */}
            {heroItem && (
              <Pressable
                onPress={() => setSelectedNews(heroItem)}
                style={({ pressed }) => [pressed && { opacity: 0.95 }]}
              >
                <Card style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {/* Hero Image 16:9 */}
                  <View style={styles.heroImageContainer}>
                    <Image
                      source={
                        imageErrors[heroItem.id]
                          ? heroItem.localFallbackImage
                          : { uri: heroItem.imageUrl }
                      }
                      defaultSource={heroItem.localFallbackImage}
                      onError={() => setImageErrors((prev) => ({ ...prev, [heroItem.id]: true }))}
                      style={styles.heroImage}
                      resizeMode="cover"
                    />
                    <View style={styles.heroBadgeOverlay}>
                      <Pill label="Sorotan Utama" tone="primary" icon="star" />
                      <View style={[styles.readTimeBadge, { backgroundColor: 'rgba(15, 23, 42, 0.75)' }]}>
                        <Feather name="clock" size={11} color="#FFFFFF" strokeWidth={iconStrokeWidth} />
                        <Text style={styles.readTimeText}>{heroItem.readTime}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Hero Content Body */}
                  <View style={styles.heroContentWrap}>
                    <View style={styles.heroCategoryRow}>
                      <Text style={[styles.heroCategoryLabel, { color: heroItem.categoryColor }]}>
                        {heroItem.categoryLabel.toUpperCase()}
                      </Text>
                      <Text style={[styles.metaDot, { color: colors.textMuted }]}>•</Text>
                      <Text style={[styles.heroTimeAgo, { color: colors.textMuted }]}>
                        {heroItem.timeAgo}
                      </Text>
                    </View>

                    <Text style={[styles.heroTitle, { color: colors.text }]}>{heroItem.title}</Text>
                    <Text style={[styles.heroSummary, { color: colors.textMuted }]} numberOfLines={3}>
                      {heroItem.summary}
                    </Text>

                    {/* Byline & Action Footer */}
                    <View style={[styles.heroFooter, { borderTopColor: colors.border }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <Image
                          source={getWitnessAvatar(heroItem.author.avatarIndex || 0)}
                          style={styles.authorAvatarMini}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
                            {heroItem.author.name}
                          </Text>
                          <Text style={[styles.authorRole, { color: colors.textMuted }]} numberOfLines={1}>
                            {heroItem.author.role}
                          </Text>
                        </View>
                      </View>

                      <Pressable
                        onPress={() => toggleBookmark(heroItem.id)}
                        hitSlop={8}
                        style={styles.actionIconPress}
                      >
                        <Feather
                          name="bookmark"
                          size={18}
                          color={bookmarkedIds.includes(heroItem.id) ? colors.primary : colors.textMuted}
                          strokeWidth={bookmarkedIds.includes(heroItem.id) ? 2.5 : iconStrokeWidth}
                        />
                      </Pressable>
                    </View>
                  </View>
                </Card>
              </Pressable>
            )}

            {/* SECTION TITLE: TERKINI & LIPUTAN */}
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.sectionIndicator, { backgroundColor: colors.primary }]} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {showBookmarksOnly
                    ? 'Daftar Bacaan Disimpan'
                    : isBrowsingAll
                    ? 'Kabar Terbaru & Liputan Lapangan'
                    : `Liputan: ${PORTAL_NEWS_CATEGORIES.find((c) => c.key === selectedCategory)?.label || ''}`}
                </Text>
              </View>
              <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
                {standardFeedItems.length} Berita
              </Text>
            </View>

            {/* FEED ITEMS LIST */}
            <View style={{ gap: spacing.md }}>
              {standardFeedItems.map((item) => {
                const isBookmarked = bookmarkedIds.includes(item.id);

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setSelectedNews(item)}
                    style={({ pressed }) => [pressed && { opacity: 0.92, transform: [{ scale: 0.995 }] }]}
                  >
                    <Card style={[styles.feedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={styles.feedCardInner}>
                        {/* Left Info Column */}
                        <View style={styles.feedContentCol}>
                          {/* Top Meta */}
                          <View style={styles.feedMetaTop}>
                            <Text style={[styles.feedCategoryText, { color: item.categoryColor }]}>
                              {item.categoryLabel}
                            </Text>
                            <Text style={[styles.metaDot, { color: colors.textMuted }]}>•</Text>
                            <Text style={[styles.feedTimeText, { color: colors.textMuted }]}>{item.timeAgo}</Text>
                          </View>

                          {/* Title & Summary */}
                          <Text style={[styles.feedTitle, { color: colors.text }]} numberOfLines={2}>
                            {item.title}
                          </Text>
                          <Text style={[styles.feedSummary, { color: colors.textMuted }]} numberOfLines={2}>
                            {item.summary}
                          </Text>

                          {/* Bottom Row */}
                          <View style={styles.feedMetaBottom}>
                            <Text style={[styles.feedAuthorText, { color: colors.textMuted }]} numberOfLines={1}>
                              {item.author.name}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                              <Text style={[styles.feedReadTime, { color: colors.textMuted }]}>
                                {item.readTime}
                              </Text>
                              <Pressable
                                onPress={() => toggleBookmark(item.id)}
                                hitSlop={8}
                              >
                                <Feather
                                  name="bookmark"
                                  size={15}
                                  color={isBookmarked ? colors.primary : colors.textMuted}
                                  strokeWidth={isBookmarked ? 2.5 : iconStrokeWidth}
                                />
                              </Pressable>
                            </View>
                          </View>
                        </View>

                        {/* Right Thumbnail 92x92 */}
                        <View style={styles.thumbnailContainer}>
                          <Image
                            source={
                              imageErrors[item.id]
                                ? item.localFallbackImage
                                : { uri: item.imageUrl }
                            }
                            defaultSource={item.localFallbackImage}
                            onError={() => setImageErrors((prev) => ({ ...prev, [item.id]: true }))}
                            style={styles.thumbnailImage}
                            resizeMode="cover"
                          />
                        </View>
                      </View>
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* DEDICATED FULL ARTICLE READER MODAL */}
      {selectedNews && (
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedNews(null)}
        >
          <View style={[styles.readerContainer, { backgroundColor: colors.background }]}>
            {/* Top Navigation Bar */}
            <View
              style={[
                styles.readerTopBar,
                {
                  backgroundColor: colors.surface,
                  borderBottomColor: colors.border,
                  paddingTop: Math.max(insets.top, 14),
                },
              ]}
            >
              <Pressable
                onPress={() => setSelectedNews(null)}
                style={({ pressed }) => [styles.readerNavButton, pressed && { opacity: 0.7 }]}
                accessibilityLabel="Tutup Artikel"
              >
                <Feather name="arrow-left" size={20} color={colors.text} strokeWidth={iconStrokeWidth} />
              </Pressable>

              <View style={styles.readerCategoryCenter}>
                <Pill label={selectedNews.categoryLabel} tone="primary" />
              </View>

              <View style={styles.readerActionGroup}>
                {/* Font Resizer Toggle */}
                <Pressable
                  onPress={() => {
                    setFontSizeScale((prev) =>
                      prev === 'normal' ? 'large' : prev === 'large' ? 'xlarge' : 'normal'
                    );
                  }}
                  style={({ pressed }) => [styles.readerNavButton, pressed && { opacity: 0.7 }]}
                  accessibilityLabel="Atur Ukuran Teks"
                >
                  <Text style={[styles.fontScaleLabel, { color: colors.text }]}>
                    {fontSizeScale === 'normal' ? 'A' : fontSizeScale === 'large' ? 'A+' : 'A++'}
                  </Text>
                </Pressable>

                {/* Bookmark Button */}
                <Pressable
                  onPress={() => toggleBookmark(selectedNews.id)}
                  style={({ pressed }) => [styles.readerNavButton, pressed && { opacity: 0.7 }]}
                  accessibilityLabel="Simpan Berita"
                >
                  <Feather
                    name="bookmark"
                    size={19}
                    color={bookmarkedIds.includes(selectedNews.id) ? colors.primary : colors.text}
                    strokeWidth={bookmarkedIds.includes(selectedNews.id) ? 2.5 : iconStrokeWidth}
                  />
                </Pressable>

                {/* Share Button */}
                <Pressable
                  onPress={() => handleShare(selectedNews)}
                  style={({ pressed }) => [styles.readerNavButton, pressed && { opacity: 0.7 }]}
                  accessibilityLabel="Bagikan Berita"
                >
                  <Feather name="share-2" size={19} color={colors.text} strokeWidth={iconStrokeWidth} />
                </Pressable>
              </View>
            </View>

            {/* Article Scroll Body */}
            <ScrollView
              style={styles.readerScroll}
              contentContainerStyle={styles.readerContentContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Published Date & Reading Meta */}
              <View style={styles.readerMetaHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name="calendar" size={12} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                  <Text style={[styles.readerDateText, { color: colors.textMuted }]}>
                    {selectedNews.publishedAt}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name="clock" size={12} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                  <Text style={[styles.readerDateText, { color: colors.textMuted }]}>
                    {selectedNews.readTime}
                  </Text>
                </View>
              </View>

              {/* Title */}
              <Text style={[styles.readerTitle, { color: colors.text }]}>{selectedNews.title}</Text>

              {/* Author Attribution Card */}
              <View style={[styles.readerAuthorBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Image
                  source={getWitnessAvatar(selectedNews.author.avatarIndex || 0)}
                  style={styles.readerAuthorAvatar}
                />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text style={[styles.readerAuthorName, { color: colors.text }]}>
                      {selectedNews.author.name}
                    </Text>
                    <Feather name="check-circle" size={12} color={colors.primary} />
                  </View>
                  <Text style={[styles.readerAuthorRole, { color: colors.textMuted }]}>
                    {selectedNews.author.role}
                  </Text>
                </View>
              </View>

              {/* Featured Photo with Caption */}
              <View style={styles.readerHeroImageWrap}>
                <Image
                  source={
                    imageErrors[selectedNews.id]
                      ? selectedNews.localFallbackImage
                      : { uri: selectedNews.imageUrl }
                  }
                  defaultSource={selectedNews.localFallbackImage}
                  onError={() => setImageErrors((prev) => ({ ...prev, [selectedNews.id]: true }))}
                  style={styles.readerHeroImage}
                  resizeMode="cover"
                />
                <Text style={[styles.readerCaption, { color: colors.textMuted }]}>
                  {selectedNews.imageCaption}
                </Text>
              </View>

              {/* Article Paragraphs */}
              <View style={styles.articleBodyContainer}>
                {selectedNews.contentParagraphs.map((para, pIndex) => (
                  <Text
                    key={pIndex}
                    style={[
                      styles.articleParagraph,
                      { color: colors.text },
                      readerFontStyles,
                    ]}
                  >
                    {para}
                  </Text>
                ))}
              </View>

              {/* Pull Quote Box */}
              {selectedNews.pullQuote && (
                <View
                  style={[
                    styles.pullQuoteBox,
                    {
                      backgroundColor: isDark ? 'rgba(0, 102, 179, 0.15)' : colors.primaryLight,
                      borderLeftColor: colors.primary,
                    },
                  ]}
                >
                  <Feather name="message-square" size={20} color={colors.primary} style={{ marginBottom: 6 }} />
                  <Text style={[styles.pullQuoteText, { color: colors.text }]}>
                    "{selectedNews.pullQuote.quote}"
                  </Text>
                  <Text style={[styles.pullQuoteAuthor, { color: colors.primary }]}>
                    — {selectedNews.pullQuote.author}
                  </Text>
                </View>
              )}

              {/* Tags Section */}
              <View style={styles.tagsContainer}>
                <Text style={[styles.tagsLabel, { color: colors.textMuted }]}>Topik Terkait:</Text>
                <View style={styles.tagChipsWrap}>
                  {selectedNews.tags.map((tag) => (
                    <View
                      key={tag}
                      style={[styles.tagPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                      <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Engagement Row */}
              <View style={[styles.engagementBar, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
                <Pressable
                  onPress={() => toggleLike(selectedNews.id)}
                  style={styles.engagementAction}
                >
                  <Feather
                    name="heart"
                    size={18}
                    color={likedIds.includes(selectedNews.id) ? '#EF4444' : colors.textMuted}
                    strokeWidth={likedIds.includes(selectedNews.id) ? 2.5 : iconStrokeWidth}
                  />
                  <Text
                    style={[
                      styles.engagementLabel,
                      { color: likedIds.includes(selectedNews.id) ? '#EF4444' : colors.textMuted },
                    ]}
                  >
                    {selectedNews.likesCount + (likedIds.includes(selectedNews.id) ? 1 : 0)} Suka
                  </Text>
                </Pressable>

                <View style={styles.engagementAction}>
                  <Feather name="eye" size={18} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
                  <Text style={[styles.engagementLabel, { color: colors.textMuted }]}>
                    {selectedNews.viewsCount} Pembaca
                  </Text>
                </View>

                <Pressable
                  onPress={() => handleShare(selectedNews)}
                  style={styles.engagementAction}
                >
                  <Feather name="share-2" size={18} color={colors.primary} strokeWidth={iconStrokeWidth} />
                  <Text style={[styles.engagementLabel, { color: colors.primary }]}>Bagikan</Text>
                </Pressable>
              </View>

              {/* Action Buttons */}
              <View style={styles.readerBottomActions}>
                <PrimaryButton
                  label="Bagikan Liputan Ini ke WhatsApp"
                  icon="share-2"
                  variant="primary"
                  onPress={() => handleShare(selectedNews)}
                />
                <PrimaryButton
                  label="Tutup Halaman Baca"
                  icon="arrow-left"
                  variant="outline"
                  onPress={() => setSelectedNews(null)}
                />
              </View>

              {/* Related News Carousel / Section */}
              <View style={styles.relatedSection}>
                <Text style={[styles.relatedHeading, { color: colors.text }]}>Berita Terkait Lainnya</Text>
                <View style={{ gap: 12 }}>
                  {PORTAL_NEWS_LIST.filter((n) => n.id !== selectedNews.id)
                    .slice(0, 2)
                    .map((relItem) => (
                      <Pressable
                        key={relItem.id}
                        onPress={() => setSelectedNews(relItem)}
                        style={({ pressed }) => [pressed && { opacity: 0.85 }]}
                      >
                        <Card style={[styles.relatedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                          <View style={{ flex: 1, gap: 4 }}>
                            <Text style={[styles.relatedCat, { color: relItem.categoryColor }]}>
                              {relItem.categoryLabel}
                            </Text>
                            <Text style={[styles.relatedTitle, { color: colors.text }]} numberOfLines={2}>
                              {relItem.title}
                            </Text>
                            <Text style={[styles.relatedTime, { color: colors.textMuted }]}>
                              {relItem.timeAgo} • {relItem.readTime}
                            </Text>
                          </View>
                          <Image
                            source={
                              imageErrors[relItem.id]
                                ? relItem.localFallbackImage
                                : { uri: relItem.imageUrl }
                            }
                            defaultSource={relItem.localFallbackImage}
                            style={styles.relatedThumb}
                          />
                        </Card>
                      </Pressable>
                    ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Share Error Dialog */}
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
  // Header Bar
  headerContainer: {
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  brandBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  brandSuper: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  brandTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    marginTop: 1,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNumber: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeNumberText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 9,
  },
  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    padding: 0,
  },
  // Categories
  categoryScrollContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11.5,
  },
  // Active Filter Notice
  activeFilterNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  activeFilterText: {
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
  },
  activeFilterClear: {
    fontFamily: fonts.bold,
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  // Feed List
  feedScroll: { flex: 1 },
  feedContentContainer: {
    padding: 16,
    paddingBottom: 36,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionIndicator: {
    width: 3.5,
    height: 16,
    borderRadius: 2,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  sectionCount: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  // Hero Story Card
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  heroImageContainer: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBadgeOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  readTimeText: {
    color: '#FFFFFF',
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  heroContentWrap: {
    padding: 16,
    gap: 8,
  },
  heroCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroCategoryLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  metaDot: {
    fontSize: 10,
  },
  heroTimeAgo: {
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 23,
  },
  heroSummary: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18.5,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    marginTop: 4,
  },
  authorAvatarMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  authorName: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
  },
  authorRole: {
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  actionIconPress: {
    padding: 4,
  },
  // Feed Standard Cards
  feedCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  feedCardInner: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  feedContentCol: {
    flex: 1,
    gap: 4,
  },
  feedMetaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  feedCategoryText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
  },
  feedTimeText: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },
  feedTitle: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    lineHeight: 18.5,
  },
  feedSummary: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 16,
  },
  feedMetaBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  feedAuthorText: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    flex: 1,
    marginRight: 6,
  },
  feedReadTime: {
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  thumbnailContainer: {
    width: 88,
    height: 88,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  // Reader Modal Styles
  readerContainer: {
    flex: 1,
  },
  readerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  readerNavButton: {
    padding: 6,
  },
  readerCategoryCenter: {
    alignItems: 'center',
  },
  readerActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fontScaleLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    paddingHorizontal: 4,
  },
  readerScroll: {
    flex: 1,
  },
  readerContentContainer: {
    padding: 18,
    paddingBottom: 48,
    gap: 14,
  },
  readerMetaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readerDateText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  readerTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 28,
  },
  readerAuthorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  readerAuthorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  readerAuthorName: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  readerAuthorRole: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },
  readerHeroImageWrap: {
    gap: 6,
  },
  readerHeroImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  readerCaption: {
    fontFamily: fonts.regular,
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  articleBodyContainer: {
    gap: 12,
    marginTop: 4,
  },
  articleParagraph: {
    fontFamily: fonts.regular,
    textAlign: 'left',
  },
  pullQuoteBox: {
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    marginVertical: 6,
  },
  pullQuoteText: {
    fontFamily: fonts.semiBold,
    fontSize: 13.5,
    fontStyle: 'italic',
    lineHeight: 21,
  },
  pullQuoteAuthor: {
    fontFamily: fonts.bold,
    fontSize: 11,
    marginTop: 6,
  },
  tagsContainer: {
    gap: 6,
    marginTop: 6,
  },
  tagsLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  tagChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  engagementBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  engagementAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  engagementLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
  },
  readerBottomActions: {
    gap: 10,
    marginTop: 6,
  },
  relatedSection: {
    marginTop: 20,
    gap: 10,
  },
  relatedHeading: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  relatedCat: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  relatedTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
  },
  relatedTime: {
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  relatedThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
});
