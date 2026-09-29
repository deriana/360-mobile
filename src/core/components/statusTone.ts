/**
 * Nada status seragam di seluruh aplikasi (arahan "simpel tapi informatif"):
 * hijau = selesai, kuning = menunggu, merah = perlu tindakan, abu-abu = terkunci.
 */
export type StatusTone = 'done' | 'waiting' | 'action' | 'locked';

type PillTone = 'success' | 'warning' | 'danger' | 'neutral';

const PILL_TONE: Record<StatusTone, PillTone> = {
  done: 'success',
  waiting: 'warning',
  action: 'danger',
  locked: 'neutral',
};

export function pillToneFor(tone: StatusTone): PillTone {
  return PILL_TONE[tone];
}
