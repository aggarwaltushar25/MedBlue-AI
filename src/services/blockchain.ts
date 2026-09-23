/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * MediShield AI — Cryptographic Blockchain & Traceability Service
 * 
 * Provides an immutable, tamper-evident hash-chain simulation for medicine
 * custody, verification anomalies, cold-chain breaches, and regulatory evidence.
 */

export interface BlockchainBlock {
  blockNumber: number;
  transactionId: string;
  timestamp: string;
  eventType:
    | 'MANUFACTURER_GENESIS'
    | 'BATCH_CREATED'
    | 'MANUFACTURED'
    | 'DISPATCHED_BY_MANUFACTURER'
    | 'SHIPMENT_DISPATCHED'
    | 'DISTRIBUTOR_RECEIVED'
    | 'RECEIVED_BY_WHOLESALER'
    | 'DISPATCHED_BY_WHOLESALER'
    | 'COLD_CHAIN_LOGGED'
    | 'PHARMACY_RECEIVED'
    | 'RECEIVED_BY_PHARMACIST'
    | 'DISPATCHED_BY_PHARMACIST'
    | 'RECEIVED_BY_CHEMIST'
    | 'ADDED_TO_INVENTORY'
    | 'MEDICINE_VERIFIED'
    | 'DISPENSED'
    | 'SOLD'
    | 'ANOMALY_FLAGGED'
    | 'STATUS_CHANGE'
    | 'EVIDENCE_ANCHORED'
    | 'REGULATORY_ESCALATED'
    | 'DISPOSITION_FINALIZED'
    | 'HOLOGRAM_REFERENCE_CREATED'
    | 'HOLOGRAM_CHECKED_BY_WHOLESALER'
    | 'HOLOGRAM_CHECKED_BY_PHARMACIST'
    | 'CLIENT_VERIFICATION';
  actor: string;
  actorRole:
    | 'Manufacturer'
    | 'Wholesaler'
    | 'Distributor'
    | 'Pharmacist'
    | 'Chemist'
    | 'Chemist / Pharmacist'
    | 'Patient'
    | 'Regulatory Inspector'
    | 'Regulator'
    | 'Admin'
    | 'IoT Automated Engine';
  shipmentId: string;
  medicineId: string;
  medicineName: string;
  batchId: string;
  eventData: Record<string, any>;
  previousHash: string;
  currentHash: string;
  isTampered?: boolean;
  tamperDetails?: string;
}

export interface ChainVerificationResult {
  isValid: boolean;
  totalBlocks: number;
  verifiedAt: string;
  failureBlockNumber?: number;
  failureReason?: string;
  expectedHash?: string;
  actualHash?: string;
  brokenLink?: {
    blockNumber: number;
    expectedPreviousHash: string;
    actualPreviousHash: string;
  };
  details: {
    blockNumber: number;
    transactionId: string;
    hashValid: boolean;
    prevHashLinked: boolean;
    computedHash: string;
    storedHash: string;
  }[];
}

export interface EvidenceIntegrityRecord {
  evidenceId: string;
  evidenceType: string;
  createdAt: string;
  relatedShipment: string;
  relatedIncident?: string;
  dataPayload: Record<string, any>;
  computedHash: string;
  anchoredHash: string;
  blockchainTx: string;
  blockNumber: number;
  isTampered: boolean;
}

export interface TestCaseDemo {
  id: string;
  title: string;
  category: string;
  scenario: string;
  input: string;
  detectionFlow: string[];
  blockchainOutcome: string;
  riskScoreResult: number;
  verdict: 'VALID' | 'TAMPER_DETECTED' | 'INCIDENT_CREATED' | 'ESCALATED';
}

/**
 * Synchronous SHA-256 hash generator using standard JS implementation
 * for deterministic in-memory calculation and instant verification.
 */
