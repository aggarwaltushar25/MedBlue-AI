/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
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
import { SupplyChainTraceability } from './SupplyChainTraceability';
import { SupplyChainNotificationCenter } from './SupplyChainNotificationCenter';

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
  const [activeTab, setActiveTab] = useState<'receive' | 'inventory' | 'dispense' | 'quarantine' | 'history' | 'traceability'>('receive');

  // Receive State
  const [selectedInboundShipment, setSelectedInboundShipment] = useState<string>('');
  const [chemistName, setChemistName] = useState<string>('Amit Sharma (Senior Chemist)');
  const [chemistStation, setChemistStation] = useState<string>('Counter B-12 (OPD)');

  // Dispense State
  const [selectedInventoryForDispense, setSelectedInventoryForDispense] = useState<string>('');
  const [dispenseQty, setDispenseQty] = useState<number>(1);
  const [patientIdInput, setPatientIdInput] = useState<string>('PATIENT-VERIFIED-8821');

  // Stage 4 Verification Workflow States
  const [isBatchVerified, setIsBatchVerified] = useState<boolean>(false);
  const [isQrVerified, setIsQrVerified] = useState<boolean>(false);
  const [isColdChainVerified, setIsColdChainVerified] = useState<boolean>(false);

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

  // Action notification
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

  const shipmentsList = unifiedStore.getShipments();

  useEffect(() => {
    if (shipmentsList.length > 0 && !selectedInboundShipment) {
      setSelectedInboundShipment(shipmentsList[0].id);
    }
    if (inventoryList.length > 0 && !selectedInventoryForDispense) {
      setSelectedInventoryForDispense(inventoryList[0].id);
    }
  }, [shipmentsList, inventoryList]);

  // Reset verification when inventory selection changes
  useEffect(() => {
    setIsBatchVerified(false);
    setIsQrVerified(false);
    setIsColdChainVerified(false);
  }, [selectedInventoryForDispense]);

  const handleReceiveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInboundShipment) return;
    unifiedStore.receiveChemistShipment(selectedInboundShipment, chemistName, chemistStation);
    setActiveTab('inventory');
  };

  const handleDispenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInventoryForDispense || !isBatchVerified || !isQrVerified || !isColdChainVerified) return;
    
    const selectedItem = inventoryList.find(i => i.id === selectedInventoryForDispense);
    const isRestricted = selectedItem && ['Quarantined', 'Hold', 'Requires Review', 'Rejected', 'Invalid'].includes(selectedItem.verificationStatus);
    
    if (isRestricted) {
      setActionNotice(`BLOCK: Dispensing prohibited for item ${selectedItem?.id}. Status is ${selectedItem?.verificationStatus}.`);
      return;
    }

    unifiedStore.dispenseMedicine(selectedInventoryForDispense, dispenseQty, patientIdInput);
    
    // Reset verification states after successful dispense
    setIsBatchVerified(false);
    setIsQrVerified(false);
    setIsColdChainVerified(false);
    
    setActiveTab('inventory');
  };

  const filteredInventory = useMemo(() => {
    return inventoryList.filter((item) => {
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
      if (inventoryFilter === 'HIGH_RISK') return item.riskScore >= 60;
      return true;
    });
  }, [inventoryList, inventorySearch, inventoryFilter]);

  const quarantinedItems = useMemo(() => {
    return inventoryList.filter((item) => item.verificationStatus === 'Quarantined');
  }, [inventoryList]);

  const handleOpenQuarantineModal = (itemDetails: {
    medicineName: string;
    batchNumber: string;
    serialNumber: string;
    shipmentId: string;
    currentStatus: string;
    riskScore: number;
    reason: string;
  }) => {
    setQuarantineModalItem({
      ...itemDetails,
      notes: '',
    });
  };

  const handleConfirmQuarantine = () => {
    if (!quarantineModalItem) return;
    unifiedStore.quarantineMedicine({
      medicineName: quarantineModalItem.medicineName,
      batchNumber: quarantineModalItem.batchNumber,
      serialNumber: quarantineModalItem.serialNumber,
      shipmentId: quarantineModalItem.shipmentId || 'SHP-001',
      reason: quarantineModalItem.reason,
      notes: quarantineModalItem.notes,
      reviewer: chemistName,
    });
    if (onAddActivity) {
      onAddActivity(`Quarantined batch ${quarantineModalItem.batchNumber}`, 'quarantine');
    }
    setActionNotice(`Batch ${quarantineModalItem.batchNumber} successfully placed in Quarantine Locker.`);
    setQuarantineModalItem(null);
  };

  const handleConfirmRelease = () => {
    if (!releaseModalItem) return;
    unifiedStore.releaseMedicine(
      releaseModalItem.batchNumber,
      `${releaseReason} (Auth Code: ${releaseAuthCode})`,
      releaseReviewer
    );
    if (onAddActivity) {
      onAddActivity(`Released batch ${releaseModalItem.batchNumber}`, 'accept');
    }
    setActionNotice(`Batch ${releaseModalItem.batchNumber} authorized and released to active inventory.`);
    setReleaseModalItem(null);
  };

  const handleSelectMedicine = (result: ScannedMedicineResult) => {
    setCurrentMedicine(result);
    setActionNotice(`Scanned medicine: ${result.medicineName}`);
  };

  return (
    <div className="space-y-6">
      {/* Action Notice Alert Banner */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-slate-600 font-bold px-2 py-0.5 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>STAGE 4 — CHEMIST STAFF TERMINAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Chemist Dispensing & Verification Terminal
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl">
              Receive verified stock from Stage 3 Pharmacy, perform final professional checks, and dispense safely to Stage 5 Patient.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
             <SupplyChainNotificationCenter
              recipientOrg={chemistStation}
              recipientRole="Chemist"
              onOpenShipment={(shipId) => {
                setSelectedInboundShipment(shipId);
                setActiveTab('receive');
              }}
            />
            <button
              id="btn-open-chemist-camera"
              onClick={() => setIsScannerOpen(true)}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all active:scale-95 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Patient ID / Medicine</span>
            </button>
          </div>
        </div>

        {/* Operational Quick Tabs Navigation */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('receive')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'receive'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Receive Dock</span>
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
              <span>Active Stock ({inventoryList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('dispense')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'dispense'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Dispense to Patient</span>
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
              <span>Quarantine Locker</span>
            </button>

            <button
              onClick={() => setActiveTab('traceability')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'traceability'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Blocks className="w-3.5 h-3.5 text-emerald-400" />
              <span>Traceability Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: RECEIVE FROM PHARMACY */}
      {activeTab === 'receive' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <span>Receive Inbound Pharmacy Dispatch</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verifies pharmacy verified stock and adds to dispensing station inventory.
              </p>
            </div>
          </div>

          <form onSubmit={handleReceiveStock} className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Arriving Internal Shipment
              </label>
              <select
                value={selectedInboundShipment}
                onChange={(e) => setSelectedInboundShipment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {shipmentsList.map((shp) => (
                  <option key={shp.id} value={shp.id}>
                    {shp.id} — {shp.medicineName} ({shp.quantity} units)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Recipient Chemist Staff Name
              </label>
              <input
                type="text"
                value={chemistName}
                onChange={(e) => setChemistName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

             <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Dispensing Station / Counter
              </label>
              <input
                type="text"
                value={chemistStation}
                onChange={(e) => setChemistStation(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 cursor-pointer transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Receipt & Sign RECEIVED_BY_CHEMIST Block</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: DISPENSE TO PATIENT */}
      {activeTab === 'dispense' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-purple-600" />
                <span>Final Professional Dispense to Patient (Stage 5)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Executes the final supply chain transaction: Medicine to Patient.
              </p>
            </div>
          </div>

          <form onSubmit={handleDispenseSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Dispensing Stock
              </label>
              <select
                value={selectedInventoryForDispense}
                onChange={(e) => setSelectedInventoryForDispense(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 font-bold focus:outline-none focus:border-blue-500"
              >
                {inventoryList.map((item) => (
                  <option key={item.id} value={item.id} disabled={['Quarantined', 'Hold', 'Requires Review', 'Rejected', 'Invalid'].includes(item.verificationStatus)}>
                    {item.medicineName} ({item.batchNumber}) — {item.quantity} available [{item.verificationStatus}]
                  </option>
                ))}
              </select>
            </div>

            {(() => {
              const selectedItem = inventoryList.find(i => i.id === selectedInventoryForDispense);
              const isRestricted = selectedItem && ['Quarantined', 'Hold', 'Requires Review', 'Rejected', 'Invalid'].includes(selectedItem.verificationStatus);
              if (isRestricted) {
                return (
                  <div className="sm:col-span-2 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-pulse">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-900 uppercase">Dispensing Prohibited</h4>
                      <p className="text-[11px] text-rose-800 mt-1">
                        This batch is currently marked as <strong>{selectedItem?.verificationStatus}</strong>. 
                        Safety protocol blocks all Stage 5 transactions until the batch is cleared by Regulatory (Stage 6) or Supervisor.
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Quantity Dispensing
              </label>
              <input
                type="number"
                min="1"
                value={dispenseQty}
                onChange={(e) => setDispenseQty(Number(e.target.value))}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Patient Identifier / Prescription ID
              </label>
              <input
                type="text"
                value={patientIdInput}
                onChange={(e) => setPatientIdInput(e.target.value)}
                required
                placeholder="e.g. PATIENT-8821-X"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* STAGE 4 MANDATORY VERIFICATION CHECKLIST */}
            <div className="sm:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Stage 4 Mandatory Professional Verification</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  All three professional checks must be completed and logged before the blockchain 'DISPENSED' block can be anchored.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* CHECK 1: BATCH IDENTITY */}
                <div 
                  onClick={() => setIsBatchVerified(!isBatchVerified)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isBatchVerified 
                      ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Identity</span>
                    {isBatchVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-900">Batch Consistency</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Pack matches system batch record</div>
                </div>

                {/* CHECK 2: QR/BARCODE RE-SCAN */}
                <div 
                  onClick={() => setIsQrVerified(!isQrVerified)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isQrVerified 
                      ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Digital Tag</span>
                    {isQrVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-900">QR/Barcode Match</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">GS1 Secure Scan Successful</div>
                </div>

                {/* CHECK 3: COLD-CHAIN STATUS */}
                <div 
                  onClick={() => setIsColdChainVerified(!isColdChainVerified)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isColdChainVerified 
                      ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Cold-Chain</span>
                    {isColdChainVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-900">Temp Compliance</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Sensor data in range</div>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={!isBatchVerified || !isQrVerified || !isColdChainVerified || (() => {
                  const selectedItem = inventoryList.find(i => i.id === selectedInventoryForDispense);
                  return selectedItem && ['Quarantined', 'Hold', 'Requires Review', 'Rejected', 'Invalid'].includes(selectedItem.verificationStatus);
                })()}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                  (isBatchVerified && isQrVerified && isColdChainVerified && !(() => {
                    const selectedItem = inventoryList.find(i => i.id === selectedInventoryForDispense);
                    return selectedItem && ['Quarantined', 'Hold', 'Requires Review', 'Rejected', 'Invalid'].includes(selectedItem.verificationStatus);
                  })())
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>
                  {(() => {
                    const selectedItem = inventoryList.find(i => i.id === selectedInventoryForDispense);
                    if (selectedItem && ['Quarantined', 'Hold', 'Requires Review', 'Rejected', 'Invalid'].includes(selectedItem.verificationStatus)) {
                      return 'Dispensing Blocked (Safety Protocol)';
                    }
                    return (!isBatchVerified || !isQrVerified || !isColdChainVerified) 
                      ? 'Complete All Checks to Dispense' 
                      : 'Final Dispense to Patient & Anchor DISPENSED Block';
                  })()}
                </span>
              </button>
            </div>
          </form>
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
              onClick={() => setActiveTab('traceability')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
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

      {/* TAB 5: TRACEABILITY LEDGER */}
      {activeTab === 'traceability' && (
        <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-xs">
          <SupplyChainTraceability 
            shipmentId={inventoryList.find(i => i.id === selectedInventoryForDispense)?.shipmentId}
            initialBatchId={inventoryList.find(i => i.id === selectedInventoryForDispense)?.batchNumber}
          />
        </div>
      )}
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
