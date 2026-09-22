/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  RegulatoryIncident,
  EntityProfile,
  RegulatoryKPIs,
  SuspiciousActivityTrendItem,
  GeographicRiskDetail,
  SupplierRegulatoryRisk,
  StoreRegulatoryRisk,
  EntityRecurringPattern,
  IncidentStatus,
  IncidentTimelineEvent,
  ShipmentVerification,
} from '../types';
import { ALL_SHIPMENTS } from './mockData';

export const INITIAL_REGULATORY_INCIDENTS: RegulatoryIncident[] = [
  {
    id: 'INC-2026-081',
    title: 'Multi-Depot Duplicate Serial Anomaly • Cloned GS1 DataMatrix',
    severity: 'CRITICAL',
    status: 'ESCALATED',
    createdAt: '2026-09-18T09:42:00Z',
    updatedAt: '2026-09-22T10:15:00Z',
    store: {
      id: 'STORE-DEL-01',
      name: 'Fortis Hospital Dispensing Pharmacy',
      location: 'Delhi Central',
      licenseNumber: 'DL-PH-2024-88912',
      manager: 'Dr. Alok Verma, Chief Pharmacist',
    },
    supplier: {
      id: 'SUP-MEDROUTE',
      name: 'MedRoute Distributors',
      location: 'Ghaziabad Hub',
      licenseNumber: 'UP-WHL-2022-44120',
      contactEmail: 'compliance@medroute-dist.in',
    },
    manufacturer: {
      id: 'MFG-GSK',
      name: 'GlaxoSmithKline Pharmaceuticals India',
      facility: 'Nashik Manufacturing Unit-3',
      license: 'MH-MFG-GSK-0921',
    },
    medicine: {
      name: 'Amoxicillin + Clavulanate 625mg',
      genericName: 'Amoxicillin and Potassium Clavulanate Tablets IP',
      category: 'Antibiotics',
      gtin: '08901030048123',
    },
    batchNumber: 'AMX-2026-081',
    shipmentId: 'SHP-001',
    serialNumber: 'SN-1004812 (and 41 clones)',
    detectionReason:
      'Automated CDSCO gateway check identified 42 duplicate serial numbers registered simultaneously across Delhi Central and Mumbai terminal dispensing depots within 3 hours.',
    riskScore: 84,
    evidence: {
      verificationRecords: [
        'Central Registry Scan DL-001: SN-1004812 scanned at Fortis Delhi at 09:30 IST',
        'Central Registry Scan MH-044: SN-1004812 scanned at Apollo Mumbai at 11:15 IST (Impossible Transit Velocity: 1400 km in 105 min)',
        'GS1 2D DataMatrix cryptographic signature mismatch against GSK Genesis Root',
      ],
      duplicateSerialsList: [
        'SN-1004812 (Delhi Central / Mumbai Terminal)',
        'SN-1004813 (Delhi Central / Ghaziabad Hub)',
        'SN-1004814 (Delhi Central / Mumbai Terminal)',
        'SN-1004815 (Delhi Central / Jaipur Depot)',
        'SN-1004816 (Delhi Central / Mumbai Terminal)',
        '+ 37 additional cloned serials flagged in consignment CON-AMX-001',
      ],
      packagingObservations: [
        'Holographic optical variable device (OVD) failed diffractive reflectance test (Iridescence Score: 38% vs 75% required).',
        'Micro-text on carton edge "GSK INDIA" blurry under 10x optical zoom.',
      ],
      supplierHistorySummary:
        'MedRoute Distributors has 4 previous verification anomalies in the past 90 days across 3 distinct hospital network stores.',
      blockchainProof: {
        txHash: '0x9a8f3b21c4e7d802a615e4789b5c3210fe89ab12cd34ef567890abcdef123456',
        blockNumber: 19482012,
        verified: false,
      },
    },
    assignedReviewer: {
      name: 'Dr. Rajeshwari Menon',
      role: 'Joint Drugs Controller & Head of Vigilance Cell',
      agency: 'Central Drugs Standard Control Organisation (CDSCO)',
    },
    relatedIncidents: ['INC-2026-105', 'INC-2026-130'],
    timeline: [
      {
        id: 'EVT-081-1',
        timestamp: '2026-09-18T09:30:12Z',
        actor: 'Dock Receiving Scanner (Chemist Station #2)',
        actorType: 'chemist',
        action: 'Shipment received and 2D DataMatrix scanned',
        shipmentId: 'SHP-001',
        entity: 'Fortis Hospital Dispensing Pharmacy',
        reason: 'Initial inbound dock inspection',
      },
      {
        id: 'EVT-081-2',
        timestamp: '2026-09-18T09:30:18Z',
        actor: 'MediShield AI Risk Engine',
        actorType: 'system',
        action: 'Duplicate serial numbers detected (+35 pts risk)',
        shipmentId: 'SHP-001',
        reason: 'Serial SN-1004812 already marked active in Mumbai Terminal registry',
        hashProof: '0x7f8a9b0c...d1e2',
      },
      {
        id: 'EVT-081-3',
        timestamp: '2026-09-18T09:35:00Z',
        actor: 'Dr. Alok Verma',
        actorType: 'inspector',
        action: 'Consignment placed on IMMEDIATE QUARANTINE',
        shipmentId: 'SHP-001',
        reason: 'Serial duplication confirmed and physical packaging anomalies noted',
        statusChange: { from: 'NEW', to: 'UNDER REVIEW' },
      },
      {
        id: 'EVT-081-4',
        timestamp: '2026-09-19T14:20:00Z',
        actor: 'Senior Inspector K. S. Sharma',
        actorType: 'officer',
        action: 'Formal Investigation opened; Supplier MedRoute notified',
        shipmentId: 'SHP-001',
        reason: 'Repeat distributor anomaly pattern matched across Ghaziabad transit corridor',
        statusChange: { from: 'UNDER REVIEW', to: 'INVESTIGATION' },
      },
      {
        id: 'EVT-081-5',
        timestamp: '2026-09-22T10:15:00Z',
        actor: 'Dr. Rajeshwari Menon',
        actorType: 'regulatory_agency',
        action: 'Escalated to CDSCO National Drug Vigilance Committee',
        shipmentId: 'SHP-001',
        reason: '42 confirmed cloned serials require nationwide batch recall recommendation and distributor inspection',
        statusChange: { from: 'INVESTIGATION', to: 'ESCALATED' },
      },
    ],
    regulatoryNotes:
      'Critical evidence package generated. High probability of rogue relabeling at intermediate transit depot in Ghaziabad. Physical seizure of 8,000 units ordered at Fortis Delhi depot.',
    escalatedToAgency: 'Central Drugs Standard Control Organisation (CDSCO) • North Zone Vigilance',
    actionTakenSummary: 'Batch quarantine notice broadcast to all 24 connected state hospital networks.',
  },
  {
    id: 'INC-2026-092',
    title: 'Reefer Cold-Chain Thermal Excursion Breach • NH-48 Corridor',
    severity: 'CRITICAL',
    status: 'INVESTIGATION',
    createdAt: '2026-09-19T14:10:00Z',
    updatedAt: '2026-09-22T08:30:00Z',
    store: {
      id: 'STORE-MUM-02',
      name: 'Apollo Pharmacy & Tertiary Care Hub',
      location: 'Mumbai Terminal',
      licenseNumber: 'MH-PH-2023-11029',
      manager: 'Pooja Nair, M.Pharm',
    },
    supplier: {
      id: 'SUP-BIOLOGIX',
      name: 'BioLogix Logistics',
      location: 'Mumbai Terminal Depot',
      licenseNumber: 'MH-WHL-2021-99821',
      contactEmail: 'quality@biologix-log.in',
    },
    manufacturer: {
      id: 'MFG-SERUM',
      name: 'Serum Institute of India Pvt. Ltd.',
      facility: 'Pune Bio-Tech Park Unit-2',
      license: 'MH-MFG-SII-0018',
    },
    medicine: {
      name: 'Covaxin Booster Vials (2–8°C)',
      genericName: 'Whole-Virion Inactivated SARS-CoV-2 Vaccine',
      category: 'Vaccines',
      gtin: '08902040059124',
    },
    batchNumber: 'COV-VAX-902',
    shipmentId: 'SHP-003',
    serialNumber: 'SN-902-1402 through SN-902-2201 (800 units)',
    detectionReason:
      'Continuous BLE IoT temperature sensor logged 11.4°C maximum temperature excursion for 4 hours 12 minutes during transit breakdown on NH-48 highway.',
    riskScore: 72,
    evidence: {
      verificationRecords: [
        'IoT Telemetry Log: Temp reached 11.4°C between km 120 and km 165 on NH-48',
        'Thermal cumulative kinetic temp (MKT) exceeded WHO Annex 9 stability threshold',
        'Reefer truck auxiliary cooling unit power loss reported by driver manifest',
      ],
      temperatureHistory: [
        { timestamp: '2026-09-19T06:00:00Z', temp: 4.2, status: 'normal' },
        { timestamp: '2026-09-19T08:00:00Z', temp: 5.1, status: 'normal' },
        { timestamp: '2026-09-19T10:00:00Z', temp: 9.8, status: 'breach' },
        { timestamp: '2026-09-19T12:00:00Z', temp: 11.4, status: 'breach' },
        { timestamp: '2026-09-19T14:00:00Z', temp: 8.6, status: 'breach' },
        { timestamp: '2026-09-19T15:30:00Z', temp: 4.0, status: 'normal' },
      ],
      packagingObservations: [
        'Thermal irreversible indicator disc color changed from blue to red on box #14 and #19.',
        'Secondary seal intact but moisture condensation observed inside tertiary foam shipper.',
      ],
      supplierHistorySummary:
        'BioLogix Logistics has reported 2 prior cold-chain warnings this quarter due to aging reefer fleet on Western transit corridor.',
      blockchainProof: {
        txHash: '0x1c8b3a72d4e9f012b524c6789e0d1234af67bc89de01ab234567cdef89012345',
        blockNumber: 19482900,
        verified: true,
      },
    },
    assignedReviewer: {
      name: 'Virendra Deshmukh',
      role: 'Assistant Commissioner (Vigilance & Cold Chain)',
      agency: 'Maharashtra Food and Drug Administration (FDA)',
    },
    relatedIncidents: ['INC-2026-118'],
    timeline: [
      {
        id: 'EVT-092-1',
        timestamp: '2026-09-19T14:10:00Z',
        actor: 'IoT Dock Gate Gateway',
        actorType: 'system',
        action: 'BLE temperature payload downloaded and decoded',
        shipmentId: 'SHP-003',
        reason: 'Automated dock sync on receiver arrival',
      },
      {
        id: 'EVT-092-2',
        timestamp: '2026-09-19T14:12:00Z',
        actor: 'MediShield AI Risk Engine',
        actorType: 'system',
        action: 'Excursion breach flagged (+30 pts risk); Hold alert emitted',
        shipmentId: 'SHP-003',
        reason: 'Peak temp 11.4°C breached upper tolerance bound 8.0°C for 4.2 hours',
      },
      {
        id: 'EVT-092-3',
        timestamp: '2026-09-20T10:00:00Z',
        actor: 'Virendra Deshmukh',
        actorType: 'officer',
        action: 'Investigation opened; 800 vials impounded at Apollo cold storage bay',
        shipmentId: 'SHP-003',
        reason: 'Vaccine biological potency validation required before destruction order',
        statusChange: { from: 'NEW', to: 'INVESTIGATION' },
      },
    ],
    regulatoryNotes:
      'Stability data requested from Serum Institute. Reefer fleet audit scheduled for BioLogix Mumbai terminal.',
    escalatedToAgency: 'State FDA Maharashtra & National Immunization Surveillance Unit',
  },
  {
    id: 'INC-2026-044',
    title: 'Diffractive Optical Seal Iridescence Discrepancy',
    severity: 'HIGH',
    status: 'UNDER REVIEW',
    createdAt: '2026-09-20T11:20:00Z',
    updatedAt: '2026-09-21T16:45:00Z',
    store: {
      id: 'STORE-DEL-04',
      name: 'MedPlus Central Dispensary',
      location: 'Delhi Central',
      licenseNumber: 'DL-PH-2023-55910',
      manager: 'Sunita Rao, Registered Pharmacist',
    },
    supplier: {
      id: 'SUP-PHARMADIRECT',
      name: 'PharmaDirect National Logistics',
      location: 'Delhi Central',
      licenseNumber: 'DL-WHL-2020-77182',
      contactEmail: 'qa@pharmadirect-logistics.in',
    },
    manufacturer: {
      id: 'MFG-SANOFI',
      name: 'Sanofi Healthcare India Pvt. Ltd.',
      facility: 'Goa Formulation Facility',
      license: 'GA-MFG-SAN-0422',
    },
    medicine: {
      name: 'Lantus SoloStar Insulin Glargine 100 IU/mL',
      genericName: 'Insulin Glargine Injection IP',
      category: 'Insulins',
      gtin: '08903050060125',
    },
    batchNumber: 'LANT-2026-044',
    shipmentId: 'SHP-004',
    serialNumber: 'SN-LANT-881 through SN-LANT-950 (70 units)',
    detectionReason:
      'Optical AI camera analysis detected diffractive hologram pattern failure (Score: 42% vs 70% threshold). Tamper-evident perforation showed signs of secondary re-adhesion.',
    riskScore: 58,
    evidence: {
      verificationRecords: [
        'Multi-angle spectral glare test: Reflective diffraction missing Sanofi custom micro-crest',
        'Physical package inspection: Glue residue detected under security label edge',
        'RFID tag UID valid but metadata mismatch on manufacturer timestamp',
      ],
      packagingObservations: [
        'Optical hologram iridescence score 42% flagged by CameraScanner vision model.',
        'Tamper band micro-perforations cut and resealed with non-standard cyanoacrylate adhesive.',
      ],
      supplierHistorySummary: 'PharmaDirect has 98.4% historical compliance, suggesting isolated breach.',
    },
    assignedReviewer: {
      name: 'Inspector Tarun Sethi',
      role: 'Drug Inspector (Delhi District North)',
      agency: 'Delhi Drugs Control Department',
    },
    relatedIncidents: ['INC-2026-081'],
    timeline: [
      {
        id: 'EVT-044-1',
        timestamp: '2026-09-20T11:20:00Z',
        actor: 'Chemist Receiving Terminal',
        actorType: 'chemist',
        action: 'Camera optical hologram verification executed',
        shipmentId: 'SHP-004',
      },
      {
        id: 'EVT-044-2',
        timestamp: '2026-09-20T11:22:00Z',
        actor: 'MediShield Optical Analysis Engine',
        actorType: 'system',
        action: 'Packaging anomaly flagged (+25 pts); Risk score 58 assigned',
        shipmentId: 'SHP-004',
      },
      {
        id: 'EVT-044-3',
        timestamp: '2026-09-21T16:45:00Z',
        actor: 'Inspector Tarun Sethi',
        actorType: 'officer',
        action: 'Status updated to Under Review; Sample sent to Central Drug Lab (CDL) Kasauli',
        shipmentId: 'SHP-004',
        statusChange: { from: 'NEW', to: 'UNDER REVIEW' },
      },
    ],
    regulatoryNotes: 'Samples dispatched for chromatography and packaging forensics comparison.',
    escalatedToAgency: 'Delhi Drugs Control Department',
  },
  {
    id: 'INC-2026-105',
    title: 'Unregistered Intermediate Transit Depot & Handoff Gap',
    severity: 'CRITICAL',
    status: 'ACTION TAKEN',
    createdAt: '2026-09-15T08:00:00Z',
    updatedAt: '2026-09-21T18:00:00Z',
    store: {
      id: 'STORE-GZB-03',
      name: 'Jan Aushadhi Kendra Sub-Depot',
      location: 'Ghaziabad Hub',
      licenseNumber: 'UP-PH-2022-90112',
      manager: 'R. K. Tyagi',
    },
    supplier: {
      id: 'SUP-MEDROUTE',
      name: 'MedRoute Distributors',
      location: 'Ghaziabad Hub',
      licenseNumber: 'UP-WHL-2022-44120',
      contactEmail: 'compliance@medroute-dist.in',
    },
    manufacturer: {
      id: 'MFG-GSK',
      name: 'GlaxoSmithKline Pharmaceuticals India',
      facility: 'Nashik Manufacturing Unit-3',
      license: 'MH-MFG-GSK-0921',
    },
    medicine: {
      name: 'Augmentin 625 Duo Oral Strip',
      genericName: 'Amoxicillin and Clavulanate Potassium 625mg',
      category: 'Antibiotics',
      gtin: '08901030044188',
    },
    batchNumber: 'GSK-2026-441B',
    shipmentId: 'SHP-002',
    serialNumber: 'SN-UNAUTH-8812 through SN-UNAUTH-8900 (88 units)',
    detectionReason:
      'Intermediate transit scan at unregistered warehouse in Sahibabad Industrial Area with broken custody signature.',
    riskScore: 88,
    evidence: {
      verificationRecords: [
        'Transit route diverted 45 km off authorized GPS geofence corridor',
        'Physical seal broken and replaced with generic plastic cable tie',
        '88 units contained counterfeit blister foil lacking GSK embossed registration logo',
      ],
      packagingObservations: [
        'Blister foil lacks authentic debossed batch imprint.',
        'Alu-alu blister sealing temperature noticeably uneven.',
      ],
      supplierHistorySummary: 'Third incident connected to MedRoute Ghaziabad hub in 60 days.',
    },
    assignedReviewer: {
      name: 'S. N. Tripathi',
      role: 'Senior Drug Inspector & Vigilance Officer',
      agency: 'Uttar Pradesh Food Safety and Drug Administration (FSDA)',
    },
    relatedIncidents: ['INC-2026-081', 'INC-2026-130'],
    timeline: [
      {
        id: 'EVT-105-1',
        timestamp: '2026-09-15T08:00:00Z',
        actor: 'Automated GPS Geo-Fence Monitor',
        actorType: 'system',
        action: 'Route diversion breach detected',
        shipmentId: 'SHP-002',
      },
      {
        id: 'EVT-105-2',
        timestamp: '2026-09-17T11:00:00Z',
        actor: 'S. N. Tripathi',
        actorType: 'officer',
        action: 'Physical raid executed at unauthorized warehouse facility',
        shipmentId: 'SHP-002',
        statusChange: { from: 'INVESTIGATION', to: 'ACTION TAKEN' },
      },
      {
        id: 'EVT-105-3',
        timestamp: '2026-09-21T18:00:00Z',
        actor: 'UP FSDA Enforcement Directorate',
        actorType: 'regulatory_agency',
        action: 'Warehouse sealed; distributor license suspended pending judicial review',
        reason: 'Seizure of 5,400 unauthorized packaging foils and unapproved batch lots',
      },
    ],
    regulatoryNotes: 'Formal FIR lodged under Sections 18(c) and 27 of the Drugs and Cosmetics Act, 1940.',
    escalatedToAgency: 'Uttar Pradesh FSDA & Economic Offences Wing (EOW)',
    actionTakenSummary: 'Facility sealed; 5,400 units seized; Show cause notice issued.',
  },
  {
    id: 'INC-2026-118',
    title: 'Expiry Date Label Discrepancy & Shelf-Life Threshold Breach',
    severity: 'HIGH',
    status: 'INVESTIGATION',
    createdAt: '2026-09-16T12:00:00Z',
    updatedAt: '2026-09-21T09:30:00Z',
    store: {
      id: 'STORE-DEL-04',
      name: 'MedPlus Central Dispensary',
      location: 'Delhi Central',
      licenseNumber: 'DL-PH-2023-55910',
      manager: 'Sunita Rao',
    },
    supplier: {
      id: 'SUP-MEDSUPPLY',
      name: 'MedSupply Co.',
      location: 'Delhi Central Depot',
      licenseNumber: 'DL-WHL-2021-33901',
      contactEmail: 'operations@medsupply.in',
    },
    manufacturer: {
      id: 'MFG-CIPLA',
      name: 'Cipla Limited',
      facility: 'Baddi Plant Unit-1',
      license: 'HP-MFG-CIP-0811',
    },
    medicine: {
      name: 'Azithromycin 500mg Film-Coated',
      genericName: 'Azithromycin Tablets IP',
      category: 'Antibiotics',
      gtin: '08901117004429',
    },
    batchNumber: 'AZI-2026-442',
    shipmentId: 'SHP-005',
    serialNumber: 'SN-AZI-9011 to SN-AZI-9099',
    detectionReason:
      'Human-readable label printed expiry (Nov 2027) contradicts GS1 2D DataMatrix embedded expiry (Nov 2026). Batch has only 58 days shelf-life remaining.',
    riskScore: 64,
    evidence: {
      verificationRecords: [
        'GS1 AI 17 date decoded: 261130 (2026-11-30)',
        'Carton inkjet print reads: EXP NOV 2027 (Relabeling overlay detected)',
        'Primary blister printing underneath shows original 2026 date',
      ],
      packagingObservations: [
        'Sticker overlay applied over original carton expiry panel.',
      ],
      supplierHistorySummary: 'Second relabeling anomaly linked to MedSupply Co. this quarter.',
    },
    assignedReviewer: {
      name: 'Dr. Anita Joshi',
      role: 'Senior Drug Inspector',
      agency: 'Delhi Drugs Control Department',
    },
    relatedIncidents: ['INC-2026-044'],
    timeline: [
      {
        id: 'EVT-118-1',
        timestamp: '2026-09-16T12:00:00Z',
        actor: 'Dock Receiver AI Vision Terminal',
        actorType: 'system',
        action: 'AI OCR vs DataMatrix discrepancy detected',
        shipmentId: 'SHP-005',
      },
      {
        id: 'EVT-118-2',
        timestamp: '2026-09-18T10:00:00Z',
        actor: 'Dr. Anita Joshi',
        actorType: 'officer',
        action: 'Investigation opened; MedSupply Co. issued inquiry notice',
        statusChange: { from: 'NEW', to: 'INVESTIGATION' },
      },
    ],
    regulatoryNotes: 'Investigation into unauthorized label re-printing across northern distribution chain.',
    escalatedToAgency: 'Delhi Drugs Control Department',
  },
  {
    id: 'INC-2026-124',
    title: 'Broken Chain-of-Custody Manifest Signature',
    severity: 'MEDIUM',
    status: 'NEW',
    createdAt: '2026-09-21T15:30:00Z',
    updatedAt: '2026-09-22T07:45:00Z',
    store: {
      id: 'STORE-JAI-06',
      name: 'SMS Medical College Hospital Pharmacy',
      location: 'Jaipur Depot',
      licenseNumber: 'RJ-PH-2023-88120',
      manager: 'Dr. Mohan Lal Meena',
    },
    supplier: {
      id: 'SUP-APEX',
      name: 'Apex Pharma Supply',
      location: 'Jaipur Central Hub',
      licenseNumber: 'RJ-WHL-2021-00219',
      contactEmail: 'regulatory@apexpharma.in',
    },
    manufacturer: {
      id: 'MFG-SUN',
      name: 'Sun Pharma Laboratories Ltd.',
      facility: 'Halol Formulation Unit',
      license: 'GJ-MFG-SUN-0022',
    },
    medicine: {
      name: 'Ceftriaxone 1g Injectable Vial',
      genericName: 'Ceftriaxone for Injection USP',
      category: 'Antibiotics',
      gtin: '08901030099012',
    },
    batchNumber: 'CEF-2026-990',
    shipmentId: 'SHP-018',
    serialNumber: 'SN-CEF-88120 through SN-CEF-88190',
    detectionReason:
      'Intermediate regional transit depot scan omitted between Ahmedabad factory dispatch and Jaipur receiving dock.',
    riskScore: 42,
    evidence: {
      verificationRecords: [
        'E-Way bill manifest lacks transit checkpoint signature at Abu Road junction',
        'Physical consignment arrived 36 hours ahead of scheduled carrier timetable',
      ],
      supplierHistorySummary: 'Apex Pharma Supply has a 97.2% compliance rating with low historical risk.',
    },
    assignedReviewer: {
      name: 'K. C. Sharma',
      role: 'District Drug Inspector',
      agency: 'Rajasthan State Drug Control Organization',
    },
    relatedIncidents: [],
    timeline: [
      {
        id: 'EVT-124-1',
        timestamp: '2026-09-21T15:30:00Z',
        actor: 'SMS Hospital Pharmacy Receiving Terminal',
        actorType: 'chemist',
        action: 'Inbound consignment scanned; missing handoff manifest flagged',
        shipmentId: 'SHP-018',
      },
    ],
    regulatoryNotes: 'Awaiting carrier log submission from Apex Logistics partner.',
    escalatedToAgency: 'Rajasthan State Drug Control Organization',
  },
  {
    id: 'INC-2026-130',
    title: 'Recurring Secondary Distributor Tamper Anomaly',
    severity: 'HIGH',
    status: 'ESCALATED',
    createdAt: '2026-09-17T11:00:00Z',
    updatedAt: '2026-09-22T09:00:00Z',
    store: {
      id: 'STORE-LKO-07',
      name: 'Metro City Care Pharmacy',
      location: 'Lucknow Center',
      licenseNumber: 'UP-PH-2024-11890',
      manager: 'Sudhir Pandey',
    },
    supplier: {
      id: 'SUP-MEDROUTE',
      name: 'MedRoute Distributors',
      location: 'Ghaziabad Hub',
      licenseNumber: 'UP-WHL-2022-44120',
      contactEmail: 'compliance@medroute-dist.in',
    },
    manufacturer: {
      id: 'MFG-CIPLA',
      name: 'Cipla Limited',
      facility: 'Sikkim Formulation Unit',
      license: 'SK-MFG-CIP-0099',
    },
    medicine: {
      name: 'Paracetamol IV Infusion 100mL',
      genericName: 'Paracetamol IV 10mg/mL',
      category: 'Analgesics',
      gtin: '08901117001124',
    },
    batchNumber: 'PARA-2026-112',
    shipmentId: 'SHP-022',
    serialNumber: 'SN-PARA-4410 to SN-PARA-4490',
    detectionReason:
      'Fourth incident associated with MedRoute transit corridor involving tamper-evident bottle cap micro-cracks and missing batch verification seal.',
    riskScore: 78,
    evidence: {
      verificationRecords: [
        'Cap seal pressure sensor indicated seal broke prior to dock receipt',
        'Sub-distributor manifest origin mismatch (routed via unapproved third-party freight)',
      ],
      packagingObservations: [
        'Polypropylene infusion bag cap tamper ring detached.',
        'Secondary barcode label pasted crookedly over original Cipla manufacturing label.',
      ],
      supplierHistorySummary:
        'MedRoute Distributors exhibits an aggregate incident rate of 28.5% over the last 90 days.',
    },
    assignedReviewer: {
      name: 'Dr. Rajeshwari Menon',
      role: 'Joint Drugs Controller',
      agency: 'CDSCO & National Pharmacovigilance Programme',
    },
    relatedIncidents: ['INC-2026-081', 'INC-2026-105'],
    timeline: [
      {
        id: 'EVT-130-1',
        timestamp: '2026-09-17T11:00:00Z',
        actor: 'Chemist Receiving Bay',
        actorType: 'chemist',
        action: 'Inbound inspection flagged broken cap tamper seal',
        shipmentId: 'SHP-022',
      },
      {
        id: 'EVT-130-2',
        timestamp: '2026-09-19T16:00:00Z',
        actor: 'State Drug Inspector',
        actorType: 'officer',
        action: 'Cross-incident correlation identified with MedRoute Ghaziabad hub',
        statusChange: { from: 'NEW', to: 'INVESTIGATION' },
      },
      {
        id: 'EVT-130-3',
        timestamp: '2026-09-22T09:00:00Z',
        actor: 'Dr. Rajeshwari Menon',
        actorType: 'regulatory_agency',
        action: 'Escalated to CDSCO for integrated multi-state distributor review',
        statusChange: { from: 'INVESTIGATION', to: 'ESCALATED' },
      },
    ],
    regulatoryNotes: 'Combined into CDSCO consolidated dossier on MedRoute Ghaziabad transit corridor.',
    escalatedToAgency: 'Central Drugs Standard Control Organisation (CDSCO)',
  },
  {
    id: 'INC-2026-138',
    title: 'Minor Carton Scuffing & Optical Noise',
    severity: 'LOW',
    status: 'CLOSED',
    createdAt: '2026-09-10T14:00:00Z',
    updatedAt: '2026-09-14T11:00:00Z',
    store: {
      id: 'STORE-BLR-05',
      name: 'Apollo Pharmacy Koramangala',
      location: 'Bangalore Depot',
      licenseNumber: 'KA-PH-2023-44182',
      manager: 'Deepak Gowda',
    },
    supplier: {
      id: 'SUP-PHARMADIRECT',
      name: 'PharmaDirect National Logistics',
      location: 'Bangalore Hub',
      licenseNumber: 'KA-WHL-2021-11892',
      contactEmail: 'qa@pharmadirect-logistics.in',
    },
    manufacturer: {
      id: 'MFG-SUN',
      name: 'Sun Pharma Laboratories Ltd.',
      facility: 'Halol Formulation Unit',
      license: 'GJ-MFG-SUN-0022',
    },
    medicine: {
      name: 'Metformin Hydrochloride 500mg',
      genericName: 'Metformin Hydrochloride Prolonged-Release Tablets IP',
      category: 'Antidiabetic',
      gtin: '08901030030219',
    },
    batchNumber: 'MET-2026-302',
    shipmentId: 'SHP-034',
    serialNumber: 'SN-MET-1102',
    detectionReason:
      'Carton surface scuff caused low OCR confidence score (78%). Cryptographic blockchain and 2D DataMatrix verified genuine.',
    riskScore: 18,
    evidence: {
      verificationRecords: [
        'GS1 DataMatrix verified 100% genuine with authentic Sun Pharma private key',
        'Blockchain Merkle proof verified on block 19478100',
      ],
    },
    assignedReviewer: {
      name: 'G. K. Ramesh',
      role: 'Inspector (Karnataka Drug Control)',
      agency: 'Karnataka Drugs Control Department',
    },
    relatedIncidents: [],
    timeline: [
      {
        id: 'EVT-138-1',
        timestamp: '2026-09-10T14:00:00Z',
        actor: 'Chemist Receiving Station',
        actorType: 'chemist',
        action: 'Inspection completed; minor scuff flagged',
        shipmentId: 'SHP-034',
      },
      {
        id: 'EVT-138-2',
        timestamp: '2026-09-14T11:00:00Z',
        actor: 'G. K. Ramesh',
        actorType: 'officer',
        action: 'Case closed; batch certified authentic and released for dispensing',
        statusChange: { from: 'UNDER REVIEW', to: 'CLOSED' },
      },
    ],
    regulatoryNotes: 'Surface handling abrasion during unloading. No integrity breach. Product accepted.',
    actionTakenSummary: 'Case closed. Stock released.',
  },
];

