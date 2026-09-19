import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import {
  tpsList as initialTps,
  witnesses as initialWitnesses,
  coordinators as initialCoordinators,
  emergencyReports as initialEmergencyReports,
  broadcasts as initialBroadcasts,
  payments as initialPayments,
} from '../data';
import { IMAGES } from '../data/images';
import { INITIAL_EVENTS, INITIAL_NOTIFICATIONS, INITIAL_TASKS } from '../data/tasksAndEvents';
import {
  Broadcast,
  CareerStatePresetId,
  Coordinator,
  CurrentUser,
  EmergencyReport,
  EventItem,
  MobileRole,
  NotificationItem,
  Payment,
  ResignationRequestPayload,
  Role,
  TaskItem,
  Tps,
  TpsDocPhoto,
  TpsStatus,
  UserDimensions,
  VolunteerOpportunity,
  VolunteerPausePayload,
  VolunteerStatePresetId,
  VolunteerStopPayload,
  VoteCounts,
  Witness,
} from '../types';
import {
  addToOfflineQueue,
  checkNetworkIsOnline,
  getUnsyncedQueueCount,
  initNetInfoAutoFlush,
  syncOfflineQueue,
} from '../utils/offlineQueue';
import {
  applyCareerPreset,
  applyVolunteerPreset,
  CAREER_PRESETS,
  getPermissionsForRole,
  getUserContext,
  INITIAL_VOLUNTEER_OPPORTUNITIES,
  ROLE_PERMISSIONS_BY_MOBILE_ROLE,
  VOLUNTEER_PRESETS,
} from '../utils/userContext';
import { checkRoleEligibility } from '../utils/roleUnlockRules';

const SEED_DOCUMENTATION: Record<string, TpsDocPhoto[]> = {
  'TPS-001': [
    { id: 'seed-1', source: IMAGES.tpsSchool, takenAt: '07:30 WIB — Lokasi TPS' },
    { id: 'seed-2', source: IMAGES.ballotPaper, takenAt: '08:15 WIB — Papan Hitung' },
    { id: 'seed-3', source: IMAGES.c1Form, takenAt: '13:45 WIB — C1 Plano' },
  ],
};

const DEFAULT_USER_DIMENSIONS: UserDimensions = {
  membership: 'active',
  kader: 'kader_aktif',
  position: { position: 'NONE', region: 'Kota Bandung' },
  electoral: { status: 'NONE' },
  volunteer: 'active',
  programs: {
    amanatAcademy: 'GRADUATED',
    academyProgress: 100,
    pandawa: 'ACTIVE',
    programSaksi: 'MANDATED',
    saksiProgress: 100,
    skMandatNumber: 'BSN/DPD-BDG/2024/001',
  },
  operationalRole: 'WITNESS',
};

const DEFAULT_USER: CurrentUser = {
  id: 'USR-001',
  identity: {
    id: 'USR-001',
    name: 'Rudi Saputra',
    nikMasked: '327301******0001',
    nikFull: '3273011204920001',
    phone: '0812-3456-7890',
    email: 'saksi@pan.go.id',
    avatarIndex: 0,
    status: 'active',
  },
  memberships: [
    {
      type: 'member',
      status: 'verified',
      ktaNumber: '32.73.01.2024.08912',
      registeredAt: '2024-01-15',
      dpc: 'DPC Coblong',
      dpd: 'DPD Kota Bandung',
    },
    {
      type: 'volunteer',
      status: 'active',
      registeredAt: '2024-03-01',
      dpc: 'DPC Coblong',
    },
  ],
  roles: [
    {
      role: 'WITNESS',
      status: 'assigned',
      scope: { level: 'TPS', code: 'TPS-001', name: 'TPS 001 Kel. Dago, Kec. Coblong' },
      assignedAt: '2026-09-01',
    },
    {
      role: 'MEMBER',
      status: 'active',
      scope: { level: 'REGENCY', code: '3273', name: 'DPD PAN Kota Bandung' },
      assignedAt: '2024-01-15',
    },
    {
      role: 'VOLUNTEER',
      status: 'active',
      scope: { level: 'DISTRICT', code: '327301', name: 'Kecamatan Coblong' },
      assignedAt: '2024-03-01',
    },
    {
      role: 'TPS_COORDINATOR',
      status: 'active',
      scope: { level: 'DISTRICT', code: '327301', name: 'Kluster 6 TPS Kel. Dago' },
      assignedAt: '2026-09-10',
    },
  ],
  currentRole: 'WITNESS',
  permissions: [
    'view_own_profile',
    'edit_own_profile',
    'view_activity',
    'join_activity',
    'checkin_activity',
    'view_volunteer_profile',
    'view_volunteer_task',
    'view_assigned_tps',
    'checkin_tps',
    'submit_witness_report',
    'upload_evidence',
    'submit_incident',
    'view_assigned_witnesses',
    'view_checkin_status',
    'send_task_reminder',
  ],
  dimensions: DEFAULT_USER_DIMENSIONS,
};

