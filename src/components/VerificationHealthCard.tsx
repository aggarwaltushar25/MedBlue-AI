/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { VerificationHealthData } from '../types';
import { CheckCircle2, AlertCircle, Target } from 'lucide-react';

interface VerificationHealthCardProps {
  data: VerificationHealthData;
}

export const VerificationHealthCard: React.FC<VerificationHealthCardProps> = ({ data }) => {
  const chartData = [
    { name: 'Verified', value: data.verifiedPercentage, color: '#16A34A' }, // Green
    { name: 'Pending / Failed', value: 100 - data.verifiedPercentage, color: '#E2E8F0' }, // Slate gray
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
          Verification health
        </h3>
        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Monthly Pace
        </span>
      </div>

      {/* Donut Chart with Center Text */}
      <div className="relative h-44 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={68}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              <Cell fill="#16A34A" />
              <Cell fill="#E2E8F0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {data.verifiedPercentage}%
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400">
            Compliant
          </span>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified:</span>
          </div>
          <span className="font-semibold text-slate-800">{data.verifiedCount} shipments</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-700">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Pending:</span>
          </div>
          <span className="font-semibold text-slate-800">{data.pendingCount} shipments</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-rose-700">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Failed / Intercepted:</span>
          </div>
          <span className="font-semibold text-slate-800">{data.failedCount} shipments</span>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
          <div className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-medium">Target: {data.targetPercentage}% verified by month-end</span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">Delta: -3%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${(data.verifiedPercentage / data.targetPercentage) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
