export type Role =
  | 'TPS_WITNESS'
  | 'OPERATOR'
  | 'TPS_COORDINATOR'
  | 'PAC'
  | 'DPC'
  | 'DPD'
  | 'DPW'
  | 'DPP';

export type TpsStatus = 'not_reported' | 'in_progress' | 'done' | 'problem';

export interface VoteCounts {
  partyVotes: Record<string, number>;
  candidateVotes: Record<string, number>;
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
  photos?: string[];
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

export interface Region {
  province: string;
  regencies: string[];
}