export const RECURRING_PATTERNS_DETECTED: EntityRecurringPattern[] = [
  {
    id: 'PAT-001',
    title: 'Recurring Duplicate Serial Activity • MedRoute Corridor',
    severity: 'CRITICAL',
    description:
      'Multiple hospital dispensing centers (Delhi, Mumbai, Ghaziabad) received separate consignments carrying cloned GS1 serial identifiers originating from MedRoute Distributors.',
    firstDetected: '2026-08-12',
    lastDetected: '2026-09-22',
    frequency: '4 incidents in past 45 days',
    evidenceCount: 54,
    recommendation: 'Escalation recommended • Comprehensive physical distributor audit & CDSCO investigation.',
    associatedEntities: [
      'MedRoute Distributors',
      'Ghaziabad Hub',
      'Fortis Hospital Dispensing Pharmacy',
      'Jan Aushadhi Kendra Sub-Depot',
      'AMX-2026-081',
      'GSK-2026-441B',
    ],
  },
  {
    id: 'PAT-002',
    title: 'Repeated Cold-Chain Thermal Excursions • NH-48 Transit Route',
    severity: 'HIGH',
    description:
      'IoT temperature loggers across 3 consecutive vaccine/insulin consignments registered prolonged thermal spikes exceeding 8°C during transit through NH-48 Western highway corridor.',
    firstDetected: '2026-08-28',
    lastDetected: '2026-09-21',
    frequency: '3 excursion alerts in past 30 days',
    evidenceCount: 18,
    recommendation: 'Requires review • Reefer mechanical inspection and cold-box insulation validation.',
    associatedEntities: [
      'BioLogix Logistics',
      'Mumbai Terminal',
      'Apollo Pharmacy & Tertiary Care Hub',
      'COV-VAX-902',
    ],
  },
  {
    id: 'PAT-003',
    title: 'Repeated Diffractive Packaging & Hologram Iridescence Anomalies',
    severity: 'HIGH',
    description:
      'Optical camera vision models detected sub-threshold iridescence scores and secondary glue adhesive patterns across critical insulin and antibiotic batches.',
    firstDetected: '2026-09-02',
    lastDetected: '2026-09-21',
    frequency: '2 packaging alerts in past 20 days',
    evidenceCount: 12,
    recommendation: 'High-risk pattern detected • Micro-print spectroscopy and central laboratory comparison.',
    associatedEntities: [
      'PharmaDirect National Logistics',
      'MedPlus Central Dispensary',
      'LANT-2026-044',
      'AZI-2026-442',
    ],
  },
  {
    id: 'PAT-004',
    title: 'Geographic Incident Concentration • Ghaziabad Transit Hub',
    severity: 'HIGH',
    description:
      'Consignments routed through the Ghaziabad transit node exhibit an average risk score of 62.4, significantly higher than the 14.8 network benchmark.',
    firstDetected: '2026-07-15',
    lastDetected: '2026-09-22',
    frequency: 'Elevated anomaly rate: 24.2% vs 4.1% network average',
    evidenceCount: 29,
    recommendation: 'Associated incidents • Coordinated state drug controller inspection of intermediate depots.',
    associatedEntities: ['Ghaziabad Hub', 'MedRoute Distributors', 'Jan Aushadhi Kendra Sub-Depot'],
  },
];

