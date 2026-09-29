import { useApp } from '../../../../context/AppContext';
import { simulateKtpVerification } from '../../application/simulateKtpVerification';
import { accountDependencies } from '../../dependencies';
import { useAccountSnapshot } from './useAccountSnapshot';

/** Aksi seputar verifikasi relawan. Saat ini hanya simulasi demo; hasilnya dicatat sebagai notifikasi. */
export function useVolunteerVerification() {
  const { pushNotification } = useApp();
  const account = useAccountSnapshot();

  return {
    simulateKtpVerification: () => {
      const result = simulateKtpVerification(accountDependencies.volunteerActivityRepository, { userId: account.userId });
      if (result.ok) pushNotification({ ...result.value, sentBy: 'Tim Verifikasi Pusat' });
      return result;
    },
  };
}
