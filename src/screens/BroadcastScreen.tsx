import React, { useState, useRef, useEffect } from 'react';
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
import { BRAND_ASSETS, LEADER_AVATARS, IMAGES } from '../data/images';

type BroadcastTab = 'channel' | 'group';

interface PostReaction {
  thumbs: number;
  heart: number;
  fire: number;
  totalDisplay: string;
}

interface ChannelPost {
  id: string;
  senderName: string;
  senderRole: string;
  senderAvatar: any;
  dateBadge?: string;
  time: string;
  type: 'video' | 'text' | 'document';
  mediaImage?: any;
  videoDuration?: string;
  documentName?: string;
  title: string;
  content: string;
  reactions: PostReaction;
  shareCount: string;
}

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  time: string;
  text: string;
  isSelf?: boolean;
}

const OFFICIAL_CHANNEL_POSTS: ChannelPost[] = [
  {
    id: 'post-bsn',
    senderName: 'Badan Saksi Nasional (BSN)',
    senderRole: 'Direktorat Pengawalan Suara DPP PAN',
    senderAvatar: LEADER_AVATARS.sekretarisJendral,
    dateBadge: '17 September 2026',
    time: '16:00 WIB',
    type: 'document',
    documentName: 'JUKNIS-BSN-C1-PLANO-DIGITAL.pdf',
    title: 'Standar Operasional Presensi Geofence GPS & Validasi Foto C1 Plano Digital',
    content:
      'Petunjuk Teknis Pengawalan Bilik Suara:\n\n1. Seluruh Saksi TPS wajib hadir sebelum pukul 07:00 WIB dan melakukan presensi GPS melalui menu "Presensi" simPAN di radius TPS penugasan.\n2. Segera foto formulir C1 Plano secara tegak lurus, pencahayaan merata tanpa pantulan cahaya, dan pastikan tanda tangan KPPS terbaca tajam sebelum diunggah ke server terenkripsi partai.',
    reactions: {
      thumbs: 88400,
      heart: 42100,
      fire: 26500,
      totalDisplay: '157 Rb Reaksi',
    },
    shareCount: '18.4 Rb',
  },
  {
    id: 'post-ketua-dpp',
    senderName: 'Ketua DPP PAN',
    senderRole: 'Badan Pemenangan Pemilu (Bappilu) DPP',
    senderAvatar: LEADER_AVATARS.ketuaDpp,
    dateBadge: '18 September 2026',
    time: '21:15 WIB',
    type: 'text',
    title: 'Konsolidasi Posko Wilayah & Kesiapan Pengawalan Saksi Terakreditasi BSN',
    content:
      'Seluruh jajaran pengurus DPD, DPC, ranting, dan relawan simpatisan diinstruksikan:\n\n1. Merapatkan barisan di Posko Pemenangan wilayah masing-masing untuk pemetaan titik TPS rawan.\n2. Memastikan relawan yang telah dimandatkan telah menyelesaikan sertifikasi Bimtek Saksi BSN.\n3. Menyimpan nomor kontak darurat Korlap dan Tim Advokasi Hukum BSN setempat guna respon cepat laporan dugaan pelanggaran.',
    reactions: {
      thumbs: 88400,
      heart: 42100,
      fire: 26500,
      totalDisplay: '157 Rb Reaksi',
    },
    shareCount: '18.4 Rb',
  },
  {
    id: 'post-ketum',
    senderName: 'Zulkifli Hasan',
    senderRole: 'Ketua Umum DPP PAN',
    senderAvatar: LEADER_AVATARS.ketuaUmum,
    dateBadge: 'Hari Ini • 19 September 2026',
    time: '08:30 WIB',
    type: 'video',
    mediaImage: IMAGES.tpsHero,
    videoDuration: '04:15 Menit',
    title: 'Kawal Marwah Suara Rakyat: Berdiri Teguh Tanpa Ragu di Setiap Bilik Suara',
    content:
      'Kepada seluruh kader pejuang, simpatisan, dan saksi TPS PAN di seluruh pelosok Tanah Air:\n\nSuara rakyat adalah amanat suci yang tidak boleh bergeser barang satu pun. Berdirilah tegak menjaga kemurnian formulir C1 Plano. Layani warga dengan keramahan, sapa masyarakat dengan senyuman, dan pastikan proses penghitungan suara di TPS Anda berlangsung jujur, adil, dan transparan.',
    reactions: {
      thumbs: 88400,
      heart: 42100,
      fire: 26500,
      totalDisplay: '157 Rb Reaksi',
    },
    shareCount: '18.4 Rb',
  },
];

