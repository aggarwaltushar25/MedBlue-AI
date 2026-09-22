/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ClipboardCheck,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Thermometer,
  Copy,
  ArrowUpRight,
} from 'lucide-react';
import { ExecutiveKPIs } from '../types';

interface KPISectionProps {
  kpis: ExecutiveKPIs;
  onFilterSelect: (filterType: 'all' | 'accepted' | 'quarantined' | 'pending' | 'cold-chain' | 'duplicate-serials') => void;
  activeFilter?: string;
}

export const KPISection: React.FC<KPISectionProps> = ({
  kpis,
  onFilterSelect,
  activeFilter,
}) => {
  const cards = [
    // Row 1
    {
      id: 'kpi-today-verifications',
      key: 'all',
      title: "Today's verifications",
      value: kpis.todayVerifications.count,
      subtext: kpis.todayVerifications.trend,
      subtextType: 'trend',
      icon: ClipboardCheck,
      borderColor: '#2563EB', // Blue
      borderClass: 'border-l-[#2563EB]',
      badgeText: 'All Batches',
    },
    {
      id: 'kpi-accepted-shipments',
      key: 'accepted',
      title: 'Accepted shipments',
      value: kpis.acceptedShipments.count,
      subtext: kpis.acceptedShipments.percentage,
      subtextType: 'percentage',
      icon: ShieldCheck,
      borderColor: '#15803D', // Green
      borderClass: 'border-l-[#15803D]',
      badgeText: 'Passed GS1 & RFID',
    },
    {
      id: 'kpi-quarantined',
      key: 'quarantined',
      title: 'Quarantined',
      value: kpis.quarantinedShipments.count,
      subtext: kpis.quarantinedShipments.percentage,
      subtextType: 'percentage',
      icon: AlertTriangle,
      borderColor: '#B91C1C', // Red
      borderClass: 'border-l-[#B91C1C]',
      badgeText: 'Action Mandatory',
    },
    // Row 2
    {
      id: 'kpi-pending-review',
      key: 'pending',
      title: 'Pending review',
      value: kpis.pendingReview.count,
      subtext: kpis.pendingReview.text,
      subtextType: 'text',
      icon: Clock,
      borderColor: '#B45309', // Amber
      borderClass: 'border-l-[#B45309]',
      badgeText: 'Secondary Scan',
    },
    {
      id: 'kpi-cold-chain-alerts',
      key: 'cold-chain',
      title: 'Cold-chain alerts',
      value: kpis.coldChainAlerts.count,
      subtext: kpis.coldChainAlerts.text,
      subtextType: 'text',
      icon: Thermometer,
      borderColor: '#B91C1C', // Red
      borderClass: 'border-l-[#B91C1C]',
      badgeText: 'Thermal Excursion',
    },
    {
      id: 'kpi-duplicate-serials',
      key: 'duplicate-serials',
      title: 'Duplicate serials detected',
      value: kpis.duplicateSerials.count,
      subtext: kpis.duplicateSerials.text,
      subtextType: 'text',
      icon: Copy,
      borderColor: '#B91C1C', // Red
      borderClass: 'border-l-[#B91C1C]',
      badgeText: 'Anti-Counterfeit Flag',
    },
  ];

  return (
    <section aria-label="Executive KPI Overview" className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const isSelected = activeFilter === card.key;

          return (
            <button
              key={card.id}
              id={card.id}
              onClick={() => onFilterSelect(card.key as any)}
              className={`text-left bg-white rounded-lg p-5 border border-slate-200 border-l-4 ${card.borderClass} 
                transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  isSelected ? 'ring-2 ring-blue-600 bg-blue-50/20 shadow-xs' : ''
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors hidden sm:inline">
                    Filter
                  </span>
                  <Icon className="w-5 h-5 text-[#64748B] group-hover:text-slate-900 transition-colors" />
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </span>
                {card.subtextType === 'trend' && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    {card.subtext}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                <span className="truncate">{card.subtext}</span>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {card.badgeText}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
