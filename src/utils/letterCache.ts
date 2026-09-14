import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CachedAssignmentLetter {
  witnessId: string;
  letterNo: string;
  witnessName: string;
  nik: string;
  assignedTpsId: string;
  tpsInfo: string;
  province: string;
  verificationToken: string;
  verifyUrl: string;
  digitalSealHash: string;
  cachedAt: string;
  isOfflineReady: boolean;
}

const STORAGE_PREFIX = '@pan360:letter:';
const memoryFallback = new Map<string, CachedAssignmentLetter>();

export async function saveAssignmentLetterToCache(letter: CachedAssignmentLetter): Promise<void> {
  const key = `${STORAGE_PREFIX}${letter.witnessId}`;
  memoryFallback.set(letter.witnessId, letter);
  try {
    await AsyncStorage.setItem(key, JSON.stringify(letter));
  } catch (error) {
    console.warn('[letterCache] Gagal menyimpan ke AsyncStorage, menggunakan memory fallback:', error);
  }
}

export async function getCachedAssignmentLetter(witnessId: string): Promise<CachedAssignmentLetter | null> {
  const key = `${STORAGE_PREFIX}${witnessId}`;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      const parsed: CachedAssignmentLetter = JSON.parse(raw);
      memoryFallback.set(witnessId, parsed);
      return parsed;
    }
  } catch (error) {
    console.warn('[letterCache] Gagal membaca dari AsyncStorage, memeriksa memory fallback:', error);
  }
  return memoryFallback.get(witnessId) ?? null;
}

export async function clearCachedAssignmentLetter(witnessId: string): Promise<void> {
  const key = `${STORAGE_PREFIX}${witnessId}`;
  memoryFallback.delete(witnessId);
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn('[letterCache] Gagal menghapus dari AsyncStorage:', error);
  }
}
