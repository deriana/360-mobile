/**
 * Generator HTML Leaflet untuk React Native WebView (Sandboxed & Offline Resilient)
 * Peta Sebaran & Command Center Terpadu — PAN 360
 *
 * Dirombak total (2026-09-28): sesuai permintaan, yang dipertahankan dari
 * builder lama HANYA peta Indonesia + pembagian wilayahnya (poligon GeoJSON
 * provinsi/kab-kota/kecamatan + drill-down zoom). Seluruh layer pin
 * posko/kantor/kader/relawan dan logika "Layer Mode" (ALL/MEMBERS/
 * VOLUNTEERS/WITNESSES) milik Peta Sebaran versi lama DIHAPUS karena
 * modul itu sekarang digabung ke MapSebaranRelawanAnggotaScreen.tsx sebagai
 * satu layar Peta Sebaran & Command Center.
 *
 * Warna choropleth & highlight wilayah terpilih di sini WAJIB identik
 * dengan commandCenterService.ts (ACHIEVEMENT_STATUS_MAP / PAN_VICTORY_CONFIG
 * / SELECTED_REGION_STYLE / UNSELECTED_REGION_STYLE) — nilai hex tidak boleh
 * didefinisikan ulang di sini, hanya diterima sebagai parameter dari layar.
 */
import { LEAFLET_CSS, LEAFLET_JS } from './leafletSource';

export interface BuildCommandMapOptions {
  centerLat: number;
  centerLng: number;
  zoom: number;
  /** GeoJSON nasional (38 provinsi) — public/indonesia.geojson versi mobile */
  nationalGeoJson: any;
  /** GeoJSON kabupaten/kota untuk provinsi yang sedang aktif (drill-down), boleh null */
  regencyGeoJson?: any | null;
  /** GeoJSON kecamatan untuk kabupaten/kota yang sedang aktif (drill-down), boleh null */
  districtGeoJson?: any | null;
  /** slug provinsi -> warna fill hex, identik tier commandCenterService */
  regionFillColors: Record<string, string>;
  /** slug provinsi -> label nilai singkat (mis. "95.4%") ditampilkan di tooltip */
  regionValueLabels: Record<string, string>;
  /** slug provinsi yang sedang di-highlight (Bagian 4.4: border solid #00529C) */
  selectedRegionSlug?: string | null;
  /** Warna border highlight wilayah terpilih (identik SELECTED_REGION_STYLE.borderColor) */
  selectedBorderColor: string;
  isDark: boolean;
}

