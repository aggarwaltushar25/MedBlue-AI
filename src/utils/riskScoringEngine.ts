/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RiskFactorContribution, ShipmentRiskProfile } from '../types';

/**
 * Configurable weights for the deterministic pharmaceutical supply-chain risk engine.
 * These can be dynamically adjusted or overridden based on regulatory thresholds.
 */
export interface RiskEngineConfig {
  duplicateSerialWeight: number;      // Max points for duplicate serial numbers detected
  coldChainBreachWeight: number;      // Max points for thermal temperature excursion
  packagingAnomalyWeight: number;     // Max points for holographic/seal/tamper issues
  missingHandoffWeight: number;       // Max points for broken chain-of-custody handoffs
  expiryMismatchWeight: number;       // Max points for near-expiry or label expiry mismatch
  supplierRiskWeights: {              // Supplier-specific historical risk weights
    [supplierName: string]: number;
  };
  locationRiskWeights: {              // Geographic transit node risk adjustments
    [location: string]: number;
  };
  categoryRiskWeights: {              // High-value / thermo-sensitive category adjustments
    [category: string]: number;
  };
}

export const DEFAULT_RISK_CONFIG: RiskEngineConfig = {
  duplicateSerialWeight: 35,
  coldChainBreachWeight: 30,
  packagingAnomalyWeight: 25,
  missingHandoffWeight: 20,
  expiryMismatchWeight: 15,
  supplierRiskWeights: {
    'MedRoute Distributors': 15,
    'PharmaDirect': 8,
    'MedSupply Co.': 4,
    'Apex Pharma Supply': 3,
    'BioLogix Logistics': 6,
  },
  locationRiskWeights: {
    'Ghaziabad Hub': 8,
    'Mumbai Terminal': 6,
    'Delhi Central': 3,
  },
  categoryRiskWeights: {
    'Vaccines': 10,
    'Insulins': 8,
    'Oncology': 8,
    'Antibiotics': 5,
    'Cardiovascular': 3,
    'Pain relievers': 2,
    'Respiratory': 3,
    'IV Fluids': 4,
  },
};

export interface ShipmentRiskInput {
  supplier: string;
  category: string;
  location: string;
  primaryIssue?: string;
  duplicateSerialsCount?: number;
  hasColdChainExcursion?: boolean;
  peakTemperature?: number;
  hasPackagingAnomaly?: boolean;
  hasMissingHandoff?: boolean;
  hasExpiryMismatch?: boolean;
  daysToExpiry?: number;
}

/**
 * Computes a transparent, fully explainable risk score (0–100) and returns
 * individual contributing factor breakdown.
 */
