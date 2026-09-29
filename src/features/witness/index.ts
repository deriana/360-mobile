// API publik fitur Saksi. Kode di luar `src/features/witness` hanya boleh import dari file ini.
export type {
  WitnessApplication,
  WitnessApplicationStatus,
  AssignedTpsLocation,
  AssignmentLetterStatus,
  ReportLifecycleStatus,
  CheckinStatus,
} from './domain/witnessApplication';
export type { WitnessAccess, WitnessNextAction } from './domain/witnessAccessRules';
export type { WitnessReviewDecision } from './application/simulateWitnessReview';
export { getWitnessAccess } from './domain/witnessAccessRules';
export { canTakeWitnessQuiz, getTrainingProgressPercent, QUIZ_MIN_PROGRESS_PERCENT } from './domain/witnessTraining';
export { WITNESS_STATUS_INFO, WITNESS_STEPS } from './domain/witnessSteps';
export { useWitnessApplication } from './presentation/hooks/useWitnessApplication';
export { useWitnessRoleSync } from './presentation/hooks/useWitnessRoleSync';
export { useActiveWitnessScope } from './presentation/hooks/useActiveWitnessScope';
export { useTrainingProgress } from './presentation/hooks/useTrainingProgress';
export { default as SaksiScreen } from './presentation/screens/SaksiScreen';
export { default as DaftarSaksiScreen } from './presentation/screens/DaftarSaksiScreen';
export { default as WitnessProgressCard } from './presentation/components/WitnessProgressCard';