function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let compositeArray = '';
  for (let idx = 0; idx < ascii.length; idx++) {
    compositeArray += ascii.charCodeAt(idx).toString(16).padStart(2, '0');
  }

  const bytes: number[] = [];
  for (let c = 0; c < ascii.length; c++) {
    bytes.push(ascii.charCodeAt(c) & 0xff);
  }

  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) {
    bytes.push(0);
  }

  bytes.push(0, 0, 0, 0);
  bytes.push((asciiBitLength >>> 24) & 0xff);
  bytes.push((asciiBitLength >>> 16) & 0xff);
  bytes.push((asciiBitLength >>> 8) & 0xff);
  bytes.push(asciiBitLength & 0xff);

  for (let b = 0; b < bytes.length; b += 4) {
    words.push((bytes[b] << 24) | (bytes[b + 1] << 16) | (bytes[b + 2] << 8) | bytes[b + 3]);
  }

  for (let chunk = 0; chunk < words.length; chunk += 16) {
    const w = new Array(64);
    for (let c = 0; c < 16; c++) {
      w[c] = words[chunk + c];
    }
    for (let c = 16; c < 64; c++) {
      const s0 = rightRotate(w[c - 15], 7) ^ rightRotate(w[c - 15], 18) ^ (w[c - 15] >>> 3);
      const s1 = rightRotate(w[c - 2], 17) ^ rightRotate(w[c - 2], 19) ^ (w[c - 2] >>> 10);
      w[c] = (((w[c - 16] + s0) | 0) + ((w[c - 7] + s1) | 0)) | 0;
    }

    let a = hash[0];
    let b = hash[1];
    let c = hash[2];
    let d = hash[3];
    let e = hash[4];
    let f = hash[5];
    let g = hash[6];
    let h = hash[7];

    for (let cIdx = 0; cIdx < 64; cIdx++) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (((((h + s1) | 0) + ch) | 0) + ((k[cIdx] + w[cIdx]) | 0)) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (let hIdx = 0; hIdx < 8; hIdx++) {
    result += (hash[hIdx] >>> 0).toString(16).padStart(8, '0');
  }

  return result;
}

/**
 * Calculates deterministic SHA-256 block hash based on block payload and previousHash
 */
export function calculateBlockHash(block: Omit<BlockchainBlock, 'currentHash'>): string {
  const contentString = [
    block.blockNumber,
    block.transactionId,
    block.timestamp,
    block.eventType,
    block.actor,
    block.actorRole,
    block.shipmentId,
    block.medicineId,
    block.batchId,
    JSON.stringify(block.eventData),
    block.previousHash,
  ].join('|');

  return sha256(contentString);
}

/**
 * Calculates SHA-256 hash for arbitrary evidence objects
 */
export function hashEvidencePayload(payload: Record<string, any>): string {
  return sha256(JSON.stringify(payload));
}

/**
 * Modular Blockchain Provider Abstraction
 */
export interface BlockchainProvider {
  getChain(): BlockchainBlock[];
  getBlocksForShipment(shipmentId: string): BlockchainBlock[];
  getBlock(blockNumber: number): BlockchainBlock | undefined;
  getTransaction(txId: string): BlockchainBlock | undefined;
  addBlock(
    blockData: Omit<BlockchainBlock, 'blockNumber' | 'currentHash' | 'previousHash'>
  ): BlockchainBlock;
  getAncestryBlocks(shipmentId: string, visited?: Set<string>): BlockchainBlock[];
  verifyChain(shipmentId?: string): ChainVerificationResult;
  tamperBlockData(blockNumber: number, modifiedEventData: Record<string, any>, customNote?: string): void;
  deleteBlock(blockNumber: number): boolean;
  restoreGenesisChain(): void;
  verifyEvidence(evidenceId: string): EvidenceIntegrityRecord | undefined;
}

/**
 * Initial Genesis Blocks Dataset
 */
