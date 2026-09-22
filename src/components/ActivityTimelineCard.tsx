/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActivityEvent } from '../types';
import {
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  QrCode,
  PauseCircle,
  ArrowRight,
  History,
} from 'lucide-react';

interface ActivityTimelineCardProps {
  events: ActivityEvent[];
  onSelectShipment: (shipmentId: string) => void;
  onViewFullAuditLog: () => void;
}

export const ActivityTimelineCard: React.FC<ActivityTimelineCardProps> = ({
  events,
  onSelectShipment,
  onViewFullAuditLog,
}) => {
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

  const getDotBorder = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'accept':
        return 'border-emerald-500 bg-emerald-50';
      case 'quarantine':
        return 'border-rose-500 bg-rose-50';
      case 'alert':
        return 'border-amber-500 bg-amber-50';
      case 'scan':
        return 'border-blue-500 bg-blue-50';
      case 'hold':
        return 'border-amber-500 bg-amber-50';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Recent supply-chain activity
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Real-Time Event Stream</span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.slice(0, 12).map((event) => (
          <div key={event.id} className="relative flex items-start justify-between gap-4 text-xs group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center bg-white shadow-xs ${getDotBorder(
                event.type
              )}`}
            >
              {getEventIcon(event.type)}
            </div>

            <div className="flex-1 pl-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-800 font-medium">{event.description}</span>
                <button
                  id={`timeline-link-${event.shipmentId}`}
                  onClick={() => onSelectShipment(event.shipmentId)}
                  className="font-mono text-[11px] text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-1.5 py-0.5 rounded cursor-pointer"
                >
                  {event.shipmentId}
                </button>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{event.supplier}</span>
                <span>•</span>
                <span>Audit Node #DL-{event.id}</span>
              </div>
            </div>

            <span className="text-[11px] text-slate-400 whitespace-nowrap font-mono">
              {event.timestamp}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
        <button
          id="btn-view-full-audit-log"
          onClick={onViewFullAuditLog}
          className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>View full audit log</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
