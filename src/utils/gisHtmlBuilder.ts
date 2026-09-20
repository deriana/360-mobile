/**
 * Generator HTML Leaflet untuk React Native WebView (Sandboxed & Offline Resilient)
 * Menerapkan Smart Spatial Collision Grouping & Breakdown Bertahap 4-Tier Ala Web Admin
 * (Nasional > Provinsi > Kab/Kota > Kecamatan & Posko Desa)
 * Bebas Watermark (OSM Resmi), Nol Animasi Pulse, Real Kuantitas (Tanpa % Bappilu), & Poligon Multi-Tier
 */
import { PoskoDesaItem, PoskoLocation, RegionalCluster } from '../data/gisRegionalData';
import { KantorSekretariat } from '../data/simpan';
import { PanMemberCluster } from '../data/panMemberDistributionData';
import { GisLayerMode } from '../services/gisDistributionService';
import { LEAFLET_CSS, LEAFLET_JS } from './leafletSource';

export interface BuildMapOptions {
  centerLat: number;
  centerLng: number;
  zoom: number;
  clusters: RegionalCluster[];
  poskos: PoskoLocation[];
  poskoDesas?: PoskoDesaItem[];
  offices?: KantorSekretariat[];
  memberClusters?: PanMemberCluster[];
  nationalGeoJson?: any;
  regencyGeoJson?: any;
  districtGeoJson?: any;
  activeDistrictName?: string;
  filterType: GisLayerMode;
  isDark: boolean;
}

