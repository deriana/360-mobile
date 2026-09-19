export type MobileRole =
  | 'MEMBER'
  | 'VOLUNTEER'
  | 'WITNESS'
  | 'TPS_COORDINATOR'
  | 'FIELD_COORDINATOR'
  | 'CALEG_OPS';

export type LegacyRole =
  | 'TPS_WITNESS'
  | 'RELAWAN'
  | 'OPERATOR'
  | 'TPS_COORDINATOR'
  | 'CALEG'
  | 'KADER_ANGGOTA'
  | 'PAC'
  | 'DPC'
  | 'DPD'
  | 'DPW'
  | 'DPP';

export type Role = MobileRole | LegacyRole;

export type MembershipType = 'member' | 'volunteer';
export type MembershipStatus =
  | 'pending'
  | 'verified'
  | 'active'
  | 'inactive'
  | 'resignation_requested'
  | 'ended'
  | 'suspended';

export type KaderStatus = 'non_kader' | 'calon_kader' | 'kader_aktif';

export interface OrganizationalPosition {
  position: 'NONE' | 'PENGURUS' | 'KOORDINATOR' | 'FUNGSIONAR' | 'ANGGOTA_LEGISLATIF';
  level?: 'DPP' | 'DPW' | 'DPD' | 'DPC' | 'DPRT';
  region: string;
  roleTitle?: string;
  department?: string;
  periodStart?: string;
  periodEnd?: string;
  isPrimary?: boolean;
}

export interface ElectoralStatusRecord {
  status: 'NONE' | 'BACALEG' | 'CALEG' | 'TERPILIH' | 'ANGGOTA_LEGISLATIF';
  electionYear?: number;
  legislativeLevel?: 'DPR_RI' | 'DPRD_PROV' | 'DPRD_KAB_KOTA';
  dapil?: string;
  periodLabel?: string;
  ballotNumber?: number;
}

export type VolunteerStatus = 'none' | 'pending' | 'active' | 'paused' | 'inactive';

export interface ProgramParticipationRecord {
  amanatAcademy: 'NONE' | 'ENROLLED' | 'ACTIVE' | 'GRADUATED';
  academyProgress?: number;
  pandawa: 'NONE' | 'REGISTERED' | 'SELECTED' | 'TRAINING' | 'ACTIVE' | 'COMPLETED';
  programSaksi: 'NONE' | 'TRAINING' | 'CERTIFIED' | 'MANDATED';
  saksiProgress?: number;
  skMandatNumber?: string;
  certifiedDate?: string;
}

export interface UserDimensions {
  membership: MembershipStatus;
  kader: KaderStatus;
  position: OrganizationalPosition;
  electoral: ElectoralStatusRecord;
  volunteer: VolunteerStatus;
  programs: ProgramParticipationRecord;
  operationalRole: MobileRole;
}

export type CareerStatePresetId =
  | 'state_1'
  | 'state_2'
  | 'state_3'
  | 'state_4'
  | 'state_5'
  | 'state_6';

export type VolunteerStatePresetId = 'state_r1' | 'state_r2';

export interface ResignationRequestPayload {
  reason: string;
  note?: string;
  requestedAt: string;
}

export interface VolunteerPausePayload {
  isPaused: boolean;
  reason?: string;
  durationMonths?: number;
}

export interface VolunteerStopPayload {
  reason: string;
  note?: string;
}

export type ScopeLevel = 'NATIONAL' | 'PROVINCE' | 'REGENCY' | 'DISTRICT' | 'TPS';

export interface OrganizationalScope {
  level: ScopeLevel;
  code: string;
  name: string;
}

export interface OperationalRoleAssignment {
  role: MobileRole;
  status: 'assigned' | 'active' | 'inactive' | 'suspended';
  scope: OrganizationalScope;
  assignedAt: string;
}

export interface UserIdentity {
  id: string;
  name: string;
  nikMasked: string;
  nikFull?: string;
  phone: string;
  email: string;
  avatarIndex: number;
  status: 'active' | 'suspended';
}

export interface MembershipRecord {
  type: MembershipType;
  status: MembershipStatus;
  ktaNumber?: string;
  registeredAt: string;
  dpc?: string;
  dpd?: string;
}

export interface VolunteerStats {
  eventsAttended: number;
  tasksCompleted: number;
  trainingHours: number;
  activitiesCount: number;
}