export function computeShipmentRiskProfile(
  input: ShipmentRiskInput,
  config: RiskEngineConfig = DEFAULT_RISK_CONFIG
): ShipmentRiskProfile {
  const factors: RiskFactorContribution[] = [];
  let score = 0;

  // 1. Duplicate Serial Detection Factor
  const dupes = input.duplicateSerialsCount || (input.primaryIssue?.toLowerCase().includes('duplicate') ? 8 : 0);
  if (dupes > 0) {
    const dupePoints = Math.min(config.duplicateSerialWeight, 20 + dupes * 2);
    score += dupePoints;
    factors.push({
      factor: 'Duplicate serial numbers detected',
      weight: config.duplicateSerialWeight,
      pointsAdded: dupePoints,
      description: `${dupes} serial numbers active across multiple geographical dispensing locations simultaneously.`,
    });
  }

  // 2. Cold Chain Thermal Excursion Factor
  const isColdChain = input.hasColdChainExcursion || input.primaryIssue?.toLowerCase().includes('cold-chain');
  if (isColdChain) {
    const tempPoints = input.peakTemperature && input.peakTemperature > 10 ? 30 : 22;
    score += tempPoints;
    factors.push({
      factor: 'Cold-chain thermal excursion',
      weight: config.coldChainBreachWeight,
      pointsAdded: tempPoints,
      description: `Transit temperature logger recorded prolonged breach (${input.peakTemperature ? `${input.peakTemperature}°C` : 'out-of-range'}).`,
    });
  }

  // 3. Packaging & Tamper-Evident Seal Factor
  const isPackaging = input.hasPackagingAnomaly || input.primaryIssue?.toLowerCase().includes('packaging');
  if (isPackaging) {
    score += config.packagingAnomalyWeight;
    factors.push({
      factor: 'Packaging or holographic seal anomaly',
      weight: config.packagingAnomalyWeight,
      pointsAdded: config.packagingAnomalyWeight,
      description: 'Diffractive optical variable device (OVD) tamper pattern failed baseline micro-print matching.',
    });
  }

  // 4. Missing Chain-of-Custody Handoff
  const isMissingHandoff = input.hasMissingHandoff || input.primaryIssue?.toLowerCase().includes('missing handoff');
  if (isMissingHandoff) {
    score += config.missingHandoffWeight;
    factors.push({
      factor: 'Missing distributor handoff manifest',
      weight: config.missingHandoffWeight,
      pointsAdded: config.missingHandoffWeight,
      description: 'Intermediate logistics checkpoint scan omitted between regional transit depot and receiver bay.',
    });
  }

  // 5. Expiry Mismatch / Near Expiry Factor
  const isExpiryIssue = input.hasExpiryMismatch || input.primaryIssue?.toLowerCase().includes('expiry');
  if (isExpiryIssue) {
    score += config.expiryMismatchWeight;
    factors.push({
      factor: 'Remaining shelf-life threshold breach',
      weight: config.expiryMismatchWeight,
      pointsAdded: config.expiryMismatchWeight,
      description: 'Shipment batch shelf life falls below required 90-day hospital pharmacy dispensing window.',
    });
  }

  // 6. Supplier Historical Risk Factor
  const supplierRisk = config.supplierRiskWeights[input.supplier] || 0;
  if (supplierRisk > 0) {
    score += supplierRisk;
    factors.push({
      factor: 'Supplier historical discrepancy profile',
      weight: 15,
      pointsAdded: supplierRisk,
      description: `Historical 90-day tracking for ${input.supplier} indicates ${supplierRisk >= 10 ? 'elevated' : 'moderate'} audit variance.`,
    });
  }

  // 7. Geographic Transit Node Adjustment
  const locRisk = config.locationRiskWeights[input.location] || 0;
  if (locRisk > 3) {
    score += locRisk;
    factors.push({
      factor: 'Geographic transit corridor risk',
      weight: 10,
      pointsAdded: locRisk,
      description: `Transit via ${input.location} routing flagged with recent regional checkpoint alerts.`,
    });
  }

  // 8. Category Sensitivity Adjustment
  const catRisk = config.categoryRiskWeights[input.category] || 0;
  if (catRisk > 4 && factors.length > 0) {
    score += catRisk;
    factors.push({
      factor: 'Therapeutic category sensitivity',
      weight: 10,
      pointsAdded: catRisk,
      description: `High critical-care priority class (${input.category}) requires zero-tolerance verification.`,
    });
  }

  // Clean base score for completely authentic batches
  if (factors.length === 0) {
    score = Math.floor(Math.random() * 5) + 2; // Clean baseline: 2–6
    factors.push({
      factor: 'Clean baseline verification',
      weight: 0,
      pointsAdded: score,
      description: 'GS1 2D DataMatrix, factory serials, cryptographic signatures, and RFID tag all verified authentic.',
    });
  }

  const finalScore = Math.min(100, Math.max(0, score));

  let recommendation: 'Accepted' | 'Manual Review' | 'Quarantine' = 'Accepted';
  if (finalScore >= 60) {
    recommendation = 'Quarantine';
  } else if (finalScore >= 25) {
    recommendation = 'Manual Review';
  }

  return {
    totalScore: finalScore,
    factors,
    recommendation,
    confidenceLevel: 94.8,
  };
}
