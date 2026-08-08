import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  tpsList as initialTps,
  witnesses as initialWitnesses,
  emergencyReports as initialEmergencyReports,
  broadcasts as initialBroadcasts,
  payments as initialPayments,
} from '../data';
import {
  Broadcast,
  EmergencyReport,
  Payment,
  Role,
  Tps,
  TpsStatus,
  VoteCounts,
  Witness,
} from '../types';

interface AppContextValue {
  role: Role;
  setRole: (role: Role) => void;
  loggedIn: boolean;
  login: (role: Role) => void;
  logout: () => void;
  tps: Tps[];
  witnesses: Witness[];
  emergencyReports: EmergencyReport[];
  broadcasts: Broadcast[];
  payments: Payment[];
  checkInWitness: (witnessId: string, override?: { lat: number; lng: number; locationLabel?: string }) => void;
  submitTpsReport: (
    tpsId: string,
    payload: { votersPresent: number; votes: VoteCounts; status: TpsStatus },
  ) => void;
  addEmergencyReport: (report: Omit<EmergencyReport, 'id' | 'createdAt' | 'status'>) => void;
  addBroadcast: (broadcast: Omit<Broadcast, 'id' | 'sentAt'>) => void;
  markPaymentPaid: (witnessId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('DPP');
  const [loggedIn, setLoggedIn] = useState(false);
  const [tps, setTps] = useState<Tps[]>(initialTps);
  const [witnesses, setWitnesses] = useState<Witness[]>(initialWitnesses);
  const [emergencyReports, setEmergencyReports] = useState<EmergencyReport[]>(initialEmergencyReports);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(initialBroadcasts);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);

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
        };
      }),
    );
  };

  const submitTpsReport: AppContextValue['submitTpsReport'] = (tpsId, payload) => {
    setTps((prev) =>
      prev.map((t) =>
        t.id === tpsId
          ? { ...t, votersPresent: payload.votersPresent, votes: payload.votes, status: payload.status }
          : t,
      ),
    );
  };

  const addEmergencyReport: AppContextValue['addEmergencyReport'] = (report) => {
    const id = `EMG-${String(emergencyReports.length + 1).padStart(3, '0')}`;
    setEmergencyReports((prev) => [
      { ...report, id, status: 'open', createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ') },
      ...prev,
    ]);
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
      emergencyReports,
      broadcasts,
      payments,
      checkInWitness,
      submitTpsReport,
      addEmergencyReport,
      addBroadcast,
      markPaymentPaid,
    }),
    [role, loggedIn, tps, witnesses, emergencyReports, broadcasts, payments],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
