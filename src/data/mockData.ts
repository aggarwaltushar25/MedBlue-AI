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
} from '../types';

export const SUPPLIERS = [
  'MedRoute Distributors',
  'PharmaDirect',
  'MedSupply Co.',
  'Apex Pharma Supply',
  'BioLogix Logistics',
];

export const CATEGORIES = [
  'Antibiotics',
  'Vaccines',
  'Cardiovascular',
  'Pain relievers',
  'Insulins',
  'Respiratory',
  'Oncology',
  'IV Fluids',
];

export const LOCATIONS = ['Ghaziabad Hub', 'Delhi Central', 'Mumbai Terminal'];

export const EXECUTIVE_KPIS: ExecutiveKPIs = {
  todayVerifications: { count: 24, trend: '+12% vs. yesterday' },
  acceptedShipments: { count: 18, percentage: '75% of today\'s verifications' },
  quarantinedShipments: { count: 2, percentage: '8% of today\'s verifications' },
  pendingReview: { count: 4, text: 'Requires manual inspection' },
  coldChainAlerts: { count: 1, text: 'Temperature excursions detected' },
  duplicateSerials: { count: 12, text: 'Across 1 shipment' },
};

// 14-day verification trend
export const VERIFICATION_TREND_14_DAYS: VerificationTrendDay[] = [
  { date: 'Sep 09', accepted: 14, quarantined: 1, hold: 2, total: 17 },
  { date: 'Sep 10', accepted: 16, quarantined: 0, hold: 1, total: 17 },
  { date: 'Sep 11', accepted: 15, quarantined: 1, hold: 3, total: 19 },
  { date: 'Sep 12', accepted: 18, quarantined: 0, hold: 2, total: 20 },
  { date: 'Sep 13', accepted: 13, quarantined: 1, hold: 1, total: 15 },
  { date: 'Sep 14', accepted: 19, quarantined: 0, hold: 2, total: 21 },
  { date: 'Sep 15', accepted: 17, quarantined: 1, hold: 3, total: 21 },
  { date: 'Sep 16', accepted: 16, quarantined: 1, hold: 2, total: 19 },
  { date: 'Sep 17', accepted: 15, quarantined: 2, hold: 2, total: 19 },
  { date: 'Sep 18', accepted: 14, quarantined: 2, hold: 4, total: 20 }, // Emerging spike
  { date: 'Sep 19', accepted: 16, quarantined: 3, hold: 3, total: 22 },
  { date: 'Sep 20', accepted: 13, quarantined: 3, hold: 4, total: 20 },
  { date: 'Sep 21', accepted: 17, quarantined: 2, hold: 3, total: 22 },
  { date: 'Sep 22', accepted: 18, quarantined: 2, hold: 4, total: 24 }, // Today
];

export const RISK_DISTRIBUTION_SUMMARY: RiskDistribution = {
  low: 18,
  medium: 4,
  high: 2,
  histogram: [
    { bucket: '0–10', count: 9 },
    { bucket: '11–20', count: 6 },
    { bucket: '21–30', count: 3 },
    { bucket: '31–40', count: 2 },
    { bucket: '41–50', count: 1 },
    { bucket: '51–60', count: 1 },
    { bucket: '61–70', count: 1, isHighRisk: true },
    { bucket: '71–80', count: 0, isHighRisk: true },
    { bucket: '81–90', count: 1, isHighRisk: true },
    { bucket: '91–100', count: 0, isHighRisk: true },
  ],
};

// Supply-chain risk heatmap: MedRoute has higher duplicate serials
export const SUPPLIER_HEATMAP_DATA: SupplierHeatmapEntry[] = [
  {
    supplier: 'MedRoute Distributors',
    duplicateSerials: 12, // High red
    missingHandoff: 5,
    coldChainBreach: 1,
    packagingAnomaly: 4,
  },
  {
    supplier: 'PharmaDirect',
    duplicateSerials: 2,
    missingHandoff: 3,
    coldChainBreach: 3, // Amber
    packagingAnomaly: 2,
  },
  {
    supplier: 'MedSupply Co.',
    duplicateSerials: 0,
    missingHandoff: 1,
    coldChainBreach: 0,
    packagingAnomaly: 1,
  },
  {
    supplier: 'Apex Pharma Supply',
    duplicateSerials: 1,
    missingHandoff: 1,
    coldChainBreach: 1,
    packagingAnomaly: 0,
  },
  {
    supplier: 'BioLogix Logistics',
    duplicateSerials: 0,
    missingHandoff: 2,
    coldChainBreach: 2,
    packagingAnomaly: 1,
  },
];

