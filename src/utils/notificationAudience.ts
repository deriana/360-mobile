import { NotificationItem } from '../types';

/**
 * Notifikasi contoh berisi penugasan/pengingat saksi. Pengguna yang tidak sedang
 * bertugas sebagai saksi tidak boleh melihatnya (isinya menyebut TPS & surat mandat).
 */
export function filterNotificationsForUser(items: NotificationItem[], isWitnessOnDuty: boolean) {
  return items.filter((item) => item.audience !== 'witness_on_duty' || isWitnessOnDuty);
}
