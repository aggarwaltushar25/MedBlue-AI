/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type VerificationStatus = 'Accepted' | 'Hold' | 'Quarantined';
export type RiskLevel = 'All' | 'Low' | 'Medium' | 'High';

export interface RiskFactorContribution {
  factor: string;
  weight: number;
  pointsAdded: number;
  description: string;
}

export interface ShipmentRiskProfile {
  totalScore: number;
  factors: RiskFactorContribution[];
  recommendation: 'Accepted' | 'Manual Review' | 'Quarantine';
  confidenceLevel: number;
}

export interface ShipmentVerification {
  id: string;
  medicineName: string;
  category: string;
  supplier: string;
  verifiedAt: string;
  riskScore: number;
  status: VerificationStatus;
  primaryIssue: string;
  location: string;
  batchNumber: string;
  expiryDate: string;
  serialCount: number;
  duplicateSerialsCount?: number;
  temperatureLog?: {
    time: string;
    temp: number;
    status: 'normal' | 'warning' | 'breach';
  }[];
  inspectorNotes?: string;
  rfidTag?: string;
  gs1DataMatrix?: string;
  riskProfile?: ShipmentRiskProfile;
}

export interface ExecutiveKPIs {
  todayVerifications: { count: number; trend: string };
  acceptedShipments: { count: number; percentage: string };
  quarantinedShipments: { count: number; percentage: string };
  pendingReview: { count: number; text: string };
  coldChainAlerts: { count: number; text: string };
  duplicateSerials: { count: number; text: string };
}

export interface VerificationTrendDay {
  date: string;
  accepted: number;
  quarantined: number;
  hold: number;
  total: number;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  histogram: {
    bucket: string;
    count: number;
    isHighRisk?: boolean;
  }[];
}

export interface SupplierHeatmapEntry {
  supplier: string;
  duplicateSerials: number;
  missingHandoff: number;
  coldChainBreach: number;
  packagingAnomaly: number;
}

export interface HighPriorityAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  shipmentId: string;
  issueType: string;
  batchNumber?: string;
}

export interface VerificationHealthData {
  verifiedPercentage: number;
  verifiedCount: number;
  pendingCount: number;
  failedCount: number;
  targetPercentage: number;
}

export interface ColdChainAttentionShipment {
  shipmentId: string;
  medicine: string;
  supplier: string;
  title: string;
  description: string;
  temperatures: {
    time: string;
    temp: number;
    safeMin: number;
    safeMax: number;
    isBreach: boolean;
  }[];
}

export interface TopSupplier {
  name: string;
  shipmentCount: number;
  percentage: number;
}

export interface ActivityEvent {
  id: string;
  type: 'accept' | 'quarantine' | 'alert' | 'scan' | 'hold';
  timestamp: string;
  description: string;
  shipmentId: string;
  supplier: string;
}

export interface SupplierPerformance {
  supplier: string;
  totalShipments: number;
  acceptanceRate: number;
  holdRate: number;
  quarantineRate: number;
  avgRiskScore: number;
}

export interface CategoryRisk {
  category: string;
  avgRiskScore: number;
  shipmentsCount: number;
  quarantineRate: number;
}

export interface GeographicRisk {
  city: string;
  totalShipments: number;
  quarantineRate: number;
  avgRiskScore: number;
  isElevated: boolean;
}

export interface ColdChainExcursion {
  id: string;
  shipmentId: string;
  medicine: string;
  date: string;
  maxTemp: number;
  durationHours: number;
  safeRange: string;
  location: string;
}

export interface RiskDriver {
  rank: number;
  name: string;
  occurrences: number;
  severity: 'critical' | 'warning' | 'caution';
  key: string;
}

export interface PredictedLoadDay {
  day: string;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

export interface ReportSummary {
  id: string;
  name: string;
  type: string;
  dateRange: string;
  generatedAt: string;
  format: 'pdf' | 'csv';
  fileSize: string;
}

export interface FilterState {
  dateRange: string;
  supplier: string;
  category: string;
  riskLevel: RiskLevel;
  statusFilter: string;
  searchQuery: string;
}

export type UserRole = 'customer' | 'chemist' | 'admin' | 'regulatory';

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus =
  | 'NEW'
  | 'UNDER REVIEW'
  | 'INVESTIGATION'
  | 'ESCALATED'
  | 'ACTION TAKEN'
  | 'CLOSED';

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorType: 'system' | 'inspector' | 'chemist' | 'officer' | 'regulatory_agency';
  action: string;
  shipmentId?: string;
  entity?: string;
  reason?: string;
  statusChange?: {
    from: IncidentStatus;
    to: IncidentStatus;
  };
  hashProof?: string;
}

