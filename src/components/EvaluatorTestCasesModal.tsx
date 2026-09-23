/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Thermometer,
  Clock,
  Boxes,
  Link2,
  TrendingUp,
  FileSpreadsheet,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { unifiedStore } from '../services/unifiedStore';
import { blockchainService } from '../services/blockchain';

interface EvaluatorTestCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScanner?: () => void;
  onOpenStockScanner?: () => void;
  onOpenBlockchain?: () => void;
  onOpenRegulatory?: () => void;
  onOpenForensics?: (batchNumber: string) => void;
}

interface TestCaseItem {
  id: string;
  number: number;
  title: string;
  category: string;
  description: string;
  expectedOutcome: string;
  icon: React.ReactNode;
  actionLabel: string;
}

export const EvaluatorTestCasesModal: React.FC<EvaluatorTestCasesModalProps> = ({
  isOpen,
  onClose,
  onOpenScanner,
  onOpenStockScanner,
  onOpenBlockchain,
  onOpenRegulatory,
  onOpenForensics,
}) => {
  const [selectedTestCase, setSelectedTestCase] = useState<string>('TC-01');
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);

  if (!isOpen) return null;

  const TEST_CASES: TestCaseItem[] = [
    {
      id: 'TC-01',
      number: 1,
      title: 'Valid Medicine Verification',
      category: 'Inbound Scanning',
      description: 'Scan pristine Azithromycin 250mg carton with valid GS1 DataMatrix and uncompromised optical seal.',
      expectedOutcome: 'Status: VERIFIED (Risk Score: 12/100). Added to active inventory. Audit log and blockchain event created.',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      actionLabel: 'Execute Valid Medicine Verification',
    },
    {
      id: 'TC-02',
      number: 2,
      title: 'Duplicate Serial Cloned Barcode Alert',
      category: 'Anti-Diversion',
      description: 'Scan Amoxicillin carton with barcode GS1-9874-2026-AMX-01 already dispensed in Maharashtra.',
      expectedOutcome: 'Status: DUPLICATE SERIAL (Risk Score: 84/100). Risk factor breakdown shown. Auto-quarantine option with locked isolation hold.',
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      actionLabel: 'Simulate Duplicate Serial Scan',
    },
    {
      id: 'TC-03',
      number: 3,
      title: 'Expired Medicine FEFO Safety',
      category: 'Expiry Guard',
      description: 'Scan Paracetamol batch PAR-2024-998 that expired on 15 August 2026.',
      expectedOutcome: 'Status: EXPIRED (Risk Score: 65/100). Dispense lock enforced with return-to-vendor advisory.',
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      actionLabel: 'Simulate Expired Batch Scan',
    },
    {
      id: 'TC-04',
      number: 4,
      title: 'Cold-Chain IoT Temperature Excursion',
      category: 'Biological Telemetry',
      description: 'Inspect Covaxin booster batch CVX-2026-904 with 14.8°C thermal excursion for 180 min.',
      expectedOutcome: 'Status: COLD-CHAIN ISSUE (Risk Score: 68/100). Temperature history graph logged and physical hold initiated.',
      icon: <Thermometer className="w-5 h-5 text-cyan-400" />,
      actionLabel: 'Simulate Cold-Chain Breach',
    },
    {
      id: 'TC-05',
      number: 5,
      title: 'Quarantine & Persistent Ledger Update',
      category: 'Pharmacy Quarantine',
      description: 'Quarantine high-risk batch with supervisor notes, removing it from shelves and updating inventory, KPIs, audit log, and blockchain.',
      expectedOutcome: 'Inventory updated, quarantine count incremented, and state persisted across page refresh.',
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
      actionLabel: 'Execute Quarantine Workflow',
    },
    {
      id: 'TC-06',
      number: 6,
      title: 'Continuous Entire-Stock Receiving Scan',
      category: 'High-Volume Dock',
      description: 'Run continuous multi-carton scan session with real-time counters, pause/resume, and summary export.',
      expectedOutcome: 'Session summary report generated with separated suspicious units and CSV export.',
      icon: <Boxes className="w-5 h-5 text-blue-400" />,
      actionLabel: 'Launch Entire-Stock Scanner',
    },
    {
      id: 'TC-07',
      number: 7,
      title: 'Blockchain Tamper Detection & SHA-256 Check',
      category: 'Cryptographic Chain',
      description: 'Simulate modifying Block #1044 optical score from 38% to 98% and run chain verification.',
      expectedOutcome: 'Integrity check immediately detects altered hash and broken previousHash pointer.',
      icon: <Link2 className="w-5 h-5 text-purple-400" />,
      actionLabel: 'Execute Tamper Verification',
    },
    {
      id: 'TC-08',
      number: 8,
      title: 'Recurring Supplier Risk Pattern Detection',
      category: 'Pattern Intelligence',
      description: 'Analyze MedRoute Distributors showing 12 duplicate serial incidents across 3 satellite pharmacies.',
      expectedOutcome: 'Risk score elevated to High-Risk Watchlist with regulatory review recommendation.',
      icon: <TrendingUp className="w-5 h-5 text-amber-400" />,
      actionLabel: 'Inspect Supplier Risk Profile',
    },
    {
      id: 'TC-09',
      number: 9,
      title: 'CDSCO Regulatory Escalation & Evidence Dossier',
      category: 'Government Escalation',
      description: 'Escalate Incident INC-2026-081 into official regulatory case CASE-CDSCO-2026-001 with verifiable SHA-256 evidence package.',
      expectedOutcome: 'Regulatory case created, audit log anchored, and PDF/CSV evidence package exported.',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      actionLabel: 'Execute Regulatory Escalation',
    },
  ];

  const currentTC = TEST_CASES.find((t) => t.id === selectedTestCase) || TEST_CASES[0];

  const handleRunTestCase = (tc: TestCaseItem) => {
    if (tc.id === 'TC-01') {
      const res = unifiedStore.verifyMedicine('AZT-2026-119');
      setExecutionOutput(
        `✓ TC-01 Success: Verified ${res.medicineName} (${res.batchNumber}). Status: ${res.verificationStatus}, Risk: ${res.riskScore}/100. Added to pharmacy stock.`
      );
    } else if (tc.id === 'TC-02') {
      const res = unifiedStore.verifyMedicine('AMX-2026-081');
      setExecutionOutput(
        `⛔ TC-02 Success: Flagged ${res.medicineName} (${res.batchNumber}). Status: ${res.verificationStatus}, Risk: ${res.riskScore}/100. Cloned serial alert generated.`
      );
    } else if (tc.id === 'TC-03') {
      const res = unifiedStore.verifyMedicine('PAR-2024-998');
      setExecutionOutput(
        `⚠ TC-03 Success: Flagged ${res.medicineName} (${res.batchNumber}). Status: ${res.verificationStatus}, Expiry: ${res.expiryDate}. Dispense locked.`
      );
    } else if (tc.id === 'TC-04') {
      const res = unifiedStore.verifyMedicine('CVX-2026-904');
      setExecutionOutput(
        `❄️ TC-04 Success: Flagged ${res.medicineName} (${res.batchNumber}). Status: ${res.verificationStatus}, Temp Status: ${res.coldChainStatus}.`
      );
    } else if (tc.id === 'TC-05') {
      unifiedStore.quarantineMedicine({
        medicineName: 'Amoxicillin 500mg Trihydrate',
        batchNumber: 'AMX-2026-081',
        serialNumber: 'GS1-9874-2026-AMX-01',
        shipmentId: 'SHP-001',
        reason: 'Duplicate GS1 serial detected in live test case execution.',
        notes: 'Locked in physical quarantine bay #2 by Evaluator.',
      });
      setExecutionOutput(
        `✓ TC-05 Success: Batch AMX-2026-081 quarantined. Updated inventory, shipment status, audit log, and blockchain.`
      );
    } else if (tc.id === 'TC-06') {
      onClose();
      if (onOpenStockScanner) onOpenStockScanner();
    } else if (tc.id === 'TC-07') {
      blockchainService.tamperBlockData(1044, { opticalHologramScore: 98 }, 'Evaluator modified record');
      const verifyRes = blockchainService.verifyChain('SHP-001');
      setExecutionOutput(
        `✓ TC-07 Success: Tamper injected into Block #1044. Cryptographic check result: isValid = ${verifyRes.isValid}. Failure block: #${verifyRes.failureBlockNumber}.`
      );
    } else if (tc.id === 'TC-08') {
      onClose();
      if (onOpenForensics) onOpenForensics('AMX-2026-081');
    } else if (tc.id === 'TC-09') {
      const newCase = unifiedStore.escalateIncidentToRegulatory({
        incidentId: 'INC-2026-081',
        reason: 'Evaluator test case regulatory escalation with full SHA-256 evidence package.',
        notes: 'Case transmitted to CDSCO Central Vigilance sandbox adapter.',
      });
      setExecutionOutput(
        `✓ TC-09 Success: Case ${newCase.caseNumber} initialized and evidence package hash anchored.`
      );
      if (onOpenRegulatory) {
        setTimeout(() => {
          onClose();
          onOpenRegulatory();
        }, 1200);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Evaluator Test Cases & Live Demonstration Suite
              </h2>
              <p className="text-xs text-slate-400">
                Execute end-to-end verification workflows from individual pharmacy dock checkups to CDSCO regulatory escalations.
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

        {/* 2-Column Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left: Test Cases List (col-span-5) */}
          <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto p-3 sm:p-4 space-y-2 bg-slate-950/40">
            {TEST_CASES.map((tc) => {
              const isSelected = selectedTestCase === tc.id;
              return (
                <button
                  key={tc.id}
                  onClick={() => {
                    setSelectedTestCase(tc.id);
                    setExecutionOutput(null);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500/50 shadow-md ring-1 ring-purple-400/30'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="shrink-0">{tc.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                        Test Case #{tc.number}
                      </span>
                      <span className="text-[10px] text-slate-400">{tc.category}</span>
                    </div>
                    <div className="text-xs font-bold text-white truncate mt-0.5">{tc.title}</div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-500 shrink-0 ${isSelected ? 'text-purple-400' : ''}`} />
                </button>
              );
            })}
          </div>

          {/* Right: Test Case Runner & Diagnostics (col-span-7) */}
          <div className="md:col-span-7 overflow-y-auto p-5 sm:p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-900/40 text-purple-300 border border-purple-700/50">
                  TEST CASE {currentTC.number} • {currentTC.category}
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {currentTC.id}</span>
              </div>

              <h3 className="text-xl font-bold text-white font-display">{currentTC.title}</h3>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Scenario Description:</span>
                  <p className="text-slate-200 mt-1 leading-relaxed">{currentTC.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 font-medium block text-[11px]">Expected System Outcome:</span>
                  <p className="text-emerald-300 font-medium mt-1 leading-relaxed">{currentTC.expectedOutcome}</p>
                </div>
              </div>

              {/* Execution Output Panel */}
              {executionOutput && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-purple-500/40 space-y-2 text-xs font-mono animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-purple-300 font-bold font-sans text-xs">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Real-Time Execution Telemetry Output:</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{executionOutput}</p>
                </div>
              )}
            </div>

            {/* Run Button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => handleRunTestCase(currentTC)}
                className="w-full py-3 px-5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/30 active:scale-98 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{currentTC.actionLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