export const HIGH_PRIORITY_ALERTS: HighPriorityAlert[] = [
  {
    id: 'ALT-2026-901',
    severity: 'critical',
    title: 'Duplicate serials detected',
    description: '12 serials from batch AMX-2026-081 were scanned at unregistered locations.',
    timestamp: '2 hours ago',
    shipmentId: 'SHP-2026-00418',
    issueType: 'Duplicate serials',
    batchNumber: 'AMX-2026-081',
  },
  {
    id: 'ALT-2026-902',
    severity: 'warning',
    title: 'Cold-chain breach',
    description: 'Temperature exceeded 11°C for 4 hours in shipment SHP-2026-00412.',
    timestamp: '5 hours ago',
    shipmentId: 'SHP-2026-00412',
    issueType: 'Cold-chain breach',
    batchNumber: 'COV-VAX-902',
  },
  {
    id: 'ALT-2026-903',
    severity: 'warning',
    title: 'Missing distributor handoff',
    description: 'Missing intermediate custody scan between Sonipat Transit Hub and Delhi Central.',
    timestamp: '6 hours ago',
    shipmentId: 'SHP-2026-00415',
    issueType: 'Missing handoff',
    batchNumber: 'CEFT-2026-104',
  },
  {
    id: 'ALT-2026-904',
    severity: 'critical',
    title: 'Packaging anomaly detected',
    description: 'Holographic seal microtext failed optical verification at receiving bay.',
    timestamp: '8 hours ago',
    shipmentId: 'SHP-2026-00411',
    issueType: 'Packaging anomaly',
    batchNumber: 'LANT-2026-044',
  },
];

export const VERIFICATION_HEALTH: VerificationHealthData = {
  verifiedPercentage: 92,
  verifiedCount: 184,
  pendingCount: 12,
  failedCount: 4,
  targetPercentage: 95,
};

export const COLD_CHAIN_ATTENTION: ColdChainAttentionShipment = {
  shipmentId: 'SHP-2026-00412',
  medicine: 'Covaxin Booster Vials - 10-Dose Pack (Batch COV-VAX-902)',
  supplier: 'PharmaDirect',
  title: '1 shipment needs temperature review',
  description: 'Shipment SHP-2026-00412 exceeded safe temperature range (max 11.4°C).',
  temperatures: [
    { time: '02:00', temp: 4.1, safeMin: 2, safeMax: 8, isBreach: false },
    { time: '04:00', temp: 4.5, safeMin: 2, safeMax: 8, isBreach: false },
    { time: '06:00', temp: 5.2, safeMin: 2, safeMax: 8, isBreach: false },
    { time: '08:00', temp: 7.4, safeMin: 2, safeMax: 8, isBreach: false },
    { time: '09:00', temp: 9.2, safeMin: 2, safeMax: 8, isBreach: true },
    { time: '10:00', temp: 11.4, safeMin: 2, safeMax: 8, isBreach: true }, // Max breach
    { time: '11:00', temp: 10.8, safeMin: 2, safeMax: 8, isBreach: true },
    { time: '12:00', temp: 8.9, safeMin: 2, safeMax: 8, isBreach: true },
    { time: '13:00', temp: 6.8, safeMin: 2, safeMax: 8, isBreach: false },
    { time: '14:00', temp: 4.8, safeMin: 2, safeMax: 8, isBreach: false },
  ],
};

export const TOP_SUPPLIERS_VOLUME: TopSupplier[] = [
  { name: 'MedRoute Distributors', shipmentCount: 48, percentage: 42 },
  { name: 'PharmaDirect', shipmentCount: 32, percentage: 28 },
  { name: 'MedSupply Co.', shipmentCount: 18, percentage: 16 },
  { name: 'Others', shipmentCount: 16, percentage: 14 },
];

