import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, Pill, PrimaryButton } from '../components/ui';
import { fonts, fontSize, radius, spacing } from '../theme';
import { BRAND_ASSETS } from '../data/images';

type BroadcastTab = 'channel' | 'group';

interface ChannelPost {
  id: string;
  tag: string;
  tagTone: 'danger' | 'primary' | 'warning' | 'info';
  sender: string;
  senderRole: string;
  time: string;
  title: string;
  content: string[];
  initialReactions: { thumbs: number; heart: number; fire: number };
}

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  time: string;
  text: string;
  isSelf?: boolean;
}

const INITIAL_CHANNEL_POSTS: ChannelPost[] = [
  {
    id: 'post-1',
    tag: 'MAKLUMAT RESMI DPP',
    tagTone: 'danger',
    sender: 'Sekretariat Jenderal DPP PAN',
    senderRole: 'Pusat Komando DPP PAN',
    time: '18 Sep 2026 • 09:30 WIB',
    title: 'Instruksi DPP PAN: Siaga Total Mengawal Suara Pemilu & Konsolidasi Pengawal Suara Se-Indonesia',
    content: [
      '1. Seluruh jajaran pengurus DPD, DPC, relawan simpatisan, dan saksi TPS diinstruksikan siaga penuh menjaga marwah suara rakyat.',
      '2. Melakukan konsolidasi koordinasi lapangan bersama Koordinator Wilayah di posko pemenangan masing-masing.',
      '3. Mengawal ketat keaslian dan integritas formulir C1 Plano saat penghitungan suara di bilik TPS.',
      '4. Menjalankan Gerakan Sapa Warga dengan mengedepankan etika, keramahan, dan sosialisasi program pro-rakyat.',
    ],
    initialReactions: { thumbs: 1420, heart: 980, fire: 750 },
  },
  {
    id: 'post-2',
    tag: 'ARAHAN KETUA UMUM',
    tagTone: 'primary',
    sender: 'Ketua Umum DPP PAN',
    senderRole: 'Pimpinan Tertinggi Partai',
    time: 'Hari Ini • 08:30 WIB',
    title: 'Gerakan Sapa Warga: Kenalkan Aksi Nyata PAN ke Seluruh Pelosok Lingkungan',
    content: [
      'Kepada seluruh pejuang dan relawan PAN yang saya banggakan:',
      'Teruslah hadir di tengah-tengah denyut nadi rakyat. Kenalkan program aksi nyata PAN dalam memberdayakan UMKM, penyediaan sembako murah, dan pendampingan akses pendidikan.',
      'Jadikan kehadiran kita sebagai pembawa harapan dan kebaikan nyata bagi keluarga Indonesia.',
    ],
    initialReactions: { thumbs: 2150, heart: 1870, fire: 1120 },
  },
  {
    id: 'post-3',
    tag: 'BSN PAN NASIONAL',
    tagTone: 'warning',
    sender: 'Badan Saksi Nasional (BSN) PAN',
    senderRole: 'Direktorat Pengawalan Suara',
    time: '17 Sep 2026 • 15:00 WIB',
    title: 'Petunjuk Teknis Presensi GPS & Pengunggahan Salinan C1 Plano Digital',
    content: [
      '1. Saksi TPS wajib hadir sebelum pukul 07:00 WIB dan melakukan presensi geofence GPS di bilik suara.',
      '2. Segera laporkan indikasi ketidaksesuaian form plano melalui fitur Lapor Insiden SOS.',
      '3. Pastikan swafoto dan foto plano terbaca tajam sebelum diunggah ke server terenkripsi simPAN.',
    ],
    initialReactions: { thumbs: 980, heart: 630, fire: 890 },
  },
];

