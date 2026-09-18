/**
 * Utilitas penyamaran data pribadi (Privacy by Design) sesuai UU PDP No. 27 Tahun 2022
 * dan Bab 24 AGENTS.md (Prinsip Least Privilege & Minimisasi Data).
 */

export function maskNik(nik?: string | null): string {
  if (!nik) return '-';
  const clean = nik.replace(/\s+/g, '');
  if (clean.length < 10) return clean;
  // Format: 6 digit pertama (kode wilayah), 6 bintang, 4 digit terakhir
  const prefix = clean.slice(0, 6);
  const suffix = clean.slice(-4);
  return `${prefix}******${suffix}`;
}

export function maskPhone(phone?: string | null): string {
  if (!phone) return '-';
  const clean = phone.replace(/[^0-9+]/g, '');
  if (clean.length < 8) return phone;
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-4);
  return `${prefix}-****-${suffix}`;
}

export function maskAccountNumber(acc?: string | null): string {
  if (!acc) return '-';
  const clean = acc.replace(/[^0-9]/g, '');
  if (clean.length < 6) return acc;
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-4);
  return `${prefix}-****-${suffix}`;
}

