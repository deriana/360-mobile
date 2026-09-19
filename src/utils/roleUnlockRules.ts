import { CurrentUser, MobileRole } from '../types';

export interface PrerequisiteRequirement {
  id: string;
  title: string;
  desc: string;
  isPassed: boolean;
  actionLabel?: string;
  actionScreen?: string;
}

export interface WitnessPrerequisitesResult {
  isEligible: boolean;
  completedCount: number;
  totalCount: number;
  progressPct: number;
  requirements: PrerequisiteRequirement[];
}

export interface RoleEligibilityResult {
  allowed: boolean;
  reason?: string;
  missingRequirements?: string[];
  witnessDetails?: WitnessPrerequisitesResult;
}

/**
 * Validasi 4 Syarat Resmi BSN PAN untuk peran Saksi TPS (OFFICIAL_WITNESS)
 * 1. e-KTA simPAN Terverifikasi
 * 2. Kelulusan Diklat Pelatihan Saksi di Amanat Academy (100%)
 * 3. SK Mandat Resmi Penugasan TPS dari DPD/DPW
 * 4. Pakta Integritas / Komitmen Saksi Digital
 */
export function checkWitnessPrerequisites(user: CurrentUser): WitnessPrerequisitesResult {
  const dims = user.dimensions;

  // Syarat 1: e-KTA simPAN Terverifikasi atau ID Relawan Terdaftar
  const hasKta = Boolean(
    (dims && (dims.membership === 'active' || dims.membership === 'verified')) ||
    user.memberships.some((m) => m.type === 'member' && (m.status === 'verified' || m.status === 'active'))
  );

  // Syarat 2: Diklat Saksi BSN Selesai 100%
  const hasBimtek = Boolean(
    (dims && (dims.programs.programSaksi === 'CERTIFIED' || dims.programs.programSaksi === 'MANDATED')) ||
    (dims && (dims.programs.saksiProgress ?? 0) >= 100) ||
    user.candidateStatus === 'VERIFIED' ||
    user.candidateStatus === 'MANDATED' ||
    user.roles.some((r) => r.role === 'WITNESS')
  );

  // Syarat 3: SK Mandat Resmi Penugasan TPS
  const hasMandate = Boolean(
    (dims && (dims.programs.programSaksi === 'MANDATED' || Boolean(dims.programs.skMandatNumber))) ||
    user.roles.some((r) => r.role === 'WITNESS')
  );

  // Syarat 4: Pakta Integritas Saksi
  const hasPact = hasMandate || hasBimtek;

  const requirements: PrerequisiteRequirement[] = [
    {
      id: 'req_kta',
      title: 'e-KTA simPAN Terverifikasi',
      desc: 'Terdaftar resmi di database DPP PAN dengan Nomor KTA Nasional aktif.',
      isPassed: hasKta,
      actionLabel: hasKta ? undefined : 'Daftar e-KTA',
      actionScreen: 'SimpanKta',
    },
    {
      id: 'req_bimtek',
      title: 'Kelulusan Diklat Saksi Amanat Academy',
      desc: 'Menyelesaikan modul pengawalan C1 Plano, regulasi KPU, dan anti-kecurangan.',
      isPassed: hasBimtek,
      actionLabel: hasBimtek ? undefined : 'Buka Academy',
      actionScreen: 'WitnessAcademy',
    },
    {
      id: 'req_mandat',
      title: 'SK Mandat Resmi Penugasan TPS',
      desc: 'Surat Keputusan Mandat Saksi KPU yang telah divalidasi oleh BSN DPD PAN.',
      isPassed: hasMandate,
      actionLabel: hasMandate ? undefined : 'Cek Status Mandat',
      actionScreen: 'AssignmentLetter',
    },
    {
      id: 'req_pact',
      title: 'Pakta Integritas Saksi BSN',
      desc: 'Komitmen digital pengawalan suara jujur, adil, dan loyal terhadap marwah partai.',
      isPassed: hasPact,
      actionLabel: hasPact ? undefined : 'Tanda Tangani Pakta',
      actionScreen: 'VerifyLetter',
    },
  ];

  const completedCount = requirements.filter((r) => r.isPassed).length;
  const totalCount = requirements.length;
  const isEligible = completedCount === totalCount;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return {
    isEligible,
    completedCount,
    totalCount,
    progressPct,
    requirements,
  };
}

/**
 * Validasi kelayakan peralihan mode operasional
 */
export function checkRoleEligibility(user: CurrentUser, targetRole: MobileRole): RoleEligibilityResult {
  const dims = user.dimensions;

  switch (targetRole) {
    case 'MEMBER': {
      const isOfficialMember = Boolean(
        (dims && (dims.membership === 'active' || dims.membership === 'verified')) ||
        user.memberships.some((m) => m.type === 'member' && (m.status === 'verified' || m.status === 'active'))
      );
      if (!isOfficialMember) {
        return {
          allowed: false,
          reason: 'Mode Kader memerlukan verifikasi keanggotaan resmi (e-KTA simPAN) oleh Admin Partai.',
          missingRequirements: ['e-KTA simPAN Terverifikasi'],
        };
      }
      return { allowed: true };
    }

    case 'VOLUNTEER': {
      if (dims && dims.volunteer === 'inactive') {
        return {
          allowed: false,
          reason: 'Status kerelawanan Anda saat ini tidak aktif. Silakan aktifkan kembali di menu Kelola Status.',
          missingRequirements: ['Status Relawan Aktif'],
        };
      }
      return { allowed: true };
    }

    case 'WITNESS': {
      const witnessResult = checkWitnessPrerequisites(user);
      if (!witnessResult.isEligible) {
        const missing = witnessResult.requirements.filter((r) => !r.isPassed).map((r) => r.title);
        return {
          allowed: false,
          reason: `Mode Saksi TPS terkunci. Anda telah memenuhi ${witnessResult.completedCount} dari ${witnessResult.totalCount} syarat BSN.`,
          missingRequirements: missing,
          witnessDetails: witnessResult,
        };
      }
      return { allowed: true, witnessDetails: witnessResult };
    }

    case 'TPS_COORDINATOR':
    case 'FIELD_COORDINATOR': {
      const hasCoordinatorRole = user.roles.some((r) => r.role === targetRole) ||
        (dims && (dims.position.position === 'KOORDINATOR' || dims.position.position === 'PENGURUS'));
      if (!hasCoordinatorRole) {
        return {
          allowed: false,
          reason: 'Akses Terkunci. Mode Koordinator memerlukan SK penugasan resmi supervisi wilayah dari DPD/DPC PAN.',
          missingRequirements: ['SK Penugasan Koordinator Wilayah'],
        };
      }
      return { allowed: true };
    }

    case 'CALEG_OPS': {
      const isCaleg = Boolean(
        (dims && (dims.electoral.status === 'CALEG' || dims.electoral.status === 'BACALEG'))
      );
      if (!isCaleg) {
        return {
          allowed: false,
          reason: 'Akses Terkunci. Mode ini khusus untuk Calon Legislatif resmi yang terdaftar di Komite Pemenangan Pemilu Nasional (KPPN) PAN.',
          missingRequirements: ['Status Bacaleg/Caleg Resmi KPPN'],
        };
      }
      return { allowed: true };
    }

    default:
      return { allowed: true };
  }
}