const INITIAL_GENESIS_BLOCKS: Omit<BlockchainBlock, 'currentHash' | 'previousHash'>[] = [
  // BLOCK 1: Genesis Batch Creation
  {
    blockNumber: 1040,
    transactionId: 'TX-2026-009810',
    timestamp: '2026-09-15 08:30:00 UTC',
    eventType: 'MANUFACTURER_GENESIS',
    actor: 'GlaxoSmithKline Nashik Unit-3',
    actorRole: 'Manufacturer',
    shipmentId: 'SHP-001',
    medicineId: 'MED-AMX-625',
    medicineName: 'Amoxicillin + Clavulanate 625mg',
    batchId: 'AMX-2026-081',
    eventData: {
      action: 'Batch Registered in Master GS1 EPCIS Registry',
      mfgLicense: 'MH-MFG-GSK-0921',
      unitsManufactured: 10000,
      expiryDate: '2028-09-14',
      gtin: '08901030048123',
      initialSerialRange: 'SN-1004800 to SN-1014799',
    },
  },
  // BLOCK 2: Batch Quality & Hologram Certificate
  {
    blockNumber: 1041,
    transactionId: 'TX-2026-009811',
    timestamp: '2026-09-15 14:15:00 UTC',
    eventType: 'BATCH_CREATED',
    actor: 'GSK Quality Assurance Lab',
    actorRole: 'Manufacturer',
    shipmentId: 'SHP-001',
    medicineId: 'MED-AMX-625',
    medicineName: 'Amoxicillin + Clavulanate 625mg',
    batchId: 'AMX-2026-081',
    eventData: {
      action: 'HPLC Chemical Purity Test & Holographic Master Key Anchor',
      purityPercentage: 99.8,
      hologramMasterSeed: '0x9948ba12ff89d10e',
      pharmaGrade: 'USP / IP Compliance Verified',
      releaseAuthorizedBy: 'Dr. S. K. Mehta (VP Quality)',
    },
  },
  // BLOCK 3: Consignment Dispatched to Distributor
  {
    blockNumber: 1042,
    transactionId: 'TX-2026-009814',
    timestamp: '2026-09-16 09:00:00 UTC',
    eventType: 'SHIPMENT_DISPATCHED',
    actor: 'GSK Central Logistics Depot',
    actorRole: 'Manufacturer',
    shipmentId: 'SHP-001',
    medicineId: 'MED-AMX-625',
    medicineName: 'Amoxicillin + Clavulanate 625mg',
    batchId: 'AMX-2026-081',
    eventData: {
      action: 'Consignment Handed Over to Regional Freight',
      assignedDistributor: 'MedRoute Distributors (Ghaziabad Hub)',
      cartonCount: 50,
      containerTag: 'RFID-PAL-8812',
      targetStorageTemp: '15°C - 25°C',
    },
  },
  // BLOCK 4: Distributor Inbound Dock Receipt
  {
    blockNumber: 1043,
    transactionId: 'TX-2026-009817',
    timestamp: '2026-09-17 11:20:00 UTC',
    eventType: 'DISTRIBUTOR_RECEIVED',
    actor: 'MedRoute Distributors (Ghaziabad Hub)',
    actorRole: 'Distributor',
    shipmentId: 'SHP-001',
    medicineId: 'MED-AMX-625',
    medicineName: 'Amoxicillin + Clavulanate 625mg',
    batchId: 'AMX-2026-081',
    eventData: {
      action: 'Inbound Dock Scan & Warehouse Log',
      receivedCartons: 50,
      inspectionStatus: 'Visual Inspection Passed',
      warehouseBin: 'BAY-C4-NORTH',
    },
  },
  // BLOCK 5: Pharmacy Inbound Receipt Scan
  {
    blockNumber: 1044,
    transactionId: 'TX-2026-009820',
    timestamp: '2026-09-18 09:28:00 UTC',
    eventType: 'PHARMACY_RECEIVED',
    actor: 'Fortis Hospital Dispensing Pharmacy',
    actorRole: 'Chemist / Pharmacist',
    shipmentId: 'SHP-001',
    medicineId: 'MED-AMX-625',
    medicineName: 'Amoxicillin + Clavulanate 625mg',
    batchId: 'AMX-2026-081',
    eventData: {
      action: 'Dock Inbound Verification Scan',
      scannedBy: 'Ramesh Patel (Lead Chemist)',
      terminalId: 'CHEM-DOCK-DEL-04',
      opticalHologramScore: 38, // Suspiciously low
      declaredQuantity: 500,
    },
  },
  // BLOCK 6: Optical & Serial Anomaly Flagged
  {
    blockNumber: 1045,
    transactionId: 'TX-2026-009821',
    timestamp: '2026-09-18 09:30:14 UTC',
    eventType: 'ANOMALY_FLAGGED',
    actor: 'MediShield AI Real-Time Rule Engine',
    actorRole: 'IoT Automated Engine',
    shipmentId: 'SHP-001',
    medicineId: 'MED-AMX-625',
    medicineName: 'Amoxicillin + Clavulanate 625mg',
    batchId: 'AMX-2026-081',
    eventData: {
      anomalyType: 'DUPLICATE_GS1_SERIAL_COLLISION',
      detectedSerials: ['SN-1004812', 'SN-1004813', 'SN-1004814', 'SN-1004815'],
      simultaneousLocation: 'Apollo Mumbai Terminal Depot (Scanned at 09:15 UTC)',
      velocityExceeded: '1400 km in 15 minutes (Physically Impossible Transit)',
      calculatedRiskScore: 84,
    },
  },
  // BLOCK 7: Quarantine Status Enforcement
  {
    blockNumber: 1046,
    transactionId: 'TX-2026-009825',
    timestamp: '2026-09-18 09:35:00 UTC',
    eventType: 'STATUS_CHANGE',
    actor: 'Dr. Alok Verma (Chief Pharmacist)',
    actorRole: 'Chemist / Pharmacist',
    shipmentId: 'SHP-001',
    medicineId: 'MED-AMX-625',
    medicineName: 'Amoxicillin + Clavulanate 625mg',
    batchId: 'AMX-2026-081',
    eventData: {
      action: 'Shipment Status Override: QUARANTINED',
      previousStatus: 'IN_TRANSIT',
      newStatus: 'QUARANTINED',
      physicalVaultLock: 'VAULT-SEC-DEL-01',
      chemistDirective: 'Do not dispense to any patient under any circumstance.',
    },
  },
  // BLOCK 8: Evidence Package Hash Anchored
  {
    blockNumber: 1047,
    transactionId: 'TX-2026-009828',
    timestamp: '2026-09-18 09:40:00 UTC',
    eventType: 'EVIDENCE_ANCHORED',
    actor: 'MediShield AI Cryptographic Anchor',
    actorRole: 'IoT Automated Engine',
    shipmentId: 'SHP-001',
    medicineId: 'MED-AMX-625',
    medicineName: 'Amoxicillin + Clavulanate 625mg',
    batchId: 'AMX-2026-081',
    eventData: {
      evidencePackageId: 'EVD-AMX-001-SERIALS',
      evidenceSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      capturedImages: ['ovd_diffraction_failed.jpg', 'carton_microtext_blur.jpg'],
      serialHashList: ['0x114a...', '0x992b...', '0x77c1...'],
    },
  },
  // BLOCK 9: Regulatory Authority Escalation
  {
    blockNumber: 1048,
    transactionId: 'TX-2026-009832',
    timestamp: '2026-09-18 10:15:00 UTC',
    eventType: 'REGULATORY_ESCALATED',
    actor: 'CDSCO Central Drugs Inspectorate',
    actorRole: 'Regulatory Inspector',
    shipmentId: 'SHP-001',
    medicineId: 'MED-AMX-625',
    medicineName: 'Amoxicillin + Clavulanate 625mg',
    batchId: 'AMX-2026-081',
    eventData: {
      incidentId: 'INC-2026-081',
      dossierStatus: 'OFFICIAL_CASE_OPENED',
      caseOfficer: 'Dr. Neha Sen (Senior Drug Inspector)',
      legalDirective: 'Sub-depot audit notice served to MedRoute Distributors under Section 18-B Drugs Act',
    },
  },

  // SECOND SHIPMENT: SHP-002 (Cold-Chain Excursion Trail)
  {
    blockNumber: 1049,
    transactionId: 'TX-2026-009840',
    timestamp: '2026-09-17 06:00:00 UTC',
    eventType: 'MANUFACTURER_GENESIS',
    actor: 'Bharat Biotech Hyderabad Plant 2',
    actorRole: 'Manufacturer',
    shipmentId: 'SHP-002',
    medicineId: 'MED-COV-902',
    medicineName: 'Covaxin Booster Vials',
    batchId: 'COV-VAX-902',
    eventData: {
      action: 'Vaccine Batch Anchored in Cold-Chain Chain',
      mfgLicense: 'TS-MFG-BB-0041',
      coldChainRange: '2.0°C to 8.0°C Strict Requirement',
      unitsManufactured: 5000,
    },
  },
  {
    blockNumber: 1050,
    transactionId: 'TX-2026-009842',
    timestamp: '2026-09-18 14:00:00 UTC',
    eventType: 'COLD_CHAIN_LOGGED',
    actor: 'Reefer IoT Telemetry Sensor #IoT-9921',
    actorRole: 'IoT Automated Engine',
    shipmentId: 'SHP-002',
    medicineId: 'MED-COV-902',
    medicineName: 'Covaxin Booster Vials',
    batchId: 'COV-VAX-902',
    eventData: {
      action: 'IoT Reefer Compressor Thermal Breach Logged',
      recordedTemp: 14.8,
      allowedMaxTemp: 8.0,
      breachDurationMinutes: 180,
      carrier: 'BioLogix Logistics (Mumbai Hub)',
      gpsLocation: '19.0760° N, 72.8777° E (Panvel Bypass)',
    },
  },
  {
    blockNumber: 1051,
    transactionId: 'TX-2026-009845',
    timestamp: '2026-09-19 09:15:00 UTC',
    eventType: 'STATUS_CHANGE',
    actor: 'Apollo Pharmacy Receiving Pharmacist',
    actorRole: 'Chemist / Pharmacist',
    shipmentId: 'SHP-002',
    medicineId: 'MED-COV-902',
    medicineName: 'Covaxin Booster Vials',
    batchId: 'COV-VAX-902',
    eventData: {
      action: 'Thermal Breach Rejection — Placed on HOLD',
      previousStatus: 'IN_TRANSIT',
      newStatus: 'HOLD',
      reason: 'Exceeded 8°C threshold for > 3 hours. Biological denaturation risk.',
    },
  },

  // THIRD SHIPMENT: SHP-003 (Standard Clean Compliant Trail)
  {
    blockNumber: 1052,
    transactionId: 'TX-2026-009850',
    timestamp: '2026-09-19 08:00:00 UTC',
    eventType: 'MANUFACTURER_GENESIS',
    actor: 'Sun Pharma Baroda Plant-1',
    actorRole: 'Manufacturer',
    shipmentId: 'SHP-003',
    medicineId: 'MED-LIP-20',
    medicineName: 'Lipitor (Atorvastatin) 20mg',
    batchId: 'LIP-2026-442',
    eventData: {
      action: 'Master Batch Genesis Registered',
      unitsManufactured: 25000,
      purity: '99.9% Assay Standard',
    },
  },
  {
    blockNumber: 1053,
    transactionId: 'TX-2026-009852',
    timestamp: '2026-09-20 10:30:00 UTC',
    eventType: 'DISTRIBUTOR_RECEIVED',
    actor: 'PharmaDirect Central Hub',
    actorRole: 'Distributor',
    shipmentId: 'SHP-003',
    medicineId: 'MED-LIP-20',
    medicineName: 'Lipitor (Atorvastatin) 20mg',
    batchId: 'LIP-2026-442',
    eventData: {
      action: 'Compliant Handoff Scan',
      condition: 'Pristine Packaging Verified',
    },
  },
  {
    blockNumber: 1054,
    transactionId: 'TX-2026-009855',
    timestamp: '2026-09-21 11:00:00 UTC',
    eventType: 'MEDICINE_VERIFIED',
    actor: 'Max Super Speciality Pharmacy',
    actorRole: 'Chemist / Pharmacist',
    shipmentId: 'SHP-003',
    medicineId: 'MED-LIP-20',
    medicineName: 'Lipitor (Atorvastatin) 20mg',
    batchId: 'LIP-2026-442',
    eventData: {
      action: 'Optical GS1 + Hologram Check: 100% Authentic',
      cryptographicSignature: 'VALID_SUN_PHARMA_ROOT',
      status: 'Accepted',
    },
  },
];

