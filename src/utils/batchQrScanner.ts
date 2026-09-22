/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScannedMedicineResult, BatchForensicRecord } from '../types';
import { BATCH_FORENSICS_DATABASE } from '../data/batchForensicsData';
import { SAMPLE_MEDICINES } from '../data/medicineScanSamples';

export interface ParsedBatchQR {
  raw: string;
  batchNumber: string;
  serialNumber?: string;
  gtin?: string;
  expiryDate?: string;
  isGS1Format: boolean;
  formatType: 'GS1_DATAMATRIX' | 'URL_PARAM' | 'JSON_PAYLOAD' | 'DIRECT_BATCH';
}

export interface BatchLookupResponse {
  medicine: ScannedMedicineResult;
  batchNumber: string;
  forensicRecord?: BatchForensicRecord;
  hasForensics: boolean;
  parsedQR: ParsedBatchQR;
}

/**
 * Parses raw QR string for GS1 Application Identifiers, URLs, JSON, or direct batch identifiers
 */
export function parseBatchQrCode(rawString: string): ParsedBatchQR {
  const text = rawString.trim();

  // 1. Check for JSON format: {"batch": "AMX-2026-081", ...}
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      const batch = parsed.batch || parsed.batchNumber || parsed.lot || parsed.lotNumber || '';
      if (batch) {
        return {
          raw: text,
          batchNumber: String(batch).toUpperCase().trim(),
          serialNumber: parsed.serial || parsed.serialNumber || parsed.sn,
          gtin: parsed.gtin,
          expiryDate: parsed.expiry || parsed.expiryDate,
          isGS1Format: false,
          formatType: 'JSON_PAYLOAD',
        };
      }
    } catch {
      // Continue to regex parsing
    }
  }

  // 2. Check for URL query format: https://domain.com/verify?batch=AMX-2026-081&sn=SN-1004812
  if (text.includes('?') && (text.includes('batch=') || text.includes('10='))) {
    try {
      const urlPart = text.includes('://') ? new URL(text) : new URL(`http://dummy.com/${text.startsWith('/') ? '' : '/'}${text}`);
      const batch = urlPart.searchParams.get('batch') || urlPart.searchParams.get('10') || urlPart.searchParams.get('lot');
      if (batch) {
        return {
          raw: text,
          batchNumber: batch.toUpperCase().trim(),
          serialNumber: urlPart.searchParams.get('sn') || urlPart.searchParams.get('21') || urlPart.searchParams.get('serial') || undefined,
          gtin: urlPart.searchParams.get('gtin') || urlPart.searchParams.get('01') || undefined,
          expiryDate: urlPart.searchParams.get('exp') || urlPart.searchParams.get('17') || undefined,
          isGS1Format: text.includes('gs1') || urlPart.searchParams.has('10'),
          formatType: 'URL_PARAM',
        };
      }
    } catch {
      // Continue
    }
  }

  // 3. GS1 Standard Parenthesized AI Format: (01)08901030048123(17)271130(10)AMX-2026-081(21)SN-1004812
  const gs1GtinMatch = text.match(/\(01\)(\d{14})/);
  const gs1ExpMatch = text.match(/\(17\)(\d{6})/);
  const gs1BatchMatch = text.match(/\(10\)([a-zA-Z0-9\-_]+)/);
  const gs1SerialMatch = text.match(/\(21\)([a-zA-Z0-9\-_]+)/);

  if (gs1BatchMatch && gs1BatchMatch[1]) {
    return {
      raw: text,
      batchNumber: gs1BatchMatch[1].toUpperCase().trim(),
      serialNumber: gs1SerialMatch ? gs1SerialMatch[1] : undefined,
      gtin: gs1GtinMatch ? gs1GtinMatch[1] : undefined,
      expiryDate: gs1ExpMatch ? `20${gs1ExpMatch[1].slice(0, 2)}-${gs1ExpMatch[1].slice(2, 4)}-${gs1ExpMatch[1].slice(4, 6)}` : undefined,
      isGS1Format: true,
      formatType: 'GS1_DATAMATRIX',
    };
  }

  // 4. Known Batch Pattern Matching (e.g., AMX-2026-081, COV-VAX-902, LANT-2026-044, GSK-2026-441B, AZI-2026-442)
  const allKnownBatches = Object.keys(BATCH_FORENSICS_DATABASE).concat(SAMPLE_MEDICINES.map((m) => m.batchNumber));
  const upperText = text.toUpperCase();

  for (const knownBatch of allKnownBatches) {
    if (upperText.includes(knownBatch.toUpperCase())) {
      return {
        raw: text,
        batchNumber: knownBatch,
        isGS1Format: false,
        formatType: 'DIRECT_BATCH',
      };
    }
  }

  // 5. Generic pharmaceutical batch regex: e.g. ABC-1234-567 or similar
  const generalBatchRegex = /\b([A-Z]{2,5}-\d{3,4}-[0-9A-Z]{2,4})\b/i;
  const match = text.match(generalBatchRegex);
  if (match && match[1]) {
    return {
      raw: text,
      batchNumber: match[1].toUpperCase(),
      isGS1Format: false,
      formatType: 'DIRECT_BATCH',
    };
  }

  // Fallback: Use cleaned string or default
  return {
    raw: text,
    batchNumber: text.replace(/[^a-zA-Z0-9\-_]/g, '').toUpperCase() || 'AMX-2026-081',
    isGS1Format: false,
    formatType: 'DIRECT_BATCH',
  };
}