export interface RegulatoryIncident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  store: {
    id: string;
    name: string;
    location: string;
    licenseNumber: string;
    manager: string;
  };
  supplier: {
    id: string;
    name: string;
    location: string;
    licenseNumber: string;
    contactEmail: string;
  };
  manufacturer: {
    id: string;
    name: string;
    facility: string;
    license: string;
  };
  medicine: {
    name: string;
    genericName: string;
    category: string;
    gtin: string;
  };
  batchNumber: string;
  shipmentId: string;
  serialNumber: string;
  detectionReason: string;
  riskScore: number; // 0 - 100
  evidence: {
    verificationRecords: string[];
    duplicateSerialsList?: string[];
    temperatureHistory?: { timestamp: string; temp: number; status: 'normal' | 'breach' }[];
    packagingObservations?: string[];
    batchInformation?: string;
    supplierHistorySummary?: string;
    blockchainProof?: { txHash: string; blockNumber: number; verified: boolean };
    attachments?: { id: string; name: string; type: string; url?: string }[];
  };
  assignedReviewer: {
    name: string;
    role: string;
    agency: string;
  };
  relatedIncidents: string[];
  timeline: IncidentTimelineEvent[];
  regulatoryNotes?: string;
  escalatedToAgency?: string;
  actionTakenSummary?: string;
}

export interface EntityRecurringPattern {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  firstDetected: string;
  lastDetected: string;
  frequency: string;
  evidenceCount: number;
  recommendation: string;
  associatedEntities: string[];
}

export interface EntityProfile {
  id: string;
  name: string;
  type: 'store' | 'supplier' | 'manufacturer' | 'batch' | 'location';
  location: string;
  status: 'Active' | 'Under Investigation' | 'Suspended' | 'High-Risk Watchlist' | 'Compliant';
  licenseNumber: string;
  firstObserved: string;
  lastIncident: string;
  totalShipments: number;
  suspiciousShipments: number;
  quarantinedShipments: number;
  incidentCount: number;
  avgRiskScore: number;
  riskTrend: 'increasing' | 'stable' | 'decreasing';
  incidentSummary: {
    duplicateSerials: number;
    coldChain: number;
    packaging: number;
    batchInconsistencies: number;
    missingHandoffs: number;
    other: number;
  };
  recurringPatterns: EntityRecurringPattern[];
  relationships: {
    associatedStores?: { id: string; name: string; incidentsCount: number }[];
    associatedSuppliers?: { id: string; name: string; riskScore: number }[];
    associatedManufacturers?: { id: string; name: string }[];
    associatedBatches?: { batchNumber: string; medicineName: string; status: string }[];
    associatedShipments?: { id: string; date: string; status: string; riskScore: number }[];
    associatedLocations?: string[];
  };
  incidentsList: string[];
  auditHistory: { timestamp: string; actor: string; action: string; outcome: string }[];
}

export interface RegulatoryKPIs {
  activeInvestigations: number;
  highPriorityIncidents: number;
  escalatedCases: number;
  suspiciousShipments: number;
  affectedStores: number;
  highRiskSuppliers: number;
}

export interface SuspiciousActivityTrendItem {
  period: string;
  duplicateSerials: number;
  packagingAnomalies: number;
  coldChainViolations: number;
  missingHandoffs: number;
  batchInconsistencies: number;
  expiryMismatches: number;
  otherFailures: number;
  total: number;
}

export interface GeographicRiskDetail {
  location: string;
  totalIncidents: number;
  affectedShipments: number;
  affectedStores: number;
  averageRiskScore: number;
  incidentGrowth: string;
  riskRating: 'High' | 'Medium' | 'Low';
}

export interface SupplierRegulatoryRisk {
  supplier: string;
  totalShipments: number;
  suspiciousShipments: number;
  quarantinedShipments: number;
  incidentRate: number; // percentage
  avgRiskScore: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  reviewStatus: 'Compliant' | 'Under Review' | 'Escalated' | 'Watchlist';
}

export interface StoreRegulatoryRisk {
  storeId: string;
  storeName: string;
  location: string;
  totalShipments: number;
  suspiciousShipments: number;
  quarantinedShipments: number;
  incidentCount: number;
  avgRiskScore: number;
  riskTrend: 'increasing' | 'stable' | 'decreasing';
  lastIncident: string;
  reviewStatus: 'Compliant' | 'Requires Review' | 'Investigation Active' | 'Escalated';
}

export interface HologramAnalysisResult {
  detected: boolean;
  confidence: number;
  iridescenceScore: number;
  specularGlareScore: number;
  sealIntact: boolean;
  patternMatch: 'Genuine GS1 Hologram' | 'Defective Hologram' | 'Tampered / Missing Seal' | 'Scanning...';
  details: string;
}