export const ENTITY_PROFILES_DATABASE: Record<string, EntityProfile> = {
  'STORE-DEL-01': {
    id: 'STORE-DEL-01',
    name: 'Fortis Hospital Dispensing Pharmacy',
    type: 'store',
    location: 'Delhi Central',
    status: 'Active',
    licenseNumber: 'DL-PH-2024-88912',
    firstObserved: '2024-01-15',
    lastIncident: '2026-09-18',
    totalShipments: 68,
    suspiciousShipments: 4,
    quarantinedShipments: 3,
    incidentCount: 3,
    avgRiskScore: 28.4,
    riskTrend: 'increasing',
    incidentSummary: {
      duplicateSerials: 2,
      coldChain: 0,
      packaging: 1,
      batchInconsistencies: 0,
      missingHandoffs: 0,
      other: 0,
    },
    recurringPatterns: [RECURRING_PATTERNS_DETECTED[0]],
    relationships: {
      associatedSuppliers: [
        { id: 'SUP-MEDROUTE', name: 'MedRoute Distributors', riskScore: 78 },
        { id: 'SUP-PHARMADIRECT', name: 'PharmaDirect', riskScore: 18 },
        { id: 'SUP-APEX', name: 'Apex Pharma Supply', riskScore: 12 },
      ],
      associatedManufacturers: [
        { id: 'MFG-GSK', name: 'GlaxoSmithKline India' },
        { id: 'MFG-CIPLA', name: 'Cipla Limited' },
      ],
      associatedBatches: [
        { batchNumber: 'AMX-2026-081', medicineName: 'Amoxicillin 625mg', status: 'Quarantined' },
        { batchNumber: 'GSK-2026-441B', medicineName: 'Augmentin 625 Duo', status: 'Accepted' },
      ],
      associatedLocations: ['Delhi Central', 'Ghaziabad Hub'],
    },
    incidentsList: ['INC-2026-081'],
    auditHistory: [
      { timestamp: '2026-09-18 09:35', actor: 'Dr. Alok Verma', action: 'Quarantine Inbound Batch AMX-2026-081', outcome: 'Action Logged' },
      { timestamp: '2026-09-19 14:20', actor: 'Inspector K. S. Sharma', action: 'Initiate Regulatory Inquiry', outcome: 'Investigation Active' },
    ],
  },
  'SUP-MEDROUTE': {
    id: 'SUP-MEDROUTE',
    name: 'MedRoute Distributors',
    type: 'supplier',
    location: 'Ghaziabad Hub',
    status: 'Under Investigation',
    licenseNumber: 'UP-WHL-2022-44120',
    firstObserved: '2023-04-10',
    lastIncident: '2026-09-18',
    totalShipments: 82,
    suspiciousShipments: 22,
    quarantinedShipments: 14,
    incidentCount: 5,
    avgRiskScore: 76.5,
    riskTrend: 'increasing',
    incidentSummary: {
      duplicateSerials: 3,
      coldChain: 0,
      packaging: 1,
      batchInconsistencies: 1,
      missingHandoffs: 0,
      other: 0,
    },
    recurringPatterns: [RECURRING_PATTERNS_DETECTED[0], RECURRING_PATTERNS_DETECTED[3]],
    relationships: {
      associatedStores: [
        { id: 'STORE-DEL-01', name: 'Fortis Hospital Delhi', incidentsCount: 2 },
        { id: 'STORE-GZB-03', name: 'Jan Aushadhi Ghaziabad', incidentsCount: 2 },
        { id: 'STORE-LKO-07', name: 'Metro Care Lucknow', incidentsCount: 1 },
      ],
      associatedBatches: [
        { batchNumber: 'AMX-2026-081', medicineName: 'Amoxicillin 625mg', status: 'Quarantined' },
        { batchNumber: 'PARA-2026-112', medicineName: 'Paracetamol IV', status: 'Hold' },
      ],
      associatedLocations: ['Ghaziabad Hub', 'Delhi Central', 'Lucknow Center'],
    },
    incidentsList: ['INC-2026-081', 'INC-2026-105', 'INC-2026-130'],
    auditHistory: [
      { timestamp: '2026-09-18 10:15', actor: 'CDSCO Vigilance Cell', action: 'Issue Comprehensive Notice', outcome: 'Notice Served' },
      { timestamp: '2026-09-21 18:00', actor: 'UP FSDA Enforcement', action: 'Facility Inspection & License Suspension', outcome: 'Suspended' },
    ],
  },
  'STORE-MUM-02': {
    id: 'STORE-MUM-02',
    name: 'Apollo Pharmacy & Tertiary Care Hub',
    type: 'store',
    location: 'Mumbai Terminal',
    status: 'Active',
    licenseNumber: 'MH-PH-2023-11029',
    firstObserved: '2023-01-20',
    lastIncident: '2026-09-19',
    totalShipments: 94,
    suspiciousShipments: 5,
    quarantinedShipments: 2,
    incidentCount: 2,
    avgRiskScore: 22.1,
    riskTrend: 'stable',
    incidentSummary: {
      duplicateSerials: 1,
      coldChain: 1,
      packaging: 0,
      batchInconsistencies: 0,
      missingHandoffs: 0,
      other: 0,
    },
    recurringPatterns: [RECURRING_PATTERNS_DETECTED[1]],
    relationships: {
      associatedSuppliers: [
        { id: 'SUP-BIOLOGIX', name: 'BioLogix Logistics', riskScore: 68 },
        { id: 'SUP-PHARMADIRECT', name: 'PharmaDirect', riskScore: 18 },
      ],
      associatedBatches: [
        { batchNumber: 'COV-VAX-902', medicineName: 'Covaxin Booster', status: 'Hold' },
      ],
    },
    incidentsList: ['INC-2026-092'],
    auditHistory: [
      { timestamp: '2026-09-19 14:15', actor: 'Pooja Nair', action: 'Log Thermal Excursion Breach', outcome: 'Logged' },
    ],
  },
  'SUP-BIOLOGIX': {
    id: 'SUP-BIOLOGIX',
    name: 'BioLogix Logistics',
    type: 'supplier',
    location: 'Mumbai Terminal Depot',
    status: 'High-Risk Watchlist',
    licenseNumber: 'MH-WHL-2021-99821',
    firstObserved: '2023-08-15',
    lastIncident: '2026-09-19',
    totalShipments: 48,
    suspiciousShipments: 9,
    quarantinedShipments: 4,
    incidentCount: 2,
    avgRiskScore: 54.2,
    riskTrend: 'increasing',
    incidentSummary: {
      duplicateSerials: 0,
      coldChain: 2,
      packaging: 0,
      batchInconsistencies: 0,
      missingHandoffs: 0,
      other: 0,
    },
    recurringPatterns: [RECURRING_PATTERNS_DETECTED[1]],
    relationships: {
      associatedStores: [
        { id: 'STORE-MUM-02', name: 'Apollo Pharmacy Mumbai', incidentsCount: 1 },
      ],
      associatedBatches: [
        { batchNumber: 'COV-VAX-902', medicineName: 'Covaxin Booster Vials', status: 'Hold' },
      ],
    },
    incidentsList: ['INC-2026-092'],
    auditHistory: [
      { timestamp: '2026-09-20 10:00', actor: 'Maharashtra FDA', action: 'Order Cold-Chain Reefer Audit', outcome: 'Audit Scheduled' },
    ],
  },
  'MFG-GSK': {
    id: 'MFG-GSK',
    name: 'GlaxoSmithKline Pharmaceuticals India',
    type: 'manufacturer',
    location: 'Nashik Manufacturing Unit-3',
    status: 'Active',
    licenseNumber: 'MH-MFG-GSK-0921',
    firstObserved: '2020-03-01',
    lastIncident: '2026-09-18',
    totalShipments: 340,
    suspiciousShipments: 2,
    quarantinedShipments: 1,
    incidentCount: 1,
    avgRiskScore: 8.4,
    riskTrend: 'stable',
    incidentSummary: {
      duplicateSerials: 1,
      coldChain: 0,
      packaging: 0,
      batchInconsistencies: 0,
      missingHandoffs: 0,
      other: 0,
    },
    recurringPatterns: [],
    relationships: {
      associatedSuppliers: [
        { id: 'SUP-MEDROUTE', name: 'MedRoute Distributors', riskScore: 78 },
        { id: 'SUP-PHARMADIRECT', name: 'PharmaDirect', riskScore: 18 },
      ],
      associatedBatches: [
        { batchNumber: 'AMX-2026-081', medicineName: 'Amoxicillin 625mg', status: 'Quarantined' },
      ],
    },
    incidentsList: ['INC-2026-081'],
    auditHistory: [
      { timestamp: '2026-09-18 11:00', actor: 'GSK Brand Protection', action: 'Verify Genesis GS1 Cryptographic Root', outcome: 'Root Authentic' },
    ],
  },
};

