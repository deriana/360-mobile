/**
 * Layanan Data Spasial & Distribusi Wilayah Relawan & Anggota PAN
 * Single Source of Truth untuk Mobile Map Sebaran
 */
import { Role } from '../types';
import {
  GIS_NATIONAL_SUMMARY,
  GIS_POSKO_LOCATIONS,
  GIS_REGIONAL_CLUSTERS,
  GisNationalSummary,
  PoskoDesaItem,
  PoskoLocation,
  RegionalCluster,
  RegionalLeaderInfo,
  getLeaderInfo,
  getPoskoDesaByDistrict,
  loadGisDataFromCache,
  saveGisDataToCache,
} from '../data/gisRegionalData';
import {
  PAN_MEMBER_CLUSTERS,
  PAN_MEMBER_NATIONAL_SUMMARY,
  PanMemberCluster,
  PanMemberNationalSummary,
} from '../data/panMemberDistributionData';
import { KANTOR_SEKRETARIAT_LIST, KantorSekretariat } from '../data/simpan';

export type GisLayerMode = 'ALL' | 'MEMBERS' | 'VOLUNTEERS' | 'WITNESSES';

export interface FourPillarsMetric {
  targetAmount: number;
  activeCount: number;
  unregisteredCount: number;
  achievementPercent: number;
  verifiedCount: number;
  verificationRatePercent: number;
  gap: number;
  isSurplus: boolean;
  statusLabel: string;
  statusTone: 'success' | 'info' | 'warning' | 'danger';
}

export interface MapCameraFocus {
  lat: number;
  lng: number;
  zoom: number;
  label: string;
  scopeLevel: 'NATIONAL' | 'PROVINCE' | 'REGENCY' | 'DISTRICT' | 'POSKO';
}

class GisDistributionService {
  /**
   * Mengambil data relawan dengan strategi cache-first lokal
   */
  async getRegionalClusters(): Promise<RegionalCluster[]> {
    const cached = await loadGisDataFromCache();
    if (cached && cached.clusters && cached.clusters.length > 0) {
      return cached.clusters;
    }
    // Fallback seed data & simpan ke cache lokal
    await saveGisDataToCache(GIS_REGIONAL_CLUSTERS, GIS_POSKO_LOCATIONS, GIS_NATIONAL_SUMMARY);
    return GIS_REGIONAL_CLUSTERS;
  }

  /**
   * Mengambil titik posko pemenangan dengan strategi cache-first lokal
   */
  async getPoskoLocations(): Promise<PoskoLocation[]> {
    const cached = await loadGisDataFromCache();
    if (cached && cached.poskos && cached.poskos.length > 0) {
      return cached.poskos;
    }
    return GIS_POSKO_LOCATIONS;
  }

  /**
   * Mengambil data agregat resmi anggota simPAN
   */
  getPanMemberClusters(): PanMemberCluster[] {
    return PAN_MEMBER_CLUSTERS;
  }

  /**
   * Mengambil ringkasan nasional anggota resmi
   */
  getPanMemberNationalSummary(): PanMemberNationalSummary {
    return PAN_MEMBER_NATIONAL_SUMMARY;
  }

  /**
   * Mengambil kantor sekretariat resmi PAN (DPP, DPW, DPD, DPC)
   */
  getOfficialOffices(): KantorSekretariat[] {
    return KANTOR_SEKRETARIAT_LIST;
  }

  /**
   * Mengambil daftar Posko Desa / Kelurahan (Level 4)
   */
  getPoskoDesaList(districtQuery?: string): PoskoDesaItem[] {
    return getPoskoDesaByDistrict(districtQuery);
  }

  /**
   * Mengambil profil pimpinan/koordinator wilayah (DPD, DPC, PAC)
   */
  getRegionalLeader(regionName?: string): RegionalLeaderInfo | null {
    return getLeaderInfo(regionName);
  }

