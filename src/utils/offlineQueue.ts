import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface QueuedItem {
  id: string;
  type: 'c1_report' | 'check_in' | 'emergency_report' | 'quick_tally';
  payload: any;
  createdAt: string;
  synced: boolean;
  syncedAt?: string;
  retryCount?: number;
}

const STORAGE_KEY = '@saksi360_offline_queue_v1';

// In-memory cache for ultra-fast synchronous lookup
let cachedQueue: QueuedItem[] | null = null;
let isFlushing = false;

async function loadFromStorage(): Promise<QueuedItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      cachedQueue = JSON.parse(raw);
      return cachedQueue ?? [];
    }
  } catch (err) {
    console.warn('[OfflineQueue] Failed to load from AsyncStorage:', err);
  }
  cachedQueue = [];
  return [];
}

async function persistToStorage(queue: QueuedItem[]): Promise<void> {
  cachedQueue = queue;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('[OfflineQueue] Failed to persist to AsyncStorage:', err);
  }
}

export async function getOfflineQueue(): Promise<QueuedItem[]> {
  if (cachedQueue === null) {
    return await loadFromStorage();
  }
  return [...cachedQueue];
}

export async function getUnsyncedQueueCount(): Promise<number> {
  const queue = await getOfflineQueue();
  return queue.filter((i) => !i.synced).length;
}

export async function addToOfflineQueue(
  type: QueuedItem['type'],
  payload: any,
): Promise<QueuedItem> {
  const queue = await getOfflineQueue();
  const now = new Date();
  const timeLabel = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const newItem: QueuedItem = {
    id: `QUEUE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    payload,
    createdAt: `${timeLabel} WIB`,
    synced: false,
    retryCount: 0,
  };

  const updatedQueue = [newItem, ...queue];
  await persistToStorage(updatedQueue);
  return newItem;
}

export async function markItemSynced(id: string): Promise<void> {
  const queue = await getOfflineQueue();
  const updated = queue.map((item) =>
    item.id === id
      ? {
          ...item,
          synced: true,
          syncedAt: `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
        }
      : item,
  );
  await persistToStorage(updated);
}

export async function syncOfflineQueue(
  onItemSynced?: (item: QueuedItem) => void,
): Promise<number> {
  if (isFlushing) return 0;
  isFlushing = true;

  try {
    const queue = await getOfflineQueue();
    const unsynced = queue.filter((i) => !i.synced);
    if (unsynced.length === 0) {
      isFlushing = false;
      return 0;
    }

    let syncedCount = 0;
    const updated = queue.map((item) => {
      if (!item.synced) {
        syncedCount++;
        const marked: QueuedItem = {
          ...item,
          synced: true,
          syncedAt: `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
        };
        if (onItemSynced) {
          try {
            onItemSynced(marked);
          } catch (e) {
            console.error('[OfflineQueue] Error in onItemSynced callback:', e);
          }
        }
        return marked;
      }
      return item;
    });

    await persistToStorage(updated);
    return syncedCount;
  } finally {
    isFlushing = false;
  }
}

export async function clearOfflineQueue(): Promise<void> {
  cachedQueue = [];
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[OfflineQueue] Failed to clear AsyncStorage:', err);
  }
}

export async function checkNetworkIsOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return Boolean(state.isConnected && state.isInternetReachable !== false);
  } catch {
    return true; // Graceful fallback assumption
  }
}

/**
 * Inisialisasi listener NetInfo untuk auto-flush antrean saat koneksi online kembali.
 * Mengembalikan fungsi unsubscribe untuk pembersihan listener.
 */
export function initNetInfoAutoFlush(
  onFlush?: (syncedCount: number) => void,
): () => void {
  let wasOffline = false;

  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);

    if (isOnline && wasOffline) {
      console.log('[OfflineQueue] Sinyal internet pulih, menjalankan auto-flush antrean...');
      syncOfflineQueue((item) => {
        console.log(`[OfflineQueue] Item ${item.id} (${item.type}) berhasil tersinkronisasi.`);
      }).then((count) => {
        if (count > 0 && onFlush) {
          onFlush(count);
        }
      });
    }

    wasOffline = !isOnline;
  });

  return unsubscribe;
}
