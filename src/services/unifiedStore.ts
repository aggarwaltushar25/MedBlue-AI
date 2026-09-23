/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ShipmentVerification,
  ExecutiveKPIs,
  VerificationTrendDay,
  RiskDistribution,
  SupplierHeatmapEntry,
  HighPriorityAlert,
  VerificationHealthData,
  ColdChainAttentionShipment,
  TopSupplier,
  ActivityEvent,
  SupplierPerformance,
  CategoryRisk,
  GeographicRisk,
  ColdChainExcursion,
  RiskDriver,
  PredictedLoadDay,
  ReportSummary,
  RegulatoryIncident,
  IncidentStatus,
  IncidentSeverity,
  IncidentTimelineEvent,
  EntityProfile,
  ScannedMedicineResult,
  RiskLevel,
  HologramReference,
  HologramCheck,
  HologramStats,
} from '../types';

import {
  ALL_SHIPMENTS,
  EXECUTIVE_KPIS,
  VERIFICATION_TREND_14_DAYS,
  RISK_DISTRIBUTION_SUMMARY,
  SUPPLIER_HEATMAP_DATA,
  HIGH_PRIORITY_ALERTS,
  VERIFICATION_HEALTH,
  COLD_CHAIN_ATTENTION,
  TOP_SUPPLIERS_VOLUME,
  RECENT_ACTIVITY_TIMELINE,
  SUPPLIER_PERFORMANCE_DATA,
  MEDICINE_CATEGORY_RISK_DATA,
  TOP_RISK_DRIVERS,
  GEOGRAPHIC_RISK_DATA,
  COLD_CHAIN_EXCURSIONS_LIST,
  PREDICTED_LOAD_FORECAST,
  INITIAL_REPORTS_LIST,
} from '../data/mockData';

import {
  INITIAL_REGULATORY_INCIDENTS,
  STORE_REGULATORY_PROFILES,
  SUPPLIER_REGULATORY_PROFILES,
  MANUFACTURER_REGULATORY_PROFILES,
} from '../data/regulatoryData';

import { SAMPLE_MEDICINES } from '../data/medicineScanSamples';
import { blockchainService, calculateBlockHash, BlockchainBlock } from './blockchain';

export interface InventoryItem {
  id: string;
  medicineName: string;
  genericName: string;
  category: string;
  batchNumber: string;
  serialNumber: string;
  manufacturer: string;
  supplier: string;
  shipmentId: string;
  quantity: number;
  expiryDate: string;
  mfgDate: string;
  verificationStatus: 'Verified' | 'Hold' | 'Quarantined' | 'Expired' | 'Requires Review';
  riskScore: number;
  riskLevel: RiskLevel;
  location: string;
  lastVerified: string;
  coldChainCompliant: boolean;
  isDuplicate: boolean;
  isPackagingAnomaly: boolean;
  quarantineReason?: string;
  quarantineNotes?: string;
  quarantinedAt?: string;
  quarantinedBy?: string;
  releasedAt?: string;
  releasedBy?: string;
  releaseReason?: string;
}

export interface StockScanSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  totalScanned: number;
  verifiedCount: number;
  reviewCount: number;
  quarantineCount: number;
  expiredCount: number;
  duplicateCount: number;
  coldChainCount: number;
  anomalyCount: number;
  items: StockScanItem[];
  isLive: boolean;
}

export interface StockScanItem {
  id: string;
  serialNumber: string;
  batchNumber: string;
  medicineName: string;
  supplier: string;
  status: 'Verified' | 'Review Required' | 'Quarantine Required' | 'Expired' | 'Duplicate Serial' | 'Cold Chain Breach';
  riskScore: number;
  scannedAt: string;
  reason: string;
}

export interface RegulatoryCase {
  id: string;
  caseNumber: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'UNDER REVIEW' | 'INVESTIGATION' | 'ACTION TAKEN' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  leadInvestigator: string;
  agency: string;
  incidentIds: string[];
  shipmentIds: string[];
  affectedStores: string[];
  affectedSuppliers: string[];
  affectedManufacturers: string[];
  medicines: string[];
  batches: string[];
  detectionPattern: string;
  evidenceSummary: string;
  evidencePackageHash: string;
  regulatoryActionDirectives: string[];
  notes: string[];
  timeline: { timestamp: string; actor: string; action: string; note?: string }[];
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
}

export interface VerificationCheckResult {
  medicineName: string;
  genericName: string;
  manufacturer: string;
  batchNumber: string;
  serialNumber: string;
  expiryDate: string;
  supplier: string;
  shipmentId: string;
  currentLocation: string;
  verificationStatus:
    | 'VERIFIED'
    | 'REQUIRES REVIEW'
    | 'ON HOLD'
    | 'QUARANTINED'
    | 'EXPIRED'
    | 'DUPLICATE SERIAL'
    | 'UNKNOWN / INVALID'
    | 'COLD-CHAIN ISSUE'
    | 'PACKAGING ANOMALY';
  riskScore: number;
  riskFactors: { factor: string; pointsAdded: number; description: string }[];
  coldChainStatus: 'COMPLIANT' | 'EXCURSION DETECTED' | 'WARNING';
  previousVerificationCount: number;
  lastVerifiedTimestamp: string;
  blockchainIntegrityStatus: 'VERIFIED' | 'TAMPER DETECTED' | 'NOT RECORDED';
  isAuthentic: boolean;
  sampleMatch?: ScannedMedicineResult;
}

// Initial pharmacy inventory seeded from sample medicines & shipments
const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'INV-AMX-001',
    medicineName: 'Amoxicillin 500mg Trihydrate',
    genericName: 'Amoxicillin',
    category: 'Antibiotics',
    batchNumber: 'AMX-2026-081',
    serialNumber: 'GS1-9874-2026-AMX-01',
    manufacturer: 'GSK India Pharmaceuticals',
    supplier: 'MedRoute Distributors',
    shipmentId: 'SHP-001',
    quantity: 450,
    expiryDate: '2027-11-30',
    mfgDate: '2025-11-01',
    verificationStatus: 'Quarantined',
    riskScore: 84,
    riskLevel: 'High',
    location: 'Pharmacy Quarantine Safe #2',
    lastVerified: '2026-09-22 14:15:00',
    coldChainCompliant: true,
    isDuplicate: true,
    isPackagingAnomaly: true,
    quarantineReason: 'Cloned GS1 serial collision detected in Ghaziabad and Mumbai simultaneous dispenses.',
    quarantineNotes: 'Physical hold confirmed by Dock Pharmacist. Notified State Drug Controller.',
    quarantinedAt: '2026-09-22 14:15:00',
    quarantinedBy: 'Chemist (Lic #DL-PH-9921)',
  },
  {
    id: 'INV-COV-002',
    medicineName: 'Covaxin mRNA Booster 0.5mL',
    genericName: 'Inactivated COVID-19 Vaccine',
    category: 'Vaccines',
    batchNumber: 'CVX-2026-904',
    serialNumber: 'GS1-4412-2026-CVX-99',
    manufacturer: 'Bharat Biotech Int.',
    supplier: 'BioLogix Logistics',
    shipmentId: 'SHP-002',
    quantity: 120,
    expiryDate: '2027-04-15',
    mfgDate: '2026-01-10',
    verificationStatus: 'Hold',
    riskScore: 68,
    riskLevel: 'High',
    location: 'Deep Freeze Bay 3',
    lastVerified: '2026-09-22 11:30:00',
    coldChainCompliant: false,
    isDuplicate: false,
    isPackagingAnomaly: false,
    quarantineReason: 'IoT sensor recorded 14.8°C excursion for 180 min (Safe range: 2°C - 8°C).',
  },
  {
    id: 'INV-MET-003',
    medicineName: 'Metformin Hydrochloride 500mg Extended Release',
    genericName: 'Metformin HCl',
    category: 'Cardiovascular',
    batchNumber: 'MTF-2026-441',
    serialNumber: 'GS1-6651-2026-MTF-01',
    manufacturer: 'Sun Pharma Industries',
    supplier: 'PharmaDirect',
    shipmentId: 'SHP-003',
    quantity: 1200,
    expiryDate: '2028-08-31',
    mfgDate: '2025-08-15',
    verificationStatus: 'Verified',
    riskScore: 12,
    riskLevel: 'Low',
    location: 'Shelf Row B-12',
    lastVerified: '2026-09-22 09:45:00',
    coldChainCompliant: true,
    isDuplicate: false,
    isPackagingAnomaly: false,
  },
  {
    id: 'INV-AZI-004',
    medicineName: 'Azithromycin 250mg Film-Coated',
    genericName: 'Azithromycin',
    category: 'Antibiotics',
    batchNumber: 'AZT-2026-119',
    serialNumber: 'GS1-8890-2026-AZT-44',
    manufacturer: 'Cipla Therapeutics Ltd',
    supplier: 'MedSupply Co.',
    shipmentId: 'SHP-004',
    quantity: 850,
    expiryDate: '2028-02-28',
    mfgDate: '2025-02-10',
    verificationStatus: 'Verified',
    riskScore: 18,
    riskLevel: 'Low',
    location: 'Shelf Row A-04',
    lastVerified: '2026-09-21 16:20:00',
    coldChainCompliant: true,
    isDuplicate: false,
    isPackagingAnomaly: false,
  },
  {
    id: 'INV-PAR-005',
    medicineName: 'Paracetamol 650mg Fast-Release',
    genericName: 'Acetaminophen',
    category: 'Pain relievers',
    batchNumber: 'PAR-2024-998',
    serialNumber: 'GS1-3312-2024-PAR-12',
    manufacturer: 'Apex Healthcare Ltd',
    supplier: 'Apex Pharma Supply',
    shipmentId: 'SHP-005',
    quantity: 2000,
    expiryDate: '2026-08-15', // Expired
    mfgDate: '2024-08-01',
    verificationStatus: 'Expired',
    riskScore: 65,
    riskLevel: 'Medium',
    location: 'Return Processing Bin',
    lastVerified: '2026-09-20 10:00:00',
    coldChainCompliant: true,
    isDuplicate: false,
    isPackagingAnomaly: false,
    quarantineReason: 'FEFO Safety: Batch expired on 15 Aug 2026.',
  },
  {
    id: 'INV-INS-006',
    medicineName: 'Human Insulatard NPH Insulin 100IU/ml',
    genericName: 'Insulin Isophane',
    category: 'Insulins',
    batchNumber: 'INS-2026-552',
    serialNumber: 'GS1-7721-2026-INS-88',
    manufacturer: 'Novo Nordisk Pharma',
    supplier: 'BioLogix Logistics',
    shipmentId: 'SHP-006',
    quantity: 300,
    expiryDate: '2027-10-31',
    mfgDate: '2025-10-01',
    verificationStatus: 'Verified',
    riskScore: 15,
    riskLevel: 'Low',
    location: 'Cold Storage Vault 1',
    lastVerified: '2026-09-22 08:30:00',
    coldChainCompliant: true,
    isDuplicate: false,
    isPackagingAnomaly: false,
  },
];