export const RECENT_ACTIVITY_TIMELINE: ActivityEvent[] = [
  {
    id: 'ACT-01',
    type: 'accept',
    timestamp: '10 min ago',
    description: 'Shipment SHP-2026-00420 accepted after GS1 DataMatrix verification',
    shipmentId: 'SHP-2026-00420',
    supplier: 'MedSupply Co.',
  },
  {
    id: 'ACT-02',
    type: 'quarantine',
    timestamp: '1 hour ago',
    description: 'Shipment SHP-2026-00418 quarantined — duplicate serials detected in Ghaziabad',
    shipmentId: 'SHP-2026-00418',
    supplier: 'MedRoute Distributors',
  },
  {
    id: 'ACT-03',
    type: 'alert',
    timestamp: '2 hours ago',
    description: 'Cold-chain alert triggered for SHP-2026-00412 — temperature reached 11.4°C',
    shipmentId: 'SHP-2026-00412',
    supplier: 'PharmaDirect',
  },
  {
    id: 'ACT-04',
    type: 'accept',
    timestamp: '3 hours ago',
    description: 'Shipment SHP-2026-00419 accepted — all 1,200 serials verified unique',
    shipmentId: 'SHP-2026-00419',
    supplier: 'Apex Pharma Supply',
  },
  {
    id: 'ACT-05',
    type: 'hold',
    timestamp: '4 hours ago',
    description: 'Shipment SHP-2026-00415 placed on Hold — awaiting distributor handoff manifest',
    shipmentId: 'SHP-2026-00415',
    supplier: 'MedRoute Distributors',
  },
  {
    id: 'ACT-06',
    type: 'scan',
    timestamp: '5 hours ago',
    description: 'Inbound scanning completed for SHP-2026-00417 (850 units)',
    shipmentId: 'SHP-2026-00417',
    supplier: 'BioLogix Logistics',
  },
  {
    id: 'ACT-07',
    type: 'accept',
    timestamp: '6 hours ago',
    description: 'Shipment SHP-2026-00416 accepted — thermal integrity verified (3.4°C)',
    shipmentId: 'SHP-2026-00416',
    supplier: 'PharmaDirect',
  },
  {
    id: 'ACT-08',
    type: 'quarantine',
    timestamp: '8 hours ago',
    description: 'Shipment SHP-2026-00411 quarantined — holographic tamper-seal mismatch',
    shipmentId: 'SHP-2026-00411',
    supplier: 'MedRoute Distributors',
  },
  {
    id: 'ACT-09',
    type: 'scan',
    timestamp: '9 hours ago',
    description: 'Automated batch barcode cross-reference logged for SHP-2026-00414',
    shipmentId: 'SHP-2026-00414',
    supplier: 'MedSupply Co.',
  },
  {
    id: 'ACT-10',
    type: 'accept',
    timestamp: '11 hours ago',
    description: 'Shipment SHP-2026-00413 accepted — batch release certificate verified',
    shipmentId: 'SHP-2026-00413',
    supplier: 'Apex Pharma Supply',
  },
  {
    id: 'ACT-11',
    type: 'hold',
    timestamp: '14 hours ago',
    description: 'Shipment SHP-2026-00410 placed on Hold — shelf-life within 60 days of expiry',
    shipmentId: 'SHP-2026-00410',
    supplier: 'BioLogix Logistics',
  },
  {
    id: 'ACT-12',
    type: 'accept',
    timestamp: '16 hours ago',
    description: 'Shipment SHP-2026-00409 accepted — clean RFID pallet scan',
    shipmentId: 'SHP-2026-00409',
    supplier: 'MedSupply Co.',
  },
];

// Deep Analytics Data
export const OUTCOMES_OVER_TIME_30_DAYS = Array.from({ length: 30 }, (_, i) => {
  const dayNum = i + 1;
  const dateStr = `Aug ${24 + i > 31 ? (i - 7 < 10 ? '0' : '') + (i - 7) + ' Sep' : 24 + i + ' Aug'}`;
  // Recent 5 days show elevated quarantine
  const isRecentSpike = i >= 25;
  const quarantined = isRecentSpike ? Math.floor(Math.random() * 2) + 2 : (i % 6 === 0 ? 1 : 0);
  const hold = Math.floor(Math.random() * 3) + 1;
  const accepted = Math.floor(Math.random() * 6) + 13;
  return {
    date: dateStr,
    accepted,
    hold,
    quarantined,
    total: accepted + hold + quarantined,
  };
});

export const RISK_SCORE_HISTOGRAM = [
  { bucket: '0–10', count: 72, isHighRisk: false },
  { bucket: '11–20', count: 48, isHighRisk: false },
  { bucket: '21–30', count: 32, isHighRisk: false },
  { bucket: '31–40', count: 18, isHighRisk: false },
  { bucket: '41–50', count: 14, isHighRisk: false },
  { bucket: '51–60', count: 9, isHighRisk: false },
  { bucket: '61–70', count: 8, isHighRisk: true },
  { bucket: '71–80', count: 5, isHighRisk: true },
  { bucket: '81–90', count: 4, isHighRisk: true },
  { bucket: '91–100', count: 2, isHighRisk: true },
];

export const SUPPLIER_PERFORMANCE_DATA: SupplierPerformance[] = [
  {
    supplier: 'MedSupply Co.',
    totalShipments: 18,
    acceptanceRate: 94.4,
    holdRate: 5.6,
    quarantineRate: 0.0,
    avgRiskScore: 12.4,
  },
  {
    supplier: 'Apex Pharma Supply',
    totalShipments: 26,
    acceptanceRate: 92.3,
    holdRate: 3.8,
    quarantineRate: 3.9,
    avgRiskScore: 16.8,
  },
  {
    supplier: 'BioLogix Logistics',
    totalShipments: 22,
    acceptanceRate: 86.4,
    holdRate: 9.1,
    quarantineRate: 4.5,
    avgRiskScore: 22.1,
  },
  {
    supplier: 'PharmaDirect',
    totalShipments: 32,
    acceptanceRate: 81.3,
    holdRate: 12.5,
    quarantineRate: 6.2,
    avgRiskScore: 28.6,
  },
  {
    supplier: 'MedRoute Distributors',
    totalShipments: 48,
    acceptanceRate: 72.9,
    holdRate: 14.6,
    quarantineRate: 12.5, // Highest quarantine due to duplicate serials
    avgRiskScore: 39.2,
  },
];

