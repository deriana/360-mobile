/**
 * Generator HTML Leaflet untuk React Native WebView (Sandboxed & Offline Resilient)
 * Menerapkan Smart Spatial Collision Grouping & Breakdown Bertahap 4-Tier Ala Web Admin
 * (Nasional > Provinsi > Kab/Kota > Kecamatan & Posko Desa)
 */
import { PoskoDesaItem, PoskoLocation, RegionalCluster } from '../data/gisRegionalData';
import { KantorSekretariat } from '../data/simpan';
import { PanMemberCluster } from '../data/panMemberDistributionData';
import { GisLayerMode } from '../services/gisDistributionService';

export interface BuildMapOptions {
  centerLat: number;
  centerLng: number;
  zoom: number;
  clusters: RegionalCluster[];
  poskos: PoskoLocation[];
  poskoDesas?: PoskoDesaItem[];
  offices?: KantorSekretariat[];
  memberClusters?: PanMemberCluster[];
  geoJsonData?: any;
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
  geoJsonData = null,
  filterType,
  isDark,
}: BuildMapOptions): string {
  const clustersJson = JSON.stringify(clusters);
  const poskosJson = JSON.stringify(poskos);
  const poskoDesasJson = JSON.stringify(poskoDesas);
  const officesJson = JSON.stringify(offices);
  const membersJson = JSON.stringify(memberClusters);
  const geoJson = JSON.stringify(geoJsonData);

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
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body, #map { width: 100%; height: 100%; background: ${bgColor}; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .leaflet-control-attribution { display: none !important; }
    .leaflet-control-zoom { display: none !important; }
    
    /* Clean Tooltip on Province Polygons */
    .custom-polygon-tooltip {
      background: rgba(15, 23, 42, 0.92) !important;
      color: #FFFFFF !important;
      border: 1px solid rgba(56, 189, 248, 0.6) !important;
      border-radius: 8px !important;
      padding: 4px 8px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      font-size: 11px !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3) !important;
    }
    .leaflet-tooltip-top.custom-polygon-tooltip:before {
      border-top-color: rgba(15, 23, 42, 0.92) !important;
    }

    /* Pin Posko Relawan Lapangan */
    .posko-pin {
      background: #E60012;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 10px rgba(230,0,18,0.45);
      cursor: pointer;
      position: relative;
    }
    .posko-pin.sub {
      background: #D97706;
      box-shadow: 0 3px 10px rgba(217,119,6,0.45);
    }
    .posko-pin::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid #E60012;
      animation: pulseRipple 2s ease-out infinite;
    }
    @keyframes pulseRipple {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(2.2); opacity: 0; }
    }

    /* Pin Kantor Sekretariat Resmi PAN */
    .office-pin {
      background: #00529C;
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: 2px solid #F59E0B;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 10px rgba(0,82,156,0.45);
      cursor: pointer;
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
    .volunteer-percent-badge-marker {
      background: transparent !important;
      border: none !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
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
        maxBoundsViscosity: 1.0,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      function sendToNative(type, category, data) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: type,
            category: category,
            data: data
          }));
        }
      }

      var isDark = ${isDark};
      var filterType = '${filterType}';
      var clusters = ${clustersJson};
      var poskos = ${poskosJson};
      var poskoDesas = ${poskoDesasJson};
      var offices = ${officesJson};
      var memberClusters = ${membersJson};
      var rawGeoJson = ${geoJson};

      // Layer Groups
      var polygonLayerGroup = L.layerGroup().addTo(map);
      var dynamicMarkerGroup = L.layerGroup().addTo(map);
      var poskoLayerGroup = L.layerGroup().addTo(map);
      var officeLayerGroup = L.layerGroup().addTo(map);

      // Map data helper
      var clusterMap = {};
      clusters.forEach(function(c) {
        clusterMap[c.name.toLowerCase()] = c;
      });

      var memberMap = {};
      memberClusters.forEach(function(m) {
        memberMap[m.name.toLowerCase()] = m;
      });

      // 1. Render Poligon GeoJSON 38 Provinsi
      if (rawGeoJson && rawGeoJson.features) {
        L.geoJSON(rawGeoJson, {
          style: function(feature) {
            var provName = (feature.properties.PROVINSI || feature.properties.name || '').toLowerCase();
            var cl = clusterMap[provName];
            var mem = memberMap[provName];

            var fillColor = '#0284C7';
            if (filterType === 'MEMBERS' && mem) {
              fillColor = mem.achievementPct >= 95 ? '#1D4ED8' : '#0284C7';
            } else if (cl) {
              if (cl.status === 'SURPLUS') fillColor = '#1D4ED8';
              else if (cl.status === 'TARGET_MET') fillColor = '#0284C7';
              else if (cl.status === 'DEFICIT') fillColor = '#D97706';
              else fillColor = '#0284C7';
            }

            return {
              fillColor: fillColor,
              fillOpacity: isDark ? 0.24 : 0.15,
              weight: 1.5,
              color: isDark ? '#38BDF8' : '#0284C7',
              opacity: 0.8
            };
          },
          onEachFeature: function(feature, layer) {
            var rawName = feature.properties.PROVINSI || feature.properties.name || '';
            var normName = rawName.toLowerCase();
            var cl = clusterMap[normName];
            var mem = memberMap[normName];

            var countText = '';
            if (filterType === 'MEMBERS') {
              var count = mem ? mem.totalMembers : (cl ? cl.totalCadres : 0);
              countText = count > 1000 ? (count / 1000).toFixed(1) + 'k Kader' : (count > 0 ? count + ' Kader' : '');
            } else if (filterType === 'VOLUNTEERS') {
              var count = cl ? cl.totalVolunteers : 0;
              countText = count > 1000 ? (count / 1000).toFixed(1) + 'k Relawan' : (count > 0 ? count + ' Relawan' : '');
            } else {
              var total = (cl ? cl.totalCadres + cl.totalVolunteers : (mem ? mem.totalMembers : 0));
              countText = total > 1000 ? (total / 1000).toFixed(1) + 'k Personel' : (total > 0 ? total + ' Personel' : '');
            }

            if (countText) {
              layer.bindTooltip(
                '<div style="text-align: center; line-height: 1.3;">' +
                  '<strong style="color: #38BDF8; font-size: 11px;">' + rawName + '</strong><br/>' +
                  '<span style="color: #F1F5F9; font-size: 10px; font-weight: 600;">' + countText + '</span>' +
                '</div>',
                { sticky: true, direction: 'top', className: 'custom-polygon-tooltip' }
              );
            }

            layer.on({
              mouseover: function(e) {
                e.target.setStyle({ weight: 2.5, fillOpacity: isDark ? 0.42 : 0.3 });
              },
              mouseout: function(e) {
                e.target.setStyle({ weight: 1.5, fillOpacity: isDark ? 0.24 : 0.15 });
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

      // ======================================================================
      // 2. GENERATOR DIVICON ALAP PERSIS WEB ADMIN (indonesia-map.tsx)
      // ======================================================================

      function getStatusColor(pct) {
        if (pct >= 100) return '#2563EB'; // PAN Blue / Optimal
        if (pct >= 80) return '#0284C7';  // Sky Blue / Mendekati
        if (pct >= 60) return '#F59E0B';  // Amber / Perlu Akselerasi
        return '#EF4444';                // Red / Defisit
      }

      function getVolunteerPercentageDivIcon(pctText, statusHex, isDarkTheme, regionName) {
        var bgStyle = isDarkTheme
          ? 'background:rgba(15,23,42,0.92);border:1px solid rgba(71,85,105,0.7);box-shadow:0 2px 6px rgba(0,0,0,0.45);color:#f8fafc;'
          : 'background:rgba(255,255,255,0.95);border:1px solid rgba(203,213,225,0.9);box-shadow:0 1px 4px rgba(0,0,0,0.12);color:#0f172a;';

        var titleColor = isDarkTheme ? '#ffffff' : '#0f172a';
        var dotShadow = 'box-shadow:0 0 0 1px rgba(255,255,255,0.9), 0 0 4px ' + statusHex + ';';

        var html = regionName
          ? '<div style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;transform:translate(-50%,-50%);pointer-events:auto;cursor:pointer;user-select:none;">' +
              '<span style="font-size:9.5px;font-weight:700;color:' + titleColor + ';text-shadow:0 1px 2px rgba(0,0,0,0.7);margin-bottom:2px;white-space:nowrap;">' + regionName + '</span>' +
              '<div style="display:inline-flex;align-items:center;justify-content:center;gap:3.5px;padding:2px 6.5px;border-radius:9999px;' + bgStyle + 'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:800;font-size:10px;line-height:1.1;white-space:nowrap;">' +
                '<span style="width:5.5px;height:5.5px;border-radius:50%;background-color:' + statusHex + ';' + dotShadow + 'flex-shrink:0;"></span>' +
                '<span>' + pctText + '</span>' +
              '</div>' +
            '</div>'
          : '<div style="display:inline-flex;align-items:center;justify-content:center;gap:3.5px;padding:2px 7px;border-radius:9999px;' + bgStyle + 'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:800;font-size:10.5px;line-height:1.1;white-space:nowrap;transform:translate(-50%,-50%);pointer-events:auto;cursor:pointer;user-select:none;">' +
              '<span style="width:6px;height:6px;border-radius:50%;background-color:' + statusHex + ';' + dotShadow + 'flex-shrink:0;"></span>' +
              '<span>' + pctText + '</span>' +
            '</div>';

        return L.divIcon({
          className: 'volunteer-percent-badge-marker',
          html: html,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });
      }

      function getGroupedPercentageDivIcon(count, percentText, statusHex, isDarkTheme, displayName) {
        var bgStyle = isDarkTheme
          ? 'background:rgba(15,23,42,0.92);border:1.5px solid rgba(59,130,246,0.8);box-shadow:0 4px 12px rgba(0,0,0,0.5);color:#f8fafc;'
          : 'background:rgba(255,255,255,0.96);border:1.5px solid rgba(37,99,235,0.7);box-shadow:0 3px 10px rgba(0,0,0,0.18);color:#0f172a;';

        var titleColor = isDarkTheme ? '#93c5fd' : '#1d4ed8';

        var html = '<div style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;transform:translate(-50%,-50%);cursor:pointer;user-select:none;">' +
            '<span style="font-size:9px;font-weight:800;color:' + titleColor + ';text-shadow:0 1px 2px rgba(0,0,0,0.8);margin-bottom:2px;white-space:nowrap;">' +
              displayName +
            '</span>' +
            '<div style="display:inline-flex;align-items:center;justify-content:center;gap:3.5px;padding:2px 7px;border-radius:9999px;' + bgStyle + 'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:900;font-size:10px;line-height:1.1;white-space:nowrap;">' +
              '<span style="background:#2563eb;color:#ffffff;border-radius:9999px;padding:0.5px 4.5px;font-size:8px;font-weight:900;">' +
                count +
              '</span>' +
              '<span style="width:5.5px;height:5.5px;border-radius:50%;background-color:' + statusHex + ';flex-shrink:0;"></span>' +
              '<span>' + percentText + '</span>' +
            '</div>' +
          '</div>';

        return L.divIcon({
          className: 'volunteer-percent-badge-marker',
          html: html,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });
      }

      // ======================================================================
      // 3. SMART SPATIAL COLLISION GROUPING (Screen-Space Collision Detection)
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
      // 4. HIERARCHICAL 4-TIER BREAKDOWN RENDERER
      // ======================================================================

      function renderDynamicPins() {
        dynamicMarkerGroup.clearLayers();
        poskoLayerGroup.clearLayers();
        officeLayerGroup.clearLayers();

        var z = map.getZoom();

        if (z < 7.5) {
          // ----------------------------------------------------
          // LEVEL 1: NASIONAL (DPD Pins + Smart Collision Grouping)
          // ----------------------------------------------------
          if (!map.hasLayer(polygonLayerGroup)) map.addLayer(polygonLayerGroup);

          var provItems = clusters.filter(function(c) { return c.level === 'PROVINSI'; });
          var groups = calculateScreenClusters(provItems, 64, 32);

          groups.forEach(function(g) {
            if (g.items.length === 1) {
              var single = g.items[0];
              var pct = single.targetVolunteers > 0 ? (single.totalVolunteers / single.targetVolunteers) * 100 : 100;
              var statusColor = getStatusColor(pct);
              var icon = getVolunteerPercentageDivIcon(pct.toFixed(0) + '%', statusColor, isDark);

              var m = L.marker([single.lat, single.lng], { icon: icon });
              m.on('click', function() {
                map.flyTo([single.lat, single.lng], 8.5);
                sendToNative('DRILL_DOWN', 'PROVINCE', single);
              });
              dynamicMarkerGroup.addLayer(m);
            } else {
              // Group of DPDs (e.g. DPD Riau & +2)
              var avgLat = g.items.reduce(function(acc, cur) { return acc + cur.lat; }, 0) / g.items.length;
              var avgLng = g.items.reduce(function(acc, cur) { return acc + cur.lng; }, 0) / g.items.length;
              var avgPct = g.items.reduce(function(acc, cur) {
                var p = cur.targetVolunteers > 0 ? (cur.totalVolunteers / cur.targetVolunteers) * 100 : 100;
                return acc + p;
              }, 0) / g.items.length;

              var firstClean = g.items[0].name.replace(/provinsi/i, '').trim();
              var displayName = 'DPD ' + firstClean + ' & +' + (g.items.length - 1);
              var statusColor = getStatusColor(avgPct);

              var icon = getGroupedPercentageDivIcon(g.items.length, avgPct.toFixed(1) + '%', statusColor, isDark, displayName);
              var m = L.marker([avgLat, avgLng], { icon: icon });
              m.on('click', function() {
                map.flyTo([avgLat, avgLng], Math.min(map.getZoom() + 1.8, 12));
              });
              dynamicMarkerGroup.addLayer(m);
            }
          });

        } else if (z >= 7.5 && z < 10.5) {
          // ----------------------------------------------------
          // LEVEL 2: PROVINSI (DPC Kab/Kota Pins + Grouping)
          // ----------------------------------------------------
          if (map.hasLayer(polygonLayerGroup)) map.removeLayer(polygonLayerGroup);

          var dpcItems = clusters.filter(function(c) { return c.level === 'KAB_KOTA'; });
          var groups = calculateScreenClusters(dpcItems, 58, 28);

          groups.forEach(function(g) {
            if (g.items.length === 1) {
              var single = g.items[0];
              var pct = single.targetVolunteers > 0 ? (single.totalVolunteers / single.targetVolunteers) * 100 : 100;
              var cleanName = single.name.replace('Kota ', '').replace('Kabupaten ', '').replace('Kab. ', '');
              var statusColor = getStatusColor(pct);
              var icon = getVolunteerPercentageDivIcon(pct.toFixed(0) + '%', statusColor, isDark, cleanName);

              var m = L.marker([single.lat, single.lng], { icon: icon });
              m.on('click', function() {
                map.flyTo([single.lat, single.lng], 11.2);
                sendToNative('DRILL_DOWN', 'REGENCY', single);
              });
              dynamicMarkerGroup.addLayer(m);
            } else {
              var avgLat = g.items.reduce(function(acc, cur) { return acc + cur.lat; }, 0) / g.items.length;
              var avgLng = g.items.reduce(function(acc, cur) { return acc + cur.lng; }, 0) / g.items.length;
              var avgPct = g.items.reduce(function(acc, cur) {
                var p = cur.targetVolunteers > 0 ? (cur.totalVolunteers / cur.targetVolunteers) * 100 : 100;
                return acc + p;
              }, 0) / g.items.length;

              var firstClean = g.items[0].name.replace('Kota ', '').replace('Kabupaten ', '').replace('Kab. ', '').trim();
              var displayName = 'DPC ' + firstClean + ' & +' + (g.items.length - 1);
              var statusColor = getStatusColor(avgPct);

              var icon = getGroupedPercentageDivIcon(g.items.length, avgPct.toFixed(1) + '%', statusColor, isDark, displayName);
              var m = L.marker([avgLat, avgLng], { icon: icon });
              m.on('click', function() {
                map.flyTo([avgLat, avgLng], Math.min(map.getZoom() + 1.8, 13));
              });
              dynamicMarkerGroup.addLayer(m);
            }
          });

        } else if (z >= 10.5 && z < 12.5) {
          // ----------------------------------------------------
          // LEVEL 3: KABUPATEN/KOTA (PAC Kecamatan Pins + Grouping)
          // ----------------------------------------------------
          if (map.hasLayer(polygonLayerGroup)) map.removeLayer(polygonLayerGroup);

          var pacItems = clusters.filter(function(c) { return c.level === 'KECAMATAN'; });
          var groups = calculateScreenClusters(pacItems, 54, 26);

          groups.forEach(function(g) {
            if (g.items.length === 1) {
              var single = g.items[0];
              var pct = single.targetVolunteers > 0 ? (single.totalVolunteers / single.targetVolunteers) * 100 : 100;
              var cleanName = single.name.replace('Kecamatan ', '').replace('Kec. ', '');
              var statusColor = getStatusColor(pct);
              var icon = getVolunteerPercentageDivIcon(pct.toFixed(0) + '%', statusColor, isDark, cleanName);

              var m = L.marker([single.lat, single.lng], { icon: icon });
              m.on('click', function() {
                map.flyTo([single.lat, single.lng], 13.5);
                sendToNative('DRILL_DOWN', 'DISTRICT', single);
              });
              dynamicMarkerGroup.addLayer(m);
            } else {
              var avgLat = g.items.reduce(function(acc, cur) { return acc + cur.lat; }, 0) / g.items.length;
              var avgLng = g.items.reduce(function(acc, cur) { return acc + cur.lng; }, 0) / g.items.length;
              var avgPct = g.items.reduce(function(acc, cur) {
                var p = cur.targetVolunteers > 0 ? (cur.totalVolunteers / cur.targetVolunteers) * 100 : 100;
                return acc + p;
              }, 0) / g.items.length;

              var firstClean = g.items[0].name.replace('Kecamatan ', '').replace('Kec. ', '').trim();
              var displayName = 'PAC ' + firstClean + ' & +' + (g.items.length - 1);
              var statusColor = getStatusColor(avgPct);

              var icon = getGroupedPercentageDivIcon(g.items.length, avgPct.toFixed(1) + '%', statusColor, isDark, displayName);
              var m = L.marker([avgLat, avgLng], { icon: icon });
              m.on('click', function() {
                map.flyTo([avgLat, avgLng], Math.min(map.getZoom() + 1.8, 14));
              });
              dynamicMarkerGroup.addLayer(m);
            }
          });

        } else {
          // ----------------------------------------------------
          // LEVEL 4: KECAMATAN & POSKO DESA (Detail Mikro Lapangan)
          // ----------------------------------------------------
          if (map.hasLayer(polygonLayerGroup)) map.removeLayer(polygonLayerGroup);

          // Render Posko Desa (Desa Karanganyar, Desa Sindangasih, dll.)
          poskoDesas.forEach(function(desa) {
            var statusColor = getStatusColor(desa.achievementPct);
            var icon = getVolunteerPercentageDivIcon(desa.achievementPct.toFixed(0) + '%', statusColor, isDark, desa.villageName);

            var m = L.marker([desa.lat, desa.lng], { icon: icon });
            m.on('click', function() {
              sendToNative('MARKER_CLICK', 'POSKO_DESA', desa);
            });
            dynamicMarkerGroup.addLayer(m);
          });

          // Render Posko Relawan Lapangan (dengan ripple)
          if (filterType !== 'MEMBERS') {
            poskos.forEach(function(p) {
              var isMain = p.isMainCommandCenter;
              var iconHtml = '<div class="posko-pin ' + (isMain ? '' : 'sub') + '">' +
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15" stroke="#FFFFFF" stroke-width="2.5"></line></svg>' +
                '</div>';

              var m = L.marker([p.lat, p.lng], {
                icon: L.divIcon({ className: '', html: iconHtml, iconSize: [28, 28], iconAnchor: [14, 14] })
              });
              m.on('click', function() {
                sendToNative('MARKER_CLICK', 'POSKO', p);
              });
              poskoLayerGroup.addLayer(m);
            });
          }

          // Render Kantor Sekretariat Resmi
          if (filterType !== 'VOLUNTEERS') {
            offices.forEach(function(off) {
              var officeIconHtml = '<div class="office-pin">' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2"><path d="M3 21h18"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path><path d="M9 7h1"></path><path d="M9 11h1"></path><path d="M14 7h1"></path><path d="M14 11h1"></path></svg>' +
                '</div>';

              var m = L.marker([off.lat, off.lng], {
                icon: L.divIcon({ className: '', html: officeIconHtml, iconSize: [30, 30], iconAnchor: [15, 15] })
              });
              m.on('click', function() {
                sendToNative('MARKER_CLICK', 'OFFICE', off);
              });
              officeLayerGroup.addLayer(m);
            });
          }
        }
      }

      // Initial Render
      renderDynamicPins();

      // Update pins on zoom or move
      map.on('moveend', function() {
        renderDynamicPins();
        var z = map.getZoom();
        var c = map.getCenter();
        sendToNative('MAP_VIEWPORT_CHANGE', 'VIEWPORT', {
          zoom: z,
          lat: c.lat,
          lng: c.lng
        });
      });

      // Expose flyTo global
      window.panFlyTo = function(lat, lng, zoomLvl) {
        map.flyTo([lat, lng], zoomLvl, { duration: 1.2 });
      };

    } catch(err) {
      console.error(err);
    }
  </script>
</body>
</html>`;
}