  /**
   * Menentukan pusat fokus kamera peta berdasarkan penugasan role akun
   */
  getCameraFocusByRole(role?: Role): MapCameraFocus {
    switch (role) {
      case 'FIELD_COORDINATOR':
        // Korlap Kecamatan Coblong
        return {
          lat: -6.8833,
          lng: 107.6167,
          zoom: 13.2,
          label: 'Kecamatan Coblong (Wilayah Tugas Korlap)',
          scopeLevel: 'DISTRICT',
        };
      case 'TPS_COORDINATOR':
        // Koordinator 6 TPS Kelurahan Dago
        return {
          lat: -6.8845,
          lng: 107.6152,
          zoom: 14.5,
          label: 'Kelurahan Dago (Kluster 6 TPS Dampingan)',
          scopeLevel: 'POSKO',
        };
      case 'CALEG':
      case 'CALEG_OPS':
        // Caleg DPR-RI Dapil Jabar I (Kota Bandung & Cimahi)
        return {
          lat: -6.9147,
          lng: 107.6098,
          zoom: 11.2,
          label: 'Dapil Jawa Barat I (Kota Bandung & Cimahi)',
          scopeLevel: 'REGENCY',
        };
      case 'DPW':
        return {
          lat: -6.9175,
          lng: 107.6191,
          zoom: 8.0,
          label: 'Provinsi Jawa Barat (DPW)',
          scopeLevel: 'PROVINCE',
        };
      case 'DPP':
        return {
          lat: -2.5489,
          lng: 118.0149,
          zoom: 5.0,
          label: 'Seluruh Wilayah NKRI (Nasional)',
          scopeLevel: 'NATIONAL',
        };
      case 'MEMBER':
      case 'KADER_ANGGOTA':
      case 'VOLUNTEER':
      case 'RELAWAN':
      default:
        // Default domisili kader / relawan di Kota Bandung (Coblong)
        return {
          lat: -6.8833,
          lng: 107.6167,
          zoom: 12.5,
          label: 'Basis Wilayah Bandung (Coblong)',
          scopeLevel: 'DISTRICT',
        };
    }
  }

  /**
   * Menghitung 4 Pilar Metrik Wilayah (Diadopsi dari Web Admin)
   */
  calculateFourPillars(
    cluster: RegionalCluster,
    layerMode: GisLayerMode = 'ALL'
  ): FourPillarsMetric {
    if (layerMode === 'MEMBERS') {
      const memberCluster = PAN_MEMBER_CLUSTERS.find(
        (m) => m.name.toLowerCase() === cluster.name.toLowerCase()
      );
      const target = memberCluster?.targetMembers || cluster.totalCadres;
      const active = memberCluster?.totalMembers || cluster.totalCadres;
      const verified = memberCluster?.verifiedKta || Math.round(active * 0.95);
      const gap = active - target;
      const pct = target > 0 ? (active / target) * 100 : 100;

      return {
        targetAmount: target,
        activeCount: active,
        unregisteredCount: Math.max(0, target - active),
        achievementPercent: Number(pct.toFixed(1)),
        verifiedCount: verified,
        verificationRatePercent: Number(((verified / Math.max(active, 1)) * 100).toFixed(1)),
        gap,
        isSurplus: gap >= 0,
        statusLabel: gap >= 0 ? 'Surplus Kader' : 'Akselerasi KTA',
        statusTone: gap >= 0 ? 'success' : 'warning',
      };
    }

    // Default: Relawan & Kekuatan Gabungan
    const target = cluster.targetVolunteers || Math.round(cluster.totalVolunteers * 1.05);
    const active = cluster.totalVolunteers;
    const unregistered = Math.max(0, target - active);
    const gap = cluster.volunteerGap;
    const pct = target > 0 ? (active / target) * 100 : 100;
    const verified = Math.round(active * 0.96);

    let statusTone: 'success' | 'info' | 'warning' | 'danger' = 'info';
    let statusLabel = 'Hampir Target';

    if (cluster.status === 'SURPLUS' || gap >= 0) {
      statusTone = 'success';
      statusLabel = 'Surplus Kuota';
    } else if (pct >= 80) {
      statusTone = 'info';
      statusLabel = 'Hampir Target';
    } else if (pct >= 25) {
      statusTone = 'warning';
      statusLabel = 'Perlu Penetrasi';
    } else {
      statusTone = 'danger';
      statusLabel = 'Defisit Kritis';
    }

    return {
      targetAmount: target,
      activeCount: active,
      unregisteredCount: unregistered,
      achievementPercent: Number(pct.toFixed(1)),
      verifiedCount: verified,
      verificationRatePercent: 96.0,
      gap,
      isSurplus: gap >= 0,
      statusLabel,
      statusTone,
    };
  }
}

export const gisDistributionService = new GisDistributionService();
