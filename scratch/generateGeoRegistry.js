const fs = require('fs');
const path = require('path');

const kabDir = path.resolve(__dirname, '../src/data/geo/kabupaten');
const kecDir = path.resolve(__dirname, '../src/data/geo/kecamatan');

const kabFiles = fs.readdirSync(kabDir).filter(f => f.endsWith('.json') && !f.endsWith('-index.json')).sort();
const kecFiles = fs.readdirSync(kecDir).filter(f => f.endsWith('.json')).sort();

let code = `/**
 * Spatial GeoJSON Dynamic Registry & Lazy Loader (100% Offline)
 * Mengadopsi 34 GeoJSON Provinsi (Kab/Kota) dan 519 GeoJSON Kab/Kota (Kecamatan)
 * Diadopsi dari Saksi360-Admin
 */

const provinceCache = new Map<string, any>();
const regencyCache = new Map<string, any>();

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/^(kabupaten|kab\\.|kota|provinsi|prov\\.)\\s+/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
}

export function normalizeProvinceSlug(name: string): string {
  const clean = name.replace(/^(provinsi|prov\\.)\\s*/i, '').trim();
  const rawSlug = slugify(clean);
  if (rawSlug === 'dki-jakarta' || rawSlug === 'jakarta') return 'dki-jakarta';
  if (rawSlug === 'di-yogyakarta' || rawSlug === 'yogyakarta' || rawSlug.includes('istimewa-yogyakarta')) return 'di-yogyakarta';
  if (rawSlug.includes('bangka-belitung')) return 'bangka-belitung';
  if (rawSlug.includes('kepulauan-riau') || rawSlug === 'kep-riau') return 'kepulauan-riau';
  if (rawSlug.includes('nusa-tenggara-barat') || rawSlug === 'ntb') return 'nusa-tenggara-barat';
  if (rawSlug.includes('nusa-tenggara-timur') || rawSlug === 'ntt') return 'nusa-tenggara-timur';
  return rawSlug;
}

const PROVINCE_LOADERS: Record<string, () => any> = {
`;

for (const f of kabFiles) {
  const slug = f.replace('.json', '');
  code += `  '${slug}': () => require('../data/geo/kabupaten/${f}'),\n`;
}

code += `};

const KABUPATEN_LOADERS: Record<string, () => any> = {
`;

for (const f of kecFiles) {
  const slug = f.replace('.json', '');
  code += `  '${slug}': () => require('../data/geo/kecamatan/${f}'),\n`;
}

code += `};

export function getProvinceKabupatenGeoJson(provinceName: string): any | null {
  if (!provinceName) return null;
  const targetSlug = normalizeProvinceSlug(provinceName);
  
  if (provinceCache.has(targetSlug)) {
    return provinceCache.get(targetSlug);
  }

  const loader = PROVINCE_LOADERS[targetSlug];
  if (loader) {
    try {
      const data = loader();
      const resolved = data && data.default ? data.default : data;
      provinceCache.set(targetSlug, resolved);
      return resolved;
    } catch (err) {
      console.warn('[GeoRegistry] Failed to load province geojson for:', provinceName, err);
    }
  }

  // Fallback fuzzy search
  for (const [key, loadFn] of Object.entries(PROVINCE_LOADERS)) {
    if (key.includes(targetSlug) || targetSlug.includes(key)) {
      try {
        const data = loadFn();
        const resolved = data && data.default ? data.default : data;
        provinceCache.set(targetSlug, resolved);
        return resolved;
      } catch {}
    }
  }

  return null;
}

export function getKabupatenKecamatanGeoJson(kabupatenName: string): any | null {
  if (!kabupatenName) return null;
  const clean = slugify(kabupatenName);
  const full = kabupatenName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '');
  const withKota = \`kota-\${clean}\`;
  const withKab = \`kabupaten-\${clean}\`;
  const withKabShort = \`kab-\${clean}\`;

  const candidates = Array.from(new Set([full, clean, withKota, withKab, withKabShort]));

  for (const s of candidates) {
    if (regencyCache.has(s)) {
      return regencyCache.get(s);
    }
    const loader = KABUPATEN_LOADERS[s];
    if (loader) {
      try {
        const data = loader();
        const resolved = data && data.default ? data.default : data;
        regencyCache.set(s, resolved);
        regencyCache.set(clean, resolved);
        return resolved;
      } catch (err) {
        console.warn('[GeoRegistry] Failed to load kabupaten geojson for:', kabupatenName, err);
      }
    }
  }

  // Fallback fuzzy search
  for (const [key, loadFn] of Object.entries(KABUPATEN_LOADERS)) {
    if (key.replace(/^(kota|kabupaten|kab)-/, '') === clean || key.includes(clean)) {
      try {
        const data = loadFn();
        const resolved = data && data.default ? data.default : data;
        regencyCache.set(clean, resolved);
        return resolved;
      } catch {}
    }
  }

  return null;
}

export function getAvailableProvinceSlugs(): string[] {
  return Object.keys(PROVINCE_LOADERS);
}

export function getAvailableKabupatenSlugs(): string[] {
  return Object.keys(KABUPATEN_LOADERS);
}

export function getFeatureCentroid(feature: any): { lat: number; lng: number } {
  if (!feature || !feature.geometry) return { lat: -2.5, lng: 118.0 };
  const geom = feature.geometry;
  let coords: [number, number][] = [];
  if (geom.type === 'Polygon' && geom.coordinates && geom.coordinates[0]) {
    coords = geom.coordinates[0];
  } else if (geom.type === 'MultiPolygon' && geom.coordinates) {
    coords = geom.coordinates.map((p: any) => p[0]).flat();
  }
  if (!coords || coords.length === 0) return { lat: -2.5, lng: 118.0 };
  let sumLat = 0, sumLng = 0;
  for (const c of coords) {
    sumLng += c[0];
    sumLat += c[1];
  }
  return {
    lat: Math.round((sumLat / coords.length) * 10000) / 10000,
    lng: Math.round((sumLng / coords.length) * 10000) / 10000,
  };
}
`;

const outPath = path.resolve(__dirname, '../src/utils/geoRegistry.ts');
fs.writeFileSync(outPath, code, 'utf8');
console.log('Generated src/utils/geoRegistry.ts successfully. Bytes:', code.length);
