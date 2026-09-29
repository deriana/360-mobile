import { CurrentUser, Tps, Witness } from '../types';
import { CURRENT_WITNESS_ID } from './scope';

export interface ActiveWitnessScope {
  witnessId: string;
  witnessName: string;
  witnessNik: string;
  witnessPhone: string;
  assignedTpsId: string;
  assignedTpsLabel: string;
  skMandatNumber: string;
  scopeLocation: string;
  tps: Tps;
  witness: Witness;
  isSitiR2: boolean;
}

/** Penugasan resmi dari fitur `witness` (dikirim oleh hook `useActiveWitnessScope`). */
export interface WitnessAssignmentInput {
  tpsId: string;
  tpsLabel?: string;
  mandateNumber?: string;
  location?: {
    tpsNumber: number;
    village: string;
    district: string;
    regency: string;
    province: string;
    lat: number;
    lng: number;
  };
}

export function getActiveWitnessScope(
  currentUser: CurrentUser | null | undefined,
  witnesses: Witness[] = [],
  tpsList: Tps[] = [],
  assignment?: WitnessAssignmentInput,
): ActiveWitnessScope {
  // Mode 2 role: TPS & saksi diambil dari penugasan resmi, bukan persona demo di bawah.
  if (assignment) {
    return resolveFromAssignment(currentUser, witnesses, tpsList, assignment);
  }

  const isSiti =
    currentUser?.identity?.email === 'siti.rahmawati@relawanpan.id' ||
    currentUser?.identity?.name?.toLowerCase().includes('siti');
  const hasWitnessRole = currentUser?.roles?.some((r) => r.role === 'WITNESS');
  const isWitnessDim =
    currentUser?.dimensions?.operationalRole === 'WITNESS' ||
    currentUser?.currentRole === 'WITNESS' ||
    currentUser?.dimensions?.programs?.programSaksi === 'MANDATED';

  if (isSiti) {
    // Siti Rahmawati selalu terasosiasi dengan TPS 018 Kel. Braga, Kec. Sumur Bandung
    let assignedTps = tpsList.find((t) => t.id === 'TPS-018');
    if (!assignedTps) {
      const sumurBandungTps = tpsList.find((t) => t.district === 'Sumur Bandung');
      if (sumurBandungTps) {
        assignedTps = {
          ...sumurBandungTps,
          id: 'TPS-018',
          province: 'Jawa Barat',
          regency: 'Kota Bandung',
          district: 'Sumur Bandung',
          village: 'Braga',
          tpsNumber: 18,
          dpt: 268,
          lat: -6.9175,
          lng: 107.6098,
        };
      } else {
        assignedTps = {
          id: 'TPS-018',
          province: 'Jawa Barat',
          regency: 'Kota Bandung',
          district: 'Sumur Bandung',
          village: 'Braga',
          tpsNumber: 18,
          dpt: 268,
          status: 'in_progress',
          lat: -6.9175,
          lng: 107.6098,
          votersPresent: 184,
          votes: {
            partyVotes: { 'PAN': 72, 'Partai Golkar': 34, 'PDI Perjuangan': 28, 'Gerindra': 38 },
            candidateVotes: {
              'Paslon 01 — Anies & Muhaimin': 64,
              'Paslon 02 — Prabowo & Gibran': 92,
              'Paslon 03 — Ganjar & Mahfud': 25,
            },
            dprCandidateVotes: {
              'Dr. H. Ahmad Fauzi, M.Si. (No. 1)': 58,
            },
            invalidVotes: 3,
          },
          coordinatorId: 'COORD-5',
        };
      }
    }

    const existingWitness = witnesses.find((w) => w.id === 'SAKSI-SITI-018');

    const witnessItem: Witness = existingWitness || {
      id: 'SAKSI-SITI-018',
      name: currentUser?.identity?.name || 'Siti Rahmawati',
      nik: currentUser?.identity?.nikFull || '3273015506990042',
      phone: currentUser?.identity?.phone || '0821-4455-6677',
      address: 'Jl. Braga No. 12, Kel. Braga, Kec. Sumur Bandung, Kota Bandung',
      assignedTpsId: 'TPS-018',
      status: isWitnessDim || hasWitnessRole ? 'assigned' : 'assigned',
      checkInTime: null,
      checkInLocation: null,
      checkInLat: null,
      checkInLng: null,
    };

    return {
      witnessId: 'SAKSI-SITI-018',
      witnessName: currentUser?.identity?.name || 'Siti Rahmawati',
      witnessNik: currentUser?.identity?.nikFull || '3273015506990042',
      witnessPhone: currentUser?.identity?.phone || '0821-4455-6677',
      assignedTpsId: 'TPS-018',
      assignedTpsLabel: 'TPS 018 Kel. Braga',
      skMandatNumber: currentUser?.dimensions?.programs?.skMandatNumber || 'BSN/DPD-BDG/2024/018',
      scopeLocation: 'TPS 018 Kel. Braga, Kec. Sumur Bandung, Kota Bandung',
      tps: assignedTps,
      witness: witnessItem,
      isSitiR2: Boolean(hasWitnessRole || isWitnessDim),
    };
  }

  // Fallback default untuk saksi umum (Rudi Saputra / TPS-001 Kota Bandung)
  const defaultWitness =
    witnesses.find((w) => w.id === CURRENT_WITNESS_ID) ||
    witnesses.find((w) => w.address?.includes('Bandung')) ||
    witnesses[0];

  const bandungTps =
    tpsList.find((t) => t.id === defaultWitness?.assignedTpsId && t.regency === 'Kota Bandung') ||
    tpsList.find((t) => t.regency === 'Kota Bandung' && t.district === 'Coblong') ||
    tpsList.find((t) => t.regency === 'Kota Bandung') ||
    tpsList[0];

  const fallbackTpsData: Tps = {
    id: defaultWitness?.assignedTpsId || 'TPS-001',
    province: 'Jawa Barat',
    regency: 'Kota Bandung',
    district: 'Coblong',
    village: 'Dago',
    tpsNumber: 1,
    dpt: 268,
    status: 'in_progress',
    lat: -6.8833,
    lng: 107.6167,
    votersPresent: 184,
    votes: {
      partyVotes: { 'PAN': 72, 'Partai Golkar': 34, 'PDI Perjuangan': 28, 'Gerindra': 38 },
      candidateVotes: {
        'Paslon 01 — Anies & Muhaimin': 64,
        'Paslon 02 — Prabowo & Gibran': 92,
        'Paslon 03 — Ganjar & Mahfud': 25,
      },
      dprCandidateVotes: {
        'Dr. H. Ahmad Fauzi, M.Si. (No. 1)': 58,
      },
      invalidVotes: 3,
    },
    coordinatorId: 'COORD-1',
  };

  const defaultTps: Tps = bandungTps ? { ...fallbackTpsData, ...bandungTps } : fallbackTpsData;

  const resolvedDefaultWitness: Witness = defaultWitness
    ? {
        ...defaultWitness,
        address: defaultWitness.address?.includes('Simeulue')
          ? 'Jl. Dago Asri No. 14, Kel. Dago, Kec. Coblong, Kota Bandung'
          : defaultWitness.address,
      }
    : {
        id: 'SAKSI-001',
        name: 'Rudi Saputra',
        nik: '3273011204920001',
        phone: '0812-3456-7890',
        address: 'Jl. Dago Asri No. 14, Kel. Dago, Kec. Coblong, Kota Bandung',
        assignedTpsId: defaultTps.id,
        status: 'assigned',
        checkInTime: null,
        checkInLocation: null,
        checkInLat: null,
        checkInLng: null,
      };

  return {
    witnessId: resolvedDefaultWitness.id || 'SAKSI-001',
    witnessName: resolvedDefaultWitness.name || 'Rudi Saputra',
    witnessNik: resolvedDefaultWitness.nik || '3273011204920001',
    witnessPhone: resolvedDefaultWitness.phone || '0812-3456-7890',
    assignedTpsId: defaultTps.id || 'TPS-001',
    assignedTpsLabel: `TPS 00${defaultTps.tpsNumber} Kel. ${defaultTps.village || defaultTps.district}`,
    skMandatNumber: '042/SM-DPP/2026',
    scopeLocation: `TPS 00${defaultTps.tpsNumber} Kel. ${defaultTps.village || 'Dago'}, Kec. ${defaultTps.district || 'Coblong'}, Kota Bandung`,
    tps: defaultTps,
    witness: resolvedDefaultWitness,
    isSitiR2: false,
  };
}

