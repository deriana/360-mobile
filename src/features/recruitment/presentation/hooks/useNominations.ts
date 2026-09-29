import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useApp } from '../../../../context/AppContext';
import { Result } from '../../../../core/result';
import { useAccountSnapshot } from '../../../account';
import { NominationInput } from '../../domain/nominatedVolunteer';
import { canRecruit, isSameDay, maskPhone } from '../../domain/recruitmentRules';
import { simulateNominationReview } from '../../application/simulateNominationReview';
import { submitNomination } from '../../application/submitNomination';
import { RecruitmentUseCaseOutput } from '../../application/recruitmentUseCaseTypes';
import { recruitmentDependencies } from '../../dependencies';

/**
 * Penghubung layar Ajak Relawan (`NominateVolunteerScreen`) ↔ use case nominasi.
 * Setiap aksi yang berhasil ikut dicatat sebagai notifikasi.
 */
export function useNominations() {
  const { pushNotification } = useApp();
  const account = useAccountSnapshot();
  const { repository, now } = recruitmentDependencies;

  const all = useSyncExternalStore(repository.subscribe, repository.getAll);

  const mine = useMemo(
    () =>
      all
        .filter((n) => n.nominatorId === account.userId)
        .map((n) => ({ ...n, phoneMasked: maskPhone(n.phone) })),
    [all, account.userId],
  );

  const recruitAccess = useMemo(() => {
    const today = now();
    return canRecruit(account, mine.filter((n) => isSameDay(n.nominatedAt, today)).length);
  }, [account, mine, now]);

  const summary = useMemo(
    () => ({
      pending: mine.filter((n) => n.status === 'PENDING_VERIFICATION').length,
      verified: mine.filter((n) => n.status === 'VERIFIED').length,
    }),
    [mine],
  );

  const report = useCallback(
    (result: Result<RecruitmentUseCaseOutput>) => {
      if (result.ok) pushNotification({ ...result.value.notice, sentBy: 'Tim Verifikasi Pusat' });
      return result;
    },
    [pushNotification],
  );

  return {
    nominations: mine,
    summary,
    recruitAccess,
    submit: (form: NominationInput, knownPhones?: string[]) =>
      report(submitNomination(recruitmentDependencies, { account, form, knownPhones })),
    simulateReview: (nominationId: string, verdict: 'VERIFIED' | 'REJECTED') =>
      report(simulateNominationReview(recruitmentDependencies, { nominationId, verdict })),
  };
}
