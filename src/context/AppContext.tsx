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
import {
  Broadcast,
  Coordinator,
  EmergencyReport,
  Payment,
  Role,
  Tps,
  TpsDocPhoto,
  TpsStatus,
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

const SEED_DOCUMENTATION: Record<string, TpsDocPhoto[]> = {
  'TPS-001': [
    { id: 'seed-1', source: IMAGES.tpsSchool, takenAt: '07:30 WIB — Lokasi TPS' },
    { id: 'seed-2', source: IMAGES.ballotPaper, takenAt: '08:15 WIB — Papan Hitung' },
    { id: 'seed-3', source: IMAGES.c1Form, takenAt: '13:45 WIB — C1 Plano' },
  ],
};

interface AppContextValue {
  role: Role;
  setRole: (role: Role) => void;
  loggedIn: boolean;
  login: (role: Role) => void;
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
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('DPP');
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

  // Monitor network connectivity & auto-flush offline transactions
  useEffect(() => {
    checkNetworkIsOnline().then(setIsOnline);
    getUnsyncedQueueCount().then(setUnsyncedQueueCount);

    const unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
    });

    const unsubscribeAutoFlush = initNetInfoAutoFlush((syncedCount) => {
      if (syncedCount > 0) {
        getUnsyncedQueueCount().then(setUnsyncedQueueCount);
      }
    });

    return () => {
      unsubscribeNetInfo();
      unsubscribeAutoFlush();
    };
  }, []);

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

    // Persist to offline queue
    addToOfflineQueue('check_in', { witnessId, override, timestamp: new Date().toISOString() })
      .then(() => getUnsyncedQueueCount().then(setUnsyncedQueueCount))
      .catch((err) => console.warn('[AppContext] Failed to queue check-in:', err));
  };

  const submitTpsReport: AppContextValue['submitTpsReport'] = (tpsId, payload) => {
    setTps((prev) =>
      prev.map((t) =>
        t.id === tpsId
          ? { ...t, votersPresent: payload.votersPresent, votes: payload.votes, status: payload.status }
          : t,
      ),
    );

    // Persist to offline queue
    addToOfflineQueue('c1_report', { tpsId, payload, timestamp: new Date().toISOString() })
      .then(() => getUnsyncedQueueCount().then(setUnsyncedQueueCount))
      .catch((err) => console.warn('[AppContext] Failed to queue c1 report:', err));
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
      .catch((err) => console.warn('[AppContext] Failed to queue emergency report:', err));
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

  const login = (nextRole: Role) => {
    setRole(nextRole);
    setLoggedIn(true);
  };
  const logout = () => setLoggedIn(false);

  const value = useMemo(
    () => ({
      role,
      setRole,
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
    }),
    [
      role,
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
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
