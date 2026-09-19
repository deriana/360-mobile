import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, ConfirmDialog, EmptyState, Pill, PrimaryButton, SectionTitle } from '../components/ui';
import { fonts, fontSize, iconStrokeWidth, radius, spacing } from '../theme';
import { TaskCategory, TaskItem, VolunteerOpportunity } from '../types';

export default function TasksScreen({ navigation, route }: any) {
  const {
    tasks,
    toggleTaskCompleted,
    role,
    currentUser,
    volunteerOpportunities,
    joinOpportunity,
  } = useApp();
  const { colors, isDark } = useTheme();

  const [topTab, setTopTab] = useState<'my_tasks' | 'bursa'>(
    route?.params?.subTab === 'bursa' ? 'bursa' : 'my_tasks'
  );
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone?: 'success' | 'info' | 'warning';
  }>({ visible: false, title: '', message: '' });

  const isVolunteerOnly = (role === 'VOLUNTEER' || role === 'RELAWAN') && !currentUser.roles.some((r) => r.role === 'WITNESS');

  // Saring tugas berdasarkan wewenang: Relawan murni tidak memiliki hak/kewajiban C1 & saksi bilik TPS
  const availableTasks = tasks.filter((t) => {
    if (isVolunteerOnly) {
      return t.assignedToRole !== 'WITNESS';
    }
    return true;
  });

  const [categoryFilter, setCategoryFilter] = useState<'all' | TaskCategory>('all');

  const completedCount = availableTasks.filter((t) => t.status === 'completed').length;
  const totalCount = availableTasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = availableTasks.filter((t) => {
    if (categoryFilter === 'all') return true;
    return t.category === categoryFilter;
  });

  const handleActionPress = (task: TaskItem) => {
    if (task.actionScreen) {
      navigation.navigate(task.actionScreen, task.actionParams);
    } else {
      toggleTaskCompleted(task.id);
    }
  };

  const handleJoinOpportunity = (opp: VolunteerOpportunity) => {
    if (opp.isJoined) {
      setDialogConfig({
        visible: true,
        title: 'Sudah Terdaftar',
        message: `Anda telah terdaftar pada aksi "${opp.title}". Silakan hubungi ${opp.coordinatorName} untuk koordinasi.`,
        tone: 'info',
      });
      return;
    }

    joinOpportunity(opp.id);
    setDialogConfig({
      visible: true,
      title: 'Pendaftaran Berhasil!',
      message: `Terima kasih! Anda resmi terdaftar pada "${opp.title}". PIC Penugasan: ${opp.coordinatorName}. Catatan tugas telah ditambahkan ke antrean Anda.`,
      tone: 'success',
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Top Segmented SubTab: Checklist Tugas vs Bursa Aksi Relawan */}
      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: 8 }}>
        <Pressable
          onPress={() => setTopTab('my_tasks')}
          style={[
            styles.segmentBtn,
            {
              backgroundColor: topTab === 'my_tasks' ? colors.primary : colors.surface,
              borderColor: topTab === 'my_tasks' ? colors.primary : colors.border,
            },
          ]}
        >
          <Feather name="check-square" size={13} color={topTab === 'my_tasks' ? '#FFFFFF' : colors.textMuted} />
          <Text style={[styles.segmentBtnText, { color: topTab === 'my_tasks' ? '#FFFFFF' : colors.textMuted }]}>
            Checklist Tugas ({availableTasks.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setTopTab('bursa')}
          style={[
            styles.segmentBtn,
            {
              backgroundColor: topTab === 'bursa' ? colors.primary : colors.surface,
              borderColor: topTab === 'bursa' ? colors.primary : colors.border,
            },
          ]}
        >
          <Feather name="briefcase" size={13} color={topTab === 'bursa' ? '#FFFFFF' : colors.textMuted} />
          <Text style={[styles.segmentBtnText, { color: topTab === 'bursa' ? '#FFFFFF' : colors.textMuted }]}>
            Bursa Peluang Aksi ({volunteerOpportunities?.length || 0})
          </Text>
        </Pressable>
      </View>

      {topTab === 'bursa' ? (
        /* Bursa Peluang Aksi Relawan */
        <FlatList
          data={volunteerOpportunities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={{ paddingBottom: spacing.xs, gap: 2 }}>
              <Text style={{ fontSize: 13.5, fontFamily: fonts.bold, color: colors.text }}>
                Bursa Penugasan Terbuka Wilayah Posko
              </Text>
              <Text style={{ fontSize: 11, fontFamily: fonts.regular, color: colors.textMuted }}>
                Pilih aksi sukarela untuk menambah poin kontribusi dan rekam jejak relawan PAN:
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isFull = item.filledSlots >= item.neededSlots;

            return (
              <Card style={[styles.taskCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Pill label={item.category} tone="primary" />
                  <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: isFull ? colors.danger : colors.success }}>
                    {item.filledSlots} / {item.neededSlots} Relawan Terisi
                  </Text>
                </View>

                <View style={{ gap: 3 }}>
                  <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.taskDesc, { color: colors.textMuted }]}>{item.description}</Text>
                </View>

                <View style={{ gap: 4, marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="map-pin" size={12} color={colors.textMuted} />
                    <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.regular }}>
                      {item.location}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="calendar" size={12} color={colors.textMuted} />
                    <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.regular }}>
                      {item.date} • {item.time} WIB
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="user" size={12} color={colors.textMuted} />
                    <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.regular }}>
                      Koordinator: {item.coordinatorName}
                    </Text>
                  </View>
                </View>

                <View style={{ marginTop: 6 }}>
                  <PrimaryButton
                    label={item.isJoined ? 'Terdaftar (Siap Tugas)' : isFull ? 'Slot Penuh' : 'Ambil Penugasan Ini'}
                    icon={item.isJoined ? 'check' : undefined}
                    variant={item.isJoined ? 'secondary' : 'primary'}
                    disabled={isFull && !item.isJoined}
                    onPress={() => handleJoinOpportunity(item)}
                  />
                </View>
              </Card>
            );
          }}
        />
      ) : (
        /* Checklist Tugas Saya */
        <>
          {/* Task Summary Banner */}
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.summaryTopRow}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.summaryHeading, { color: colors.text }]}>
                  {isVolunteerOnly ? 'Tugas Aksi Relawan Posko' : 'Tugas & Penugasan Lapangan'}
                </Text>
                <Text style={[styles.summarySub, { color: colors.textMuted }]}>
                  {isVolunteerOnly
                    ? 'Checklist mobilisasi warga, aduan posko, & pelatihan PAN'
                    : 'Checklist aksi prioritas saksi TPS, relawan, & kader partai'}
                </Text>
              </View>
              <Pill
                label={`${completedCount} dari ${totalCount} Selesai`}
                tone={completedCount === totalCount ? 'success' : 'primary'}
              />
            </View>

            {/* Progress Bar */}
            <View style={{ gap: 4, marginTop: spacing.xs }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.textMuted }}>
                  Kelengkapan Checklist
                </Text>
                <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.primary }}>
                  {progressPct}%
                </Text>
              </View>
              <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPct}%`, backgroundColor: progressPct === 100 ? colors.success : colors.primary },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Category Pills */}
          <View style={styles.filterTrack}>
            {(isVolunteerOnly
              ? [
                  { key: 'all' as const, label: 'Semua Tugas' },
                  { key: 'gotv' as const, label: 'Aksi Relawan' },
                  { key: 'advocacy' as const, label: 'Aduan Posko' },
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
                onPress={() => setCategoryFilter(f.key)}
                style={[
                  styles.filterPill,
                  categoryFilter === f.key
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: categoryFilter === f.key ? '#FFFFFF' : colors.textMuted },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Tasks List */}
          {filteredTasks.length === 0 ? (
            <EmptyState
              title="Tidak Ada Tugas"
              body="Semua tugas dalam kategori ini telah terselesaikan."
              icon="check-circle"
            />
          ) : (
            <FlatList
              data={filteredTasks}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isDone = item.status === 'completed';

                return (
                  <Card
                    style={[
                      styles.taskCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isDone ? colors.success : colors.border,
                      },
                    ]}
                  >
                    <View style={styles.taskCardTop}>
                      <Pressable
                        onPress={() => toggleTaskCompleted(item.id)}
                        hitSlop={8}
                        style={[
                          styles.checkCircle,
                          {
                            backgroundColor: isDone ? colors.success : 'transparent',
                            borderColor: isDone ? colors.success : colors.borderStrong,
                          },
                        ]}
                      >
                        {isDone && <Feather name="check" size={13} color="#FFFFFF" strokeWidth={3} />}
                      </Pressable>

                      <View style={{ flex: 1, gap: 2 }}>
                        <Text
                          style={[
                            styles.taskTitle,
                            {
                              color: colors.text,
                              textDecorationLine: isDone ? 'line-through' : 'none',
                              opacity: isDone ? 0.7 : 1,
                            },
                          ]}
                        >
                          {item.title}
                        </Text>
                        <Text style={[styles.taskDesc, { color: colors.textMuted }]}>{item.desc}</Text>
                      </View>
                    </View>

                    <View style={[styles.taskDivider, { backgroundColor: colors.border }]} />

                    <View style={styles.taskFooter}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
                        <Feather
                          name={isDone ? 'check-circle' : 'clock'}
                          size={12}
                          color={isDone ? colors.success : colors.primary}
                        />
                        <Text
                          style={[
                            styles.taskTimeNote,
                            { color: isDone ? colors.success : colors.textMuted },
                          ]}
                        >
                          {item.timeLabel}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => handleActionPress(item)}
                        style={({ pressed }) => [
                          styles.actionBtn,
                          {
                            backgroundColor: isDone ? colors.surface : colors.primary,
                            borderColor: isDone ? colors.border : colors.primary,
                            borderWidth: isDone ? 1 : 0,
                          },
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.actionBtnText,
                            { color: isDone ? colors.text : '#FFFFFF' },
                          ]}
                        >
                          {item.actionLabel || (isDone ? 'Buka Ulang' : 'Kerjakan')}
                        </Text>
                        <Feather
                          name="chevron-right"
                          size={12}
                          color={isDone ? colors.text : '#FFFFFF'}
                        />
                      </Pressable>
                    </View>
                  </Card>
                );
              }}
            />
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        visible={dialogConfig.visible}
        title={dialogConfig.title}
        message={dialogConfig.message}
        tone={dialogConfig.tone}
        confirmLabel="Mengerti"
        onConfirm={() => setDialogConfig({ visible: false, title: '', message: '' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  segmentBtnText: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
  },
  summaryCard: {
    padding: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: 1,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryHeading: { fontFamily: fonts.bold, fontSize: fontSize.sm },
  summarySub: { fontFamily: fonts.regular, fontSize: fontSize.xs, lineHeight: 16 },
  progressBarTrack: {
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  filterTrack: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterText: { fontFamily: fonts.semiBold, fontSize: 11 },
  listContent: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },
  taskCard: { padding: spacing.md, gap: spacing.xs },
  taskCardTop: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  taskTitle: { fontFamily: fonts.bold, fontSize: fontSize.sm, lineHeight: 20 },
  taskDesc: { fontFamily: fonts.regular, fontSize: fontSize.xs, lineHeight: 16 },
  taskDivider: { height: 1, width: '100%', marginVertical: spacing.xs },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTimeNote: { fontFamily: fonts.medium, fontSize: 11 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  actionBtnText: { fontFamily: fonts.bold, fontSize: 11 },
});