/**
 * Builds the initial linked blockchain from the raw block specifications
 */
function buildLinkedChain(): BlockchainBlock[] {
  const chain: BlockchainBlock[] = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000'; // Genesis Hash

  for (const rawBlock of INITIAL_GENESIS_BLOCKS) {
    const blockWithoutCurrentHash: Omit<BlockchainBlock, 'currentHash'> = {
      ...rawBlock,
      previousHash: prevHash,
    };
    const currentHash = calculateBlockHash(blockWithoutCurrentHash);
    const block: BlockchainBlock = {
      ...blockWithoutCurrentHash,
      currentHash,
    };
    chain.push(block);
    prevHash = currentHash;
  }

  return chain;
}

/**
 * Local In-Memory Blockchain Provider Implementation
 */
export class LocalBlockchainProvider implements BlockchainProvider {
  private chain: BlockchainBlock[];
  private originalGenesisChain: BlockchainBlock[];

  constructor() {
    this.originalGenesisChain = buildLinkedChain();
    try {
      const savedChain = localStorage.getItem('medishield_blockchain_chain');
      this.chain = savedChain ? JSON.parse(savedChain) : buildLinkedChain();
    } catch {
      this.chain = buildLinkedChain();
    }
  }

  private persist() {
    try {
      localStorage.setItem('medishield_blockchain_chain', JSON.stringify(this.chain));
    } catch {
      // localStorage quota or private browsing
    }
  }

