/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Download,
  Building2,
  Calendar,
  Layers,
  ArrowUpDown,
  Printer,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  ShieldAlert,
  Radio,
} from 'lucide-react';
import {
  ExecutiveKPIs,
  VerificationTrendDay,
  RiskDistribution,
  SupplierHeatmapEntry,
  ShipmentVerification,
  VerificationHealthData,
  TopSupplier,
} from '../types';
import { VerificationTrendChart } from './VerificationTrendChart';
import { RiskDistributionChart } from './RiskDistributionChart';
import { RiskHeatmap } from './RiskHeatmap';
import { VerificationHealthCard } from './VerificationHealthCard';
import { TopSuppliersCard } from './TopSuppliersCard';

interface AdminModeViewProps {
  kpiData: ExecutiveKPIs;
  trendData: VerificationTrendDay[];
  riskDistribution: RiskDistribution;
  heatmapData: SupplierHeatmapEntry[];
  healthData: VerificationHealthData;
  topSuppliers: TopSupplier[];
  shipments: ShipmentVerification[];
  onInspectShipment: (shipment: ShipmentVerification) => void;
  onNavigateToForensics?: (batchNumber?: string) => void;
}

export const AdminModeView: React.FC<AdminModeViewProps> = ({
  kpiData,
  trendData,
  riskDistribution,
  heatmapData,
  healthData,
  topSuppliers,
  shipments,
  onInspectShipment,
  onNavigateToForensics,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter shipments
  const filtered = shipments.filter((item) => {
    const matchesSearch =
      item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesSupplier = supplierFilter === 'All' || item.supplier === supplierFilter;
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Total macro statistics
  const totalChecksRecords = 14892;
  const totalBatchesRecorded = shipments.length * 48;
  const totalCounterfeitsBlocked = 23;
  const overallAcceptanceRate = '91.8%';

  const handleExportCSV = () => {
    const headers = ['ID', 'Medicine', 'Batch', 'Supplier', 'Date', 'RiskScore', 'Status', 'PrimaryIssue'];
    const rows = filtered.map((s) => [
      s.id,
      `"${s.medicineName}"`,
      s.batchNumber,
      `"${s.supplier}"`,
      s.verifiedAt,
      s.riskScore,
      s.status,
      `"${s.primaryIssue}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MediShield_All_Batch_Checking_Records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Admin Title & Authority Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5 text-blue-700" />
            <span>National Supply-Chain Administration & Regulatory Compliance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
            Batch Shipment Records & Verification Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Macro oversight of all inbound deliveries, pharmacy checkups, patient verifications, and intercepted counterfeits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToForensics && (
            <button
              id="btn-admin-open-forensics"
              onClick={() => onNavigateToForensics()}
              className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Radio className="w-4 h-4 text-purple-600" />
              <span>Batch Forensics</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
          >
            <Download className="w-4 h-4" />
            <span>Export Batch Records (CSV)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Compliance Report</span>
          </button>
        </div>
      </div>

      {/* TOTAL RECORDS OF ALL CHECKING — TOP MACRO STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Total Verification Checks</span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">All Channels</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-mono">
            {totalChecksRecords.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>+1,420 checks this month</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Verified Genuine Rate</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Target: 95%</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2 font-mono">
            {overallAcceptanceRate}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            13,670 batches cleared for distribution
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Counterfeits Blocked</span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">Interceptions</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600 mt-2 font-mono">
            {totalCounterfeitsBlocked}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Zero counterfeit pills reached patients
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Active Batch Registrations</span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">On-Chain</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-mono">
            {totalBatchesRecorded.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across 14 licensed pharmaceutical suppliers
          </div>
        </div>
      </div>

      {/* MACRO GRAPHS SECTION */}
      <div className="space-y-6">
        {/* Graph 1: Verification Trajectory Trends */}
        <VerificationTrendChart data={trendData} />

        {/* 2-Column Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <RiskDistributionChart
              data={riskDistribution}
              onSelectRiskBucket={() => {}}
            />
          </div>
          <div className="lg:col-span-5">
            <VerificationHealthCard data={healthData} />
          </div>
        </div>

        {/* Supplier Heatmap */}
        <RiskHeatmap data={heatmapData} />
      </div>

      {/* MASTER REGISTRY: ALL SHIPMENTS AND BATCHES TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Total Records of All Batch Shipments
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filtered.length} total shipment batches recorded across all distribution channels
            </p>
          </div>

          {/* Table Filters & Search */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search batch, drug, supplier..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs w-48 sm:w-60"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1.5 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Accepted">Accepted</option>
              <option value="Hold">Hold</option>
              <option value="Quarantined">Quarantined</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Shipment / Batch</th>
                <th className="px-4 py-3">Medicine Details</th>
                <th className="px-4 py-3">Supplier / Distributor</th>
                <th className="px-4 py-3">Inspection Date</th>
                <th className="px-4 py-3">Risk Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.length > 0 ? (
                pageItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono">
                      <div className="font-bold text-slate-900">{item.id}</div>
                      {onNavigateToForensics ? (
                        <button
                          onClick={() => onNavigateToForensics(item.batchNumber)}
                          className="text-[11px] text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                          title="Click to inspect batch forensics across suppliers"
                        >
                          <Radio className="w-2.5 h-2.5" />
                          <span>Batch: {item.batchNumber}</span>
                        </button>
                      ) : (
                        <div className="text-[11px] text-slate-500">Batch: {item.batchNumber}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{item.medicineName}</div>
                      <div className="text-[11px] text-slate-500">{item.category}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {item.supplier}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {item.verifiedAt}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                          item.riskScore >= 60
                            ? 'bg-rose-100 text-rose-800'
                            : item.riskScore >= 25
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.riskScore}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === 'Accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Quarantined'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onInspectShipment(item)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No shipments found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            Page {currentPage} of {totalPages} ({filtered.length} records)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
