/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Building,
  Truck,
  Factory,
  Pill,
  Clock,
  FileText,
  User,
  ExternalLink,
  ChevronRight,
  Printer,
  Download,
  Share2,
  ShieldCheck,
  Thermometer,
  Layers,
  ArrowRight,
  Database,
  Radio,
  Send,
  AlertOctagon,
  RefreshCw,
  QrCode,
  Check,
} from 'lucide-react';
import { RegulatoryIncident, IncidentStatus } from '../types';

interface IncidentDetailModalProps {
  incident: RegulatoryIncident | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (incidentId: string, newStatus: IncidentStatus, notes: string) => void;
  onOpenEntityProfile?: (entityId: string, entityType: 'store' | 'supplier' | 'manufacturer') => void;
  onOpenRelatedIncident?: (incidentId: string) => void;
  onOpenForensics?: (batchNumber: string) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  isOpen,
  onClose,
  onUpdateStatus,
  onOpenEntityProfile,
  onOpenRelatedIncident,
  onOpenForensics,
}) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'timeline' | 'entities' | 'regulatory_action'>('evidence');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState<IncidentStatus>(
    incident?.status || 'UNDER REVIEW'
  );
  const [statusUpdateNotes, setStatusUpdateNotes] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !incident) return null;

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateStatus) {
      onUpdateStatus(incident.id, selectedNewStatus, statusUpdateNotes);
    }
    setIsUpdatingStatus(false);
    setStatusUpdateNotes('');
  };

  const handleExportEvidencePackage = () => {
    const jsonStr = JSON.stringify(incident, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MediShield_Evidence_Package_${incident.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#incidents:${incident.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      id="incident-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-white overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/95 gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                incident.severity === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : incident.severity === 'HIGH'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
              }`}
            >
              {incident.severity === 'CRITICAL' ? (
                <AlertOctagon className="w-5 h-5" />
              ) : incident.severity === 'HIGH' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-mono text-xs font-extrabold text-purple-300">
                  {incident.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    incident.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : incident.severity === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}
                >
                  {incident.severity} SEVERITY
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    incident.status === 'ESCALATED'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 animate-pulse'
                      : incident.status === 'INVESTIGATION'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : incident.status === 'ACTION TAKEN'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : incident.status === 'CLOSED'
                      ? 'bg-slate-700/50 text-slate-300 border-slate-600'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}
                >
                  {incident.status}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {incident.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handleCopyShareLink}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy link to this incident"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={handleExportEvidencePackage}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Export Official Evidence Package Dossier"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Evidence Package</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs font-bold overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'evidence'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Evidence & Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Evidence Timeline ({incident.timeline.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('entities')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'entities'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Affected Entities & Product</span>
          </button>

          <button
            onClick={() => setActiveTab('regulatory_action')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'regulatory_action'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Regulatory Decision & Status</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Quick Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Medicine & Batch</span>
              <div className="font-bold text-white truncate">{incident.medicine.name}</div>
              <div className="font-mono text-purple-300 text-[11px] flex items-center gap-1">
                <span>{incident.batchNumber}</span>
                {onOpenForensics && (
                  <button
                    onClick={() => onOpenForensics(incident.batchNumber)}
                    className="text-blue-400 hover:underline inline-flex items-center text-[10px]"
                  >
                    [Forensics]
                  </button>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Reporting Store</span>
              <div className="font-semibold text-slate-200 truncate">{incident.store.name}</div>
              <div className="text-slate-400 text-[11px]">{incident.store.location}</div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Supplier & Shipment</span>
              <div className="font-semibold text-slate-200 truncate">{incident.supplier.name}</div>
              <div className="font-mono text-slate-400 text-[11px]">{incident.shipmentId}</div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Score</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-base text-rose-400">
                  {incident.riskScore}/100
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                  HIGH RISK
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Created {new Date(incident.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* TAB 1: EVIDENCE & ANALYSIS */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              {/* Detection Reason Box */}
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  <span>Detection Reason & Anomaly Trigger</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {incident.detectionReason}
                </p>
              </div>

              {/* Detailed Supporting Evidence Records */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  <span>Verified Supporting Evidence Records</span>
                </h3>
                <div className="space-y-2">
                  {incident.evidence.verificationRecords.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono text-slate-300 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">{rec}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duplicate Serials List if available */}
              {incident.evidence.duplicateSerialsList && incident.evidence.duplicateSerialsList.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      <span>Cloned GS1 Serial Identifiers Flagged</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {incident.evidence.duplicateSerialsList.length} items logged
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {incident.evidence.duplicateSerialsList.map((sn, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800 text-rose-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                        <span className="truncate">{sn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Temperature History if available */}
              {incident.evidence.temperatureHistory && incident.evidence.temperatureHistory.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    <span>Cold-Chain IoT Temperature History</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                    {incident.evidence.temperatureHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg border text-center ${
                          item.status === 'breach'
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="font-mono font-bold text-sm">{item.temp}°C</div>
                        <div className="text-[9px] font-bold uppercase">{item.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Packaging & Supplier History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {incident.evidence.packagingObservations && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                      Packaging & Hologram Inspection
                    </div>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                      {incident.evidence.packagingObservations.map((obs, idx) => (
                        <li key={idx} className="leading-relaxed">{obs}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {incident.evidence.supplierHistorySummary && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                      Supplier Historical Profile
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {incident.evidence.supplierHistorySummary}
                    </p>
                  </div>
                )}
              </div>

              {/* Related Incidents */}
              {incident.relatedIncidents && incident.relatedIncidents.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center justify-between">
                    <span>Related Incident Dossiers In Network</span>
                    <span className="text-purple-400">{incident.relatedIncidents.length} linked cases</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {incident.relatedIncidents.map((relId) => (
                      <button
                        key={relId}
                        type="button"
                        onClick={() => onOpenRelatedIncident && onOpenRelatedIncident(relId)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-300 hover:text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{relId}</span>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHRONOLOGICAL EVIDENCE TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Immutable chronological event trail registered by dock scanners, automated risk engines, and regulatory inspectors.
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {incident.timeline.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative group">
                    {/* Dot */}
                    <div
                      className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-slate-950 ${
                        evt.statusChange
                          ? 'border-purple-500 text-purple-400'
                          : 'border-blue-500 text-blue-400'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 text-xs space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-white text-sm">
                          {evt.action}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-slate-300 font-medium">
                        <strong className="text-purple-300">{evt.actor}</strong> ({evt.actorType})
                      </div>

                      {evt.reason && (
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          {evt.reason}
                        </p>
                      )}

                      {evt.statusChange && (
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-[11px] font-bold text-purple-300">
                          <span>Status: {evt.statusChange.from}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span>{evt.statusChange.to}</span>
                        </div>
                      )}

                      {evt.hashProof && (
                        <div className="font-mono text-[10px] text-slate-500 truncate pt-1">
                          Hash Proof: {evt.hashProof}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AFFECTED ENTITIES & PRODUCT */}
          {activeTab === 'entities' && (
            <div className="space-y-4">
              {/* Product Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    <span>Product & Batch Details</span>
                  </div>
                  {onOpenForensics && (
                    <button
                      onClick={() => onOpenForensics(incident.batchNumber)}
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <span>Open Multi-Supplier Batch Forensics</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Medicine</span>
                    <div className="font-bold text-white">{incident.medicine.name}</div>
                    <div className="text-[11px] text-slate-400">{incident.medicine.genericName}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Category</span>
                    <div className="text-slate-200 font-medium">{incident.medicine.category}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">GTIN-14</span>
                    <div className="font-mono text-purple-300">{incident.medicine.gtin}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Batch Number</span>
                    <div className="font-mono font-bold text-white">{incident.batchNumber}</div>
                  </div>
                </div>
              </div>

              {/* Entity Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Store */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>Dispensing Store</span>
                  </div>
                  <div className="font-bold text-white">{incident.store.name}</div>
                  <div className="text-slate-400 text-[11px]">{incident.store.location}</div>
                  <div className="font-mono text-[10px] text-slate-500">Lic: {incident.store.licenseNumber}</div>
                  <div className="text-[11px] text-slate-300">Mgr: {incident.store.manager}</div>
                  {onOpenEntityProfile && (
                    <button
                      onClick={() => onOpenEntityProfile(incident.store.id, 'store')}
                      className="mt-2 text-blue-400 hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Store Profile</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Supplier */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Distributor / Supplier</span>
                  </div>
                  <div className="font-bold text-white">{incident.supplier.name}</div>
                  <div className="text-slate-400 text-[11px]">{incident.supplier.location}</div>
                  <div className="font-mono text-[10px] text-slate-500">Lic: {incident.supplier.licenseNumber}</div>
                  <div className="text-[11px] text-slate-300">{incident.supplier.contactEmail}</div>
                  {onOpenEntityProfile && (
                    <button
                      onClick={() => onOpenEntityProfile(incident.supplier.id, 'supplier')}
                      className="mt-2 text-purple-400 hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Supplier Profile</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Manufacturer */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Factory className="w-3.5 h-3.5" />
                    <span>Manufacturer</span>
                  </div>
                  <div className="font-bold text-white">{incident.manufacturer.name}</div>
                  <div className="text-slate-400 text-[11px]">{incident.manufacturer.facility}</div>
                  <div className="font-mono text-[10px] text-slate-500">Lic: {incident.manufacturer.license}</div>
                  {onOpenEntityProfile && (
                    <button
                      onClick={() => onOpenEntityProfile(incident.manufacturer.id || 'MFG-GSK', 'manufacturer')}
                      className="mt-2 text-emerald-400 hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Mfg Profile</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REGULATORY DECISION & STATUS UPDATE */}
          {activeTab === 'regulatory_action' && (
            <div className="space-y-4">
              {/* Assigned Reviewer Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Assigned Regulatory Reviewer</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-bold text-white text-sm">{incident.assignedReviewer.name}</div>
                    <div className="text-slate-300 font-medium">{incident.assignedReviewer.role}</div>
                    <div className="text-slate-400 text-[11px]">{incident.assignedReviewer.agency}</div>
                  </div>
                  {incident.escalatedToAgency && (
                    <div className="p-2.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs">
                      <span className="font-bold block text-[10px] uppercase text-purple-300">Escalated Authority</span>
                      <span>{incident.escalatedToAgency}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Regulatory Notes */}
              {incident.regulatoryNotes && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Official Regulatory Case Notes
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {incident.regulatoryNotes}
                  </p>
                </div>
              )}

              {/* Action Taken Summary */}
              {incident.actionTakenSummary && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 text-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Disposition & Action Taken</span>
                  </div>
                  <p className="text-emerald-200 leading-relaxed font-medium">
                    {incident.actionTakenSummary}
                  </p>
                </div>
              )}

              {/* Status Update Form for Authorized Officers */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Update Incident Status & Disposition (Authorized Officer)</span>
                </div>

                <form onSubmit={handleStatusSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(['NEW', 'UNDER REVIEW', 'INVESTIGATION', 'ESCALATED', 'ACTION TAKEN', 'CLOSED'] as IncidentStatus[]).map(
                      (st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setSelectedNewStatus(st)}
                          className={`p-2 rounded-lg text-xs font-bold border text-left transition-all cursor-pointer ${
                            selectedNewStatus === st
                              ? 'bg-purple-600 text-white border-purple-500 ring-1 ring-purple-400'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Official Regulatory Case Note / Audit Log Entry
                    </label>
                    <textarea
                      rows={2}
                      value={statusUpdateNotes}
                      onChange={(e) => setStatusUpdateNotes(e.target.value)}
                      placeholder="Enter official investigation notes, action summary, or authority escalation reason..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-2 shadow-md transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Official Status Update</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>MediShield AI Regulatory Intelligence • CDSCO Gateway Connected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
