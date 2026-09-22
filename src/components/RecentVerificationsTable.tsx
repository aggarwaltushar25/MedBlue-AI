/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ArrowUpDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
} from 'lucide-react';
import { ShipmentVerification, VerificationStatus } from '../types';
import { downloadCSV } from '../utils/exportUtils';

interface RecentVerificationsTableProps {
  shipments: ShipmentVerification[];
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onSelectShipment: (shipment: ShipmentVerification) => void;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
}

export const RecentVerificationsTable: React.FC<RecentVerificationsTableProps> = ({
  shipments,
  total,
  currentPage,
  totalPages,
  onPageChange,
  statusFilter,
  onStatusFilterChange,
  onSelectShipment,
  sortField,
  sortOrder,
  onSortChange,
}) => {
  const handleExport = () => {
    const headers = [
      'Shipment ID',
      'Medicine Name',
      'Category',
      'Supplier',
      'Verified At',
      'Risk Score',
      'Status',
      'Primary Issue',
      'Batch Number',
      'Location',
    ];
    const rows = shipments.map((s) => [
      s.id,
      s.medicineName,
      s.category,
      s.supplier,
      s.verifiedAt,
      s.riskScore,
      s.status,
      s.primaryIssue,
      s.batchNumber,
      s.location,
    ]);
    downloadCSV('recent_pharmacy_verifications.csv', headers, rows);
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Accepted
          </span>
        );
      case 'Quarantined':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Quarantined
          </span>
        );
      case 'Hold':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Hold
          </span>
        );
    }
  };

  const getRiskIndicator = (score: number) => {
    let colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) {
      colorClass = 'text-rose-700 bg-rose-50 border-rose-200';
    } else if (score >= 25) {
      colorClass = 'text-amber-700 bg-amber-50 border-amber-200';
    }

    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`w-7 h-5 flex items-center justify-center rounded text-xs font-bold border ${colorClass}`}
        >
          {score}
        </span>
        <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
          <div
            className={`h-full rounded-full ${
              score >= 60 ? 'bg-rose-600' : score >= 25 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs mb-6 overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Recent verifications
          </h3>
          <p className="text-xs text-slate-500">
            Showing {shipments.length} of {total} indexed shipments across receiving docks
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="filter-table-status"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="All">All shipments</option>
              <option value="Accepted">Accepted only</option>
              <option value="Quarantined">Quarantined only</option>
              <option value="Hold">Pending review</option>
            </select>
          </div>

          <button
            id="btn-export-table-csv"
            onClick={handleExport}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
            title="Export CSV"
            aria-label="Export recent verifications to CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
            <tr>
              <th
                onClick={() => onSortChange('id')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Shipment ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => onSortChange('medicineName')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Medicine Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => onSortChange('supplier')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Supplier</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => onSortChange('verifiedAt')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Verified At</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => onSortChange('riskScore')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Risk Score</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Primary Issue</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shipments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No shipments found matching the selected filters.
                </td>
              </tr>
            ) : (
              shipments.map((shipment) => (
                <tr
                  key={shipment.id}
                  className="hover:bg-slate-50/80 transition-colors duration-100 group"
                >
                  <td className="py-3 px-4 font-mono font-medium text-blue-700">
                    <button
                      onClick={() => onSelectShipment(shipment)}
                      className="hover:underline focus:outline-none text-left"
                    >
                      {shipment.id}
                    </button>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    <div>{shipment.medicineName}</div>
                    <div className="text-[10px] text-slate-400">Batch: {shipment.batchNumber}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {shipment.supplier}
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                    {shipment.verifiedAt}
                  </td>
                  <td className="py-3 px-4">{getRiskIndicator(shipment.riskScore)}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(shipment.status)}</td>
                  <td className="py-3 px-4 text-slate-600">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${
                        shipment.primaryIssue.includes('Duplicate') ||
                        shipment.primaryIssue.includes('Cold-chain') ||
                        shipment.primaryIssue.includes('Packaging')
                          ? 'text-rose-700 bg-rose-50'
                          : shipment.primaryIssue.includes('Missing') ||
                            shipment.primaryIssue.includes('Expiry')
                          ? 'text-amber-700 bg-amber-50'
                          : 'text-slate-500 bg-slate-100'
                      }`}
                    >
                      {shipment.primaryIssue}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      id={`btn-view-${shipment.id}`}
                      onClick={() => onSelectShipment(shipment)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-md border border-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 sm:px-5 sm:py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <div>
          Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalPages || 1}</span> ({total} items)
        </div>

        <div className="flex items-center gap-1">
          <button
            id="btn-prev-page"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono text-slate-500">{currentPage}</span>
          <button
            id="btn-next-page"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
