import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useApp } from '../../../../context/AppContext';
import { Result } from '../../../../core/result';
import { useAccountSnapshot } from '../../../account';
import { WitnessApplicationForm } from '../../domain/witnessApplication';
import { getWitnessAccess } from '../../domain/witnessAccessRules';
import { WITNESS_STATUS_INFO, WITNESS_STEPS } from '../../domain/witnessSteps';
import { acceptAssignmentLetter } from '../../application/acceptAssignmentLetter';
import { completeWitnessTraining } from '../../application/completeWitnessTraining';
import { simulateWitnessReview, WitnessReviewDecision } from '../../application/simulateWitnessReview';
import { submitWitnessApplication } from '../../application/submitWitnessApplication';
import { WitnessUseCaseOutput } from '../../application/witnessUseCaseTypes';
import { witnessDependencies } from '../../dependencies';

/**
 * Penghubung layar ↔ use case Saksi. Status diperbarui otomatis saat repository berubah,
 * dan setiap aksi yang berhasil ikut dicatat sebagai notifikasi.
 */
export function useWitnessApplication() {
  const { pushNotification } = useApp();
  const account = useAccountSnapshot();
  const { repository } = witnessDependencies;

  const application = useSyncExternalStore(repository.subscribe, () => repository.get(account.userId));
  const access = useMemo(() => getWitnessAccess(account, application), [account, application]);
  const statusInfo = WITNESS_STATUS_INFO[access.status];

  const report = useCallback(
    (result: Result<WitnessUseCaseOutput>) => {
      if (result.ok) pushNotification({ ...result.value.notice, sentBy: 'Tim Saksi Pusat' });
      return result;
    },
    [pushNotification],
  );

  return {
    account,
    application,
    access,
    statusInfo,
    stepNumber: statusInfo.stepIndex + 1,
    totalSteps: WITNESS_STEPS.length,
    submit: (form: WitnessApplicationForm) =>
      report(submitWitnessApplication(witnessDependencies, { account, form })),
    completeTraining: () => report(completeWitnessTraining(witnessDependencies, { userId: account.userId })),
    acceptLetter: () => report(acceptAssignmentLetter(witnessDependencies, { userId: account.userId })),
    simulateReview: (decision: WitnessReviewDecision) =>
      report(simulateWitnessReview(witnessDependencies, { userId: account.userId, decision })),
  };
}
