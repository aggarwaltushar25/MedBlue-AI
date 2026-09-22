/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SupplierHeatmapEntry } from '../types';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface RiskHeatmapProps {
  data: SupplierHeatmapEntry[];
  onSelectCell?: (supplier: string, factor: string) => void;
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ data, onSelectCell }) => {
  const riskFactors = [
    { key: 'duplicateSerials', label: 'Duplicate serials' },
    { key: 'missingHandoff', label: 'Missing handoff' },
    { key: 'coldChainBreach', label: 'Cold-chain breach' },
    { key: 'packagingAnomaly', label: 'Packaging anomaly' },
  ];

  // Medical-grade color cell calculator
  const getCellStyle = (count: number, factorKey: string) => {
    if (count === 0) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        badge: '0',
        intensity: 'Low',
      };
    }
    if (count >= 10 || (factorKey === 'coldChainBreach' && count >= 3)) {
      return {
        bg: 'bg-rose-600 text-white border-rose-700 shadow-xs font-bold',
        badge: String(count),
        intensity: 'High Risk',
      };
    }
    if (count >= 3 || factorKey === 'coldChainBreach') {
      return {
        bg: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
        badge: String(count),
        intensity: 'Moderate Risk',
      };
    }
    return {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      badge: String(count),
      intensity: 'Isolated',
    };
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Supply-chain risk heatmap
          </h3>
          <p className="text-xs text-slate-500">
            Cross-correlating vendor infractions by security vulnerability
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>30-Day Aggregation</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2.5 px-3 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                Supplier
              </th>
              {riskFactors.map((f) => (
                <th
                  key={f.key}
                  className="py-2.5 px-3 text-center text-slate-700 font-semibold text-[11px]"
                >
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.supplier} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                  {row.supplier}
                </td>
                {riskFactors.map((f) => {
                  const count = (row as any)[f.key] as number;
                  const style = getCellStyle(count, f.key);

                  return (
                    <td key={f.key} className="py-2 px-3 text-center">
                      <button
                        onClick={() => onSelectCell?.(row.supplier, f.label)}
                        className={`w-12 h-9 mx-auto rounded-md border flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${style.bg}`}
                        title={`${row.supplier} × ${f.label}: ${count} occurrences (${style.intensity})`}
                        aria-label={`${row.supplier} has ${count} occurrences of ${f.label}`}
                      >
                        <span className="text-xs">{style.badge}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Heatmap Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-medium">Severity:</span>
          <div className="flex items-center gap-1 text-[11px] text-slate-600">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></span>
            <span>0 Clean</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-600">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></span>
            <span>1–4 Moderate</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-600">
            <span className="w-3 h-3 rounded bg-rose-600 text-white font-bold"></span>
            <span>≥5 Critical</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-500 text-[11px]">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Click any cell to filter active incidents.</span>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
        This heatmap highlights which suppliers are associated with specific risk patterns over the last 30 days.
      </p>
    </div>
  );
};
