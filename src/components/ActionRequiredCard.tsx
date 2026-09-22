/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HighPriorityAlert } from '../types';
import { AlertTriangle, Clock, ArrowRight, ShieldAlert } from 'lucide-react';

interface ActionRequiredCardProps {
  alerts: HighPriorityAlert[];
  onReviewAlert: (alert: HighPriorityAlert) => void;
  onViewAllAlerts: () => void;
}

export const ActionRequiredCard: React.FC<ActionRequiredCardProps> = ({
  alerts,
  onReviewAlert,
  onViewAllAlerts,
}) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Action required
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          {alerts.length} Pending Actions
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {alerts.slice(0, 4).map((alert) => {
          const isCritical = alert.severity === 'critical';

          return (
            <div key={alert.id} className="py-3 first:pt-1 last:pb-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  {isCritical ? (
                    <span className="text-rose-600 text-xs font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>{alert.title}</span>
                    </span>
                  ) : (
                    <span className="text-amber-600 text-xs font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{alert.title}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 whitespace-nowrap">
                  <Clock className="w-3 h-3" />
                  <span>{alert.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                {alert.description}
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {alert.shipmentId}
                </span>
                <button
                  id={`btn-review-${alert.id}`}
                  onClick={() => onReviewAlert(alert)}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Review</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        id="btn-view-all-alerts"
        onClick={onViewAllAlerts}
        className="w-full mt-4 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>View all alerts</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