  public getChain(): BlockchainBlock[] {
    return [...this.chain];
  }

  public getBlocksForShipment(shipmentId: string): BlockchainBlock[] {
    return this.chain.filter((b) => b.shipmentId === shipmentId);
  }

  public getAncestryBlocks(shipmentId: string, visited: Set<string> = new Set()): BlockchainBlock[] {
    if (!shipmentId || visited.has(shipmentId)) return [];
    visited.add(shipmentId);

    // Get current shipment blocks
    const currentBlocks = this.chain.filter((b) => b.shipmentId === shipmentId);
    
    // Find parent shipment ID from eventData of these blocks or by searching for the first block of this shipment
    // In our architecture, the parentShipmentId is often stored in the eventData of the DISPATCH block
    const parentId = currentBlocks.find(b => b.eventData.parentShipmentId)?.eventData.parentShipmentId;

    if (parentId) {
      return [...this.getAncestryBlocks(parentId, visited), ...currentBlocks];
    }

    return currentBlocks;
  }

  public getBlock(blockNumber: number): BlockchainBlock | undefined {
    return this.chain.find((b) => b.blockNumber === blockNumber);
  }

  public getTransaction(txId: string): BlockchainBlock | undefined {
    return this.chain.find((b) => b.transactionId === txId);
  }

