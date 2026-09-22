/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TopSupplier } from '../types';
import { Truck, ArrowUpRight } from 'lucide-react';

interface TopSuppliersCardProps {
  suppliers: TopSupplier[];
  onSelectSupplier: (supplierName: string) => void;
  selectedSupplier?: string;
}

export const TopSuppliersCard: React.FC<TopSuppliersCardProps> = ({
  suppliers,
  onSelectSupplier,
  selectedSupplier,
}) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Top suppliers by volume
          </h3>
          <p className="text-xs text-slate-500">
            30-day inbound distribution proportion
          </p>
        </div>
        <Truck className="w-4 h-4 text-slate-400" />
      </div>

      <div className="space-y-3 pt-1">
        {suppliers.map((s, idx) => {
          const isSelected = selectedSupplier === s.name;

          return (
            <button
              key={s.name}
              id={`supplier-vol-${idx}`}
              onClick={() => onSelectSupplier(s.name)}
              className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500'
                  : 'border-slate-100 bg-slate-50/40 hover:bg-slate-100/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 truncate">
                    {s.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-medium text-slate-900">
                    {s.shipmentCount}
                  </span>
                  <span className="text-[11px] text-slate-500">({s.percentage}%)</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-slate-700 h-full rounded-full transition-all duration-300"
                  style={{ width: `${s.percentage}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Click supplier to cross-filter shipments</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};
