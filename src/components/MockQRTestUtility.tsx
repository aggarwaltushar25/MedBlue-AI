/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  QrCode,
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Radio,
  ArrowRight,
  Database,
  Layers,
  Copy,
  Check,
  Zap,
  Sliders,
  ShieldCheck,
  Building,
  Truck,
  Thermometer,
} from 'lucide-react';

export interface MockBatchScenario {
  id: string;
  label: string;
  batchNumber: string;
  shipmentId: string;
  medicineName: string;
  supplier: string;
  gtin: string;
  serialNumber: string;
  expiryDate: string;
  rawQrPayload: string;
  statusTag: string;
  statusType: 'quarantined' | 'hold' | 'warning' | 'verified';
  expectedRiskScore: number;
  anomalySummary: string;
  forensicsNote: string;
}

export const KNOWN_MOCK_SCENARIOS: MockBatchScenario[] = [
  {
    id: 'scen-amx-081',
    label: 'AMX-2026-081 • Cloned Serial Breach',
    batchNumber: 'AMX-2026-081',
    shipmentId: 'SHP-001',
    medicineName: 'Amoxicillin 500mg Capsules',
    supplier: 'MedRoute Distributors',
    gtin: '08901030048123',
    serialNumber: 'SN-1004812',
    expiryDate: '2027-11-30',
    rawQrPayload: '(01)08901030048123(17)271130(10)AMX-2026-081(21)SN-1004812',
    statusTag: 'Quarantined',
    statusType: 'quarantined',
    expectedRiskScore: 82,
    anomalySummary: 'Duplicate serial numbers active across 3 distinct geographical dispensing depots.',
    forensicsNote: 'Cross-supplier forensics links 8,000 compromised units to MedRoute transit hub.',
  },
  {
    id: 'scen-cov-902',
    label: 'COV-VAX-902 • Cold-Chain Excursion',
    batchNumber: 'COV-VAX-902',
    shipmentId: 'SHP-003',
    medicineName: 'Covaxin Booster Vials (2-8°C)',
    supplier: 'BioLogix Logistics',
    gtin: '08902040059124',
    serialNumber: 'SN-902-1402',
    expiryDate: '2027-04-15',
    rawQrPayload: '(01)08902040059124(17)270415(10)COV-VAX-902(21)SN-902-1402',
    statusTag: 'Hold (11.4°C Excursion)',
    statusType: 'hold',
    expectedRiskScore: 68,
    anomalySummary: 'Thermal data logger registered 11.4°C peak breach for 4.2h during transit.',
    forensicsNote: 'Reefer consignment CON-COV-102 quarantined; custody timeline shows route delay on NH-48.',
  },
  {
    id: 'scen-lant-044',
    label: 'LANT-2026-044 • Optical Hologram Flag',
    batchNumber: 'LANT-2026-044',
    shipmentId: 'SHP-004',
    medicineName: 'Lantus SoloStar Insulin Glargine',
    supplier: 'PharmaDirect',
    gtin: '08903050060125',
    serialNumber: 'SN-LANT-881',
    expiryDate: '2028-01-20',
    rawQrPayload: '(01)08903050060125(17)280120(10)LANT-2026-044(21)SN-LANT-881',
    statusTag: 'Attention (Optical)',
    statusType: 'warning',
    expectedRiskScore: 45,
    anomalySummary: 'Diffractive OVD tamper band returned 42% iridescence score vs 70% threshold.',
    forensicsNote: 'Batch split between PharmaDirect and MedSupply Co.; secondary consignment flagged.',
  },
  {
    id: 'scen-gsk-441',
    label: 'GSK-2026-441B • Genuine Pristine Batch',
    batchNumber: 'GSK-2026-441B',
    shipmentId: 'SHP-002',
    medicineName: 'Augmentin 625 Duo Oral Strip',
    supplier: 'Apex Pharma Supply',
    gtin: '08901030048123',
    serialNumber: 'SN-908234-118',
    expiryDate: '2026-12-31',
    rawQrPayload: '(01)08901030048123(17)261231(10)GSK-2026-441B(21)SN-908234-118',
    statusTag: 'Verified Genuine',
    statusType: 'verified',
    expectedRiskScore: 4,
    anomalySummary: 'Zero anomalies. Cryptographic Merkle root verified on Ethereum Pharma L2.',
    forensicsNote: 'Direct manufacturer pedigree from GlaxoSmithKline with 100% compliant custody logs.',
  },
];