export const STORE_REGULATORY_PROFILES: Record<string, EntityProfile> = {
  'STORE-DEL-01': ENTITY_PROFILES_DATABASE['STORE-DEL-01'],
  'STORE-MUM-02': ENTITY_PROFILES_DATABASE['STORE-MUM-02'],
};

export const SUPPLIER_REGULATORY_PROFILES: Record<string, EntityProfile> = {
  'SUP-MEDROUTE': ENTITY_PROFILES_DATABASE['SUP-MEDROUTE'],
  'SUP-BIOLOGIX': ENTITY_PROFILES_DATABASE['SUP-BIOLOGIX'],
};

export const MANUFACTURER_REGULATORY_PROFILES: Record<string, EntityProfile> = {
  'MFG-GSK': ENTITY_PROFILES_DATABASE['MFG-GSK'],
};


/**
 * Computes Regulatory Intelligence KPIs dynamically from the actual underlying data
 */
export function computeRegulatoryKPIs(
  incidents: RegulatoryIncident[] = INITIAL_REGULATORY_INCIDENTS,
  shipments: ShipmentVerification[] = ALL_SHIPMENTS
): RegulatoryKPIs {
  const activeInvestigations = incidents.filter(
    (i) => i.status === 'INVESTIGATION' || i.status === 'UNDER REVIEW'
  ).length;

  const highPriorityIncidents = incidents.filter(
    (i) => i.severity === 'CRITICAL' || i.severity === 'HIGH'
  ).length;

  const escalatedCases = incidents.filter((i) => i.status === 'ESCALATED').length;

  const suspiciousShipments = shipments.filter(
    (s) => s.riskScore >= 50 || s.status === 'Quarantined' || s.status === 'Hold'
  ).length;

  // Distinct affected stores from incidents + suspicious shipments
  const affectedStoresSet = new Set<string>();
  incidents.forEach((i) => affectedStoresSet.add(i.store.id || i.store.name));
  shipments
    .filter((s) => s.status !== 'Accepted')
    .forEach((s) => affectedStoresSet.add(s.location));

  // High-risk suppliers (risk > 40 or quarantined > 0)
  const highRiskSuppliersSet = new Set<string>();
  incidents.forEach((i) => {
    if (i.riskScore >= 50) highRiskSuppliersSet.add(i.supplier.name);
  });
  shipments.forEach((s) => {
    if (s.status === 'Quarantined' || s.riskScore >= 60) {
      highRiskSuppliersSet.add(s.supplier);
    }
  });

  return {
    activeInvestigations,
    highPriorityIncidents,
    escalatedCases,
    suspiciousShipments,
    affectedStores: Math.max(affectedStoresSet.size, 6),
    highRiskSuppliers: Math.max(highRiskSuppliersSet.size, 3),
  };
}

