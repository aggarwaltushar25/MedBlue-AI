/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
  Building,
  Calendar,
  Layers,
  Truck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Printer,
  Radio,
  Clock,
  Thermometer,
  QrCode,
  Lock,
  ArrowRight,
  Filter,
  Download,
  AlertOctagon,
  Share2,
  MapPin,
  FileCheck,
  ChevronRight,
  Sparkles,
  Copy,
  Check,
  Database,
  Hash,
} from 'lucide-react';
import {
  BatchForensicRecord,
  BatchSupplierConsignment,
  CustodyStageNode,
  UnitForensicRecord,
  ShipmentBlockchainVerification,
} from '../types';
import {
  BATCH_FORENSICS_DATABASE,
  AVAILABLE_FORENSIC_BATCHES,
  getConsignmentBlockchainVerification,
} from '../data/batchForensicsData';

interface BatchForensicsViewProps {
  initialBatchNumber?: string;
  onBackToDashboard?: () => void;
  onSelectShipmentId?: (shipmentId: string) => void;
}

export const BatchForensicsView: React.FC<BatchForensicsViewProps> = ({
  initialBatchNumber,
  onBackToDashboard,
  onSelectShipmentId,
}) => {
  // Active selected batch
  const defaultBatch =
    initialBatchNumber && BATCH_FORENSICS_DATABASE[initialBatchNumber]
      ? initialBatchNumber
      : 'AMX-2026-081';

  const [selectedBatchId, setSelectedBatchId] = useState<string>(defaultBatch);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState<string>('All');
  const [unitStatusFilter, setUnitStatusFilter] = useState<string>('All');
  const [activeCustodyNode, setActiveCustodyNode] = useState<CustodyStageNode | null>(null);
  const [selectedUnitSerial, setSelectedUnitSerial] = useState<UnitForensicRecord | null>(null);
  const [selectedBlockchainConsignment, setSelectedBlockchainConsignment] =
    useState<BatchSupplierConsignment | null>(null);
  const [consignmentViewMode, setConsignmentViewMode] = useState<'cards' | 'table'>('cards');
  const [copiedHashText, setCopiedHashText] = useState<string | null>(null);
  const [showMerkleModal, setShowMerkleModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  const handleCopyText = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedHashText(text);
    setTimeout(() => setCopiedHashText(null), 2200);
  };

  const batch: BatchForensicRecord =
    BATCH_FORENSICS_DATABASE[selectedBatchId] || BATCH_FORENSICS_DATABASE['AMX-2026-081'];

  // Filter units
  const filteredUnits = batch.sampleUnits.filter((unit) => {
    const matchesSearch =
      unit.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.consignmentId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSupplier =
      selectedSupplierFilter === 'All' || unit.supplier === selectedSupplierFilter;

    const matchesStatus =
      unitStatusFilter === 'All' ||
      (unitStatusFilter === 'Cloned' && unit.status === 'Cloned / Duplicate') ||
      (unitStatusFilter === 'Authentic' && unit.status === 'Genuine Verified') ||
      (unitStatusFilter === 'Damaged' &&
        (unit.status === 'Cold-Chain Damaged' || unit.status === 'Packaging Anomaly'));

    return matchesSearch && matchesSupplier && matchesStatus;
  });

  const consignmentIntegrityStats = React.useMemo(() => {
    let verified = 0;
    let warned = 0;
    batch.suppliers.forEach((s) => {
      const ver = getConsignmentBlockchainVerification(s, batch);
      if (ver.isHashVerified) {
        verified++;
      } else {
        warned++;
      }
    });
    return {
      verifiedCount: verified,
      warnedCount: warned,
      totalCount: batch.suppliers.length,
      allVerified: warned === 0,
    };
  }, [batch]);

  const isCritical = batch.overallStatus.includes('Quarantined');
  const isHold = batch.overallStatus.includes('Hold');
  const isPristine = batch.overallStatus.includes('Pristine');

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Top Banner & Fast Batch Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                <Radio className="w-3 h-3 text-purple-600 animate-pulse" />
                Cross-Supplier Forensic Trace
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Chain-of-Custody Dossier</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display mt-1">
              Batch Forensics & Chain-of-Custody Investigation
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Analyze multi-supplier unit serialization, detect unauthorized depot detours, cloned barcodes, and cold-chain excursions across all distributor consignments.
            </p>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
            <button
              id="btn-merkle-proof"
              onClick={() => setShowMerkleModal(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Verify Merkle Roots</span>
            </button>

            <button
              id="btn-broadcast-quarantine"
              onClick={() => {
                setBroadcastSent(false);
                setShowBroadcastModal(true);
              }}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Broadcast Recall Notice</span>
            </button>

            <button
              id="btn-print-forensics"
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Dossier</span>
            </button>
          </div>
        </div>

        {/* Quick Batch Selector Pills */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Select Target Product Batch for Forensic Inspection:
            </span>
            <span className="text-xs text-slate-400">
              Showing {AVAILABLE_FORENSIC_BATCHES.length} active multi-supplier batches
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {AVAILABLE_FORENSIC_BATCHES.map((bId) => {
              const bRec = BATCH_FORENSICS_DATABASE[bId];
              const isSelected = selectedBatchId === bId;
              const hasAnomaly = bRec.anomaliesDetected.length > 0;

              return (
                <button
                  key={bId}
                  id={`batch-chip-${bId}`}
                  onClick={() => {
                    setSelectedBatchId(bId);
                    setSelectedSupplierFilter('All');
                    setUnitStatusFilter('All');
                    setActiveCustodyNode(null);
                    setSelectedUnitSerial(null);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left flex items-center gap-2 shrink-0 border cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-500/20'
                      : hasAnomaly
                      ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      : 'bg-emerald-50/50 text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold">{bId}</span>
                      {hasAnomaly ? (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? 'bg-amber-300' : 'bg-rose-500'
                          }`}
                        />
                      ) : (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? 'bg-emerald-300' : 'bg-emerald-500'
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-[11px] truncate max-w-[150px] ${
                        isSelected ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      {bRec.medicineName.split(' ')[0]} {bRec.medicineName.split(' ')[1] || ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary Batch Dossier Header Card */}
      <div
        className={`rounded-xl border p-6 bg-white shadow-xs transition-colors ${
          isCritical
            ? 'border-rose-300 ring-1 ring-rose-200'
            : isHold
            ? 'border-amber-300 ring-1 ring-amber-200'
            : 'border-emerald-300'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left: Product & Manufacturer Specification */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                Batch #{batch.batchNumber}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isCritical
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : isHold
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {isCritical ? (
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                ) : isHold ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                )}
                {batch.overallStatus}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                {batch.category}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                {batch.medicineName}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Generic: {batch.genericName} • Form: {batch.dosageForm}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  <strong>Plant:</strong> {batch.manufacturer.facility}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  <strong>Mfg:</strong> {batch.mfgDate} • <strong>Exp:</strong> {batch.expDate}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <FileCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  <strong>License:</strong> {batch.manufacturer.license}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Integrity Score Dial & Metrics */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl shrink-0">
            <div className="text-center pr-4 border-r border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Custody Score
              </div>
              <div
                className={`text-3xl font-extrabold tracking-tight font-display mt-0.5 ${
                  batch.integrityScore >= 90
                    ? 'text-emerald-600'
                    : batch.integrityScore >= 60
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {batch.integrityScore}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Verified Integrity</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Total Units</span>
                <span className="font-bold text-slate-800 text-sm font-mono">
                  {batch.totalUnitsProduced.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Suppliers</span>
                <span className="font-bold text-slate-800 text-sm font-mono">
                  {batch.totalSuppliersCount} Network Hubs
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Flagged Units</span>
                <span
                  className={`font-bold text-sm font-mono ${
                    batch.anomaliesDetected.length > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {batch.anomaliesDetected.reduce((acc, a) => acc + a.affectedUnitsCount, 0)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Handoff Seals</span>
                <span className="font-bold text-slate-800 text-sm font-mono">
                  {batch.custodyTimeline.filter((t) => t.handoffSealVerified).length}/
                  {batch.custodyTimeline.length} Verified
                </span>
              </div>
              <div className="col-span-2 sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Shipment Hash Audit</span>
                <span
                  className={`font-bold text-sm font-mono inline-flex items-center gap-1.5 ${
                    consignmentIntegrityStats.allVerified ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {consignmentIntegrityStats.allVerified ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  )}
                  {consignmentIntegrityStats.verifiedCount}/{consignmentIntegrityStats.totalCount} Shipments Hash Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Forensic Findings Narrative */}
        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-700">
          <div className="flex items-start gap-2">
            <Radio className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <strong className="text-slate-900 font-semibold">Forensic Inspector Finding:</strong>{' '}
              {batch.riskSummary}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: CROSS-SUPPLIER CONSIGNMENT BREAKDOWN */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              Cross-Supplier Consignment Breakdown ({batch.suppliers.length} Shipments Handling Batch)
            </h3>
            <p className="text-xs text-slate-500">
              Cryptographic hash verification, transit routes, and custody compliance across all distributor consignments.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {/* View switcher */}
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                type="button"
                onClick={() => setConsignmentViewMode('cards')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  consignmentViewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setConsignmentViewMode('table')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  consignmentViewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Blockchain Ledger</span>
              </button>
            </div>
            <div className="text-xs text-slate-500 font-medium hidden md:block">
              Allocation:{' '}
              <strong className="text-slate-900">
                {batch.suppliers.reduce((s, c) => s + c.assignedUnits, 0).toLocaleString()} units
              </strong>
            </div>
          </div>
        </div>

        {consignmentViewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {batch.suppliers.map((sup) => {
              const isSupQuarantined = sup.status === 'Quarantined';
              const isSupHold = sup.status === 'Hold';
              const percentOfBatch = Math.round(
                (sup.assignedUnits / batch.totalUnitsProduced) * 100
              );
              const bchainVer = getConsignmentBlockchainVerification(sup, batch);
              const isHashVerified = bchainVer.isHashVerified;

              return (
                <div
                  key={sup.consignmentId}
                  className={`bg-white rounded-xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
                    isSupQuarantined
                      ? 'border-rose-200 bg-rose-50/20'
                      : isSupHold
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono text-slate-400">
                            #{sup.consignmentId}
                          </span>
                          {sup.shipmentId && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                              <span>Shipment: {sup.shipmentId}</span>
                              {onSelectShipmentId && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectShipmentId(sup.shipmentId!);
                                  }}
                                  className="hover:underline font-bold text-[10px] cursor-pointer"
                                  title="View shipment forensic overview"
                                >
                                  ↗
                                </button>
                              )}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 font-display mt-0.5">
                          {sup.supplier}
                        </h4>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isSupQuarantined
                            ? 'bg-rose-100 text-rose-800'
                            : isSupHold
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sup.status}
                      </span>
                    </div>

                    {/* BLOCKCHAIN INTEGRITY INDICATOR */}
                    <div
                      onClick={() => setSelectedBlockchainConsignment(sup)}
                      className={`mt-3 p-2.5 rounded-lg border cursor-pointer transition-all group ${
                        isHashVerified
                          ? 'bg-emerald-50/80 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50'
                          : 'bg-rose-50/80 border-rose-200 hover:border-rose-300 hover:bg-rose-50'
                      }`}
                      title={
                        isHashVerified
                          ? 'Blockchain hash verified against master genesis root. Click to audit cryptographic proof.'
                          : 'Cryptographic hash mismatch or tamper alert detected. Click to inspect discrepancies.'
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              isHashVerified
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {isHashVerified ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-xs font-bold tracking-tight ${
                                  isHashVerified ? 'text-emerald-950' : 'text-rose-950'
                                }`}
                              >
                                {isHashVerified ? 'Hash Verified' : 'Hash Mismatch Warning'}
                              </span>
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                                  isHashVerified
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300/60'
                                    : 'bg-rose-100 text-rose-800 border-rose-300/60'
                                }`}
                              >
                                {isHashVerified ? 'Merkle Match' : 'Tamper Shield'}
                              </span>
                            </div>
                            <p
                              className={`text-[10px] font-mono truncate mt-0.5 ${
                                isHashVerified ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {isHashVerified
                                ? `Block #${bchainVer.blockNumber} • Hash: ${bchainVer.recordHash.slice(0, 14)}...`
                                : bchainVer.auditNotes}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`text-[10px] font-bold px-2 py-1 rounded shrink-0 flex items-center gap-0.5 transition-colors ${
                            isHashVerified
                              ? 'bg-white text-emerald-800 border border-emerald-200 group-hover:bg-emerald-100'
                              : 'bg-white text-rose-800 border border-rose-200 group-hover:bg-rose-100'
                          }`}
                        >
                          <span>{isHashVerified ? 'Audit Hash' : 'Inspect Alert'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Units Allocation Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">Assigned Units</span>
                        <span className="font-mono text-slate-900">
                          {sup.assignedUnits.toLocaleString()} ({percentOfBatch}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{
                            width: `${(sup.verifiedUnits / sup.assignedUnits) * 100}%`,
                          }}
                          title={`Verified: ${sup.verifiedUnits}`}
                        />
                        <div
                          className="bg-rose-500 h-full"
                          style={{
                            width: `${(sup.quarantinedUnits / sup.assignedUnits) * 100}%`,
                          }}
                          title={`Quarantined: ${sup.quarantinedUnits}`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span className="text-emerald-600 font-medium">
                          Verified: {sup.verifiedUnits.toLocaleString()}
                        </span>
                        {sup.quarantinedUnits > 0 && (
                          <span className="text-rose-600 font-bold">
                            Quarantined: {sup.quarantinedUnits.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Transit Route & Location Details */}
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Route Taken:</span>
                        <span className="font-medium text-slate-800">{sup.transitRoute}</span>
                      </div>

                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Arrival Bay:</span>
                        <span className="font-medium text-slate-700">{sup.arrivalLocation}</span>
                      </div>

                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Thermal Status:</span>
                        <span
                          className={`font-semibold ${
                            sup.tempStatus === 'Excursion Breach'
                              ? 'text-rose-600 font-bold'
                              : 'text-emerald-600'
                          }`}
                        >
                          {sup.tempStatus}
                        </span>
                      </div>

                      {sup.duplicateSerialsCount > 0 && (
                        <div className="flex justify-between items-center text-[11px] text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                          <span className="font-bold">Cloned Serials:</span>
                          <span className="font-mono font-bold">
                            {sup.duplicateSerialsCount} units flagged
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Notes & Compliance */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px]">
                      <span className="text-slate-400">Compliance: </span>
                      <strong
                        className={
                          sup.custodyComplianceScore >= 90
                            ? 'text-emerald-600'
                            : sup.custodyComplianceScore >= 60
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }
                      >
                        {sup.custodyComplianceScore}%
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSupplierFilter(sup.supplier);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Filter units</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW: SHIPMENTS & BLOCKCHAIN HASH LEDGER */
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3">Shipment / Consignment</th>
                    <th className="py-3 px-3">Distributor</th>
                    <th className="py-3 px-3">Transit Route</th>
                    <th className="py-3 px-3">Allocation</th>
                    <th className="py-3 px-3">Thermal</th>
                    <th className="py-3 px-3">Blockchain Integrity</th>
                    <th className="py-3 px-3">Block Receipt</th>
                    <th className="py-3 px-3 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batch.suppliers.map((sup) => {
                    const bchainVer = getConsignmentBlockchainVerification(sup, batch);
                    const isHashVerified = bchainVer.isHashVerified;
                    const isSupQuarantined = sup.status === 'Quarantined';
                    const isSupHold = sup.status === 'Hold';

                    return (
                      <tr
                        key={sup.consignmentId}
                        className={`hover:bg-slate-50 transition-colors ${
                          !isHashVerified ? 'bg-rose-50/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-slate-900">
                            {sup.consignmentId}
                          </div>
                          {sup.shipmentId && (
                            <span className="text-[10px] font-mono text-blue-700 block">
                              Shipment: {sup.shipmentId}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">{sup.supplier}</td>
                        <td className="py-3 px-3 max-w-[200px] truncate text-slate-600" title={sup.transitRoute}>
                          {sup.transitRoute}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span className="text-slate-900 font-bold">
                            {sup.assignedUnits.toLocaleString()}
                          </span>{' '}
                          <span className="text-slate-400 text-[11px]">
                            ({sup.verifiedUnits} passed
                            {sup.quarantinedUnits > 0 ? `, ${sup.quarantinedUnits} quarantined` : ''})
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-semibold ${
                              sup.tempStatus === 'Excursion Breach'
                                ? 'text-rose-600 font-bold'
                                : 'text-emerald-600'
                            }`}
                          >
                            {sup.tempStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => setSelectedBlockchainConsignment(sup)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                              isHashVerified
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                            }`}
                            title={
                              isHashVerified
                                ? 'Cryptographic hash verified on Ethereum Pharma L2'
                                : 'Warning Shield: Cryptographic Hash Mismatch / Tamper Alert'
                            }
                          >
                            {isHashVerified ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0 animate-pulse" />
                            )}
                            <span>{isHashVerified ? 'Hash Verified' : 'Hash Mismatch Warning'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                          Block #{bchainVer.blockNumber}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedBlockchainConsignment(sup)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-[11px] cursor-pointer"
                          >
                            Audit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: END-TO-END CHAIN-OF-CUSTODY TIMELINE & ROUTE GRAPH */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-600" />
              Chain-of-Custody Timeline & Transfer Handoff Nodes
            </h3>
            <p className="text-xs text-slate-500">
              Interactive forensic timeline from manufacturer synthesis to final dispensing dock. Click any waypoint node to view IoT telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Verified Handoff
            </span>
            <span className="flex items-center gap-1 text-slate-500 ml-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Detour / Anomaly
            </span>
            <span className="flex items-center gap-1 text-slate-500 ml-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Breach / Cloned
            </span>
          </div>
        </div>

        {/* Step-by-Step Interactive Custody Nodes */}
        <div className="relative pt-2">
          {/* Connecting Track Line */}
          <div className="hidden lg:block absolute top-[44px] left-[5%] right-[5%] h-1 bg-slate-200 -z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative z-10">
            {batch.custodyTimeline.map((node, i) => {
              const isBreach = node.status === 'breach';
              const isAnomaly = node.status === 'anomaly';
              const isMissing = node.status === 'missing';
              const isPassed = node.status === 'verified';
              const isSelected = activeCustodyNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setActiveCustodyNode(node)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'ring-2 ring-blue-500 shadow-md bg-blue-50/20'
                      : isBreach
                      ? 'border-rose-300 bg-rose-50/30 hover:border-rose-400'
                      : isAnomaly
                      ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400'
                      : isMissing
                      ? 'border-slate-300 bg-slate-100 hover:border-slate-400'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Node Pin & Step Indicator */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                          isBreach
                            ? 'bg-rose-600 text-white'
                            : isAnomaly
                            ? 'bg-amber-500 text-white'
                            : isMissing
                            ? 'bg-slate-400 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {i + 1}
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isBreach
                            ? 'bg-rose-100 text-rose-800'
                            : isAnomaly
                            ? 'bg-amber-100 text-amber-800'
                            : isMissing
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {node.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 font-display leading-snug">
                      {node.stageName}
                    </h4>

                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{node.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{node.location}</span>
                      </div>
                    </div>

                    <p className="mt-2 text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                      {node.notes}
                    </p>
                  </div>

                  {/* Node Bottom Telemetry Tags */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    {node.tempRange ? (
                      <span
                        className={`flex items-center gap-1 font-mono font-semibold ${
                          node.tempRange.isBreached ? 'text-rose-600' : 'text-slate-600'
                        }`}
                      >
                        <Thermometer className="w-3 h-3" />
                        {node.tempRange.current}°C
                      </span>
                    ) : (
                      <span className="text-slate-400">Ambient</span>
                    )}

                    <span className="font-mono text-slate-400 text-[10px] truncate max-w-[90px]">
                      {node.blockchainHash.slice(0, 10)}...
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Custody Node Expanded Telemetry Drawer */}
        {activeCustodyNode && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in-50 duration-150">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                    Node Telemetry Inspection
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-display">
                    {activeCustodyNode.stageName}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Operating Actor:</strong> {activeCustodyNode.actor} •{' '}
                  <strong>Consignments Involved:</strong>{' '}
                  {activeCustodyNode.supplierInvolved || 'All Suppliers'}
                </p>
              </div>

              <button
                onClick={() => setActiveCustodyNode(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Close ×
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-200 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block">GPS Waypoint Coordinates</span>
                <span className="font-mono font-bold text-slate-800">
                  {activeCustodyNode.gpsCoordinates || '28.6139° N, 77.2090° E'}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Tamper Seal Integrity</span>
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    activeCustodyNode.handoffSealVerified ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {activeCustodyNode.handoffSealVerified ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {activeCustodyNode.handoffSealVerified
                    ? 'Cryptographically Valid'
                    : 'Seal Compromised / Missing'}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Blockchain Block Height</span>
                <span className="font-mono font-bold text-slate-800">
                  #{activeCustodyNode.blockNumber > 0 ? activeCustodyNode.blockNumber : 'N/A'}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] block">IoT Environmental Humidity</span>
                <span className="font-mono font-bold text-slate-800">
                  {activeCustodyNode.iotHumidity ? `${activeCustodyNode.iotHumidity}% RH` : 'Optimal (45%)'}
                </span>
              </div>
            </div>

            {activeCustodyNode.tamperEvidence && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Forensic Sensor Incident Evidence:</strong>{' '}
                  {activeCustodyNode.tamperEvidence}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: UNIT-LEVEL SERIAL NUMBER FORENSICS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-600" />
              Serialized Unit Forensics ({filteredUnits.length} Sample Units in Batch)
            </h3>
            <p className="text-xs text-slate-500">
              Inspect individual serialization records to identify duplicate scan locations, hologram reflectivity score, and on-chain identity.
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search serial number or supplier..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none w-48 sm:w-60"
              />
            </div>

            {/* Status Filter */}
            <select
              value={unitStatusFilter}
              onChange={(e) => setUnitStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white cursor-pointer"
            >
              <option value="All">All Unit Statuses</option>
              <option value="Cloned">Cloned / Duplicate Serials</option>
              <option value="Authentic">Genuine Verified</option>
              <option value="Damaged">Damaged / Anomalous</option>
            </select>

            {/* Supplier Filter */}
            <select
              value={selectedSupplierFilter}
              onChange={(e) => setSelectedSupplierFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white cursor-pointer"
            >
              <option value="All">All Suppliers</option>
              {batch.suppliers.map((s) => (
                <option key={s.supplier} value={s.supplier}>
                  {s.supplier}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Serials Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3">Unit Serial #</th>
                  <th className="py-3 px-3">Distributor / Consignment</th>
                  <th className="py-3 px-3">Forensic Status</th>
                  <th className="py-3 px-3">Shipment Hash</th>
                  <th className="py-3 px-3">First Seen Scan</th>
                  <th className="py-3 px-3">Duplicate / Clone Scan</th>
                  <th className="py-3 px-3 text-center">Hologram Sheen</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No serial numbers match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((u) => {
                    const isCloned = u.status === 'Cloned / Duplicate';
                    const isDamaged =
                      u.status === 'Cold-Chain Damaged' || u.status === 'Packaging Anomaly';
                    const isClean = u.status === 'Genuine Verified';
                    const unitConsignment = batch.suppliers.find(
                      (s) => s.consignmentId === u.consignmentId || s.supplier === u.supplier
                    );
                    const unitBchainVer = unitConsignment
                      ? getConsignmentBlockchainVerification(unitConsignment, batch)
                      : null;

                    return (
                      <tr
                        key={u.serialNumber}
                        className={`hover:bg-slate-50 transition-colors ${
                          isCloned ? 'bg-rose-50/25' : isDamaged ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {u.serialNumber}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-800">{u.supplier}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {u.consignmentId}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isCloned
                                ? 'bg-rose-100 text-rose-800'
                                : isDamaged
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {unitBchainVer ? (
                            <button
                              type="button"
                              onClick={() => unitConsignment && setSelectedBlockchainConsignment(unitConsignment)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
                                unitBchainVer.isHashVerified
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                              }`}
                              title={
                                unitBchainVer.isHashVerified
                                  ? 'Shipment record hash verified against genesis Merkle root'
                                  : 'Warning Shield: Shipment hash verification alert'
                              }
                            >
                              {unitBchainVer.isHashVerified ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              ) : (
                                <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
                              )}
                              <span>{unitBchainVer.isHashVerified ? 'Verified' : 'Hash Alert'}</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <div>{u.firstSeenLocation}</div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {u.firstSeenTime}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {u.duplicateSeenLocation ? (
                            <div className="text-rose-700 font-medium">
                              <div>{u.duplicateSeenLocation}</div>
                              <span className="text-[10px] text-rose-500 font-mono font-bold">
                                {u.duplicateSeenTime}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">None (Unique)</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-mono font-bold ${
                              u.opticalHologramScore >= 90
                                ? 'text-emerald-600'
                                : u.opticalHologramScore >= 70
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {u.opticalHologramScore}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedUnitSerial(u)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MERKLE TREE CRYPTOGRAPHIC PROOF MODAL */}
      {showMerkleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                  Cryptographic Audit
                </span>
                <h3 className="text-base font-bold text-slate-900 font-display mt-1">
                  Merkle Tree Root & Genesis Ledger Verification
                </h3>
              </div>
              <button
                onClick={() => setShowMerkleModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Every manufactured unit is hashed using SHA-256 and committed to the Ethereum Pharma Layer-2 blockchain contract at production release.
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Batch Genesis Merkle Root:</span>
                  <span className="font-bold text-blue-700 break-all">
                    0x3a9f0291e847cbb02938472910aefc8928374829374029482739482739482
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Manufacturer Signer Key:</span>
                  <span className="text-slate-800">{batch.manufacturer.name} (PKI-ECDSA-SEC256K1)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Smart Contract Registry:</span>
                  <span className="text-slate-800">0x71C8A3B8b2A24021289Ac274643F245903b11867</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Consensus Confirmed:</strong> Merkle proof verified against 48 validator nodes. Genesis data is mathematically immutable.
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowMerkleModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close Verification Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECALL BROADCAST NOTIFICATION MODAL */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                  National Safety Directive
                </span>
                <h3 className="text-base font-bold text-slate-900 font-display mt-1">
                  Broadcast Batch Quarantine Directive
                </h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              {!broadcastSent ? (
                <>
                  <p className="text-slate-600">
                    Dispatching this emergency regulatory advisory will immediately alert all 1,480 connected hospital pharmacies, licensed chemists, and distributor receiving bays holding inventory for batch:
                  </p>

                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1">
                    <div>
                      <strong>Target Batch:</strong> {batch.batchNumber} ({batch.medicineName})
                    </div>
                    <div>
                      <strong>Immediate Mandate:</strong> Halt patient dispensing, isolate units in quarantine vaults, scan and upload serial barcode audits.
                    </div>
                  </div>

                  <p className="text-slate-500 text-[11px]">
                    This action is logged in the permanent national regulatory audit trail.
                  </p>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setShowBroadcastModal(false)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setBroadcastSent(true)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Confirm & Transmit Directive</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-4 space-y-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Quarantine Directive Successfully Broadcasted
                  </h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Notification dispatched to all active chemists, hospital networks, and distributor docks. Unit POS barcode scans for batch #{batch.batchNumber} are now automatically locked.
                  </p>
                  <button
                    onClick={() => setShowBroadcastModal(false)}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INDIVIDUAL SERIAL DETAIL MODAL */}
      {selectedUnitSerial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                  Unit Serialization Forensics
                </span>
                <h3 className="text-base font-bold text-slate-900 font-display mt-1 font-mono">
                  {selectedUnitSerial.serialNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUnitSerial(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Distributor</span>
                  <span className="font-bold text-slate-800">{selectedUnitSerial.supplier}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {selectedUnitSerial.consignmentId}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Status</span>
                  <span className="font-bold text-slate-800">{selectedUnitSerial.status}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Risk: {selectedUnitSerial.riskRating}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div>
                  <span className="text-[10px] text-slate-400 block">Genesis / First Recorded Scan:</span>
                  <span className="font-medium text-slate-800">
                    {selectedUnitSerial.firstSeenLocation} ({selectedUnitSerial.firstSeenTime})
                  </span>
                </div>

                {selectedUnitSerial.duplicateSeenLocation && (
                  <div className="pt-2 border-t border-slate-200 text-rose-700">
                    <span className="text-[10px] text-rose-500 block font-bold">
                      Conflicting Clone Scan Location:
                    </span>
                    <span className="font-bold">
                      {selectedUnitSerial.duplicateSeenLocation} ({selectedUnitSerial.duplicateSeenTime})
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Optical 3D Hologram Score:</span>
                  <span className="font-bold font-mono text-slate-900">
                    {selectedUnitSerial.opticalHologramScore}%
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-slate-500">On-Chain Tx Receipt:</span>
                  <span className="font-mono text-blue-600 truncate max-w-[200px]">
                    {selectedUnitSerial.onChainTx}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedUnitSerial(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHIPMENT BLOCKCHAIN HASH VERIFICATION MODAL */}
      {selectedBlockchainConsignment && (() => {
        const sup = selectedBlockchainConsignment;
        const bchainVer = getConsignmentBlockchainVerification(sup, batch);
        const isHashVerified = bchainVer.isHashVerified;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in-50 zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isHashVerified
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {isHashVerified ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="w-6 h-6 text-rose-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isHashVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isHashVerified ? 'Hash Verified' : 'Cryptographic Mismatch Warning'}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-mono text-slate-600">
                        Consignment #{sup.consignmentId}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 font-display mt-1">
                      Shipment Blockchain Cryptographic Proof
                    </h3>
                    <p className="text-xs text-slate-500">
                      Distributor: <strong>{sup.supplier}</strong>
                      {sup.shipmentId ? ` • Shipment #${sup.shipmentId}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBlockchainConsignment(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none p-1 cursor-pointer"
                >
                  ×
                </button>
              </div>

              {/* Body Content */}
              <div className="mt-4 space-y-4 text-xs">
                {/* Status Callout */}
                <div
                  className={`p-3.5 rounded-lg border ${
                    isHashVerified
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/80 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {isHashVerified ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="font-bold text-sm">
                        {isHashVerified
                          ? '100% Cryptographic Integrity Confirmed'
                          : 'Tampering / Integrity Deviation Detected'}
                      </div>
                      <p className="text-xs leading-relaxed opacity-90">
                        {bchainVer.auditNotes}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Hash Comparison Grid */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Cryptographic SHA-256 Hash Audit
                  </span>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span>Expected Genesis Merkle Root (Factory Release):</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(bchainVer.expectedMerkleRoot)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-mono cursor-pointer"
                        >
                          {copiedHashText === bchainVer.expectedMerkleRoot ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800 break-all select-all">
                        {bchainVer.expectedMerkleRoot}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span>Computed Payload State Hash (Receiving Bay):</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(bchainVer.actualComputedHash)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-mono cursor-pointer"
                        >
                          {copiedHashText === bchainVer.actualComputedHash ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div
                        className={`p-2 rounded border font-mono text-[11px] break-all select-all ${
                          isHashVerified
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                            : 'bg-rose-50/50 border-rose-200 text-rose-800 font-bold'
                        }`}
                      >
                        {bchainVer.actualComputedHash}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-500">Hash Match Assessment:</span>
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          isHashVerified ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isHashVerified ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Zero Distance (Exact Bitwise Match)</span>
                          </>
                        ) : (
                          <>
                            <AlertOctagon className="w-3.5 h-3.5" />
                            <span>Hash Divergence (Signature Revoked)</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Consensus Ledger Details */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Distributed Ledger Consensus Proof
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Block Height</span>
                      <span className="font-mono font-bold text-slate-800">
                        #{bchainVer.blockNumber}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Network</span>
                      <span className="font-medium text-slate-800">{bchainVer.network}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 col-span-2">
                      <span className="text-[10px] text-slate-400 block">Validator Node</span>
                      <span className="font-medium text-slate-800">
                        {bchainVer.validatorNode}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 col-span-2">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-slate-400">On-Chain Transaction Hash:</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(bchainVer.txHash)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer font-mono"
                        >
                          {copiedHashText === bchainVer.txHash ? 'Copied' : 'Copy Tx'}
                        </button>
                      </div>
                      <span className="font-mono text-[11px] text-blue-700 break-all select-all block">
                        {bchainVer.txHash}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipment Units & Routing Quick Stats */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Consignment Units:</span>
                    <span className="font-bold text-slate-900">
                      {sup.assignedUnits.toLocaleString()} total ({sup.verifiedUnits} passed, {sup.quarantinedUnits} quarantined)
                    </span>
                  </div>
                  {sup.shipmentId && onSelectShipmentId && (
                    <button
                      type="button"
                      onClick={() => {
                        const sId = sup.shipmentId!;
                        setSelectedBlockchainConsignment(null);
                        onSelectShipmentId(sId);
                      }}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Shipment #{sup.shipmentId}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSupplierFilter(sup.supplier);
                    setSelectedBlockchainConsignment(null);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  Filter manifest for this supplier →
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBlockchainConsignment(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Close Proof Inspector
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
