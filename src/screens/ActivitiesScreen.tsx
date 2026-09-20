import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, EmptyState, Modal, Pill, PrimaryButton } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { EventItem } from '../types';
import QrPlaceholder from '../components/QrPlaceholder';

type EventStatusTab = 'all' | 'registered' | 'upcoming' | 'completed';

interface GridDay {
  dayNum: number;
  iso: string;
  isOtherMonth: boolean;
  isSunday: boolean;
  hasDot: boolean;
  fullDateLabel: string;
}

const INDO_MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const INDO_DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

function formatTwoDigits(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function generateMonthGrid(year: number, monthIndex: number): GridDay[] {
  // Hari pertama di bulan aktif
  const firstDay = new Date(year, monthIndex, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 = Minggu, 1 = Senin ...

  // Jumlah hari di bulan aktif
  const daysInCurrentMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Jumlah hari di bulan sebelumnya
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const grid: GridDay[] = [];

  // 1. Tanggal pelengkap dari bulan sebelumnya
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevDate = new Date(year, monthIndex - 1, d);
    const iso = `${prevDate.getFullYear()}-${formatTwoDigits(prevDate.getMonth() + 1)}-${formatTwoDigits(d)}`;
    grid.push({
      dayNum: d,
      iso,
      isOtherMonth: true,
      isSunday: prevDate.getDay() === 0,
      hasDot: false,
      fullDateLabel: `${INDO_DAY_NAMES[prevDate.getDay()]}, ${formatTwoDigits(d)} ${INDO_MONTH_NAMES[prevDate.getMonth()]} ${prevDate.getFullYear()}`,
    });
  }

  // 2. Tanggal di bulan berjalan
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const curDate = new Date(year, monthIndex, d);
    const iso = `${year}-${formatTwoDigits(monthIndex + 1)}-${formatTwoDigits(d)}`;
    grid.push({
      dayNum: d,
      iso,
      isOtherMonth: false,
      isSunday: curDate.getDay() === 0,
      hasDot: false,
      fullDateLabel: `${INDO_DAY_NAMES[curDate.getDay()]}, ${formatTwoDigits(d)} ${INDO_MONTH_NAMES[monthIndex]} ${year}`,
    });
  }

  // 3. Tanggal pelengkap dari bulan berikutnya (melengkapi grid 35 atau 42 sel)
  const totalCells = grid.length > 35 ? 42 : 35;
  let nextMonthDay = 1;
  while (grid.length < totalCells) {
    const nextDate = new Date(year, monthIndex + 1, nextMonthDay);
    const iso = `${nextDate.getFullYear()}-${formatTwoDigits(nextDate.getMonth() + 1)}-${formatTwoDigits(nextMonthDay)}`;
    grid.push({
      dayNum: nextMonthDay,
      iso,
      isOtherMonth: true,
      isSunday: nextDate.getDay() === 0,
      hasDot: false,
      fullDateLabel: `${INDO_DAY_NAMES[nextDate.getDay()]}, ${formatTwoDigits(nextMonthDay)} ${INDO_MONTH_NAMES[nextDate.getMonth()]} ${nextDate.getFullYear()}`,
    });
    nextMonthDay++;
  }

  return grid;
}