export interface BlockchainRecord {
  network: string;
  blockNumber: number;
  txHash: string;
  contractAddress: string;
  timestamp: string;
  merkleRoot: string;
  manufacturerSigner: string;
  verified: boolean;
  status: 'Confirmed' | 'Pending' | 'Invalid';
  gasUsed: string;
  explorerUrl: string;
}

export interface ScannedMedicineResult {
  id: string;
  medicineName: string;
  genericName: string;
  manufacturer: string;
  batchNumber: string;
  serialNumber: string;
  expiryDate: string;
  manufacturingDate: string;
  gtin: string;
  dosage: string;
  category: string;
  isAuthentic: boolean;
  riskScore: number;
  hologram: HologramAnalysisResult;
  blockchain: BlockchainRecord;
  patientGuide: {
    safetyStatus: 'Safe' | 'Warning' | 'Counterfeit';
    plainEnglishSummary: string;
    howToTake: string;
    storageAdvice: string;
    safeExpiryLabel: string;
    genuinePackagingTip: string;
  };
  stockInfo: {
    currentInventory: number;
    incomingUnits: number;
    newTotalStock: number;
    reorderThreshold: number;
    daysBuffer: number;
    status: 'In Stock' | 'Low Stock' | 'Overstocked';
    arrivalTemp: number;
    tempSafeRange: string;
    tempBreached: boolean;
    duplicateSerialFound: boolean;
    lastDispensedLocation?: string;
  };
  batchForensicsAvailable?: boolean;
  forensicRecord?: BatchForensicRecord;
  provenance: {
    step: string;
    actor: string;
    timestamp: string;
    txHash: string;
    status: 'completed' | 'current';
  }[];
}

export interface CustodyStageNode {
  id: string;
  stageName: string;
  actor: string;
  actorType: 'manufacturer' | 'freight' | 'distributor' | 'transit_hub' | 'pharmacy';
  location: string;
  timestamp: string;
  status: 'verified' | 'breach' | 'anomaly' | 'missing' | 'in_progress';
  supplierInvolved?: string;
  tempRange?: { min: number; max: number; current: number; isBreached: boolean };
  blockchainHash: string;
  blockNumber: number;
  unitsPassed: number;
  notes: string;
  handoffSealVerified: boolean;
  tamperEvidence?: string;
  iotHumidity?: number;
  gpsCoordinates?: string;
}

export interface ShipmentBlockchainVerification {
  isHashVerified: boolean;
  hashStatus: 'verified' | 'mismatch' | 'tampered' | 'unverified';
  recordHash: string;
  expectedMerkleRoot: string;
  actualComputedHash: string;
  blockNumber: number;
  txHash: string;
  network: string;
  timestamp: string;
  validatorNode: string;
  auditNotes: string;
}

export interface BatchSupplierConsignment {
  supplier: string;
  consignmentId: string;
  shipmentId?: string;
  assignedUnits: number;
  verifiedUnits: number;
  quarantinedUnits: number;
  status: VerificationStatus;
  transitRoute: string;
  arrivalDate: string;
  arrivalLocation: string;
  tempStatus: 'Normal' | 'Excursion Breach' | 'Warning';
  duplicateSerialsCount: number;
  custodyComplianceScore: number; // 0 - 100
  notes: string;
  blockchainVerification?: ShipmentBlockchainVerification;
}

export interface UnitForensicRecord {
  serialNumber: string;
  supplier: string;
  consignmentId: string;
  status: 'Genuine Verified' | 'Cloned / Duplicate' | 'Cold-Chain Damaged' | 'Packaging Anomaly' | 'In Transit';
  firstSeenLocation: string;
  firstSeenTime: string;
  duplicateSeenLocation?: string;
  duplicateSeenTime?: string;
  opticalHologramScore: number;
  onChainTx: string;
  riskRating: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface BatchForensicRecord {
  batchNumber: string;
  medicineName: string;
  genericName: string;
  category: string;
  dosageForm: string;
  manufacturer: {
    name: string;
    facility: string;
    license: string;
    originCountry: string;
  };
  mfgDate: string;
  expDate: string;
  totalUnitsProduced: number;
  totalSuppliersCount: number;
  overallStatus: 'Verified Pristine' | 'Quarantined - Critical Anomaly' | 'Hold - Investigation' | 'Attention Required';
  integrityScore: number; // 0 - 100
  riskSummary: string;
  anomaliesDetected: {
    type: 'duplicate_serial' | 'cold_chain' | 'missing_handoff' | 'packaging_hologram' | 'unauthorized_depot';
    severity: 'critical' | 'high' | 'medium';
    description: string;
    affectedSuppliers: string[];
    affectedUnitsCount: number;
  }[];
  suppliers: BatchSupplierConsignment[];
  custodyTimeline: CustodyStageNode[];
  sampleUnits: UnitForensicRecord[];
}
