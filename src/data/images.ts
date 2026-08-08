// High quality official brand assets and real Indonesian election TPS venue photos.

export const BRAND_ASSETS = {
  emblem: require('../../assets/brand/saksi360_emblem.png'),
  fullLogo: require('../../assets/brand/saksi360_full_logo.png'),
  logoText: require('../../assets/brand/saksi360_text.png'),
};

export const TPS_LOCAL_IMAGES = [
  require('../../assets/tps/tps_pemilu_2024.jpg'),
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

  // TPS Venues & Real Election Photos
  tpsHero: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1000&q=80',
  tpsSchool: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
  tpsCommunity: 'https://images.unsplash.com/photo-1494172961521-33799ddd43a5?auto=format&fit=crop&w=800&q=80',
  tpsOutdoor: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
  
  // Documents & C1 Forms
  c1Form: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
  ballotPaper: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80',
  idCard: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',

  // Witness Avatars
  witnesses: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
  ],

  // Map Location previews
  mapPreview: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
};

export function getWitnessAvatar(index: number): string {
  return IMAGES.witnesses[index % IMAGES.witnesses.length];
}

export function getTpsPhoto(index: number): any {
  return TPS_LOCAL_IMAGES[index % TPS_LOCAL_IMAGES.length];
}

export const PASLON_AVATARS: Record<string, string> = {
  "Paslon 01 — Anies & Muhaimin": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
  "Paslon 02 — Prabowo & Gibran": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
  "Paslon 03 — Ganjar & Mahfud": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
};

export const CALEG_AVATARS: Record<string, string> = {
  "Atalia Praratya (Partai Golkar)": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
  "H. Ledia Hanifa Amaliah (PKS)": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
  "Junico BP Siahaan / Nico Siahaan (PDI Perjuangan)": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  "H. Muhammad Farhan (Partai NasDem)": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
  "Dr. H. Melani Leimena Suharli (Partai Demokrat)": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80",
  "H. Syaiful Huda (PKB)": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
};

export function getCandidateAvatar(name: string): string {
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
