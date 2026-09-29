import { MockVolunteerActivityRepository } from './data/mockVolunteerActivityRepository';

/** Titik perakitan fitur: ganti implementasi mock ke API cukup di file ini. */
export const accountDependencies = {
  volunteerActivityRepository: new MockVolunteerActivityRepository(),
};
