/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Download, AlertCircle } from 'lucide-react';
import { VerificationTrendDay } from '../types';
import { downloadCSV } from '../utils/exportUtils';

interface VerificationTrendChartProps {
  data: VerificationTrendDay[];
}

export const VerificationTrendChart: React.FC<VerificationTrendChartProps> = ({ data }) => {
  const handleExport = () => {
    const headers = ['Date', 'Accepted', 'Quarantined', 'Hold', 'Total'];
    const rows = data.map((d) => [d.date, d.accepted, d.quarantined, d.hold, d.total]);
    downloadCSV('verification_trend_14_days.csv', headers, rows);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Verification trend (last 14 days)
          </h3>
          <p className="text-xs text-slate-500">
            Daily breakdown of approved vs. intercepted batches
          </p>
        </div>
        <button
          id="btn-export-trend-csv"
          onClick={handleExport}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          title="Export CSV"
          aria-label="Export verification trend data to CSV"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              domain={[0, 50]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: any, name: any) => [
                `${value} shipments`,
                name === 'accepted' ? 'Accepted' : 'Quarantined',
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="accepted"
              name="accepted"
              stroke="#2563EB" // Solid blue
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#2563EB' }}
              activeDot={{ r: 5, stroke: '#93C5FD', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="quarantined"
              name="quarantined"
              stroke="#DC2626" // Red dashed
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#DC2626' }}
              activeDot={{ r: 5, stroke: '#FCA5A5', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Analytical Note */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#2563EB]"></span>
            <span className="text-slate-600 font-medium">Accepted (Solid blue)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#DC2626] border-b border-dashed border-red-600"></span>
            <span className="text-slate-600 font-medium">Quarantined (Red dashed)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded border border-amber-200/60">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>Sharp increases in quarantined shipments may indicate supply-chain disruption.</span>
        </div>
      </div>
    </div>
  );
};
