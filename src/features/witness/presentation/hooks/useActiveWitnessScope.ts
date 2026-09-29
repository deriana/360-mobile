import { useMemo } from 'react';
import { useApp } from '../../../../context/AppContext';
import { ActiveWitnessScope, getActiveWitnessScope } from '../../../../utils/witnessResolver';
import { useWitnessApplication } from './useWitnessApplication';

/**
 * TPS & catatan saksi aktif untuk layar lama (Beranda, Presensi, Laporan, Surat Mandat, dll.).
 * Saat penugasan resmi ada (status ASSIGNED), semuanya diambil dari fitur `witness`, sehingga
 * semua layar menunjuk TPS yang sama dengan layar Saksi. Tanpa penugasan, perilaku lama berlaku.
 */
export function useActiveWitnessScope(): ActiveWitnessScope {
  const { currentUser, witnesses, tps } = useApp();
  const { access, application } = useWitnessApplication();

  const assignment =
    access.isUnlocked && application?.assignedTpsId
      ? {
          tpsId: application.assignedTpsId,
          tpsLabel: application.assignedTpsLabel,
          mandateNumber: application.mandateNumber,
          location: application.assignedTpsLocation,
        }
      : undefined;

  return useMemo(
    () => getActiveWitnessScope(currentUser, witnesses, tps, assignment),
    // `assignment` dibentuk ulang tiap render; cukup bergantung pada `application`.
    [currentUser, witnesses, tps, access.isUnlocked, application],
  );
}
