import React, { useState, useRef } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
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
import { Pill, PrimaryButton } from '../components/ui';
import { fonts, fontSize, radius, spacing } from '../theme';
import { BRAND_ASSETS, LEADER_AVATARS, IMAGES } from '../data/images';

type BroadcastTab = 'channel' | 'group';

interface PostReaction {
  thumbs: number;
  heart: number;
  fire: number;
  pray?: number;
  totalDisplay: string;
}

interface ChannelPost {
  id: string;
  senderName: string;
  senderTitle: string;
  senderAvatar: any;
  dateBadge?: string;
  time: string;
  isEdited?: boolean;
  type: 'text' | 'video' | 'document';
  mediaImage?: any;
  mediaSize?: string;
  mediaWatermark?: string;
  boldHeadline?: string;
  bodyText: string;
  linkText: string;
  linkUrl: string;
  reactions: PostReaction;
  forwardCount: string;
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
    senderName: 'Ketua DPP PAN',
    senderTitle: 'Bidang Pemenangan Pemilu DPP PAN',
    senderAvatar: LEADER_AVATARS.ketuaDpp,
    dateBadge: '18 September 2026',
    time: '22.35',
    type: 'text',
    bodyText:
      'Seluruh jajaran pengurus DPD, DPC, relawan simpatisan, dan saksi TPS diinstruksikan siaga penuh menjaga marwah suara rakyat. Koordinasi lapangan dipusatkan di posko pemenangan masing-masing wilayah untuk memastikan pengawalan plano C1 berjalan transparan.',
    linkText: 'Pelajari selengkapnya: https://simpan.pan.or.id/instruksi-siaga-pemilu-2026',
    linkUrl: 'https://simpan.pan.or.id/instruksi-siaga-pemilu-2026',
    reactions: {
      thumbs: 42000,
      heart: 12000,
      fire: 5000,
      pray: 2000,
      totalDisplay: '61Rb',
    },
    forwardCount: '8Rb',
  },
  {
    id: 'post-2',
    senderName: 'Ketua Umum DPP PAN',
    senderTitle: 'Amanat Langsung Pemimpin Partai',
    senderAvatar: LEADER_AVATARS.ketuaUmum,
    dateBadge: 'Hari Ini',
    time: '23.04',
    isEdited: true,
    type: 'video',
    mediaImage: IMAGES.tpsHero,
    mediaSize: '25 MB',
    mediaWatermark: 'AMANAT KETUM',
    boldHeadline: 'Gerakan Sapa Warga & Pengawalan TPS Nasional.',
    bodyText:
      'Kepada seluruh pejuang dan relawan PAN yang saya banggakan: Teruslah hadir di tengah denyut nadi rakyat. Kawal integritas C1 Plano di setiap bilik suara demi kemenangan rakyat. Jangan biarkan hak suara umat dan rakyat Indonesia tercederai sedikit pun.',
    linkText: 'Akses siaran lengkap: https://pan.or.id/amanat-ketum-2026',
    linkUrl: 'https://pan.or.id/amanat-ketum-2026',
    reactions: {
      thumbs: 88000,
      heart: 36000,
      fire: 18000,
      totalDisplay: '142Rb',
    },
    forwardCount: '18Rb',
  },
  {
    id: 'post-3',
    senderName: 'Badan Saksi Nasional (BSN)',
    senderTitle: 'Direktorat Pengawalan Suara DPP PAN',
    senderAvatar: LEADER_AVATARS.sekretarisJendral,
    time: '15.00',
    type: 'document',
    mediaImage: IMAGES.c1Form,
    mediaSize: 'PDF Juknis • 8.4 MB',
    boldHeadline: 'Standar Operasional Presensi GPS & Rekapitulasi C1 Plano.',
    bodyText:
      'Saksi TPS wajib hadir sebelum pukul 07:00 WIB dan melakukan presensi geofence GPS di bilik suara serta mengunggah salinan plano tajam tanpa blur langsung ke server BSN.',
    linkText: 'Unduh juknis resmi: https://bsn.pan.or.id/sop-c1-plano-2026',
    linkUrl: 'https://bsn.pan.or.id/sop-c1-plano-2026',
    reactions: {
      thumbs: 31000,
      heart: 9000,
      fire: 5000,
      totalDisplay: '45Rb',
    },
    forwardCount: '6Rb',
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

function VerifiedBadge({ size = 16 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#00A3FF',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Feather name="check" size={Math.round(size * 0.72)} color="#FFFFFF" />
    </View>
  );
}

export default function BroadcastScreen() {
  const { role, currentUser } = useApp();
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<BroadcastTab>('channel');
  const [isFollowed, setIsFollowed] = useState(false);
  const [channelPosts, setChannelPosts] = useState<ChannelPost[]>(INITIAL_CHANNEL_POSTS);
  const [userReactions, setUserReactions] = useState<Record<string, 'thumbs' | 'heart' | 'fire' | null>>({});

  // Group chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_GROUP_CHATS);
  const [inputChatText, setInputChatText] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);

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

    Alert.alert(
      isSame ? 'Reaksi Dibatalkan' : 'Reaksi Dikirim',
      isSame
        ? 'Reaksi Anda telah dihapus dari siaran ini.'
        : `Anda memberikan reaksi ${type === 'thumbs' ? '👍 Suka' : type === 'heart' ? '❤️ Cinta' : '🔥 Semangat'} pada siaran resmi ini.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleSharePost = (postId: string) => {
    Alert.alert(
      'Teruskan Pesan WhatsApp',
      'Tautan dan isi maklumat resmi telah disalin ke papan klip Anda untuk diteruskan ke grup posko pemenangan.',
      [{ text: 'Tutup', style: 'default' }]
    );
  };

  const toggleFollow = () => {
    if (isFollowed) {
      setIsFollowed(false);
      Alert.alert('Batal Mengikuti', 'Anda tidak lagi mengikuti siaran langsung Saluran Pusat.');
    } else {
      setIsFollowed(true);
      Alert.alert(
        'Berhasil Mengikuti Saluran!',
        'Anda sekarang mengikuti saluran resmi DPP PAN. Notifikasi pembaruan maklumat langsung dari pimpinan pusat akan diterima secara real-time.'
      );
    }
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
      style={[styles.screen, { backgroundColor: '#0B141A' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0B141A" />

      {/* 1. WHATSAPP OFFICIAL CHANNEL TOP APP BAR */}
      <View style={styles.waHeaderBar}>
        <View style={styles.waHeaderLeft}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.waBackBtn, pressed && { opacity: 0.7 }]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="arrow-left" size={22} color="#E9EDEF" />
          </Pressable>

          <View style={styles.waAvatarWrap}>
            <Image source={LEADER_AVATARS.ketuaUmum} style={styles.waChannelAvatar} />
            <View style={styles.waAvatarBadge}>
              <Image source={BRAND_ASSETS.sunWhite} style={{ width: 9, height: 9 }} resizeMode="contain" />
            </View>
          </View>

          <View style={styles.waChannelTitleCol}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={styles.waChannelName} numberOfLines={1}>
                DPP PAN
              </Text>
              <VerifiedBadge size={15} />
            </View>
            <Text style={styles.waFollowerCount}>
              234JT pengikut
            </Text>
          </View>
        </View>

        <View style={styles.waHeaderRight}>
          <Pressable
            onPress={() => {
              Alert.alert(
                'Saluran Resmi DPP PAN',
                'ID Saluran: wa.me/channel/dpp-pan-official\n\nPusat transmisi maklumat resmi Ketua Umum, Sekretariat Jenderal DPP PAN, dan Badan Saksi Nasional.',
                [
                  { text: isFollowed ? 'Batal Mengikuti' : 'Ikuti Saluran', onPress: toggleFollow },
                  {
                    text: 'Bagikan Saluran',
                    onPress: () => Alert.alert('Bagikan', 'Tautan saluran resmi disalin: https://wa.me/channel/dpp-pan-official'),
                  },
                  { text: 'Tutup', style: 'cancel' },
                ]
              );
            }}
            style={({ pressed }) => [styles.waMoreBtn, pressed && { opacity: 0.7 }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="more-vertical" size={20} color="#E9EDEF" />
          </Pressable>
        </View>
      </View>

      {/* 2. TAB SELECTOR (SALURAN PUSAT VS GRUP SAKSI TPS) */}
      <View style={styles.waTabBar}>
        <Pressable
          onPress={() => setActiveTab('channel')}
          style={[styles.waTabItem, activeTab === 'channel' && styles.waTabItemActive]}
        >
          <Feather
            name="volume-2"
            size={13}
            color={activeTab === 'channel' ? '#25D366' : '#8696A0'}
          />
          <Text style={[styles.waTabItemText, activeTab === 'channel' && styles.waTabItemTextActive]}>
            Saluran Pusat
          </Text>
          <View style={styles.waLiveDot} />
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('group')}
          style={[styles.waTabItem, activeTab === 'group' && styles.waTabItemActive]}
        >
          <Feather
            name={hasWitnessRole ? 'message-circle' : 'lock'}
            size={13}
            color={activeTab === 'group' ? '#25D366' : '#8696A0'}
          />
          <Text style={[styles.waTabItemText, activeTab === 'group' && styles.waTabItemTextActive]}>
            Grup Saksi TPS
          </Text>
          {!hasWitnessRole && (
            <View style={styles.waLockBadge}>
              <Text style={styles.waLockBadgeText}>Kunci</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* 3. TAB CONTENT: SALURAN WHATSAPP (1 ARAH RESMI) */}
      {activeTab === 'channel' && (
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.waChatScroll}
            contentContainerStyle={styles.waChatScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* POST 1: Teks dari Ketua DPP PAN */}
            <View style={styles.waDateRow}>
              <View style={styles.waDateBadge}>
                <Text style={styles.waDateBadgeText}>18 September 2026</Text>
              </View>
            </View>

            <View style={styles.waPostContainer}>
              <View style={styles.waBubbleCard}>
                {/* Author Sub-header */}
                <View style={styles.waAuthorHeader}>
                  <Image source={LEADER_AVATARS.ketuaDpp} style={styles.waAuthorAvatar} />
                  <View style={{ flex: 1, gap: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Text style={styles.waAuthorName}>Ketua DPP PAN</Text>
                      <VerifiedBadge size={13} />
                    </View>
                    <Text style={styles.waAuthorTitle}>Bidang Pemenangan Pemilu</Text>
                  </View>
                  <Text style={styles.waTopTime}>22.35</Text>
                </View>

                {/* Content Text */}
                <Text style={styles.waBodyText}>
                  Seluruh jajaran pengurus DPD, DPC, relawan simpatisan, dan saksi TPS diinstruksikan siaga penuh menjaga marwah suara rakyat di seluruh TPS se-Indonesia.
                </Text>

                {/* Hyperlink */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => Alert.alert('Tautan Dibuka', 'Membuka dokumen juklak siaga pemilu di portal resmi simPAN...')}
                  style={{ marginTop: 6 }}
                >
                  <Text style={styles.waLinkText}>
                    Learn more:{' '}
                    <Text style={{ textDecorationLine: 'underline' }}>
                      https://simpan.pan.or.id/instruksi-siaga-pemilu
                    </Text>
                  </Text>
                </TouchableOpacity>

                <View style={styles.waBubbleFooter}>
                  <Text style={styles.waTimestamp}>22.35</Text>
                </View>
              </View>

              {/* WhatsApp Reactions Row Below Card */}
              <View style={styles.waReactionsRow}>
                <Pressable
                  onPress={() => handleToggleReaction('post-1', 'thumbs')}
                  style={styles.waReactionPill}
                >
                  <Text style={styles.waReactionEmojiStack}>👍 ❤️ 🙏 😂</Text>
                  <Text style={styles.waReactionCount}>61Rb</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleSharePost('post-1')}
                  style={styles.waSharePill}
                >
                  <Feather name="corner-up-right" size={13} color="#8696A0" />
                  <Text style={styles.waShareCount}>8Rb</Text>
                </Pressable>
              </View>
            </View>

            {/* DATE BADGE: HARI INI */}
            <View style={styles.waDateRow}>
              <View style={styles.waDateBadge}>
                <Text style={styles.waDateBadgeText}>9 September 2026</Text>
              </View>
            </View>

            {/* POST 2: VIDEO MEDIA CARD DARI KETUA UMUM DPP PAN (Sesuai Screenshot User) */}
            <View style={styles.waPostContainer}>
              <View style={styles.waBubbleCard}>
                {/* Author Sub-header */}
                <View style={styles.waAuthorHeader}>
                  <Image source={LEADER_AVATARS.ketuaUmum} style={styles.waAuthorAvatar} />
                  <View style={{ flex: 1, gap: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Text style={styles.waAuthorName}>Ketua Umum DPP PAN</Text>
                      <VerifiedBadge size={13} />
                    </View>
                    <Text style={styles.waAuthorTitle}>Amanat Langsung Pemimpin Partai</Text>
                  </View>
                  <View style={styles.waLiveVideoTag}>
                    <Text style={styles.waLiveVideoTagText}>VIDEO</Text>
                  </View>
                </View>

                {/* Media Image / Video Card Container */}
                <View style={styles.waMediaContainer}>
                  <Image
                    source={IMAGES.tpsHero}
                    style={styles.waMediaImage}
                    resizeMode="cover"
                  />
                  {/* Subtle Dark Vignette */}
                  <View style={styles.waMediaOverlay} />

                  {/* Watermark Text + Big Play Button */}
                  <View style={styles.waMediaCenterContent}>
                    <Text style={styles.waMediaBigText}>THE FEAT{'\n'}URE</Text>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => Alert.alert('Pemutaran Video', 'Memutar siaran eksklusif amanat Ketua Umum DPP PAN...')}
                      style={styles.waPlayButtonCircle}
                    >
                      <Feather name="play" size={24} color="#FFFFFF" style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                  </View>

                  {/* Download Indicator at Bottom-Left */}
                  <View style={styles.waDownloadBadge}>
                    <Feather name="download" size={12} color="#FFFFFF" />
                    <Text style={styles.waDownloadText}>25 MB</Text>
                  </View>
                </View>

                {/* Caption Description Below Video */}
                <View style={styles.waCaptionContainer}>
                  <Text style={styles.waCaptionText}>
                    <Text style={styles.waCaptionBold}>Not every spiral needs an audience.{' '}</Text>
                    Saksikan arahan langsung Ketua Umum mengenai pentingnya kawal suara C1 Plano dan pendekatan bersahaja ke warga secara bijaksana.
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => Alert.alert('Tautan Dibuka', 'Membuka tautan interaktif saluran WhatsApp resmi...')}
                    style={{ marginTop: 6 }}
                  >
                    <Text style={styles.waLinkText}>
                      Give it a try:{' '}
                      <Text style={{ textDecorationLine: 'underline' }}>
                        https://wa.me/13135550002
                      </Text>
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.waBubbleFooter}>
                    <Text style={styles.waTimestamp}>Diedit 23.04</Text>
                  </View>
                </View>
              </View>

              {/* Reactions Row Below Card */}
              <View style={styles.waReactionsRow}>
                <Pressable
                  onPress={() => handleToggleReaction('post-2', 'heart')}
                  style={styles.waReactionPill}
                >
                  <Text style={styles.waReactionEmojiStack}>👍 ❤️ 🔥 👏</Text>
                  <Text style={styles.waReactionCount}>142Rb</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleSharePost('post-2')}
                  style={styles.waSharePill}
                >
                  <Feather name="corner-up-right" size={13} color="#8696A0" />
                  <Text style={styles.waShareCount}>18Rb</Text>
                </Pressable>
              </View>
            </View>

            {/* POST 3: JUKNIS C1 PLANO BSN PAN */}
            <View style={styles.waPostContainer}>
              <View style={styles.waBubbleCard}>
                <View style={styles.waAuthorHeader}>
                  <Image source={LEADER_AVATARS.sekretarisJendral} style={styles.waAuthorAvatar} />
                  <View style={{ flex: 1, gap: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Text style={styles.waAuthorName}>Badan Saksi Nasional (BSN)</Text>
                      <VerifiedBadge size={13} />
                    </View>
                    <Text style={styles.waAuthorTitle}>Direktorat Pengawalan Suara</Text>
                  </View>
                  <Text style={styles.waTopTime}>15.00</Text>
                </View>

                <View style={[styles.waMediaContainer, { height: 160 }]}>
                  <Image source={IMAGES.c1Form} style={styles.waMediaImage} resizeMode="cover" />
                  <View style={styles.waMediaOverlay} />
                  <View style={styles.waDownloadBadge}>
                    <Feather name="file-text" size={12} color="#FFFFFF" />
                    <Text style={styles.waDownloadText}>PDF Juknis • 8.4 MB</Text>
                  </View>
                </View>

                <View style={styles.waCaptionContainer}>
                  <Text style={styles.waCaptionText}>
                    <Text style={styles.waCaptionBold}>Standar Operasional C1 Plano Digital.{' '}</Text>
                    Pastikan swafoto dan lembar formulir plano terbaca tajam tanpa pantulan cahaya sebelum diunggah ke server terenkripsi simPAN.
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => Alert.alert('Juknis BSN', 'Mengunduh berkas petunjuk teknis saksi TPS BSN PAN...')}
                    style={{ marginTop: 6 }}
                  >
                    <Text style={styles.waLinkText}>
                      Akses juknis:{' '}
                      <Text style={{ textDecorationLine: 'underline' }}>
                        https://bsn.pan.or.id/juknis-saksi-2026
                      </Text>
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.waBubbleFooter}>
                    <Text style={styles.waTimestamp}>15.00</Text>
                  </View>
                </View>
              </View>

              <View style={styles.waReactionsRow}>
                <Pressable
                  onPress={() => handleToggleReaction('post-3', 'fire')}
                  style={styles.waReactionPill}
                >
                  <Text style={styles.waReactionEmojiStack}>👍 ❤️ 🙏</Text>
                  <Text style={styles.waReactionCount}>45Rb</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleSharePost('post-3')}
                  style={styles.waSharePill}
                >
                  <Feather name="corner-up-right" size={13} color="#8696A0" />
                  <Text style={styles.waShareCount}>6Rb</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>

          {/* FLOATING SCROLL TO BOTTOM BUTTON */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            style={styles.waFabScrollBottom}
          >
            <Feather name="chevron-down" size={18} color="#8696A0" />
          </TouchableOpacity>

          {/* 4. BOTTOM FIXED BAR (IKUTI SALURAN & PRIVASI WHATSAPP) */}
          <View style={styles.waBottomBarContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={toggleFollow}
              style={[
                styles.waFollowButton,
                isFollowed && styles.waFollowButtonActive,
              ]}
            >
              {isFollowed ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name="check" size={17} color="#0B141A" />
                  <Text style={styles.waFollowButtonText}>Mengikuti</Text>
                </View>
              ) : (
                <Text style={styles.waFollowButtonText}>Ikuti saluran</Text>
              )}
            </TouchableOpacity>

            <View style={styles.waPrivacyRow}>
              <Text style={styles.waPrivacyText}>
                Saluran ini memiliki privasi tambahan untuk profil dan nomor telepon.{' '}
                <Text
                  onPress={() => Alert.alert('Privasi Saluran', 'Nomor telepon dan profil Anda dirahasiakan dan tidak dapat dilihat oleh pengikut saluran lainnya.')}
                  style={styles.waPrivacyLink}
                >
                  Pelajari selengkapnya.
                </Text>
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 4. TAB CONTENT: GRUP SAKSI TPS (INTERAKSI DUA ARAH) */}
      {activeTab === 'group' && (
        <View style={{ flex: 1, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }}>
          {!hasWitnessRole ? (
            /* Mode Terkunci untuk Relawan Murni */
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
                  Fitur obrolan dua arah ini dikhususkan bagi relawan yang telah resmi mengantongi SK Mandat Saksi TPS dari DPD PAN guna menjamin keamanan dan kerahasiaan pelaporan suara TPS.
                </Text>

                <View style={[styles.unlockStepsCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', borderColor: colors.border }]}>
                  <Text style={[styles.unlockStepsHeading, { color: colors.text }]}>
                    Cara Membuka Akses Grup Saksi:
                  </Text>
                  <Text style={[styles.unlockStepItem, { color: colors.textMuted }]}>
                    1. Buka Menu Profil simPAN
                  </Text>
                  <Text style={[styles.unlockStepItem, { color: colors.textMuted }]}>
                    2. Pilih menu "Unlock Mandat Saksi TPS"
                  </Text>
                  <Text style={[styles.unlockStepItem, { color: colors.textMuted }]}>
                    3. Lengkapi 4 instrumen persyaratan akreditasi BSN
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
            /* Mode Aktif untuk Relawan yang Telah Mendapat Mandat */
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
                    Grup Koordinasi Saksi TPS Kel. Babakan Asih
                  </Text>
                  <Text style={[styles.groupChatSub, { color: colors.success }]}>
                    ● 6 Saksi & 1 Korlap Aktif (Dua Arah)
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
                            : [styles.otherBubble, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border }],
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
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Kirim laporan koordinasi ke Korlap..."
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

  // WHATSAPP CHANNEL APP BAR
  waHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B141A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(134, 150, 160, 0.15)',
  },
  waHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  waBackBtn: {
    padding: 4,
    marginRight: 2,
  },
  waAvatarWrap: {
    position: 'relative',
  },
  waChannelAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1F2C34',
  },
  waAvatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#0066B3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0B141A',
  },
  waChannelTitleCol: {
    flex: 1,
    gap: 1,
  },
  waChannelName: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#E9EDEF',
  },
  waFollowerCount: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#8696A0',
  },
  waHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waMoreBtn: {
    padding: 6,
  },

  // TAB SELECTOR
  waTabBar: {
    flexDirection: 'row',
    backgroundColor: '#111B21',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(134, 150, 160, 0.12)',
  },
  waTabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  waTabItemActive: {
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.3)',
  },
  waTabItemText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: '#8696A0',
  },
  waTabItemTextActive: {
    color: '#25D366',
    fontFamily: fonts.bold,
  },
  waLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#25D366',
  },
  waLockBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  waLockBadgeText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },

  // CHAT SCROLL AREA
  waChatScroll: {
    flex: 1,
    backgroundColor: '#0B141A',
  },
  waChatScrollContent: {
    paddingVertical: 10,
    paddingBottom: 90,
  },

  // DATE BADGE
  waDateRow: {
    alignItems: 'center',
    marginVertical: 10,
  },
  waDateBadge: {
    backgroundColor: '#182229',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(134, 150, 160, 0.15)',
  },
  waDateBadgeText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: '#8696A0',
  },

  // CHANNEL POST CARD
  waPostContainer: {
    marginHorizontal: 12,
    marginBottom: 16,
  },
  waBubbleCard: {
    backgroundColor: '#1F2C34',
    borderRadius: 14,
    overflow: 'hidden',
  },
  waAuthorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  waAuthorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  waAuthorName: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: '#E9EDEF',
  },
  waAuthorTitle: {
    fontSize: 10.5,
    fontFamily: fonts.regular,
    color: '#8696A0',
  },
  waTopTime: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#8696A0',
  },
  waLiveVideoTag: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  waLiveVideoTagText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },

  // BODY & CAPTIONS
  waBodyText: {
    fontSize: 13.5,
    fontFamily: fonts.regular,
    color: '#E9EDEF',
    lineHeight: 19,
    paddingHorizontal: 12,
    paddingTop: 2,
  },
  waCaptionContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  waCaptionText: {
    fontSize: 13.5,
    fontFamily: fonts.regular,
    color: '#E9EDEF',
    lineHeight: 19,
  },
  waCaptionBold: {
    fontFamily: fonts.bold,
    color: '#E9EDEF',
  },
  waLinkText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: '#53BDEB',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  waBubbleFooter: {
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 6,
    paddingTop: 4,
  },
  waTimestamp: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#8696A0',
  },

  // VIDEO / MEDIA COMPONENT
  waMediaContainer: {
    width: '100%',
    height: 380,
    backgroundColor: '#0F172A',
    position: 'relative',
    marginTop: 4,
  },
  waMediaImage: {
    width: '100%',
    height: '100%',
  },
  waMediaOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  waMediaCenterContent: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  waMediaBigText: {
    fontFamily: fonts.extraBold || fonts.bold,
    fontSize: 42,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    opacity: 0.9,
    lineHeight: 46,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  waPlayButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waDownloadBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  waDownloadText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: '#FFFFFF',
  },

  // REACTIONS & FORWARD PILLS (WHATSAPP STYLE)
  waReactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  waReactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1F2C34',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(134, 150, 160, 0.15)',
  },
  waReactionEmojiStack: {
    fontSize: 14,
    letterSpacing: 1,
  },
  waReactionCount: {
    fontSize: 11.5,
    fontFamily: fonts.bold,
    color: '#8696A0',
  },
  waSharePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1F2C34',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(134, 150, 160, 0.15)',
  },
  waShareCount: {
    fontSize: 11.5,
    fontFamily: fonts.bold,
    color: '#8696A0',
  },

  // FAB SCROLL BOTTOM
  waFabScrollBottom: {
    position: 'absolute',
    right: 14,
    bottom: 110,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1F2C34',
    borderWidth: 1,
    borderColor: 'rgba(134, 150, 160, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  // BOTTOM FIXED ACTION BAR
  waBottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B141A',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(134, 150, 160, 0.15)',
    gap: 8,
  },
  waFollowButton: {
    width: '100%',
    height: 42,
    borderRadius: 21,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waFollowButtonActive: {
    backgroundColor: '#00A884',
  },
  waFollowButtonText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: '#0B141A',
  },
  waPrivacyRow: {
    alignItems: 'center',
  },
  waPrivacyText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: '#8696A0',
    textAlign: 'center',
    lineHeight: 16,
  },
  waPrivacyLink: {
    color: '#53BDEB',
    fontFamily: fonts.medium,
  },

  // LOCKED STATE (GRUP SAKSI)
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

  // ACTIVE GROUP CHAT
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
