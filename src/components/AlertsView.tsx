/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HighPriorityAlert } from '../types';
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  Filter,
} from 'lucide-react';

interface AlertsViewProps {
  alerts: HighPriorityAlert[];
  onReviewAlert: (alert: HighPriorityAlert) => void;
  onBackToDashboard: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onReviewAlert,
  onBackToDashboard,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBackToDashboard}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to overview</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
            Active supply-chain alerts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time critical security, duplicate serial, and cold-chain incident feeds requiring pharmacist action
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'critical';

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-lg border bg-white shadow-xs transition-all ${
                isCritical
                  ? 'border-rose-200 border-l-4 border-l-rose-600'
                  : 'border-amber-200 border-l-4 border-l-amber-500'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {isCritical ? (
                    <span className="p-1 rounded bg-rose-50 text-rose-600">
                      <ShieldAlert className="w-5 h-5" />
                    </span>
                  ) : (
                    <span className="p-1 rounded bg-amber-50 text-amber-600">
                      <AlertTriangle className="w-5 h-5" />
                    </span>
                  )}
                  <h3 className="font-bold text-slate-900 text-sm">{alert.title}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{alert.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4 pl-8">
                {alert.description}
              </p>

              <div className="flex items-center justify-between pl-8 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Shipment: {alert.shipmentId}
                  </span>
                  {alert.batchNumber && (
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Batch: {alert.batchNumber}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onReviewAlert(alert)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Investigate shipment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