export const MEDICINE_CATEGORY_RISK_DATA: CategoryRisk[] = [
  { category: 'Vaccines', avgRiskScore: 46.8, shipmentsCount: 38, quarantineRate: 11.2 },
  { category: 'Antibiotics', avgRiskScore: 42.4, shipmentsCount: 54, quarantineRate: 9.8 },
  { category: 'Insulins', avgRiskScore: 36.1, shipmentsCount: 28, quarantineRate: 7.1 },
  { category: 'Oncology', avgRiskScore: 28.5, shipmentsCount: 16, quarantineRate: 6.2 },
  { category: 'Cardiovascular', avgRiskScore: 21.2, shipmentsCount: 34, quarantineRate: 2.9 },
  { category: 'Respiratory', avgRiskScore: 18.4, shipmentsCount: 22, quarantineRate: 0.0 },
  { category: 'Pain relievers', avgRiskScore: 14.2, shipmentsCount: 42, quarantineRate: 2.3 },
  { category: 'IV Fluids', avgRiskScore: 9.6, shipmentsCount: 26, quarantineRate: 0.0 },
];

export const TOP_RISK_DRIVERS: RiskDriver[] = [
  {
    rank: 1,
    name: 'Duplicate serial scans',
    occurrences: 34,
    severity: 'critical',
    key: 'Duplicate serials',
  },
  {
    rank: 2,
    name: 'Missing distributor handoff',
    occurrences: 22,
    severity: 'critical',
    key: 'Missing handoff',
  },
  {
    rank: 3,
    name: 'Cold-chain temperature breach',
    occurrences: 15,
    severity: 'warning',
    key: 'Cold-chain breach',
  },
  {
    rank: 4,
    name: 'Packaging anomaly',
    occurrences: 12,
    severity: 'warning',
    key: 'Packaging anomaly',
  },
  {
    rank: 5,
    name: 'Expiry mismatch',
    occurrences: 8,
    severity: 'caution',
    key: 'Expiry mismatch',
  },
];

export const GEOGRAPHIC_RISK_DATA: GeographicRisk[] = [
  {
    city: 'Ghaziabad',
    totalShipments: 52,
    quarantineRate: 6.0,
    avgRiskScore: 18.0,
    isElevated: false,
  },
  {
    city: 'Delhi',
    totalShipments: 38,
    quarantineRate: 9.0,
    avgRiskScore: 24.0,
    isElevated: false,
  },
  {
    city: 'Mumbai',
    totalShipments: 24,
    quarantineRate: 12.0,
    avgRiskScore: 31.0,
    isElevated: true, // Elevated risk
  },
];

