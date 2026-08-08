import { Witness, WitnessStatus } from '../types';
import { tpsList } from './tps';
import { randInt, pick } from './seed';

const FIRST_NAMES = [
  'Rudi', 'Siti', 'Agus', 'Dewi', 'Bambang', 'Sri', 'Hendra', 'Fitri',
  'Joko', 'Wulan', 'Yusuf', 'Rina', 'Dedi', 'Lestari',
];
const LAST_NAMES = [
  'Saputra', 'Wijaya', 'Kusuma', 'Pratama', 'Hidayat', 'Santoso',
  'Wardani', 'Setiawan', 'Nugroho', 'Utami',
];

const STREET_NAMES = [
  'Jl. Ir. H. Juanda', 'Jl. Dipati Ukur', 'Jl. Dago Asri', 'Jl. Ganeca',
  'Jl. Tubagus Ismail', 'Jl. Siliwangi', 'Jl. Ciumbuleuit', 'Jl. Surapati',
];

const STATUS_WEIGHTS: WitnessStatus[] = [
  'checked_in', 'checked_in', 'checked_in', 'checked_in', 'checked_in', 'checked_in',
  'assigned', 'assigned', 'assigned',
  'absent',
];

// Real TPS have witnesses from multiple participating parties/paslon showing
// up (not just 1) — vary the headcount per TPS instead of a flat 1:1.
let globalWitnessCounter = 0;

export const witnesses: Witness[] = tpsList.flatMap((tps, tpsIndex) => {
  const witnessCount = randInt(2, 6);

  return Array.from({ length: witnessCount }, () => {
    const i = globalWitnessCounter;
    globalWitnessCounter += 1;

    const status = pick(STATUS_WEIGHTS);
    const checkedIn = status === 'checked_in';
    const street = STREET_NAMES[i % STREET_NAMES.length];

    return {
      id: `SAKSI-${String(i + 1).padStart(3, '0')}`,
      name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`,
      nik: `32710${100000000 + i * 14389}`,
      phone: `0812-${randInt(1000, 9999)}-${randInt(1000, 9999)}`,
      address: `${street} No. ${randInt(1, 99)}, Kel. ${tps.village || 'Dago'}, ${tps.district}, ${tps.regency}`,
      assignedTpsId: tps.id,
      status,
      checkInTime: checkedIn ? '07:12' : null,
      checkInLocation: checkedIn ? `${street}, ${tps.district}, ${tps.regency}` : null,
      checkInLat: checkedIn ? tps.lat : null,
      checkInLng: checkedIn ? tps.lng : null,
    };
  });
});