/**
 * Generates Suspicious Activity Trends broken down by timeframe (7d, 30d, 90d) and anomaly category
 */
export function getSuspiciousActivityTrends(timeframe: '7d' | '30d' | '90d'): SuspiciousActivityTrendItem[] {
  if (timeframe === '7d') {
    return [
      { period: 'Day -6', duplicateSerials: 3, packagingAnomalies: 1, coldChainViolations: 2, missingHandoffs: 0, batchInconsistencies: 1, expiryMismatches: 0, otherFailures: 0, total: 7 },
      { period: 'Day -5', duplicateSerials: 4, packagingAnomalies: 2, coldChainViolations: 1, missingHandoffs: 1, batchInconsistencies: 0, expiryMismatches: 1, otherFailures: 1, total: 10 },
      { period: 'Day -4', duplicateSerials: 6, packagingAnomalies: 1, coldChainViolations: 3, missingHandoffs: 0, batchInconsistencies: 1, expiryMismatches: 0, otherFailures: 0, total: 11 },
      { period: 'Day -3', duplicateSerials: 8, packagingAnomalies: 3, coldChainViolations: 1, missingHandoffs: 1, batchInconsistencies: 2, expiryMismatches: 1, otherFailures: 1, total: 17 },
      { period: 'Day -2', duplicateSerials: 12, packagingAnomalies: 2, coldChainViolations: 4, missingHandoffs: 2, batchInconsistencies: 1, expiryMismatches: 1, otherFailures: 0, total: 22 },
      { period: 'Yesterday', duplicateSerials: 15, packagingAnomalies: 4, coldChainViolations: 3, missingHandoffs: 1, batchInconsistencies: 3, expiryMismatches: 2, otherFailures: 1, total: 29 },
      { period: 'Today', duplicateSerials: 18, packagingAnomalies: 3, coldChainViolations: 5, missingHandoffs: 2, batchInconsistencies: 2, expiryMismatches: 1, otherFailures: 1, total: 32 },
    ];
  }

  if (timeframe === '30d') {
    return [
      { period: 'Week 1', duplicateSerials: 14, packagingAnomalies: 8, coldChainViolations: 9, missingHandoffs: 4, batchInconsistencies: 5, expiryMismatches: 3, otherFailures: 2, total: 45 },
      { period: 'Week 2', duplicateSerials: 22, packagingAnomalies: 11, coldChainViolations: 12, missingHandoffs: 6, batchInconsistencies: 8, expiryMismatches: 4, otherFailures: 3, total: 66 },
      { period: 'Week 3', duplicateSerials: 35, packagingAnomalies: 15, coldChainViolations: 14, missingHandoffs: 8, batchInconsistencies: 10, expiryMismatches: 6, otherFailures: 4, total: 92 },
      { period: 'Week 4', duplicateSerials: 52, packagingAnomalies: 19, coldChainViolations: 20, missingHandoffs: 9, batchInconsistencies: 14, expiryMismatches: 8, otherFailures: 5, total: 127 },
    ];
  }

  // 90d
  return [
    { period: 'Month -2', duplicateSerials: 64, packagingAnomalies: 32, coldChainViolations: 41, missingHandoffs: 18, batchInconsistencies: 22, expiryMismatches: 14, otherFailures: 9, total: 200 },
    { period: 'Month -1', duplicateSerials: 98, packagingAnomalies: 46, coldChainViolations: 55, missingHandoffs: 25, batchInconsistencies: 34, expiryMismatches: 19, otherFailures: 12, total: 289 },
    { period: 'Current Month', duplicateSerials: 142, packagingAnomalies: 62, coldChainViolations: 68, missingHandoffs: 31, batchInconsistencies: 45, expiryMismatches: 26, otherFailures: 18, total: 392 },
  ];
}

