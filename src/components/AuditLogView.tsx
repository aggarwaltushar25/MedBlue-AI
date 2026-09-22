/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActivityEvent } from '../types';
import {
  FileText,
  ArrowLeft,
  Search,
  Download,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  QrCode,
  PauseCircle,
} from 'lucide-react';
import { downloadCSV } from '../utils/exportUtils';

interface AuditLogViewProps {
  events: ActivityEvent[];
  onSelectShipment: (shipmentId: string) => void;
  onBackToDashboard: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  events,
  onSelectShipment,
  onBackToDashboard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter(
    (e) =>
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.shipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['Event ID', 'Type', 'Timestamp', 'Description', 'Shipment ID', 'Supplier'];
    const rows = events.map((e) => [e.id, e.type, e.timestamp, e.description, e.shipmentId, e.supplier]);
    downloadCSV('pharmacy_chain_audit_log.csv', headers, rows);
  };

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'accept':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'quarantine':
        return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'scan':
        return <QrCode className="w-4 h-4 text-blue-600" />;
      case 'hold':
        return <PauseCircle className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={onBackToDashboard}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to overview</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
              Cryptographic supply-chain audit log
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Immutable ledger of digital verification events, physical scans, and containment directives
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md shadow-xs flex items-center gap-1.5 self-start cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export full audit log (CSV)</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter audit events by shipment ID, supplier, or event keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs text-slate-800 bg-transparent focus:outline-none"
        />
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Event</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Shipment</th>
              <th className="py-3 px-4">Supplier</th>
              <th className="py-3 px-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEvents.map((event) => (
              <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 flex items-center gap-2">
                  <div className="p-1 rounded-md bg-slate-100">{getEventIcon(event.type)}</div>
                  <span className="font-mono text-slate-500 text-[11px]">{event.id}</span>
                </td>
                <td className="py-3 px-4 font-medium text-slate-800">{event.description}</td>
                <td className="py-3 px-4 font-mono text-blue-700">
                  <button
                    onClick={() => onSelectShipment(event.shipmentId)}
                    className="hover:underline cursor-pointer"
                  >
                    {event.shipmentId}
                  </button>
                </td>
                <td className="py-3 px-4 text-slate-600">{event.supplier}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px]">
                  {event.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
