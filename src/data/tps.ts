import { Tps, TpsStatus, VoteCounts } from '../types';
import { regions, districtsFor, partyNames, candidateNames, dprCandidates } from './regions';
import { rand, randInt, pick } from './seed';

const STATUS_WEIGHTS: TpsStatus[] = [
  'not_reported', 'not_reported',
  'in_progress', 'in_progress',
  'done', 'done', 'done', 'done', 'done',
  'problem',
];

function emptyVotes(): VoteCounts {
  return {
    partyVotes: Object.fromEntries(partyNames.map((p) => [p, 0])),
    candidateVotes: Object.fromEntries(candidateNames.map((c) => [c, 0])),
    dprCandidateVotes: Object.fromEntries(dprCandidates.map((c) => [c, 0])),
    invalidVotes: 0,
  };
}

function reportedVotes(dpt: number, votersPresent: number): VoteCounts {
  const invalidVotes = randInt(1, Math.max(2, Math.floor(votersPresent * 0.03)));
  const remaining = votersPresent - invalidVotes;
  const partyVotes: Record<string, number> = {};
  const candidateVotes: Record<string, number> = {};
  const dprCandidateVotes: Record<string, number> = {};

  let leftP = remaining;
  partyNames.forEach((p, i) => {
    const isLast = i === partyNames.length - 1;
    const v = isLast ? leftP : randInt(0, Math.floor(leftP * 0.6));
    partyVotes[p] = v;
    leftP -= v;
  });

  let leftC = remaining;
  candidateNames.forEach((c, i) => {
    const isLast = i === candidateNames.length - 1;
    const v = isLast ? leftC : randInt(0, Math.floor(leftC * 0.6));
    candidateVotes[c] = v;
    leftC -= v;
  });

  let leftDpr = remaining;
  dprCandidates.forEach((c, i) => {
    const isLast = i === dprCandidates.length - 1;
    const v = isLast ? leftDpr : randInt(0, Math.floor(leftDpr * 0.4));
    dprCandidateVotes[c] = v;
    leftDpr -= v;
  });

  return { partyVotes, candidateVotes, dprCandidateVotes, invalidVotes };
}

const baseCoords: Record<string, [number, number]> = {
  'Aceh': [5.55, 95.32],
  'Sumatera Utara': [3.59, 98.67],
  'Sumatera Barat': [-0.95, 100.35],
  'Riau': [0.51, 101.44],
  'Kepulauan Riau': [1.08, 104.03],
  'Jambi': [-1.61, 103.61],
  'Sumatera Selatan': [-2.99, 104.75],
  'Bangka Belitung': [-2.13, 106.11],
  'Bengkulu': [-3.8, 102.26],
  'Lampung': [-5.43, 105.26],

  'Banten': [-6.12, 106.15],
  'DKI Jakarta': [-6.2, 106.84],
  'Jawa Barat': [-6.9, 107.6],
  'Jawa Tengah': [-6.97, 110.42],
  'D.I. Yogyakarta': [-7.79, 110.36],
  'Jawa Timur': [-7.25, 112.75],

  'Bali': [-8.65, 115.21],
  'Nusa Tenggara Barat': [-8.58, 116.12],
  'Nusa Tenggara Timur': [-10.17, 123.58],

  'Kalimantan Barat': [-0.02, 109.34],
  'Kalimantan Tengah': [-2.21, 113.92],
  'Kalimantan Selatan': [-3.32, 114.59],
  'Kalimantan Timur': [-0.5, 117.15],
  'Kalimantan Utara': [3.33, 117.58],

  'Sulawesi Utara': [1.47, 124.84],
  'Gorontalo': [0.54, 123.06],
  'Sulawesi Tengah': [-0.9, 119.87],
  'Sulawesi Barat': [-2.67, 118.88],
  'Sulawesi Selatan': [-5.14, 119.42],
  'Sulawesi Tenggara': [-3.97, 122.51],

  'Maluku': [-3.7, 128.18],
  'Maluku Utara': [0.78, 127.38],
  'Papua': [-2.53, 140.71],
  'Papua Barat': [-0.86, 134.06],
  'Papua Selatan': [-8.49, 140.4],
  'Papua Tengah': [-3.36, 135.5],
  'Papua Pegunungan': [-4.08, 138.94],
  'Papua Barat Daya': [-0.88, 131.25],
};

const BANDUNG_DISTRICT_COORDINATORS = ['Coblong', 'Sukajadi', 'Cicendo', 'Lengkong', 'Sumur Bandung', 'Cibeunying Kaler', 'Batu Nunggal'];

export const tpsList: Tps[] = (() => {
  const list: Tps[] = [];
  let counter = 1;
  regions.forEach((region) => {
    region.regencies.forEach((regency) => {
      districtsFor(regency).forEach((district) => {
        const tpsInDistrict = randInt(1, 2);
        for (let n = 1; n <= tpsInDistrict; n++) {
          const dpt = randInt(180, 320);
          const status = pick(STATUS_WEIGHTS);
          const votersPresent = status === 'not_reported' ? 0 : randInt(Math.floor(dpt * 0.6), Math.floor(dpt * 0.9));
          const [baseLat, baseLng] = baseCoords[region.province] ?? [-6.9, 107.6];
          list.push({
            id: `TPS-${String(counter).padStart(3, '0')}`,
            province: region.province,
            regency,
            district,
            tpsNumber: n,
            dpt,
            status,
            lat: Number((baseLat + (rand() - 0.5) * 0.3).toFixed(5)),
            lng: Number((baseLng + (rand() - 0.5) * 0.3).toFixed(5)),
            votersPresent,
            votes: status === 'done' ? reportedVotes(dpt, votersPresent) : emptyVotes(),
            coordinatorId:
              regency === 'Kota Bandung' && BANDUNG_DISTRICT_COORDINATORS.includes(district)
                ? `COORD-${BANDUNG_DISTRICT_COORDINATORS.indexOf(district) + 1}`
                : `COORD-${((counter - 1) % 6) + 1}`,
          });
          counter += 1;
        }
      });
    });
  });
  return list;
})();

export const STATUS_ORDER: TpsStatus[] = ['not_reported', 'in_progress', 'done', 'problem'];