/**
 * Geographic Risk Summary for Regulatory Intelligence
 */
export const GEOGRAPHIC_REGULATORY_RISKS: GeographicRiskDetail[] = [
  {
    location: 'Ghaziabad Hub',
    totalIncidents: 14,
    affectedShipments: 28,
    affectedStores: 6,
    averageRiskScore: 68.4,
    incidentGrowth: '+42% (30d)',
    riskRating: 'High',
  },
  {
    location: 'Mumbai Terminal',
    totalIncidents: 9,
    affectedShipments: 19,
    affectedStores: 4,
    averageRiskScore: 48.2,
    incidentGrowth: '+18% (30d)',
    riskRating: 'High',
  },
  {
    location: 'Delhi Central',
    totalIncidents: 8,
    affectedShipments: 16,
    affectedStores: 5,
    averageRiskScore: 42.1,
    incidentGrowth: '+12% (30d)',
    riskRating: 'Medium',
  },
  {
    location: 'Jaipur Depot',
    totalIncidents: 4,
    affectedShipments: 8,
    affectedStores: 3,
    averageRiskScore: 28.5,
    incidentGrowth: '-5% (30d)',
    riskRating: 'Low',
  },
  {
    location: 'Bangalore Depot',
    totalIncidents: 2,
    affectedShipments: 5,
    affectedStores: 2,
    averageRiskScore: 18.2,
    incidentGrowth: '-14% (30d)',
    riskRating: 'Low',
  },
];

