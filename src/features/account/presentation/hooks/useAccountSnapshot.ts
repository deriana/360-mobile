import { useMemo, useSyncExternalStore } from 'react';
import { useApp } from '../../../../context/AppContext';
import { AccountSnapshot, VolunteerActivityStatus } from '../../domain/account';
import { buildAccountSnapshot } from '../../application/buildAccountSnapshot';
import { accountDependencies } from '../../dependencies';

/**
 * Satu-satunya tempat yang mengenal bentuk `CurrentUser` lama. Fitur lain cukup
 * memakai `AccountSnapshot` sehingga tidak ikut berubah bila `AppContext` diubah.
 */
export function useAccountSnapshot(): AccountSnapshot {
  const { currentUser } = useApp();
  const { volunteerActivityRepository: repository } = accountDependencies;
  // Ikut ter-update saat catatan verifikasi berubah (mis. KTP diverifikasi).
  const record = useSyncExternalStore(repository.subscribe, () => repository.getRecord(currentUser.id));

  return useMemo(() => {
    const volunteerMembership = currentUser.memberships.find((m) => m.type === 'volunteer');
    const isOfficialMember = currentUser.memberships.some(
      (m) => m.type === 'member' && (m.status === 'verified' || m.status === 'active'),
    );

    const membershipStatus: VolunteerActivityStatus =
      volunteerMembership?.status === 'active' || volunteerMembership?.status === 'verified'
        ? 'active'
        : volunteerMembership?.status === 'pending'
        ? 'pending'
        : 'none';

    const position = currentUser.dimensions?.position?.position;
    const electoralStatus = currentUser.dimensions?.electoral?.status;

    return buildAccountSnapshot(
      {
        userId: currentUser.id,
        name: currentUser.identity.name,
        phone: currentUser.identity.phone,
        isOfficialMember,
        volunteerStatus: currentUser.dimensions?.volunteer ?? membershipStatus,
        hasLeadershipRole:
          Boolean(position && position !== 'NONE') || Boolean(electoralStatus && electoralStatus !== 'NONE'),
        fallbackVerification:
          volunteerMembership?.status === 'active' || volunteerMembership?.status === 'verified'
            ? 'terverifikasi'
            : 'belum_verifikasi',
      },
      repository,
    );
  }, [currentUser, record, repository]);
}