export const COLD_CHAIN_EXCURSIONS_LIST: ColdChainExcursion[] = [
  {
    id: 'EXC-01',
    shipmentId: 'SHP-2026-00412',
    medicine: 'Covaxin Booster Vials',
    date: 'Sep 22, 2026',
    maxTemp: 11.4,
    durationHours: 4.0,
    safeRange: '2.0°C – 8.0°C',
    location: 'Ghaziabad Hub',
  },
  {
    id: 'EXC-02',
    shipmentId: 'SHP-2026-00388',
    medicine: 'Lantus SoloStar Insulin',
    date: 'Sep 20, 2026',
    maxTemp: 10.2,
    durationHours: 3.5,
    safeRange: '2.0°C – 8.0°C',
    location: 'Delhi Central',
  },
  {
    id: 'EXC-03',
    shipmentId: 'SHP-2026-00371',
    medicine: 'Pneumococcal Conjugate Vaccine',
    date: 'Sep 18, 2026',
    maxTemp: 12.8,
    durationHours: 5.2,
    safeRange: '2.0°C – 8.0°C',
    location: 'Mumbai Terminal',
  },
  {
    id: 'EXC-04',
    shipmentId: 'SHP-2026-00360',
    medicine: 'Trastuzumab 440mg Vials',
    date: 'Sep 16, 2026',
    maxTemp: 9.4,
    durationHours: 2.1,
    safeRange: '2.0°C – 8.0°C',
    location: 'Delhi Central',
  },
  {
    id: 'EXC-05',
    shipmentId: 'SHP-2026-00344',
    medicine: 'Rotavirus Oral Vaccine',
    date: 'Sep 14, 2026',
    maxTemp: 11.0,
    durationHours: 3.8,
    safeRange: '2.0°C – 8.0°C',
    location: 'Ghaziabad Hub',
  },
  {
    id: 'EXC-06',
    shipmentId: 'SHP-2026-00329',
    medicine: 'Humalog Mix 50/50 Insulin',
    date: 'Sep 12, 2026',
    maxTemp: 9.8,
    durationHours: 2.5,
    safeRange: '2.0°C – 8.0°C',
    location: 'Mumbai Terminal',
  },
  {
    id: 'EXC-07',
    shipmentId: 'SHP-2026-00315',
    medicine: 'BCG Vaccine Freeze-Dried',
    date: 'Sep 10, 2026',
    maxTemp: 13.1,
    durationHours: 4.6,
    safeRange: '2.0°C – 8.0°C',
    location: 'Mumbai Terminal',
  },
  {
    id: 'EXC-08',
    shipmentId: 'SHP-2026-00298',
    medicine: 'Infliximab Infusion 100mg',
    date: 'Sep 08, 2026',
    maxTemp: 9.1,
    durationHours: 1.8,
    safeRange: '2.0°C – 8.0°C',
    location: 'Delhi Central',
  },
  {
    id: 'EXC-09',
    shipmentId: 'SHP-2026-00282',
    medicine: 'MMR Live Vaccine',
    date: 'Sep 06, 2026',
    maxTemp: 10.6,
    durationHours: 3.1,
    safeRange: '2.0°C – 8.0°C',
    location: 'Ghaziabad Hub',
  },
  {
    id: 'EXC-10',
    shipmentId: 'SHP-2026-00269',
    medicine: 'Insulin Degludec FlexTouch',
    date: 'Sep 04, 2026',
    maxTemp: 9.5,
    durationHours: 2.0,
    safeRange: '2.0°C – 8.0°C',
    location: 'Delhi Central',
  },
  {
    id: 'EXC-11',
    shipmentId: 'SHP-2026-00251',
    medicine: 'Hepatitis B Recombinant Vaccine',
    date: 'Sep 02, 2026',
    maxTemp: 12.0,
    durationHours: 4.1,
    safeRange: '2.0°C – 8.0°C',
    location: 'Mumbai Terminal',
  },
  {
    id: 'EXC-12',
    shipmentId: 'SHP-2026-00234',
    medicine: 'Filgrastim Prefilled Syringe',
    date: 'Aug 31, 2026',
    maxTemp: 8.9,
    durationHours: 1.5,
    safeRange: '2.0°C – 8.0°C',
    location: 'Ghaziabad Hub',
  },
  {
    id: 'EXC-13',
    shipmentId: 'SHP-2026-00218',
    medicine: 'Rabies Inactivated Vaccine',
    date: 'Aug 29, 2026',
    maxTemp: 11.7,
    durationHours: 3.9,
    safeRange: '2.0°C – 8.0°C',
    location: 'Mumbai Terminal',
  },
  {
    id: 'EXC-14',
    shipmentId: 'SHP-2026-00201',
    medicine: 'Rituximab Concentrate 500mg',
    date: 'Aug 27, 2026',
    maxTemp: 10.1,
    durationHours: 2.7,
    safeRange: '2.0°C – 8.0°C',
    location: 'Delhi Central',
  },
  {
    id: 'EXC-15',
    shipmentId: 'SHP-2026-00185',
    medicine: 'Varicella Virus Vaccine',
    date: 'Aug 25, 2026',
    maxTemp: 12.4,
    durationHours: 4.3,
    safeRange: '2.0°C – 8.0°C',
    location: 'Mumbai Terminal',
  },
];

export const PREDICTED_LOAD_FORECAST: PredictedLoadDay[] = [
  { day: 'Wed Sep 23', predicted: 22, lowerBound: 18, upperBound: 26 },
  { day: 'Thu Sep 24', predicted: 20, lowerBound: 16, upperBound: 24 },
  { day: 'Fri Sep 25', predicted: 24, lowerBound: 19, upperBound: 28 },
  { day: 'Sat Sep 26', predicted: 16, lowerBound: 12, upperBound: 20 },
  { day: 'Sun Sep 27', predicted: 14, lowerBound: 10, upperBound: 18 },
  { day: 'Mon Sep 28', predicted: 25, lowerBound: 21, upperBound: 29 },
  { day: 'Tue Sep 29', predicted: 21, lowerBound: 17, upperBound: 25 },
];