const AVAILABLE_MOBILE_ROLES: MobileRole[] = [
  'WITNESS',
  'MEMBER',
  'VOLUNTEER',
  'TPS_COORDINATOR',
  'FIELD_COORDINATOR',
  'CALEG_OPS',
];

interface AppContextValue {
  role: Role;
  setRole: (role: Role) => void;
  currentUser: CurrentUser;
  availableRoles: MobileRole[];
  switchActiveRole: (nextRole: Role) => void;
  switchOperationalRoleWithGuard: (nextRole: Role) => { success: boolean; reason?: string };
  applyCareerStatePreset: (presetId: CareerStatePresetId) => void;
  applyVolunteerStatePreset: (presetId: VolunteerStatePresetId) => void;
  requestMembershipResignation: (payload: ResignationRequestPayload) => { success: boolean; reason?: string };
  cancelMembershipResignation: () => void;
  setVolunteerPause: (payload: VolunteerPausePayload) => void;
  stopVolunteer: (payload: VolunteerStopPayload) => void;
  completeAcademyModule: (moduleId: string) => void;
  hasPermission: (permission: string) => boolean;
  loggedIn: boolean;
  login: (role: Role, email?: string) => void;
  logout: () => void;
  tps: Tps[];
  witnesses: Witness[];
  coordinators: Coordinator[];
  emergencyReports: EmergencyReport[];
  broadcasts: Broadcast[];
  payments: Payment[];
  documentation: Record<string, TpsDocPhoto[]>;
  getDocumentation: (tpsId: string) => TpsDocPhoto[];
  addDocumentationPhoto: (tpsId: string, photo: Omit<TpsDocPhoto, 'id'>) => void;
  removeDocumentationPhoto: (tpsId: string, photoId: string) => void;
  checkInWitness: (
    witnessId: string,
    override?: {
      lat: number;
      lng: number;
      locationLabel?: string;
      distanceMeters?: number;
      overrideNote?: string;
      insideGeofence?: boolean;
    },
  ) => void;
  submitTpsReport: (
    tpsId: string,
    payload: { votersPresent: number; votes: VoteCounts; status: TpsStatus },
  ) => void;
  addEmergencyReport: (report: Omit<EmergencyReport, 'id' | 'createdAt' | 'status'>) => void;
  addBroadcast: (broadcast: Omit<Broadcast, 'id' | 'sentAt'>) => void;
  markPaymentPaid: (witnessId: string) => void;
  isOnline: boolean;
  unsyncedQueueCount: number;
  flushQueueNow: () => Promise<number>;
  events: EventItem[];
  rsvpEvent: (eventId: string) => void;
  tasks: TaskItem[];
  toggleTaskCompleted: (taskId: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (notifId: string) => void;
  volunteerOpportunities: VolunteerOpportunity[];
  joinOpportunity: (opportunityId: string) => void;
  applyWitnessCandidate: () => void;
  upgradeToMember: (ktaNumber: string, details?: { dpd?: string; dpc?: string; registeredAt?: string }) => void;
  checkInEvent: (eventId: string, details?: any) => void;
  poskoCheckIn: { checkedIn: boolean; time: string | null; poskoName: string };
  checkInPosko: (poskoName: string, details?: any) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('WITNESS');
  const [currentUser, setCurrentUser] = useState<CurrentUser>(DEFAULT_USER);
  const [loggedIn, setLoggedIn] = useState(false);
  const [tps, setTps] = useState<Tps[]>(initialTps);
  const [witnesses, setWitnesses] = useState<Witness[]>(initialWitnesses);
  const [coordinators] = useState<Coordinator[]>(initialCoordinators);
  const [emergencyReports, setEmergencyReports] = useState<EmergencyReport[]>(initialEmergencyReports);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(initialBroadcasts);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [documentation, setDocumentation] = useState<Record<string, TpsDocPhoto[]>>(SEED_DOCUMENTATION);
  const [isOnline, setIsOnline] = useState(true);
  const [unsyncedQueueCount, setUnsyncedQueueCount] = useState(0);

  // New modules: Events, Tasks, Notifications, Volunteer Opportunities
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [volunteerOpportunities, setVolunteerOpportunities] = useState<VolunteerOpportunity[]>(INITIAL_VOLUNTEER_OPPORTUNITIES);
  const [poskoCheckIn, setPoskoCheckIn] = useState<{ checkedIn: boolean; time: string | null; poskoName: string }>({
    checkedIn: false,
    time: null,
    poskoName: 'Posko Kawal Suara Dago Atas No. 84, Coblong',
  });

  // Monitor network connectivity & auto-flush offline transactions
  useEffect(() => {
    checkNetworkIsOnline().then(setIsOnline);
    getUnsyncedQueueCount().then(setUnsyncedQueueCount);

    const unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
    });

    const unsubscribeAutoFlush = initNetInfoAutoFlush((syncedCount: number) => {
      if (syncedCount > 0) {
        getUnsyncedQueueCount().then(setUnsyncedQueueCount);
      }
    });

    return () => {
      unsubscribeNetInfo();
      unsubscribeAutoFlush();
    };
  }, []);

  const switchActiveRole = (nextRole: Role) => {
    setRole(nextRole);
    const isMobile = AVAILABLE_MOBILE_ROLES.includes(nextRole as MobileRole);
    if (isMobile) {
      setCurrentUser((prev) => {
        const curDims = prev.dimensions ?? DEFAULT_USER_DIMENSIONS;
        return {
          ...prev,
          currentRole: nextRole as MobileRole,
          permissions: ROLE_PERMISSIONS_BY_MOBILE_ROLE[nextRole as MobileRole] ?? getPermissionsForRole(nextRole as MobileRole),
          dimensions: {
            ...curDims,
            operationalRole: nextRole as MobileRole,
          },
        };
      });
    }
  };

  const switchOperationalRoleWithGuard: AppContextValue['switchOperationalRoleWithGuard'] = (nextRole: Role) => {
    const isMobile = AVAILABLE_MOBILE_ROLES.includes(nextRole as MobileRole);
    if (!isMobile) {
      return { success: false, reason: 'Peran tidak didukung pada aplikasi mobile.' };
    }

    const check = checkRoleEligibility(currentUser, nextRole as MobileRole);
    if (!check.allowed) {
      return {
        success: false,
        reason: check.reason || check.missingRequirements?.join('\n') || 'Persyaratan belum terpenuhi.',
      };
    }

    setRole(nextRole);
    setCurrentUser((prev) => {
      const curDims = prev.dimensions ?? DEFAULT_USER_DIMENSIONS;
      return {
        ...prev,
        currentRole: nextRole as MobileRole,
        permissions: ROLE_PERMISSIONS_BY_MOBILE_ROLE[nextRole as MobileRole] ?? prev.permissions,
        dimensions: {
          ...curDims,
          operationalRole: nextRole as MobileRole,
        },
      };
    });

    const notif: NotificationItem = {
      id: `NOTIF-ROLE-${Date.now()}`,
      type: 'assignment',
      title: `Peran Operasional Diubah: ${nextRole}`,
      body: `Antarmuka aplikasi telah beralih ke mode operasional ${nextRole}.`,
      sentAt: 'Baru saja',
      sentBy: 'Sistem Akses simPAN',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return { success: true };
  };

  const applyCareerStatePreset = (presetId: CareerStatePresetId) => {
    setCurrentUser((prev) => {
      const updated = applyCareerPreset(prev, presetId);
      setRole(updated.currentRole);
      return updated;
    });

    const preset = CAREER_PRESETS[presetId];
    const notif: NotificationItem = {
      id: `NOTIF-PRESET-${Date.now()}`,
      type: 'assignment',
      title: `Preset Karir Diaktifkan: ${preset?.name ?? presetId}`,
      body: `Profil Anda kini berada di simulasi ${preset?.desc ?? ''}. Seluruh 7 dimensi identitas telah diselaraskan.`,
      sentAt: 'Baru saja',
      sentBy: 'DPP PAN Simulator',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const applyVolunteerStatePreset = (presetId: VolunteerStatePresetId) => {
    setCurrentUser((prev) => {
      const updated = applyVolunteerPreset(prev, presetId);
      setRole(updated.currentRole);
      return updated;
    });

    const preset = VOLUNTEER_PRESETS[presetId];
    const notif: NotificationItem = {
      id: `NOTIF-VOL-PRESET-${Date.now()}`,
      type: 'assignment',
      title: `Mode Relawan Diaktifkan: ${preset?.name ?? presetId}`,
      body: `Status relawan kini diatur ke: ${preset?.desc ?? ''}.`,
      sentAt: 'Baru saja',
      sentBy: 'Posko Pemenangan PAN',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const requestMembershipResignation: AppContextValue['requestMembershipResignation'] = (payload) => {
    const activeTasksCount = tasks.filter((t) => t.status === 'in_progress' || t.status === 'pending').length;

    setCurrentUser((prev) => {
      const curDims = prev.dimensions ?? DEFAULT_USER_DIMENSIONS;
      return {
        ...prev,
        resignationRequest: {
          ...payload,
          requestedAt: new Date().toISOString().slice(0, 10),
        },
        dimensions: {
          ...curDims,
          membership: 'resignation_requested',
        },
      };
    });

    const notif: NotificationItem = {
      id: `NOTIF-RESIGN-${Date.now()}`,
      type: 'reminder',
      title: 'Pengajuan Pengunduran Diri Diproses',
      body: `Permohonan Anda telah tercatat dan dikirim ke DPD PAN Kota Bandung. Catatan Active Task: ${activeTasksCount} tugas masih berjalan.`,
      sentAt: 'Baru saja',
      sentBy: 'Sekretariat DPD PAN',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return { success: true };
  };

  const cancelMembershipResignation = () => {
    setCurrentUser((prev) => {
      const curDims = prev.dimensions ?? DEFAULT_USER_DIMENSIONS;
      return {
        ...prev,
        resignationRequest: undefined,
        dimensions: {
          ...curDims,
          membership: 'active',
        },
      };
    });

    const notif: NotificationItem = {
      id: `NOTIF-CANCEL-RESIGN-${Date.now()}`,
      type: 'reminder',
      title: 'Pengajuan Pengunduran Diri Dibatalkan',
      body: 'Status keanggotaan simPAN Anda telah dikembalikan menjadi Aktif penuh.',
      sentAt: 'Baru saja',
      sentBy: 'Sekretariat DPD PAN',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const setVolunteerPause: AppContextValue['setVolunteerPause'] = (payload) => {
    setCurrentUser((prev) => {
      const curDims = prev.dimensions ?? DEFAULT_USER_DIMENSIONS;
      return {
        ...prev,
        volunteerPauseInfo: {
          isPaused: payload.isPaused,
          reason: payload.reason,
          durationMonths: payload.durationMonths,
        },
        dimensions: {
          ...curDims,
          volunteer: payload.isPaused ? 'paused' : 'active',
        },
      };
    });

    const notif: NotificationItem = {
      id: `NOTIF-PAUSE-${Date.now()}`,
      type: 'reminder',
      title: payload.isPaused ? 'Partisipasi Relawan Dijeda Sementara' : 'Status Relawan Aktif Kembali',
      body: payload.isPaused
        ? `Partisipasi relawan dijeda (${payload.durationMonths ?? 1} bulan) karena: ${payload.reason}. Riwayat aktivitas tetap tersimpan.`
        : 'Selamat datang kembali! Akun siap menerima penugasan posko.',
      sentAt: 'Baru saja',
      sentBy: 'Posko Relawan PAN',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const stopVolunteer: AppContextValue['stopVolunteer'] = (payload) => {
    setCurrentUser((prev) => {
      const curDims = prev.dimensions ?? DEFAULT_USER_DIMENSIONS;
      return {
        ...prev,
        dimensions: {
          ...curDims,
          volunteer: 'inactive',
        },
      };
    });

    const notif: NotificationItem = {
      id: `NOTIF-STOP-${Date.now()}`,
      type: 'reminder',
      title: 'Partisipasi Relawan Dinonaktifkan',
      body: 'Status relawan Anda telah dinonaktifkan. Seluruh riwayat pengawalan suara dan sertifikat Anda tetap tersimpan utuh di simPAN.',
      sentAt: 'Baru saja',
      sentBy: 'Posko Relawan PAN',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const completeAcademyModule = (moduleId: string) => {
    setCurrentUser((prev) => {
      const curDims = prev.dimensions ?? DEFAULT_USER_DIMENSIONS;
      return {
        ...prev,
        dimensions: {
          ...curDims,
          programs: {
            ...curDims.programs,
            amanatAcademy: 'GRADUATED',
            academyProgress: 100,
            programSaksi: 'MANDATED',
            saksiProgress: 100,
            skMandatNumber: curDims.programs.skMandatNumber || 'BSN/DPD-BDG/2024/018',
          },
        },
      };
    });

    const notif: NotificationItem = {
      id: `NOTIF-ACADEMY-DONE-${Date.now()}`,
      type: 'approval',
      title: 'Selamat! Modul Bimtek Selesai & Lulus 100%',
      body: `Modul pelatihan ${moduleId} telah diselesaikan. SK Mandat BSN Saksi TPS kini telah aktif dan terverifikasi.`,
      sentAt: 'Baru saja',
      sentBy: 'Amanat Academy BSN',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const hasPermission = (permission: string): boolean => {
    return currentUser.permissions.includes(permission);
  };

  const rsvpEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, isRegistered: !e.isRegistered } : e)),
    );
  };

  const toggleTaskCompleted = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t,
      ),
    );
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)),
    );
  };

  const joinOpportunity = (opportunityId: string) => {
    let targetOpp: VolunteerOpportunity | undefined;

    setVolunteerOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id !== opportunityId) return opp;
        const nextJoined = !opp.isJoined;
        targetOpp = {
          ...opp,
          isJoined: nextJoined,
          filledSlots: nextJoined ? opp.filledSlots + 1 : Math.max(0, opp.filledSlots - 1),
        };
        return targetOpp;
      }),
    );

    // Sinkronisasi otomatis ke Tugas Saya
    setTasks((prev) => {
      const taskExistingId = `TSK-BURSA-${opportunityId}`;
      const isAlreadyInTasks = prev.some((t) => t.id === taskExistingId);

      if (!targetOpp) return prev;

      if (targetOpp.isJoined) {
        if (isAlreadyInTasks) return prev;

        // Tentukan kategori task dari bursa category
        let mappedCat: 'gotv' | 'logistics' | 'advocacy' | 'training' = 'gotv';
        if (targetOpp.category === 'Logistik') mappedCat = 'logistics';
        else if (targetOpp.category === 'Pengawalan Warga') mappedCat = 'gotv';
        else if (targetOpp.category === 'Registrasi Posko') mappedCat = 'logistics';

        const newTask: TaskItem = {
          id: taskExistingId,
          title: targetOpp.title,
          desc: targetOpp.description,
          category: mappedCat,
          assignedToRole: 'VOLUNTEER',
          dueDate: targetOpp.date,
          timeLabel: `${targetOpp.time} • Korlap: ${targetOpp.coordinatorName}`,
          status: 'in_progress',
          actionLabel: 'Selesai',
        };
        return [newTask, ...prev];
      } else {
        // Jika dibatalkan dari bursa, hapus dari Tugas Saya
        return prev.filter((t) => t.id !== taskExistingId);
      }
    });
  };

  const applyWitnessCandidate = () => {
    setCurrentUser((prev) => ({
      ...prev,
      candidateStatus: 'APPLIED',
    }));

    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      type: 'assignment',
      title: 'Pengajuan Calon Saksi TPS Berhasil Dikirim',
      body: 'Data pengajuan Anda sebagai calon saksi resmi TPS telah diterima Tim BSN DPD PAN Kota Bandung untuk verifikasi administrasi dan penugasan lapangan.',
      sentAt: 'Baru saja',
      sentBy: 'BSN DPD Kota Bandung',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const upgradeToMember = (
    ktaNumber: string,
    details?: { dpd?: string; dpc?: string; registeredAt?: string },
  ) => {
    setCurrentUser((prev) => {
      const existingMemberships = prev.memberships.filter((m) => m.type !== 'member');
      const newMemberRecord = {
        type: 'member' as const,
        status: 'verified' as const,
        ktaNumber,
        registeredAt: details?.registeredAt || new Date().toISOString().split('T')[0],
        dpd: details?.dpd || 'DPD PAN Kota Bandung',
        dpc: details?.dpc || 'DPC Coblong',
      };

      const hasMemberRole = prev.roles.some((r) => r.role === 'MEMBER');
      const updatedRoles = hasMemberRole
        ? prev.roles
        : [
            ...prev.roles,
            {
              role: 'MEMBER' as MobileRole,
              status: 'active' as const,
              scope: { level: 'REGENCY' as const, code: '3273', name: 'DPD PAN Kota Bandung' },
              assignedAt: new Date().toISOString().split('T')[0],
            },
          ];

      return {
        ...prev,
        memberships: [newMemberRecord, ...existingMemberships],
        roles: updatedRoles,
      };
    });

    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      type: 'approval',
      title: 'Selamat! e-KTA simPAN Berhasil Diterbitkan',
      body: `Keanggotaan Anda telah resmi terverifikasi dengan Nomor e-KTA: ${ktaNumber}. Anda kini memiliki hak penuh sebagai Kader & Anggota Resmi Partai.`,
      sentAt: 'Baru saja',
      sentBy: 'Sekretariat DPP/DPD PAN',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const getDocumentation = (tpsId: string) => documentation[tpsId] ?? [];

  const addDocumentationPhoto: AppContextValue['addDocumentationPhoto'] = (tpsId, photo) => {
    setDocumentation((prev) => ({
      ...prev,
      [tpsId]: [...(prev[tpsId] ?? []), { ...photo, id: `${tpsId}-${(prev[tpsId]?.length ?? 0) + 1}-${Date.now()}` }],
    }));
  };

  const removeDocumentationPhoto: AppContextValue['removeDocumentationPhoto'] = (tpsId, photoId) => {
    setDocumentation((prev) => ({
      ...prev,
      [tpsId]: (prev[tpsId] ?? []).filter((p) => p.id !== photoId),
    }));
  };

  const checkInWitness: AppContextValue['checkInWitness'] = (witnessId, override) => {
    setWitnesses((prev) =>
      prev.map((w) => {
        if (w.id !== witnessId) return w;
        const tpsRecord = tps.find((t) => t.id === w.assignedTpsId);
        return {
          ...w,
          status: 'checked_in',
          checkInTime: new Date().toTimeString().slice(0, 5),
          checkInLocation:
            override?.locationLabel ??
            (tpsRecord ? `Dekat ${tpsRecord.district}, ${tpsRecord.regency}` : 'Lokasi tidak diketahui'),
          checkInLat: override?.lat ?? tpsRecord?.lat ?? null,
          checkInLng: override?.lng ?? tpsRecord?.lng ?? null,
          distanceMeters: override?.distanceMeters ?? null,
          overrideNote: override?.overrideNote ?? null,
          insideGeofence: override?.insideGeofence ?? true,
        };
      }),
    );

    // Update corresponding task if applicable
    setTasks((prev) =>
      prev.map((t) =>
        t.id === 'TSK-01' ? { ...t, status: 'completed', timeLabel: 'Selesai Checked-in' } : t,
      ),
    );

    // Persist to offline queue
    addToOfflineQueue('check_in', { witnessId, override, timestamp: new Date().toISOString() })
      .then(() => getUnsyncedQueueCount().then(setUnsyncedQueueCount))
      .catch((err: any) => console.warn('[AppContext] Failed to queue check-in:', err));
  };

  const checkInEvent = (eventId: string, details?: any) => {
    const targetEvent = events.find((e) => e.id === eventId);
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, attended: true, isRegistered: true } : e,
      ),
    );

    // Update volunteer stats
    setCurrentUser((prev) => ({
      ...prev,
      volunteerStats: prev.volunteerStats
        ? {
            ...prev.volunteerStats,
            eventsAttended: prev.volunteerStats.eventsAttended + 1,
            activitiesCount: prev.volunteerStats.activitiesCount + 1,
          }
        : undefined,
    }));

    // Generate confirmation notification
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      type: 'reminder',
      title: 'Presensi Kegiatan Berhasil Diterima',
      body: `Presensi GPS & Swafoto Anda pada "${targetEvent?.title || 'Kegiatan Partai'}" telah diverifikasi oleh Panitia Pelaksana.`,
      sentAt: 'Baru saja',
      sentBy: 'Sekretariat Panitia DPD PAN',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Persist to offline queue
    addToOfflineQueue('check_in', { eventId, details, timestamp: new Date().toISOString() })
      .then(() => getUnsyncedQueueCount().then(setUnsyncedQueueCount))
      .catch((err: any) => console.warn('[AppContext] Failed to queue event check-in:', err));
  };

  const checkInPosko = (poskoName: string, details?: any) => {
    const time = new Date().toTimeString().slice(0, 5);
    setPoskoCheckIn({
      checkedIn: true,
      time,
      poskoName,
    });

    // Update volunteer stats
    setCurrentUser((prev) => ({
      ...prev,
      volunteerStats: prev.volunteerStats
        ? {
            ...prev.volunteerStats,
            activitiesCount: prev.volunteerStats.activitiesCount + 1,
          }
        : undefined,
    }));

    // Generate confirmation notification
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      type: 'reminder',
      title: 'Presensi Posko Relawan Diterima',
      body: `Presensi kehadiran Anda di "${poskoName}" telah diverifikasi oleh Koordinator Lapangan.`,
      sentAt: 'Baru saja',
      sentBy: 'Koordinator Lapangan',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Persist to offline queue
    addToOfflineQueue('check_in', { posko: poskoName, details, timestamp: new Date().toISOString() })
      .then(() => getUnsyncedQueueCount().then(setUnsyncedQueueCount))
      .catch((err: any) => console.warn('[AppContext] Failed to queue posko check-in:', err));
  };

  const submitTpsReport: AppContextValue['submitTpsReport'] = (tpsId, payload) => {
    setTps((prev) =>
      prev.map((t) =>
        t.id === tpsId
          ? { ...t, votersPresent: payload.votersPresent, votes: payload.votes, status: payload.status }
          : t,
      ),
    );

    // Update corresponding task if applicable
    setTasks((prev) =>
      prev.map((t) =>
        t.id === 'TSK-04' ? { ...t, status: 'completed', timeLabel: 'Laporan C1 Terkirim' } : t,
      ),
    );

    // Persist to offline queue
    addToOfflineQueue('c1_report', { tpsId, payload, timestamp: new Date().toISOString() })
      .then(() => getUnsyncedQueueCount().then(setUnsyncedQueueCount))
      .catch((err: any) => console.warn('[AppContext] Failed to queue c1 report:', err));
  };

  const addEmergencyReport: AppContextValue['addEmergencyReport'] = (report) => {
    const id = `EMG-${String(emergencyReports.length + 1).padStart(3, '0')}`;
    const newReport: EmergencyReport = {
      ...report,
      id,
      status: 'open',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setEmergencyReports((prev) => [newReport, ...prev]);

    // Persist to offline queue
    addToOfflineQueue('emergency_report', { ...newReport, timestamp: new Date().toISOString() })
      .then(() => getUnsyncedQueueCount().then(setUnsyncedQueueCount))
      .catch((err: any) => console.warn('[AppContext] Failed to queue emergency report:', err));
  };

  const addBroadcast: AppContextValue['addBroadcast'] = (broadcast) => {
    const id = `BC-${String(broadcasts.length + 1).padStart(3, '0')}`;
    setBroadcasts((prev) => [
      { ...broadcast, id, sentAt: new Date().toISOString().slice(0, 16).replace('T', ' ') },
      ...prev,
    ]);
  };

  const markPaymentPaid = (witnessId: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.witnessId === witnessId ? { ...p, status: 'paid', proofRef: `PROOF-${witnessId}` } : p)),
    );
  };

  const flushQueueNow = async () => {
    const syncedCount = await syncOfflineQueue();
    const remaining = await getUnsyncedQueueCount();
    setUnsyncedQueueCount(remaining);
    return syncedCount;
  };

  const login = (nextRole: Role, email?: string) => {
    const user = getUserContext(nextRole, email);
    setCurrentUser(user);
    setRole(nextRole);
    setLoggedIn(true);
  };
  const logout = () => setLoggedIn(false);

  const value = useMemo(
    () => ({
      role,
      setRole,
      currentUser,
      availableRoles: AVAILABLE_MOBILE_ROLES,
      switchActiveRole,
      switchOperationalRoleWithGuard,
      applyCareerStatePreset,
      applyVolunteerStatePreset,
      requestMembershipResignation,
      cancelMembershipResignation,
      setVolunteerPause,
      stopVolunteer,
      completeAcademyModule,
      hasPermission,
      loggedIn,
      login,
      logout,
      tps,
      witnesses,
      coordinators,
      emergencyReports,
      broadcasts,
      payments,
      documentation,
      getDocumentation,
      addDocumentationPhoto,
      removeDocumentationPhoto,
      checkInWitness,
      submitTpsReport,
      addEmergencyReport,
      addBroadcast,
      markPaymentPaid,
      isOnline,
      unsyncedQueueCount,
      flushQueueNow,
      events,
      rsvpEvent,
      tasks,
      toggleTaskCompleted,
      notifications,
      markNotificationRead,
      volunteerOpportunities,
      joinOpportunity,
      applyWitnessCandidate,
      upgradeToMember,
      checkInEvent,
      poskoCheckIn,
      checkInPosko,
    }),
    [
      role,
      currentUser,
      loggedIn,
      tps,
      witnesses,
      coordinators,
      emergencyReports,
      broadcasts,
      payments,
      documentation,
      isOnline,
      unsyncedQueueCount,
      events,
      tasks,
      notifications,
      volunteerOpportunities,
      poskoCheckIn,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
