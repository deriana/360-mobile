import React, { useState } from 'react';
import {
  FlatList,
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
import { Card, ConfirmDialog, EmptyState, Modal, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, shadow, spacing } from '../theme';
import { EventItem, TaskCategory, TaskItem } from '../types';
import QrPlaceholder from '../components/QrPlaceholder';

type EventStatusTab = 'all' | 'ongoing' | 'upcoming' | 'completed' | 'social';

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
  // First day of current month
  const firstDay = new Date(year, monthIndex, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 = Sun, 1 = Mon ...

  // Days in current month
  const daysInCurrentMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Days in previous month
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const grid: GridDay[] = [];

  // 1. Fill trailing days from previous month
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

  // 2. Fill days in current month
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

  // 3. Fill leading days from next month to complete rows (35 or 42 cells)
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
  const {
    events,
    rsvpEvent,
    tasks,
    toggleTaskCompleted,
    role,
    currentUser,
    volunteerOpportunities,
    joinOpportunity,
  } = useApp();
  const { colors, isDark } = useTheme();

  const [mainTab, setMainTab] = useState<'agenda' | 'tugas'>(
    route?.params?.tab || route?.params?.initialTab || 'agenda'
  );
  const [tugasSubTab, setTugasSubTab] = useState<'my_tasks' | 'bursa'>(
    route?.params?.subTab || 'my_tasks'
  );
  // View Date untuk kalender dinamis (default: September 2026)
  const [viewDate, setViewDate] = useState<Date>(new Date(2026, 8, 1));
  const [selectedDate, setSelectedDate] = useState<string | null>('2026-09-01');
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<EventItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<EventStatusTab>('all');
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<'all' | TaskCategory>('all');
  const [selectedTicketEvent, setSelectedTicketEvent] = useState<EventItem | null>(null);
  const [selectedDetailTask, setSelectedDetailTask] = useState<TaskItem | null>(null);
  const [selectedDetailOpp, setSelectedDetailOpp] = useState<any | null>(null);
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone?: 'success' | 'info' | 'warning';
  }>({ visible: false, title: '', message: '' });

  // Generate grid hari untuk bulan yang sedang dilihat
  const monthGridDays = React.useMemo(() => {
    return generateMonthGrid(viewDate.getFullYear(), viewDate.getMonth());
  }, [viewDate]);

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    // Tanggal acuan aktif sistem (18 September 2026)
    const todayDate = new Date(2026, 8, 18);
    setViewDate(new Date(2026, 8, 1));
    setSelectedDate('2026-09-18');
  };

  const handleSelectDay = (day: GridDay) => {
    // Jika user mengklik tanggal dari bulan lain yang tampil di batas grid, pindahkan bulan aktif ke bulan tersebut
    if (day.isOtherMonth) {
      const [y, m] = day.iso.split('-').map(Number);
      setViewDate(new Date(y, m - 1, 1));
    }
    setSelectedDate((prev) => (prev === day.iso ? null : day.iso));
  };

  React.useEffect(() => {
    const targetTab = route?.params?.tab || route?.params?.initialTab;
    if (targetTab === 'agenda' || targetTab === 'tugas') {
      setMainTab(targetTab);
    }
    if (route?.params?.subTab === 'bursa' || route?.params?.subTab === 'my_tasks') {
      setTugasSubTab(route.params.subTab);
    }
  }, [route?.params?.tab, route?.params?.initialTab, route?.params?.subTab]);

  const isVolunteerOnly = (role === 'VOLUNTEER' || role === 'RELAWAN') && !currentUser.roles.some((r) => r.role === 'WITNESS');

  // Filter events: Relawan murni hanya melihat agenda relawan/kader/umum, bukan Bimtek Saksi C1 atau Rapat Pleno Struktural
  const roleSpecificEvents = events.filter((e) => {
    if (isVolunteerOnly) {
      if (e.targetAudience) {
        return e.targetAudience === 'ALL' || e.targetAudience === 'VOLUNTEER';
      }
      return e.category !== 'Bimtek' && e.category !== 'Rapat DPC';
    }
    return true;
  });

  // Filter tasks: Relawan murni hanya melihat tugas relawan lapangan
  const availableTasks = tasks.filter((t) => {
    if (isVolunteerOnly) {
      return t.assignedToRole === 'VOLUNTEER';
    }
    return true;
  });

  const completedTasksCount = availableTasks.filter((t) => t.status === 'completed').length;
  const totalTasksCount = availableTasks.length;
  const taskProgressPct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const filteredTasks = availableTasks.filter((t) => {
    if (taskCategoryFilter === 'all') return true;
    return t.category === taskCategoryFilter;
  });

  const handleActionPress = (task: TaskItem) => {
    if (task.actionScreen) {
      navigation.navigate(task.actionScreen, task.actionParams);
    } else {
      toggleTaskCompleted(task.id);
    }
  };

  // Filter events dengan search query, tanggal terpilih, dan status tab
  const filteredEvents = roleSpecificEvents.filter((e) => {
    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchCat = e.category.toLowerCase().includes(q);
      const matchLoc = e.location.toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchLoc) return false;
    }

    // 2. Status Tab Filter
    if (statusTab === 'ongoing') {
      if (!e.isRegistered && !e.attended) return false;
    } else if (statusTab === 'upcoming') {
      if (e.attended) return false;
    } else if (statusTab === 'completed') {
      if (!e.attended) return false;
    } else if (statusTab === 'social') {
      if (e.category !== 'Aksi Sosial' && e.category !== 'Musyawarah') return false;
    }

    // 3. Date Filter (jika selectedDate dipilih)
    if (selectedDate && e.dateIso !== selectedDate) {
      return false;
    }

    return true;
  });

  const selectedDayItem = monthGridDays.find((d) => d.iso === selectedDate);
  const currentMonthTitle = `${INDO_MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
  const selectedDateLabel = selectedDayItem
    ? selectedDayItem.fullDateLabel
    : `Semua Agenda ${currentMonthTitle}`;

  const handleToggleRsvp = (event: EventItem) => {
    rsvpEvent(event.id);
    const willRegister = !event.isRegistered;
    setSelectedDetailEvent((prev) => (prev && prev.id === event.id ? { ...prev, isRegistered: willRegister } : prev));
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
      {/* Top Segment: Child Menu Kegiatan (Agenda Acara vs Tugas & Bursa) */}
      <View style={[styles.mainTabTrack, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Pressable
          onPress={() => setMainTab('agenda')}
          style={[
            styles.mainTabPill,
            mainTab === 'agenda'
              ? { backgroundColor: colors.primary }
              : { backgroundColor: 'transparent' },
          ]}
        >
          <Feather name="calendar" size={13} color={mainTab === 'agenda' ? '#FFFFFF' : colors.textMuted} />
          <Text
            style={[
              styles.mainTabText,
              { color: mainTab === 'agenda' ? '#FFFFFF' : colors.textMuted, fontFamily: mainTab === 'agenda' ? fonts.bold : fonts.medium },
            ]}
          >
            Agenda Acara ({roleSpecificEvents.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMainTab('tugas')}
          style={[
            styles.mainTabPill,
            mainTab === 'tugas'
              ? { backgroundColor: colors.primary }
              : { backgroundColor: 'transparent' },
          ]}
        >
          <Feather name="check-square" size={13} color={mainTab === 'tugas' ? '#FFFFFF' : colors.textMuted} />
          <Text
            style={[
              styles.mainTabText,
              { color: mainTab === 'tugas' ? '#FFFFFF' : colors.textMuted, fontFamily: mainTab === 'tugas' ? fonts.bold : fonts.medium },
            ]}
          >
            Tugas & Bursa ({availableTasks.length + volunteerOpportunities.length})
          </Text>
        </Pressable>
      </View>

      {mainTab === 'agenda' ? (
        <ScrollView contentContainerStyle={styles.agendaScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.topHeaderSection}>
            <Text style={[styles.topHeaderTitle, { color: colors.text }]}>
              Kalender Agenda Kegiatan
            </Text>
            {/* <Text style={[styles.topHeaderSubtitle, { color: colors.textMuted }]}>
              Jadwal musyawarah, bakti sosial, dan pelatihan resmi
            </Text> */}
          </View>

          {/* Card Kalender Bulan Penuh (Matching Screenshot) */}
          <View style={[styles.monthCardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Header Bulan & Navigasi */}
            <View style={styles.monthHeaderRow}>
              <Pressable
                onPress={handlePrevMonth}
                accessibilityLabel="Bulan Sebelumnya"
                style={({ pressed }) => [
                  styles.navChevronBtn,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather name="chevron-left" size={18} color={colors.text} />
              </Pressable>

              <Text style={[styles.monthTitleText, { color: colors.text }]}>
                {currentMonthTitle}
              </Text>

              <View style={styles.monthHeaderRightWrap}>
                <Pressable
                  onPress={handleNextMonth}
                  accessibilityLabel="Bulan Berikutnya"
                  style={({ pressed }) => [
                    styles.navChevronBtn,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Feather name="chevron-right" size={18} color={colors.text} />
                </Pressable>

                <Pressable
                  onPress={handleToday}
                  accessibilityLabel="Kembali Ke Hari Ini"
                  style={({ pressed }) => [
                    styles.todayPillBtn,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Feather name="calendar" size={12} color="#A16207" />
                  <Text style={styles.todayPillText}>Hari Ini</Text>
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
                const hasEvent = d.hasDot || roleSpecificEvents.some((e) => e.dateIso === d.iso);

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
                          backgroundColor: '#0F172A',
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
                              ? '#CBD5E1'
                              : d.isSunday
                              ? '#EF4444'
                              : colors.text,
                          },
                        ]}
                      >
                        {d.dayNum}
                      </Text>
                    </View>

                    {/* Dot Indicator di bawah angka */}
                    {hasEvent ? (
                      <View
                        style={[
                          styles.gridEventDot,
                          { backgroundColor: '#D97706' },
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
                <Feather name="calendar" size={14} color={colors.text} />
                <Text style={[styles.footerDateText, { color: colors.text }]} numberOfLines={1}>
                  {selectedDateLabel}
                </Text>
              </View>

              <Pressable
                onPress={() => setSelectedDate(null)}
                style={({ pressed }) => [
                  styles.allThisMonthBtn,
                  {
                    backgroundColor: selectedDate === null ? colors.primaryLight : isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                    borderColor: selectedDate === null ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text
                  style={[
                    styles.allThisMonthText,
                    { color: selectedDate === null ? colors.primary : colors.text },
                  ]}
                >
                  Semua Bulan Ini
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Search Bar (Matching Screenshot) */}
          <View style={[styles.searchBarBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Feather name="search" size={15} color="#94A3B8" />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Cari agenda, kategori, atau lokasi..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <Feather name="x-circle" size={14} color="#94A3B8" />
              </Pressable>
            )}
          </View>

          {/* Filter Status Horizontal Tabs (Matching Screenshot) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabsTrack}
          >
            {[
              { key: 'all' as const, label: 'Semua' },
              { key: 'ongoing' as const, label: 'Berlangsung' },
              { key: 'upcoming' as const, label: 'Akan Datang' },
              { key: 'completed' as const, label: 'Selesai' },
            ].map((tab) => {
              const isActive = statusTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setStatusTab(tab.key)}
                  style={[
                    styles.filterTabPill,
                    isActive
                      ? { backgroundColor: '#0F172A', borderColor: '#0F172A' }
                      : { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      { color: isActive ? '#FFFFFF' : '#475569' },
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
                        <Text style={[styles.categoryText, { color: colors.primary }]}>{item.category}</Text>
                      </View>
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
                        <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={1}>
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
                          {isAttended ? 'Telah Hadir' : isRegistered ? 'Terdaftar RSVP' : 'Belum Terdaftar'}
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
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {/* Sub-Tab Selector for Tugas & Bursa: Segregasi Bersih & Tidak Menumpuk */}
          <View style={[styles.subTabTrack, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable
              onPress={() => setTugasSubTab('my_tasks')}
              style={[
                styles.subTabPill,
                tugasSubTab === 'my_tasks'
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: 'transparent' },
              ]}
            >
              <Feather name="check-circle" size={12} color={tugasSubTab === 'my_tasks' ? '#FFFFFF' : colors.textMuted} />
              <Text
                style={[
                  styles.subTabText,
                  { color: tugasSubTab === 'my_tasks' ? '#FFFFFF' : colors.textMuted, fontFamily: tugasSubTab === 'my_tasks' ? fonts.bold : fonts.medium },
                ]}
              >
                Tugas Saya ({availableTasks.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setTugasSubTab('bursa')}
              style={[
                styles.subTabPill,
                tugasSubTab === 'bursa'
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: 'transparent' },
              ]}
            >
              <Feather name="briefcase" size={12} color={tugasSubTab === 'bursa' ? '#FFFFFF' : colors.textMuted} />
              <Text
                style={[
                  styles.subTabText,
                  { color: tugasSubTab === 'bursa' ? '#FFFFFF' : colors.textMuted, fontFamily: tugasSubTab === 'bursa' ? fonts.bold : fonts.medium },
                ]}
              >
                Bursa Aksi Relawan ({volunteerOpportunities.length})
              </Text>
            </Pressable>
          </View>

          {tugasSubTab === 'my_tasks' ? (
            <>
              {/* Summary Progress Checklist Tugas */}
              <View style={[styles.tasksSummaryBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.bannerTitle, { color: colors.text }]}>
                      {isVolunteerOnly ? 'Checklist Aksi Relawan' : 'Checklist Tugas Lapangan'}
                    </Text>
                    <Text style={[styles.bannerSubtitle, { color: colors.textMuted }]}>
                      {isVolunteerOnly ? 'Kelengkapan misi sosial, posko, dan pelatihan relawan' : 'Tugas prioritas saksi & kader partai'}
                    </Text>
                  </View>
                  <Pill label={`${completedTasksCount}/${totalTasksCount} Selesai`} tone={completedTasksCount === totalTasksCount ? 'success' : 'primary'} />
                </View>

                {/* Progress Bar */}
                <View style={{ gap: 4, marginTop: spacing.xs }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted }}>Kelengkapan Aksi</Text>
                    <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.primary }}>{taskProgressPct}%</Text>
                  </View>
                  <View style={[styles.taskProgressTrack, { backgroundColor: colors.border }]}>
                    <View style={[styles.taskProgressFill, { width: `${taskProgressPct}%`, backgroundColor: taskProgressPct === 100 ? colors.success : colors.primary }]} />
                  </View>
                </View>
              </View>

              {/* Task Category Filter */}
              <View style={styles.taskFilterRow}>
                {(isVolunteerOnly
                  ? [
                      { key: 'all' as const, label: 'Semua' },
                      { key: 'gotv' as const, label: 'Sapa Warga' },
                      { key: 'logistics' as const, label: 'Posko & Baksos' },
                      { key: 'training' as const, label: 'Pelatihan' },
                    ]
                  : [
                      { key: 'all' as const, label: 'Semua' },
                      { key: 'witness' as const, label: 'Saksi TPS' },
                      { key: 'gotv' as const, label: 'Relawan' },
                      { key: 'training' as const, label: 'Pelatihan' },
                    ]
                ).map((f) => (
                  <Pressable
                    key={f.key}
                    onPress={() => setTaskCategoryFilter(f.key)}
                    style={[
                      styles.filterPill,
                      taskCategoryFilter === f.key
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.filterText, { color: taskCategoryFilter === f.key ? '#FFFFFF' : colors.textMuted }]}>
                      {f.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Checklist Items */}
              {filteredTasks.length === 0 ? (
                <EmptyState
                  title="Tidak Ada Tugas"
                  body="Belum ada tugas pada kategori ini."
                  icon="check-circle"
                />
              ) : (
                <View style={{ gap: spacing.xs }}>
                  {filteredTasks.map((task) => {
                    const isDone = task.status === 'completed';
                    return (
                      <Card
                        key={task.id}
                        onPress={() => setSelectedDetailTask(task)}
                        style={[
                          styles.taskItemCard,
                          { backgroundColor: colors.surface, borderColor: isDone ? colors.success : colors.border },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              toggleTaskCompleted(task.id);
                            }}
                            hitSlop={8}
                            style={[
                              styles.taskCheckCircle,
                              {
                                backgroundColor: isDone ? colors.success : 'transparent',
                                borderColor: isDone ? colors.success : colors.borderStrong,
                              },
                            ]}
                          >
                            {isDone && <Feather name="check" size={12} color="#FFFFFF" strokeWidth={3} />}
                          </Pressable>

                          <View style={{ flex: 1, gap: 2 }}>
                            <Text style={[styles.taskItemTitle, { color: colors.text, textDecorationLine: isDone ? 'line-through' : 'none' }]}>
                              {task.title}
                            </Text>
                            <Text style={[styles.taskItemDesc, { color: colors.textMuted }]} numberOfLines={2}>
                              {task.desc}
                            </Text>
                          </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, marginRight: 8 }}>
                            <Feather name={isDone ? 'check-circle' : 'clock'} size={12} color={isDone ? colors.success : colors.primary} />
                            <Text style={{ fontFamily: fonts.medium, fontSize: 10.5, color: isDone ? colors.success : colors.textMuted }} numberOfLines={1}>
                              {task.timeLabel}
                            </Text>
                          </View>

                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                              <Text style={{ fontFamily: fonts.bold, fontSize: 10.5, color: colors.primary }}>
                                Detail
                              </Text>
                              <Feather name="chevron-right" size={12} color={colors.primary} />
                            </View>

                            <Pressable
                              onPress={(e) => {
                                e.stopPropagation();
                                handleActionPress(task);
                              }}
                              style={({ pressed }) => [
                                styles.taskActionBtn,
                                {
                                  backgroundColor: isDone ? colors.surface : colors.primary,
                                  borderColor: isDone ? colors.border : colors.primary,
                                  borderWidth: isDone ? 1 : 0,
                                },
                                pressed && { opacity: 0.8 },
                              ]}
                            >
                              <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: isDone ? colors.text : '#FFFFFF' }}>
                                {task.actionLabel || (isDone ? 'Selesai' : 'Tandai')}
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      </Card>
                    );
                  })}
                </View>
              )}
            </>
          ) : (
            /* Bursa Peluang Aksi Relawan (Peluang Penugasan Baru) */
            <View style={{ gap: spacing.xs }}>
              <View style={[styles.tasksSummaryBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.bannerTitle, { color: colors.text }]}>
                      Bursa Peluang Aksi Relawan
                    </Text>
                    <Text style={[styles.bannerSubtitle, { color: colors.textMuted }]}>
                      Pilih aksi nyata pemenangan & pelayanan warga sesuai minat dan keahlian Anda:
                    </Text>
                  </View>
                  <Pill label={`${volunteerOpportunities.length} Terbuka`} tone="primary" />
                </View>
              </View>

              <View style={{ gap: spacing.xs, marginTop: 4 }}>
                {volunteerOpportunities.map((opp) => (
                  <Pressable
                    key={opp.id}
                    onPress={() => setSelectedDetailOpp(opp)}
                    style={({ pressed }) => [
                      styles.volunteerOppCard,
                      {
                        backgroundColor: opp.isJoined
                          ? isDark ? 'rgba(16, 185, 129, 0.12)' : '#F0FDF4'
                          : colors.surface,
                        borderColor: opp.isJoined ? colors.success : colors.border,
                      },
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    <View style={styles.oppHeaderRow}>
                      <View style={[styles.oppCategoryBadge, { backgroundColor: isDark ? 'rgba(0,102,179,0.3)' : '#E0F2FE' }]}>
                        <Text style={[styles.oppCategoryBadgeText, { color: colors.primary }]}>{opp.category}</Text>
                      </View>

                      <View style={[styles.oppSlotBadge, { backgroundColor: opp.filledSlots >= opp.neededSlots ? colors.warningBg : colors.successBg }]}>
                        <Feather name="users" size={10} color={opp.filledSlots >= opp.neededSlots ? colors.warning : colors.success} />
                        <Text style={[styles.oppSlotBadgeText, { color: opp.filledSlots >= opp.neededSlots ? colors.warning : colors.success }]}>
                          {opp.filledSlots}/{opp.neededSlots} Relawan
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.oppTitleText, { color: colors.text }]}>{opp.title}</Text>
                    <Text style={[styles.oppDescText, { color: colors.textMuted }]} numberOfLines={2}>
                      {opp.description}
                    </Text>

                    <View style={styles.oppMetaWrap}>
                      <View style={styles.oppMetaItem}>
                        <Feather name="calendar" size={11} color={colors.primary} />
                        <Text style={[styles.oppMetaText, { color: colors.textMuted }]}>{opp.date} • {opp.time}</Text>
                      </View>
                      <View style={styles.oppMetaItem}>
                        <Feather name="map-pin" size={11} color={colors.primary} />
                        <Text style={[styles.oppMetaText, { color: colors.textMuted }]} numberOfLines={1}>{opp.location}</Text>
                      </View>
                      <View style={styles.oppMetaItem}>
                        <Feather name="user-check" size={11} color={colors.textMuted} />
                        <Text style={[styles.oppMetaText, { color: colors.textMuted }]}>Korlap: {opp.coordinatorName}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: colors.primary }}>
                          Buka Detail & Briefing
                        </Text>
                        <Feather name="chevron-right" size={13} color={colors.primary} />
                      </View>

                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          joinOpportunity(opp.id);
                          setDialogConfig({
                            visible: true,
                            title: opp.isJoined ? 'Tugas Dibatalkan' : 'Tugas Berhasil Diambil!',
                            message: opp.isJoined
                              ? `Penugasan "${opp.title}" telah dilepas dari daftar Tugas Saya.`
                              : `Penugasan "${opp.title}" telah ditambahkan ke daftar "Tugas Saya". Silakan cek checklist tugas Anda.`,
                            tone: opp.isJoined ? 'info' : 'success',
                          });
                        }}
                        style={({ pressed }) => [
                          styles.oppActionButton,
                          opp.isJoined
                            ? { backgroundColor: colors.surface, borderColor: colors.success, borderWidth: 1 }
                            : { backgroundColor: colors.primary },
                          pressed && { opacity: 0.85 },
                        ]}
                      >
                        <Feather
                          name={opp.isJoined ? 'check-circle' : 'plus-circle'}
                          size={12}
                          color={opp.isJoined ? colors.success : '#FFFFFF'}
                        />
                        <Text
                          style={[
                            styles.oppActionButtonText,
                            { color: opp.isJoined ? colors.success : '#FFFFFF', fontSize: 11 },
                          ]}
                        >
                          {opp.isJoined ? 'Terdaftar (Batal)' : 'Ambil Tugas'}
                        </Text>
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Event Detail Modal (Menyeluruh + Tombol Daftar RSVP) */}
      <Modal
        visible={Boolean(selectedDetailEvent)}
        onClose={() => setSelectedDetailEvent(null)}
        title="Detail Agenda Kegiatan"
        subtitle={selectedDetailEvent ? `${selectedDetailEvent.category} • ${selectedDetailEvent.dateLabel}` : ''}
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
                    ? isDark ? 'rgba(0,102,179,0.2)' : '#F0F9FF'
                    : isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
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
            <View style={[styles.detailInfoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.detailInfoItem}>
                <View style={[styles.detailInfoIconWrap, { backgroundColor: colors.primaryLight }]}>
                  <Feather name="calendar" size={14} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailInfoLabel, { color: colors.textMuted }]}>Waktu Pelaksanaan</Text>
                  <Text style={[styles.detailInfoValue, { color: colors.text }]}>
                    {selectedDetailEvent.dateLabel} • {selectedDetailEvent.timeLabel}
                  </Text>
                </View>
              </View>

              <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />

              <View style={styles.detailInfoItem}>
                <View style={[styles.detailInfoIconWrap, { backgroundColor: colors.primaryLight }]}>
                  <Feather name="map-pin" size={14} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailInfoLabel, { color: colors.textMuted }]}>Lokasi Kegiatan</Text>
                  <Text style={[styles.detailInfoValue, { color: colors.text }]}>
                    {selectedDetailEvent.location}
                  </Text>
                </View>
              </View>

              {selectedDetailEvent.hostName && (
                <>
                  <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.detailInfoItem}>
                    <View style={[styles.detailInfoIconWrap, { backgroundColor: colors.primaryLight }]}>
                      <Feather name="shield" size={14} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.detailInfoLabel, { color: colors.textMuted }]}>Penyelenggara</Text>
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
                    <View style={[styles.detailInfoIconWrap, { backgroundColor: colors.primaryLight }]}>
                      <Feather name="tag" size={14} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.detailInfoLabel, { color: colors.textMuted }]}>Ketentuan Pakaian</Text>
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
                    <View style={[styles.detailInfoIconWrap, { backgroundColor: colors.primaryLight }]}>
                      <Feather name="phone" size={14} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.detailInfoLabel, { color: colors.textMuted }]}>Narahubung / Korlap</Text>
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
                      <Feather name="check" size={13} color={colors.primary} style={{ marginTop: 2 }} />
                      <Text style={[styles.detailPointText, { color: colors.text }]}>
                        {pt}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Action Buttons: Tombol Pendaftaran RSVP, Presensi GPS & Tiket QR */}
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
                  <Text style={styles.detailGpsBtnText}>
                    Presensi GPS di Lokasi
                  </Text>
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
                    { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(0,43,82,0.3)' : '#F0F9FF' },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Feather name="maximize" size={15} color={colors.primary} strokeWidth={iconStrokeWidth} />
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
                    { borderColor: colors.success, backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5' },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Feather name="check-circle" size={15} color={colors.success} strokeWidth={iconStrokeWidth} />
                  <Text style={[styles.detailQrBtnText, { color: colors.success }]}>
                    Lihat Pas Bukti Kehadiran
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={() => handleToggleRsvp(selectedDetailEvent)}
                style={({ pressed }) => [
                  styles.detailRsvpBtn,
                  {
                    backgroundColor: selectedDetailEvent.attended
                      ? colors.successBg
                      : selectedDetailEvent.isRegistered
                      ? isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2'
                      : colors.primary,
                    borderColor: selectedDetailEvent.attended
                      ? colors.success
                      : selectedDetailEvent.isRegistered
                      ? isDark ? '#EF4444' : '#DC2626'
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
                      ? isDark ? '#EF4444' : '#DC2626'
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
                        ? isDark ? '#EF4444' : '#DC2626'
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
              <Text style={{ fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text, textAlign: 'center' }}>
                {selectedTicketEvent.title}
              </Text>
              <Text style={{ fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primary }}>
                {selectedTicketEvent.dateLabel} • {selectedTicketEvent.timeLabel}
              </Text>
            </View>

            <QrPlaceholder size={180} seed={`TICKET-PAN-${selectedTicketEvent.id}-USR001`} />

            <View style={[styles.ticketNoticeBox, { backgroundColor: isDark ? 'rgba(0,43,82,0.4)' : '#F0F9FF', borderColor: colors.border }]}>
              <Feather name="info" size={14} color={colors.primary} />
              <Text style={[styles.ticketNoticeText, { color: colors.textMuted }]}>
                Tunjukkan QR Code ini ke petugas panitia penerima tamu di pintu masuk lokasi untuk absensi digital.
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

      {/* Task Detail Modal */}
      <Modal
        visible={Boolean(selectedDetailTask)}
        onClose={() => setSelectedDetailTask(null)}
        title="Detail Tugas Relawan"
        subtitle={selectedDetailTask?.title}
        variant="bottomSheet"
      >
        {selectedDetailTask && (() => {
          const isDone = selectedDetailTask.status === 'completed';
          return (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.detailModalScrollContent}
            >
              {/* Badge Status & Kategori */}
              <View style={styles.detailHeaderBadgeRow}>
                <View
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor:
                        selectedDetailTask.category === 'gotv'
                          ? colors.primaryLight
                          : selectedDetailTask.category === 'logistics'
                          ? '#FEF3C7'
                          : selectedDetailTask.category === 'advocacy'
                          ? '#FEE2E2'
                          : colors.primaryLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color:
                          selectedDetailTask.category === 'gotv'
                            ? colors.primary
                            : selectedDetailTask.category === 'logistics'
                            ? '#D97706'
                            : selectedDetailTask.category === 'advocacy'
                            ? '#DC2626'
                            : colors.primary,
                      },
                    ]}
                  >
                    {selectedDetailTask.category === 'gotv'
                      ? 'Relawan Lapangan'
                      : selectedDetailTask.category === 'logistics'
                      ? 'Logistik'
                      : selectedDetailTask.category === 'advocacy'
                      ? 'Advokasi'
                      : 'Pelatihan'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.priorityPill,
                    {
                      backgroundColor: isDone ? colors.successBg : isDark ? 'rgba(234, 179, 8, 0.15)' : '#FEF9C3',
                      borderColor: isDone ? colors.success : '#EAB308',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityBadge,
                      { color: isDone ? colors.success : isDark ? '#FDE047' : '#A16207' },
                    ]}
                  >
                    {isDone ? 'Selesai Dikerjakan' : 'Tugas Aktif'}
                  </Text>
                </View>
              </View>

              {/* Title */}
              <Text style={[styles.detailTitleText, { color: colors.text }]}>
                {selectedDetailTask.title}
              </Text>

              {/* Meta Grid */}
              <View style={[styles.detailInfoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.detailInfoItem}>
                  <Feather name="clock" size={13} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailInfoLabel, { color: colors.textMuted }]}>Tenggat Waktu</Text>
                    <Text style={[styles.detailInfoValue, { color: colors.text }]}>
                      {selectedDetailTask.dueDate} {selectedDetailTask.timeLabel ? `• ${selectedDetailTask.timeLabel}` : ''}
                    </Text>
                  </View>
                </View>

                <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />

                <View style={styles.detailInfoItem}>
                  <Feather name="shield" size={13} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailInfoLabel, { color: colors.textMuted }]}>Peran Pelaksana</Text>
                    <Text style={[styles.detailInfoValue, { color: colors.text }]}>
                      {selectedDetailTask.assignedToRole === 'VOLUNTEER' ? 'Relawan' : selectedDetailTask.assignedToRole === 'WITNESS' ? 'Saksi TPS' : 'Anggota'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Deskripsi Instruksi */}
              <View style={styles.detailSectionBlock}>
                <Text style={[styles.detailSectionHeading, { color: colors.text }]}>
                  Instruksi & Uraian Kerja
                </Text>
                <Text style={[styles.detailSectionBody, { color: colors.textMuted }]}>
                  {selectedDetailTask.desc}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.detailActionButtonsWrap}>
                {selectedDetailTask.actionLabel && selectedDetailTask.actionScreen && (
                  <Pressable
                    onPress={() => {
                      const screen = selectedDetailTask.actionScreen;
                      const params = selectedDetailTask.actionParams;
                      setSelectedDetailTask(null);
                      if (screen) {
                        navigation.navigate(screen as any, params);
                      }
                    }}
                    style={({ pressed }) => [
                      styles.detailQrBtn,
                      { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(0,43,82,0.3)' : '#F0F9FF' },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Feather name="external-link" size={14} color={colors.primary} />
                    <Text style={[styles.detailQrBtnText, { color: colors.primary }]}>
                      {selectedDetailTask.actionLabel}
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={() => {
                    const currentId = selectedDetailTask.id;
                    toggleTaskCompleted(currentId);
                    setSelectedDetailTask((prev) =>
                      prev ? { ...prev, status: prev.status === 'completed' ? 'pending' : 'completed' } : null
                    );
                  }}
                  style={({ pressed }) => [
                    styles.detailRsvpBtn,
                    {
                      backgroundColor: isDone
                        ? isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2'
                        : colors.success,
                      borderColor: isDone
                        ? isDark ? '#EF4444' : '#DC2626'
                        : colors.success,
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Feather
                    name={isDone ? 'rotate-ccw' : 'check-circle'}
                    size={15}
                    color={isDone ? (isDark ? '#EF4444' : '#DC2626') : '#FFFFFF'}
                  />
                  <Text
                    style={[
                      styles.detailRsvpBtnText,
                      { color: isDone ? (isDark ? '#EF4444' : '#DC2626') : '#FFFFFF' },
                    ]}
                  >
                    {isDone ? 'Tandai Belum Selesai' : 'Tandai Tugas Selesai'}
                  </Text>
                </Pressable>

                <PrimaryButton
                  label="Tutup"
                  variant="secondary"
                  onPress={() => setSelectedDetailTask(null)}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </View>
            </ScrollView>
          );
        })()}
      </Modal>

      {/* Volunteer Opportunity Detail Modal */}
      <Modal
        visible={Boolean(selectedDetailOpp)}
        onClose={() => setSelectedDetailOpp(null)}
        title="Detail Peluang Aksi Relawan"
        subtitle={selectedDetailOpp?.title}
        variant="bottomSheet"
      >
        {selectedDetailOpp && (() => {
          const isJoined = selectedDetailOpp.isJoined;
          const slotsLeft = Math.max(0, selectedDetailOpp.neededSlots - selectedDetailOpp.filledSlots);
          return (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.detailModalScrollContent}
            >
              {/* Top Badges */}
              <View style={styles.detailHeaderBadgeRow}>
                <View style={[styles.categoryPill, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.categoryText, { color: colors.primary }]}>
                    {selectedDetailOpp.category}
                  </Text>
                </View>
                <View
                  style={[
                    styles.priorityPill,
                    {
                      backgroundColor: isJoined ? colors.successBg : isDark ? 'rgba(0,102,179,0.2)' : '#EBF5FF',
                      borderColor: isJoined ? colors.success : colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityBadge,
                      { color: isJoined ? colors.success : colors.primary },
                    ]}
                  >
                    {isJoined ? 'Telah Diambil' : `Sisa ${slotsLeft} Kuota`}
                  </Text>
                </View>
              </View>

              {/* Title */}
              <Text style={[styles.detailTitleText, { color: colors.text }]}>
                {selectedDetailOpp.title}
              </Text>

              {/* Meta Grid */}
              <View style={[styles.detailInfoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.detailInfoItem}>
                  <Feather name="calendar" size={13} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailInfoLabel, { color: colors.textMuted }]}>Jadwal Aksi</Text>
                    <Text style={[styles.detailInfoValue, { color: colors.text }]}>
                      {selectedDetailOpp.date} • {selectedDetailOpp.time}
                    </Text>
                  </View>
                </View>

                <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />

                <View style={styles.detailInfoItem}>
                  <Feather name="map-pin" size={13} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailInfoLabel, { color: colors.textMuted }]}>Lokasi Titik Kumpul</Text>
                    <Text style={[styles.detailInfoValue, { color: colors.text }]}>
                      {selectedDetailOpp.location}
                    </Text>
                  </View>
                </View>

                <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />

                <View style={styles.detailInfoItem}>
                  <Feather name="user-check" size={13} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailInfoLabel, { color: colors.textMuted }]}>Koordinator Lapangan (Korlap)</Text>
                    <Text style={[styles.detailInfoValue, { color: colors.text }]}>
                      {selectedDetailOpp.coordinatorName}
                    </Text>
                  </View>
                </View>

                <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />

                <View style={styles.detailInfoItem}>
                  <Feather name="users" size={13} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailInfoLabel, { color: colors.textMuted }]}>Kebutuhan Relawan</Text>
                    <Text style={[styles.detailInfoValue, { color: colors.text }]}>
                      {selectedDetailOpp.filledSlots} / {selectedDetailOpp.neededSlots} relawan terdaftar
                    </Text>
                  </View>
                </View>
              </View>

              {/* Deskripsi Briefing */}
              <View style={styles.detailSectionBlock}>
                <Text style={[styles.detailSectionHeading, { color: colors.text }]}>
                  Briefing & Deskripsi Aksi
                </Text>
                <Text style={[styles.detailSectionBody, { color: colors.textMuted }]}>
                  {selectedDetailOpp.description}
                </Text>
              </View>

              {/* Fasilitas & Perlengkapan Relawan */}
              <View style={styles.detailSectionBlock}>
                <Text style={[styles.detailSectionHeading, { color: colors.text }]}>
                  Perlengkapan & Fasilitas Posko
                </Text>
                <View style={{ gap: 8, marginTop: 6 }}>
                  <View style={styles.detailPointRow}>
                    <Feather name="check" size={13} color={colors.primary} style={{ marginTop: 2 }} />
                    <Text style={[styles.detailPointText, { color: colors.text }]}>
                      Disediakan rompi / atribut resmi relawan PAN di titik posko.
                    </Text>
                  </View>
                  <View style={styles.detailPointRow}>
                    <Feather name="check" size={13} color={colors.primary} style={{ marginTop: 2 }} />
                    <Text style={[styles.detailPointText, { color: colors.text }]}>
                      Konsumsi & air mineral disediakan oleh Korlap setempat.
                    </Text>
                  </View>
                  <View style={styles.detailPointRow}>
                    <Feather name="check" size={13} color={colors.primary} style={{ marginTop: 2 }} />
                    <Text style={[styles.detailPointText, { color: colors.text }]}>
                      Pencatatan poin keaktifan relawan otomatis tercatat di profil Anda.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.detailActionButtonsWrap}>
                <Pressable
                  onPress={() => {
                    const opp = selectedDetailOpp;
                    joinOpportunity(opp.id);
                    setSelectedDetailOpp(null);
                    setDialogConfig({
                      visible: true,
                      title: isJoined ? 'Tugas Dibatalkan' : 'Tugas Berhasil Diambil!',
                      message: isJoined
                        ? `Penugasan "${opp.title}" telah dilepas dari daftar Tugas Saya.`
                        : `Penugasan "${opp.title}" telah ditambahkan ke daftar "Tugas Saya". Silakan cek checklist tugas Anda.`,
                      tone: isJoined ? 'info' : 'success',
                    });
                  }}
                  style={({ pressed }) => [
                    styles.detailRsvpBtn,
                    {
                      backgroundColor: isJoined
                        ? isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2'
                        : colors.primary,
                      borderColor: isJoined
                        ? isDark ? '#EF4444' : '#DC2626'
                        : colors.primary,
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Feather
                    name={isJoined ? 'x-circle' : 'plus-circle'}
                    size={15}
                    color={isJoined ? (isDark ? '#EF4444' : '#DC2626') : '#FFFFFF'}
                  />
                  <Text
                    style={[
                      styles.detailRsvpBtnText,
                      { color: isJoined ? (isDark ? '#EF4444' : '#DC2626') : '#FFFFFF' },
                    ]}
                  >
                    {isJoined ? 'Batalkan Keikutsertaan' : 'Ambil Tugas Ini'}
                  </Text>
                </Pressable>

                <PrimaryButton
                  label="Tutup"
                  variant="secondary"
                  onPress={() => setSelectedDetailOpp(null)}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </View>
            </ScrollView>
          );
        })()}
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
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  bannerTitle: { fontFamily: fonts.bold, fontSize: fontSize.sm },
  bannerSubtitle: { fontFamily: fonts.regular, fontSize: fontSize.xs, lineHeight: 16 },

  // Top Header Section
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
    marginTop: 8,
  },
  topHeaderSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  todayPillText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#A16207',
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
    alignItems: 'center',
    marginVertical: 3,
  },
  gridDayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    marginTop: 1,
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
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },

  // Events List Container
  eventsListWrap: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: 4,
    paddingBottom: 24,
  },
  listContent: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
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

  // Child Menu Tab Switcher (Agenda vs Tugas)
  mainTabTrack: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    borderBottomWidth: 1,
  },
  mainTabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  mainTabText: {
    fontSize: 12,
  },

  // Sub-Tab Switcher (Tugas Saya vs Bursa Aksi Relawan)
  subTabTrack: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    gap: 4,
  },
  subTabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  subTabText: {
    fontSize: 11.5,
  },

  // Task & Bursa Styles
  tasksSummaryBanner: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  taskProgressTrack: {
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  taskProgressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  taskFilterRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  taskItemCard: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  taskCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  taskItemTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
  },
  taskItemDesc: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  taskActionBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },

  // Volunteer Opportunities (Bursa)
  volunteerOppCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  oppHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  oppCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  oppCategoryBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  oppSlotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  oppSlotBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  oppTitleText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  oppDescText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  oppMetaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 2,
  },
  oppMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  oppMetaText: {
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  oppActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.md,
    marginTop: 4,
  },
  oppActionButtonText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
});
