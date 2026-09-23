/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Truck,
  FileText,
  AlertOctagon,
  RefreshCw,
  SlidersHorizontal,
  Send,
} from 'lucide-react';
import { RegulatoryIncident, IncidentSeverity, IncidentStatus } from '../types';

interface IncidentManagementViewProps {
  incidents: RegulatoryIncident[];
  onOpenIncidentDetail: (incidentId: string) => void;
  onOpenEntityProfile: (entityId: string, entityType: 'store' | 'supplier' | 'manufacturer') => void;
  onOpenForensics?: (batchNumber: string) => void;
  onUpdateStatus?: (incidentId: string, newStatus: IncidentStatus, notes: string) => void;
  initialFilterStatus?: IncidentStatus | 'ALL';
  initialFilterSeverity?: IncidentSeverity | 'ALL';
}

export const IncidentManagementView: React.FC<IncidentManagementViewProps> = ({
  incidents,
  onOpenIncidentDetail,
  onOpenEntityProfile,
  onOpenForensics,
  onUpdateStatus,
  initialFilterStatus = 'ALL',
  initialFilterSeverity = 'ALL',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilterStatus);
  const [severityFilter, setSeverityFilter] = useState<string>(initialFilterSeverity);
  const [supplierFilter, setSupplierFilter] = useState<string>('ALL');
  const [storeFilter, setStoreFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'riskScore' | 'severity'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Quick Status Update Modal State
  const [quickUpdateIncident, setQuickUpdateIncident] = useState<RegulatoryIncident | null>(null);
  const [quickTargetStatus, setQuickTargetStatus] = useState<IncidentStatus>('UNDER REVIEW');
  const [quickNotes, setQuickNotes] = useState('');

  // Extract unique filters
  const uniqueSuppliers = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((i) => set.add(i.supplier.name));
    return Array.from(set);
  }, [incidents]);

  const uniqueStores = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((i) => set.add(i.store.name));
    return Array.from(set);
  }, [incidents]);

  // Filter & Sort Incidents
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            inc.id.toLowerCase().includes(q) ||
            inc.title.toLowerCase().includes(q) ||
            inc.medicine.name.toLowerCase().includes(q) ||
            inc.batchNumber.toLowerCase().includes(q) ||
            inc.store.name.toLowerCase().includes(q) ||
            inc.supplier.name.toLowerCase().includes(q) ||
            inc.detectionReason.toLowerCase().includes(q);
          if (!match) return false;
        }

        // Status
        if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;

        // Severity
        if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;

        // Supplier
        if (supplierFilter !== 'ALL' && inc.supplier.name !== supplierFilter) return false;

        // Store
        if (storeFilter !== 'ALL' && inc.store.name !== storeFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'createdAt') {
          const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          return sortOrder === 'desc' ? diff : -diff;
        }
        if (sortBy === 'riskScore') {
          return sortOrder === 'desc' ? b.riskScore - a.riskScore : a.riskScore - b.riskScore;
        }
        if (sortBy === 'severity') {
          const weights: Record<IncidentSeverity, number> = {
            CRITICAL: 4,
            HIGH: 3,
            MEDIUM: 2,
            LOW: 1,
          };
          const diff = weights[b.severity] - weights[a.severity];
          return sortOrder === 'desc' ? diff : -diff;
        }
        return 0;
      });
  }, [incidents, searchQuery, statusFilter, severityFilter, supplierFilter, storeFilter, sortBy, sortOrder]);

  const handleExportCSV = () => {
    const headers = [
      'Incident ID',
      'Severity',
      'Status',
      'Created At',
      'Medicine',
      'Batch',
      'Store',
      'Supplier',
      'Risk Score',
      'Detection Reason',
    ];
    const rows = filteredIncidents.map((i) => [
      i.id,
      i.severity,
      i.status,
      i.createdAt,
      `"${i.medicine.name}"`,
      i.batchNumber,
      `"${i.store.name}"`,
      `"${i.supplier.name}"`,
      i.riskScore,
      `"${i.detectionReason.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MediShield_Regulatory_Incidents_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleQuickStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickUpdateIncident && onUpdateStatus) {
      onUpdateStatus(quickUpdateIncident.id, quickTargetStatus, quickNotes);
    }
    setQuickUpdateIncident(null);
    setQuickNotes('');
  };

  return (
    <div id="incident-management-view" className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Regulatory Case Management
            </span>
            <span className="text-xs text-slate-400 font-mono">
              CDSCO / State Drug Control Integrated
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Incident Management & Regulatory Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Track, investigate, and escalate medicine verification anomalies, counterfeit alarms, and chain-of-custody breaches.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
            title="Export incidents to CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export Registry (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by incident ID, medicine name, batch number, store, supplier, or reason..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="UNDER REVIEW">Under Review</option>
              <option value="INVESTIGATION">Investigation</option>
              <option value="ESCALATED">Escalated</option>
              <option value="ACTION TAKEN">Action Taken</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Supplier:</span>
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-300 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Suppliers</option>
                {uniqueSuppliers.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Store:</span>
              <select
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-300 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Stores</option>
                {uniqueStores.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">
              Showing <strong>{filteredIncidents.length}</strong> of {incidents.length} incidents
            </span>

            {(statusFilter !== 'ALL' || severityFilter !== 'ALL' || supplierFilter !== 'ALL' || storeFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setSeverityFilter('ALL');
                  setSupplierFilter('ALL');
                  setStoreFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-purple-400 hover:text-purple-300 text-[11px] font-bold underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Incident ID / Title</th>
                <th className="py-3.5 px-3">Severity & Risk</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Medicine & Batch</th>
                <th className="py-3.5 px-3">Entities Involved</th>
                <th className="py-3.5 px-3">Assigned Reviewer</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold text-sm">No regulatory incidents match the selected criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => onOpenIncidentDetail(inc.id)}
                  >
                    {/* ID & Title */}
                    <td className="py-3.5 px-4 min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-purple-300">{inc.id}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(inc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="font-semibold text-white truncate max-w-xs mt-0.5">
                        {inc.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {inc.detectionReason}
                      </div>
                    </td>

                    {/* Severity & Risk Score */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            inc.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : inc.severity === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${
                              inc.riskScore >= 75
                                ? 'bg-rose-500'
                                : inc.riskScore >= 50
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${inc.riskScore}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-xs text-white">
                          {inc.riskScore}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                          inc.status === 'ESCALATED'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                            : inc.status === 'INVESTIGATION'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : inc.status === 'ACTION TAKEN'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : inc.status === 'CLOSED'
                            ? 'bg-slate-700/50 text-slate-300 border-slate-600'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>

                    {/* Medicine & Batch */}
                    <td className="py-3.5 px-3 min-w-[160px]">
                      <div className="font-semibold text-white truncate max-w-[180px]">
                        {inc.medicine.name}
                      </div>
                      <div className="font-mono text-[11px] text-purple-300">
                        {inc.batchNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Shipment: {inc.shipmentId}
                      </div>
                    </td>

                    {/* Entities */}
                    <td className="py-3.5 px-3 min-w-[180px]">
                      <div className="text-slate-200 font-medium truncate max-w-[180px] flex items-center gap-1">
                        <Building className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate">{inc.store.name}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] truncate max-w-[180px] flex items-center gap-1 mt-0.5">
                        <Truck className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="truncate">{inc.supplier.name}</span>
                      </div>
                    </td>

                    {/* Assigned Reviewer */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-200">
                        {inc.assignedReviewer.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {inc.assignedReviewer.agency}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setQuickUpdateIncident(inc);
                            setQuickTargetStatus(inc.status);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                          title="Quick Update Status"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        </button>

                        <button
                          onClick={() => onOpenIncidentDetail(inc.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Review</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK STATUS UPDATE POPUP */}
      {quickUpdateIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm">Update Regulatory Status</h3>
              </div>
              <button
                onClick={() => setQuickUpdateIncident(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-1">
              <span className="font-mono text-purple-300 font-bold">{quickUpdateIncident.id}</span>
              <div className="font-bold text-white truncate">{quickUpdateIncident.title}</div>
            </div>

            <form onSubmit={handleQuickStatusSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Select New Disposition Status
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['NEW', 'UNDER REVIEW', 'INVESTIGATION', 'ESCALATED', 'ACTION TAKEN', 'CLOSED'] as IncidentStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setQuickTargetStatus(st)}
                        className={`p-2 rounded-lg text-xs font-bold border text-center transition-colors cursor-pointer ${
                          quickTargetStatus === st
                            ? 'bg-purple-600 text-white border-purple-500'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Audit Log / Official Note
                </label>
                <textarea
                  rows={2}
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="Reason for status change or regulatory directive..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickUpdateIncident(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