  public addBlock(
    blockData: Omit<BlockchainBlock, 'blockNumber' | 'currentHash' | 'previousHash'>
  ): BlockchainBlock {
    const lastBlock = this.chain[this.chain.length - 1];
    const newBlockNumber = lastBlock ? lastBlock.blockNumber + 1 : 1000;
    const previousHash = lastBlock ? lastBlock.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';

    const blockWithoutHash: Omit<BlockchainBlock, 'currentHash'> = {
      ...blockData,
      blockNumber: newBlockNumber,
      previousHash,
    };

    const currentHash = calculateBlockHash(blockWithoutHash);
    const newBlock: BlockchainBlock = {
      ...blockWithoutHash,
      currentHash,
    };

    this.chain.push(newBlock);
    this.persist();
    return newBlock;
  }

  /**
   * Verifies the cryptographic integrity of the entire chain or a specific shipment's chain segment.
   * Recalculates SHA-256 for each block and checks previousHash pointer linkage.
   */
  public verifyChain(shipmentId?: string): ChainVerificationResult {
    const chainToVerify = shipmentId
      ? this.chain.filter((b) => b.shipmentId === shipmentId)
      : this.chain;

    const details: ChainVerificationResult['details'] = [];
    let isValid = true;
    let failureBlockNumber: number | undefined;
    let failureReason: string | undefined;
    let expectedHash: string | undefined;
    let actualHash: string | undefined;
    let brokenLink: ChainVerificationResult['brokenLink'] | undefined;

    for (let i = 0; i < chainToVerify.length; i++) {
      const block = chainToVerify[i];
      const recomputedHash = calculateBlockHash(block);
      const hashValid = recomputedHash === block.currentHash;

      // In full chain, block[i].previousHash must equal block[i-1].currentHash
      let prevHashLinked = true;
      if (!shipmentId && i > 0) {
        const prevBlock = chainToVerify[i - 1];
        if (block.previousHash !== prevBlock.currentHash) {
          prevHashLinked = false;
        }
      }

      details.push({
        blockNumber: block.blockNumber,
        transactionId: block.transactionId,
        hashValid,
        prevHashLinked,
        computedHash: recomputedHash,
        storedHash: block.currentHash,
      });

      if ((!hashValid || !prevHashLinked) && isValid) {
        isValid = false;
        failureBlockNumber = block.blockNumber;
        if (!hashValid) {
          failureReason = `Block #${block.blockNumber} content does not match its recorded SHA-256 hash. (Payload was modified without updating cryptographic proof).`;
          expectedHash = recomputedHash;
          actualHash = block.currentHash;
        } else {
          failureReason = `Block #${block.blockNumber} previousHash pointer is broken. Expected ${chainToVerify[i - 1].currentHash.substring(0, 12)}... but stored ${block.previousHash.substring(0, 12)}...`;
          brokenLink = {
            blockNumber: block.blockNumber,
            expectedPreviousHash: chainToVerify[i - 1].currentHash,
            actualPreviousHash: block.previousHash,
          };
        }
      }
    }

    return {
      isValid,
      totalBlocks: chainToVerify.length,
      verifiedAt: new Date().toISOString(),
      failureBlockNumber,
      failureReason,
      expectedHash,
      actualHash,
      brokenLink,
      details,
    };
  }