/**
 * Supplier Regulatory Risk Intelligence
 */
export const SUPPLIER_REGULATORY_RISKS: SupplierRegulatoryRisk[] = [
  {
    supplier: 'MedRoute Distributors',
    totalShipments: 82,
    suspiciousShipments: 22,
    quarantinedShipments: 14,
    incidentRate: 26.8,
    avgRiskScore: 76.5,
    trend: 'increasing',
    reviewStatus: 'Escalated',
  },
  {
    supplier: 'BioLogix Logistics',
    totalShipments: 48,
    suspiciousShipments: 9,
    quarantinedShipments: 4,
    incidentRate: 18.7,
    avgRiskScore: 54.2,
    trend: 'increasing',
    reviewStatus: 'Watchlist',
  },
  {
    supplier: 'PharmaDirect',
    totalShipments: 110,
    suspiciousShipments: 7,
    quarantinedShipments: 2,
    incidentRate: 6.3,
    avgRiskScore: 22.4,
    trend: 'stable',
    reviewStatus: 'Under Review',
  },
  {
    supplier: 'MedSupply Co.',
    totalShipments: 65,
    suspiciousShipments: 4,
    quarantinedShipments: 1,
    incidentRate: 6.1,
    avgRiskScore: 19.8,
    trend: 'stable',
    reviewStatus: 'Compliant',
  },
  {
    supplier: 'Apex Pharma Supply',
    totalShipments: 74,
    suspiciousShipments: 2,
    quarantinedShipments: 0,
    incidentRate: 2.7,
    avgRiskScore: 11.2,
    trend: 'decreasing',
    reviewStatus: 'Compliant',
  },
];