/**
 * Automatically triggers a batch-lookup query against the central forensic database
 */
export function executeBatchLookupQuery(rawQrOrBatch: string): BatchLookupResponse {
  const parsed = parseBatchQrCode(rawQrOrBatch);
  const normalizedBatch = parsed.batchNumber.toUpperCase();

  // 1. Check if direct forensic record exists in BATCH_FORENSICS_DATABASE
  const forensicRecord = BATCH_FORENSICS_DATABASE[normalizedBatch];

  // 2. Check in SAMPLE_MEDICINES
  const sampleMatch = SAMPLE_MEDICINES.find(
    (m) =>
      m.batchNumber.toUpperCase() === normalizedBatch ||
      m.id.toLowerCase() === normalizedBatch.toLowerCase()
  );

  if (forensicRecord) {
    // Generate a rich ScannedMedicineResult derived from the forensic record
    const isAuthentic = forensicRecord.integrityScore >= 70 && !forensicRecord.overallStatus.includes('Quarantined');
    const hasAnomalies = forensicRecord.anomaliesDetected.length > 0;

    const baseMed: ScannedMedicineResult = sampleMatch || {
      id: `MED-BATCH-${forensicRecord.batchNumber}`,
      medicineName: forensicRecord.medicineName,
      genericName: forensicRecord.genericName,
      manufacturer: forensicRecord.manufacturer.name,
      batchNumber: forensicRecord.batchNumber,
      serialNumber: parsed.serialNumber || (forensicRecord.sampleUnits[0]?.serialNumber || 'SN-BATCH-PRIMARY'),
      expiryDate: forensicRecord.expDate,
      manufacturingDate: forensicRecord.mfgDate,
      gtin: parsed.gtin || '08901030048123',
      dosage: forensicRecord.dosageForm,
      category: forensicRecord.category,
      isAuthentic,
      riskScore: 100 - forensicRecord.integrityScore,
      hologram: {
        detected: forensicRecord.integrityScore >= 50,
        confidence: forensicRecord.integrityScore,
        iridescenceScore: Math.min(100, forensicRecord.integrityScore + 4),
        specularGlareScore: Math.min(100, forensicRecord.integrityScore + 2),
        sealIntact: forensicRecord.integrityScore >= 70,
        patternMatch: forensicRecord.integrityScore >= 70 ? 'Genuine GS1 Hologram' : 'Defective Hologram',
        details: isAuthentic
          ? 'Diffractive OVD tamper seal verified against factory specification.'
          : 'Holographic optical anomaly flagged during chain-of-custody inspection.',
      },
      blockchain: {
        network: 'Ethereum Pharma L2 (Rollup #4)',
        blockNumber: forensicRecord.custodyTimeline[0]?.blockNumber || 19482000,
        txHash: forensicRecord.custodyTimeline[0]?.blockchainHash || '0x8f3c1b9a7d2e4f50918273645bcdeaf019283746a5b4c3d2e1f0',
        contractAddress: '0x71C8A3B8b2A24021289Ac274643F245903b11867',
        timestamp: forensicRecord.mfgDate,
        merkleRoot: '0x3a9f0291e847cbb02938472910aefc8928374',
        manufacturerSigner: forensicRecord.manufacturer.license,
        verified: isAuthentic,
        status: isAuthentic ? 'Confirmed' : 'Invalid',
        gasUsed: '42,108 Gwei',
        explorerUrl: 'https://pharmatrace.health.network/batch/' + forensicRecord.batchNumber,
      },
      patientGuide: {
        safetyStatus: isAuthentic ? 'Safe' : 'Counterfeit',
        plainEnglishSummary: isAuthentic
          ? `Verified genuine ${forensicRecord.medicineName}. Batch integrity confirmed with full supplier traceability.`
          : `⚠️ DANGER: Batch flagged with critical supply chain anomalies (${forensicRecord.anomaliesDetected[0]?.description || 'Integrity breach'}). Do NOT dispense or consume.`,
        howToTake: `Follow your physician's prescription for ${forensicRecord.dosageForm}.`,
        storageAdvice: 'Store in cool, dry conditions away from direct sunlight.',
        safeExpiryLabel: `Expires ${forensicRecord.expDate} • Batch #${forensicRecord.batchNumber}`,
        genuinePackagingTip: 'Check physical holographic seal on outer packaging for 3D kinetic reflection.',
      },
      stockInfo: {
        currentInventory: 480,
        incomingUnits: forensicRecord.suppliers[0]?.assignedUnits || 500,
        newTotalStock: 480 + (forensicRecord.suppliers[0]?.assignedUnits || 500),
        reorderThreshold: 200,
        daysBuffer: 30,
        status: isAuthentic ? 'In Stock' : 'Low Stock',
        arrivalTemp: forensicRecord.custodyTimeline.find((t) => t.tempRange)?.tempRange?.current || 21.0,
        tempSafeRange: '15°C – 25°C',
        tempBreached: Boolean(forensicRecord.anomaliesDetected.some((a) => a.type === 'cold_chain')),
        duplicateSerialFound: Boolean(forensicRecord.anomaliesDetected.some((a) => a.type === 'duplicate_serial')),
        lastDispensedLocation: forensicRecord.anomaliesDetected.some((a) => a.type === 'duplicate_serial')
          ? 'Cloned copy detected in unauthorized Haryana depot'
          : undefined,
      },
      provenance: forensicRecord.custodyTimeline.map((node) => ({
        step: node.stageName,
        actor: `${node.actor} (${node.location})`,
        timestamp: node.timestamp,
        txHash: node.blockchainHash,
        status: node.status === 'verified' ? 'completed' : 'current',
      })),
      batchForensicsAvailable: true,
      forensicRecord,
    };

    return {
      medicine: {
        ...baseMed,
        batchForensicsAvailable: true,
        forensicRecord,
      },
      batchNumber: forensicRecord.batchNumber,
      forensicRecord,
      hasForensics: true,
      parsedQR: parsed,
    };
  }

  // If sampleMatch exists without a custom forensic record, synthesize standard lookup
  if (sampleMatch) {
    return {
      medicine: {
        ...sampleMatch,
        batchForensicsAvailable: true,
      },
      batchNumber: sampleMatch.batchNumber,
      hasForensics: true,
      parsedQR: parsed,
    };
  }

  // Fallback to default medicine with parsed batch number
  const defaultMed = SAMPLE_MEDICINES[0];
  const customMed: ScannedMedicineResult = {
    ...defaultMed,
    id: `MED-${normalizedBatch}`,
    batchNumber: normalizedBatch,
    serialNumber: parsed.serialNumber || 'SN-UNKNOWN-SCAN',
    batchForensicsAvailable: true,
  };

  return {
    medicine: customMed,
    batchNumber: normalizedBatch,
    hasForensics: true,
    parsedQR: parsed,
  };
}