export interface CurrentUser {
  id: string;
  identity: UserIdentity;
  memberships: MembershipRecord[];
  roles: OperationalRoleAssignment[];
  currentRole: MobileRole;
  permissions: string[];
  skills?: string[];
  interests?: string[];
  volunteerStats?: VolunteerStats;
  candidateStatus?: VolunteerCandidateStatus;
  coordinatorContact?: {
    name: string;
    phone: string;
    role: string;
    posko: string;
  };
  dimensions?: UserDimensions;
  resignationRequest?: ResignationRequestPayload;
  volunteerPauseInfo?: VolunteerPausePayload;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskCategory = 'witness' | 'gotv' | 'logistics' | 'advocacy' | 'training';

export interface TaskItem {
  id: string;
  title: string;
  desc: string;
  category: TaskCategory;
  assignedToRole: MobileRole;
  dueDate: string;
  timeLabel: string;
  status: TaskStatus;
  actionScreen?: string;
  actionParams?: any;
  actionLabel?: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: 'Konsolidasi' | 'Bimtek' | 'Apel Siaga' | 'Rapat DPC' | 'Aksi Sosial' | 'Pelatihan' | string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  isRegistered: boolean;
  attended: boolean;
  priorityNote?: string;
  badgeLabel?: string;
  targetAudience?: 'ALL' | 'VOLUNTEER' | 'WITNESS' | 'STRUCTURAL';
  dateIso?: string;
  description?: string;
  hostName?: string;
  dressCode?: string;
  points?: string[];
  contactPerson?: string;
}

export interface NotificationItem {
  id: string;
  type: 'broadcast' | 'assignment' | 'reminder' | 'audit' | 'approval';
  title: string;
  body: string;
  sentAt: string;
  sentBy: string;
  read: boolean;
  actionScreen?: string;
  actionParams?: any;
}

export type TpsStatus = 'not_reported' | 'in_progress' | 'done' | 'problem';

export interface VoteCounts {
  partyVotes: Record<string, number>;
  candidateVotes: Record<string, number>;
  dprCandidateVotes?: Record<string, number>;
  invalidVotes: number;
}

export interface Tps {
  id: string;
  province: string;
  regency: string;
  district: string;
  village?: string;
  tpsNumber: number;
  dpt: number;
  status: TpsStatus;
  lat: number;
  lng: number;
  votersPresent: number;
  votes: VoteCounts;
  coordinatorId: string;
}

export type WitnessStatus = 'assigned' | 'checked_in' | 'absent';

export interface Witness {
  id: string;
  name: string;
  nik: string;
  phone: string;
  address: string;
  assignedTpsId: string;
  status: WitnessStatus;
  checkInTime: string | null;
  checkInLocation: string | null;
  checkInLat: number | null;
  checkInLng: number | null;
  distanceMeters?: number | null;
  overrideNote?: string | null;
  insideGeofence?: boolean | null;
}

export interface CheckInPayload {
  witnessId: string;
  tpsId?: string;
  eventId?: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  insideGeofence: boolean;
  overrideNote?: string;
  selfieUrl?: string;
  photoSizeBytes?: number;
  timestamp: string;
  locationLabel?: string;
}

export interface Coordinator {
  id: string;
  name: string;
  nik: string;
  phone: string;
  address: string;
  regency: string;
  district: string;
  avatarIndex: number;
  status: WitnessStatus;
  checkInTime: string | null;
  checkInLocation: string | null;
}

export type EmergencyCategory =
  | 'intimidation'
  | 'unrest'
  | 'ballot_shortage'
  | 'violation'
  | 'vote_buying'
  | 'security_disturbance';

export type EmergencySeverity = 'low' | 'medium' | 'high';
export type EmergencyStatus = 'open' | 'investigating' | 'resolved';

export interface EmergencyReport {
  id: string;
  category: EmergencyCategory;
  description: string;
  tpsId: string | null;
  reportedBy: string;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  createdAt: string;
  photos?: any[];
}

export interface Broadcast {
  id: string;
  title: string;
  body: string;
  targetRoles: Role[];
  targetRegions: string[];
  sentAt: string;
  sentBy: string;
}

export type PaymentStatus = 'pending' | 'paid';

export interface PaymentInvoiceItem {
  label: string;
  amount: number;
}

export interface Payment {
  witnessId: string;
  amount: number;
  status: PaymentStatus;
  proofRef: string | null;
  paidAt?: string | null;
  method?: string | null;
  accountMasked?: string | null;
  invoiceItems?: PaymentInvoiceItem[];
}

export interface NationalParty {
  name: string;
  pct: number;
  votes: number;
  lolosThreshold: boolean;
  seats: number;
  isLocal?: boolean;
}

export interface LegislativeMember {
  id: string;
  province: string;
  party: string;
  noUrut: number;
  name: string;
  votes: number;
  terpilih: boolean;
}

export interface TpsDocPhoto {
  id: string;
  source: any;
  takenAt: string;
  watermark?: string;
  lat?: number;
  lng?: number;
}

export interface Region {
  province: string;
  regencies: string[];
}

export interface VolunteerOpportunity {
  id: string;
  title: string;
  category: 'Logistik' | 'Sosialisasi' | 'Dokumentasi' | 'Registrasi Posko' | 'Pengawalan Warga';
  location: string;
  date: string;
  time: string;
  neededSlots: number;
  filledSlots: number;
  isJoined?: boolean;
  coordinatorName: string;
  description: string;
}

export type VolunteerCandidateStatus =
  | 'NOT_APPLIED'
  | 'TRAINED'
  | 'APPLIED'
  | 'VERIFIED'
  | 'MANDATED';

