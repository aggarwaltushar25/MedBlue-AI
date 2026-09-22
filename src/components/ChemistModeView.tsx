/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Camera,
  Boxes,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  QrCode,
  Sparkles,
  Blocks,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Warehouse,
  FileSpreadsheet,
  Layers,
  Repeat,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { ScannedMedicineResult } from '../types';
import { SAMPLE_MEDICINES } from '../data/medicineScanSamples';
import { CameraScannerModal } from './CameraScannerModal';
import { BlockchainModal } from './BlockchainModal';

interface ChemistModeViewProps {
  onAddActivity?: (desc: string, type: 'accept' | 'quarantine' | 'hold') => void;
  onViewForensics?: (batchNumber: string) => void;
}

export const ChemistModeView: React.FC<ChemistModeViewProps> = ({ onAddActivity, onViewForensics }) => {
  const [currentMedicine, setCurrentMedicine] = useState<ScannedMedicineResult>(SAMPLE_MEDICINES[0]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBlockchainOpen, setIsBlockchainOpen] = useState(false);

  // Chemist interactive inventory state
  const [inventoryCount, setInventoryCount] = useState<number>(currentMedicine.stockInfo.currentInventory);
  const [batchReceived, setBatchReceived] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleAcceptStock = () => {
    const updated = inventoryCount + currentMedicine.stockInfo.incomingUnits;
    setInventoryCount(updated);
    setBatchReceived(true);
    setActionNotice(
      `Accepted batch ${currentMedicine.batchNumber}: Added +${currentMedicine.stockInfo.incomingUnits} units to Pharmacy Inventory. New on-hand stock: ${updated} units.`
    );
    if (onAddActivity) {
      onAddActivity(
        `Chemist accepted ${currentMedicine.stockInfo.incomingUnits} units of ${currentMedicine.medicineName} (Batch ${currentMedicine.batchNumber}) into active stock`,
        'accept'
      );
    }
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleQuarantine = () => {
    setBatchReceived(true);
    setActionNotice(
      `QUARANTINED batch ${currentMedicine.batchNumber}. Discrepancy logged with CDSCO gateway. Goods locked in physical quarantine hold.`
    );
    if (onAddActivity) {
      onAddActivity(
        `Chemist quarantined suspicious batch ${currentMedicine.batchNumber} (${currentMedicine.medicineName})`,
        'quarantine'
      );
    }
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleSelectMedicine = (med: ScannedMedicineResult) => {
    setCurrentMedicine(med);
    setInventoryCount(med.stockInfo.currentInventory);
    setBatchReceived(false);
  };

  return (
    <div className="space-y-6">
      {/* Dock Receiving Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
              <Warehouse className="w-4 h-4 text-emerald-400" />
              <span>Pharmacy Inbound & Stock Receiving Terminal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Chemist Stock Checkup & Optical Seal Verification
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl">
              Inspect incoming cartons, check live inventory buffer, test 3D holographic tamper bands, and cross-reference blockchain serial numbers before adding to shelves.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              id="btn-open-chemist-camera"
              onClick={() => setIsScannerOpen(true)}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all active:scale-95 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Start Inbound Camera Scanner</span>
            </button>

            <button
              onClick={() => setIsBlockchainOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Blocks className="w-4 h-4 text-blue-400" />
              <span>Blockchain Provenance Trail</span>
            </button>
          </div>
        </div>

        {/* Quick Batch Selectors */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Select shipment delivery:</span>
          {SAMPLE_MEDICINES.map((med) => (
            <button
              key={med.id}
              onClick={() => handleSelectMedicine(med)}
              className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                currentMedicine.id === med.id
                  ? 'bg-blue-600 text-white font-semibold border-blue-400 shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {med.isAuthentic ? '📦' : '⚠️'} {med.medicineName} ({med.batchNumber})
            </button>
          ))}
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 2-COLUMN CHEMIST WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: STOCK IDEA & INVENTORY BUFFER (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Stock Idea on Checkup */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-display">
                    Stock & Inventory Projection on Checkup
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time pharmacy stock buffer, reorder points, and FEFO expiry safety
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  currentMedicine.stockInfo.status === 'In Stock'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {currentMedicine.stockInfo.status}
              </span>
            </div>

            {/* 4-Metric Stock Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-medium text-slate-500">Current On-Hand</div>
                <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
                  {inventoryCount}{' '}
                  <span className="text-xs font-normal text-slate-500">units</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Physical shelves</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="text-[11px] font-medium text-blue-700">Incoming Delivery</div>
                <div className="text-xl font-bold text-blue-900 mt-1 font-mono">
                  +{currentMedicine.stockInfo.incomingUnits}{' '}
                  <span className="text-xs font-normal text-blue-700">units</span>
                </div>
                <div className="text-[10px] text-blue-600 mt-0.5">In this shipment</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-[11px] font-medium text-emerald-700">Projected Total</div>
                <div className="text-xl font-bold text-emerald-900 mt-1 font-mono">
                  {inventoryCount + (batchReceived ? 0 : currentMedicine.stockInfo.incomingUnits)}{' '}
                  <span className="text-xs font-normal text-emerald-700">units</span>
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">After accepting</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                <div className="text-[11px] font-medium text-purple-700">Stock Buffer</div>
                <div className="text-xl font-bold text-purple-900 mt-1 font-mono">
                  ~{currentMedicine.stockInfo.daysBuffer}{' '}
                  <span className="text-xs font-normal text-purple-700">days</span>
                </div>
                <div className="text-[10px] text-purple-600 mt-0.5">Reorder: {currentMedicine.stockInfo.reorderThreshold} units</div>
              </div>
            </div>

            {/* Inventory Buffer Bar Visualization */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Stock Coverage Progress vs. Max Capacity (2,500 units)</span>
                <span className="font-bold text-slate-800">
                  {Math.round(((inventoryCount + currentMedicine.stockInfo.incomingUnits) / 2500) * 100)}%
                </span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, (inventoryCount / 2500) * 100)}%` }}
                  title="Current on-hand stock"
                ></div>
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (currentMedicine.stockInfo.incomingUnits / 2500) * 100
                    )}%`,
                  }}
                  title="Incoming shipment batch units"
                ></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-600"></span> Current On-Hand ({inventoryCount})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-400"></span> Incoming (+{currentMedicine.stockInfo.incomingUnits})
                </span>
                <span>Max Reorder Cap: 2,500</span>
              </div>
            </div>

            {/* Stock Expiry & Safety Window */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Batch Expiry Date</span>
                </div>
                <div className="font-semibold text-slate-900 font-mono text-sm">
                  {currentMedicine.expiryDate}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">
                  {currentMedicine.isAuthentic ? 'FEFO Safe: Over 14 months shelf-life' : '⚠️ Unverified shelf life'}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-blue-600" />
                  <span>Transit Temperature at Receiving</span>
                </div>
                <div className="font-semibold text-slate-900 font-mono text-sm flex items-center gap-2">
                  <span>{currentMedicine.stockInfo.arrivalTemp}°C</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      currentMedicine.stockInfo.tempBreached
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {currentMedicine.stockInfo.tempBreached ? 'Excursion Alert' : 'Normal Range'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Target: {currentMedicine.stockInfo.tempSafeRange}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Anti-Diversion & Duplicate Serial Checker */}
          <div
            className={`p-6 rounded-3xl border shadow-xs transition-all ${
              currentMedicine.stockInfo.duplicateSerialFound
                ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-200'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    currentMedicine.stockInfo.duplicateSerialFound
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <Repeat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                    Anti-Diversion & Duplicate Serial Detection
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cross-references central pharmacy network for cloned or recycled barcodes
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  currentMedicine.stockInfo.duplicateSerialFound
                    ? 'bg-rose-600 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {currentMedicine.stockInfo.duplicateSerialFound ? 'Duplicate Found!' : 'Unique Serial'}
              </span>
            </div>

            {currentMedicine.stockInfo.duplicateSerialFound ? (
              <div className="mt-4 p-3.5 bg-rose-100 border border-rose-300 rounded-xl text-xs text-rose-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>CRITICAL ALERT: Serial #{currentMedicine.serialNumber} is Cloned!</span>
                </div>
                <p>
                  This specific unit serial was recorded as dispensed:{' '}
                  <strong>{currentMedicine.stockInfo.lastDispensedLocation}</strong>. Do NOT accept into stock.
                </p>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                <span>Unit Serial #{currentMedicine.serialNumber}</span>
                <span className="text-emerald-700 font-medium">0 duplicate records in national database</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: OPTICAL HOLOGRAM & STOCK ACTIONS (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: 3D Hologram & Optical Seal Inspection */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Hologram Optical Seal Analysis
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentMedicine.hologram.detected
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {currentMedicine.hologram.patternMatch}
              </span>
            </div>

            {/* Optical Meter */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between text-slate-600 mb-1">
                  <span>Spectral Iridescence Shimmer</span>
                  <span className="font-mono font-bold text-slate-800">
                    {currentMedicine.hologram.iridescenceScore}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentMedicine.hologram.iridescenceScore > 80
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${currentMedicine.hologram.iridescenceScore}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-600 mb-1">
                  <span>Specular Glare Reflection Index</span>
                  <span className="font-mono font-bold text-slate-800">
                    {currentMedicine.hologram.specularGlareScore}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${currentMedicine.hologram.specularGlareScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              {currentMedicine.hologram.details}
            </div>
          </div>

          {/* Card: Pharmacist Action Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Inbound Decision & Stock Ledger</span>
            </h3>

            <div className="space-y-2.5">
              <button
                id="btn-chemist-accept"
                onClick={handleAcceptStock}
                disabled={!currentMedicine.isAuthentic}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                  currentMedicine.isAuthentic
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-98'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept Batch & Add +{currentMedicine.stockInfo.incomingUnits} to Stock</span>
              </button>

              <button
                onClick={handleQuarantine}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Quarantine Batch & Block Dispensing</span>
              </button>

              <button
                onClick={() => setIsBlockchainOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Blocks className="w-4 h-4 text-blue-600" />
                <span>View Blockchain Cryptographic Proof</span>
              </button>

              {onViewForensics && (
                <button
                  id="btn-chemist-view-forensics"
                  onClick={() => onViewForensics(currentMedicine.batchNumber)}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-purple-600" />
                  <span>Inspect Batch Forensics & Custody Ledger</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Modal Camera Scanner */}
      <CameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={(result) => handleSelectMedicine(result)}
        mode="chemist"
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
