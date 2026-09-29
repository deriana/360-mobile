/**
 * Dua role dasar aplikasi: Relawan (simpatisan, tanpa KTA) dan Anggota (resmi, ber-e-KTA).
 * Saksi TPS bukan role — ia kapabilitas tambahan untuk Relawan (lihat fitur `witness`).
 */
export type AccountType = 'RELAWAN' | 'ANGGOTA';

/** Sama dengan `VolunteerMember.statusVerifikasi` di Saksi360-Admin. */
export type VolunteerVerification = 'belum_verifikasi' | 'terverifikasi';

export type VolunteerActivityStatus = 'none' | 'pending' | 'active' | 'paused' | 'inactive';

/** Data minimal pengguna yang dibutuhkan aturan bisnis — bebas dari bentuk `CurrentUser` lama. */
export interface AccountSnapshot {
  userId: string;
  name: string;
  phone: string;
  isOfficialMember: boolean;
  volunteerVerification: VolunteerVerification;
  volunteerStatus: VolunteerActivityStatus;
  /** Punya jabatan struktural partai (pengurus) atau status elektoral (caleg/pejabat terpilih). */
  hasLeadershipRole: boolean;
}

/** Catatan verifikasi relawan yang dikelola Web Command Center. */
export interface VolunteerActivityRecord {
  userId: string;
  volunteerVerification: VolunteerVerification;
}