export const INITIAL_REPORTS_LIST: ReportSummary[] = [
  {
    id: 'REP-2026-08',
    name: 'August 2026 Executive Summary.pdf',
    type: 'Executive summary',
    dateRange: 'Aug 01, 2026 – Aug 31, 2026',
    generatedAt: '2 days ago',
    format: 'pdf',
    fileSize: '1.4 MB',
  },
  {
    id: 'REP-2026-07',
    name: 'July 2026 Supplier Performance.csv',
    type: 'Supplier performance report',
    dateRange: 'Jul 01, 2026 – Jul 31, 2026',
    generatedAt: '30 days ago',
    format: 'csv',
    fileSize: '480 KB',
  },
];

// Generate 200+ realistic shipments with full details
export function generateRealisticShipments(): ShipmentVerification[] {
  const shipments: ShipmentVerification[] = [];
  
  // Specific required items from the prompt:
  // 1. Today's key shipment with 12 duplicate serials
  shipments.push({
    id: 'SHP-2026-00418',
    medicineName: 'Amoxicillin 500mg Trihydrate',
    category: 'Antibiotics',
    supplier: 'MedRoute Distributors',
    verifiedAt: '2026-09-22 09:14',
    riskScore: 88,
    status: 'Quarantined',
    primaryIssue: 'Duplicate serials',
    location: 'Ghaziabad Hub',
    batchNumber: 'AMX-2026-081',
    expiryDate: '2027-11-30',
    serialCount: 1500,
    duplicateSerialsCount: 12,
    inspectorNotes: '12 serials from batch AMX-2026-081 were previously registered at an unlicensed warehouse in Haryana.',
    rfidTag: 'RFID-9842-AX01',
    gs1DataMatrix: '(01)08901234567890(17)271130(10)AMX-2026-081(21)SN1004812',
  });

  // 2. Today's cold chain breach
  shipments.push({
    id: 'SHP-2026-00412',
    medicineName: 'Covaxin Booster Vials - 10-Dose Pack',
    category: 'Vaccines',
    supplier: 'PharmaDirect',
    verifiedAt: '2026-09-22 08:30',
    riskScore: 68,
    status: 'Hold',
    primaryIssue: 'Cold-chain breach',
    location: 'Delhi Central',
    batchNumber: 'COV-VAX-902',
    expiryDate: '2027-04-15',
    serialCount: 800,
    duplicateSerialsCount: 0,
    inspectorNotes: 'Data-logger recorded excursion up to 11.4°C during highway breakdown (4.0 hrs >8°C). Stability testing required.',
    rfidTag: 'RFID-7712-CV09',
    gs1DataMatrix: '(01)08909876543210(17)270415(10)COV-VAX-902(21)SN802194',
    temperatureLog: [
      { time: '02:00', temp: 4.1, status: 'normal' },
      { time: '04:00', temp: 4.5, status: 'normal' },
      { time: '06:00', temp: 5.2, status: 'normal' },
      { time: '08:00', temp: 7.4, status: 'normal' },
      { time: '09:00', temp: 9.2, status: 'warning' },
      { time: '10:00', temp: 11.4, status: 'breach' },
      { time: '11:00', temp: 10.8, status: 'breach' },
      { time: '12:00', temp: 8.9, status: 'warning' },
      { time: '13:00', temp: 6.8, status: 'normal' },
      { time: '14:00', temp: 4.8, status: 'normal' },
    ],
  });

  // 3. Today's accepted clean shipments
  shipments.push({
    id: 'SHP-2026-00420',
    medicineName: 'Azithromycin 500mg Tablets',
    category: 'Antibiotics',
    supplier: 'MedSupply Co.',
    verifiedAt: '2026-09-22 10:05',
    riskScore: 4,
    status: 'Accepted',
    primaryIssue: 'None (Clean Verification)',
    location: 'Ghaziabad Hub',
    batchNumber: 'AZI-2026-442',
    expiryDate: '2028-06-30',
    serialCount: 2400,
    inspectorNotes: 'GS1 2D barcode authenticated with national drug trace repository. Perfect tamper seals.',
  });

  shipments.push({
    id: 'SHP-2026-00419',
    medicineName: 'Atorvastatin Calcium 20mg',
    category: 'Cardiovascular',
    supplier: 'Apex Pharma Supply',
    verifiedAt: '2026-09-22 09:45',
    riskScore: 6,
    status: 'Accepted',
    primaryIssue: 'None (Clean Verification)',
    location: 'Delhi Central',
    batchNumber: 'ATO-2026-118',
    expiryDate: '2028-01-20',
    serialCount: 1200,
    inspectorNotes: 'Batch release certificate verified digitally. RFID pallet seals intact.',
  });

  shipments.push({
    id: 'SHP-2026-00417',
    medicineName: 'Paracetamol IV Infusion 100ml',
    category: 'Pain relievers',
    supplier: 'BioLogix Logistics',
    verifiedAt: '2026-09-22 09:00',
    riskScore: 9,
    status: 'Accepted',
    primaryIssue: 'None (Clean Verification)',
    location: 'Mumbai Terminal',
    batchNumber: 'PCM-2026-551',
    expiryDate: '2027-10-31',
    serialCount: 1800,
    inspectorNotes: 'Sterility certificates validated. Packaging micro-print verified under 40x magnification.',
  });

  shipments.push({
    id: 'SHP-2026-00416',
    medicineName: 'Ceftriaxone Sodium 1g Vial',
    category: 'Antibiotics',
    supplier: 'PharmaDirect',
    verifiedAt: '2026-09-22 08:15',
    riskScore: 12,
    status: 'Accepted',
    primaryIssue: 'None (Clean Verification)',
    location: 'Delhi Central',
    batchNumber: 'CEF-2026-302',
    expiryDate: '2027-08-15',
    serialCount: 1000,
    inspectorNotes: 'Thermal chain verified continuously within 3.4°C - 5.1°C.',
  });

  shipments.push({
    id: 'SHP-2026-00415',
    medicineName: 'Meropenem Trihydrate 1g',
    category: 'Antibiotics',
    supplier: 'MedRoute Distributors',
    verifiedAt: '2026-09-22 07:45',
    riskScore: 48,
    status: 'Hold',
    primaryIssue: 'Missing handoff',
    location: 'Ghaziabad Hub',
    batchNumber: 'MERO-2026-009',
    expiryDate: '2027-09-30',
    serialCount: 650,
    inspectorNotes: 'Missing intermediate waypoint scan at Sonipat depot. Secondary courier validation pending.',
  });

  shipments.push({
    id: 'SHP-2026-00414',
    medicineName: 'Metformin Hydrochloride 500mg',
    category: 'Cardiovascular',
    supplier: 'MedSupply Co.',
    verifiedAt: '2026-09-22 07:10',
    riskScore: 8,
    status: 'Accepted',
    primaryIssue: 'None (Clean Verification)',
    location: 'Delhi Central',
    batchNumber: 'MET-2026-990',
    expiryDate: '2028-12-31',
    serialCount: 3000,
  });

  shipments.push({
    id: 'SHP-2026-00413',
    medicineName: 'Salbutamol Inhaler 100mcg',
    category: 'Respiratory',
    supplier: 'Apex Pharma Supply',
    verifiedAt: '2026-09-22 06:40',
    riskScore: 5,
    status: 'Accepted',
    primaryIssue: 'None (Clean Verification)',
    location: 'Ghaziabad Hub',
    batchNumber: 'SAL-2026-012',
    expiryDate: '2028-03-31',
    serialCount: 1500,
  });

  shipments.push({
    id: 'SHP-2026-00411',
    medicineName: 'Lantus SoloStar Insulin 100IU/ml',
    category: 'Insulins',
    supplier: 'MedRoute Distributors',
    verifiedAt: '2026-09-22 06:15',
    riskScore: 92,
    status: 'Quarantined',
    primaryIssue: 'Packaging anomaly',
    location: 'Mumbai Terminal',
    batchNumber: 'LANT-2026-044',
    expiryDate: '2027-05-15',
    serialCount: 500,
    duplicateSerialsCount: 0,
    inspectorNotes: 'Holographic security foil font spacing mismatched from authentic manufacturer baseline.',
  });

  shipments.push({
    id: 'SHP-2026-00410',
    medicineName: 'Human Albumin 20% Infusion',
    category: 'IV Fluids',
    supplier: 'BioLogix Logistics',
    verifiedAt: '2026-09-22 05:50',
    riskScore: 35,
    status: 'Hold',
    primaryIssue: 'Expiry mismatch',
    location: 'Delhi Central',
    batchNumber: 'ALB-2026-781',
    expiryDate: '2026-11-15',
    serialCount: 400,
    inspectorNotes: 'Receiving criteria requires minimum 90-day remaining shelf life; shipment has 54 days.',
  });

  shipments.push({
    id: 'SHP-2026-00409',
    medicineName: 'Pantoprazole Gastro-Resistant 40mg',
    category: 'Pain relievers',
    supplier: 'MedSupply Co.',
    verifiedAt: '2026-09-22 05:20',
    riskScore: 3,
    status: 'Accepted',
    primaryIssue: 'None (Clean Verification)',
    location: 'Ghaziabad Hub',
    batchNumber: 'PAN-2026-882',
    expiryDate: '2028-09-30',
    serialCount: 2200,
  });

  // Generate the remaining 200+ historical shipments over past 30 days
  const medPool = [
    { name: 'Amoxicillin 500mg Trihydrate', cat: 'Antibiotics' },
    { name: 'Ceftriaxone Sodium 1g Vial', cat: 'Antibiotics' },
    { name: 'Ciprofloxacin 500mg Tablets', cat: 'Antibiotics' },
    { name: 'Covaxin Booster Vials', cat: 'Vaccines' },
    { name: 'Pneumococcal Conjugate Vaccine', cat: 'Vaccines' },
    { name: 'MMR Live Vaccine', cat: 'Vaccines' },
    { name: 'Atorvastatin Calcium 20mg', cat: 'Cardiovascular' },
    { name: 'Amlodipine Besylate 5mg', cat: 'Cardiovascular' },
    { name: 'Telmisartan 40mg Tablets', cat: 'Cardiovascular' },
    { name: 'Paracetamol IV Infusion 100ml', cat: 'Pain relievers' },
    { name: 'Ibuprofen 400mg Film-coated', cat: 'Pain relievers' },
    { name: 'Lantus SoloStar Insulin 100IU/ml', cat: 'Insulins' },
    { name: 'Humalog Mix 50/50 Insulin', cat: 'Insulins' },
    { name: 'Salbutamol Inhaler 100mcg', cat: 'Respiratory' },
    { name: 'Budesonide Respules 0.5mg', cat: 'Respiratory' },
    { name: 'Trastuzumab 440mg Vials', cat: 'Oncology' },
    { name: 'Paclitaxel 100mg Injection', cat: 'Oncology' },
    { name: 'Normal Saline 0.9% 500ml', cat: 'IV Fluids' },
    { name: 'Ringer Lactate Infusion 500ml', cat: 'IV Fluids' },
  ];

  let idCounter = 408;
  for (let day = 1; day <= 30; day++) {
    const shipmentsOnDay = Math.floor(Math.random() * 5) + 6; // 6 to 10 per day
    for (let s = 0; s < shipmentsOnDay; s++) {
      idCounter--;
      const med = medPool[Math.floor(Math.random() * medPool.length)];
      const supplier = SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)];
      const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      
      // Determine risk score and status based on supplier and category patterns
      let risk = Math.floor(Math.random() * 25); // default low
      let issue = 'None (Clean Verification)';
      let status: 'Accepted' | 'Hold' | 'Quarantined' = 'Accepted';
      let dupeCount = 0;

      // MedRoute has higher duplicate serials
      if (supplier === 'MedRoute Distributors' && Math.random() < 0.22) {
        risk = Math.floor(Math.random() * 30) + 65;
        issue = 'Duplicate serials';
        status = 'Quarantined';
        dupeCount = Math.floor(Math.random() * 8) + 2;
      } else if (med.cat === 'Vaccines' && Math.random() < 0.18) {
        risk = Math.floor(Math.random() * 25) + 50;
        issue = 'Cold-chain breach';
        status = risk > 70 ? 'Quarantined' : 'Hold';
      } else if (loc === 'Mumbai Terminal' && Math.random() < 0.16) {
        risk = Math.floor(Math.random() * 30) + 40;
        issue = Math.random() > 0.5 ? 'Packaging anomaly' : 'Missing handoff';
        status = risk > 65 ? 'Quarantined' : 'Hold';
      } else if (Math.random() < 0.08) {
        risk = Math.floor(Math.random() * 30) + 30;
        issue = Math.random() > 0.5 ? 'Missing handoff' : 'Expiry mismatch';
        status = 'Hold';
      }

      const dateObj = new Date(2026, 8, 22 - Math.floor(day * 0.95), 8 + (s % 10), 10 + (s * 5) % 50);
      const dateStr = dateObj.toISOString().replace('T', ' ').substring(0, 16);

      shipments.push({
        id: `SHP-2026-00${idCounter}`,
        medicineName: med.name,
        category: med.cat,
        supplier,
        verifiedAt: dateStr,
        riskScore: risk,
        status,
        primaryIssue: issue,
        location: loc,
        batchNumber: `${med.name.substring(0, 3).toUpperCase()}-2026-${Math.floor(Math.random() * 900 + 100)}`,
        expiryDate: `2028-0${Math.floor(Math.random() * 9) + 1}-28`,
        serialCount: Math.floor(Math.random() * 2000) + 500,
        duplicateSerialsCount: dupeCount,
        inspectorNotes: status === 'Accepted' 
          ? 'Digital signatures intact. Verified against GS1 National Registry.' 
          : `Secondary review logged: ${issue}. Flagged by automated verification rules.`,
        rfidTag: `RFID-${Math.floor(Math.random() * 9000 + 1000)}-${med.name.substring(0, 2).toUpperCase()}`,
        gs1DataMatrix: `(01)0890${Math.floor(Math.random() * 9000000000 + 1000000000)}(17)280630(10)${med.name.substring(0, 3).toUpperCase()}(21)${Math.floor(Math.random() * 900000 + 100000)}`,
      });
    }
  }

  return shipments;
}

export const ALL_SHIPMENTS: ShipmentVerification[] = generateRealisticShipments();