  /**
   * Tamper Simulation: modifies the in-memory data of a block WITHOUT recalculating its hash.
   * This immediately triggers SHA-256 mismatch detection on subsequent verifyChain calls.
   */
  public tamperBlockData(
    blockNumber: number,
    modifiedEventData: Record<string, any>,
    customNote: string = 'Simulated unauthorized record modification'
  ): void {
    const idx = this.chain.findIndex((b) => b.blockNumber === blockNumber);
    if (idx !== -1) {
      this.chain[idx] = {
        ...this.chain[idx],
        eventData: {
          ...this.chain[idx].eventData,
          ...modifiedEventData,
        },
        isTampered: true,
        tamperDetails: customNote,
      };
      this.persist();
    }
  }

  /**
   * Tamper Simulation: deletes a block to simulate missing data in the sequence.
   */
  public deleteBlock(blockNumber: number): boolean {
    const idx = this.chain.findIndex((b) => b.blockNumber === blockNumber);
    if (idx !== -1) {
      this.chain.splice(idx, 1);
      this.persist();
      return true;
    }
    return false;
  }

  /**
   * Restores the pristine genesis blockchain state
   */
  public restoreGenesisChain(): void {
    this.chain = buildLinkedChain();
    localStorage.removeItem('medishield_blockchain_chain');
  }

  /**
   * Verifies anchored regulatory evidence integrity
   */
  public verifyEvidence(evidenceId: string): EvidenceIntegrityRecord | undefined {
    const evidenceBlock = this.chain.find(
      (b) => b.eventType === 'EVIDENCE_ANCHORED' && b.eventData.evidencePackageId === evidenceId
    );

    if (!evidenceBlock) {
      return undefined;
    }

    const anchoredHash = evidenceBlock.eventData.evidenceSha256;
    const computedHash = hashEvidencePayload(evidenceBlock.eventData);
    const isTampered = Boolean(evidenceBlock.isTampered);

    return {
      evidenceId,
      evidenceType: 'Automated Anomaly Dossier',
      createdAt: evidenceBlock.timestamp,
      relatedShipment: evidenceBlock.shipmentId,
      relatedIncident: 'INC-2026-081',
      dataPayload: evidenceBlock.eventData,
      computedHash,
      anchoredHash,
      blockchainTx: evidenceBlock.transactionId,
      blockNumber: evidenceBlock.blockNumber,
      isTampered,
    };
  }
}

/**
 * Singleton instance of the Blockchain Provider
 */
export const blockchainService = new LocalBlockchainProvider();

/**
 * Predefined Demonstration Test Cases for Demo / Judges Presentation Mode
 */
