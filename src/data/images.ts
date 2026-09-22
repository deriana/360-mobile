// Brand assets, real Indonesian election documentation photos, and stock
// portraits (Southeast Asian subjects) — all bundled locally, no external
// network calls needed at runtime.

export const BRAND_ASSETS = {
  emblem: require('../../assets/brand/pan_emblem.png'),
  fullLogo: require('../../assets/brand/pan_full_logo.png'),
  logoText: require('../../assets/brand/pan_text.png'),
  sunWhite: require('../../assets/brand/pan_sun_white.png'),
  official: require('../../assets/brand/pan_logo_official.png'),
};

export const LEADER_AVATARS = {
  ketuaUmum: require('../../assets/avatars/ketua-umum.webp'),
  ketuaDpp: require('../../assets/avatars/ketua-dpp.webp'),
  wakilKetuaUmum: require('../../assets/avatars/wakil-ketua-umum.webp'),
  sekretarisJendral: require('../../assets/avatars/sekretaris-jendral.webp'),
  bendaharaUmum: require('../../assets/avatars/bendahara-umum.webp'),
};


export const TPS_LOCAL_IMAGES = [
  require('../../assets/tps/tps_petanggan.jpg'),
  require('../../assets/tps/kpu_petugas.jpg'),
  require('../../assets/tps/pengamanan_tps.jpg'),
  require('../../assets/tps/bawaslu_tps.jpg'),
];

export const IMAGES = {
  // Brand Logo Assets
  emblem: BRAND_ASSETS.emblem,
  fullLogo: BRAND_ASSETS.fullLogo,
  logoText: BRAND_ASSETS.logoText,

  // TPS Venues & Real Election Documentation Photos
  tpsHero: require('../../assets/tps/pengamanan_tps.jpg'),
  tpsSchool: require('../../assets/documents/pemilih_tps.jpg'),
  tpsCommunity: require('../../assets/tps/tps_petanggan.jpg'),
  tpsOutdoor: require('../../assets/tps/pengamanan_tps.jpg'),

  // Documents & C1 Forms
  c1Form: require('../../assets/tps/kpu_petugas.jpg'),
  ballotPaper: require('../../assets/documents/bukti_pencoblosan.jpg'),
  idCard: require('../../assets/tps/bawaslu_tps.jpg'),

  // Witness Avatars (Southeast Asian portraits)
  witnesses: [
    require('../../assets/avatars/witness_1.jpg'),
    require('../../assets/avatars/witness_2.jpg'),
    require('../../assets/avatars/witness_3.jpg'),
    require('../../assets/avatars/witness_4.jpg'),
    require('../../assets/avatars/witness_5.jpg'),
    require('../../assets/avatars/witness_6.jpg'),
  ],

  // Map Location previews
  mapPreview: require('../../assets/tps/tps_petanggan.jpg'),
};

export function getWitnessAvatar(index: number): any {
  return IMAGES.witnesses[index % IMAGES.witnesses.length];
}

export function getTpsPhoto(index: number): any {
  return TPS_LOCAL_IMAGES[index % TPS_LOCAL_IMAGES.length];
}

// Stable avatar tied to an identity string (e.g. a member id), independent of
// its position in whatever filtered/sorted list is currently rendering it —
// so the same person always gets the same photo everywhere.
export function getStableAvatar(id: string): any {
  const hash = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return IMAGES.witnesses[hash % IMAGES.witnesses.length];
}

// Real, verified official/electoral portraits (Wikimedia Commons).
export const PASLON_AVATARS: Record<string, any> = {
  "Paslon 01 — Anies & Muhaimin": require('../../assets/avatars/paslon01_a.jpg'),
  "Paslon 02 — Prabowo & Gibran": require('../../assets/avatars/paslon02_a.jpg'),
  "Paslon 03 — Ganjar & Mahfud": require('../../assets/avatars/paslon03_a.png'),
};

export const PASLON_RUNNING_MATE_AVATARS: Record<string, any> = {
  "Paslon 01 — Anies & Muhaimin": require('../../assets/avatars/paslon01_b.jpg'),
  "Paslon 02 — Prabowo & Gibran": require('../../assets/avatars/paslon02_b.jpg'),
  "Paslon 03 — Ganjar & Mahfud": require('../../assets/avatars/paslon03_b.jpg'),
};

export const CALEG_AVATARS: Record<string, any> = {
  "Kartika Wulandari Praditya (Partai Karya Mandiri)": require('../../assets/avatars/caleg_kartika.jpg'),
  "Farida Ramadhani Azzahra (Partai Amanah Bangsa)": require('../../assets/avatars/caleg_farida.jpg'),
  "Bima Aditya Nugraha (Partai Perjuangan Nusantara)": require('../../assets/avatars/caleg_bima.jpg'),
  "Rizky Firmansyah Malik (Partai Nusantara Bersatu)": require('../../assets/avatars/caleg_rizky.jpg'),
  "Ningsih Purnama Sari (Partai Demokrasi Sejahtera)": require('../../assets/avatars/caleg_ningsih.jpg'),
  "Solihin Maulana Ibrahim (Partai Kebangkitan Rakyat)": require('../../assets/avatars/caleg_solihin.jpg'),
};

export function getCandidateAvatar(name: string): any {
  if (PASLON_AVATARS[name]) return PASLON_AVATARS[name];
  if (CALEG_AVATARS[name]) return CALEG_AVATARS[name];
  // Check exact or partial match for Paslon
  for (const [key, uri] of Object.entries(PASLON_AVATARS)) {
    if (name.includes(key) || key.includes(name)) return uri;
  }
  // Check exact or partial match for Caleg
  for (const [key, uri] of Object.entries(CALEG_AVATARS)) {
    if (name.includes(key) || key.includes(name)) return uri;
  }
  // Deterministic fallback avatar based on name hash
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return IMAGES.witnesses[hash % IMAGES.witnesses.length];
}
