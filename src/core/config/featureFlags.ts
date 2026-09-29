/**
 * Saklar fitur lintas aplikasi. Ubah nilainya di sini, jangan di dalam layar.
 *
 * - advancedRoles: tampilkan kembali mode Koordinator/Caleg, preset jenjang karir,
 *   dan menu lanjutan yang disembunyikan untuk penyederhanaan 2 role (Relawan & Anggota).
 * - demoControls: tombol simulasi keputusan Web Command Center (verifikasi, penugasan).
 *   Wajib `false` untuk build produksi.
 * - requireReferral: pendaftaran relawan mandiri wajib memakai kode ajakan.
 *   Masih keputusan terbuka — default `false` (pendaftaran terbuka).
 */
export const FEATURE_FLAGS = {
  advancedRoles: false,
  demoControls: true,
  requireReferral: false,
} as const;

export type FeatureFlags = typeof FEATURE_FLAGS;