const INITIAL_GROUP_CHATS: ChatMessage[] = [
  {
    id: 'msg-1',
    senderName: 'Asep Ridwan',
    senderRole: 'Korlap Babakan Asih',
    time: '06:45 WIB',
    text: 'Selamat pagi rekan-rekan saksi TPS Kluster Bojongloa & Babakan Asih! Pastikan ponsel terisi daya penuh dan surat mandat fisik ada di saku.',
  },
  {
    id: 'msg-2',
    senderName: 'Rudi Saputra',
    senderRole: 'Saksi TPS 012',
    time: '07:05 WIB',
    text: 'Siap Pak Korlap! Presensi GPS di TPS 012 sudah terekam di simPAN. KPPS saat ini sedang membuka kotak suara.',
  },
  {
    id: 'msg-3',
    senderName: 'Hendra Gunawan',
    senderRole: 'Saksi TPS 013',
    time: '07:12 WIB',
    text: 'TPS 013 hadir lengkap. Logistik surat suara dan plano tersegel rapi. Kondisi kondusif.',
  },
  {
    id: 'msg-4',
    senderName: 'Siti Rahmawati',
    senderRole: 'Relawan Saksi',
    time: '07:18 WIB',
    text: 'Posko Babakan Asih siap membackup logistik dan konsumsi lapangan. Semangat kawal suara partai!',
    isSelf: true,
  },
];

function VerifiedBadge({ size = 15 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#0066B3',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Feather name="check" size={Math.round(size * 0.7)} color="#FFFFFF" />
    </View>
  );
}