interface MockQRTestUtilityProps {
  onSimulateScan: (qrPayload: string) => void;
  isSimulating?: boolean;
}

export const MockQRTestUtility: React.FC<MockQRTestUtilityProps> = ({
  onSimulateScan,
  isSimulating = false,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(KNOWN_MOCK_SCENARIOS[0].id);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customBatch, setCustomBatch] = useState('AMX-2026-081');
  const [customShipment, setCustomShipment] = useState('SHP-001');
  const [customGtin, setCustomGtin] = useState('08901030048123');
  const [customSerial, setCustomSerial] = useState('SN-CUSTOM-992');
  const [customExpiry, setCustomExpiry] = useState('2027-11-30');
  const [copiedPayload, setCopiedPayload] = useState(false);

  const activeScenario = KNOWN_MOCK_SCENARIOS.find((s) => s.id === selectedScenarioId) || KNOWN_MOCK_SCENARIOS[0];

  const currentPayload = isCustomMode
    ? `(01)${customGtin}(17)${customExpiry.replace(/-/g, '').slice(2)}(10)${customBatch.toUpperCase().trim()}(21)${customSerial.trim()}`
    : activeScenario.rawQrPayload;

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(currentPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleTriggerSimulate = () => {
    onSimulateScan(currentPayload);
  };

  return (
    <div
      id="mock-qr-test-utility"
      className="bg-slate-950/95 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
              <span>Mock QR Optical Scan Testing Utility</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Interactive Simulator
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Simulates physical camera optical detection of GS1 2D DataMatrix codes with linked batch & shipment forensics.
            </p>
          </div>
        </div>

        {/* Mode Toggle: Preset vs Custom */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsCustomMode(false)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              !isCustomMode
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Known Scenarios
          </button>
          <button
            type="button"
            onClick={() => setIsCustomMode(true)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isCustomMode
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Mock QR
          </button>
        </div>
      </div>

      {/* Main Grid: Scenario Selector & Visual QR Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left: Scenarios or Custom Inputs (7 cols) */}
        <div className="md:col-span-7 space-y-2.5">
          {!isCustomMode ? (
            <>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Select Test Batch & Shipment Profile</span>
              </div>

              <div className="space-y-2">
                {KNOWN_MOCK_SCENARIOS.map((scen) => {
                  const isSelected = scen.id === selectedScenarioId;
                  return (
                    <div
                      key={scen.id}
                      onClick={() => setSelectedScenarioId(scen.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500/60 shadow-md ring-1 ring-purple-500/30'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              scen.statusType === 'quarantined'
                                ? 'bg-rose-400 animate-pulse'
                                : scen.statusType === 'hold'
                                ? 'bg-amber-400'
                                : scen.statusType === 'warning'
                                ? 'bg-purple-400'
                                : 'bg-emerald-400'
                            }`}
                          />
                          <span className="font-mono text-xs font-bold text-white truncate">
                            {scen.batchNumber}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            (Shipment: {scen.shipmentId})
                          </span>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            scen.statusType === 'quarantined'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : scen.statusType === 'hold'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : scen.statusType === 'warning'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {scen.statusTag}
                        </span>
                      </div>

                      <div className="text-xs font-medium text-slate-200 mb-1">
                        {scen.medicineName} • <span className="text-slate-400">{scen.supplier}</span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-1">
                        {scen.anomalySummary}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Custom Mock QR Builder */
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
              <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Configure Mock DataMatrix Parameters</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Batch Code (AI 10)
                  </label>
                  <input
                    type="text"
                    value={customBatch}
                    onChange={(e) => setCustomBatch(e.target.value)}
                    placeholder="e.g., AMX-2026-081"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Shipment ID
                  </label>
                  <input
                    type="text"
                    value={customShipment}
                    onChange={(e) => setCustomShipment(e.target.value)}
                    placeholder="e.g., SHP-001"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    GTIN-14 (AI 01)
                  </label>
                  <input
                    type="text"
                    value={customGtin}
                    onChange={(e) => setCustomGtin(e.target.value)}
                    placeholder="e.g., 08901030048123"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Serial Number (AI 21)
                  </label>
                  <input
                    type="text"
                    value={customSerial}
                    onChange={(e) => setCustomSerial(e.target.value)}
                    placeholder="e.g., SN-1004812"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Expiry Date (AI 17)
                </label>
                <input
                  type="date"
                  value={customExpiry}
                  onChange={(e) => setCustomExpiry(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-hidden focus:border-purple-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Mock QR Visualizer & Simulation Trigger (5 cols) */}
        <div className="md:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between h-full space-y-3">
          {/* Simulated 2D Matrix Visual Card */}
          <div className="flex flex-col items-center text-center p-3 rounded-lg bg-slate-950/80 border border-slate-800 relative overflow-hidden group">
            {/* Laser scan animation when simulating */}
            {isSimulating && (
              <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none z-10 flex flex-col justify-center items-center">
                <div className="w-full h-1 bg-emerald-400 shadow-[0_0_10px_#10b981] animate-bounce" />
              </div>
            )}

            {/* Stylized QR Matrix Representation */}
            <div className="w-24 h-24 bg-white p-2 rounded-lg border-2 border-slate-200 flex flex-col justify-between shadow-md relative mb-2">
              <div className="flex justify-between">
                <div className="w-5 h-5 bg-slate-950 border-2 border-white rounded-xs" />
                <div className="w-5 h-5 bg-slate-950 border-2 border-white rounded-xs" />
              </div>
              <div className="flex items-center justify-center">
                <QrCode className="w-8 h-8 text-slate-950" />
              </div>
              <div className="flex justify-between">
                <div className="w-5 h-5 bg-slate-950 border-2 border-white rounded-xs" />
                <div className="w-2 h-2 bg-slate-950 self-end" />
              </div>
            </div>

            <span className="font-mono text-[11px] font-bold text-purple-300">
              {isCustomMode ? customBatch.toUpperCase() : activeScenario.batchNumber}
            </span>
            <span className="text-[10px] text-slate-400">
              {isCustomMode ? `Shipment: ${customShipment}` : `Shipment: ${activeScenario.shipmentId}`}
            </span>
          </div>

          {/* Raw Payload Display with Copy Action */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="uppercase font-bold">GS1 DataMatrix Payload</span>
              <button
                type="button"
                onClick={handleCopyPayload}
                className="flex items-center gap-1 text-purple-300 hover:text-purple-200 font-medium cursor-pointer"
              >
                {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPayload ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-slate-300 break-all leading-relaxed">
              {currentPayload}
            </div>
          </div>

          {/* Action Button: Simulate Scan & Trigger Lookup */}
          <button
            id="btn-simulate-mock-scan"
            type="button"
            onClick={handleTriggerSimulate}
            disabled={isSimulating}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 transition-all transform active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current text-purple-200" />
            <span>{isSimulating ? 'Simulating Optical Scan...' : 'Simulate Scan & Trigger Forensics'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-purple-200" />
          </button>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>Triggers automated query against CDSCO gateway, Merkle tree & multi-supplier ledger</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Instant Forensics View Ready</span>
        </div>
      </div>
    </div>
  );
};