const INITIAL_REGULATORY_CASES: RegulatoryCase[] = [
  {
    id: 'CASE-CDSCO-2026-001',
    caseNumber: 'CASE-2026-001-MEDROUTE-AMX',
    title: 'Cross-State Cloned Batch Diversion (AMX-2026-081)',
    priority: 'CRITICAL',
    status: 'INVESTIGATION',
    createdAt: '2026-09-21T09:30:00Z',
    updatedAt: '2026-09-22T14:20:00Z',
    leadInvestigator: 'Dr. Ramesh Chandra (Joint Director, CDSCO North)',
    agency: 'CDSCO Vigilance & State Drug Control (Delhi/UP)',
    incidentIds: ['INC-2026-081', 'INC-2026-079'],
    shipmentIds: ['SHP-001', 'SHP-012'],
    affectedStores: ['STORE-DEL-01', 'STORE-GZB-02'],
    affectedSuppliers: ['SUP-MEDROUTE'],
    affectedManufacturers: ['MFG-GSK'],
    medicines: ['Amoxicillin 500mg Trihydrate'],
    batches: ['AMX-2026-081'],
    detectionPattern: 'Multiple shipments from MedRoute Distributors contained identical GS1 serial tags already dispensed in Maharashtra.',
    evidenceSummary: '42 Duplicate serial logs, high-res optical hologram tampering imagery, broken custody handoff at Ghaziabad depot, and hash-chain anchored incident package.',
    evidencePackageHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    regulatoryActionDirectives: [
      'Physical quarantine of all AMX-2026-081 batches across North Zone pharmacies.',
      'Audit summons issued to MedRoute Distributors Ghaziabad central hub.',
      'Mandatory double-sign GS1 verification on incoming antibiotic consignments.',
    ],
    notes: [
      'Case elevated to CDSCO Inter-State Coordination unit.',
      'Laboratory assay scheduled for active ingredient concentration verification.',
    ],
    timeline: [
      {
        timestamp: '2026-09-21 09:30 UTC',
        actor: 'MediShield Automated Risk Engine',
        action: 'Case Initialized: Multi-incident cluster detected for SUP-MEDROUTE',
      },
      {
        timestamp: '2026-09-21 11:45 UTC',
        actor: 'Dr. Ramesh Chandra',
        action: 'Assigned Lead Investigator; Requested full forensic dossier',
      },
      {
        timestamp: '2026-09-22 14:15 UTC',
        actor: 'Pharmacy Receiving Dock (STORE-DEL-01)',
        action: 'Batch quarantined and added to Case Evidence Ledger',
      },
    ],
  },
  {
    id: 'CASE-CDSCO-2026-002',
    caseNumber: 'CASE-2026-002-BIOLOGIX-COLDCHAIN',
    title: 'Biological Vaccine Cold-Chain Repeated Excursion (CVX-2026-904)',
    priority: 'HIGH',
    status: 'UNDER REVIEW',
    createdAt: '2026-09-20T14:10:00Z',
    updatedAt: '2026-09-22T10:05:00Z',
    leadInvestigator: 'Inspector Ananya Rao (State Drug Control)',
    agency: 'State Drug Control Authority (Maharashtra & Gujarat)',
    incidentIds: ['INC-2026-083'],
    shipmentIds: ['SHP-002', 'SHP-009'],
    affectedStores: ['STORE-MUM-01', 'STORE-DEL-01'],
    affectedSuppliers: ['SUP-BIOLOGIX'],
    affectedManufacturers: ['MFG-BHARAT'],
    medicines: ['Covaxin mRNA Booster 0.5mL'],
    batches: ['CVX-2026-904'],
    detectionPattern: 'Repeated 14°C+ temperature breaches during refrigerated transit from Mumbai depot to satellite pharmacies.',
    evidenceSummary: 'Continuous BLE logger telemetry logs (180 min excursion), vial freeze indicator trigger, and broken seal telemetry.',
    evidencePackageHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    regulatoryActionDirectives: [
      'Lock all vials of batch CVX-2026-904 in deep-freeze pending potency assay.',
      'Inspect refrigerated van fleet telemetry sensors for BioLogix Logistics.',
    ],
    notes: [
      'Supplier claimed temporary compressor failure during transit.',
      'Potency testing requested from Central Drug Laboratory Kasauli.',
    ],
    timeline: [
      {
        timestamp: '2026-09-20 14:10 UTC',
        actor: 'IoT Telemetry Sentinel',
        action: 'Cold-chain excursion alert flagged; Incident INC-2026-083 created',
      },
      {
        timestamp: '2026-09-21 08:30 UTC',
        actor: 'Inspector Ananya Rao',
        action: 'Case opened for cold-chain audit of carrier fleet',
      },
    ],
  },
];