const INITIAL_GROUP_CHATS: ChatMessage[] = [
  {
    id: 'msg-1',
    senderName: 'Asep Ridwan',
    senderRole: 'Korlap Dago',
    time: '06:45 WIB',
    text: 'Selamat pagi seluruh rekan-rekan saksi TPS Kluster Coblong & Dago! Mohon pastikan baterai ponsel terisi penuh dan surat mandat siap di saku.',
  },
  {
    id: 'msg-2',
    senderName: 'Rudi Saputra',
    senderRole: 'Saksi TPS 001 Dago',
    time: '07:05 WIB',
    text: 'Siap Pak Korlap! TPS 001 Dago sudah selesai presensi GPS. Petugas KPPS sedang mulai sumpah jabatan dan buka kotak suara.',
  },
  {
    id: 'msg-3',
    senderName: 'Hendra Gunawan',
    senderRole: 'Saksi TPS 002 Dago',
    time: '07:12 WIB',
    text: 'TPS 002 hadir lengkap, saksi partai lain juga sudah hadir. Kondisi kondusif dan tertib.',
  },
  {
    id: 'msg-4',
    senderName: 'Siti Rahmawati',
    senderRole: 'Relawan Saksi',
    time: '07:18 WIB',
    text: 'Posko Dago siap membackup konsumsi dan logistik pengawalan bilik suara. Semangat mengawal!',
    isSelf: true,
  },
];