export function buildCommandCenterMapHtml({
  centerLat,
  centerLng,
  zoom,
  nationalGeoJson,
  regencyGeoJson = null,
  districtGeoJson = null,
  regionFillColors,
  regionValueLabels,
  selectedRegionSlug = null,
  selectedBorderColor,
  isDark,
}: BuildCommandMapOptions): string {
  const nationalGeoJsonStr = JSON.stringify(nationalGeoJson || null);
  const regencyGeoJsonStr = JSON.stringify(regencyGeoJson || null);
  const districtGeoJsonStr = JSON.stringify(districtGeoJson || null);
  const regionFillColorsStr = JSON.stringify(regionFillColors || {});
  const regionValueLabelsStr = JSON.stringify(regionValueLabels || {});
  const selectedRegionSlugStr = JSON.stringify(selectedRegionSlug || null);

  const bgColor = isDark ? '#091322' : '#F8FAFC';
  const noDataColor = '#64748B';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Peta Sebaran & Command Center PAN 360</title>
  <style>
    ${LEAFLET_CSS}
  </style>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body, #map { width: 100%; height: 100%; background: ${bgColor}; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .leaflet-control-attribution { display: none !important; }
    .leaflet-control-zoom { display: none !important; }

    ${isDark ? `
    .leaflet-tile-pane {
      filter: brightness(0.72) invert(1) contrast(2) hue-rotate(195deg) saturate(0.35);
    }
    ` : `
    .leaflet-tile-pane {
      filter: saturate(0.85) contrast(1.02);
    }
    `}

    .custom-polygon-tooltip {
      background: ${isDark ? 'rgba(15, 23, 42, 0.94)' : '#FFFFFF'} !important;
      color: ${isDark ? '#FFFFFF' : '#0F172A'} !important;
      border: 1.5px solid ${selectedBorderColor} !important;
      border-radius: 8px !important;
      padding: 6px 10px !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25) !important;
    }
    .custom-polygon-tooltip::before { display: none !important; }

    /* Label persentase permanen di atas tiap provinsi — nilainya sama
       persis dengan yang ditampilkan di modal "Pilih Cakupan Wilayah"
       (satu sumber data: commandCenterService.getRegionColorMap). */
    .region-permanent-label {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
      pointer-events: none !important;
    }
    .region-permanent-label::before { display: none !important; }
    .region-permanent-label-inner {
      position: absolute;
      transform: translate(-50%, -50%);
      font-weight: 800;
      font-size: 11px;
      color: #FFFFFF;
      text-shadow: 0 1px 2px rgba(0,0,0,0.85), 0 0 4px rgba(0,0,0,0.6);
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    ${LEAFLET_JS}
  </script>
  <script>
    (function () {
      function sendToNative(type, data) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, data: data }));
        }
      }

      // Slugify identik dengan src/utils/geoRegistry.ts (normalizeProvinceSlug)
      // agar key warna dari RN (commandCenterService) selalu cocok dengan
      // nama properti PROVINSI pada GeoJSON.
      function slugify(value) {
        return String(value || '')
          .toLowerCase()
          .replace(/^(kabupaten|kab\\.|kota|provinsi|prov\\.)\\s+/i, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-+|-+\$)/g, '');
      }
      function normalizeProvinceSlug(name) {
        var clean = String(name || '').replace(/^(provinsi|prov\\.)\\s*/i, '').trim();
        var rawSlug = slugify(clean);
        if (rawSlug === 'dki-jakarta' || rawSlug === 'jakarta') return 'dki-jakarta';
        if (rawSlug === 'di-yogyakarta' || rawSlug === 'yogyakarta' || rawSlug.indexOf('istimewa-yogyakarta') >= 0) return 'di-yogyakarta';
        if (rawSlug.indexOf('bangka-belitung') >= 0) return 'bangka-belitung';
        if (rawSlug.indexOf('kepulauan-riau') >= 0 || rawSlug === 'kep-riau') return 'kepulauan-riau';
        if (rawSlug.indexOf('nusa-tenggara-barat') >= 0 || rawSlug === 'ntb') return 'nusa-tenggara-barat';
        if (rawSlug.indexOf('nusa-tenggara-timur') >= 0 || rawSlug === 'ntt') return 'nusa-tenggara-timur';
        return rawSlug;
      }

      var NO_DATA_COLOR = '${noDataColor}';
      var SELECTED_BORDER_COLOR = '${selectedBorderColor}';
      var regionFillColors = ${regionFillColorsStr};
      var regionValueLabels = ${regionValueLabelsStr};
      var selectedRegionSlug = ${selectedRegionSlugStr};
      var nationalGeoJson = ${nationalGeoJsonStr};
      var regencyGeoJson = ${regencyGeoJsonStr};
      var districtGeoJson = ${districtGeoJsonStr};

      var map = L.map('map', {
        center: [${centerLat}, ${centerLng}],
        zoom: ${zoom},
        zoomControl: false,
        attributionControl: false,
        minZoom: 4,
        maxZoom: 14,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      var provinceLayerGroup = L.layerGroup().addTo(map);
      var provinceLabelGroup = L.layerGroup().addTo(map);
      var regencyLayerGroup = L.layerGroup().addTo(map);
      var districtLayerGroup = L.layerGroup().addTo(map);
      var provinceLayerBySlug = {};

      // ------------------------------------------------------------
      // TIER: PROVINSI (38) — choropleth Command Center + highlight
      // ------------------------------------------------------------
      function styleForSlug(slug) {
        var isSelected = selectedRegionSlug && slug === selectedRegionSlug;
        var fillColor = regionFillColors[slug] || NO_DATA_COLOR;
        if (isSelected) {
          return {
            fillColor: fillColor,
            fillOpacity: 0.88,
            weight: 3.5,
            color: SELECTED_BORDER_COLOR,
            opacity: 1,
            dashArray: null,
          };
        }
        return {
          fillColor: fillColor,
          fillOpacity: 0.72,
          weight: 1,
          color: fillColor,
          opacity: 0.9,
          dashArray: '4 3',
        };
      }

      function renderProvinces() {
        provinceLayerGroup.clearLayers();
        provinceLabelGroup.clearLayers();
        provinceLayerBySlug = {};
        if (!nationalGeoJson || !nationalGeoJson.features) return;

        L.geoJSON(nationalGeoJson, {
          style: function (feature) {
            var rawName = feature.properties.PROVINSI || feature.properties.name || '';
            return styleForSlug(normalizeProvinceSlug(rawName));
          },
          onEachFeature: function (feature, layer) {
            var rawName = feature.properties.PROVINSI || feature.properties.name || '';
            var slug = normalizeProvinceSlug(rawName);
            provinceLayerBySlug[slug] = layer;
            var valueLabel = regionValueLabels[slug] || '';

            layer.bindTooltip(
              '<div style="text-align:center;line-height:1.3;">' +
                '<strong style="font-size:11px;">' + rawName + '</strong>' +
                (valueLabel ? '<br/><span style="font-size:10px;font-weight:700;">' + valueLabel + '</span>' : '') +
              '</div>',
              { sticky: true, direction: 'top', className: 'custom-polygon-tooltip' }
            );

            // Label persentase permanen di tengah provinsi — nilai identik
            // dengan modal "Pilih Cakupan Wilayah" (sama-sama dari
            // regionValueLabels / getRegionColorMap), dan otomatis ganti
            // saat mode peta (Relawan/Saksi Mandat/Kemenangan) diganti
            // karena renderProvinces() dipanggil ulang tiap kali
            // regionValueLabels berubah.
            if (valueLabel) {
              try {
                var center = layer.getBounds().getCenter();
                var labelIcon = L.divIcon({
                  className: 'region-permanent-label',
                  html: '<div class="region-permanent-label-inner">' + valueLabel + '</div>',
                  iconSize: [0, 0],
                });
                L.marker(center, { icon: labelIcon, interactive: false, keyboard: false }).addTo(provinceLabelGroup);
              } catch (e) {}
            }

            layer.on({
              mouseover: function (e) {
                if (slug !== selectedRegionSlug) e.target.setStyle({ weight: 2, fillOpacity: 0.82 });
              },
              mouseout: function (e) {
                if (slug !== selectedRegionSlug) e.target.setStyle(styleForSlug(slug));
              },
              click: function (e) {
                var center = e.target.getBounds().getCenter();
                sendToNative('REGION_TAP', { level: 'PROVINCE', slug: slug, name: rawName, lat: center.lat, lng: center.lng });
              },
            });
          },
        }).addTo(provinceLayerGroup);
      }

      // ------------------------------------------------------------
      // TIER: KAB/KOTA & KECAMATAN — hanya batas wilayah (belum ada
      // data agregat per level ini di Fase 1, lihat Bagian 9 Roadmap)
      // ------------------------------------------------------------
      function renderBoundaryOnly(geojson, group, level, nameKey) {
        group.clearLayers();
        if (!geojson || !geojson.features) return;
        L.geoJSON(geojson, {
          style: function () {
            return {
              fillColor: SELECTED_BORDER_COLOR,
              fillOpacity: 0.08,
              weight: 1.4,
              color: SELECTED_BORDER_COLOR,
              opacity: 0.85,
            };
          },
          onEachFeature: function (feature, layer) {
            var name = feature.properties[nameKey] || feature.properties.name || '';
            layer.bindTooltip(
              '<div style="text-align:center;"><strong style="font-size:11px;">' + name + '</strong></div>',
              { sticky: true, direction: 'top', className: 'custom-polygon-tooltip' }
            );
            layer.on({
              mouseover: function (e) { e.target.setStyle({ weight: 2.4, fillOpacity: 0.18 }); },
              mouseout: function (e) { e.target.setStyle({ weight: 1.4, fillOpacity: 0.08 }); },
              click: function (e) {
                var center = e.target.getBounds().getCenter();
                sendToNative('REGION_TAP', { level: level, name: name, lat: center.lat, lng: center.lng });
              },
            });
          },
        }).addTo(group);
      }

      renderProvinces();
      renderBoundaryOnly(regencyGeoJson, regencyLayerGroup, 'REGENCY', 'kabupaten');
      renderBoundaryOnly(districtGeoJson, districtLayerGroup, 'DISTRICT', 'kecamatan');

      // ------------------------------------------------------------
      // BRIDGE — dipanggil dari React Native (mode switch, seleksi,
      // dan drill-down GeoJSON) tanpa reload seluruh WebView.
      // ------------------------------------------------------------
      window.panSetRegionColors = function (colorsObj, labelsObj, selectedSlug) {
        try {
          regionFillColors = colorsObj || {};
          regionValueLabels = labelsObj || {};
          selectedRegionSlug = selectedSlug || null;
          renderProvinces();
        } catch (e) {
          sendToNative('WEBVIEW_ERROR', String(e));
        }
      };

      window.panShowRegencyBoundaries = function (geojson) {
        try {
          renderBoundaryOnly(geojson || null, regencyLayerGroup, 'REGENCY', 'kabupaten');
          districtLayerGroup.clearLayers();
        } catch (e) {
          sendToNative('WEBVIEW_ERROR', String(e));
        }
      };

      window.panShowDistrictBoundaries = function (geojson) {
        try {
          renderBoundaryOnly(geojson || null, districtLayerGroup, 'DISTRICT', 'kecamatan');
        } catch (e) {
          sendToNative('WEBVIEW_ERROR', String(e));
        }
      };

      window.panClearDrillBoundaries = function () {
        regencyLayerGroup.clearLayers();
        districtLayerGroup.clearLayers();
      };

      window.panFlyTo = function (lat, lng, targetZoom) {
        map.flyTo([lat, lng], targetZoom, { duration: 0.6 });
      };

      map.on('zoomend', function () {
        sendToNative('MAP_VIEWPORT_CHANGE', { zoom: map.getZoom() });
      });
    })();
  </script>
</body>
</html>`;
}