/**
 * Pre-formatted QR code test presets for rapid evaluation
 */
export const BATCH_QR_TEST_PRESETS = [
  {
    label: 'AMX-2026-081 (Cloned Serials)',
    batchNumber: 'AMX-2026-081',
    medicineName: 'Amoxicillin 500mg',
    qrPayload: '(01)08901030048123(17)271130(10)AMX-2026-081(21)SN-1004812',
    statusTag: 'Quarantined',
    statusColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: 'GS1 2D DataMatrix with duplicate serial detected across 3 suppliers',
  },
  {
    label: 'COV-VAX-902 (Cold-Chain Breach)',
    batchNumber: 'COV-VAX-902',
    medicineName: 'Covaxin Booster Vials',
    qrPayload: '(01)08902040059124(17)270415(10)COV-VAX-902(21)SN-902-1402',
    statusTag: 'Hold (11.4°C Excursion)',
    statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Auxiliary reefer breakdown on NH-48 corridor; 800 units on hold',
  },
  {
    label: 'LANT-2026-044 (Optical Hologram Anomaly)',
    batchNumber: 'LANT-2026-044',
    medicineName: 'Lantus SoloStar Insulin',
    qrPayload: '(01)08903050060125(17)280120(10)LANT-2026-044(21)SN-LANT-881',
    statusTag: 'Attention (Optical)',
    statusColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Refractive iridescence score 42% flagged at secondary supplier dock',
  },
  {
    label: 'GSK-2026-441B (Genuine Verified)',
    batchNumber: 'GSK-2026-441B',
    medicineName: 'Augmentin 625 Duo',
    qrPayload: '(01)08901030048123(17)271130(10)GSK-2026-441B(21)SN-908234-118',
    statusTag: 'Genuine Pristine',
    statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: '100% genuine GSK batch with on-chain cryptographic ledger proof',
  },
];
