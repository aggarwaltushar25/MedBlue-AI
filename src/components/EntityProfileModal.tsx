/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Building,
  Truck,
  Factory,
  Pill,
  MapPin,
  ShieldAlert,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  FileText,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { EntityProfile } from '../types';

interface EntityProfileModalProps {
  profile: EntityProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenIncident?: (incidentId: string) => void;
  onOpenForensics?: (batchNumber: string) => void;
}

export const EntityProfileModal: React.FC<EntityProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onOpenIncident,
  onOpenForensics,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'history' | 'relationships' | 'audit'>('overview');

  if (!isOpen || !profile) return null;

  return (
    <div
      id="entity-profile-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-white overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/95 gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                profile.type === 'store'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  : profile.type === 'supplier'
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {profile.type === 'store' ? (
                <Building className="w-5 h-5" />
              ) : profile.type === 'supplier' ? (
                <Truck className="w-5 h-5" />
              ) : (
                <Factory className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-mono text-xs font-bold text-purple-300">
                  {profile.id}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {profile.type}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    profile.status === 'Under Investigation' || profile.status === 'Suspended'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : profile.status === 'High-Risk Watchlist'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {profile.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-white truncate">
                {profile.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs font-bold overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Profile & Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('patterns')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'patterns'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recurring Patterns ({profile.recurringPatterns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Incident History ({profile.incidentsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('relationships')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'relationships'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Associated Relationships</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit History</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: OVERVIEW & METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Shipments</span>
                  <div className="font-mono text-xl font-extrabold text-white">{profile.totalShipments}</div>
                  <div className="text-[10px] text-slate-400">First observed: {profile.firstObserved}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Suspicious / Quarantined</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-extrabold text-rose-400">{profile.suspiciousShipments}</span>
                    <span className="text-xs text-slate-500 font-mono">({profile.quarantinedShipments} Q)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Last incident: {profile.lastIncident}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Risk Score</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-extrabold text-amber-400">{profile.avgRiskScore.toFixed(1)}</span>
                    <span className="text-[10px] text-slate-400">/ 100</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    {profile.riskTrend === 'increasing' ? (
                      <span className="text-rose-400 flex items-center font-bold">
                        <TrendingUp className="w-3 h-3 mr-0.5" /> Increasing
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center font-bold">
                        <TrendingDown className="w-3 h-3 mr-0.5" /> Stable/Down
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">License & Location</span>
                  <div className="font-bold text-xs text-slate-200 truncate">{profile.location}</div>
                  <div className="font-mono text-[10px] text-slate-400 truncate">{profile.licenseNumber}</div>
                </div>
              </div>

              {/* INCIDENT SUMMARY BREAKDOWN */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Incident Breakdown By Anomaly Type</span>
                  <span className="text-purple-400 font-mono">{profile.incidentCount} total events</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Duplicate Serials</span>
                    <span className="font-mono font-bold text-rose-400">{profile.incidentSummary.duplicateSerials}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Cold-Chain Breaches</span>
                    <span className="font-mono font-bold text-amber-400">{profile.incidentSummary.coldChain}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Packaging Anomalies</span>
                    <span className="font-mono font-bold text-blue-400">{profile.incidentSummary.packaging}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Batch Inconsistencies</span>
                    <span className="font-mono font-bold text-purple-400">{profile.incidentSummary.batchInconsistencies}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Missing Handoffs</span>
                    <span className="font-mono font-bold text-slate-300">{profile.incidentSummary.missingHandoffs}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">Other Failures</span>
                    <span className="font-mono font-bold text-slate-400">{profile.incidentSummary.other}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RECURRING PATTERNS */}
          {activeTab === 'patterns' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Evidence-based recurring verification anomaly patterns detected across network consignments.
              </div>

              {profile.recurringPatterns.map((pat) => (
                <div
                  key={pat.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          pat.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {pat.severity} PATTERN
                      </span>
                      <h4 className="text-sm font-bold text-white">{pat.title}</h4>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{pat.frequency}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{pat.description}</p>

                  <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 font-medium">
                    <strong>Recommendation:</strong> {pat.recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: INCIDENT HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Chronological list of all regulatory incidents associated with this entity.
              </div>

              <div className="space-y-2">
                {profile.incidentsList.map((incId) => (
                  <div
                    key={incId}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="font-mono font-bold text-purple-300">{incId}</div>
                        <div className="text-slate-400 text-[11px]">Associated Regulatory Case Record</div>
                      </div>
                    </div>

                    {onOpenIncident && (
                      <button
                        onClick={() => onOpenIncident(incId)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Open Dossier</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RELATIONSHIPS */}
          {activeTab === 'relationships' && (
            <div className="space-y-4 text-xs">
              {profile.relationships.associatedStores && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Connected Dispensing Stores
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {profile.relationships.associatedStores.map((st) => (
                      <div key={st.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-200 font-medium">{st.name}</span>
                        <span className="font-mono text-purple-400">{st.incidentsCount} incidents</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.relationships.associatedSuppliers && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Connected Distributors & Suppliers
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {profile.relationships.associatedSuppliers.map((sup) => (
                      <div key={sup.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-200 font-medium">{sup.name}</span>
                        <span className="font-mono text-amber-400">Risk {sup.riskScore}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.relationships.associatedBatches && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Associated Medicine Batches
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {profile.relationships.associatedBatches.map((b) => (
                      <div key={b.batchNumber} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-white block">{b.batchNumber}</span>
                          <span className="text-slate-400 text-[11px]">{b.medicineName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {b.status}
                          </span>
                          {onOpenForensics && (
                            <button
                              onClick={() => onOpenForensics(b.batchNumber)}
                              className="text-blue-400 hover:underline text-[11px]"
                            >
                              [Forensics]
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AUDIT HISTORY */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Official regulatory inspection and verification audit logs.
              </div>

              <div className="space-y-2 text-xs">
                {profile.auditHistory.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{item.action}</div>
                      <div className="text-slate-400 text-[11px]">Actor: {item.actor} • {item.timestamp}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 font-bold text-[10px] border border-purple-500/30">
                      {item.outcome}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-400 text-[11px]">
            MediShield AI Entity Compliance & Risk Profile • License Verified
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
