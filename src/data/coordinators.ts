import { Coordinator, WitnessStatus } from '../types';
import { randInt, pick } from './seed';

const STATUS_WEIGHTS: WitnessStatus[] = [
  'checked_in', 'checked_in', 'checked_in', 'checked_in', 'checked_in', 'checked_in',
  'assigned', 'assigned',
  'absent',
];

// One coordinator per Kecamatan cluster in Kota Bandung — matches the district
// order tps.ts uses to assign coordinatorId (COORD-1..COORD-7).
const COORDINATOR_SEED: Array<{ id: string; name: string; nik: string; phone: string; district: string; avatarIndex: number }> = [
  { id: 'COORD-1', name: 'Asep Ridwan', nik: '3273011503850002', phone: '0811-2233-4455', district: 'Coblong', avatarIndex: 3 },
  { id: 'COORD-2', name: 'Dedi Kurniawan', nik: '3273012207830011', phone: '0812-5566-7788', district: 'Sukajadi', avatarIndex: 0 },
  { id: 'COORD-3', name: 'Yani Setiawan', nik: '3273014412790022', phone: '0813-4477-8899', district: 'Cicendo', avatarIndex: 1 },
  { id: 'COORD-4', name: 'Ujang Firmansyah', nik: '3273010109810033', phone: '0812-9988-1122', district: 'Lengkong', avatarIndex: 2 },
  { id: 'COORD-5', name: 'Nurhayati Suherman', nik: '3273015511860044', phone: '0813-2233-6677', district: 'Sumur Bandung', avatarIndex: 4 },
  { id: 'COORD-6', name: 'Iwan Gunawan', nik: '3273013308840055', phone: '0812-4455-9900', district: 'Cibeunying Kaler', avatarIndex: 5 },
  { id: 'COORD-7', name: 'Herman Sudrajat', nik: '3273012209820066', phone: '0813-7788-2233', district: 'Batu Nunggal', avatarIndex: 0 },
];

export const coordinators: Coordinator[] = COORDINATOR_SEED.map((c) => {
  const status = pick(STATUS_WEIGHTS);
  const checkedIn = status === 'checked_in';
  return {
    id: c.id,
    name: c.name,
    nik: c.nik,
    phone: c.phone,
    address: `Jl. Kecamatan ${c.district} No. ${randInt(1, 40)}, Kec. ${c.district}, Kota Bandung`,
    regency: 'Kota Bandung',
    district: c.district,
    avatarIndex: c.avatarIndex,
    status,
    checkInTime: checkedIn ? '06:55' : null,
    checkInLocation: checkedIn ? `Sekretariat Kecamatan ${c.district}, Kota Bandung` : null,
  };
});