export default function ActivitiesScreen({ route, navigation }: any) {
  const { events, rsvpEvent, role, currentUser } = useApp();
  const { colors, isDark } = useTheme();

  // Acuan bulan kalender: default September 2026
  const [viewDate, setViewDate] = useState<Date>(new Date(2026, 8, 1));
  // Default null agar pengguna langsung melihat seluruh agenda bulan berjalan tanpa terpotong
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [selectedDetailEvent, setSelectedDetailEvent] = useState<EventItem | null>(null);
  const [selectedTicketEvent, setSelectedTicketEvent] = useState<EventItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<EventStatusTab>('all');
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone?: 'success' | 'info' | 'warning';
  }>({ visible: false, title: '', message: '' });

  // Tangani parameter navigasi jika diarahkan ke agenda spesifik
  useEffect(() => {
    if (route?.params?.eventId) {
      const target = events.find((e) => e.id === route.params.eventId);
      if (target) {
        setSelectedDetailEvent(target);
        if (target.dateIso) {
          const [y, m] = target.dateIso.split('-').map(Number);
          setViewDate(new Date(y, m - 1, 1));
          setSelectedDate(target.dateIso);
        }
      }
    } else if (route?.params?.date) {
      setSelectedDate(route.params.date);
    }
  }, [route?.params?.eventId, route?.params?.date, events]);

  // Grid hari kalender dinamis
  const monthGridDays = useMemo(() => {
    return generateMonthGrid(viewDate.getFullYear(), viewDate.getMonth());
  }, [viewDate]);

  const handlePrevMonth = () => {
    setSelectedDate(null);
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(null);
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    // Kembalikan ke bulan aktif sistem (September 2026) dan tampilkan seluruh agenda bulan ini
    setViewDate(new Date(2026, 8, 1));
    setSelectedDate(null);
  };

  const handleSelectDay = (day: GridDay) => {
    if (day.isOtherMonth) {
      const [y, m] = day.iso.split('-').map(Number);
      setViewDate(new Date(y, m - 1, 1));
    }
    setSelectedDate((prev) => (prev === day.iso ? null : day.iso));
  };

  // Filter wewenang: Relawan murni hanya melihat agenda relawan & umum, bukan Bimtek Saksi Tertutup
  const isVolunteerOnly =
    (role === 'VOLUNTEER' || role === 'RELAWAN') &&
    !currentUser?.roles?.some((r) => r.role === 'WITNESS');

  const roleSpecificEvents = useMemo(() => {
    return events.filter((e) => {
      if (isVolunteerOnly) {
        if (e.targetAudience) {
          return e.targetAudience === 'ALL' || e.targetAudience === 'VOLUNTEER';
        }
        return e.category !== 'Bimtek' && e.category !== 'Rapat DPC';
      }
      return true;
    });
  }, [events, isVolunteerOnly]);

  // Filter terpadu: Pencarian, Status Tab, dan Tanggal Kalender
  const filteredEvents = useMemo(() => {
    return roleSpecificEvents.filter((e) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchCat = e.category.toLowerCase().includes(q);
        const matchLoc = e.location.toLowerCase().includes(q);
        if (!matchTitle && !matchCat && !matchLoc) return false;
      }

      // 2. Status Tab Filter (Semantik Jujur & Tepat Sasaran)
      if (statusTab === 'registered') {
        if (!e.isRegistered && !e.attended) return false;
      } else if (statusTab === 'upcoming') {
        if (e.attended) return false;
      } else if (statusTab === 'completed') {
        if (!e.attended) return false;
      }

      // 3. Date Filter:
      // Jika selectedDate dipilih, cocokkan tanggal spesifik tersebut.
      // Jika selectedDate bernilai null, tampilkan seluruh agenda di bulan kalender yang sedang dilihat (viewDate).
      if (selectedDate) {
        if (e.dateIso !== selectedDate) return false;
      } else if (e.dateIso) {
        const [eYear, eMonth] = e.dateIso.split('-').map(Number);
        if (eYear !== viewDate.getFullYear() || eMonth !== viewDate.getMonth() + 1) {
          return false;
        }
      }

      return true;
    });
  }, [roleSpecificEvents, searchQuery, statusTab, selectedDate, viewDate]);

  const selectedDayItem = monthGridDays.find((d) => d.iso === selectedDate);
  const currentMonthTitle = `${INDO_MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
  const selectedDateLabel = selectedDayItem
    ? selectedDayItem.fullDateLabel
    : `Semua Agenda ${currentMonthTitle}`;

  const handleToggleRsvp = (event: EventItem) => {
    rsvpEvent(event.id);
    const willRegister = !event.isRegistered;
    setSelectedDetailEvent((prev) =>
      prev && prev.id === event.id ? { ...prev, isRegistered: willRegister } : prev
    );
    setDialogConfig({
      visible: true,
      title: willRegister ? 'Pendaftaran Berhasil' : 'RSVP Dibatalkan',
      message: willRegister
        ? `Kehadiran Anda pada "${event.title}" telah tercatat di basis data sekretariat PAN.`
        : `Pendaftaran Anda pada "${event.title}" telah dibatalkan.`,
      tone: willRegister ? 'success' : 'info',
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.agendaScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Section */}
        <View style={styles.topHeaderSection}>
          <Text style={[styles.topHeaderTitle, { color: colors.text }]}>
            Kalender Agenda Kegiatan
          </Text>
          <Text style={[styles.topHeaderSubtitle, { color: colors.textMuted }]}>
            Jadwal musyawarah, bakti sosial, apel siaga, dan konsolidasi resmi partai
          </Text>
        </View>

        {/* Card Kalender Bulan Penuh */}
        <View
          style={[
            styles.monthCardContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Header Bulan & Navigasi */}
          <View style={styles.monthHeaderRow}>
            <Pressable
              onPress={handlePrevMonth}
              accessibilityLabel="Bulan Sebelumnya"
              hitSlop={6}
              style={({ pressed }) => [
                styles.navChevronBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name="chevron-left" size={20} color={colors.text} />
            </Pressable>

            <Text style={[styles.monthTitleText, { color: colors.text }]}>
              {currentMonthTitle}
            </Text>

            <View style={styles.monthHeaderRightWrap}>
              <Pressable
                onPress={handleNextMonth}
                accessibilityLabel="Bulan Berikutnya"
                hitSlop={6}
                style={({ pressed }) => [
                  styles.navChevronBtn,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather name="chevron-right" size={20} color={colors.text} />
              </Pressable>

              <Pressable
                onPress={handleToday}
                accessibilityLabel="Lihat Bulan Ini"
                hitSlop={6}
                style={({ pressed }) => [
                  styles.todayPillBtn,
                  {
                    backgroundColor: isDark ? 'rgba(234, 179, 8, 0.15)' : '#FEF9C3',
                    borderColor: isDark ? '#CA8A04' : '#FDE047',
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Feather name="calendar" size={12} color={isDark ? '#FDE047' : '#A16207'} />
                <Text style={[styles.todayPillText, { color: isDark ? '#FDE047' : '#A16207' }]}>
                  Bulan Ini
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Nama Hari Row */}
          <View style={styles.dayNamesRow}>
            <Text style={[styles.dayNameCell, { color: '#EF4444' }]}>Min</Text>
            <Text style={[styles.dayNameCell, { color: colors.textMuted }]}>Sen</Text>
            <Text style={[styles.dayNameCell, { color: colors.textMuted }]}>Sel</Text>
            <Text style={[styles.dayNameCell, { color: colors.textMuted }]}>Rab</Text>
            <Text style={[styles.dayNameCell, { color: colors.textMuted }]}>Kam</Text>
            <Text style={[styles.dayNameCell, { color: colors.textMuted }]}>Jum</Text>
            <Text style={[styles.dayNameCell, { color: '#D97706' }]}>Sab</Text>
          </View>

          {/* Grid Tanggal Dinamis */}
          <View style={styles.gridDaysWrap}>
            {monthGridDays.map((d, index) => {
              const isSelected = selectedDate === d.iso;
              const hasEvent = roleSpecificEvents.some((e) => e.dateIso === d.iso);

              return (
                <Pressable
                  key={`${d.iso}-${index}`}
                  onPress={() => handleSelectDay(d)}
                  style={styles.gridDayCell}
                >
                  <View
                    style={[
                      styles.gridDayCircle,
                      isSelected && {
                        backgroundColor: colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.gridDayNumText,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : d.isOtherMonth
                            ? isDark
                              ? 'rgba(255,255,255,0.22)'
                              : '#94A3B8'
                            : d.isSunday
                            ? '#EF4444'
                            : colors.text,
                        },
                      ]}
                    >
                      {d.dayNum}
                    </Text>
                  </View>

                  {/* Dot Indicator jika ada agenda kegiatan */}
                  {hasEvent ? (
                    <View
                      style={[
                        styles.gridEventDot,
                        { backgroundColor: isSelected ? colors.primary : '#D97706' },
                      ]}
                    />
                  ) : (
                    <View style={{ height: 4 }} />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Footer Card Kalender */}
          <View style={[styles.monthCardFooter, { borderColor: colors.border }]}>
            <View style={styles.footerDateWrap}>
              <Feather name="calendar" size={14} color={colors.primary} />
              <Text style={[styles.footerDateText, { color: colors.text }]} numberOfLines={1}>
                {selectedDateLabel}
              </Text>
            </View>

            {selectedDate !== null && (
              <Pressable
                onPress={() => setSelectedDate(null)}
                style={({ pressed }) => [
                  styles.allThisMonthBtn,
                  {
                    backgroundColor: isDark ? 'rgba(0,102,179,0.2)' : '#EFF6FF',
                    borderColor: colors.primary,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[styles.allThisMonthText, { color: colors.primary }]}>
                  Semua Bulan Ini
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBarBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cari agenda, kategori, atau lokasi..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Feather name="x-circle" size={15} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Filter Status Horizontal Tabs (Semantik Jelas) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsTrack}
        >
          {[
            { key: 'all' as const, label: 'Semua Agenda' },
            { key: 'registered' as const, label: 'Terdaftar (RSVP)' },
            { key: 'upcoming' as const, label: 'Akan Datang' },
            { key: 'completed' as const, label: 'Selesai Hadir' },
          ].map((tab) => {
            const isActive = statusTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setStatusTab(tab.key)}
                style={[
                  styles.filterTabPill,
                  isActive
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: isActive ? '#FFFFFF' : colors.textMuted },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Events List */}
        <View style={styles.eventsListWrap}>
          {filteredEvents.length === 0 ? (
            <EmptyState
              title="Tidak Ada Kegiatan"
              body={
                selectedDate
                  ? `Tidak ada agenda kegiatan pada ${selectedDateLabel}. Ketuk "Semua Bulan Ini" untuk melihat seluruh jadwal.`
                  : 'Belum ada agenda kegiatan yang sesuai dengan pencarian atau filter yang dipilih.'
              }
              icon="calendar"
            />
          ) : (
            filteredEvents.map((item) => {
              const isRegistered = item.isRegistered;
              const isAttended = item.attended;

              return (
                <Card
                  key={item.id}
                  onPress={() => setSelectedDetailEvent(item)}
                  style={[
                    styles.eventCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.cardTopRow}>
                    <View style={[styles.categoryPill, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.categoryText, { color: colors.primary }]}>
                        {item.category}
                      </Text>
                    </View>
                    {item.priorityNote && (
                      <View
                        style={[
                          styles.priorityPill,
                          {
                            backgroundColor: isAttended
                              ? colors.successBg
                              : isDark
                              ? 'rgba(0,102,179,0.15)'
                              : '#EFF6FF',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityBadge,
                            { color: isAttended ? colors.success : colors.primary },
                          ]}
                        >
                          {item.priorityNote}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.eventTitle, { color: colors.text }]}>{item.title}</Text>

                  <View style={styles.metaCol}>
                    <View style={styles.metaRow}>
                      <Feather name="clock" size={13} color={colors.primary} />
                      <Text style={[styles.metaText, { color: colors.textMuted }]}>
                        {item.dateLabel} • {item.timeLabel}
                      </Text>
                    </View>

                    <View style={styles.metaRow}>
                      <Feather name="map-pin" size={13} color={colors.primary} />
                      <Text
                        style={[styles.metaText, { color: colors.textMuted }]}
                        numberOfLines={1}
                      >
                        {item.location}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  {/* Ringkas: Status & Petunjuk Klik Detail */}
                  <View style={styles.cardBottomRow}>
                    <View style={styles.statusBadgeWrap}>
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor: isAttended
                              ? colors.success
                              : isRegistered
                              ? colors.primary
                              : colors.textMuted,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusBadgeText,
                          {
                            color: isAttended
                              ? colors.success
                              : isRegistered
                              ? colors.primary
                              : colors.textMuted,
                          },
                        ]}
                      >
                        {isAttended
                          ? 'Telah Hadir'
                          : isRegistered
                          ? 'Terdaftar RSVP'
                          : 'Belum Terdaftar'}
                      </Text>
                    </View>

                    <View style={styles.detailCtaWrap}>
                      <Text style={[styles.detailCtaText, { color: colors.primary }]}>
                        Detail Acara
                      </Text>
                      <Feather name="chevron-right" size={14} color={colors.primary} />
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Event Detail Modal (Bottom Sheet Lengkap) */}
      <Modal
        visible={Boolean(selectedDetailEvent)}
        onClose={() => setSelectedDetailEvent(null)}
        title="Detail Agenda Kegiatan"
        subtitle={
          selectedDetailEvent
            ? `${selectedDetailEvent.category} • ${selectedDetailEvent.dateLabel}`
            : ''
        }
        variant="bottomSheet"
      >
        {selectedDetailEvent && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.detailModalScrollContent}
          >
            {/* Top Badges */}
            <View style={styles.detailHeaderBadgeRow}>
              <View style={[styles.categoryPill, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {selectedDetailEvent.category}
                </Text>
              </View>
              {selectedDetailEvent.priorityNote && (
                <View
                  style={[
                    styles.priorityPill,
                    {
                      backgroundColor: selectedDetailEvent.attended
                        ? colors.successBg
                        : isDark
                        ? 'rgba(0,102,179,0.2)'
                        : '#F0F7FF',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityBadge,
                      { color: selectedDetailEvent.attended ? colors.success : colors.primary },
                    ]}
                  >
                    {selectedDetailEvent.priorityNote}
                  </Text>
                </View>
              )}
            </View>

            {/* Title */}
            <Text style={[styles.detailTitleText, { color: colors.text }]}>
              {selectedDetailEvent.title}
            </Text>

            {/* Status Banner */}
            <View
              style={[
                styles.detailStatusBanner,
                {
                  backgroundColor: selectedDetailEvent.attended
                    ? colors.successBg
                    : selectedDetailEvent.isRegistered
                    ? isDark
                      ? 'rgba(0,102,179,0.2)'
                      : '#F0F9FF'
                    : isDark
                    ? 'rgba(255,255,255,0.05)'
                    : '#F8FAFC',
                  borderColor: selectedDetailEvent.attended
                    ? colors.success
                    : selectedDetailEvent.isRegistered
                    ? colors.primary
                    : colors.border,
                },
              ]}
            >
              <Feather
                name={
                  selectedDetailEvent.attended
                    ? 'check-circle'
                    : selectedDetailEvent.isRegistered
                    ? 'user-check'
                    : 'info'
                }
                size={16}
                color={
                  selectedDetailEvent.attended
                    ? colors.success
                    : selectedDetailEvent.isRegistered
                    ? colors.primary
                    : colors.textMuted
                }
              />
              <View style={{ flex: 1, gap: 1 }}>
                <Text
                  style={[
                    styles.detailStatusBannerTitle,
                    {
                      color: selectedDetailEvent.attended
                        ? colors.success
                        : selectedDetailEvent.isRegistered
                        ? colors.primary
                        : colors.text,
                    },
                  ]}
                >
                  {selectedDetailEvent.attended
                    ? 'Kehadiran Terverifikasi'
                    : selectedDetailEvent.isRegistered
                    ? 'Terdaftar Sebagai Peserta'
                    : 'Belum Terdaftar'}
                </Text>
                <Text style={[styles.detailStatusBannerDesc, { color: colors.textMuted }]}>
                  {selectedDetailEvent.attended
                    ? 'Presensi Anda telah tervalidasi pada sistem basis data PAN.'
                    : selectedDetailEvent.isRegistered
                    ? 'Keikutsertaan Anda telah tercatat. Tunjukkan Tiket QR saat tiba di lokasi.'
                    : 'Daftarkan diri Anda untuk mengonfirmasi kehadiran kegiatan ini.'}
                </Text>
              </View>
            </View>

            {/* Info Grid Card */}
            <View
              style={[
                styles.detailInfoBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.detailInfoItem}>
                <View
                  style={[styles.detailInfoIconWrap, { backgroundColor: colors.primaryLight }]}
                >
                  <Feather name="calendar" size={14} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailInfoLabel, { color: colors.textMuted }]}>
                    Waktu Pelaksanaan
                  </Text>
                  <Text style={[styles.detailInfoValue, { color: colors.text }]}>
                    {selectedDetailEvent.dateLabel} • {selectedDetailEvent.timeLabel}
                  </Text>
                </View>
              </View>

              <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />

              <View style={styles.detailInfoItem}>
                <View
                  style={[styles.detailInfoIconWrap, { backgroundColor: colors.primaryLight }]}
                >
                  <Feather name="map-pin" size={14} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailInfoLabel, { color: colors.textMuted }]}>
                    Lokasi Kegiatan
                  </Text>
                  <Text style={[styles.detailInfoValue, { color: colors.text }]}>
                    {selectedDetailEvent.location}
                  </Text>
                </View>
              </View>

              {selectedDetailEvent.hostName && (
                <>
                  <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.detailInfoItem}>
                    <View
                      style={[
                        styles.detailInfoIconWrap,
                        { backgroundColor: colors.primaryLight },
                      ]}
                    >
                      <Feather name="shield" size={14} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.detailInfoLabel, { color: colors.textMuted }]}>
                        Penyelenggara
                      </Text>
                      <Text style={[styles.detailInfoValue, { color: colors.text }]}>
                        {selectedDetailEvent.hostName}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {selectedDetailEvent.dressCode && (
                <>
                  <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.detailInfoItem}>
                    <View
                      style={[
                        styles.detailInfoIconWrap,
                        { backgroundColor: colors.primaryLight },
                      ]}
                    >
                      <Feather name="tag" size={14} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.detailInfoLabel, { color: colors.textMuted }]}>
                        Ketentuan Pakaian
                      </Text>
                      <Text style={[styles.detailInfoValue, { color: colors.text }]}>
                        {selectedDetailEvent.dressCode}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {selectedDetailEvent.contactPerson && (
                <>
                  <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.detailInfoItem}>
                    <View
                      style={[
                        styles.detailInfoIconWrap,
                        { backgroundColor: colors.primaryLight },
                      ]}
                    >
                      <Feather name="phone" size={14} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.detailInfoLabel, { color: colors.textMuted }]}>
                        Narahubung / Korlap
                      </Text>
                      <Text style={[styles.detailInfoValue, { color: colors.text }]}>
                        {selectedDetailEvent.contactPerson}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Description Section */}
            {selectedDetailEvent.description && (
              <View style={styles.detailSectionBlock}>
                <Text style={[styles.detailSectionHeading, { color: colors.text }]}>
                  Deskripsi Agenda
                </Text>
                <Text style={[styles.detailSectionBody, { color: colors.textMuted }]}>
                  {selectedDetailEvent.description}
                </Text>
              </View>
            )}

            {/* Agenda Points Checklist */}
            {selectedDetailEvent.points && selectedDetailEvent.points.length > 0 && (
              <View style={styles.detailSectionBlock}>
                <Text style={[styles.detailSectionHeading, { color: colors.text }]}>
                  Rangkaian Kegiatan
                </Text>
                <View style={{ gap: 8, marginTop: 6 }}>
                  {selectedDetailEvent.points.map((pt, idx) => (
                    <View key={idx} style={styles.detailPointRow}>
                      <Feather
                        name="check"
                        size={13}
                        color={colors.primary}
                        style={{ marginTop: 2 }}
                      />
                      <Text style={[styles.detailPointText, { color: colors.text }]}>
                        {pt}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Action Buttons: Presensi GPS, Tiket QR, dan RSVP */}
            <View style={styles.detailActionButtonsWrap}>
              {/* Shortcut Presensi GPS Langsung ke CheckInScreen jika sudah RSVP & belum hadir */}
              {selectedDetailEvent.isRegistered && !selectedDetailEvent.attended && (
                <Pressable
                  onPress={() => {
                    const evt = selectedDetailEvent;
                    setSelectedDetailEvent(null);
                    navigation.navigate('CheckIn', {
                      targetType: 'event',
                      eventId: evt.id,
                    });
                  }}
                  style={({ pressed }) => [
                    styles.detailGpsBtn,
                    { backgroundColor: colors.primary },
                    pressed && { opacity: 0.88 },
                  ]}
                >
                  <Feather name="map-pin" size={15} color="#FFFFFF" strokeWidth={iconStrokeWidth} />
                  <Text style={styles.detailGpsBtnText}>Presensi GPS di Lokasi</Text>
                </Pressable>
              )}

              {/* Tiket QR jika sudah terdaftar */}
              {selectedDetailEvent.isRegistered && (
                <Pressable
                  onPress={() => {
                    const evt = selectedDetailEvent;
                    setSelectedDetailEvent(null);
                    setSelectedTicketEvent(evt);
                  }}
                  style={({ pressed }) => [
                    styles.detailQrBtn,
                    {
                      borderColor: colors.primary,
                      backgroundColor: isDark ? 'rgba(0,43,82,0.3)' : '#F0F9FF',
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Feather
                    name="maximize"
                    size={15}
                    color={colors.primary}
                    strokeWidth={iconStrokeWidth}
                  />
                  <Text style={[styles.detailQrBtnText, { color: colors.primary }]}>
                    Buka Tiket QR Presensi
                  </Text>
                </Pressable>
              )}

              {/* Jika sudah hadir, sediakan shortcut ke Bukti Kehadiran */}
              {selectedDetailEvent.attended && (
                <Pressable
                  onPress={() => {
                    const evt = selectedDetailEvent;
                    setSelectedDetailEvent(null);
                    navigation.navigate('CheckIn', {
                      targetType: 'event',
                      eventId: evt.id,
                    });
                  }}
                  style={({ pressed }) => [
                    styles.detailQrBtn,
                    {
                      borderColor: colors.success,
                      backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5',
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Feather
                    name="check-circle"
                    size={15}
                    color={colors.success}
                    strokeWidth={iconStrokeWidth}
                  />
                  <Text style={[styles.detailQrBtnText, { color: colors.success }]}>
                    Lihat Pas Bukti Kehadiran
                  </Text>
                </Pressable>
              )}

              {/* Tombol Pendaftaran RSVP */}
              <Pressable
                onPress={() => handleToggleRsvp(selectedDetailEvent)}
                style={({ pressed }) => [
                  styles.detailRsvpBtn,
                  {
                    backgroundColor: selectedDetailEvent.attended
                      ? colors.successBg
                      : selectedDetailEvent.isRegistered
                      ? isDark
                        ? 'rgba(239, 68, 68, 0.12)'
                        : '#FEF2F2'
                      : colors.primary,
                    borderColor: selectedDetailEvent.attended
                      ? colors.success
                      : selectedDetailEvent.isRegistered
                      ? isDark
                        ? '#EF4444'
                        : '#DC2626'
                      : colors.primary,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Feather
                  name={
                    selectedDetailEvent.attended
                      ? 'check-circle'
                      : selectedDetailEvent.isRegistered
                      ? 'user-x'
                      : 'user-plus'
                  }
                  size={15}
                  color={
                    selectedDetailEvent.attended
                      ? colors.success
                      : selectedDetailEvent.isRegistered
                      ? isDark
                        ? '#EF4444'
                        : '#DC2626'
                      : '#FFFFFF'
                  }
                />
                <Text
                  style={[
                    styles.detailRsvpBtnText,
                    {
                      color: selectedDetailEvent.attended
                        ? colors.success
                        : selectedDetailEvent.isRegistered
                        ? isDark
                          ? '#EF4444'
                          : '#DC2626'
                        : '#FFFFFF',
                    },
                  ]}
                >
                  {selectedDetailEvent.attended
                    ? 'Telah Hadir di Lokasi'
                    : selectedDetailEvent.isRegistered
                    ? 'Batalkan Pendaftaran (Batal RSVP)'
                    : 'Daftar Ikut Agenda Ini (RSVP)'}
                </Text>
              </Pressable>

              <PrimaryButton
                label="Tutup"
                variant="secondary"
                onPress={() => setSelectedDetailEvent(null)}
                style={{ width: '100%', marginTop: 4 }}
              />
            </View>
          </ScrollView>
        )}
      </Modal>

      {/* Ticket Pass Modal */}
      <Modal
        visible={Boolean(selectedTicketEvent)}
        onClose={() => setSelectedTicketEvent(null)}
        title="Tiket Presensi Kegiatan"
        subtitle={selectedTicketEvent?.title}
      >
        {selectedTicketEvent && (
          <View style={{ gap: spacing.md, alignItems: 'center', paddingVertical: spacing.sm }}>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text
                style={{
                  fontFamily: fonts.bold,
                  fontSize: fontSize.md,
                  color: colors.text,
                  textAlign: 'center',
                }}
              >
                {selectedTicketEvent.title}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.medium,
                  fontSize: fontSize.xs,
                  color: colors.primary,
                }}
              >
                {selectedTicketEvent.dateLabel} • {selectedTicketEvent.timeLabel}
              </Text>
            </View>

            <QrPlaceholder size={180} seed={`TICKET-PAN-${selectedTicketEvent.id}-USR001`} />

            <View
              style={[
                styles.ticketNoticeBox,
                {
                  backgroundColor: isDark ? 'rgba(0,43,82,0.4)' : '#F0F9FF',
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather name="info" size={14} color={colors.primary} />
              <Text style={[styles.ticketNoticeText, { color: colors.textMuted }]}>
                Tunjukkan QR Code ini ke petugas panitia penerima tamu di pintu masuk lokasi untuk
                absensi digital.
              </Text>
            </View>

            <PrimaryButton
              label="Tutup Tiket"
              variant="secondary"
              onPress={() => setSelectedTicketEvent(null)}
              style={{ width: '100%' }}
            />
          </View>
        )}
      </Modal>

      {/* Confirm Feedback Dialog */}
      <ConfirmDialog
        visible={dialogConfig.visible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        tone={dialogConfig.tone}
        singleButton
        confirmLabel="Mengerti"
        onConfirm={() => setDialogConfig((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  agendaScrollContent: {
    paddingBottom: 40,
  },
  topHeaderSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: 2,
  },
  topHeaderTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 26,
    marginTop: 4,
  },
  topHeaderSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
  },

  // Full Month Calendar Card
  monthCardContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    ...shadow.card,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitleText: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  monthHeaderRightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navChevronBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  todayPillText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },

  // Day Names Row
  dayNamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  dayNameCell: {
    width: 38,
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontSize: 11,
  },

  // Grid Days (5x7)
  gridDaysWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  gridDayCell: {
    width: '14.28%',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  gridDayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridDayNumText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  gridEventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },

  // Month Card Footer
  monthCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerDateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  footerDateText: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
  },
  allThisMonthBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  allThisMonthText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },

  // Search Bar
  searchBarBox: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    height: '100%',
  },

  // Filter Tabs Horizontal
  filterTabsTrack: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterTabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabText: {
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
  },

  // Events List Container
  eventsListWrap: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: 4,
    paddingBottom: 24,
  },
  eventCard: { padding: spacing.md, gap: spacing.xs },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm },
  categoryText: { fontFamily: fonts.bold, fontSize: 10 },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  priorityBadge: { fontFamily: fonts.bold, fontSize: 10 },
  eventTitle: { fontFamily: fonts.bold, fontSize: fontSize.sm, marginTop: 4, lineHeight: 20 },
  metaCol: { gap: 4, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontFamily: fonts.regular, fontSize: fontSize.xs },
  divider: { height: 1, width: '100%', marginVertical: spacing.xs },

  // Card Bottom Row (Clean & Clickable)
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  statusBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  detailCtaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailCtaText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },

  // Modal Detail Styles
  detailModalScrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  detailHeaderBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailTitleText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  detailStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  detailStatusBannerTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  detailStatusBannerDesc: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  detailInfoBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  detailInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailInfoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailInfoLabel: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
  },
  detailInfoValue: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    marginTop: 1,
  },
  detailDivider: {
    height: 1,
    width: '100%',
  },
  detailSectionBlock: {
    gap: 4,
  },
  detailSectionHeading: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
  },
  detailSectionBody: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 17,
  },
  detailPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  detailPointText: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    flex: 1,
    lineHeight: 16,
  },
  detailActionButtonsWrap: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  detailGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.md,
    ...shadow.sm,
  },
  detailGpsBtnText: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  detailQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  detailQrBtnText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  detailRsvpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  detailRsvpBtnText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  ticketNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  ticketNoticeText: { fontFamily: fonts.regular, fontSize: 11, flex: 1, lineHeight: 16 },
});
