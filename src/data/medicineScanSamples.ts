/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScannedMedicineResult } from '../types';

export const SAMPLE_MEDICINES: ScannedMedicineResult[] = [
  {
    id: 'MED-AUG-625',
    medicineName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin & Potassium Clavulanate (500mg + 125mg)',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd.',
    batchNumber: 'GSK-2026-441B',
    serialNumber: 'SN-908234-118',
    expiryDate: '2027-11-30',
    manufacturingDate: '2025-11-01',
    gtin: '08901030048123',
    dosage: '1 Tablet twice daily after food',
    category: 'Antibiotics',
    isAuthentic: true,
    riskScore: 6,
    hologram: {
      detected: true,
      confidence: 98,
      iridescenceScore: 96,
      specularGlareScore: 94,
      sealIntact: true,
      patternMatch: 'Genuine GS1 Hologram',
      details: 'Diffractive multi-depth GS1 micro-holographic foil confirmed with 7-color optical spectral sheen.',
    },
    blockchain: {
      network: 'Ethereum Pharma L2 (Rollup #4)',
      blockNumber: 19482042,
      txHash: '0x8f3c1b9a7d2e4f50918273645bcdeaf019283746a5b4c3d2e1f0',
      contractAddress: '0x71C8A3B8b2A24021289Ac274643F245903b11867',
      timestamp: '2026-09-18 14:22:10 UTC',
      merkleRoot: '0x3a9f0291e847cbb02938472910aefc8928374',
      manufacturerSigner: '0xGSK_Authorized_Signer_IND902',
      verified: true,
      status: 'Confirmed',
      gasUsed: '42,108 Gwei',
      explorerUrl: 'https://pharmatrace.health.network/tx/0x8f3c1b9a7d2e4f50918273645bcdeaf019283746a5b4c3d2e1f0',
    },
    patientGuide: {
      safetyStatus: 'Safe',
      plainEnglishSummary: 'This medicine is 100% Genuine and authentic. Verified directly against GlaxoSmithKline official factory ledger.',
      howToTake: 'Take 1 tablet twice a day with or right after a meal to avoid stomach upset. Complete full course.',
      storageAdvice: 'Store below 25°C in a dry place. Protect from moisture and heat. Keep strip sealed until consumption.',
      safeExpiryLabel: 'Expires Nov 2027 • Over 14 months safe shelf-life left',
      genuinePackagingTip: 'Tilt box: The 3D hologram shifts between gold and emerald green with clear GSK shield logo.',
    },
    stockInfo: {
      currentInventory: 480,
      incomingUnits: 500,
      newTotalStock: 980,
      reorderThreshold: 200,
      daysBuffer: 42,
      status: 'In Stock',
      arrivalTemp: 21.4,
      tempSafeRange: '15°C – 25°C (Ambient Controlled)',
      tempBreached: false,
      duplicateSerialFound: false,
    },
    provenance: [
      {
        step: 'Manufacturing & Digital Batch Minting',
        actor: 'GSK Formulation Unit #03, Nashik',
        timestamp: '2025-11-01 08:30 UTC',
        txHash: '0x1a82f...991a',
        status: 'completed',
      },
      {
        step: 'Wholesale Depot Check-in',
        actor: 'National Logistics Hub, Delhi',
        timestamp: '2026-09-12 11:15 UTC',
        txHash: '0x5b33d...11aa',
        status: 'completed',
      },
      {
        step: 'Inbound Pharmacy Receiving Dock',
        actor: 'City Central Chemist & Pharmacy',
        timestamp: '2026-09-22 09:40 UTC',
        txHash: '0x8f3c1...e1f0',
        status: 'current',
      },
    ],
  },
  {
    id: 'MED-FAKE-AMX',
    medicineName: 'AmoxClav 625 (SUSPECT COUNTERFEIT)',
    genericName: 'Purported Amoxicillin 500mg',
    manufacturer: 'Unverified / Sham Label claiming MedRoute Source',
    batchNumber: 'AMX-2026-081',
    serialNumber: 'SN-772901-DUPE',
    expiryDate: '2026-10-15',
    manufacturingDate: '2024-04-10',
    gtin: '08909990001234',
    dosage: 'DO NOT CONSUME - QUARANTINE IMMEDIATELY',
    category: 'Antibiotics',
    isAuthentic: false,
    riskScore: 92,
    hologram: {
      detected: false,
      confidence: 18,
      iridescenceScore: 12,
      specularGlareScore: 20,
      sealIntact: false,
      patternMatch: 'Tampered / Missing Seal',
      details: 'Counterfeit flat metallic sticker without diffractive OVD hologram. Missing genuine GS1 micro-emboss.',
    },
    blockchain: {
      network: 'Ethereum Pharma L2 (Rollup #4)',
      blockNumber: 0,
      txHash: 'INVALID_SIGNATURE_REVERTED',
      contractAddress: '0x0000000000000000000000000000000000000000',
      timestamp: 'N/A - No on-chain proof found',
      merkleRoot: 'INVALID_ROOT',
      manufacturerSigner: 'UNKNOWN_OR_FORGED_KEY',
      verified: false,
      status: 'Invalid',
      gasUsed: '0',
      explorerUrl: '#invalid-blockchain-hash',
    },
    patientGuide: {
      safetyStatus: 'Counterfeit',
      plainEnglishSummary: '⚠️ DANGER: This package appears to be FAKE or TAMPERED. The hologram is flat paper, and the serial number is duplicated.',
      howToTake: 'DO NOT TAKE THIS MEDICINE. Return it to your pharmacy immediately or report to the drug safety helpline.',
      storageAdvice: 'Keep in separate bag away from genuine medicines to prevent accidental consumption.',
      safeExpiryLabel: 'Invalid Batch • Expiry Date cannot be verified',
      genuinePackagingTip: 'Counterfeit warning: Noticeable color fading, blurry text font, and no 3D rainbow hologram reflection.',
    },
    stockInfo: {
      currentInventory: 480,
      incomingUnits: 150,
      newTotalStock: 480,
      reorderThreshold: 200,
      daysBuffer: 24,
      status: 'Low Stock',
      arrivalTemp: 29.8,
      tempSafeRange: '15°C – 25°C',
      tempBreached: true,
      duplicateSerialFound: true,
      lastDispensedLocation: 'Scanned 3 days ago at Apollo Chemist Sector 14',
    },
    provenance: [
      {
        step: 'Unverified Batch Interception',
        actor: 'Unknown Grey-Market Origin',
        timestamp: '2026-09-20 18:10 UTC',
        txHash: '0x0000000000000000',
        status: 'current',
      },
    ],
  },
  {
    id: 'MED-VAC-COV',
    medicineName: 'Prevnar 13 Pneumococcal Vaccine',
    genericName: 'Pneumococcal 13-valent Conjugate Vaccine (0.5 mL vial)',
    manufacturer: 'Pfizer Biologics Manufacturing',
    batchNumber: 'PFZ-VAC-9021',
    serialNumber: 'SN-449102-COV',
    expiryDate: '2027-08-31',
    manufacturingDate: '2025-08-15',
    gtin: '00300051971201',
    dosage: 'Single dose 0.5 mL Intramuscular by Healthcare Professional',
    category: 'Vaccines',
    isAuthentic: true,
    riskScore: 8,
    hologram: {
      detected: true,
      confidence: 99,
      iridescenceScore: 98,
      specularGlareScore: 97,
      sealIntact: true,
      patternMatch: 'Genuine GS1 Hologram',
      details: 'High-security multi-kinetic holographic band intact with tamper-evident frangible matrix.',
    },
    blockchain: {
      network: 'Ethereum Pharma L2 (Rollup #4)',
      blockNumber: 19481890,
      txHash: '0x992cf8832a1048b991c0e29d736b48201a938472910aefc8827',
      contractAddress: '0xPfizerVaccineTraceContract092',
      timestamp: '2026-09-17 06:12:44 UTC',
      merkleRoot: '0x88bb112a938472910aefc8928374019283746a5b',
      manufacturerSigner: '0xPfizer_Validated_Node_01',
      verified: true,
      status: 'Confirmed',
      gasUsed: '38,900 Gwei',
      explorerUrl: 'https://pharmatrace.health.network/tx/0x992cf8832a1048b991c0e29d736b48201a938472910aefc8827',
    },
    patientGuide: {
      safetyStatus: 'Safe',
      plainEnglishSummary: '100% Genuine Certified Vaccine. Strict cold-chain temperature (2°C–8°C) verified across all transit stops.',
      howToTake: 'Must be administered only by a certified nurse or doctor in a clinic or hospital setting.',
      storageAdvice: 'Requires strict continuous refrigeration at 2°C to 8°C. Do NOT freeze.',
      safeExpiryLabel: 'Valid until Aug 2027 • Cold-Chain Integrity: Perfect 100%',
      genuinePackagingTip: 'Vial cap has intact tear-off ring and holographic Pfizer verification seal.',
    },
    stockInfo: {
      currentInventory: 45,
      incomingUnits: 60,
      newTotalStock: 105,
      reorderThreshold: 30,
      daysBuffer: 28,
      status: 'In Stock',
      arrivalTemp: 4.6,
      tempSafeRange: '2.0°C – 8.0°C (Cold-Chain)',
      tempBreached: false,
      duplicateSerialFound: false,
    },
    provenance: [
      {
        step: 'Sterile Fill & Blockchain Minting',
        actor: 'Pfizer Bio-Facility #1',
        timestamp: '2025-08-15 04:00 UTC',
        txHash: '0x7a22...188c',
        status: 'completed',
      },
      {
        step: 'Cryogenic Air-Freight Arrival',
        actor: 'PharmaCold Logistics Flight #PC-901',
        timestamp: '2026-09-19 22:40 UTC',
        txHash: '0x33e1...0099',
        status: 'completed',
      },
      {
        step: 'Cold Hub Check & Distribution',
        actor: 'National Vaccine Cold Store Hub #04',
        timestamp: '2026-09-22 08:15 UTC',
        txHash: '0x992c...8827',
        status: 'current',
      },
    ],
  },
  {
    id: 'MED-DOL-650',
    medicineName: 'Dolo 650 Tablets',
    genericName: 'Paracetamol 650mg Analgesic & Antipyretic',
    manufacturer: 'Micro Labs Limited',
    batchNumber: 'ML-2026-778',
    serialNumber: 'SN-551980-DOL',
    expiryDate: '2028-02-28',
    manufacturingDate: '2026-03-01',
    gtin: '08901148003112',
    dosage: '1 tablet every 6-8 hours as needed for fever/pain (Max 4g/day)',
    category: 'Pain Relievers',
    isAuthentic: true,
    riskScore: 4,
    hologram: {
      detected: true,
      confidence: 97,
      iridescenceScore: 95,
      specularGlareScore: 92,
      sealIntact: true,
      patternMatch: 'Genuine GS1 Hologram',
      details: 'Micro Labs authentic 3D security micro-print strip with holographic color shift intact.',
    },
    blockchain: {
      network: 'Ethereum Pharma L2 (Rollup #4)',
      blockNumber: 19482110,
      txHash: '0x12d45e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
      contractAddress: '0xMicroLabsTrackTraceContract',
      timestamp: '2026-09-21 17:05:00 UTC',
      merkleRoot: '0x44ee110099887766554433221100ffeeddccbbaa',
      manufacturerSigner: '0xMicroLabs_Signer_IND',
      verified: true,
      status: 'Confirmed',
      gasUsed: '34,200 Gwei',
      explorerUrl: 'https://pharmatrace.health.network/tx/0x12d45e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
    },
    patientGuide: {
      safetyStatus: 'Safe',
      plainEnglishSummary: '100% Genuine Dolo 650. Verified by Micro Labs verified digital ledger.',
      howToTake: 'Take 1 tablet with water. Do not exceed 4 tablets in 24 hours. Avoid alcohol.',
      storageAdvice: 'Store below 30°C. Keep out of reach of children.',
      safeExpiryLabel: 'Expires Feb 2028 • Over 29 months safe shelf-life left',
      genuinePackagingTip: 'Strip has distinctive purple and white blister pack with crisp Micro Labs emblem.',
    },
    stockInfo: {
      currentInventory: 1200,
      incomingUnits: 800,
      newTotalStock: 2000,
      reorderThreshold: 500,
      daysBuffer: 60,
      status: 'In Stock',
      arrivalTemp: 22.0,
      tempSafeRange: '15°C – 30°C',
      tempBreached: false,
      duplicateSerialFound: false,
    },
    provenance: [
      {
        step: 'Tableting & Batch Packaging',
        actor: 'Micro Labs Plant #02, Bangalore',
        timestamp: '2026-03-01 10:00 UTC',
        txHash: '0x99a1...44bc',
        status: 'completed',
      },
      {
        step: 'Distributor Receiving',
        actor: 'MedSupply Logistics Network',
        timestamp: '2026-09-20 12:00 UTC',
        txHash: '0x12d4...7c8d',
        status: 'current',
      },
    ],
  },
];

// Helper to find medicine by QR / Barcode data or batch number
export function lookupMedicine(barcodeOrQuery: string): ScannedMedicineResult {
  const query = barcodeOrQuery.trim().toLowerCase();

  // Check direct matches
  for (const med of SAMPLE_MEDICINES) {
    if (
      med.batchNumber.toLowerCase().includes(query) ||
      med.serialNumber.toLowerCase().includes(query) ||
      med.gtin.toLowerCase().includes(query) ||
      med.medicineName.toLowerCase().includes(query) ||
      med.id.toLowerCase().includes(query)
    ) {
      return med;
    }
  }

  // If search matches "fake" or "counterfeit" or "tamper"
  if (query.includes('fake') || query.includes('counterfeit') || query.includes('tamper') || query.includes('amx')) {
    return SAMPLE_MEDICINES[1]; // Counterfeit sample
  }

  if (query.includes('vaccine') || query.includes('cold') || query.includes('pfz')) {
    return SAMPLE_MEDICINES[2]; // Vaccine sample
  }

  if (query.includes('dolo') || query.includes('paracetamol')) {
    return SAMPLE_MEDICINES[3]; // Dolo sample
  }

  // Default to genuine Augmentin 625
  return SAMPLE_MEDICINES[0];
}
