// Deterministic PRNG so mock data is stable across reloads.
export function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rand = mulberry32(42);

export const pick = <T,>(arr: T[], r: () => number = rand): T => arr[Math.floor(r() * arr.length)];
export const randInt = (min: number, max: number, r: () => number = rand): number =>
  Math.floor(r() * (max - min + 1)) + min;