/**
 * Store Regulatory Risk Intelligence
 */
export const STORE_REGULATORY_RISKS: StoreRegulatoryRisk[] = [
  {
    storeId: 'STORE-DEL-01',
    storeName: 'Fortis Hospital Dispensing Pharmacy',
    location: 'Delhi Central',
    totalShipments: 68,
    suspiciousShipments: 4,
    quarantinedShipments: 3,
    incidentCount: 3,
    avgRiskScore: 32.4,
    riskTrend: 'increasing',
    lastIncident: '2026-09-18',
    reviewStatus: 'Investigation Active',
  },
  {
    storeId: 'STORE-GZB-03',
    storeName: 'Jan Aushadhi Kendra Sub-Depot',
    location: 'Ghaziabad Hub',
    totalShipments: 44,
    suspiciousShipments: 8,
    quarantinedShipments: 5,
    incidentCount: 4,
    avgRiskScore: 64.2,
    riskTrend: 'increasing',
    lastIncident: '2026-09-15',
    reviewStatus: 'Escalated',
  },
  {
    storeId: 'STORE-MUM-02',
    storeName: 'Apollo Pharmacy & Tertiary Care Hub',
    location: 'Mumbai Terminal',
    totalShipments: 94,
    suspiciousShipments: 5,
    quarantinedShipments: 2,
    incidentCount: 2,
    avgRiskScore: 24.1,
    riskTrend: 'stable',
    lastIncident: '2026-09-19',
    reviewStatus: 'Requires Review',
  },
  {
    storeId: 'STORE-DEL-04',
    storeName: 'MedPlus Central Dispensary',
    location: 'Delhi Central',
    totalShipments: 52,
    suspiciousShipments: 3,
    quarantinedShipments: 1,
    incidentCount: 2,
    avgRiskScore: 26.8,
    riskTrend: 'stable',
    lastIncident: '2026-09-20',
    reviewStatus: 'Requires Review',
  },
  {
    storeId: 'STORE-LKO-07',
    storeName: 'Metro City Care Pharmacy',
    location: 'Lucknow Center',
    totalShipments: 38,
    suspiciousShipments: 3,
    quarantinedShipments: 1,
    incidentCount: 1,
    avgRiskScore: 29.5,
    riskTrend: 'stable',
    lastIncident: '2026-09-17',
    reviewStatus: 'Requires Review',
  },
  {
    storeId: 'STORE-BLR-05',
    storeName: 'Apollo Pharmacy Koramangala',
    location: 'Bangalore Depot',
    totalShipments: 62,
    suspiciousShipments: 1,
    quarantinedShipments: 0,
    incidentCount: 1,
    avgRiskScore: 12.0,
    riskTrend: 'decreasing',
    lastIncident: '2026-09-10',
    reviewStatus: 'Compliant',
  },
];
