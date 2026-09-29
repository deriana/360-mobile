// API publik fitur Ajak Relawan. Kode di luar `src/features/recruitment` hanya boleh import dari file ini.
// Layarnya tetap `src/screens/NominateVolunteerScreen.tsx` (dibuat rekan) — disambungkan ke hook ini di Tahap B.
export type {
  NominatedVolunteer,
  NominatedVolunteerStatus,
  NominationInput,
} from './domain/nominatedVolunteer';
export type { NominationErrors, RecruitAccess } from './domain/recruitmentRules';
export { NOMINATION_STATUS_INFO } from './domain/nominatedVolunteer';
export { DAILY_NOMINATION_LIMIT, validateNomination } from './domain/recruitmentRules';
export { useNominations } from './presentation/hooks/useNominations';
