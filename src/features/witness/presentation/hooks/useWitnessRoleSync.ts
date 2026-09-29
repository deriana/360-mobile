import { useEffect } from 'react';
import { useApp } from '../../../../context/AppContext';
import { useWitnessApplication } from './useWitnessApplication';

/**
 * Jembatan ke kode lama: layar seperti `CheckInScreen`, `TasksScreen`, `ActivitiesScreen`
 * masih membaca role WITNESS dari `currentUser.roles`. Hook ini menjaga role itu selalu
 * sesuai status penugasan saksi (ada saat ASSIGNED, hilang saat dicabut/belum ditugaskan).
 * Cukup dipanggil sekali di navigator utama.
 */
export function useWitnessRoleSync() {
  const { syncWitnessAssignment } = useApp();
  const { access, application } = useWitnessApplication();
  const tpsId = access.isUnlocked ? application?.assignedTpsId : undefined;
  const tpsLabel = application?.assignedTpsLabel ?? '';

  useEffect(() => {
    syncWitnessAssignment(tpsId ? { tpsId, tpsLabel } : null);
    // Sengaja hanya bergantung pada data penugasan; syncWitnessAssignment idempoten.
  }, [tpsId, tpsLabel]);
}