export default function BroadcastScreen() {
  const { role, currentUser } = useApp();
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<BroadcastTab>('channel');
  const [channelPosts, setChannelPosts] = useState<ChannelPost[]>(INITIAL_CHANNEL_POSTS);
  const [userReactions, setUserReactions] = useState<Record<string, 'thumbs' | 'heart' | 'fire' | null>>({});

  // Group chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_GROUP_CHATS);
  const [inputChatText, setInputChatText] = useState('');

  // Status kelayakan akses group chat (Relawan yang memegang SK Mandat Saksi / Saksi Resmi)
  const isWitnessRole = role === 'WITNESS' || role === 'TPS_WITNESS';
  const hasWitnessRole =
    isWitnessRole ||
    currentUser.roles.some((r) => r.role === 'WITNESS' || (r.role as any) === 'TPS_WITNESS') ||
    currentUser.dimensions?.programs?.programSaksi === 'MANDATED';

  const handleToggleReaction = (postId: string, type: 'thumbs' | 'heart' | 'fire') => {
    const currentReaction = userReactions[postId];
    const isSame = currentReaction === type;

    setUserReactions((prev) => ({
      ...prev,
      [postId]: isSame ? null : type,
    }));

    setChannelPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const diffThumbs = (type === 'thumbs' ? (isSame ? -1 : 1) : currentReaction === 'thumbs' ? -1 : 0);
        const diffHeart = (type === 'heart' ? (isSame ? -1 : 1) : currentReaction === 'heart' ? -1 : 0);
        const diffFire = (type === 'fire' ? (isSame ? -1 : 1) : currentReaction === 'fire' ? -1 : 0);

        return {
          ...p,
          initialReactions: {
            thumbs: Math.max(0, p.initialReactions.thumbs + diffThumbs),
            heart: Math.max(0, p.initialReactions.heart + diffHeart),
            fire: Math.max(0, p.initialReactions.fire + diffFire),
          },
        };
      }),
    );
  };

  const handleSendChatMessage = () => {
    if (!inputChatText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: currentUser.identity.name || 'Siti Rahmawati',
      senderRole: hasWitnessRole ? 'Relawan Saksi' : 'Relawan',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      text: inputChatText.trim(),
      isSelf: true,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputChatText('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 1. TOP SEGMENTED CONTROL TABS */}
      <View style={[styles.topTabsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => setActiveTab('channel')}
          style={[
            styles.tabButton,
            activeTab === 'channel' && [styles.activeTabButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary }],
          ]}
        >
          <Feather
            name="volume-2"
            size={14}
            color={activeTab === 'channel' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === 'channel' ? colors.primary : colors.textMuted },
            ]}
          >
            Saluran DPP (Resmi)
          </Text>
          <View style={[styles.tabBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.tabBadgeText}>1 Arah</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('group')}
          style={[
            styles.tabButton,
            activeTab === 'group' && [styles.activeTabButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary }],
          ]}
        >
          <Feather
            name={hasWitnessRole ? 'message-circle' : 'lock'}
            size={14}
            color={activeTab === 'group' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === 'group' ? colors.primary : colors.textMuted },
            ]}
          >
            Grup Saksi TPS
          </Text>
          <View style={[styles.tabBadge, { backgroundColor: hasWitnessRole ? colors.success : colors.textMuted }]}>
            <Text style={styles.tabBadgeText}>{hasWitnessRole ? '2 Arah' : 'Terkunci'}</Text>
          </View>
        </Pressable>
      </View>

      {/* 2. TAB CONTENT: SALURAN WHATSAPP (SATU ARAH) */}
      {activeTab === 'channel' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.channelContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Profil Saluran WhatsApp DPP PAN */}
          <View
            style={[
              styles.channelHeaderCard,
              {
                backgroundColor: isDark ? '#08172E' : '#002B52',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.channelHeaderTop}>
              <View style={styles.channelAvatarCircle}>
                <Image source={BRAND_ASSETS.official} style={styles.channelLogoImage} resizeMode="contain" />
              </View>

              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.channelTitleText} numberOfLines={1}>
                    Saluran Resmi DPP PAN
                  </Text>
                  <Feather name="check-circle" size={15} color="#00D2FF" />
                </View>
                <Text style={styles.channelFollowerText}>
                  Saluran Terverifikasi • 140.000 Anggota & Relawan
                </Text>
              </View>

              <View style={styles.liveBroadcastPill}>
                <View style={styles.pulseDot} />
                <Text style={styles.liveBroadcastPillText}>LIVE</Text>
              </View>
            </View>

            <Text style={styles.channelBioText}>
              Pusat transmisi maklumat resmi Ketua Umum, Sekretariat Jenderal DPP PAN, dan Badan Saksi Nasional (BSN) untuk seluruh kader dan relawan di Indonesia.
            </Text>
          </View>

          {/* Feed Postingan Saluran Satu Arah */}
          {channelPosts.map((post) => {
            const reaction = userReactions[post.id];

            return (
              <Card
                key={post.id}
                style={[
                  styles.channelPostCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                {/* Post Top Meta */}
                <View style={styles.postMetaRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <View style={[styles.postBadgeCircle, { backgroundColor: colors.primaryLight }]}>
                      <Feather name="shield" size={13} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.postSenderText, { color: colors.text }]} numberOfLines={1}>
                        {post.sender}
                      </Text>
                      <Text style={[styles.postTimeText, { color: colors.textMuted }]}>
                        {post.time}
                      </Text>
                    </View>
                  </View>

                  <Pill label={post.tag} tone={post.tagTone} />
                </View>

                {/* Post Title */}
                <Text style={[styles.postTitleText, { color: colors.text }]}>
                  {post.title}
                </Text>

                {/* Post Content Paragraphs */}
                <View style={styles.postContentBox}>
                  {post.content.map((line, idx) => (
                    <Text key={idx} style={[styles.postBodyText, { color: colors.text }]}>
                      {line}
                    </Text>
                  ))}
                </View>

                {/* Divider */}
                <View style={[styles.postDivider, { backgroundColor: colors.border }]} />

                {/* Reactions & Actions Row */}
                <View style={styles.postActionsRow}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Pressable
                      onPress={() => handleToggleReaction(post.id, 'thumbs')}
                      style={[
                        styles.reactionBtn,
                        reaction === 'thumbs' && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                        { borderColor: colors.border },
                      ]}
                    >
                      <Text style={styles.reactionEmoji}>👍</Text>
                      <Text style={[styles.reactionCountText, { color: reaction === 'thumbs' ? colors.primary : colors.textMuted }]}>
                        {post.initialReactions.thumbs}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleToggleReaction(post.id, 'heart')}
                      style={[
                        styles.reactionBtn,
                        reaction === 'heart' && { backgroundColor: isDark ? 'rgba(220,38,38,0.2)' : '#FEE2E2', borderColor: '#DC2626' },
                        { borderColor: colors.border },
                      ]}
                    >
                      <Text style={styles.reactionEmoji}>❤️</Text>
                      <Text style={[styles.reactionCountText, { color: reaction === 'heart' ? '#DC2626' : colors.textMuted }]}>
                        {post.initialReactions.heart}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleToggleReaction(post.id, 'fire')}
                      style={[
                        styles.reactionBtn,
                        reaction === 'fire' && { backgroundColor: isDark ? 'rgba(245,158,11,0.2)' : '#FEF3C7', borderColor: '#D97706' },
                        { borderColor: colors.border },
                      ]}
                    >
                      <Text style={styles.reactionEmoji}>🔥</Text>
                      <Text style={[styles.reactionCountText, { color: reaction === 'fire' ? '#D97706' : colors.textMuted }]}>
                        {post.initialReactions.fire}
                      </Text>
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={() => {
                      Alert.alert('Instruksi Disalin', 'Teks maklumat resmi berhasil disalin untuk diteruskan ke grup posko pemenangan.');
                    }}
                    style={({ pressed }) => [
                      styles.shareActionBtn,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Feather name="share-2" size={13} color={colors.primary} />
                    <Text style={[styles.shareActionBtnText, { color: colors.primary }]}>Bagikan</Text>
                  </Pressable>
                </View>
              </Card>
            );
          })}

          {/* Footer Informative Note */}
          <View
            style={[
              styles.channelFooterNote,
              { backgroundColor: isDark ? 'rgba(0,43,82,0.2)' : '#F0F9FF', borderColor: isDark ? '#0A3D6B' : '#BAE6FD' },
            ]}
          >
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={[styles.channelFooterNoteText, { color: colors.textMuted }]}>
              Saluran resmi ini bersifat komunikasi satu arah langsung dari Pengurus Pusat DPP & BSN PAN demi keabsahan instruksi komando.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* 3. TAB CONTENT: GRUP SAKSI TPS (INTERAKSI DUA ARAH) */}
      {activeTab === 'group' && (
        <View style={{ flex: 1 }}>
          {!hasWitnessRole ? (
            /* Terkunci untuk Relawan Biasa */
            <View style={styles.lockedContainer}>
              <View
                style={[
                  styles.lockedCardBox,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={[styles.lockedIconCircle, { backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : '#FEF3C7' }]}>
                  <Feather name="lock" size={32} color="#D97706" />
                </View>

                <Text style={[styles.lockedTitle, { color: colors.text }]}>
                  Grup Koordinasi Saksi TPS Terkunci
                </Text>
                <Text style={[styles.lockedDesc, { color: colors.textMuted }]}>
                  Fitur obrolan dua arah ini hanya dapat diakses oleh relawan yang telah resmi memegang SK Mandat Saksi TPS dari DPD PAN untuk kerahasiaan pelaporan suara bilik.
                </Text>

                <View style={[styles.unlockStepsCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', borderColor: colors.border }]}>
                  <Text style={[styles.unlockStepsHeading, { color: colors.text }]}>
                    Cara Membuka Akses Grup Saksi:
                  </Text>
                  <Text style={[styles.unlockStepItem, { color: colors.textMuted }]}>
                    1. Buka Menu Profil simPAN
                  </Text>
                  <Text style={[styles.unlockStepItem, { color: colors.textMuted }]}>
                    2. Masuk ke menu "Unlock Mandat Saksi TPS"
                  </Text>
                  <Text style={[styles.unlockStepItem, { color: colors.textMuted }]}>
                    3. Selesaikan 4 syarat akreditasi BSN partai
                  </Text>
                </View>

                <PrimaryButton
                  label="Buka Menu Profil & Unlock Saksi"
                  onPress={() => navigation.navigate('Profile')}
                  style={{ width: '100%', marginTop: 8 }}
                />
              </View>
            </View>
          ) : (
            /* Aktif untuk Relawan Saksi Resmi */
            <View style={{ flex: 1 }}>
              {/* Group Chat Sub-header */}
              <View
                style={[
                  styles.groupChatHeader,
                  { backgroundColor: colors.surface, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.groupAvatarCircle, { backgroundColor: colors.primaryLight }]}>
                  <Feather name="users" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.groupChatName, { color: colors.text }]} numberOfLines={1}>
                    Grup Koordinasi Saksi TPS Kel. Dago
                  </Text>
                  <Text style={[styles.groupChatSub, { color: colors.success }]}>
                    ● 6 Saksi & 1 Korlap Online (Aktif Dua Arah)
                  </Text>
                </View>
                <Pill label="Mandat Aktif" tone="success" />
              </View>

              {/* Chat Feed */}
              <FlatList
                data={chatMessages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatListContent}
                renderItem={({ item }) => {
                  const isMe = item.isSelf;

                  return (
                    <View
                      style={[
                        styles.chatBubbleRow,
                        isMe ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' },
                      ]}
                    >
                      <View
                        style={[
                          styles.chatBubble,
                          isMe
                            ? [styles.myBubble, { backgroundColor: colors.primary }]
                            : [styles.otherBubble, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: colors.border }],
                        ]}
                      >
                        {!isMe && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <Text style={[styles.chatSenderName, { color: colors.primary }]}>
                              {item.senderName}
                            </Text>
                            <Text style={[styles.chatSenderRole, { color: colors.textMuted }]}>
                              • {item.senderRole}
                            </Text>
                          </View>
                        )}
                        <Text style={[styles.chatText, { color: isMe ? '#FFFFFF' : colors.text }]}>
                          {item.text}
                        </Text>
                        <Text
                          style={[
                            styles.chatTimeText,
                            { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textMuted },
                          ]}
                        >
                          {item.time}
                        </Text>
                      </View>
                    </View>
                  );
                }}
              />

              {/* Chat Input Bar */}
              <View
                style={[
                  styles.chatInputBar,
                  { backgroundColor: colors.surface, borderTopColor: colors.border },
                ]}
              >
                <TextInput
                  style={[
                    styles.chatTextInput,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFC',
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Kirim pesan koordinasi bilik..."
                  placeholderTextColor={colors.textMuted}
                  value={inputChatText}
                  onChangeText={setInputChatText}
                />
                <TouchableOpacity
                  onPress={handleSendChatMessage}
                  style={[
                    styles.chatSendBtn,
                    { backgroundColor: colors.primary, opacity: inputChatText.trim() ? 1 : 0.6 },
                  ]}
                  disabled={!inputChatText.trim()}
                >
                  <Feather name="send" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Top Tabs
  topTabsBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTabButton: {
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: fonts.bold,
  },

  // Channel Content
  channelContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  channelHeaderCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  channelHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  channelAvatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  channelLogoImage: {
    width: '100%',
    height: '100%',
  },
  channelTitleText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontFamily: fonts.extraBold,
  },
  channelFollowerText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  liveBroadcastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(230,0,18,0.25)',
    borderColor: '#DC2626',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveBroadcastPillText: {
    color: '#FCA5A5',
    fontSize: 9.5,
    fontFamily: fonts.bold,
  },
  channelBioText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11.5,
    lineHeight: 17,
    fontFamily: fonts.regular,
  },

  // Post Card
  channelPostCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  postMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postBadgeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postSenderText: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  postTimeText: {
    fontSize: 10,
    fontFamily: fonts.regular,
  },
  postTitleText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    lineHeight: 18,
  },
  postContentBox: {
    gap: 6,
  },
  postBodyText: {
    fontSize: 11.5,
    fontFamily: fonts.regular,
    lineHeight: 17,
  },
  postDivider: {
    height: 1,
    width: '100%',
    marginVertical: 2,
  },
  postActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCountText: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  shareActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  shareActionBtnText: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  channelFooterNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  channelFooterNoteText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    flex: 1,
    lineHeight: 16,
  },

  // Locked State
  lockedContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedCardBox: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  lockedIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  lockedTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  lockedDesc: {
    fontSize: 11.5,
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: 17,
  },
  unlockStepsCard: {
    width: '100%',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
    marginTop: 4,
  },
  unlockStepsHeading: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  unlockStepItem: {
    fontSize: 10.5,
    fontFamily: fonts.medium,
  },

  // Group Chat Active
  groupChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: 10,
  },
  groupAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupChatName: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  groupChatSub: {
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  chatListContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  chatBubbleRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  chatBubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    gap: 2,
  },
  myBubble: {
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 2,
  },
  chatSenderName: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  chatSenderRole: {
    fontSize: 10,
    fontFamily: fonts.regular,
  },
  chatText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    lineHeight: 17,
  },
  chatTimeText: {
    fontSize: 9,
    fontFamily: fonts.regular,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderTopWidth: 1,
    gap: 8,
  },
  chatTextInput: {
    flex: 1,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  chatSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