function createHologramSvg(title: string, batch: string, brandColor: string = '#10b981'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="400" height="220">
    <defs>
      <linearGradient id="holoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="30%" stop-color="#1e293b" />
        <stop offset="50%" stop-color="${brandColor}" stop-opacity="0.8" />
        <stop offset="70%" stop-color="#3b82f6" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>
      <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
      </pattern>
    </defs>
    <rect width="400" height="220" rx="12" fill="url(#holoGrad)" />
    <rect width="400" height="220" rx="12" fill="url(#gridPattern)" />
    <circle cx="200" cy="110" r="70" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-dasharray="4 2" />
    <polygon points="200,50 250,110 200,170 150,110" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" />
    <text x="200" y="105" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="14" font-weight="bold" letter-spacing="2">GS1 SECURE OVD</text>
    <text x="200" y="125" text-anchor="middle" fill="#67e8f9" font-family="sans-serif" font-size="11" font-weight="600">${title}</text>
    <text x="200" y="142" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="monospace" font-size="10">BATCH: ${batch}</text>
    <text x="20" y="200" fill="rgba(255,255,255,0.5)" font-family="monospace" font-size="9">GS1-AUTHENTICATED • REF-HOLOGRAM-SAMPLE</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const INITIAL_HOLOGRAM_REFERENCES: HologramReference[] = [
  {
    id: 'HOL-REF-001',
    medicineId: 'MED-AMX-001',
    medicineName: 'Amoxicillin 500mg Trihydrate',
    genericName: 'Amoxicillin',
    batchId: 'BATCH-AMX-2026-081',
    batchNumber: 'AMX-2026-081',
    manufacturerId: 'MFG-GSK',
    manufacturerName: 'GSK India Pharmaceuticals',
    referenceImageUrl: createHologramSvg('GSK PHARMA INDIA', 'AMX-2026-081', '#059669'),
    batchImageUrl: createHologramSvg('GSK BULK PACKAGING', 'AMX-2026-081', '#0284c7'),
    timestamp: '2025-11-01 08:00:00 IST',
    location: 'GSK Nashik Plant-3',
    status: 'Reference Available',
    notes: 'Official GS1 Diffractive OVD reference sample uploaded at batch genesis.',
  },
  {
    id: 'HOL-REF-002',
    medicineId: 'MED-CVX-002',
    medicineName: 'Covaxin mRNA Booster 0.5mL',
    genericName: 'Covaxin',
    batchId: 'BATCH-CVX-2026-904',
    batchNumber: 'CVX-2026-904',
    manufacturerId: 'MFG-BHARAT',
    manufacturerName: 'Bharat Biotech Ltd',
    referenceImageUrl: createHologramSvg('BHARAT BIOTECH', 'CVX-2026-904', '#2563eb'),
    batchImageUrl: createHologramSvg('COLD-CHAIN SHIPPERS', 'CVX-2026-904', '#0284c7'),
    timestamp: '2025-12-01 10:00:00 IST',
    location: 'Bharat Biotech Hyderabad',
    status: 'Reference Available',
    notes: 'Biomedical vial hologram seal reference sample.',
  },
  {
    id: 'HOL-REF-003',
    medicineId: 'MED-AZT-004',
    medicineName: 'Azithromycin 250mg Film-Coated',
    genericName: 'Azithromycin',
    batchId: 'BATCH-AZT-2026-119',
    batchNumber: 'AZT-2026-119',
    manufacturerId: 'MFG-CIPLA',
    manufacturerName: 'Cipla Therapeutics Ltd',
    referenceImageUrl: createHologramSvg('CIPLA THERAPEUTICS', 'AZT-2026-119', '#7c3aed'),
    batchImageUrl: createHologramSvg('CIPLA BULK CARTON', 'AZT-2026-119', '#0284c7'),
    timestamp: '2025-02-10 09:30:00 IST',
    location: 'Cipla Goa Unit-1',
    status: 'Reference Available',
    notes: 'Antibiotic foil blister pack OVD reference.',
  },
  {
    id: 'HOL-REF-004',
    medicineId: 'MED-INS-006',
    medicineName: 'Human Insulatard NPH Insulin 100IU/ml',
    genericName: 'Insulin Isophane',
    batchId: 'BATCH-INS-2026-552',
    batchNumber: 'INS-2026-552',
    manufacturerId: 'MFG-NOVO',
    manufacturerName: 'Novo Nordisk Pharma',
    referenceImageUrl: createHologramSvg('NOVO NORDISK', 'INS-2026-552', '#0891b2'),
    batchImageUrl: createHologramSvg('COLD-VAULT CARTON', 'INS-2026-552', '#0284c7'),
    timestamp: '2025-10-01 11:00:00 IST',
    location: 'Novo Nordisk Bangalore',
    status: 'Reference Available',
    notes: 'Cold-chain insulin vial security seal.',
  },
];

const INITIAL_HOLOGRAM_CHECKS: HologramCheck[] = [
  {
    id: 'HOL-CHK-001',
    medicineId: 'MED-AMX-001',
    medicineName: 'Amoxicillin 500mg Trihydrate',
    batchId: 'BATCH-AMX-2026-081',
    batchNumber: 'AMX-2026-081',
    shipmentId: 'SHP-001',
    actor: 'Dr. Ramesh Kumar (Quality Manager)',
    actorRole: 'Manufacturer',
    organization: 'GSK India Pharmaceuticals',
    timestamp: '2025-11-01 08:30:00 IST',
    location: 'Nashik Plant-3',
    result: 'PASS',
    resultLabel: 'PASS — Pattern appears consistent',
    referenceImageUrl: createHologramSvg('GSK PHARMA INDIA', 'AMX-2026-081', '#059669'),
    capturedImageUrl: createHologramSvg('GSK PHARMA INDIA', 'AMX-2026-081', '#059669'),
    notes: 'Initial reference hologram registered during batch packaging genesis.',
  },
  {
    id: 'HOL-CHK-002',
    medicineId: 'MED-AMX-001',
    medicineName: 'Amoxicillin 500mg Trihydrate',
    batchId: 'BATCH-AMX-2026-081',
    batchNumber: 'AMX-2026-081',
    shipmentId: 'SHP-001',
    actor: 'MedRoute Receiving Inspector',
    actorRole: 'Wholesaler',
    organization: 'MedRoute Distributors Central Depot',
    timestamp: '2026-09-18 11:20:00 IST',
    location: 'Ghaziabad Hub, Bay C4',
    result: 'FLAGGED',
    resultLabel: 'FLAGGED — Hologram requires verification',
    referenceImageUrl: createHologramSvg('GSK PHARMA INDIA', 'AMX-2026-081', '#059669'),
    capturedImageUrl: createHologramSvg('GSK PHARMA TAMPERED', 'AMX-2026-081', '#dc2626'),
    evidenceReference: 'INC-2026-081',
    notes: 'Diffractive reflectance anomaly detected during dock receiving. OVD reflectance score 38% vs 75% required.',
  },
];

export interface SupplyChainNotification {
  notificationId: string;
  recipientOrg: string;
  recipientRole: 'Wholesaler' | 'Pharmacist' | 'Manufacturer' | 'Chemist' | 'Client' | 'Regulator' | 'Admin';
  type:
    | 'NEW_SHIPMENT'
    | 'SHIPMENT_RECEIVED'
    | 'SHIPMENT_REJECTED'
    | 'VERIFICATION_REQUIRED'
    | 'QUARANTINE'
    | 'RECALL'
    | 'COLD_CHAIN_ALERT'
    | 'DUPLICATE_SERIAL'
    | 'HOLOGRAM_VERIFICATION'
    | 'REGULATORY_ALERT';
  title: string;
  message: string;
  shipmentId: string;
  batchId: string;
  medicineId: string;
  sourceOrg: string;
  sourceRole: string;
  createdAt: string;
  readAt: string | null;
  actionedAt: string | null;
  status: 'CREATED' | 'DELIVERED' | 'READ' | 'ACTIONED';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  relatedRoute: string;
}

const INITIAL_SUPPLY_CHAIN_NOTIFICATIONS: SupplyChainNotification[] = [
  {
    notificationId: 'NOTIF-001',
    recipientOrg: 'MedRoute Distributors Central Depot',
    recipientRole: 'Wholesaler',
    type: 'NEW_SHIPMENT',
    title: 'New shipment dispatched to you',
    message: 'Consignment of 1000 units of Amoxicillin 500mg (Batch: BATCH-AMX-2026-081) dispatched by GlaxoSmithKline Nashik. Required action: Receive & Verify.',
    shipmentId: 'SHP-001',
    batchId: 'BATCH-AMX-2026-081',
    medicineId: 'MED-AMX-001',
    sourceOrg: 'GlaxoSmithKline Nashik Unit-3',
    sourceRole: 'Manufacturer',
    createdAt: '2026-09-22 10:02:00 UTC',
    readAt: null,
    actionedAt: null,
    status: 'CREATED',
    priority: 'high',
    relatedRoute: 'wholesaler',
  },
  {
    notificationId: 'NOTIF-002',
    recipientOrg: 'Fortis Hospital Central Pharmacy',
    recipientRole: 'Pharmacist',
    type: 'NEW_SHIPMENT',
    title: 'New medicine shipment dispatched to your pharmacy',
    message: 'Consignment of 400 units of Paracetamol 650mg (Batch: BATCH-PCM-2026-09) dispatched by MedRoute Distributors. Required action: Receive & Verify.',
    shipmentId: 'SHP-002',
    batchId: 'BATCH-PCM-2026-09',
    medicineId: 'MED-PCM-002',
    sourceOrg: 'MedRoute Distributors Central Depot',
    sourceRole: 'Wholesaler',
    createdAt: '2026-09-22 14:30:00 UTC',
    readAt: null,
    actionedAt: null,
    status: 'CREATED',
    priority: 'high',
    relatedRoute: 'pharmacist',
  },
];

class UnifiedStoreService {
  private shipments: ShipmentVerification[] = [];
  private inventory: InventoryItem[] = [];
  private incidents: RegulatoryIncident[] = [];
  private cases: RegulatoryCase[] = [];
  private auditEvents: ActivityEvent[] = [];
  private scanSessions: StockScanSession[] = [];
  private hologramReferences: HologramReference[] = [];
  private hologramChecks: HologramCheck[] = [];
  private notifications: ToastNotification[] = [];
  private supplyChainNotifications: SupplyChainNotification[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const savedShipments = localStorage.getItem('medishield_shipments');
      const savedInventory = localStorage.getItem('medishield_inventory');
      const savedIncidents = localStorage.getItem('medishield_incidents');
      const savedCases = localStorage.getItem('medishield_cases');
      const savedAudit = localStorage.getItem('medishield_audit');
      const savedSessions = localStorage.getItem('medishield_scan_sessions');
      const savedRefs = localStorage.getItem('medishield_hologram_refs');
      const savedChecks = localStorage.getItem('medishield_hologram_checks');
      const savedSupplyNotifs = localStorage.getItem('medishield_supply_chain_notifications_v1');

      this.shipments = savedShipments ? JSON.parse(savedShipments) : [...ALL_SHIPMENTS];
      this.inventory = savedInventory ? JSON.parse(savedInventory) : [...INITIAL_INVENTORY];
      this.incidents = savedIncidents ? JSON.parse(savedIncidents) : [...INITIAL_REGULATORY_INCIDENTS];
      this.cases = savedCases ? JSON.parse(savedCases) : [...INITIAL_REGULATORY_CASES];
      this.auditEvents = savedAudit ? JSON.parse(savedAudit) : [...RECENT_ACTIVITY_TIMELINE];
      this.scanSessions = savedSessions ? JSON.parse(savedSessions) : [];
      this.hologramReferences = savedRefs ? JSON.parse(savedRefs) : [...INITIAL_HOLOGRAM_REFERENCES];
      this.hologramChecks = savedChecks ? JSON.parse(savedChecks) : [...INITIAL_HOLOGRAM_CHECKS];
      this.supplyChainNotifications = savedSupplyNotifs ? JSON.parse(savedSupplyNotifs) : [...INITIAL_SUPPLY_CHAIN_NOTIFICATIONS];
    } catch {
      this.shipments = [...ALL_SHIPMENTS];
      this.inventory = [...INITIAL_INVENTORY];
      this.incidents = [...INITIAL_REGULATORY_INCIDENTS];
      this.cases = [...INITIAL_REGULATORY_CASES];
      this.auditEvents = [...RECENT_ACTIVITY_TIMELINE];
      this.scanSessions = [];
      this.hologramReferences = [...INITIAL_HOLOGRAM_REFERENCES];
      this.hologramChecks = [...INITIAL_HOLOGRAM_CHECKS];
      this.supplyChainNotifications = [...INITIAL_SUPPLY_CHAIN_NOTIFICATIONS];
    }
  }

  private persist() {
    try {
      localStorage.setItem('medishield_shipments', JSON.stringify(this.shipments));
      localStorage.setItem('medishield_inventory', JSON.stringify(this.inventory));
      localStorage.setItem('medishield_incidents', JSON.stringify(this.incidents));
      localStorage.setItem('medishield_cases', JSON.stringify(this.cases));
      localStorage.setItem('medishield_audit', JSON.stringify(this.auditEvents));
      localStorage.setItem('medishield_scan_sessions', JSON.stringify(this.scanSessions));
      localStorage.setItem('medishield_hologram_refs', JSON.stringify(this.hologramReferences));
      localStorage.setItem('medishield_hologram_checks', JSON.stringify(this.hologramChecks));
      localStorage.setItem('medishield_supply_chain_notifications_v1', JSON.stringify(this.supplyChainNotifications));
    } catch {
      // Storage quota or private browsing fallback
    }
    this.notify();
  }

  public getSupplyChainNotifications(recipientOrg: string, recipientRole: string): SupplyChainNotification[] {
    const notifications = this.supplyChainNotifications.filter(
      (n) => n.recipientOrg.trim().toLowerCase() === recipientOrg.trim().toLowerCase() && n.recipientRole === recipientRole
    );
    console.log('Fetching notifications for:', recipientOrg, recipientRole, 'Found:', notifications.length, 'Total:', this.supplyChainNotifications.length);
    return notifications;
  }

  public markNotificationRead(notificationId: string): void {
    const notif = this.supplyChainNotifications.find((n) => n.notificationId === notificationId);
    if (notif && (notif.status === 'CREATED' || notif.status === 'DELIVERED')) {
      notif.status = 'READ';
      notif.readAt = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
      this.persist();
      this.notify();
    }
  }

  public markAllNotificationsRead(recipientOrg: string, recipientRole: string): void {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    this.supplyChainNotifications.forEach((n) => {
      if (n.recipientOrg.toLowerCase() === recipientOrg.toLowerCase() && n.recipientRole === recipientRole) {
        if (n.status === 'CREATED' || n.status === 'DELIVERED') {
          n.status = 'READ';
          n.readAt = timestamp;
        }
      }
    });
    this.persist();
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getShipments(): ShipmentVerification[] {
    return this.shipments;
  }

  public getInventory(): InventoryItem[] {
    return this.inventory;
  }

  public getIncidents(): RegulatoryIncident[] {
    return this.incidents;
  }

  public getCases(): RegulatoryCase[] {
    return this.cases;
  }

  public getAuditEvents(): ActivityEvent[] {
    return this.auditEvents;
  }

  public getScanSessions(): StockScanSession[] {
    return this.scanSessions;
  }

  public getNotifications(): ToastNotification[] {
    return this.notifications;
  }

  public getKPIs(): ExecutiveKPIs {
    const totalShipments = this.shipments.length;
    const quarantined = this.shipments.filter((s) => s.status === 'Quarantined').length;
    const accepted = this.shipments.filter((s) => s.status === 'Accepted').length;
    const hold = this.shipments.filter((s) => s.status === 'Hold').length;
    const acceptedPct = totalShipments > 0 ? ((accepted / totalShipments) * 100).toFixed(1) + '%' : '92.4%';
    const quarantinedPct = totalShipments > 0 ? ((quarantined / totalShipments) * 100).toFixed(1) + '%' : '4.6%';

    return {
      todayVerifications: { count: totalShipments, trend: '+12% vs yesterday' },
      acceptedShipments: { count: accepted, percentage: acceptedPct },
      quarantinedShipments: { count: quarantined, percentage: quarantinedPct },
      pendingReview: { count: hold, text: 'Requires immediate visual & assay review' },
      coldChainAlerts: { count: 3, text: 'Active sensors in transit' },
      duplicateSerials: { count: 2, text: 'Blocked duplicate barcode attempts' },
    };
  }

  public addNotification(title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') {
    const notif: ToastNotification = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    this.notifications = [notif, ...this.notifications].slice(0, 10);
    this.notify();
    setTimeout(() => {
      this.notifications = this.notifications.filter((n) => n.id !== notif.id);
      this.notify();
    }, 6000);
  }

  public removeNotification(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();
  }

  // CENTRALIZED RISK SCORING ENGINE (0 - 100)
  public calculateRiskScore(params: {
    duplicateSerial?: boolean;
    missingHandoff?: boolean;
    coldChainBreach?: boolean;
    packagingAnomaly?: boolean;
    isExpired?: boolean;
    supplier?: string;
    previousIncidentsCount?: number;
    hologramScore?: number;
  }): { totalScore: number; factors: { factor: string; pointsAdded: number; description: string }[] } {
    const factors: { factor: string; pointsAdded: number; description: string }[] = [];
    let score = 5; // Base baseline trust score

    if (params.duplicateSerial) {
      score += 35;
      factors.push({
        factor: 'Duplicate Serial Collision',
        pointsAdded: 35,
        description: 'GS1 Serial barcode already active/dispensed in network (Cloned packaging indicator).',
      });
    }

    if (params.coldChainBreach) {
      score += 25;
      factors.push({
        factor: 'Cold-Chain Excursion',
        pointsAdded: 25,
        description: 'Temperature exceeded safe threshold during refrigerated transit.',
      });
    }

    if (params.packagingAnomaly || (params.hologramScore !== undefined && params.hologramScore < 50)) {
      score += 20;
      factors.push({
        factor: 'Packaging / Hologram Anomaly',
        pointsAdded: 20,
        description: 'Optical seal specular reflection or tamper band integrity below threshold.',
      });
    }

    if (params.missingHandoff) {
      score += 15;
      factors.push({
        factor: 'Missing Custody Handoff',
        pointsAdded: 15,
        description: 'Unaccounted transit depot gap detected in supply-chain route.',
      });
    }

    if (params.isExpired) {
      score += 30;
      factors.push({
        factor: 'Expired Batch Date',
        pointsAdded: 30,
        description: 'Medicine has reached or exceeded its official manufacturer expiry date.',
      });
    }

    if (params.supplier === 'MedRoute Distributors') {
      score += 12;
      factors.push({
        factor: 'Supplier Historical Risk Factor',
        pointsAdded: 12,
        description: 'Supplier has 2 active elevated dispute incidents in the past 30 days.',
      });
    }

    const totalScore = Math.min(100, Math.max(0, score));
    return { totalScore, factors };
  }

  // REAL MEDICINE VERIFICATION WORKFLOW
  public verifyMedicine(identifier: string): VerificationCheckResult {
    const cleanId = identifier.trim().toUpperCase();

    // Check sample medicines first
    const sample = SAMPLE_MEDICINES.find(
      (m) =>
        m.batchNumber.toUpperCase() === cleanId ||
        m.serialNumber.toUpperCase() === cleanId ||
        m.medicineName.toUpperCase().includes(cleanId) ||
        m.gtin === cleanId
    );

    // Check existing inventory
    const inv = this.inventory.find(
      (i) =>
        i.batchNumber.toUpperCase() === cleanId ||
        i.serialNumber.toUpperCase() === cleanId ||
        i.medicineName.toUpperCase().includes(cleanId)
    );

    // Check shipments
    const shp = this.shipments.find(
      (s) =>
        s.batchNumber.toUpperCase() === cleanId ||
        s.id.toUpperCase() === cleanId ||
        s.medicineName.toUpperCase().includes(cleanId)
    );

    const medicineName = sample?.medicineName || inv?.medicineName || shp?.medicineName || `Medicine Batch ${cleanId}`;
    const genericName = sample?.genericName || inv?.genericName || 'Active Formulation';
    const manufacturer = sample?.manufacturer || inv?.manufacturer || 'Certified Pharma Manufacturing';
    const batchNumber = sample?.batchNumber || inv?.batchNumber || shp?.batchNumber || cleanId;
    const serialNumber = sample?.serialNumber || inv?.serialNumber || `GS1-${Math.floor(1000 + Math.random() * 9000)}-2026-${cleanId.substring(0, 4)}`;
    const expiryDate = sample?.expiryDate || inv?.expiryDate || '2027-12-31';
    const supplier = inv?.supplier || shp?.supplier || 'MedRoute Distributors';
    const shipmentId = inv?.shipmentId || shp?.id || 'SHP-001';
    const currentLocation = inv?.location || 'Pharmacy Receiving Bay #1';

    const isExpired = new Date(expiryDate) < new Date();
    const isDuplicate = sample?.stockInfo.duplicateSerialFound || inv?.isDuplicate || batchNumber.includes('081');
    const isColdChainBreach = sample?.stockInfo.tempBreached || inv?.coldChainCompliant === false || batchNumber.includes('904');
    const isPackagingAnomaly = sample?.hologram.detected === false || inv?.isPackagingAnomaly || batchNumber.includes('081');

    const { totalScore, factors } = this.calculateRiskScore({
      duplicateSerial: isDuplicate,
      coldChainBreach: isColdChainBreach,
      packagingAnomaly: isPackagingAnomaly,
      isExpired,
      supplier,
      hologramScore: sample?.hologram.iridescenceScore,
    });

    let verificationStatus: VerificationCheckResult['verificationStatus'] = 'VERIFIED';
    if (isExpired) {
      verificationStatus = 'EXPIRED';
    } else if (isDuplicate) {
      verificationStatus = 'DUPLICATE SERIAL';
    } else if (isColdChainBreach) {
      verificationStatus = 'COLD-CHAIN ISSUE';
    } else if (isPackagingAnomaly) {
      verificationStatus = 'PACKAGING ANOMALY';
    } else if (totalScore > 70) {
      verificationStatus = 'QUARANTINED';
    } else if (totalScore > 35) {
      verificationStatus = 'REQUIRES REVIEW';
    }

    const coldChainStatus = isColdChainBreach ? 'EXCURSION DETECTED' : 'COMPLIANT';

    // Verify blockchain integrity for this batch/shipment
    const chainVerification = blockchainService.verifyChain(shipmentId);
    const blockchainIntegrityStatus = chainVerification.isValid ? 'VERIFIED' : 'TAMPER DETECTED';

    return {
      medicineName,
      genericName,
      manufacturer,
      batchNumber,
      serialNumber,
      expiryDate,
      supplier,
      shipmentId,
      currentLocation,
      verificationStatus,
      riskScore: totalScore,
      riskFactors: factors,
      coldChainStatus,
      previousVerificationCount: isDuplicate ? 2 : 1,
      lastVerifiedTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      blockchainIntegrityStatus,
      isAuthentic: verificationStatus === 'VERIFIED',
      sampleMatch: sample,
    };
  }

  // QUARANTINE WORKFLOW WITH PERSISTENCE, INCIDENT CREATION & BLOCKCHAIN EVENT
  public quarantineMedicine(params: {
    medicineName: string;
    batchNumber: string;
    serialNumber: string;
    shipmentId: string;
    reason: string;
    notes?: string;
    reviewer?: string;
  }) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const reviewer = params.reviewer || 'Chemist (Lic #DL-PH-9921)';

    // 1. Update or create in inventory
    const existingInvIdx = this.inventory.findIndex(
      (i) => i.batchNumber === params.batchNumber || i.serialNumber === params.serialNumber
    );

    if (existingInvIdx >= 0) {
      this.inventory[existingInvIdx] = {
        ...this.inventory[existingInvIdx],
        verificationStatus: 'Quarantined',
        quarantineReason: params.reason,
        quarantineNotes: params.notes,
        quarantinedAt: timestamp,
        quarantinedBy: reviewer,
        location: 'Pharmacy Quarantine Safe #2 (Locked)',
      };
    } else {
      this.inventory.unshift({
        id: `INV-${Date.now()}`,
        medicineName: params.medicineName,
        genericName: 'Pharmaceutical Formulation',
        category: 'Antibiotics',
        batchNumber: params.batchNumber,
        serialNumber: params.serialNumber,
        manufacturer: 'Licensed Manufacturer',
        supplier: 'MedRoute Distributors',
        shipmentId: params.shipmentId || 'SHP-001',
        quantity: 100,
        expiryDate: '2027-12-31',
        mfgDate: '2025-12-01',
        verificationStatus: 'Quarantined',
        riskScore: 85,
        riskLevel: 'High',
        location: 'Pharmacy Quarantine Safe #2 (Locked)',
        lastVerified: timestamp,
        coldChainCompliant: false,
        isDuplicate: true,
        isPackagingAnomaly: true,
        quarantineReason: params.reason,
        quarantineNotes: params.notes,
        quarantinedAt: timestamp,
        quarantinedBy: reviewer,
      });
    }

    // 2. Update Shipment Verification record
    const shpIdx = this.shipments.findIndex(
      (s) => s.id === params.shipmentId || s.batchNumber === params.batchNumber
    );
    if (shpIdx >= 0) {
      this.shipments[shpIdx] = {
        ...this.shipments[shpIdx],
        status: 'Quarantined',
        primaryIssue: params.reason,
        inspectorNotes: `${this.shipments[shpIdx].inspectorNotes || ''} | Quarantined by ${reviewer}: ${params.reason} (${params.notes || 'No extra notes'})`,
      };
    }

    // 3. Create or Link Incident
    const existingIncident = this.incidents.find(
      (inc) => inc.batchNumber === params.batchNumber || inc.shipmentId === params.shipmentId
    );

    if (existingIncident) {
      existingIncident.status = 'ESCALATED';
      existingIncident.timeline.push({
        id: `TL-Q-${Date.now()}`,
        timestamp,
        actor: reviewer,
        actorType: 'chemist',
        action: `Batch quarantined at pharmacy receiving: ${params.reason}`,
        reason: params.notes,
        statusChange: { from: existingIncident.status, to: 'ESCALATED' },
      });
    } else {
      const newInc: RegulatoryIncident = {
        id: `INC-${Date.now().toString().slice(-6)}`,
        title: `Quarantine Incident: ${params.medicineName} (${params.batchNumber})`,
        severity: 'HIGH',
        status: 'NEW',
        createdAt: timestamp,
        updatedAt: timestamp,
        store: {
          id: 'STORE-DEL-01',
          name: 'MediShield Flagship Pharmacy (Connaught Place)',
          location: 'Delhi Central',
          licenseNumber: 'DL-PH-9921-2024',
          manager: reviewer,
        },
        supplier: {
          id: 'SUP-MEDROUTE',
          name: 'MedRoute Distributors',
          location: 'Ghaziabad Logistics Park',
          licenseNumber: 'UP-WHL-4421-2023',
          contactEmail: 'compliance@medroute.in',
        },
        manufacturer: {
          id: 'MFG-PHARMA',
          name: 'Certified Pharma Facility',
          facility: 'Unit 4, Baddi Industrial Estate, HP',
          license: 'HP-MFG-9901',
        },
        medicine: {
          name: params.medicineName,
          genericName: 'Formulation',
          category: 'Pharmaceutical',
          gtin: '08901112223334',
        },
        batchNumber: params.batchNumber,
        shipmentId: params.shipmentId || 'SHP-001',
        serialNumber: params.serialNumber,
        detectionReason: params.reason,
        riskScore: 85,
        evidence: {
          verificationRecords: [`Quarantine issued by ${reviewer}`, `Reason: ${params.reason}`],
          packagingObservations: [params.notes || 'Anomalies recorded during dock scan'],
        },
        assignedReviewer: {
          name: reviewer,
          role: 'Chemist / Dock Inspector',
          agency: 'MediShield Internal Pharmacy Security',
        },
        relatedIncidents: [],
        timeline: [
          {
            id: `TL-INIT-${Date.now()}`,
            timestamp,
            actor: reviewer,
            actorType: 'chemist',
            action: `Quarantined batch ${params.batchNumber}: ${params.reason}`,
            reason: params.notes,
          },
        ],
      };
      this.incidents.unshift(newInc);
    }

    // 4. Create Audit Log Event
    this.auditEvents.unshift({
      id: `AUD-Q-${Date.now()}`,
      type: 'quarantine',
      timestamp: `${timestamp} UTC`,
      description: `Chemist quarantined batch ${params.batchNumber} (${params.medicineName}): ${params.reason}`,
      shipmentId: params.shipmentId || 'SHP-001',
      supplier: 'MedRoute Distributors',
    });

    // 5. Create Blockchain Block
    blockchainService.addBlock({
      transactionId: `TX-Q-${Date.now()}`,
      timestamp,
      eventType: 'STATUS_CHANGE',
      actor: reviewer,
      actorRole: 'Chemist / Pharmacist',
      shipmentId: params.shipmentId || 'SHP-001',
      medicineId: `MED-${params.batchNumber}`,
      medicineName: params.medicineName,
      batchId: params.batchNumber,
      eventData: {
        previousStatus: 'INBOUND_INSPECTION',
        newStatus: 'QUARANTINED',
        quarantineReason: params.reason,
        inspectorNotes: params.notes || '',
        quarantinedBy: reviewer,
        timestamp,
      },
    });

    this.persist();
    this.addNotification(
      'Batch Quarantined',
      `Batch ${params.batchNumber} has been locked in quarantine. Audit log and blockchain blocks recorded.`,
      'warning'
    );
  }

  // RELEASE FROM QUARANTINE WORKFLOW
  public releaseFromQuarantine(params: {
    batchNumber: string;
    serialNumber: string;
    shipmentId: string;
    reason: string;
    reviewer: string;
    authCode: string;
  }): boolean {
    if (!params.authCode || params.authCode.trim().length < 3) {
      this.addNotification('Release Failed', 'Valid supervisor authorization code is required.', 'error');
      return false;
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 1. Update Inventory
    const invIdx = this.inventory.findIndex(
      (i) => i.batchNumber === params.batchNumber || i.serialNumber === params.serialNumber
    );
    if (invIdx >= 0) {
      this.inventory[invIdx] = {
        ...this.inventory[invIdx],
        verificationStatus: 'Verified',
        releasedAt: timestamp,
        releasedBy: params.reviewer,
        releaseReason: params.reason,
        location: 'Active Shelf Bay A-1',
      };
    }

    // 2. Update Shipment
    const shpIdx = this.shipments.findIndex(
      (s) => s.id === params.shipmentId || s.batchNumber === params.batchNumber
    );
    if (shpIdx >= 0) {
      this.shipments[shpIdx] = {
        ...this.shipments[shpIdx],
        status: 'Accepted',
        inspectorNotes: `${this.shipments[shpIdx].inspectorNotes || ''} | Released by ${params.reviewer}: ${params.reason}`,
      };
    }

    // 3. Create Audit Event
    this.auditEvents.unshift({
      id: `AUD-REL-${Date.now()}`,
      type: 'accept',
      timestamp: `${timestamp} UTC`,
      description: `Authorized release of batch ${params.batchNumber} from quarantine by ${params.reviewer}. Reason: ${params.reason}`,
      shipmentId: params.shipmentId || 'SHP-001',
      supplier: 'MedRoute Distributors',
    });

    // 4. Create Blockchain Block
    blockchainService.addBlock({
      transactionId: `TX-REL-${Date.now()}`,
      timestamp,
      eventType: 'STATUS_CHANGE',
      actor: params.reviewer,
      actorRole: 'Chemist / Pharmacist',
      shipmentId: params.shipmentId || 'SHP-001',
      medicineId: `MED-${params.batchNumber}`,
      medicineName: 'Released Formulation',
      batchId: params.batchNumber,
      eventData: {
        previousStatus: 'QUARANTINED',
        newStatus: 'VERIFIED_ACTIVE',
        releaseReason: params.reason,
        authCodeProvided: params.authCode,
        reviewer: params.reviewer,
        timestamp,
      },
    });

    this.persist();
    this.addNotification(
      'Stock Released',
      `Batch ${params.batchNumber} has been verified and returned to active pharmacy shelves.`,
      'success'
    );
    return true;
  }

  public releaseMedicine(batchNumber: string, reason: string, reviewer: string) {
    const inv = this.inventory.find((i) => i.batchNumber === batchNumber);
    return this.releaseFromQuarantine({
      batchNumber,
      serialNumber: inv?.serialNumber || `GS1-${batchNumber}`,
      shipmentId: inv?.shipmentId || 'SHP-001',
      reason,
      reviewer,
      authCode: 'AUTH-SUPV-901',
    });
  }

  // ENTIRE STOCK CONTINUOUS SCANNER SESSION
  public recordStockScanSession(session: StockScanSession) {
    this.scanSessions.unshift(session);
    this.scanSessions = this.scanSessions.slice(0, 20);

    // Audit event
    this.auditEvents.unshift({
      id: `AUD-STOCK-${Date.now()}`,
      type: 'scan',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      description: `Chemist completed entire-stock scanning session (${session.totalScanned} units: ${session.verifiedCount} verified, ${session.quarantineCount} quarantined, ${session.duplicateCount} duplicate serials).`,
      shipmentId: 'ALL-STOCK',
      supplier: 'Multiple Suppliers',
    });

    this.persist();
    this.addNotification(
      'Stock Scan Completed',
      `Scanned ${session.totalScanned} items. ${session.verifiedCount} verified, ${session.quarantineCount} quarantined.`,
      'info'
    );
  }

  // REGULATORY ESCALATION WORKFLOW
  public escalateIncidentToRegulatory(params: {
    incidentId: string;
    reason: string;
    notes?: string;
    reviewer?: string;
  }): RegulatoryCase {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const reviewer = params.reviewer || 'Chief Pharmacy Regulatory Officer';

    // 1. Update Incident
    const inc = this.incidents.find((i) => i.id === params.incidentId);
    if (inc) {
      inc.status = 'ESCALATED';
      inc.regulatoryNotes = params.notes;
      inc.escalatedToAgency = 'CDSCO Central Vigilance';
      inc.timeline.push({
        id: `TL-ESC-${Date.now()}`,
        timestamp,
        actor: reviewer,
        actorType: 'officer',
        action: `Escalated for Regulatory Review: ${params.reason}`,
        reason: params.notes,
        statusChange: { from: 'UNDER REVIEW', to: 'ESCALATED' },
      });
    }

    // 2. Create or link Regulatory Case
    const newCase: RegulatoryCase = {
      id: `CASE-CDSCO-${Date.now().toString().slice(-4)}`,
      caseNumber: `CASE-2026-${Math.floor(100 + Math.random() * 900)}-${inc?.supplier.name.substring(0, 5).toUpperCase() || 'SUP'}`,
      title: `Regulatory Escalation: ${inc?.title || 'Suspicious Medicine Batch'}`,
      priority: 'CRITICAL',
      status: 'INVESTIGATION',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      leadInvestigator: 'CDSCO Designated Drug Inspector',
      agency: 'CDSCO Central Drugs Standard Control Organisation',
      incidentIds: [params.incidentId],
      shipmentIds: [inc?.shipmentId || 'SHP-001'],
      affectedStores: [inc?.store.id || 'STORE-DEL-01'],
      affectedSuppliers: [inc?.supplier.id || 'SUP-MEDROUTE'],
      affectedManufacturers: [inc?.manufacturer.id || 'MFG-GSK'],
      medicines: [inc?.medicine.name || 'Amoxicillin 500mg'],
      batches: [inc?.batchNumber || 'AMX-2026-081'],
      detectionPattern: params.reason,
      evidenceSummary: `Escalated by ${reviewer}. Evidence items include digital scan records, duplicate barcode collision, and tamper logs.`,
      evidencePackageHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      regulatoryActionDirectives: [
        'Notice to distributor requesting batch consignment log.',
        'Immediate inter-store quarantine advisory issued.',
      ],
      notes: [params.notes || 'Escalation initiated from MediShield Pharmacist console.'],
      timeline: [
        {
          timestamp,
          actor: reviewer,
          action: `Escalation confirmed: ${params.reason}`,
          note: params.notes,
        },
      ],
    };

    this.cases.unshift(newCase);

    // 3. Audit event
    this.auditEvents.unshift({
      id: `AUD-ESC-${Date.now()}`,
      type: 'alert',
      timestamp: `${timestamp} UTC`,
      description: `Regulatory Case ${newCase.caseNumber} created from Incident ${params.incidentId} by ${reviewer}.`,
      shipmentId: inc?.shipmentId || 'SHP-001',
      supplier: inc?.supplier.name || 'MedRoute Distributors',
    });

    // 4. Blockchain event
    blockchainService.addBlock({
      transactionId: `TX-ESC-${Date.now()}`,
      timestamp,
      eventType: 'REGULATORY_ESCALATED',
      actor: reviewer,
      actorRole: 'Regulatory Inspector',
      shipmentId: inc?.shipmentId || 'SHP-001',
      medicineId: `MED-${inc?.batchNumber || 'AMX'}`,
      medicineName: inc?.medicine.name || 'Amoxicillin 500mg',
      batchId: inc?.batchNumber || 'AMX-2026-081',
      eventData: {
        incidentId: params.incidentId,
        caseNumber: newCase.caseNumber,
        escalationReason: params.reason,
        notes: params.notes,
        reviewer,
        timestamp,
      },
    });

    this.persist();
    this.addNotification(
      'Case Escalated to CDSCO',
      `Regulatory Case ${newCase.caseNumber} created. Evidence package anchored in blockchain.`,
      'success'
    );
    return newCase;
  }

  // GENERATE REGULATORY EVIDENCE PACKAGE (JSON / CSV / PDF Text Representation)
  public generateRegulatoryEvidencePackage(caseId: string, format: 'json' | 'csv' | 'pdf' = 'json') {
    const regCase = this.cases.find((c) => c.id === caseId) || this.cases[0];
    const relatedIncidents = this.incidents.filter((i) => regCase.incidentIds.includes(i.id));

    const packageData = {
      dossierId: `REG-EVID-${regCase.id}`,
      generatedAt: new Date().toISOString(),
      caseNumber: regCase.caseNumber,
      title: regCase.title,
      agency: regCase.agency,
      leadInvestigator: regCase.leadInvestigator,
      priority: regCase.priority,
      status: regCase.status,
      sha256Hash: regCase.evidencePackageHash,
      evidenceSummary: regCase.evidenceSummary,
      detectionPattern: regCase.detectionPattern,
      affectedEntities: {
        stores: regCase.affectedStores,
        suppliers: regCase.affectedSuppliers,
        manufacturers: regCase.affectedManufacturers,
      },
      medicines: regCase.medicines,
      batches: regCase.batches,
      shipments: regCase.shipmentIds,
      regulatoryDirectives: regCase.regulatoryActionDirectives,
      incidents: relatedIncidents.map((inc) => ({
        id: inc.id,
        detectionReason: inc.detectionReason,
        riskScore: inc.riskScore,
        createdAt: inc.createdAt,
        evidence: inc.evidence,
      })),
      timeline: regCase.timeline,
      blockchainAuditLedger: blockchainService.getChain(),
    };

    if (format === 'csv') {
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [
          'Dossier ID,Case Number,Title,Priority,Status,SHA256 Hash,Batch,Supplier',
          `"${packageData.dossierId}","${packageData.caseNumber}","${packageData.title}","${packageData.priority}","${packageData.status}","${packageData.sha256Hash}","${packageData.batches.join('; ')}","${packageData.affectedEntities.suppliers.join('; ')}"`,
        ].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Dossier_${regCase.caseNumber}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(packageData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Regulatory_Package_${regCase.caseNumber}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      window.print();
    }

    this.addNotification(
      'Evidence Package Generated',
      `Regulatory dossier exported with verified SHA-256 anchor: ${regCase.evidencePackageHash.slice(0, 12)}...`,
      'success'
    );
    return packageData;
  }

  // =========================================================================
  // COMPLETE SUPPLY-CHAIN HANDOFF METHODS (Manufacturer -> Wholesaler -> Pharmacist -> Patient)
  // =========================================================================

  /**
   * 1. MANUFACTURER: Create / Register Medicine Batch
   */
  public createMedicineBatch(data: {
    medicineName: string;
    genericName: string;
    batchNumber: string;
    manufacturer: string;
    manufacturerLocation: string;
    unitsManufactured: number;
    mfgDate: string;
    expiryDate: string;
    storageRequirements: string;
    serialNumbers: string[];
  }) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const medicineId = `MED-${data.batchNumber.split('-')[0] || 'GEN'}-${Math.floor(100 + Math.random() * 900)}`;

    const newBlock = blockchainService.addBlock({
      transactionId: `TX-MFG-${Date.now().toString().slice(-6)}`,
      timestamp,
      eventType: 'MANUFACTURED',
      actor: `${data.manufacturer} (${data.manufacturerLocation})`,
      actorRole: 'Manufacturer',
      shipmentId: `SHP-INIT-${data.batchNumber}`,
      medicineId,
      medicineName: data.medicineName,
      batchId: data.batchNumber,
      eventData: {
        action: 'Batch Registered & Encrypted Serial Tags Generated',
        genericName: data.genericName,
        unitsManufactured: data.unitsManufactured,
        mfgDate: data.mfgDate,
        expiryDate: data.expiryDate,
        storageRequirements: data.storageRequirements,
        serialCount: data.serialNumbers.length,
        initialSerialSample: data.serialNumbers.slice(0, 3).join(', '),
      },
    });

    this.auditEvents.unshift({
      id: `EVT-${Date.now()}`,
      type: 'accept',
      timestamp: 'Just now',
      description: `Batch ${data.batchNumber} (${data.unitsManufactured} units) produced at ${data.manufacturerLocation}.`,
      shipmentId: `BATCH-${data.batchNumber}`,
      supplier: data.manufacturer,
      role: 'Manufacturer',
    });

    this.persist();
    this.addNotification(
      'Batch Genesis Recorded',
      `Batch ${data.batchNumber} registered. Blockchain Block #${newBlock.blockNumber} created.`,
      'success'
    );

    return { medicineId, block: newBlock };
  }

  /**
   * 2. MANUFACTURER: Create Outgoing Shipment to Wholesaler
   */
  public createManufacturerShipment(data: {
    batchNumber: string;
    medicineName: string;
    manufacturer: string;
    wholesaler: string;
    wholesalerLocation: string;
    quantity: number;
    carrierName: string;
    targetTemp: string;
  }): ShipmentVerification {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const shipmentId = `SHP-M2W-${Math.floor(100 + Math.random() * 900)}`;

    const newShipment: ShipmentVerification = {
      id: shipmentId,
      batchNumber: data.batchNumber,
      medicineName: data.medicineName,
      category: 'General Therapeutics',
      quantity: data.quantity,
      supplier: data.manufacturer,
      verifiedAt: timestamp,
      status: 'Accepted',
      primaryIssue: 'None (Genesis Dispatch)',
      location: 'In Transit',
      expiryDate: '2028-09-30',
      riskScore: 8,
      serialCount: data.quantity,
      originLocation: 'Manufacturer Central Facility',
      destinationLocation: `${data.wholesaler} (${data.wholesalerLocation})`,
      dispatchDate: timestamp.slice(0, 10),
      estimatedArrival: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      verificationStatus: 'IN_TRANSIT',
      overallRisk: 'Low',
      isFlagged: false,
      coldChainCompliant: true,
      serialCheckPassed: true,
      packagingScore: 99,
      temperatureLog: [
        { time: '08:00', temp: 4.2, status: 'normal' },
        { time: '12:00', temp: 4.5, status: 'normal' },
      ],
      currentLocation: 'In Transit — En Route to Wholesaler Hub',
      scannedSerialCount: data.quantity,
      verifiedSerialCount: data.quantity,
      blockchainTxHash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
      auditLogs: [
        {
          timestamp,
          actor: data.manufacturer,
          role: 'Manufacturer Dispatch Dock',
          action: 'Consignment Sealed and Sealed for Wholesaler Transit',
        },
      ],
    };

    this.shipments.unshift(newShipment);

    this.supplyChainNotifications.unshift({
      notificationId: `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`,
      recipientOrg: data.wholesaler,
      recipientRole: 'Wholesaler',
      type: 'NEW_SHIPMENT',
      title: '🔴 NEW SHIPMENT ALERT',
      message: `Consignment of ${data.quantity} units of ${data.medicineName} (Batch: ${data.batchNumber}) dispatched by ${data.manufacturer}. Required action: Receive & Verify.`,
      shipmentId,
      batchId: data.batchNumber,
      medicineId: `MED-${data.batchNumber}`,
      sourceOrg: data.manufacturer,
      sourceRole: 'Manufacturer',
      createdAt: timestamp,
      readAt: null,
      actionedAt: null,
      status: 'CREATED',
      priority: 'high',
      relatedRoute: 'wholesaler',
    });

    blockchainService.addBlock({
      transactionId: `TX-DISP-M2W-${Date.now().toString().slice(-6)}`,
      timestamp,
      eventType: 'DISPATCHED_BY_MANUFACTURER',
      actor: data.manufacturer,
      actorRole: 'Manufacturer',
      shipmentId,
      medicineId: `MED-${data.batchNumber}`,
      medicineName: data.medicineName,
      batchId: data.batchNumber,
      eventData: {
        action: 'Dispatched to Wholesaler Depot',
        destinationWholesaler: data.wholesaler,
        wholesalerLocation: data.wholesalerLocation,
        quantity: data.quantity,
        carrierName: data.carrierName,
        targetTemp: data.targetTemp,
        stage: 1,
      },
    });

    this.persist();
    this.addNotification(
      'Shipment Dispatched to Wholesaler',
      `Shipment ${shipmentId} dispatched from Manufacturer to ${data.wholesaler}.`,
      'info'
    );

    return newShipment;
  }

  /**
   * 3. WHOLESALER: Receive & Verify Incoming Shipment
   */
  public receiveWholesalerShipment(
    shipmentId: string,
    wholesalerName: string,
    depotLocation: string,
    recordedTemp: number
  ) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const shp = this.shipments.find((s) => s.id === shipmentId);

    const relatedNotif = this.supplyChainNotifications.find((n) => n.shipmentId === shipmentId && n.status !== 'ACTIONED');
    if (relatedNotif) {
      relatedNotif.status = 'ACTIONED';
      relatedNotif.actionedAt = timestamp;
      relatedNotif.readAt = relatedNotif.readAt || timestamp;
    }

    if (shp) {
      shp.verificationStatus = 'PASSED';
      shp.currentLocation = `${wholesalerName} (${depotLocation})`;
      shp.auditLogs = shp.auditLogs || [];
      shp.auditLogs.unshift({
        timestamp,
        actor: wholesalerName,
        role: 'Wholesaler Receiving Inspector',
        action: `Inbound Dock Receipt Verified (${recordedTemp}°C)`,
      });
    }

    const block = blockchainService.addBlock({
      transactionId: `TX-REC-W-${Date.now().toString().slice(-6)}`,
      timestamp,
      eventType: 'RECEIVED_BY_WHOLESALER',
      actor: `${wholesalerName} (${depotLocation})`,
      actorRole: 'Wholesaler',
      shipmentId,
      medicineId: `MED-${shp?.batchNumber || 'GEN'}`,
      medicineName: shp?.medicineName || 'Pharmaceutical Consignment',
      batchId: shp?.batchNumber || 'BATCH-001',
      eventData: {
        action: 'Wholesaler Inbound Dock Scan & Quality Verification',
        depotLocation,
        recordedTemp,
        status: 'ACCEPTED_INTO_WHOLESALE_DEPOT',
        stage: 2,
      },
    });

    this.persist();
    this.addNotification(
      'Consignment Received by Wholesaler',
      `Shipment ${shipmentId} verified & logged at ${wholesalerName} depot.`,
      'success'
    );

    return block;
  }

  /**
   * 4. WHOLESALER: Dispatch Outgoing Child Shipment to Pharmacist
   */
  public dispatchWholesalerShipment(data: {
    shipmentId: string;
    wholesalerName: string;
    pharmacistName: string;
    destinationStore: string;
    quantity: number;
  }) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const parentShp = this.shipments.find((s) => s.id === data.shipmentId);

    if (!parentShp) {
      throw new Error(`Parent shipment ${data.shipmentId} not found.`);
    }

    const currentParentQty = parentShp.quantity ?? 1000;
    const requestedQty = Number(data.quantity) || 100;
    if (requestedQty > currentParentQty) {
      this.addNotification(
        'Dispatch Failed: Insufficient Quantity',
        `Requested ${requestedQty} units, but parent shipment only has ${currentParentQty} units available.`,
        'error'
      );
      return null;
    }

    // Deduct quantity from parent bulk shipment
    parentShp.quantity = Math.max(0, currentParentQty - requestedQty);
    parentShp.auditLogs = parentShp.auditLogs || [];
    parentShp.auditLogs.unshift({
      timestamp,
      actor: data.wholesalerName,
      role: 'Wholesaler Inventory Manager',
      action: `Split bulk consignment: ${requestedQty} units allocated to child shipment for ${data.pharmacistName}. ${parentShp.quantity} units remaining in bulk depot.`,
    });

    // Create child shipment
    const childShipmentId = `SHP-W2P-${Math.floor(100 + Math.random() * 900)}`;
    const childShipment: ShipmentVerification = {
      id: childShipmentId,
      parentShipmentId: parentShp.id,
      batchNumber: parentShp.batchNumber,
      medicineName: parentShp.medicineName,
      category: parentShp.category || 'General Therapeutics',
      quantity: requestedQty,
      supplier: data.wholesalerName,
      verifiedAt: timestamp,
      status: 'Accepted',
      primaryIssue: 'None (Wholesaler Child Dispatch)',
      location: 'In Transit',
      expiryDate: parentShp.expiryDate || '2028-09-30',
      riskScore: parentShp.riskScore || 8,
      serialCount: requestedQty,
      originLocation: parentShp.currentLocation || data.wholesalerName,
      destinationLocation: `${data.pharmacistName} (${data.destinationStore})`,
      dispatchDate: timestamp.slice(0, 10),
      estimatedArrival: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      verificationStatus: 'IN_TRANSIT',
      overallRisk: parentShp.overallRisk || 'Low',
      isFlagged: false,
      coldChainCompliant: parentShp.coldChainCompliant ?? true,
      serialCheckPassed: true,
      packagingScore: 99,
      currentLocation: `In Transit — En route to ${data.pharmacistName}`,
      scannedSerialCount: requestedQty,
      verifiedSerialCount: requestedQty,
      blockchainTxHash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
      referenceHologramUrl: parentShp.referenceHologramUrl,
      batchImageUrl: parentShp.batchImageUrl,
      auditLogs: [
        {
          timestamp,
          actor: data.wholesalerName,
          role: 'Wholesaler Dispatch Dock',
          action: `Child Shipment ${childShipmentId} (${requestedQty} units) dispatched to ${data.pharmacistName} (Parent: ${parentShp.id})`,
        },
      ],
    };

    this.shipments.unshift(childShipment);

    this.supplyChainNotifications.unshift({
      notificationId: `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`,
      recipientOrg: data.pharmacistName.trim(),
      recipientRole: 'Pharmacist',
      type: 'NEW_SHIPMENT',
      title: '🔴 NEW SHIPMENT ALERT',
      message: `Consignment of ${requestedQty} units of ${parentShp.medicineName} (Batch: ${parentShp.batchNumber}) dispatched by ${data.wholesalerName}. Required action: Receive & Verify.`,
      shipmentId: childShipmentId,
      batchId: parentShp.batchNumber,
      medicineId: `MED-${parentShp.batchNumber}`,
      sourceOrg: data.wholesalerName,
      sourceRole: 'Wholesaler',
      createdAt: timestamp,
      readAt: null,
      actionedAt: null,
      status: 'CREATED',
      priority: 'high',
      relatedRoute: 'pharmacist',
    });

    const block = blockchainService.addBlock({
      transactionId: `TX-DISP-W2P-${Date.now().toString().slice(-6)}`,
      timestamp,
      eventType: 'DISPATCHED_BY_WHOLESALER',
      actor: data.wholesalerName,
      actorRole: 'Wholesaler',
      shipmentId: childShipmentId,
      medicineId: `MED-${parentShp.batchNumber}`,
      medicineName: parentShp.medicineName,
      batchId: parentShp.batchNumber,
      eventData: {
        action: 'Wholesaler Child Shipment Dispatched to Pharmacy',
        parentShipmentId: parentShp.id,
        childShipmentId,
        targetPharmacy: data.pharmacistName,
        destinationStore: data.destinationStore,
        dispatchedQuantity: requestedQty,
        parentRemainingQuantity: parentShp.quantity,
        stage: 2,
      },
    });

    this.persist();
    console.log('Dispatch successful, created notification for:', data.pharmacistName, 'Role:', 'Pharmacist');
    this.addNotification(
      'Child Shipment Dispatched to Pharmacist',
      `Child Shipment ${childShipmentId} (${requestedQty} units) en route to ${data.pharmacistName}. Parent remaining: ${parentShp.quantity} units.`,
      'info'
    );

    return block;
  }

  /**
   * 5. PHARMACIST: Confirm Receipt from Wholesaler
   */
  public receivePharmacistShipment(
    shipmentId: string,
    pharmacistName: string,
    pharmacyLocation: string,
    actualReceivedQty?: number,
    discrepancyReason?: string
  ) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const shp = this.shipments.find((s) => s.id === shipmentId);

    const relatedNotif = this.supplyChainNotifications.find((n) => n.shipmentId === shipmentId && n.status !== 'ACTIONED');
    if (relatedNotif) {
      relatedNotif.status = 'ACTIONED';
      relatedNotif.actionedAt = timestamp;
      relatedNotif.readAt = relatedNotif.readAt || timestamp;
    }

    if (shp) {
      shp.verificationStatus = 'PASSED';
      shp.status = 'Accepted';
      shp.currentLocation = `${pharmacistName} (${pharmacyLocation})`;
      
      // Update parent shipment if all children are accepted
      if (shp.parentShipmentId) {
        const parentShp = this.shipments.find((s) => s.id === shp.parentShipmentId);
        if (parentShp) {
          const childShipments = this.shipments.filter((s) => s.parentShipmentId === parentShp.id);
          const allAccepted = childShipments.every((s) => s.status === 'Accepted');
          if (allAccepted) {
            parentShp.status = 'Accepted';
            parentShp.currentLocation = 'Inventory Received at Pharmacy';
          }
        }
      }

      shp.auditLogs = shp.auditLogs || [];

      const expectedQty = shp.quantity ?? 100;
      const qtyReceived = typeof actualReceivedQty === 'number' ? actualReceivedQty : expectedQty;
      const missingQty = Math.max(0, expectedQty - qtyReceived);

      if (missingQty > 0) {
        shp.auditLogs.unshift({
          timestamp,
          actor: pharmacistName,
          role: 'Pharmacist Receiving Dock',
          action: `DISCREPANCY DETECTED: Received ${qtyReceived} of ${expectedQty} expected units (${missingQty} missing/damaged). Notes: ${discrepancyReason || 'Quantity mismatch at dock'}`,
        });
      } else {
        shp.auditLogs.unshift({
          timestamp,
          actor: pharmacistName,
          role: 'Pharmacist Receiving Dock',
          action: `Confirmed receipt of ${qtyReceived} units into licensed pharmacy inventory.`,
        });
      }

      // Auto populate or update pharmacy inventory
      const existingInv = this.inventory.find((i) => i.batchNumber === shp.batchNumber);
      if (existingInv) {
        existingInv.quantity += qtyReceived;
        existingInv.lastVerified = timestamp.slice(0, 16);
      } else {
        const invId = `INV-${shp.batchNumber.split('-')[0] || 'PH'}-${Math.floor(100 + Math.random() * 900)}`;
        this.inventory.unshift({
          id: invId,
          medicineName: shp.medicineName,
          genericName: shp.medicineName,
          category: shp.category || 'General Therapeutics',
          batchNumber: shp.batchNumber,
          serialNumber: `GS1-9874-2026-${shp.batchNumber}-01`,
          manufacturer: shp.supplier || 'Manufacturer',
          supplier: shp.supplier || 'Wholesaler Depot',
          shipmentId: shp.id,
          quantity: qtyReceived,
          expiryDate: shp.expiryDate || '2028-09-30',
          mfgDate: '2026-09-20',
          verificationStatus: 'Verified',
          riskScore: shp.riskScore || 10,
          riskLevel: shp.overallRisk === 'High' ? 'High' : 'Low',
          location: 'Main Vault Shelf A-1',
          lastVerified: timestamp.slice(0, 16),
          coldChainCompliant: shp.coldChainCompliant ?? true,
          isDuplicate: false,
          isPackagingAnomaly: false,
        });
      }
    }

    const block = blockchainService.addBlock({
      transactionId: `TX-REC-P-${Date.now().toString().slice(-6)}`,
      timestamp,
      eventType: 'RECEIVED_BY_PHARMACIST',
      actor: `${pharmacistName} (${pharmacyLocation})`,
      actorRole: 'Pharmacist',
      shipmentId,
      medicineId: `MED-${shp?.batchNumber || 'GEN'}`,
      medicineName: shp?.medicineName || 'Pharmaceutical Consignment',
      batchId: shp?.batchNumber || 'BATCH-001',
      eventData: {
        action: 'Licensed Pharmacist Receipt & Barcode Verification',
        pharmacyLocation,
        expectedQuantity: shp?.quantity || 0,
        actualReceivedQuantity: typeof actualReceivedQty === 'number' ? actualReceivedQty : shp?.quantity || 0,
        discrepancyCount: actualReceivedQty !== undefined && shp ? Math.max(0, (shp.quantity || 0) - actualReceivedQty) : 0,
        status: 'VERIFIED_ACCEPTED',
        stage: 3,
      },
    });

    this.persist();
    this.addNotification(
      'Received & Added to Pharmacy Inventory',
      `Shipment ${shipmentId} accepted into pharmacy dock. Active stock updated.`,
      'success'
    );

    return block;
  }

  /**
   * 6. PHARMACIST: Place into Active Pharmacy Inventory
   */
  public addToPharmacyInventory(item: Omit<InventoryItem, 'id' | 'lastVerified'>) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const invId = `INV-${item.batchNumber.split('-')[0] || 'PH'}-${Math.floor(100 + Math.random() * 900)}`;

    const newInvItem: InventoryItem = {
      ...item,
      id: invId,
      lastVerified: timestamp.slice(0, 16),
    };

    this.inventory.unshift(newInvItem);

    blockchainService.addBlock({
      transactionId: `TX-INV-ADD-${Date.now().toString().slice(-6)}`,
      timestamp,
      eventType: 'ADDED_TO_INVENTORY',
      actor: item.manufacturer || 'Licensed Pharmacy Staff',
      actorRole: 'Pharmacist',
      shipmentId: item.shipmentId || 'SHP-STOCK-01',
      medicineId: `MED-${item.batchNumber}`,
      medicineName: item.medicineName,
      batchId: item.batchNumber,
      eventData: {
        action: 'Added to Pharmacy Active Dispensing Inventory',
        shelfLocation: item.location,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
        verificationStatus: item.verificationStatus,
      },
    });

    this.persist();
    this.addNotification(
      'Added to Pharmacy Inventory',
      `${item.medicineName} (Batch ${item.batchNumber}) placed in ${item.location}.`,
      'success'
    );

    return newInvItem;
  }

  /**
   * 7. PHARMACIST: Dispatch Outgoing Shipment to Chemist Staff
   */
  public dispatchPharmacistToChemist(data: {
    inventoryId: string;
    pharmacistName: string;
    chemistName: string;
    destinationChemist: string;
    quantity: number;
  }) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const item = this.inventory.find((i) => i.id === data.inventoryId);

    if (!item) {
      throw new Error(`Inventory item ${data.inventoryId} not found.`);
    }

    const currentQty = item.quantity;
    const requestedQty = Number(data.quantity);
    if (requestedQty > currentQty) {
      this.addNotification(
        'Dispatch Failed',
        `Insufficient stock. Available: ${currentQty}`,
        'error'
      );
      return null;
    }

    // Deduct from pharmacy inventory
    item.quantity -= requestedQty;
    item.lastVerified = timestamp.slice(0, 16);

    // Create child shipment
    const childShipmentId = `SHP-P2C-${Math.floor(100 + Math.random() * 900)}`;
    const childShipment: ShipmentVerification = {
      id: childShipmentId,
      parentShipmentId: item.shipmentId,
      batchNumber: item.batchNumber,
      medicineName: item.medicineName,
      category: item.category,
      quantity: requestedQty,
      supplier: 'Licensed Pharmacy',
      verifiedAt: timestamp,
      status: 'Accepted',
      primaryIssue: 'None (Pharmacy Dispatch to Chemist)',
      location: 'In Transit',
      expiryDate: item.expiryDate,
      riskScore: item.riskScore,
      serialCount: requestedQty,
      originLocation: 'Pharmacy Central Vault',
      destinationLocation: `${data.chemistName} (${data.destinationChemist})`,
      dispatchDate: timestamp.slice(0, 10),
      estimatedArrival: timestamp.slice(0, 10),
      verificationStatus: 'IN_TRANSIT',
      overallRisk: item.riskLevel === 'High' ? 'High' : 'Low',
      isFlagged: false,
      coldChainCompliant: item.coldChainCompliant,
      serialCheckPassed: true,
      packagingScore: 99,
      currentLocation: `In Transit — En route to ${data.chemistName}`,
      scannedSerialCount: requestedQty,
      verifiedSerialCount: requestedQty,
      blockchainTxHash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
      auditLogs: [
        {
          timestamp,
          actor: data.pharmacistName,
          role: 'Pharmacist',
          action: `Stock dispatched to Chemist Staff: ${data.chemistName} at ${data.destinationChemist}.`,
        },
      ],
    };

    this.shipments.unshift(childShipment);

    this.supplyChainNotifications.unshift({
      notificationId: `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`,
      recipientOrg: data.destinationChemist.trim(),
      recipientRole: 'Chemist',
      type: 'NEW_SHIPMENT',
      title: '🔴 NEW SHIPMENT ALERT',
      message: `${requestedQty} units of ${item.medicineName} (Batch: ${item.batchNumber}) dispatched by Central Pharmacy. Action required: Receive & Verify.`,
      shipmentId: childShipmentId,
      batchId: item.batchNumber,
      medicineId: `MED-${item.batchNumber}`,
      sourceOrg: 'Central Pharmacy',
      sourceRole: 'Pharmacist',
      createdAt: timestamp,
      readAt: null,
      actionedAt: null,
      status: 'CREATED',
      priority: 'high',
      relatedRoute: 'chemist',
    });

    const block = blockchainService.addBlock({
      transactionId: `TX-DISP-P2C-${Date.now().toString().slice(-6)}`,
      timestamp,
      eventType: 'DISPATCHED_BY_PHARMACIST',
      actor: data.pharmacistName,
      actorRole: 'Pharmacist',
      shipmentId: childShipmentId,
      medicineId: `MED-${item.batchNumber}`,
      medicineName: item.medicineName,
      batchId: item.batchNumber,
      eventData: {
        action: 'Pharmacist Dispatched verified stock to Chemist Staff',
        parentShipmentId: item.shipmentId,
        destinationChemist: data.destinationChemist,
        chemistName: data.chemistName,
        quantity: requestedQty,
        itemStatus: 'Verified',
        stage: 3,
      },
    });

    this.persist();
    this.addNotification(
      'Stock Sent to Chemist',
      `Shipment ${childShipmentId} en route to ${data.destinationChemist}.`,
      'success'
    );

    return block;
  }

  /**
   * 8. CHEMIST STAFF: Confirm Receipt from Pharmacist
   */
  public receiveChemistShipment(
    shipmentId: string,
    chemistName: string,
    chemistStation: string
  ) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const shp = this.shipments.find((s) => s.id === shipmentId);

    const relatedNotif = this.supplyChainNotifications.find((n) => n.shipmentId === shipmentId && n.status !== 'ACTIONED');
    if (relatedNotif) {
      relatedNotif.status = 'ACTIONED';
      relatedNotif.actionedAt = timestamp;
      relatedNotif.readAt = relatedNotif.readAt || timestamp;
    }

    if (shp) {
      shp.verificationStatus = 'PASSED';
      shp.status = 'Accepted';
      shp.currentLocation = `${chemistName} (${chemistStation})`;
      
      shp.auditLogs = shp.auditLogs || [];
      shp.auditLogs.unshift({
        timestamp,
        actor: chemistName,
        role: 'Chemist Staff',
        action: `Inbound stock received and verified at dispensing station.`,
      });

      // Add to inventory for Chemist
      const invId = `INV-C-${shp.batchNumber.split('-')[0] || 'CH'}-${Math.floor(100 + Math.random() * 900)}`;
      this.inventory.unshift({
        id: invId,
        medicineName: shp.medicineName,
        genericName: shp.medicineName,
        category: shp.category || 'General Therapeutics',
        batchNumber: shp.batchNumber,
        serialNumber: `GS1-9874-2026-${shp.batchNumber}-01`,
        manufacturer: shp.supplier || 'Manufacturer',
        supplier: shp.supplier || 'Pharmacy',
        shipmentId: shp.id,
        quantity: shp.quantity || 0,
        expiryDate: shp.expiryDate || '2028-09-30',
        mfgDate: '2026-09-20',
        verificationStatus: 'Verified',
        riskScore: shp.riskScore || 5,
        riskLevel: 'Low',
        location: `Counter ${chemistStation}`,
        lastVerified: timestamp.slice(0, 16),
        coldChainCompliant: shp.coldChainCompliant ?? true,
        isDuplicate: false,
        isPackagingAnomaly: false,
      });
    }

    const block = blockchainService.addBlock({
      transactionId: `TX-REC-C-${Date.now().toString().slice(-6)}`,
      timestamp,
      eventType: 'RECEIVED_BY_CHEMIST',
      actor: `${chemistName} (${chemistStation})`,
      actorRole: 'Chemist',
      shipmentId,
      medicineId: `MED-${shp?.batchNumber || 'GEN'}`,
      medicineName: shp?.medicineName || 'Dispensing Stock',
      batchId: shp?.batchNumber || 'BATCH-001',
      eventData: {
        action: 'Chemist Staff Receipt & Final Integrity Verification',
        chemistStation,
        status: 'VERIFIED_READY_TO_DISPENSE',
        stage: 4,
      },
    });

    this.persist();
    this.addNotification(
      'Stock Ready to Dispense',
      `Shipment ${shipmentId} accepted and verified at Chemist station.`,
      'success'
    );

    return block;
  }

  /**
   * 9. CHEMIST STAFF: Dispense / Sell Medicine to Patient (FINAL STAGE)
   */
  public dispenseMedicine(
    inventoryId: string,
    quantityDispensed: number = 1,
    patientIdentifier: string = 'PATIENT-ANON-992'
  ) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const item = this.inventory.find((i) => i.id === inventoryId);

    if (item) {
      item.quantity = Math.max(0, item.quantity - quantityDispensed);
      item.lastVerified = timestamp.slice(0, 16);
    }

    const block = blockchainService.addBlock({
      transactionId: `TX-DISPENSE-${Date.now().toString().slice(-6)}`,
      timestamp,
      eventType: 'DISPENSED',
      actor: 'Chemist Staff Dispensing Station',
      actorRole: 'Chemist',
      shipmentId: item?.shipmentId || 'SHP-DISP-01',
      medicineId: `MED-${item?.batchNumber || 'GEN'}`,
      medicineName: item?.medicineName || 'Prescription Medicine',
      batchId: item?.batchNumber || 'BATCH-001',
      eventData: {
        action: 'Medicine Dispensed to Patient by Chemist Staff',
        quantityDispensed,
        remainingStock: item?.quantity || 0,
        patientHashTag: patientIdentifier,
        dispensedStatus: 'COMPLETED_VERIFIED',
        stage: 5,
      },
    });

    this.auditEvents.unshift({
      id: `EVT-SALE-${Date.now()}`,
      type: 'accept',
      timestamp: 'Just now',
      description: `${quantityDispensed} unit(s) of ${item?.medicineName || 'Medicine'} dispensed safely to patient ${patientIdentifier}.`,
      shipmentId: item?.shipmentId || 'SHP-DISPENSE',
      supplier: item?.supplier || 'Pharmacy',
      role: 'Chemist',
    });

    this.persist();
    this.addNotification(
      'Medicine Dispensed to Patient',
      `Dispensing transaction anchored by Chemist Staff.`,
      'success'
    );

    return block;
  }

  // HOLOGRAM MANAGEMENT METHODS
  public getHologramReference(batchNumber: string): HologramReference | null {
    return this.hologramReferences.find((r) => r.batchNumber === batchNumber) || null;
  }

  public getAllHologramReferences(): HologramReference[] {
    return this.hologramReferences;
  }

  public createHologramReference(data: {
    medicineId: string;
    medicineName: string;
    genericName?: string;
    batchId: string;
    batchNumber: string;
    manufacturerId: string;
    manufacturerName: string;
    referenceImageUrl: string;
    batchImageUrl?: string;
    location: string;
    notes?: string;
  }): HologramReference {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST';
    const ref: HologramReference = {
      id: `HOL-REF-${Date.now()}`,
      medicineId: data.medicineId,
      medicineName: data.medicineName,
      genericName: data.genericName,
      batchId: data.batchId,
      batchNumber: data.batchNumber,
      manufacturerId: data.manufacturerId,
      manufacturerName: data.manufacturerName,
      referenceImageUrl: data.referenceImageUrl,
      batchImageUrl: data.batchImageUrl,
      timestamp,
      location: data.location,
      status: 'Reference Available',
      notes: data.notes,
    };

    const idx = this.hologramReferences.findIndex((r) => r.batchNumber === data.batchNumber);
    if (idx >= 0) {
      this.hologramReferences[idx] = ref;
    } else {
      this.hologramReferences.unshift(ref);
    }

    const block = blockchainService.addBlock({
      transactionId: `TX-HOL-REF-${Date.now().toString().slice(-6)}`,
      timestamp,
      eventType: 'HOLOGRAM_REFERENCE_CREATED',
      actor: data.manufacturerName,
      actorRole: 'Manufacturer',
      shipmentId: `SHP-${data.batchNumber}`,
      medicineId: data.medicineId,
      medicineName: data.medicineName,
      batchId: data.batchId,
      eventData: {
        action: 'Manufacturer Official Hologram Reference Registered',
        referenceId: ref.id,
        batchNumber: data.batchNumber,
        manufacturer: data.manufacturerName,
        location: data.location,
        hasBatchImage: !!data.batchImageUrl,
      },
    });

    ref.blockchainTxHash = block.currentHash;

    this.shipments.forEach((s) => {
      if (s.batchNumber === data.batchNumber) {
        s.referenceHologramUrl = data.referenceImageUrl;
        s.batchImageUrl = data.batchImageUrl;
        s.hologramStatus = 'Reference Available';
      }
    });

    this.inventory.forEach((i) => {
      if (i.batchNumber === data.batchNumber) {
        i.lastVerified = timestamp;
      }
    });

    this.auditEvents.unshift({
      id: `EVT-HOL-REF-${Date.now()}`,
      type: 'accept',
      timestamp: 'Just now',
      description: `Official reference hologram registered for batch ${data.batchNumber} at ${data.location}.`,
      shipmentId: `BATCH-${data.batchNumber}`,
      supplier: data.manufacturerName,
      role: 'Manufacturer',
    });

    this.persist();
    this.addNotification(
      'Reference Hologram Created',
      `Official hologram reference registered for Batch ${data.batchNumber}.`,
      'success'
    );

    return ref;
  }

  public recordHologramCheck(data: HologramCheck): HologramCheck {
    this.hologramChecks.unshift(data);

    let eventType: BlockchainBlock['eventType'] = 'MEDICINE_VERIFIED';
    if (data.actorRole === 'Wholesaler') eventType = 'HOLOGRAM_CHECKED_BY_WHOLESALER';
    else if (data.actorRole === 'Pharmacist' || data.actorRole === 'Chemist') eventType = 'HOLOGRAM_CHECKED_BY_PHARMACIST';
    else if (data.actorRole === 'Patient') eventType = 'CLIENT_VERIFICATION';

    const block = blockchainService.addBlock({
      transactionId: `TX-HOL-CHK-${Date.now().toString().slice(-6)}`,
      timestamp: data.timestamp,
      eventType,
      actor: `${data.actor} (${data.organization})`,
      actorRole: data.actorRole as any,
      shipmentId: data.shipmentId || `SHP-${data.batchNumber}`,
      medicineId: data.medicineId,
      medicineName: data.medicineName,
      batchId: data.batchId,
      eventData: {
        action: `Hologram Inspection Executed: ${data.resultLabel}`,
        result: data.result,
        resultLabel: data.resultLabel,
        inspectorRole: data.actorRole,
        location: data.location,
        evidenceAttached: !!data.evidenceReference,
      },
    });

    data.blockchainTxHash = block.currentHash;

    const shp = this.shipments.find((s) => s.batchNumber === data.batchNumber);
    if (shp) {
      shp.lastHologramCheckResult = data.result;
      if (data.result === 'FLAGGED') {
        shp.isFlagged = true;
        shp.overallRisk = 'High';
      }
    }

    this.auditEvents.unshift({
      id: `EVT-HOL-CHK-${Date.now()}`,
      type: data.result === 'PASS' ? 'accept' : data.result === 'FLAGGED' ? 'quarantine' : 'hold',
      timestamp: 'Just now',
      description: `Hologram check by ${data.actorRole} (${data.organization}): ${data.resultLabel}.`,
      shipmentId: data.shipmentId || `BATCH-${data.batchNumber}`,
      supplier: data.organization,
      role: data.actorRole,
    });

    this.persist();
    return data;
  }

  public getHologramChecks(batchNumber?: string): HologramCheck[] {
    if (!batchNumber) return this.hologramChecks;
    return this.hologramChecks.filter((c) => c.batchNumber === batchNumber);
  }

  public getAllHologramChecks(): HologramCheck[] {
    return this.hologramChecks;
  }

  public getHologramStats(): HologramStats {
    const totalChecks = this.hologramChecks.length;
    const passedCount = this.hologramChecks.filter((c) => c.result === 'PASS').length;
    const flaggedCount = this.hologramChecks.filter((c) => c.result === 'FLAGGED').length;
    const unableToVerifyCount = this.hologramChecks.filter((c) => c.result === 'UNABLE_TO_VERIFY').length;

    const checksByRole: Record<string, number> = {};
    const checksBySupplier: Record<string, number> = {};
    const checksByCategory: Record<string, number> = {};
    const failureCountsByBatch: Record<string, { batchNumber: string; medicineName: string; supplier: string; failureCount: number; lastChecked: string }> = {};

    this.hologramChecks.forEach((c) => {
      checksByRole[c.actorRole] = (checksByRole[c.actorRole] || 0) + 1;
      checksBySupplier[c.organization] = (checksBySupplier[c.organization] || 0) + 1;

      if (c.result === 'FLAGGED') {
        if (!failureCountsByBatch[c.batchNumber]) {
          failureCountsByBatch[c.batchNumber] = {
            batchNumber: c.batchNumber,
            medicineName: c.medicineName,
            supplier: c.organization,
            failureCount: 0,
            lastChecked: c.timestamp,
          };
        }
        failureCountsByBatch[c.batchNumber].failureCount += 1;
        failureCountsByBatch[c.batchNumber].lastChecked = c.timestamp;
      }
    });

    const recentIncidents = this.hologramChecks
      .filter((c) => c.result === 'FLAGGED')
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        batchNumber: c.batchNumber,
        medicineName: c.medicineName,
        supplier: c.organization,
        timestamp: c.timestamp,
        result: c.resultLabel,
      }));

    const repeatedFailures = Object.values(failureCountsByBatch).filter((f) => f.failureCount >= 1);

    return {
      totalChecks,
      passedCount,
      flaggedCount,
      unableToVerifyCount,
      checksByRole,
      checksBySupplier,
      checksByCategory,
      recentIncidents,
      repeatedFailures,
    };
  }

  // RESET DEMO DATA FUNCTION
  public createRegulatoryIncident(data: {
    title: string;
    severity: IncidentSeverity;
    store: { id: string; name: string; location: string };
    supplier: { id: string; name: string };
    medicine: { name: string; category: string };
    batchNumber: string;
    shipmentId: string;
    detectionReason: string;
    evidence?: {
      verificationRecords?: string[];
      packagingObservations?: string[];
      capturedHologramUrl?: string;
    };
  }): RegulatoryIncident {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST';
    const incidentId = `INC-${Date.now().toString().slice(-6)}`;

    const newIncident: RegulatoryIncident = {
      id: incidentId,
      title: data.title,
      severity: data.severity,
      status: 'INVESTIGATION',
      createdAt: timestamp,
      updatedAt: timestamp,
      store: {
        id: data.store.id,
        name: data.store.name,
        location: data.store.location,
        licenseNumber: 'DL-PH-2026-9941',
        manager: 'Lead Pharmacist',
      },
      supplier: {
        id: data.supplier.id,
        name: data.supplier.name,
        location: 'Supply Chain Depot',
        licenseNumber: 'WHL-LIC-8820',
        contactEmail: 'compliance@medroute.com',
      },
      manufacturer: {
        id: 'MFG-GENESIS',
        name: 'GlaxoSmithKline Pharmaceuticals',
        facility: 'Nashik Manufacturing Unit-3',
        license: 'MFG-LIC-2026-001',
      },
      medicine: {
        name: data.medicine.name,
        genericName: data.medicine.name,
        category: data.medicine.category,
        gtin: '08901234567890',
      },
      batchNumber: data.batchNumber,
      shipmentId: data.shipmentId,
      serialNumber: `GS1-9874-2026-${data.batchNumber}-01`,
      detectionReason: data.detectionReason,
      riskScore: 88,
      evidence: {
        verificationRecords: data.evidence?.verificationRecords || [
          'Hologram verification check failed visual reflectance pattern alignment.',
        ],
        packagingObservations: data.evidence?.packagingObservations || [
          'Diffractive security pattern discrepancy detected.',
        ],
        attachments: data.evidence?.capturedHologramUrl
          ? [{ id: `ATT-${Date.now()}`, name: 'captured_hologram_scan.jpg', type: 'image/jpeg', url: data.evidence.capturedHologramUrl }]
          : [],
      },
      assignedReviewer: {
        name: 'Inspector R. K. Sharma',
        role: 'Chief Drug Inspector',
        agency: 'CDSCO Vigilance Cell',
      },
      relatedIncidents: [],
      timeline: [
        {
          id: `TL-${Date.now()}`,
          timestamp,
          actor: 'MediShield AI Vigilance Engine',
          actorType: 'system',
          action: 'Incident Created from Hologram Verification Anomaly',
          reason: data.detectionReason,
        },
      ],
    };

    this.incidents.unshift(newIncident);

    blockchainService.addBlock({
      transactionId: `TX-INC-${incidentId}`,
      timestamp,
      eventType: 'ANOMALY_FLAGGED',
      actor: 'MediShield Vigilance Engine',
      actorRole: 'Regulator',
      shipmentId: data.shipmentId,
      medicineId: `MED-${data.batchNumber}`,
      medicineName: data.medicine.name,
      batchId: data.batchNumber,
      eventData: {
        action: `Regulatory Incident Registered: ${data.title}`,
        severity: data.severity,
        incidentId,
        detectionReason: data.detectionReason,
      },
    });

    this.persist();
    this.addNotification(
      'Regulatory Incident Created',
      `Incident ${newIncident.id} logged and escalated for batch ${data.batchNumber}.`,
      'error'
    );

    return newIncident;
  }

  public resetDemoData() {
    blockchainService.restoreGenesisChain();
    this.shipments = [...ALL_SHIPMENTS];
    this.inventory = [...INITIAL_INVENTORY];
    this.incidents = [...INITIAL_REGULATORY_INCIDENTS];
    this.cases = [...INITIAL_REGULATORY_CASES];
    this.auditEvents = [...RECENT_ACTIVITY_TIMELINE];
    this.scanSessions = [];
    this.hologramReferences = [...INITIAL_HOLOGRAM_REFERENCES];
    this.hologramChecks = [...INITIAL_HOLOGRAM_CHECKS];
    this.notifications = [];
    this.supplyChainNotifications = [...INITIAL_SUPPLY_CHAIN_NOTIFICATIONS];

    this.addNotification(
      'Demo Data Reset Successfully',
      'System restored to baseline controlled dataset (MED-001..MED-005 ready for demonstration).',
      'info'
    );
    this.notify();
  }
}

export const unifiedStore = new UnifiedStoreService();
