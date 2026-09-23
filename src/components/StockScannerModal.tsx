/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Boxes,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Download,
  Trash2,
  Scan,
  Sparkles,
  ChevronRight,
  Printer,
  FileText,
} from 'lucide-react';
import { StockScanItem, StockScanSession, unifiedStore } from '../services/unifiedStore';

interface StockScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewQuarantine?: () => void;
  onInspectBatch?: (batchNumber: string) => void;
}

const SIMULATED_STREAM_ITEMS: Omit<StockScanItem, 'id' | 'scannedAt'>[] = [
  {
    serialNumber: 'GS1-8890-2026-AZT-01',
    batchNumber: 'AZT-2026-119',
    medicineName: 'Azithromycin 250mg Film-Coated',
    supplier: 'MedSupply Co.',
    status: 'Verified',
    riskScore: 12,
    reason: 'GS1 matrix valid, optical seal genuine, cold-chain compliant.',
  },
  {
    serialNumber: 'GS1-6651-2026-MTF-02',
    batchNumber: 'MTF-2026-441',
    medicineName: 'Metformin Hydrochloride 500mg ER',
    supplier: 'PharmaDirect',
    status: 'Verified',
    riskScore: 14,
    reason: 'GS1 matrix valid, manufacturer signature verified.',
  },
  {
    serialNumber: 'GS1-9874-2026-AMX-01',
    batchNumber: 'AMX-2026-081',
    medicineName: 'Amoxicillin 500mg Trihydrate',
    supplier: 'MedRoute Distributors',
    status: 'Duplicate Serial',
    riskScore: 84,
    reason: 'CRITICAL: Serial already dispensed at Store #14. Cloned barcode alert.',
  },
  {
    serialNumber: 'GS1-4412-2026-CVX-99',
    batchNumber: 'CVX-2026-904',
    medicineName: 'Covaxin mRNA Booster 0.5mL',
    supplier: 'BioLogix Logistics',
    status: 'Cold Chain Breach',
    riskScore: 78,
    reason: 'BLE sensor alert: 14.8°C excursion during refrigerated transit.',
  },
  {
    serialNumber: 'GS1-3312-2024-PAR-12',
    batchNumber: 'PAR-2024-998',
    medicineName: 'Paracetamol 650mg Fast-Release',
    supplier: 'Apex Pharma Supply',
    status: 'Expired',
    riskScore: 65,
    reason: 'FEFO Violation: Batch expired on 15 Aug 2026.',
  },
  {
    serialNumber: 'GS1-7721-2026-INS-88',
    batchNumber: 'INS-2026-552',
    medicineName: 'Human Insulatard NPH Insulin 100IU',
    supplier: 'BioLogix Logistics',
    status: 'Verified',
    riskScore: 15,
    reason: 'Cold-chain compliant, authentic manufacturer key.',
  },
  {
    serialNumber: 'GS1-5512-2026-CIP-33',
    batchNumber: 'CIP-2026-302',
    medicineName: 'Ciprofloxacin 500mg Tablet',
    supplier: 'PharmaDirect',
    status: 'Review Required',
    riskScore: 42,
    reason: 'Tamper band shimmer score 58% (Below optimal 80%).',
  },
  {
    serialNumber: 'GS1-1123-2026-AMX-99',
    batchNumber: 'AMX-2026-081',
    medicineName: 'Amoxicillin 500mg Trihydrate',
    supplier: 'MedRoute Distributors',
    status: 'Quarantine Required',
    riskScore: 88,
    reason: 'Associated with high-risk cluster AMX-2026-081.',
  },
];

