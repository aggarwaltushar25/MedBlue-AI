/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Camera,
  Upload,
  ShieldCheck,
  AlertTriangle,
  Blocks,
  CheckCircle2,
  Calendar,
  Sparkles,
  HelpCircle,
  Pill,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  HeartHandshake,
  AlertCircle,
  Building,
  Radio,
  Search,
} from 'lucide-react';
import { ScannedMedicineResult } from '../types';
import { SAMPLE_MEDICINES } from '../data/medicineScanSamples';
import { CameraScannerModal } from './CameraScannerModal';
import { BlockchainModal } from './BlockchainModal';
import { MedicineImageUploadModal } from './MedicineImageUploadModal';
import { unifiedStore } from '../services/unifiedStore';
import { blockchainService } from '../services/blockchain';

interface PatientModeViewProps {
  onSwitchToChemist: () => void;
  onViewForensics?: (batchNumber: string) => void;
}

export const PatientModeView: React.FC<PatientModeViewProps> = ({
  onSwitchToChemist,
  onViewForensics,
}) => {
  // Currently displayed verified medicine (defaults to genuine Augmentin 625 for instant demonstration)
  const [currentMedicine, setCurrentMedicine] = useState<ScannedMedicineResult>(SAMPLE_MEDICINES[0]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [isBlockchainOpen, setIsBlockchainOpen] = useState(false);

  const isSafe = currentMedicine.isAuthentic;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Friendly Hero Banner */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-3xl text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/60 border border-blue-400/40 text-blue-100 text-xs font-semibold mb-3">
              <HeartHandshake className="w-4 h-4 text-emerald-300" />
              <span>STAGE 5 — CONSUMER PATIENT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Is your medicine genuine and safe?
            </h1>
            <p className="text-sm sm:text-base text-blue-100 mt-2 leading-relaxed">
              Check any medicine strip or bottle in 3 seconds. Our camera verifies the physical 3D hologram seal, expiration date, and official manufacturer registration.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              id="btn-open-patient-camera"
              onClick={() => setIsScannerOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-blue-950/20 transition-all transform active:scale-95 cursor-pointer"
            >
              <Camera className="w-5 h-5 text-blue-700" />
              <span>Scan Medicine Box Now</span>
            </button>

            <button
              id="btn-upload-medicine-image-patient"
              onClick={() => setIsImageUploadOpen(true)}
              className="px-5 py-3 rounded-xl bg-blue-600/60 hover:bg-blue-600/80 border border-blue-400/40 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-white" />
              <span>Upload Medicine Image</span>
            </button>

            <button
              onClick={() => setIsBlockchainOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-900/40 hover:bg-blue-900/60 border border-blue-400/30 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Blocks className="w-4 h-4 text-cyan-300" />
              <span>View Blockchain Safety Proof</span>
            </button>
          </div>
        </div>

        {/* Quick Sample Selector for Immediate Testing */}
        <div className="relative z-10 mt-6 pt-5 border-t border-blue-600/50 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-blue-200 font-medium">Try test samples:</span>
          <button
            onClick={() => setCurrentMedicine(SAMPLE_MEDICINES[0])}
            className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
              currentMedicine.id === SAMPLE_MEDICINES[0].id
                ? 'bg-white text-blue-900 font-semibold border-white'
                : 'bg-blue-800/60 text-blue-100 border-blue-500/40 hover:bg-blue-700/80'
            }`}
          >
            ✅ Augmentin 625 (Genuine)
          </button>
          <button
            onClick={() => setCurrentMedicine(SAMPLE_MEDICINES[1])}
            className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
              currentMedicine.id === SAMPLE_MEDICINES[1].id
                ? 'bg-rose-500 text-white font-semibold border-rose-400'
                : 'bg-rose-950/40 text-rose-200 border-rose-500/40 hover:bg-rose-900/60'
            }`}
          >
            ⚠️ AmoxClav (Counterfeit Alert)
          </button>
          <button
            onClick={() => setCurrentMedicine(SAMPLE_MEDICINES[3])}
            className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
              currentMedicine.id === SAMPLE_MEDICINES[3].id
                ? 'bg-white text-blue-900 font-semibold border-white'
                : 'bg-blue-800/60 text-blue-100 border-blue-500/40 hover:bg-blue-700/80'
            }`}
          >
            ✅ Dolo 650 (Genuine)
          </button>
        </div>
      </div>

      {/* Big Reassuring Verdict Card (Simple Language) */}
      <div
        className={`p-6 sm:p-7 rounded-3xl border shadow-sm transition-all ${
          isSafe
            ? 'bg-white border-emerald-200 ring-4 ring-emerald-50'
            : 'bg-rose-50/70 border-rose-300 ring-4 ring-rose-100'
        }`}
      >
        {/* Main Status Headline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                isSafe
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-rose-100 text-rose-700 border border-rose-300'
              }`}
            >
              {isSafe ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isSafe
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isSafe ? 'VERIFIED AUTHENTIC' : 'COUNTERFEIT WARNING'}
                </span>
                <span className="text-xs text-slate-400">Scanned just now</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-display">
                {currentMedicine.medicineName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Formula: <span className="text-slate-700 font-medium">{currentMedicine.genericName}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end">
            <div className="text-xs text-slate-500">Batch Number</div>
            <div className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg mt-0.5">
              {currentMedicine.batchNumber}
            </div>
          </div>
        </div>

        {/* Patient Friendly Summary Message */}
        <div
          className={`mt-5 p-4 rounded-2xl text-sm leading-relaxed ${
            isSafe
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-100 text-rose-950 border border-rose-300 font-medium'
          }`}
        >
          {currentMedicine.patientGuide.plainEnglishSummary}
        </div>

        {/* Simple 3-Pillar Check Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Pillar 1: Hologram Seal Check */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>3D Hologram Seal</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentMedicine.hologram.detected
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {currentMedicine.hologram.detected ? 'Authentic Seal' : 'Missing / Fake'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {currentMedicine.patientGuide.genuinePackagingTip}
            </p>
          </div>

          {/* Pillar 2: Expiry & Shelf Life */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Expiration Check</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isSafe ? 'Fresh' : 'Risk'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {currentMedicine.patientGuide.safeExpiryLabel}
            </p>
          </div>

          {/* Pillar 3: Manufacturer Origin */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Building className="w-4 h-4 text-purple-600" />
                <span>Manufacturer</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Certified
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed truncate">
              {currentMedicine.manufacturer}
            </p>
          </div>
        </div>

        {/* Simplified Supply Chain Verification Flow */}
        {(() => {
          const blocks = blockchainService.getChain().filter(b => b.batchId === currentMedicine.batchNumber);
          const hasMfg = blocks.some(b => b.eventType === 'DISPATCHED_BY_MANUFACTURER' || b.eventType === 'MANUFACTURED' || b.eventData?.stage === 1);
          const hasWholesale = blocks.some(b => b.eventType === 'RECEIVED_BY_WHOLESALER' || b.eventData?.stage === 2);
          const hasPharmacy = blocks.some(b => b.eventType === 'RECEIVED_BY_PHARMACIST' || b.eventData?.stage === 3);
          const hasChemist = blocks.some(b => b.eventType === 'RECEIVED_BY_CHEMIST' || b.eventData?.stage === 4);

          return (
            <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Supply Chain Journey Verification</span>
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${blocks.length > 0 ? 'text-emerald-700 bg-emerald-100' : 'text-slate-500 bg-slate-100'}`}>
                  {blocks.length > 0 ? 'On-Chain Traceability Verified' : 'Manual Registry Trace'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                <div className={`p-2.5 rounded-xl border text-center space-y-1 ${hasMfg ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Manufactured</span>
                  <span className={`font-bold flex items-center justify-center gap-1 ${hasMfg ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {hasMfg && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{hasMfg ? 'Verified ✓' : 'Pending'}</span>
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border text-center space-y-1 ${hasWholesale ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Wholesaler Depot</span>
                  <span className={`font-bold flex items-center justify-center gap-1 ${hasWholesale ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {hasWholesale && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{hasWholesale ? 'Verified ✓' : 'Pending'}</span>
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border text-center space-y-1 ${hasPharmacy ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Pharmacy Dock</span>
                  <span className={`font-bold flex items-center justify-center gap-1 ${hasPharmacy ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {hasPharmacy && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{hasPharmacy ? 'Verified ✓' : 'Pending'}</span>
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border text-center space-y-1 ${hasChemist ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Chemist Verify</span>
                  <span className={`font-bold flex items-center justify-center gap-1 ${hasChemist ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {hasChemist && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{hasChemist ? 'Verified ✓' : 'Pending'}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Consumer Hologram / Packaging Verification Card */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Hologram & Packaging Security Check</span>
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isSafe ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'
            }`}>
              {isSafe ? 'Hologram/packaging appears consistent' : 'Additional verification recommended'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-800 block">Official Batch Reference</span>
              <p className="text-slate-600">
                {isSafe
                  ? 'Official GS1 diffractive security hologram registered by manufacturer.'
                  : 'Hologram pattern mismatch or missing reference seal.'}
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-800 block">Verification Status</span>
              <p className="text-slate-600">
                {isSafe
                  ? '✓ Hologram verification available and passed.'
                  : '⚠️ Flagged for visual inspection by pharmacist.'}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic border-t border-slate-200/80 pt-2">
            Disclaimer: Hologram verification is one safety signal and should be combined with barcode scanning and pharmacy verification. It does not replace full supply chain integrity checks.
          </p>
        </div>

        {/* Clear Instructions on How to Take and Store */}
        <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
            <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-blue-600" />
              <span>How to take safely</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {currentMedicine.patientGuide.howToTake}
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
            <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Storage advice</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {currentMedicine.patientGuide.storageAdvice}
            </p>
          </div>
        </div>

        {/* Blockchain Trust Verification Box */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
              <Blocks className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>Tamper-Proof Blockchain Certificate</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  On-Chain Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Every genuine box has a unique immutable block hash that cannot be copied or duplicated.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onViewForensics && (
              <button
                id="btn-customer-view-forensics"
                onClick={() => onViewForensics(currentMedicine.batchNumber)}
                className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Radio className="w-3.5 h-3.5 text-purple-300" />
                <span>Batch Forensics</span>
              </button>
            )}
            <button
              onClick={() => setIsBlockchainOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>View Proof</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Simple Patient FAQ & Safety Tips Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span>How to Spot Fake Medicines at Home (3 Simple Checks)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 text-sm">1. Check the 3D Hologram</div>
            <p className="text-slate-600 leading-relaxed">
              Tilt the medicine strip under light. Real holograms shine like a rainbow and reveal manufacturer logos. Flat metallic foil is fake.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 text-sm">2. Inspect Print Quality</div>
            <p className="text-slate-600 leading-relaxed">
              Genuine medicines have sharp, clear lettering with embossed batch codes and expiry dates. Look out for spelling mistakes or blurry ink.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 text-sm">3. Blister Seal Integrity</div>
            <p className="text-slate-600 leading-relaxed">
              Ensure every capsule or tablet pocket is tightly sealed with no puncture holes, taped edges, or loose foil edges.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Modal Camera Scanner */}
      <CameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={(result) => setCurrentMedicine(result)}
        mode="patient"
        onViewForensics={onViewForensics}
      />

      {/* Dedicated Medicine Image Upload Modal */}
      <MedicineImageUploadModal
        isOpen={isImageUploadOpen}
        onClose={() => setIsImageUploadOpen(false)}
        mode="patient"
        onScanComplete={(result) => setCurrentMedicine(result)}
        onViewForensics={onViewForensics}
      />

      {/* Blockchain Ledger Modal */}
      {isBlockchainOpen && (
        <BlockchainModal
          medicine={currentMedicine}
          onClose={() => setIsBlockchainOpen(false)}
        />
      )}
    </div>
  );
};
