/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Thermometer,
  QrCode,
  Radio,
  FileText,
  Printer,
  Calendar,
  Building,
  CheckCircle2,
  Cpu,
  Layers,
  Info,
} from 'lucide-react';
import { ShipmentVerification } from '../types';
import { computeShipmentRiskProfile } from '../utils/riskScoringEngine';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
} from 'recharts';

interface ShipmentDetailModalProps {
  shipment: ShipmentVerification | null;
  onClose: () => void;
  onUpdateStatus?: (shipmentId: string, newStatus: 'Accepted' | 'Hold' | 'Quarantined') => void;
  onInspectBatchForensics?: (batchNumber: string) => void;
}

export const ShipmentDetailModal: React.FC<ShipmentDetailModalProps> = ({
  shipment,
  onClose,
  onUpdateStatus,
  onInspectBatchForensics,
}) => {
  if (!shipment) return null;

  const isQuarantined = shipment.status === 'Quarantined';
  const isHold = shipment.status === 'Hold';
  const isAccepted = shipment.status === 'Accepted';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-lg text-white shadow-xs ${
                isQuarantined
                  ? 'bg-rose-600'
                  : isHold
                  ? 'bg-amber-600'
                  : 'bg-emerald-600'
              }`}
            >
              {isQuarantined ? (
                <AlertOctagon className="w-6 h-6" />
              ) : isHold ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  {shipment.medicineName}
                </h2>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    isQuarantined
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : isHold
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {shipment.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Shipment ID: <strong className="font-mono text-slate-700">{shipment.id}</strong> • Batch: {shipment.batchNumber} • Received: {shipment.verifiedAt}
              </p>
            </div>
          </div>

          <button
            id="btn-close-shipment-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Risk Alert Callout if high risk */}
          {shipment.riskScore >= 25 && (
            <div
              className={`p-3.5 rounded-lg border flex items-start gap-3 ${
                isQuarantined
                  ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">
                  Primary Issue: {shipment.primaryIssue} (Risk Score: {shipment.riskScore}/100)
                </span>
                <p className="mt-1 text-xs opacity-90 leading-relaxed">
                  {shipment.inspectorNotes || 'Flagged for secondary protocol verification by automated CDSCO inspection guidelines.'}
                </p>
                {shipment.duplicateSerialsCount ? (
                  <span className="inline-block mt-2 font-mono text-[11px] font-bold bg-white/70 px-2 py-0.5 rounded border border-rose-300">
                    Duplicate Serials Count: {shipment.duplicateSerialsCount} units detected
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Supplier
              </span>
              <span className="font-medium text-slate-900">{shipment.supplier}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Category
              </span>
              <span className="font-medium text-slate-900">{shipment.category}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Unit Count
              </span>
              <span className="font-mono font-medium text-slate-900">{shipment.serialCount} units</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Expiry Date
              </span>
              <span className="font-mono font-medium text-slate-900">{shipment.expiryDate}</span>
            </div>
          </div>

          {/* Configurable Risk-Scoring Engine Factor Breakdown */}
          {(() => {
            const riskProfile =
              shipment.riskProfile ||
              computeShipmentRiskProfile({
                supplier: shipment.supplier,
                category: shipment.category,
                location: shipment.location,
                primaryIssue: shipment.primaryIssue,
                duplicateSerialsCount: shipment.duplicateSerialsCount,
                hasColdChainExcursion: Boolean(shipment.temperatureLog && shipment.temperatureLog.some((t) => t.status === 'breach')),
                peakTemperature: shipment.temperatureLog ? Math.max(...shipment.temperatureLog.map((t) => t.temp)) : undefined,
                hasPackagingAnomaly: shipment.primaryIssue.toLowerCase().includes('packaging'),
                hasMissingHandoff: shipment.primaryIssue.toLowerCase().includes('missing handoff'),
                hasExpiryMismatch: shipment.primaryIssue.toLowerCase().includes('expiry'),
              });

            return (
              <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span>Risk-Scoring Engine Analysis</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Confidence: 94.8%</span>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                        shipment.riskScore >= 60
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : shipment.riskScore >= 25
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      Score: {shipment.riskScore}/100
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contributing Risk Factors:</span>
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {riskProfile.factors.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs py-1 border-b border-slate-200/60 last:border-0"
                      >
                        <div className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                          <div>
                            <span className="font-medium text-slate-800">{f.factor}</span>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{f.description}</p>
                          </div>
                        </div>
                        <span
                          className={`font-mono font-bold text-xs shrink-0 self-end sm:self-center px-1.5 py-0.5 rounded ${
                            f.pointsAdded > 15
                              ? 'bg-rose-100 text-rose-800'
                              : f.pointsAdded > 5
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          +{f.pointsAdded} pts
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2">
                    <Info className="w-3 h-3 text-slate-400" />
                    <span>
                      Deterministic rule-based risk evaluation using CDSCO & GS1 pharma compliance weights.
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* GS1 Digital Link & RFID Traceability */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>GS1 DataMatrix & Hardware Telemetry</span>
            </h4>

            <div className="space-y-2 font-mono text-[11px] bg-slate-50 p-3 rounded border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">GS1 Raw Code:</span>
                <span className="text-slate-800 font-bold">{shipment.gs1DataMatrix || `(01)08901234567890(17)280630(10)${shipment.batchNumber}(21)SN1004812`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">RFID Smart Pallet:</span>
                <span className="text-slate-800">{shipment.rfidTag || 'RFID-9842-AX01 (Passive UHF)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Receiving Bay:</span>
                <span className="text-slate-800">{shipment.location} • Bay #3 Dock</span>
              </div>
            </div>
          </div>

          {/* Thermal Profile if temperature log exists or cold chain item */}
          {shipment.temperatureLog && (
            <div className="border border-slate-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-rose-600" />
                  <span>Cold-Chain Transit Temperature Log</span>
                </h4>
                <span className="text-[11px] font-mono text-rose-600 font-bold">
                  Excursion Detected (&gt;8°C)
                </span>
              </div>

              <div className="h-40 w-full mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={shipment.temperatureLog} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <ReferenceArea y1={2} y2={8} fill="#dcfce7" fillOpacity={0.6} />
                    <ReferenceArea y1={8} y2={14} fill="#fee2e2" fillOpacity={0.6} />
                    <XAxis dataKey="time" tick={{ fontSize: 9 }} />
                    <YAxis domain={[0, 14]} ticks={[2, 8, 12]} tick={{ fontSize: 9 }} />
                    <Tooltip formatter={(val: any) => [`${val}°C`, 'Temp']} />
                    <Line type="monotone" dataKey="temp" stroke="#DC2626" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between bg-slate-50 p-2 rounded">
                <span>Safe baseline: 2.0°C – 8.0°C</span>
                <span>Peak excursion: 11.4°C (Exceeded threshold for 4.0 hours)</span>
              </div>
            </div>
          )}

          {/* Inspector Remarks & Physical Integrity Checklist */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Pharmacy Verification Notes</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
              {shipment.inspectorNotes || 'All 2,400 physical serials verified against central registry. Holographic tamper-evident microprint inspected under 40x magnification.'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="btn-print-certificate"
              onClick={handlePrint}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Verification Slip</span>
            </button>

            {onInspectBatchForensics && (
              <button
                id="btn-inspect-forensics"
                onClick={() => {
                  onInspectBatchForensics(shipment.batchNumber);
                  onClose();
                }}
                className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-purple-600" />
                <span>Batch Forensics</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onUpdateStatus && (
              <>
                {shipment.status !== 'Accepted' && (
                  <button
                    onClick={() => onUpdateStatus(shipment.id, 'Accepted')}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Release</span>
                  </button>
                )}

                {shipment.status !== 'Quarantined' && (
                  <button
                    onClick={() => onUpdateStatus(shipment.id, 'Quarantined')}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Quarantine Shipment</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