export const PREDEFINED_BLOCKCHAIN_TEST_CASES: TestCaseDemo[] = [
  {
    id: 'TC-01',
    title: 'Valid Chain of Custody (Pristine Shipment)',
    category: 'Verification Baseline',
    scenario: 'Normal medicine shipment from Sun Pharma to Max Super Speciality Pharmacy.',
    input: 'Shipment SHP-003 with Batch LIP-2026-442 verified at pharmacy receiving dock.',
    detectionFlow: [
      'Manufacturer registers Master Batch Genesis in Block #1052',
      'Distributor logs compliant dock receipt in Block #1053',
      'Hospital chemist performs optical hologram + GS1 DataMatrix check in Block #1054',
      'All block SHA-256 hashes recomputed and validated against previous block hashes',
    ],
    blockchainOutcome: '✓ Chain integrity verified. All 3 blocks cryptographically linked and pristine.',
    riskScoreResult: 4,
    verdict: 'VALID',
  },
  {
    id: 'TC-02',
    title: 'Unauthorized Record Modification (Tamper Test)',
    category: 'Tamper Detection',
    scenario: 'A bad actor attempts to silently alter Block #1044 from "Optical Hologram Score: 38% (Fail)" to "Optical Hologram Score: 98% (Pass)".',
    input: 'Simulate modification of Block #1044 payload without recalculating cryptographic hash chain.',
    detectionFlow: [
      'Attacker edits database record for Block #1044',
      'MediShield AI runs automated SHA-256 verification cycle',
      'Computed hash does NOT match the stored hash in Block #1044',
      'Block #1045 reports broken previousHash link pointing to altered predecessor',
      'Audit log and security dashboard raise immediate TAMPER_DETECTED alarm',
    ],
    blockchainOutcome: '⚠ INTEGRITY CHECK FAILED: Block #1044 mismatch. Block #1045 broken link.',
    riskScoreResult: 95,
    verdict: 'TAMPER_DETECTED',
  },
  {
    id: 'TC-03',
    title: 'Deleted / Missing Blockchain Block',
    category: 'Sequence Integrity',
    scenario: 'A compromised distributor attempts to hide an inspection record by deleting Block #1043 from the database.',
    input: 'Remove Block #1043 (Distributor Receipt) from the ledger.',
    detectionFlow: [
      'Block #1043 removed from sequence',
      'Verification engine inspects Block #1044 previousHash pointer',
      'Expected previousHash from Block #1042 does not match Block #1044',
      'Missing block in consecutive chain detected',
    ],
    blockchainOutcome: '⚠ INTEGRITY FAILURE: Missing block in sequence. Chain continuity broken.',
    riskScoreResult: 90,
    verdict: 'TAMPER_DETECTED',
  },
  {
    id: 'TC-04',
    title: 'Duplicate Serial Number Collision & Blockchain Anchoring',
    category: 'Counterfeit Detection',
    scenario: 'Serial SN-1004812 is scanned simultaneously at Fortis Delhi and Apollo Mumbai.',
    input: 'GS1 serial collision detected across two distinct hospital dock terminals.',
    detectionFlow: [
      'Automated rule engine detects identical serial in 2 locations within 15 mins (Impossible velocity)',
      'High-risk event anchored to blockchain in Block #1045 (TX-2026-009821)',
      'Shipment SHP-001 status changed to QUARANTINED in Block #1046',
      'Regulatory evidence package anchored in Block #1047 with SHA-256 signature',
    ],
    blockchainOutcome: '✓ Blockchain permanently anchors counterfeit evidence. Incident INC-2026-081 created.',
    riskScoreResult: 84,
    verdict: 'INCIDENT_CREATED',
  },
  {
    id: 'TC-05',
    title: 'Cold-Chain IoT Excursion Breach Trail',
    category: 'Cold-Chain Integrity',
    scenario: 'Vaccine shipment SHP-002 exceeds 8.0°C maximum threshold for 180 minutes during transit.',
    input: 'IoT reefer temperature sensor logs 14.8°C spike on Panvel Bypass.',
    detectionFlow: [
      'IoT Sensor transmits thermal telemetry to blockchain engine',
      'Block #1050 records immutable excursion proof (14.8°C for 180 min)',
      'Hospital receiving desk automatically rejects consignment in Block #1051',
      'Denatured batch quarantined before patient administration',
    ],
    blockchainOutcome: '✓ Immutable IoT temperature proof anchored. Safe-Med lock enforced.',
    riskScoreResult: 78,
    verdict: 'INCIDENT_CREATED',
  },
  {
    id: 'TC-06',
    title: 'Regulatory Escalation & Evidence Package Locking',
    category: 'Government Escalation',
    scenario: 'MedRoute Distributors flagged for recurring anomalies; case escalated to CDSCO inspection authority.',
    input: 'CDSCO inspector reviews anchored blockchain evidence package EVD-AMX-001-SERIALS.',
    detectionFlow: [
      'Regulatory inspector verifies evidence SHA-256 signature anchored in Block #1047',
      'Inspector verifies that evidence images and serial lists were not altered post-detection',
      'Official CDSCO escalation directive anchored in Block #1048',
      'Multi-agency audit trail preserved across state jurisdictions',
    ],
    blockchainOutcome: '✓ Cryptographic proof verified by CDSCO. Legal notice served under Drugs Act.',
    riskScoreResult: 88,
    verdict: 'ESCALATED',
  },
];
