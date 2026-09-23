/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Camera,
  Upload,
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
  Search,
  Filter,
  ShieldAlert,
  Unlock,
  Lock,
  Download,
  Eye,
  RefreshCw,
  Play,
  FileText,
  Activity,
} from 'lucide-react';
import { ScannedMedicineResult, RiskLevel } from '../types';
import { SAMPLE_MEDICINES } from '../data/medicineScanSamples';
import { CameraScannerModal } from './CameraScannerModal';
import { BlockchainModal } from './BlockchainModal';
import { StockScannerModal } from './StockScannerModal';
import { EvaluatorTestCasesModal } from './EvaluatorTestCasesModal';
import { MedicineImageUploadModal } from './MedicineImageUploadModal';
import { unifiedStore, InventoryItem } from '../services/unifiedStore';

interface ChemistModeViewProps {
  onAddActivity?: (desc: string, type: 'accept' | 'quarantine' | 'hold') => void;
  onViewForensics?: (batchNumber: string) => void;
  onNavigateToIncidents?: () => void;
}

export const ChemistModeView: React.FC<ChemistModeViewProps> = ({
  onAddActivity,
  onViewForensics,
  onNavigateToIncidents,
}) => {
  const [currentMedicine, setCurrentMedicine] = useState<ScannedMedicineResult>(SAMPLE_MEDICINES[0]);
  const [activeTab, setActiveTab] = useState<'dock' | 'inventory' | 'quarantine' | 'history'>('dock');

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [isStockScannerOpen, setIsStockScannerOpen] = useState(false);
  const [isBlockchainOpen, setIsBlockchainOpen] = useState(false);
  const [isTestCasesOpen, setIsTestCasesOpen] = useState(false);

  // Quarantine confirmation modal state
  const [quarantineModalItem, setQuarantineModalItem] = useState<{
    medicineName: string;
    batchNumber: string;
    serialNumber: string;
    shipmentId: string;
    currentStatus: string;
    riskScore: number;
    reason: string;
    notes: string;
  } | null>(null);

  // Release confirmation modal state
  const [releaseModalItem, setReleaseModalItem] = useState<InventoryItem | null>(null);
  const [releaseAuthCode, setReleaseAuthCode] = useState<string>('AUTH-SUPV-901');
  const [releaseReason, setReleaseReason] = useState<string>('Batch passed secondary chemical assay and GS1 authorization confirmed by Manufacturer.');
  const [releaseReviewer, setReleaseReviewer] = useState<string>('Chief Pharmacist (Lic #DL-PH-9921)');

  // Inventory list state
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [inventoryFilter, setInventoryFilter] = useState<string>('ALL');
  const [inventorySearch, setInventorySearch] = useState<string>('');

  // Chemist interactive inventory state
  const [inventoryCount, setInventoryCount] = useState<number>(currentMedicine.stockInfo.currentInventory);
  const [batchReceived, setBatchReceived] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Sync with unifiedStore
  useEffect(() => {
    const updateStore = () => {
      setInventoryList(unifiedStore.getInventory());
    };
    updateStore();
    const unsubscribe = unifiedStore.subscribe(updateStore);
    return () => {
      unsubscribe();
    };
  }, []);

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

  const handleOpenQuarantineModal = (item?: {
    medicineName: string;
    batchNumber: string;
    serialNumber: string;
    shipmentId: string;
    currentStatus: string;
    riskScore: number;
    reason: string;
  }) => {
    const target = item || {
      medicineName: currentMedicine.medicineName,
      batchNumber: currentMedicine.batchNumber,
      serialNumber: currentMedicine.serialNumber,
      shipmentId: 'SHP-001',
      currentStatus: currentMedicine.isAuthentic ? 'Inbound Review' : 'Flagged Anomaly',
      riskScore: currentMedicine.riskScore,
      reason: currentMedicine.patientGuide.plainEnglishSummary || 'High risk verification anomaly detected at dock checkup.',
    };

    setQuarantineModalItem({
      ...target,
      notes: 'Locked in physical pharmacy quarantine isolation cage #2 pending regulatory directives.',
    });
  };

  const handleConfirmQuarantine = () => {
    if (!quarantineModalItem) return;

    unifiedStore.quarantineMedicine({
      medicineName: quarantineModalItem.medicineName,
      batchNumber: quarantineModalItem.batchNumber,
      serialNumber: quarantineModalItem.serialNumber,
      shipmentId: quarantineModalItem.shipmentId,
      reason: quarantineModalItem.reason,
      notes: quarantineModalItem.notes,
      reviewer: 'Chemist (Lic #DL-PH-9921)',
    });

    setBatchReceived(true);
    setActionNotice(
      `QUARANTINED batch ${quarantineModalItem.batchNumber}. Discrepancy logged with CDSCO gateway & inventory ledger updated.`
    );

    if (onAddActivity) {
      onAddActivity(
        `Chemist quarantined suspicious batch ${quarantineModalItem.batchNumber} (${quarantineModalItem.medicineName})`,
        'quarantine'
      );
    }

    setQuarantineModalItem(null);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleConfirmRelease = () => {
    if (!releaseModalItem) return;

    const success = unifiedStore.releaseFromQuarantine({
      batchNumber: releaseModalItem.batchNumber,
      serialNumber: releaseModalItem.serialNumber,
      shipmentId: releaseModalItem.shipmentId,
      reason: releaseReason,
      reviewer: releaseReviewer,
      authCode: releaseAuthCode,
    });

    if (success) {
      setActionNotice(
        `RELEASED batch ${releaseModalItem.batchNumber} back to active inventory shelves.`
      );
      if (onAddActivity) {
        onAddActivity(
          `Authorized supervisor released batch ${releaseModalItem.batchNumber} from quarantine`,
          'accept'
        );
      }
      setReleaseModalItem(null);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleSelectMedicine = (med: ScannedMedicineResult) => {
    setCurrentMedicine(med);
    setInventoryCount(med.stockInfo.currentInventory);
    setBatchReceived(false);
  };

  // Filtered inventory
  const filteredInventory = inventoryList.filter((item) => {
    const matchesSearch =
      item.medicineName.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.supplier.toLowerCase().includes(inventorySearch.toLowerCase());

    if (!matchesSearch) return false;

    if (inventoryFilter === 'ALL') return true;
    if (inventoryFilter === 'VERIFIED') return item.verificationStatus === 'Verified';
    if (inventoryFilter === 'QUARANTINED') return item.verificationStatus === 'Quarantined';
    if (inventoryFilter === 'HOLD') return item.verificationStatus === 'Hold' || item.verificationStatus === 'Requires Review';
    if (inventoryFilter === 'EXPIRED') return item.verificationStatus === 'Expired';
    if (inventoryFilter === 'HIGH_RISK') return item.riskScore > 60;
    return true;
  });

  const quarantinedItems = inventoryList.filter((item) => item.verificationStatus === 'Quarantined');

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
              Chemist Workspace & Operational Medicine Verification
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl">
              Inspect incoming cartons, verify GS1 2D DataMatrix codes, run continuous stock receiving, isolate quarantined batches, and review supply-chain custody records.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              id="btn-open-chemist-camera"
              onClick={() => setIsScannerOpen(true)}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all active:scale-95 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Scan QR / Barcode</span>
            </button>

            <button
              id="btn-upload-medicine-image-chemist"
              onClick={() => setIsImageUploadOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Upload Medicine Image</span>
            </button>

            <button
              id="btn-open-entire-stock-scanner"
              onClick={() => setIsStockScannerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-purple-900/20"
            >
              <Boxes className="w-4 h-4" />
              <span>Scan Entire Stock</span>
            </button>

            <button
              onClick={() => setIsTestCasesOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Evaluator Test Lab (9 Cases)</span>
            </button>
          </div>
        </div>

        {/* Operational Quick Tabs Navigation */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('dock')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'dock'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Dock Inspection</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'inventory'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>View Inventory ({inventoryList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('quarantine')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'quarantine'
                  ? 'bg-rose-700 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Quarantine Locker ({quarantinedItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Verification History</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden sm:inline">Shipment:</span>
            {SAMPLE_MEDICINES.slice(0, 3).map((med) => (
              <button
                key={med.id}
                onClick={() => {
                  handleSelectMedicine(med);
                  setActiveTab('dock');
                }}
                className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                  currentMedicine.id === med.id && activeTab === 'dock'
                    ? 'bg-blue-600 text-white font-semibold border-blue-400'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {med.isAuthentic ? '📦' : '⚠️'} {med.batchNumber}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* TAB 1: DOCK INSPECTION WORKBENCH */}
      {activeTab === 'dock' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: STOCK BUFFER & COLD CHAIN (lg:col-span-7) */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                  id="btn-chemist-quarantine"
                  onClick={() => handleOpenQuarantineModal()}
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
      )}

      {/* TAB 2: FULL PHARMACY INVENTORY MANAGEMENT (Section 11) */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-600" />
                <span>Pharmacy Operational Inventory</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Central stock registry connected to verification scanners, quarantine locks, and FEFO expiry tracker.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsStockScannerOpen(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Boxes className="w-4 h-4" />
                <span>Continuous Inbound Scan</span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search medicine, batch number, serial, or supplier..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 font-medium text-[11px]">Filter:</span>
              {[
                { id: 'ALL', label: 'All Stock' },
                { id: 'VERIFIED', label: 'Verified' },
                { id: 'QUARANTINED', label: 'Quarantined' },
                { id: 'HOLD', label: 'Review Required' },
                { id: 'EXPIRED', label: 'Expired' },
                { id: 'HIGH_RISK', label: 'High Risk' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setInventoryFilter(f.id)}
                  className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                    inventoryFilter === f.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3.5">Medicine & Category</th>
                  <th className="py-3 px-3.5">Batch / Serial</th>
                  <th className="py-3 px-3.5">Supplier / Mfr</th>
                  <th className="py-3 px-3.5 text-right">Quantity</th>
                  <th className="py-3 px-3.5">Expiry Date</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Risk Score</th>
                  <th className="py-3 px-3.5">Location</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900">{item.medicineName}</div>
                      <div className="text-[10px] text-slate-500">{item.category} • {item.genericName}</div>
                    </td>
                    <td className="py-3 px-3.5 font-mono">
                      <div className="font-semibold text-purple-700">{item.batchNumber}</div>
                      <div className="text-[10px] text-slate-500">{item.serialNumber}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="text-slate-800 font-medium">{item.supplier}</div>
                      <div className="text-[10px] text-slate-500">{item.manufacturer}</div>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                      {item.quantity} units
                    </td>
                    <td className="py-3 px-3.5 font-mono">
                      <span className={item.verificationStatus === 'Expired' ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                        {item.expiryDate}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.verificationStatus === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.verificationStatus === 'Quarantined'
                            ? 'bg-rose-100 text-rose-800'
                            : item.verificationStatus === 'Expired'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {item.verificationStatus === 'Verified' && <CheckCircle2 className="w-3 h-3" />}
                        {item.verificationStatus === 'Quarantined' && <Lock className="w-3 h-3" />}
                        {item.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold">
                      <span
                        className={
                          item.riskScore > 70
                            ? 'text-rose-600'
                            : item.riskScore > 35
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }
                      >
                        {item.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 text-[11px]">{item.location}</td>
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.verificationStatus === 'Quarantined' ? (
                          <button
                            onClick={() => setReleaseModalItem(item)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>Release</span>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleOpenQuarantineModal({
                                medicineName: item.medicineName,
                                batchNumber: item.batchNumber,
                                serialNumber: item.serialNumber,
                                shipmentId: item.shipmentId,
                                currentStatus: item.verificationStatus,
                                riskScore: item.riskScore,
                                reason: 'Manual quarantine directive from pharmacy inventory manager.',
                              })
                            }
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Quarantine</span>
                          </button>
                        )}

                        {onViewForensics && (
                          <button
                            onClick={() => onViewForensics(item.batchNumber)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[10px] cursor-pointer"
                          >
                            Inspect
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DEDICATED QUARANTINE LOCKER (Section 7 & 8) */}
      {activeTab === 'quarantine' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  Pharmacy Physical & Digital Quarantine Locker
                </h2>
                <p className="text-xs text-slate-500">
                  Batches locked from dispensing pending chemical assay, CDSCO advisory, or supervisor release.
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
              {quarantinedItems.length} Batches Isolated
            </span>
          </div>

          {quarantinedItems.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">Quarantine Locker Empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                All medicines in pharmacy inventory are compliant with zero active quarantine locks.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quarantinedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 shadow-xs space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-mono text-[10px] font-bold">
                        Batch: {item.batchNumber}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{item.medicineName}</h3>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        Serial: {item.serialNumber} • {item.supplier}
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider">
                      Locked
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-rose-200 text-xs space-y-1.5">
                    <div className="font-semibold text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Quarantine Justification:</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {item.quarantineReason || 'Cloned barcode collision detected at central distributor.'}
                    </p>
                    {item.quarantinedAt && (
                      <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100">
                        Quarantined on: {item.quarantinedAt} by {item.quarantinedBy}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-500">
                      Physical Location: <strong>{item.location}</strong>
                    </span>

                    <button
                      onClick={() => setReleaseModalItem(item)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Authorized Release</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REAL-TIME VERIFICATION TIMELINE */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Pharmacy Receiving & Verification Audit Log</span>
            </h2>
            <button
              onClick={() => setIsBlockchainOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5"
            >
              <Blocks className="w-3.5 h-3.5 text-blue-600" />
              <span>Verify Blockchain SHA-256 Ledger</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {unifiedStore.getAuditEvents().map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      evt.type === 'quarantine'
                        ? 'bg-rose-100 text-rose-700'
                        : evt.type === 'accept'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {evt.type === 'quarantine' && <ShieldAlert className="w-4 h-4" />}
                    {evt.type === 'accept' && <CheckCircle2 className="w-4 h-4" />}
                    {evt.type === 'scan' && <Boxes className="w-4 h-4" />}
                    {evt.type === 'alert' && <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{evt.description}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Shipment: {evt.shipmentId} • Supplier: {evt.supplier}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] text-slate-500 font-mono shrink-0">{evt.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUARANTINE CONFIRMATION DIALOG (Section 7) */}
      {quarantineModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-rose-700 font-bold font-display">
                <ShieldAlert className="w-5 h-5" />
                <span>Confirm Batch Quarantine Directive</span>
              </div>
              <button
                onClick={() => setQuarantineModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Medicine:</span>
                <strong className="text-slate-900">{quarantineModalItem.medicineName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Batch Code:</span>
                <strong className="text-purple-700 font-mono">{quarantineModalItem.batchNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Serial Tag:</span>
                <strong className="text-slate-900 font-mono">{quarantineModalItem.serialNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Risk Assessment:</span>
                <strong className="text-rose-700 font-mono font-bold">{quarantineModalItem.riskScore}/100</strong>
              </div>
              <div className="pt-2 border-t border-rose-200">
                <span className="text-slate-600 block mb-0.5">Detection Reason:</span>
                <p className="text-rose-950 font-medium">{quarantineModalItem.reason}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inspector / Pharmacist Isolation Notes (Optional):
              </label>
              <textarea
                value={quarantineModalItem.notes}
                onChange={(e) =>
                  setQuarantineModalItem({ ...quarantineModalItem, notes: e.target.value })
                }
                rows={2}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-rose-500"
                placeholder="Enter physical locker safe number, visual evidence notes, or carrier details..."
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setQuarantineModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-quarantine-submit"
                onClick={handleConfirmQuarantine}
                className="px-5 py-2.5 bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-900/20 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm Quarantine & Lock Stock</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RELEASE FROM QUARANTINE DIALOG (Section 8) */}
      {releaseModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-amber-700 font-bold font-display">
                <Unlock className="w-5 h-5" />
                <span>Authorized Quarantine Release Directive</span>
              </div>
              <button
                onClick={() => setReleaseModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5 text-xs text-slate-800">
              <div className="flex justify-between">
                <span>Batch Code:</span>
                <strong className="font-mono text-purple-800">{releaseModalItem.batchNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>Medicine Name:</span>
                <strong>{releaseModalItem.medicineName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Quarantined Reason:</span>
                <span className="text-slate-600">{releaseModalItem.quarantineReason}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supervisor Authorization Code (Required):
                </label>
                <input
                  type="text"
                  value={releaseAuthCode}
                  onChange={(e) => setReleaseAuthCode(e.target.value)}
                  placeholder="e.g. AUTH-SUPV-901"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Release Justification & Verification Notes:
                </label>
                <textarea
                  value={releaseReason}
                  onChange={(e) => setReleaseReason(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-blue-500"
                  placeholder="State reason for release (e.g. laboratory re-assay passed, GS1 reconciliation verified)..."
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Authorizing Reviewer:</label>
                <input
                  type="text"
                  value={releaseReviewer}
                  onChange={(e) => setReleaseReviewer(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReleaseModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRelease}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-900/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Authorize & Return to Active Shelves</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Scanner Modal */}
      <CameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={(result) => handleSelectMedicine(result)}
        mode="chemist"
        onViewForensics={onViewForensics}
      />

      {/* Dedicated Medicine Image Upload Modal */}
      <MedicineImageUploadModal
        isOpen={isImageUploadOpen}
        onClose={() => setIsImageUploadOpen(false)}
        mode="chemist"
        onScanComplete={(result) => handleSelectMedicine(result)}
        onViewForensics={onViewForensics}
      />

      {/* Entire-Stock Continuous Scanner Modal */}
      <StockScannerModal
        isOpen={isStockScannerOpen}
        onClose={() => setIsStockScannerOpen(false)}
        onViewQuarantine={() => setActiveTab('quarantine')}
        onInspectBatch={(b) => onViewForensics && onViewForensics(b)}
      />

      {/* Evaluator Test Cases Runner */}
      <EvaluatorTestCasesModal
        isOpen={isTestCasesOpen}
        onClose={() => setIsTestCasesOpen(false)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenStockScanner={() => setIsStockScannerOpen(true)}
        onOpenBlockchain={() => setIsBlockchainOpen(true)}
        onOpenForensics={onViewForensics}
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
