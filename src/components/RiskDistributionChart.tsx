/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RiskDistribution, RiskLevel } from '../types';
import { Shield, AlertCircle, AlertTriangle } from 'lucide-react';

interface RiskDistributionChartProps {
  data: RiskDistribution;
  onSelectRiskBucket: (range: { min: number; max: number; level: RiskLevel }) => void;
  selectedLevel?: RiskLevel;
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({
  data,
  onSelectRiskBucket,
  selectedLevel,
}) => {
  const total = data.low + data.medium + data.high;

  const buckets = [
    {
      id: 'risk-bucket-low',
      level: 'Low' as RiskLevel,
      label: '0–24 (Low risk)',
      count: data.low,
      min: 0,
      max: 24,
      percentage: Math.round((data.low / total) * 100),
      color: 'bg-emerald-600',
      barStyle: 'from-emerald-500 to-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Shield,
    },
    {
      id: 'risk-bucket-medium',
      level: 'Medium' as RiskLevel,
      label: '25–59 (Medium risk)',
      count: data.medium,
      min: 25,
      max: 59,
      percentage: Math.round((data.medium / total) * 100),
      color: 'bg-amber-500',
      barStyle: 'from-amber-400 to-amber-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertCircle,
    },
    {
      id: 'risk-bucket-high',
      level: 'High' as RiskLevel,
      label: '60–100 (High risk)',
      count: data.high,
      min: 60,
      max: 100,
      percentage: Math.round((data.high / total) * 100),
      color: 'bg-red-600',
      barStyle: 'from-red-500 to-red-700',
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Risk distribution
          </h3>
          <p className="text-xs text-slate-500">
            Automated ML scoring breakdown across today&apos;s batch arrivals
          </p>
        </div>
        <span className="text-xs text-slate-400 font-medium">Click bar to filter table</span>
      </div>

      <div className="space-y-4 pt-1">
        {buckets.map((b) => {
          const isSelected = selectedLevel === b.level;
          const Icon = b.icon;

          return (
            <button
              key={b.id}
              id={b.id}
              onClick={() => onSelectRiskBucket({ min: b.min, max: b.max, level: b.level })}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20'
                  : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-800">{b.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{b.count} shipments</span>
                  <span className={`text-[11px] px-1.5 py-0.5 rounded border font-medium ${b.badgeBg}`}>
                    {b.percentage}%
                  </span>
                </div>
              </div>

              {/* Horizontal Bar with gradient */}
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${b.barStyle} transition-all duration-500`}
                  style={{ width: `${Math.max(b.percentage, 6)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Combined verification load: {total} active shipments</span>
        <span className="text-slate-400">Model: CDSCO-RxGuard v3.4</span>
      </div>
    </div>
  );
};