function resolveFromAssignment(
  currentUser: CurrentUser | null | undefined,
  witnesses: Witness[],
  tpsList: Tps[],
  assignment: WitnessAssignmentInput,
): ActiveWitnessScope {
  const loc = assignment.location;
  // Record TPS & saksi disalin ke state lama oleh `syncWitnessAssignment`; sebelum itu selesai
  // (render pertama), dibentuk sementara dari data penugasan.
  const tps: Tps = tpsList.find((t) => t.id === assignment.tpsId) ?? {
    id: assignment.tpsId,
    province: loc?.province ?? 'Jawa Barat',
    regency: loc?.regency ?? 'Kota Bandung',
    district: loc?.district ?? '',
    village: loc?.village,
    tpsNumber: loc?.tpsNumber ?? 0,
    dpt: 268,
    status: 'not_reported',
    lat: loc?.lat ?? -6.9147,
    lng: loc?.lng ?? 107.6098,
    votersPresent: 0,
    votes: { partyVotes: {}, candidateVotes: {}, dprCandidateVotes: {}, invalidVotes: 0 },
    coordinatorId: 'COORD-1',
  };

  const witnessId = `SAKSI-${currentUser?.id ?? 'USER'}`;
  const witness: Witness = witnesses.find((w) => w.id === witnessId && w.assignedTpsId === tps.id) ?? {
    id: witnessId,
    name: currentUser?.identity?.name ?? '',
    nik: currentUser?.identity?.nikFull || currentUser?.identity?.nikMasked || '',
    phone: currentUser?.identity?.phone ?? '',
    address: `Kel. ${tps.village ?? tps.district}, Kec. ${tps.district}, ${tps.regency}`,
    assignedTpsId: tps.id,
    status: 'assigned',
    checkInTime: null,
    checkInLocation: null,
    checkInLat: null,
    checkInLng: null,
  };

  const tpsNumberLabel = String(tps.tpsNumber).padStart(3, '0');
  return {
    witnessId: witness.id,
    witnessName: witness.name,
    witnessNik: witness.nik,
    witnessPhone: witness.phone,
    assignedTpsId: tps.id,
    assignedTpsLabel: assignment.tpsLabel ?? `TPS ${tpsNumberLabel} Kel. ${tps.village ?? tps.district}`,
    skMandatNumber: assignment.mandateNumber ?? '-',
    scopeLocation: `TPS ${tpsNumberLabel} Kel. ${tps.village ?? tps.district}, Kec. ${tps.district}, ${tps.regency}`,
    tps,
    witness,
    isSitiR2: false,
  };
}