export const StockScannerModal: React.FC<StockScannerModalProps> = ({
  isOpen,
  onClose,
  onViewQuarantine,
  onInspectBatch,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedItems, setScannedItems] = useState<StockScanItem[]>([]);
  const [streamIndex, setStreamIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  useEffect(() => {
    let timer: any = null;
    if (isScanning && !isCompleted) {
      timer = setInterval(() => {
        const itemTemplate = SIMULATED_STREAM_ITEMS[streamIndex % SIMULATED_STREAM_ITEMS.length];
        const newItem: StockScanItem = {
          ...itemTemplate,
          id: `SCAN-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          serialNumber: `${itemTemplate.serialNumber.slice(0, -2)}${String(streamIndex + 1).padStart(2, '0')}`,
          scannedAt: new Date().toLocaleTimeString(),
        };

        setScannedItems((prev) => [newItem, ...prev]);
        setStreamIndex((prev) => prev + 1);

        // Auto-quarantine items if critical
        if (newItem.status === 'Duplicate Serial' || newItem.status === 'Quarantine Required') {
          unifiedStore.quarantineMedicine({
            medicineName: newItem.medicineName,
            batchNumber: newItem.batchNumber,
            serialNumber: newItem.serialNumber,
            shipmentId: 'SHP-STOCK-SCAN',
            reason: newItem.reason,
            notes: 'Flagged during continuous stock scan at receiving bay.',
          });
        }
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isScanning, streamIndex, isCompleted]);

  if (!isOpen) return null;

  const totalScanned = scannedItems.length;
  const verifiedCount = scannedItems.filter((i) => i.status === 'Verified').length;
  const reviewCount = scannedItems.filter((i) => i.status === 'Review Required').length;
  const quarantineCount = scannedItems.filter(
    (i) => i.status === 'Quarantine Required' || i.status === 'Duplicate Serial'
  ).length;
  const expiredCount = scannedItems.filter((i) => i.status === 'Expired').length;
  const duplicateCount = scannedItems.filter((i) => i.status === 'Duplicate Serial').length;
  const coldChainCount = scannedItems.filter((i) => i.status === 'Cold Chain Breach').length;

  const suspiciousItems = scannedItems.filter((i) => i.status !== 'Verified');

  const handleCompleteSession = () => {
    setIsScanning(false);
    setIsCompleted(true);
    setShowSummary(true);

    const session: StockScanSession = {
      id: `SESS-${Date.now()}`,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      totalScanned,
      verifiedCount,
      reviewCount,
      quarantineCount,
      expiredCount,
      duplicateCount,
      coldChainCount,
      anomalyCount: reviewCount,
      items: scannedItems,
      isLive: false,
    };
    unifiedStore.recordStockScanSession(session);
  };

  const handleResetSession = () => {
    setIsScanning(false);
    setIsCompleted(false);
    setShowSummary(false);
    setScannedItems([]);
    setStreamIndex(0);
  };

  const handleRemoveLastScan = () => {
    if (scannedItems.length > 0) {
      setScannedItems((prev) => prev.slice(1));
    }
  };

  const handleExportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Serial Number,Batch,Medicine,Supplier,Status,Risk Score,Scanned At,Reason',
        ...scannedItems.map(
          (i) =>
            `"${i.serialNumber}","${i.batchNumber}","${i.medicineName}","${i.supplier}","${i.status}",${i.riskScore},"${i.scannedAt}","${i.reason}"`
        ),
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Stock_Scan_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-display">
                  Continuous Entire-Stock Receiving Scanner
                </h2>
                {isScanning && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Live Scanner Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Continuous high-speed 2D DataMatrix scanning with real-time risk assessment, anti-cloning checks, and auto-quarantine.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Metrics Row */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 text-xs shrink-0">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Total Scanned</span>
            <span className="text-xl font-bold font-mono text-white">{totalScanned}</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
            <span className="text-emerald-400 text-[11px] block">✓ Verified</span>
            <span className="text-xl font-bold font-mono text-emerald-300">{verifiedCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40">
            <span className="text-amber-400 text-[11px] block">⚠ Review Required</span>
            <span className="text-xl font-bold font-mono text-amber-300">{reviewCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/50">
            <span className="text-rose-400 text-[11px] block">⛔ Quarantined</span>
            <span className="text-xl font-bold font-mono text-rose-300">{quarantineCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40">
            <span className="text-purple-400 text-[11px] block">Cloned Serials</span>
            <span className="text-xl font-bold font-mono text-purple-300">{duplicateCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40">
            <span className="text-cyan-400 text-[11px] block">Cold-Chain Breaches</span>
            <span className="text-xl font-bold font-mono text-cyan-300">{coldChainCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Expired Batches</span>
            <span className="text-xl font-bold font-mono text-slate-300">{expiredCount}</span>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {!isScanning ? (
              <button
                onClick={() => setIsScanning(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-900/30"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{scannedItems.length === 0 ? 'Start Continuous Scan' : 'Resume Scanning'}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsScanning(false)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-900/30"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Session</span>
              </button>
            )}

            <button
              onClick={handleRemoveLastScan}
              disabled={scannedItems.length === 0}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Remove Last Scan</span>
            </button>

            <button
              onClick={handleResetSession}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCompleteSession}
              disabled={scannedItems.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Session & View Summary</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Active Scanner Viewfinder Animation */}
          {isScanning && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-blue-950/40 border border-blue-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <Scan className="w-6 h-6 text-blue-400 animate-spin" />
                  <span className="absolute w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-200">Continuous Dock Laser Scanning Active</h4>
                  <p className="text-[11px] text-slate-400">
                    Pass cartons through optical scanner conveyor or handheld barcode gun.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-blue-300">
                Rate: ~50 scans/min
              </span>
            </div>
          )}

          {/* Scanned Items Stream Table */}
          {scannedItems.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
              <Boxes className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-300">No units scanned in this session</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Click "Start Continuous Scan" to begin receiving goods into pharmacy inventory with automated GS1 and cold-chain checks.
              </p>
              <button
                onClick={() => setIsScanning(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Continuous Scanning Session</span>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/50">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Serial / Batch</th>
                    <th className="py-2.5 px-3">Medicine & Supplier</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Risk</th>
                    <th className="py-2.5 px-3">Diagnostic Reason</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {scannedItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-900/60 transition-colors ${
                        item.status === 'Duplicate Serial' || item.status === 'Quarantine Required'
                          ? 'bg-rose-950/20'
                          : item.status === 'Cold Chain Breach'
                          ? 'bg-cyan-950/20'
                          : item.status === 'Review Required'
                          ? 'bg-amber-950/10'
                          : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-slate-400 font-sans">{item.scannedAt}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white text-[11px]">{item.serialNumber}</div>
                        <div className="text-[10px] text-slate-400">{item.batchNumber}</div>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-semibold text-slate-200">{item.medicineName}</div>
                        <div className="text-[10px] text-slate-400">{item.supplier}</div>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'Verified'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : item.status === 'Review Required'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : item.status === 'Cold Chain Breach'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-bold ${
                            item.riskScore > 70
                              ? 'text-rose-400'
                              : item.riskScore > 35
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {item.riskScore}/100
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans text-[11px] max-w-xs truncate">
                        {item.reason}
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        {onInspectBatch && (
                          <button
                            onClick={() => onInspectBatch(item.batchNumber)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Inspect
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stock Scan Summary Modal Overlay (Section 10) */}
        {showSummary && (
          <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col justify-between overflow-y-auto z-20 animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-6 max-w-4xl mx-auto w-full">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-display">
                      Stock Verification Session Summary
                    </h3>
                    <p className="text-xs text-slate-400">
                      Completed inbound scan report for dock receiving terminal #1
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSummary(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-xs">Total Units Processed</span>
                  <div className="text-2xl font-bold text-white mt-1 font-mono">{totalScanned}</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40">
                  <span className="text-emerald-400 text-xs">Verified to Active Shelves</span>
                  <div className="text-2xl font-bold text-emerald-300 mt-1 font-mono">{verifiedCount}</div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40">
                  <span className="text-amber-400 text-xs">Manual Review Required</span>
                  <div className="text-2xl font-bold text-amber-300 mt-1 font-mono">{reviewCount}</div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/50">
                  <span className="text-rose-400 text-xs">Quarantined / Rejected</span>
                  <div className="text-2xl font-bold text-rose-300 mt-1 font-mono">{quarantineCount}</div>
                </div>
              </div>

              {/* Suspicious Items Review List */}
              {suspiciousItems.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>Flagged Suspicious Items Requiring Pharmacy Intervention ({suspiciousItems.length})</span>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {suspiciousItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-950/80 rounded-xl border border-rose-800/40 text-xs flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-white">{item.medicineName} ({item.batchNumber})</div>
                          <div className="text-[11px] text-rose-300 font-mono mt-0.5">
                            Serial: {item.serialNumber} • {item.reason}
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 text-[10px] font-bold shrink-0">
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportReport}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Scan Report (CSV)</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Dossier</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {onViewQuarantine && quarantineCount > 0 && (
                    <button
                      onClick={() => {
                        setShowSummary(false);
                        onClose();
                        onViewQuarantine();
                      }}
                      className="px-4 py-2.5 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>View Quarantine Locker</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowSummary(false);
                      onClose();
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Done & Return to Terminal</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