export default function BroadcastScreen() {
  const { role, currentUser } = useApp();
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<BroadcastTab>('channel');
  const [isFollowed, setIsFollowed] = useState(true);
  const [userReactions, setUserReactions] = useState<Record<string, 'thumbs' | 'heart' | 'fire' | null>>({});

  // Group chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_GROUP_CHATS);
  const [inputChatText, setInputChatText] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);
  const hasInitialScrolled = useRef(false);

  useEffect(() => {
    if (activeTab === 'channel') {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Status kelayakan akses group chat (Relawan yang memegang SK Mandat Saksi / Saksi Resmi)
  const isWitnessRole = role === 'WITNESS' || role === 'TPS_WITNESS';
  const hasWitnessRole =
    isWitnessRole ||
    currentUser.roles.some((r) => r.role === 'WITNESS' || (r.role as any) === 'TPS_WITNESS') ||
    currentUser.dimensions?.programs?.programSaksi === 'MANDATED';

  const handleToggleReaction = (postId: string, type: 'thumbs' | 'heart' | 'fire') => {
    const current = userReactions[postId];
    const isSame = current === type;
    setUserReactions((prev) => ({
      ...prev,
      [postId]: isSame ? null : type,
    }));

    const label = type === 'thumbs' ? '👍 Suka' : type === 'heart' ? '❤️ Komitmen' : '🔥 Semangat';
    Alert.alert(
      isSame ? 'Reaksi Dibatalkan' : 'Reaksi Tercatat',
      isSame
        ? 'Reaksi Anda telah dibatalkan.'
        : `Apresiasi ${label} berhasil dikirim ke saluran resmi pengurus partai.`
    );
  };

  const handleSharePost = (post: ChannelPost) => {
    Alert.alert(
      'Bagikan Amanat / Instruksi',
      `Teks siaran "${post.title}" telah disalin ke papan klip untuk diteruskan ke grup posko pemenangan & jejaring relawan.`,
      [{ text: 'Tutup', style: 'default' }]
    );
  };

  const handleOpenLink = (title: string, url?: string) => {
    Alert.alert(
      'Membuka Dokumen / Siaran',
      `Menghubungkan ke server informasi simPAN:\n\n${title}\n${url || ''}`,
      [{ text: 'Lanjutkan', style: 'default' }]
    );
  };

  const toggleFollow = () => {
    if (isFollowed) {
      setIsFollowed(false);
      Alert.alert('Saluran Dibisukan', 'Anda tidak lagi menerima notifikasi pembaruan siaran langsung.');
    } else {
      setIsFollowed(true);
      Alert.alert(
        'Mengikuti Saluran Resmi',
        'Anda akan menerima pemberitahuan langsung setiap kali Ketua Umum atau Bappilu menerbitkan amanat baru.'
      );
    }
  };

  const handleSendChatMessage = () => {
    if (!inputChatText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: currentUser.identity.name || 'Siti Rahmawati',
      senderRole: hasWitnessRole ? 'Relawan Saksi TPS' : 'Relawan',
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
      {/* 1. BRANDED SEGMENTED TAB CONTROL */}
      <View style={[styles.tabBarWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => setActiveTab('channel')}
          style={[
            styles.tabItem,
            activeTab === 'channel'
              ? [styles.tabItemActive, { backgroundColor: isDark ? '#003366' : '#EBF4FF', borderColor: colors.primary }]
              : { borderColor: 'transparent' },
          ]}
        >
          <Feather
            name="volume-2"
            size={14}
            color={activeTab === 'channel' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabItemText,
              { color: activeTab === 'channel' ? colors.primary : colors.textMuted },
              activeTab === 'channel' && { fontFamily: fonts.bold },
            ]}
          >
            Saluran Pusat
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('group')}
          style={[
            styles.tabItem,
            activeTab === 'group'
              ? [styles.tabItemActive, { backgroundColor: isDark ? '#003366' : '#EBF4FF', borderColor: colors.primary }]
              : { borderColor: 'transparent' },
          ]}
        >
          <Feather
            name={hasWitnessRole ? 'message-circle' : 'lock'}
            size={14}
            color={activeTab === 'group' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabItemText,
              { color: activeTab === 'group' ? colors.primary : colors.textMuted },
              activeTab === 'group' && { fontFamily: fonts.bold },
            ]}
          >
            Grup Saksi
          </Text>
        </Pressable>
      </View>

      {/* 2. TAB CONTENT: SALURAN PUSAT (OFFICIAL PAN BROADCAST CHANNEL) */}
      {activeTab === 'channel' && (
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (!hasInitialScrolled.current) {
              scrollViewRef.current?.scrollToEnd({ animated: false });
              hasInitialScrolled.current = true;
            }
          }}
        >

          {/* LIST OF OFFICIAL BROADCAST POSTS */}
          {OFFICIAL_CHANNEL_POSTS.map((post) => {
            const reaction = userReactions[post.id];

            return (
              <View key={post.id} style={styles.postWrapper}>
                {/* DATE BADGE */}
                {post.dateBadge && (
                  <View style={styles.dateBadgeWrap}>
                    <View style={[styles.dateBadgePill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Feather name="calendar" size={11} color={colors.textMuted} />
                      <Text style={[styles.dateBadgeText, { color: colors.textMuted }]}>
                        {post.dateBadge}
                      </Text>
                    </View>
                  </View>
                )}

                {/* POST CARD */}
                <Card
                  style={[
                    styles.postCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  {/* AUTHOR ROW */}
                  <View style={styles.postAuthorRow}>
                    <Image source={post.senderAvatar} style={styles.postAvatarImage} />

                    <View style={{ flex: 1, gap: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Text style={[styles.postAuthorName, { color: colors.text }]}>
                          {post.senderName}
                        </Text>
                        <VerifiedBadge size={14} />
                      </View>
                      <Text style={[styles.postAuthorRole, { color: colors.textMuted }]}>
                        {post.senderRole}
                      </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={[styles.postTimeText, { color: colors.textMuted }]}>
                        {post.time}
                      </Text>
                    </View>
                  </View>

                  {/* MEDIA BANNER (IF TYPE IS VIDEO OR DOCUMENT) */}
                  {post.mediaImage && (
                    <View style={styles.postMediaWrap}>
                      <Image source={post.mediaImage} style={styles.postMediaImg} resizeMode="cover" />

                      {/* DARK GRADIENT VIGNETTE OVERLAY */}
                      <View style={styles.postMediaDarkOverlay} />


                      {/* PLAY BUTTON FOR VIDEO */}
                      {post.type === 'video' && (
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() =>
                            Alert.alert('Putar Siaran Video', `Memutar amanat Ketua Umum:\n"${post.title}"`)
                          }
                          style={styles.postPlayCenterBtn}
                        >
                          <View style={styles.postPlayCircle}>
                            <Feather name="play" size={24} color="#ffffff65" style={{ marginLeft: 3 }} />
                          </View>
                          {post.videoDuration && (
                            <View style={styles.postDurationBadge}>
                              <Feather name="clock" size={10} color="#ffffff65" />
                              <Text style={styles.postDurationText}>{post.videoDuration}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* POST CONTENT BODY */}
                  <View style={styles.postBodyWrap}>
                    <Text style={[styles.postTitleText, { color: colors.text }]}>
                      {post.title}
                    </Text>

                    <Text style={[styles.postDescText, { color: colors.text }]}>
                      {post.content}
                    </Text>

                    {/* DOKUMEN LAMPIRAN */}
                    {post.documentName && (
                      <View style={styles.postDocumentRow}>
                        <Feather name="file" size={16} color="#94A3B8" />
                        <Text style={[styles.postDocumentText, { color: colors.textMuted }]}>
                          {post.documentName}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* POST FOOTER DIVIDER */}
                  <View style={[styles.postDivider, { backgroundColor: colors.border }]} />

                  {/* REACTION & SHARE BAR */}
                  <View style={styles.postFooterBar}>
                    {/* REACTION PILLS */}
                    <View style={styles.reactionGroupRow}>
                      <Pressable
                        onPress={() => handleToggleReaction(post.id, 'thumbs')}
                        style={[
                          styles.reactionChip,
                          {
                            backgroundColor:
                              reaction === 'thumbs'
                                ? (isDark ? '#003366' : '#EBF4FF')
                                : (isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC'),
                            borderColor: reaction === 'thumbs' ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={styles.reactionEmoji}>👍</Text>
                        <Text
                          style={[
                            styles.reactionCountText,
                            { color: reaction === 'thumbs' ? colors.primary : colors.textMuted },
                          ]}
                        >
                          {reaction === 'thumbs' ? 'Suka' : '88.4 Rb'}
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => handleToggleReaction(post.id, 'heart')}
                        style={[
                          styles.reactionChip,
                          {
                            backgroundColor:
                              reaction === 'heart'
                                ? (isDark ? 'rgba(220,38,38,0.2)' : '#FEE2E2')
                                : (isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC'),
                            borderColor: reaction === 'heart' ? '#DC2626' : colors.border,
                          },
                        ]}
                      >
                        <Text style={styles.reactionEmoji}>❤️</Text>
                        <Text
                          style={[
                            styles.reactionCountText,
                            { color: reaction === 'heart' ? '#DC2626' : colors.textMuted },
                          ]}
                        >
                          {reaction === 'heart' ? 'Komitmen' : '42.1 Rb'}
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => handleToggleReaction(post.id, 'fire')}
                        style={[
                          styles.reactionChip,
                          {
                            backgroundColor:
                              reaction === 'fire'
                                ? (isDark ? 'rgba(245,158,11,0.2)' : '#FEF3C7')
                                : (isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC'),
                            borderColor: reaction === 'fire' ? '#D97706' : colors.border,
                          },
                        ]}
                      >
                        <Text style={styles.reactionEmoji}>🔥</Text>
                        <Text
                          style={[
                            styles.reactionCountText,
                            { color: reaction === 'fire' ? '#D97706' : colors.textMuted },
                          ]}
                        >
                          {reaction === 'fire' ? 'Semangat' : '26.5 Rb'}
                        </Text>
                      </Pressable>
                    </View>

                    {/* SHARE BUTTON */}
                    <Pressable
                      onPress={() => handleSharePost(post)}
                      style={({ pressed }) => [
                        styles.shareBtn,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                          borderColor: colors.border,
                        },
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Feather name="share-2" size={13} color={colors.primary} />
                      <Text style={[styles.shareBtnText, { color: colors.primary }]}>Bagikan</Text>
                    </Pressable>
                  </View>
                </Card>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* 3. TAB CONTENT: GRUP SAKSI TPS (2 ARAH) */}
      {activeTab === 'group' && (
        <View style={{ flex: 1 }}>
          {!hasWitnessRole ? (
            /* Mode Terkunci untuk Relawan Biasa */
            <View style={styles.lockedWrap}>
              <Card
                style={[
                  styles.lockedCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={[styles.lockedIconWrap, { backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : '#FEF3C7' }]}>
                  <Feather name="lock" size={32} color="#D97706" />
                </View>

                <Text style={[styles.lockedTitle, { color: colors.text }]}>
                  Grup Koordinasi Saksi TPS Terkunci
                </Text>
                <Text style={[styles.lockedDesc, { color: colors.textMuted }]}>
                  Fitur komunikasi dua arah ini dipusatkan khusus bagi relawan yang telah resmi memegang SK Mandat Saksi TPS dari DPD PAN guna menjamin keamanan dan kerahasiaan pengawalan suara di TPS.
                </Text>

                <View style={[styles.lockedStepBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', borderColor: colors.border }]}>
                  <Text style={[styles.lockedStepHeading, { color: colors.text }]}>
                    4 Instrumen Syarat Akreditasi BSN:
                  </Text>
                  <Text style={[styles.lockedStepItem, { color: colors.textMuted }]}>
                    ✓ Kelulusan Bimtek Saksi Pemilu (Academy)
                  </Text>
                  <Text style={[styles.lockedStepItem, { color: colors.textMuted }]}>
                    ✓ Verifikasi NIK e-KTP & Domisili DPT TPS
                  </Text>
                  <Text style={[styles.lockedStepItem, { color: colors.textMuted }]}>
                    ✓ Penandatanganan Pakta Integritas Digital
                  </Text>
                  <Text style={[styles.lockedStepItem, { color: colors.textMuted }]}>
                    ✓ Penerbitan Surat Mandat Resmi DPD PAN
                  </Text>
                </View>

                <PrimaryButton
                  label="Buka Menu Profil & Unlock Mandat Saksi"
                  onPress={() => navigation.navigate('Profile')}
                  style={{ width: '100%', marginTop: 8 }}
                />
              </Card>
            </View>
          ) : (
            /* Mode Aktif untuk Relawan yang Telah Mendapat Mandat Saksi */
            <View style={{ flex: 1 }}>
              {/* Group Chat Sub-header */}
              <View
                style={[
                  styles.groupSubHeader,
                  { backgroundColor: colors.surface, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.groupAvatarCircle, { backgroundColor: colors.primaryLight }]}>
                  <Feather name="users" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.groupNameText, { color: colors.text }]} numberOfLines={1}>
                    Grup Saksi TPS Kelurahan Babakan Asih
                  </Text>
                  <Text style={[styles.groupStatusText, { color: colors.success }]}>
                    ● 6 Saksi TPS & 1 Korlap Online (Aktif 2 Arah)
                  </Text>
                </View>
                <Pill label="Mandat Sah" tone="success" />
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
                            : [styles.otherBubble, { backgroundColor: colors.surface, borderColor: colors.border }],
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
                  placeholder="Kirim pesan koordinasi ke Korlap..."
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
  screen: {
    flex: 1,
  },

  // 1. SEGMENTED TAB CONTROL
  tabBarWrap: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  tabItemActive: {
    borderWidth: 1,
  },
  tabItemText: {
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tabLockBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tabLockBadgeText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },

  // 2. SCROLL CONTENT
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // CHANNEL HERO BRAND CARD
  channelHeroCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  channelHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  channelAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  channelEmblemImage: {
    width: 38,
    height: 38,
  },
  channelHeroTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  channelHeroSubtitle: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: '#E0F2FE',
  },
  channelHeroMetaText: {
    fontSize: 10.5,
    fontFamily: fonts.regular,
    color: '#BAE6FD',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  followButtonText: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  channelHeroDivider: {
    height: 1,
    width: '100%',
  },
  channelHeroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  channelHeroNoticeText: {
    fontSize: 10.5,
    fontFamily: fonts.regular,
    color: '#E0F2FE',
    flex: 1,
    lineHeight: 15,
  },

  // DATE BADGE
  dateBadgeWrap: {
    alignItems: 'center',
    marginVertical: 4,
  },
  dateBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dateBadgeText: {
    fontSize: 11,
    fontFamily: fonts.medium,
  },

  // POST CARD
  postWrapper: {
    gap: spacing.sm,
  },
  postCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  postAuthorName: {
    fontSize: 13.5,
    fontFamily: fonts.bold,
  },
  postAuthorRole: {
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  postTimeText: {
    fontSize: 10,
    fontFamily: fonts.regular,
  },

  // MEDIA CONTAINER
  postMediaWrap: {
    width: '100%',
    height: 190,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#002B52',
  },
  postMediaImg: {
    width: '100%',
    height: '100%',
  },
  postMediaDarkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  postMediaTopBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 43, 82, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  postMediaTopBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  postPlayCenterBtn: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  postPlayCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.17)',
    borderWidth: 2,
    borderColor: '#ffffff65',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.29)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  postDurationText: {
    color: '#ffffff65',
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  postDocCenterBtn: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  postDocIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  postDocText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fonts.bold,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },

  // POST BODY
  postBodyWrap: {
    gap: 6,
  },
  postTitleText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    lineHeight: 20,
  },
  postDescText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    lineHeight: 18,
  },
  postDocumentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginTop: 4,
  },
  postDocumentText: {
    fontSize: 12.5,
    fontFamily: fonts.medium,
  },

  // POST FOOTER
  postDivider: {
    height: 1,
    width: '100%',
    marginVertical: 2,
  },
  postFooterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reactionGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCountText: {
    fontSize: 10.5,
    fontFamily: fonts.medium,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  shareBtnText: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },

  // LOCKED STATE (GRUP SAKSI)
  lockedWrap: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedCard: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  lockedIconWrap: {
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
  lockedStepBox: {
    width: '100%',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
    marginTop: 4,
  },
  lockedStepHeading: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  lockedStepItem: {
    fontSize: 10.5,
    fontFamily: fonts.medium,
  },

  // GROUP CHAT ACTIVE
  groupSubHeader: {
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
  groupNameText: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  groupStatusText: {
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  chatListContent: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: 24,
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