export function buildIndonesiaGisMapHtml({
  centerLat,
  centerLng,
  zoom,
  clusters,
  poskos,
  poskoDesas = [],
  offices = [],
  memberClusters = [],
  nationalGeoJson = null,
  regencyGeoJson = null,
  districtGeoJson = null,
  activeDistrictName = 'Coblong',
  filterType,
  isDark,
}: BuildMapOptions): string {
  const clustersJson = JSON.stringify(clusters);
  const poskosJson = JSON.stringify(poskos);
  const poskoDesasJson = JSON.stringify(poskoDesas);
  const officesJson = JSON.stringify(offices);
  const membersJson = JSON.stringify(memberClusters);
  const nationalGeoJsonStr = JSON.stringify(nationalGeoJson);
  const regencyGeoJsonStr = JSON.stringify(regencyGeoJson);
  const districtGeoJsonStr = JSON.stringify(districtGeoJson);

  const bgColor = isDark ? '#091322' : '#F8FAFC';
  const popupBg = isDark ? '#0F172A' : '#FFFFFF';
  const popupText = isDark ? '#F8FAFC' : '#1E293B';
  const popupBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Peta Sebaran GIS PAN 360</title>
  <style>
    ${LEAFLET_CSS}
  </style>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body, #map { width: 100%; height: 100%; background: ${bgColor}; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .leaflet-control-attribution { display: none !important; }
    .leaflet-control-zoom { display: none !important; }
    
    /* OpenStreetMap Standard Basemap Styling (Zero Watermark / No API Key Required) */
    ${isDark ? `
    .leaflet-tile-pane {
      filter: brightness(0.72) invert(1) contrast(2) hue-rotate(195deg) saturate(0.35);
    }
    ` : `
    .leaflet-tile-pane {
      filter: saturate(0.85) contrast(1.02);
    }
    `}

    /* Clean Tooltip on Polygons */
    .custom-polygon-tooltip {
      background: ${isDark ? 'rgba(15, 23, 42, 0.94)' : '#FFFFFF'} !important;
      color: ${isDark ? '#FFFFFF' : '#0F172A'} !important;
      border: 1.5px solid ${isDark ? 'rgba(56, 189, 248, 0.8)' : '#0066B3'} !important;
      border-radius: 8px !important;
      padding: 4px 10px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22) !important;
    }
    .leaflet-tooltip-top.custom-polygon-tooltip:before {
      border-top-color: ${isDark ? 'rgba(15, 23, 42, 0.94)' : '#FFFFFF'} !important;
    }

    /* Solid Micro-Card Pin (Anti-Clashing, Zero Overlap, WCAG AAA) */
    .field-data-micro-card {
      background: transparent !important;
      border: none !important;
      pointer-events: auto !important;
      cursor: pointer !important;
    }

    /* Pin Kantor Sekretariat & Posko Resmi PAN (Normalized Teardrop Pin) */
    .normalized-office-pin {
      background: transparent !important;
      border: none !important;
      filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.35));
      cursor: pointer !important;
      transition: transform 0.15s ease-out;
    }
    .normalized-office-pin:active {
      transform: scale(0.92);
    }

    /* Leaflet Popup Styling */
    .leaflet-popup-content-wrapper {
      background: ${popupBg} !important;
      color: ${popupText} !important;
      border-radius: 12px !important;
      padding: 6px !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.22) !important;
      border: 1px solid ${popupBorder} !important;
    }
    .leaflet-popup-tip {
      background: ${popupBg} !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    ${LEAFLET_JS}
  </script>
  <script>
    function sendToNative(type, category, data) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: type,
          category: category,
          data: data
        }));
      }
    }

    window.onerror = function(message, source, lineno, colno, error) {
      sendToNative('WEBVIEW_ERROR', 'JS_ERROR', {
        message: String(message),
        source: String(source),
        line: lineno,
        col: colno,
        stack: error ? String(error.stack) : ''
      });
    };

    try {
      var indonesiaBounds = [
        [-11.5, 94.5], // Barat Daya (Samudera Hindia)
        [6.5, 141.5]   // Timur Laut (Papua & Laut Maluku)
      ];

      var map = L.map('map', {
        center: [${centerLat}, ${centerLng}],
        zoom: ${zoom},
        minZoom: 4.5,
        maxZoom: 18,
        maxBounds: indonesiaBounds,
        maxBoundsViscosity: 0.75,
        zoomControl: false,
        attributionControl: false
      });

      // Solusi kalkulasi dimensi awal Android WebView (0x0 container size issue)
      function forceInvalidate() {
        if (typeof map !== 'undefined' && map) {
          map.invalidateSize();
        }
      }
      setTimeout(forceInvalidate, 100);
      setTimeout(forceInvalidate, 300);
      setTimeout(forceInvalidate, 600);
      setTimeout(forceInvalidate, 1200);
      window.addEventListener('resize', forceInvalidate);

      // 100% Free, Official OpenStreetMap Standard Tiles (Zero Watermark / No API Key Required)
      var tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abc'
      }).addTo(map);

      var isDark = ${isDark};
      var filterType = '${filterType}';
      var clusters = ${clustersJson};
      var poskos = ${poskosJson};
      var poskoDesas = ${poskoDesasJson};
      var offices = ${officesJson};
      var memberClusters = ${membersJson};
      var nationalGeoJson = ${nationalGeoJsonStr};
      var regencyGeoJson = ${regencyGeoJsonStr};
      var districtGeoJson = ${districtGeoJsonStr};
      var activeDistrictName = '${activeDistrictName}';

      // Layer Groups
      var polygonLayerGroup = L.layerGroup().addTo(map);
      var dynamicMarkerGroup = L.layerGroup().addTo(map);
      var officeLayerGroup = L.layerGroup().addTo(map);

      // Normalisasi nama wilayah untuk pencocokan toleran (menghilangkan prefiks & sufiks Dapil)
      function normalizeTerritoryName(str) {
        return (str || '')
          .toLowerCase()
          .replace(/provinsi\s+/i, '')
          .replace(/daerah\s+istimewa\s+/i, '')
          .replace(/d\.?i\.?\s+/i, '')
          .replace(/kabupaten\s+/i, '')
          .replace(/kab\.\s+/i, '')
          .replace(/kota\s+/i, '')
          .replace(/kecamatan\s+/i, '')
          .replace(/kec\.\s+/i, '')
          .replace(/\(.*\)/g, '')
          .trim();
      }

      // Data Lookup Maps dengan multi-key indexing (exact + normalized)
      var clusterMap = {};
      clusters.forEach(function(c) {
        clusterMap[c.name.toLowerCase()] = c;
        var norm = normalizeTerritoryName(c.name);
        if (norm) clusterMap[norm] = c;
      });

      var memberMap = {};
      memberClusters.forEach(function(m) {
        memberMap[m.name.toLowerCase()] = m;
        var norm = normalizeTerritoryName(m.name);
        if (norm) memberMap[norm] = m;
      });

      // ======================================================================
      // 1. HELPER FORMATTING KUANTITAS RIIL (BUKAN PERSENTASE BAPPILU)
      // ======================================================================

      function formatPersonelCount(num, unit) {
        if (!num || num <= 0) return '0 ' + unit;
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M ' + unit;
        if (num >= 10000) return Math.round(num / 1000) + 'K ' + unit;
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K ' + unit;
        return num.toLocaleString('id-ID') + ' ' + unit;
      }

      function getStatusColor(count) {
        if (count >= 100) return '#0066B3'; // PAN Blue / Kuat
        if (count >= 40) return '#059669';  // Emerald / Siaga Lapangan
        if (count >= 15) return '#0284C7';  // Sky Blue / Cukup
        return '#D97706';                   // Amber / Perlu Tambahan
      }

      // ======================================================================
      // 2. GENERATOR DIVICON SOLID BERKUALITAS TINGGI (WCAG AAA - ANTI CLASHING)
      // ======================================================================

      function getFieldMicroCardDivIcon(title, countText, statusHex, isDarkTheme, isGroup, groupCount, iconType) {
        var bg = isDarkTheme ? '#0F172A' : '#FFFFFF';
        var border = isDarkTheme ? '#38BDF8' : '#0066B3';
        var textColor = isDarkTheme ? '#F8FAFC' : '#0F172A';
        var pillBg = isDarkTheme ? 'rgba(30,41,59,0.95)' : '#F1F5F9';
        var shadow = isDarkTheme ? '0 3px 10px rgba(0,0,0,0.6)' : '0 2px 8px rgba(0,0,0,0.18)';

        var groupBadgeHtml = isGroup
          ? '<span style="background:#0066B3;color:#FFFFFF;border-radius:9999px;padding:1px 5px;font-size:9px;font-weight:800;letter-spacing:0.2px;">' + groupCount + '</span>'
          : '';

        var iconBadgeHtml = '';
        if (iconType === 'POSKO') {
          iconBadgeHtml = '<span style="display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:50%;background:#0066B3;margin-right:1px;flex-shrink:0;">' +
            '<svg width="8.5" height="8.5" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>' +
              '<polyline points="9 22 9 12 15 12 15 22"></polyline>' +
            '</svg>' +
          '</span>';
        }

        var html = '<div style="display:inline-flex;align-items:center;gap:4.5px;padding:2.5px 7.5px;border-radius:9999px;background:' + bg + ';border:1.5px solid ' + border + ';box-shadow:' + shadow + ';transform:translate(-50%,-50%);cursor:pointer;user-select:none;white-space:nowrap;">' +
            groupBadgeHtml +
            iconBadgeHtml +
            '<span style="font-size:10.5px;font-weight:800;color:' + textColor + ';letter-spacing:-0.2px;">' + title + '</span>' +
            '<div style="display:inline-flex;align-items:center;gap:3px;background:' + pillBg + ';padding:1px 5.5px;border-radius:9999px;">' +
              '<span style="width:5px;height:5px;border-radius:50%;background-color:' + statusHex + ';flex-shrink:0;"></span>' +
              '<span style="font-weight:800;font-size:10px;color:' + textColor + ';">' + countText + '</span>' +
            '</div>' +
          '</div>';

        return L.divIcon({
          className: 'field-data-micro-card',
          html: html,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });
      }

      function getOfficeMicroCardDivIcon(name, badgeText, officeType, isDarkTheme) {
        var isPosko = officeType === 'POSKO';
        var bg = isPosko ? '#DC2626' : '#00529C';
        var border = isPosko ? '#FCA5A5' : '#38BDF8';
        var shadow = isPosko ? '0 3px 10px rgba(220,38,38,0.4)' : '0 3px 10px rgba(0,82,156,0.4)';

        var iconSvg = isPosko
          ? '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>'
          : '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 13h11"></path><path d="M3 13V3a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10"></path><path d="M6 5h1"></path><path d="M6 8h1"></path><path d="M10 5h1"></path><path d="M10 8h1"></path></svg>';

        var html = '<div style="display:inline-flex;align-items:center;gap:4.5px;padding:2.5px 8px;border-radius:9999px;background:' + bg + ';border:1.5px solid ' + border + ';box-shadow:' + shadow + ';transform:translate(-50%,-50%);cursor:pointer;user-select:none;white-space:nowrap;">' +
            '<span style="display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:50%;background:rgba(255,255,255,0.22);flex-shrink:0;">' +
              iconSvg +
            '</span>' +
            '<span style="font-size:10.5px;font-weight:800;color:#FFFFFF;letter-spacing:-0.1px;">' + name + '</span>' +
            '<span style="background:rgba(255,255,255,0.25);color:#FFFFFF;padding:1px 5.5px;border-radius:9999px;font-size:9.5px;font-weight:700;">' + badgeText + '</span>' +
          '</div>';

        return L.divIcon({
          className: 'field-data-micro-card',
          html: html,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });
      }

      // ======================================================================
      // 3. SMART SPATIAL COLLISION GROUPING (Screen-Space Distance Merging)
      // ======================================================================

      function calculateScreenClusters(items, collisionX, collisionY) {
        var groups = [];
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          if (typeof it.lat !== 'number' || typeof it.lng !== 'number') continue;
          var pt;
          try {
            pt = map.latLngToContainerPoint([it.lat, it.lng]);
          } catch(e) {
            continue;
          }
          var targetGroup = null;
          for (var g = 0; g < groups.length; g++) {
            var dx = Math.abs(groups[g].x - pt.x);
            var dy = Math.abs(groups[g].y - pt.y);
            if (dx < collisionX && dy < collisionY) {
              targetGroup = groups[g];
              break;
            }
          }
          if (targetGroup) {
            targetGroup.items.push(it);
            targetGroup.x = (targetGroup.x * (targetGroup.items.length - 1) + pt.x) / targetGroup.items.length;
            targetGroup.y = (targetGroup.y * (targetGroup.items.length - 1) + pt.y) / targetGroup.items.length;
          } else {
            groups.push({
              x: pt.x,
              y: pt.y,
              items: [it]
            });
          }
        }
        return groups;
      }

      // ======================================================================
      // 4. HIERARCHICAL 4-TIER BREAKDOWN RENDERER (DENGAN POLIGON NYATA)
      // ======================================================================

      var currentPolygonTier = '';

      function renderDynamicPolygonsAndPins() {
        dynamicMarkerGroup.clearLayers();
        officeLayerGroup.clearLayers();

        var z = map.getZoom();

        if (z < 7.5) {
          // ----------------------------------------------------
          // LEVEL 1: NASIONAL (38 Provinsi NKRI Poligon + DPD Pins)
          // ----------------------------------------------------
          if (currentPolygonTier !== 'NATIONAL') {
            polygonLayerGroup.clearLayers();
            if (nationalGeoJson && nationalGeoJson.features) {
              L.geoJSON(nationalGeoJson, {
                style: function() {
                  return {
                    fillColor: '#0284C7',
                    fillOpacity: isDark ? 0.22 : 0.12,
                    weight: 1.5,
                    color: isDark ? '#38BDF8' : '#0284C7',
                    opacity: 0.8
                  };
                },
                onEachFeature: function(feature, layer) {
                  var rawName = feature.properties.PROVINSI || feature.properties.name || '';
                  var cl = clusterMap[rawName.toLowerCase()] || clusterMap[normalizeTerritoryName(rawName)];
                  var mem = memberMap[rawName.toLowerCase()] || memberMap[normalizeTerritoryName(rawName)];

                  var count = filterType === 'MEMBERS'
                    ? (mem ? mem.totalMembers : (cl ? cl.totalCadres : 0))
                    : (cl ? cl.totalVolunteers : 0);
                  var unit = filterType === 'MEMBERS' ? 'Kader' : 'Relawan';

                  layer.bindTooltip(
                    '<div style="text-align: center; line-height: 1.3;">' +
                      '<strong style="color: ' + (isDark ? '#38BDF8' : '#0066B3') + '; font-size: 11px;">' + rawName + '</strong><br/>' +
                      '<span style="color: ' + (isDark ? '#F1F5F9' : '#0F172A') + '; font-size: 10px; font-weight: 700;">' + formatPersonelCount(count, unit) + '</span>' +
                    '</div>',
                    { sticky: true, direction: 'top', className: 'custom-polygon-tooltip' }
                  );

                  layer.on({
                    mouseover: function(e) {
                      e.target.setStyle({ weight: 2.5, fillOpacity: isDark ? 0.38 : 0.25 });
                    },
                    mouseout: function(e) {
                      e.target.setStyle({ weight: 1.5, fillOpacity: isDark ? 0.22 : 0.12 });
                    },
                    click: function(e) {
                      var center = e.target.getBounds().getCenter();
                      map.flyTo(center, 8.5);
                      sendToNative('DRILL_DOWN', 'PROVINCE', {
                        name: rawName,
                        cluster: cl || null,
                        lat: center.lat,
                        lng: center.lng
                      });
                    }
                  });
                }
              }).addTo(polygonLayerGroup);
            }
            currentPolygonTier = 'NATIONAL';
          }

          var provItems = clusters.filter(function(c) { return c.level === 'PROVINSI'; });
          var groups = calculateScreenClusters(provItems, 64, 32);

          groups.forEach(function(g) {
            var unit = filterType === 'MEMBERS' ? 'Kader' : 'Relawan';
            if (g.items.length === 1) {
              var single = g.items[0];
              var count = filterType === 'MEMBERS' ? single.totalCadres : single.totalVolunteers;
              var statusColor = getStatusColor(count);
              var cleanName = single.name.replace(/provinsi/i, '').trim();
              var icon = getFieldMicroCardDivIcon(cleanName, formatPersonelCount(count, unit), statusColor, isDark, false, 0);

              var m = L.marker([single.lat, single.lng], { icon: icon });
              m.on('click', function() {
                map.flyTo([single.lat, single.lng], 8.5);
                sendToNative('DRILL_DOWN', 'PROVINCE', single);
              });
              dynamicMarkerGroup.addLayer(m);
            } else {
              var avgLat = g.items.reduce(function(acc, cur) { return acc + cur.lat; }, 0) / g.items.length;
              var avgLng = g.items.reduce(function(acc, cur) { return acc + cur.lng; }, 0) / g.items.length;
              var totalCount = g.items.reduce(function(acc, cur) {
                return acc + (filterType === 'MEMBERS' ? cur.totalCadres : cur.totalVolunteers);
              }, 0);

              var firstClean = g.items[0].name.replace(/provinsi/i, '').trim();
              var displayName = 'DPD ' + firstClean + ' & +' + (g.items.length - 1);
              var statusColor = getStatusColor(totalCount);

              var icon = getFieldMicroCardDivIcon(displayName, formatPersonelCount(totalCount, unit), statusColor, isDark, true, g.items.length);
              var m = L.marker([avgLat, avgLng], { icon: icon });
              m.on('click', function() {
                map.flyTo([avgLat, avgLng], Math.min(map.getZoom() + 1.8, 12));
              });
              dynamicMarkerGroup.addLayer(m);
            }
          });

        } else if (z >= 7.5 && z < 10.5) {
          // ----------------------------------------------------
          // LEVEL 2: PROVINSI (Batas 27 Kab/Kota Se-Jabar Poligon + DPC Pins)
          // ----------------------------------------------------
          if (currentPolygonTier !== 'PROVINCE') {
            polygonLayerGroup.clearLayers();
            if (regencyGeoJson && regencyGeoJson.features) {
              L.geoJSON(regencyGeoJson, {
                style: function() {
                  return {
                    fillColor: '#0284C7',
                    fillOpacity: isDark ? 0.18 : 0.10,
                    weight: 1.8,
                    color: isDark ? '#38BDF8' : '#0066B3',
                    opacity: 0.85
                  };
                },
                onEachFeature: function(feature, layer) {
                  var kabName = feature.properties.kabupaten || feature.properties.name || '';
                  var cl = clusterMap[kabName.toLowerCase()] || clusterMap[normalizeTerritoryName(kabName)];
                  var count = filterType === 'MEMBERS' ? (cl ? cl.totalCadres : 0) : (cl ? cl.totalVolunteers : 0);
                  var unit = filterType === 'MEMBERS' ? 'Kader' : 'Relawan';

                  layer.bindTooltip(
                    '<div style="text-align: center; line-height: 1.3;">' +
                      '<strong style="color: ' + (isDark ? '#38BDF8' : '#0066B3') + '; font-size: 11px;">' + kabName + '</strong><br/>' +
                      '<span style="color: ' + (isDark ? '#F1F5F9' : '#0F172A') + '; font-size: 10px; font-weight: 700;">' + formatPersonelCount(count, unit) + '</span>' +
                    '</div>',
                    { sticky: true, direction: 'top', className: 'custom-polygon-tooltip' }
                  );

                  layer.on({
                    mouseover: function(e) {
                      e.target.setStyle({ weight: 2.8, fillOpacity: isDark ? 0.35 : 0.22 });
                    },
                    mouseout: function(e) {
                      e.target.setStyle({ weight: 1.8, fillOpacity: isDark ? 0.18 : 0.10 });
                    },
                    click: function(e) {
                      var center = e.target.getBounds().getCenter();
                      map.flyTo(center, 11.2);
                      sendToNative('DRILL_DOWN', 'REGENCY', {
                        name: kabName,
                        cluster: cl || null,
                        lat: center.lat,
                        lng: center.lng
                      });
                    }
                  });
                }
              }).addTo(polygonLayerGroup);
            }
            currentPolygonTier = 'PROVINCE';
          }

          var dpcItems = clusters.filter(function(c) { return c.level === 'KAB_KOTA'; });
          var groups = calculateScreenClusters(dpcItems, 58, 28);

          groups.forEach(function(g) {
            var unit = filterType === 'MEMBERS' ? 'Kader' : 'Relawan';
            if (g.items.length === 1) {
              var single = g.items[0];
              var count = filterType === 'MEMBERS' ? single.totalCadres : single.totalVolunteers;
              var cleanName = single.name.replace('Kota ', '').replace('Kabupaten ', '').replace('Kab. ', '');
              var statusColor = getStatusColor(count);
              var icon = getFieldMicroCardDivIcon(cleanName, formatPersonelCount(count, unit), statusColor, isDark, false, 0);

              var m = L.marker([single.lat, single.lng], { icon: icon });
              m.on('click', function() {
                map.flyTo([single.lat, single.lng], 11.2);
                sendToNative('DRILL_DOWN', 'REGENCY', single);
              });
              dynamicMarkerGroup.addLayer(m);
            } else {
              var avgLat = g.items.reduce(function(acc, cur) { return acc + cur.lat; }, 0) / g.items.length;
              var avgLng = g.items.reduce(function(acc, cur) { return acc + cur.lng; }, 0) / g.items.length;
              var totalCount = g.items.reduce(function(acc, cur) {
                return acc + (filterType === 'MEMBERS' ? cur.totalCadres : cur.totalVolunteers);
              }, 0);

              var firstClean = g.items[0].name.replace('Kota ', '').replace('Kabupaten ', '').replace('Kab. ', '').trim();
              var displayName = 'DPC ' + firstClean + ' & +' + (g.items.length - 1);
              var statusColor = getStatusColor(totalCount);

              var icon = getFieldMicroCardDivIcon(displayName, formatPersonelCount(totalCount, unit), statusColor, isDark, true, g.items.length);
              var m = L.marker([avgLat, avgLng], { icon: icon });
              m.on('click', function() {
                map.flyTo([avgLat, avgLng], Math.min(map.getZoom() + 1.8, 13));
              });
              dynamicMarkerGroup.addLayer(m);
            }
          });

        } else if (z >= 10.5 && z < 12.5) {
          // ----------------------------------------------------
          // LEVEL 3: KABUPATEN/KOTA (Batas 30 Kecamatan Kota Bandung Poligon + PAC Pins)
          // ----------------------------------------------------
          if (currentPolygonTier !== 'REGENCY') {
            polygonLayerGroup.clearLayers();
            if (districtGeoJson && districtGeoJson.features) {
              L.geoJSON(districtGeoJson, {
                style: function() {
                  return {
                    fillColor: '#0284C7',
                    fillOpacity: isDark ? 0.20 : 0.12,
                    weight: 1.8,
                    color: isDark ? '#38BDF8' : '#0066B3',
                    opacity: 0.9
                  };
                },
                onEachFeature: function(feature, layer) {
                  var kecName = feature.properties.kecamatan || feature.properties.name || '';
                  var cl = clusterMap[kecName.toLowerCase()] || clusterMap[normalizeTerritoryName(kecName)];
                  var count = filterType === 'MEMBERS' ? (cl ? cl.totalCadres : 0) : (cl ? cl.totalVolunteers : 0);
                  var unit = filterType === 'MEMBERS' ? 'Kader' : 'Relawan';

                  layer.bindTooltip(
                    '<div style="text-align: center; line-height: 1.3;">' +
                      '<strong style="color: ' + (isDark ? '#38BDF8' : '#0066B3') + '; font-size: 11px;">Kec. ' + kecName + '</strong><br/>' +
                      '<span style="color: ' + (isDark ? '#F1F5F9' : '#0F172A') + '; font-size: 10px; font-weight: 700;">' + formatPersonelCount(count, unit) + '</span>' +
                    '</div>',
                    { sticky: true, direction: 'top', className: 'custom-polygon-tooltip' }
                  );

                  layer.on({
                    mouseover: function(e) {
                      e.target.setStyle({ weight: 2.8, fillOpacity: isDark ? 0.36 : 0.24 });
                    },
                    mouseout: function(e) {
                      e.target.setStyle({ weight: 1.8, fillOpacity: isDark ? 0.20 : 0.12 });
                    },
                    click: function(e) {
                      var center = e.target.getBounds().getCenter();
                      map.flyTo(center, 13.5);
                      sendToNative('DRILL_DOWN', 'DISTRICT', {
                        name: kecName,
                        cluster: cl || null,
                        lat: center.lat,
                        lng: center.lng
                      });
                    }
                  });
                }
              }).addTo(polygonLayerGroup);
            }
            currentPolygonTier = 'REGENCY';
          }

          var pacItems = clusters.filter(function(c) { return c.level === 'KECAMATAN'; });
          var groups = calculateScreenClusters(pacItems, 54, 26);

          groups.forEach(function(g) {
            var unit = filterType === 'MEMBERS' ? 'Kader' : 'Relawan';
            if (g.items.length === 1) {
              var single = g.items[0];
              var count = filterType === 'MEMBERS' ? single.totalCadres : single.totalVolunteers;
              var cleanName = single.name.replace('Kecamatan ', '').replace('Kec. ', '');
              var statusColor = getStatusColor(count);
              var icon = getFieldMicroCardDivIcon(cleanName, formatPersonelCount(count, unit), statusColor, isDark, false, 0);

              var m = L.marker([single.lat, single.lng], { icon: icon });
              m.on('click', function() {
                map.flyTo([single.lat, single.lng], 13.5);
                sendToNative('DRILL_DOWN', 'DISTRICT', single);
              });
              dynamicMarkerGroup.addLayer(m);
            } else {
              var avgLat = g.items.reduce(function(acc, cur) { return acc + cur.lat; }, 0) / g.items.length;
              var avgLng = g.items.reduce(function(acc, cur) { return acc + cur.lng; }, 0) / g.items.length;
              var totalCount = g.items.reduce(function(acc, cur) {
                return acc + (filterType === 'MEMBERS' ? cur.totalCadres : cur.totalVolunteers);
              }, 0);

              var firstClean = g.items[0].name.replace('Kecamatan ', '').replace('Kec. ', '').trim();
              var displayName = 'PAC ' + firstClean + ' & +' + (g.items.length - 1);
              var statusColor = getStatusColor(totalCount);

              var icon = getFieldMicroCardDivIcon(displayName, formatPersonelCount(totalCount, unit), statusColor, isDark, true, g.items.length);
              var m = L.marker([avgLat, avgLng], { icon: icon });
              m.on('click', function() {
                map.flyTo([avgLat, avgLng], Math.min(map.getZoom() + 1.8, 14));
              });
              dynamicMarkerGroup.addLayer(m);
            }
          });

        } else {
          // ----------------------------------------------------
          // LEVEL 4: KECAMATAN & POSKO DESA (Highlight Kecamatan + Posko Desa Pins)
          // ----------------------------------------------------
          if (currentPolygonTier !== 'DISTRICT') {
            polygonLayerGroup.clearLayers();
            if (districtGeoJson && districtGeoJson.features) {
              var hasMatch = districtGeoJson.features.some(function(feature) {
                var kec = normalizeTerritoryName(feature.properties.kecamatan || feature.properties.name || '');
                var target = normalizeTerritoryName(activeDistrictName);
                return target && (kec.includes(target) || target.includes(kec));
              });

              L.geoJSON(districtGeoJson, {
                filter: function(feature) {
                  if (!hasMatch) return true;
                  var kec = normalizeTerritoryName(feature.properties.kecamatan || feature.properties.name || '');
                  var target = normalizeTerritoryName(activeDistrictName);
                  return kec.includes(target) || target.includes(kec);
                },
                style: function() {
                  return {
                    fillColor: '#0284C7',
                    fillOpacity: isDark ? 0.16 : 0.08,
                    weight: hasMatch ? 2.8 : 1.8,
                    color: '#0066B3',
                    opacity: 0.95
                  };
                }
              }).addTo(polygonLayerGroup);
            }
            currentPolygonTier = 'DISTRICT';
          }

          // ----------------------------------------------------
          // LEVEL 4: KECAMATAN & POSKO DESA (Smart Anti-Collision Multi-Pin Layout)
          // ----------------------------------------------------
          var placedBoxes = [];

          function findCollisionFreePoint(lat, lng, approxWidth, approxHeight) {
            var basePt;
            try {
              basePt = map.latLngToContainerPoint([lat, lng]);
            } catch(e) {
              return [lat, lng];
            }

            // Offset candidates: try centered, then staggered left/right/top/bottom
            var candidates = [
              [0, 0],
              [-30, -16],
              [32, 16],
              [32, -16],
              [-30, 16],
              [0, -28],
              [0, 28],
              [-48, 0],
              [48, 0],
              [-42, -22],
              [42, -22],
              [-42, 22],
              [42, 22]
            ];

            var bestCand = candidates[0];
            var minOverlapArea = Infinity;

            for (var c = 0; c < candidates.length; c++) {
              var cand = candidates[c];
              var cx = basePt.x + cand[0];
              var cy = basePt.y + cand[1];
              var totalOverlap = 0;

              for (var p = 0; p < placedBoxes.length; p++) {
                var pb = placedBoxes[p];
                var ox = Math.max(0, (approxWidth / 2 + pb.w / 2) - Math.abs(cx - pb.x));
                var oy = Math.max(0, (approxHeight / 2 + pb.h / 2) - Math.abs(cy - pb.y));
                if (ox > 0 && oy > 0) {
                  totalOverlap += (ox * oy);
                }
              }

              if (totalOverlap === 0) {
                bestCand = cand;
                minOverlapArea = 0;
                break;
              }
              if (totalOverlap < minOverlapArea) {
                minOverlapArea = totalOverlap;
                bestCand = cand;
              }
            }

            var finalPt = L.point(basePt.x + bestCand[0], basePt.y + bestCand[1]);
            placedBoxes.push({
              x: finalPt.x,
              y: finalPt.y,
              w: approxWidth + 8,
              h: approxHeight + 6
            });

            try {
              return map.containerPointToLatLng(finalPt);
            } catch(e) {
              return [lat, lng];
            }
          }

          // 1. Render Kantor Sekretariat & Posko Resmi PAN (Hanya yang relevan dengan Kecamatan Aktif)
          var normTarget = normalizeTerritoryName(activeDistrictName);
          var districtOffices = offices.filter(function(off) {
            if (!normTarget) return false;
            var n = normalizeTerritoryName(off.namaKantor || '');
            var a = normalizeTerritoryName(off.alamat || '');
            var w = normalizeTerritoryName(off.wilayah || '');
            return n.includes(normTarget) || a.includes(normTarget) || w.includes(normTarget);
          });

          districtOffices.forEach(function(off) {
            var isPosko = off.tingkat === 'POSKO';
            if (isPosko && filterType === 'MEMBERS') return;
            if (!isPosko && filterType === 'VOLUNTEERS') return;

            var cleanOfficeName = isPosko
              ? off.namaKantor.replace(/posko relawan pan /i, 'Posko ').trim()
              : ('DPC ' + activeDistrictName);
            var badgeText = isPosko ? 'Posko' : 'Kantor';

            var icon = getOfficeMicroCardDivIcon(cleanOfficeName, badgeText, off.tingkat, isDark);
            var pos = findCollisionFreePoint(off.lat, off.lng, 105, 24);

            var m = L.marker(pos, { icon: icon, zIndexOffset: 900 });
            m.bindTooltip(
              '<div style="text-align: center; line-height: 1.2;">' +
                '<strong style="color:' + (isDark ? '#38BDF8' : '#0066B3') + '; font-size: 10.5px;">' + off.namaKantor + '</strong><br/>' +
                '<span style="color:' + (isDark ? '#94A3B8' : '#64748B') + '; font-size: 9.5px;">' + (isPosko ? 'Posko Lapangan' : 'Kantor Sekretariat DPC') + '</span>' +
              '</div>',
              { direction: 'top', className: 'custom-polygon-tooltip' }
            );
            m.on('click', function() {
              sendToNative('MARKER_CLICK', 'OFFICE', off);
            });
            officeLayerGroup.addLayer(m);
          });

          // 2. Render Posko Desa / Kelurahan Pins (Jumlah Relawan/Kader Riil, Tanpa Redundansi Nama)
          poskoDesas.forEach(function(desa) {
            var count = desa.registeredVolunteers;
            var unit = filterType === 'MEMBERS' ? 'Kader' : 'Relawan';
            var statusColor = '#059669'; // Emerald Green Siaga
            var cleanVillageName = desa.villageName.replace(/^kelurahan\s+/i, '').replace(/^desa\s+/i, '').trim();

            var icon = getFieldMicroCardDivIcon(cleanVillageName, count + ' ' + unit, statusColor, isDark, false, 0, 'POSKO');
            var pos = findCollisionFreePoint(desa.lat, desa.lng, 95, 24);

            var m = L.marker(pos, { icon: icon, zIndexOffset: 500 });
            m.bindTooltip(
              '<div style="text-align: center; line-height: 1.2;">' +
                '<strong style="color:' + (isDark ? '#38BDF8' : '#0066B3') + '; font-size: 10.5px;">' + desa.villageName + '</strong><br/>' +
                '<span style="color:' + (isDark ? '#94A3B8' : '#64748B') + '; font-size: 9.5px;">' + count + ' ' + unit + ' Siaga</span>' +
              '</div>',
              { direction: 'top', className: 'custom-polygon-tooltip' }
            );
            m.on('click', function() {
              sendToNative('MARKER_CLICK', 'POSKO_DESA', desa);
            });
            dynamicMarkerGroup.addLayer(m);
          });
        }
      }

      // Inisialisasi Pertama
      renderDynamicPolygonsAndPins();

      // Render Ulang Dinamis Saat Peta Bergeser / Zoom Berubah
      map.on('moveend', function() {
        renderDynamicPolygonsAndPins();
        var z = map.getZoom();
        var c = map.getCenter();
        sendToNative('MAP_VIEWPORT_CHANGE', 'VIEWPORT', {
          zoom: z,
          lat: c.lat,
          lng: c.lng
        });
      });

      map.on('resize', function() {
        renderDynamicPolygonsAndPins();
      });

      // Expose flyTo Global untuk Navigasi Cepat
      window.panFlyTo = function(lat, lng, zoomLvl) {
        map.flyTo([lat, lng], zoomLvl, { duration: 1.2 });
      };

      // Expose Dynamic Polygon Updates (Adopsi GeoJSON Seluruh Indonesia)
      window.panUpdateRegencyPolygons = function(newGeoJson, provinceName) {
        try {
          if (!newGeoJson) return;
          regencyGeoJson = newGeoJson;
          currentPolygonTier = ''; // Reset cache tier agar render ulang poligon
          renderDynamicPolygonsAndPins();
        } catch (e) {
          console.warn('[panUpdateRegencyPolygons error]', e);
        }
      };

      window.panUpdateDistrictPolygons = function(newGeoJson, districtName) {
        try {
          if (!newGeoJson) return;
          districtGeoJson = newGeoJson;
          if (districtName) activeDistrictName = districtName;
          currentPolygonTier = ''; // Reset cache tier agar render ulang poligon
          renderDynamicPolygonsAndPins();
        } catch (e) {
          console.warn('[panUpdateDistrictPolygons error]', e);
        }
      };

    } catch(err) {
      console.error(err);
      sendToNative('WEBVIEW_ERROR', 'INIT_EXCEPTION', {
        message: err ? String(err.message || err) : 'Unknown initialization error',
        stack: err && err.stack ? String(err.stack) : ''
      });
    }
  </script>
</body>
</html>`;
}
