/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  TrendingUp,
  TrendingDown,
  Building,
  Truck,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Download,
  AlertOctagon,
  Search,
  Activity,
  Layers,
  ArrowRight,
  Radio,
  FileText,
  Filter,
} from 'lucide-react';
import {
  RegulatoryIncident,
  RegulatoryKPIs,
  SuspiciousActivityTrendItem,
  GeographicRiskDetail,
  SupplierRegulatoryRisk,
  StoreRegulatoryRisk,
  EntityRecurringPattern,
  IncidentStatus,
  IncidentSeverity,
} from '../types';
import {
  computeRegulatoryKPIs,
  getSuspiciousActivityTrends,
  GEOGRAPHIC_REGULATORY_RISKS,
  SUPPLIER_REGULATORY_RISKS,
  STORE_REGULATORY_RISKS,
  RECURRING_PATTERNS_DETECTED,
} from '../data/regulatoryData';
import { RegulatorRiskMap } from './RegulatorRiskMap';
import { GoogleMapsProvider } from './GoogleMapsProvider';
import { SupplyChainTraceability } from './SupplyChainTraceability';
import { unifiedStore } from '../services/unifiedStore';

interface RegulatoryIntelligenceDashboardProps {
  incidents: RegulatoryIncident[];
  onOpenIncidentDetail: (incidentId: string) => void;
  onOpenEntityProfile: (entityId: string, entityType: 'store' | 'supplier' | 'manufacturer') => void;
  onNavigateToIncidents: (filterStatus?: IncidentStatus | 'ALL', filterSeverity?: IncidentSeverity | 'ALL') => void;
  onOpenForensics?: (batchNumber: string) => void;
}

export const RegulatoryIntelligenceDashboard: React.FC<RegulatoryIntelligenceDashboardProps> = ({
  incidents,
  onOpenIncidentDetail,
  onOpenEntityProfile,
  onNavigateToIncidents,
  onOpenForensics,
}) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedGeoLocation, setSelectedGeoLocation] = useState<string | null>(null);

  // Dynamic KPIs
  const kpis: RegulatoryKPIs = useMemo(() => {
    return computeRegulatoryKPIs(incidents);
  }, [incidents]);

  // Dynamic Trend Data
  const trendData: SuspiciousActivityTrendItem[] = useMemo(() => {
    return getSuspiciousActivityTrends(timeframe);
  }, [timeframe]);

  // Max value for scaling trend bars
  const maxTrendTotal = useMemo(() => {
    return Math.max(...trendData.map((t) => t.total), 1);
  }, [trendData]);

  // Filtered incidents by location if selected
  const locationDrilldownIncidents = useMemo(() => {
    if (!selectedGeoLocation) return [];
    return incidents.filter(
      (i) =>
        i.store.location.toLowerCase().includes(selectedGeoLocation.toLowerCase()) ||
        i.supplier.location.toLowerCase().includes(selectedGeoLocation.toLowerCase())
    );
  }, [incidents, selectedGeoLocation]);

  return (
    <div id="regulatory-dashboard-root" className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CDSCO & State Drug Control Oversight</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Live Regulatory Node #IND-NORTH-VIGILANCE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Regulatory Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Monitor suspicious medicine activity, recurring risk patterns, and escalated incidents across the network.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center flex-wrap">
            <button
              onClick={() => onNavigateToIncidents('ALL', 'ALL')}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Open Case Registry</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOP 6 KPI CARDS (Calculated from real underlying dataset) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Active investigations */}
        <div
          id="kpi-active-investigations"
          onClick={() => onNavigateToIncidents('INVESTIGATION', 'ALL')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 transition-all cursor-pointer shadow-xs group"
          title="Click to view Active Investigations"
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Investigations</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-mono text-2xl font-black text-amber-400">
            {kpis.activeInvestigations}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Active dossiers</span>
            <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 2: High-priority incidents */}
        <div
          id="kpi-high-priority-incidents"
          onClick={() => onNavigateToIncidents('ALL', 'CRITICAL')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 transition-all cursor-pointer shadow-xs group"
          title="Click to view Critical & High Priority Incidents"
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>High Priority</span>
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-mono text-2xl font-black text-rose-400">
            {kpis.highPriorityIncidents}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Critical severity</span>
            <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 3: Escalated cases */}
        <div
          id="kpi-escalated-cases"
          onClick={() => onNavigateToIncidents('ESCALATED', 'ALL')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 transition-all cursor-pointer shadow-xs group"
          title="Click to view Cases Escalated to State/CDSCO"
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Escalated Cases</span>
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-mono text-2xl font-black text-purple-300">
            {kpis.escalatedCases}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Gov authority tier</span>
            <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 4: Suspicious shipments */}
        <div
          id="kpi-suspicious-shipments"
          onClick={() => onNavigateToIncidents('ALL', 'ALL')}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 transition-all cursor-pointer shadow-xs group"
          title="Click to view Suspicious Shipments"
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Suspicious Pkgs</span>
            <Activity className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-mono text-2xl font-black text-blue-400">
            {kpis.suspiciousShipments}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Network flag count</span>
            <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 5: Affected stores */}
        <div
          id="kpi-affected-stores"
          onClick={() => {
            const el = document.getElementById('section-store-risk');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer shadow-xs group"
          title="Click to view Affected Stores"
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Affected Stores</span>
            <Building className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-mono text-2xl font-black text-emerald-400">
            {kpis.affectedStores}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Dispensing centers</span>
            <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 6: High-risk suppliers */}
        <div
          id="kpi-high-risk-suppliers"
          onClick={() => {
            const el = document.getElementById('section-supplier-risk');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 transition-all cursor-pointer shadow-xs group"
          title="Click to view High-Risk Suppliers"
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>High-Risk Dist.</span>
            <Truck className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-mono text-2xl font-black text-rose-300">
            {kpis.highRiskSuppliers}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Distributor entities</span>
            <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* SECTION 4A: SUSPICIOUS ACTIVITY TREND (7d / 30d / 90d Breakdown) */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Suspicious Activity Trend Breakdown
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-category anomaly velocity aggregated across verified hospital network dock receiving bays.
            </p>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            {(['7d', '30d', '90d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Last {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
            <span>Duplicate Serials</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-purple-500 inline-block" />
            <span>Packaging Anomalies</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
            <span>Cold-Chain Violations</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-blue-500 inline-block" />
            <span>Missing Handoffs</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-cyan-500 inline-block" />
            <span>Batch Inconsistencies</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
            <span>Expiry Mismatches</span>
          </span>
        </div>

        {/* Stacked Bar Trend Chart */}
        <div className="space-y-2.5 pt-2">
          {trendData.map((item) => {
            const dupW = (item.duplicateSerials / maxTrendTotal) * 100;
            const packW = (item.packagingAnomalies / maxTrendTotal) * 100;
            const coldW = (item.coldChainViolations / maxTrendTotal) * 100;
            const handW = (item.missingHandoffs / maxTrendTotal) * 100;
            const batW = (item.batchInconsistencies / maxTrendTotal) * 100;
            const expW = (item.expiryMismatches / maxTrendTotal) * 100;

            return (
              <div key={item.period} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">{item.period}</span>
                  <span className="text-purple-300 font-bold">{item.total} anomalies flagged</span>
                </div>
                <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                  <div style={{ width: `${dupW}%` }} className="h-full bg-rose-500" title={`Duplicate Serials: ${item.duplicateSerials}`} />
                  <div style={{ width: `${packW}%` }} className="h-full bg-purple-500" title={`Packaging: ${item.packagingAnomalies}`} />
                  <div style={{ width: `${coldW}%` }} className="h-full bg-amber-500" title={`Cold Chain: ${item.coldChainViolations}`} />
                  <div style={{ width: `${handW}%` }} className="h-full bg-blue-500" title={`Missing Handoff: ${item.missingHandoffs}`} />
                  <div style={{ width: `${batW}%` }} className="h-full bg-cyan-500" title={`Batch Inconsistency: ${item.batchInconsistencies}`} />
                  <div style={{ width: `${expW}%` }} className="h-full bg-emerald-500" title={`Expiry Mismatch: ${item.expiryMismatches}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 6: REPEAT-OFFENDER & RECURRING PATTERN DETECTION */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Recurring Pattern & Cross-Store Anomaly Detection
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated multi-entity pattern detection engine identifying clustered anomalies across stores, suppliers, and transit corridors.
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            {RECURRING_PATTERNS_DETECTED.length} High-Risk Patterns Flagged
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RECURRING_PATTERNS_DETECTED.map((pat) => (
            <div
              key={pat.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3 hover:border-purple-500/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      pat.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {pat.severity}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {pat.frequency}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">
                  {pat.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {pat.description}
                </p>

                {/* Associated Entities Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {pat.associatedEntities.map((ent, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300"
                    >
                      {ent}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="text-[11px] font-bold text-purple-300">
                  {pat.recommendation}
                </div>

                <button
                  onClick={() => onNavigateToIncidents('ALL', pat.severity)}
                  className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Investigate</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4B: GEOGRAPHIC RISK MAP & CORRIDOR INTELLIGENCE (Interactive Google Map) */}
      <GoogleMapsProvider>
        <RegulatorRiskMap
          incidents={incidents}
          onOpenIncidentDetail={onOpenIncidentDetail}
          onOpenEntityProfile={onOpenEntityProfile}
          onNavigateToIncidents={onNavigateToIncidents}
        />
      </GoogleMapsProvider>

      {/* SECTION 4B.5: END-TO-END SUPPLY CHAIN TRACEABILITY & BROKEN CHAIN ANOMALY INSPECTOR */}
      <SupplyChainTraceability />

      {/* SECTION 4C & 4D: SUPPLIER & STORE RISK INTELLIGENCE MATRICES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4C: SUPPLIER REGULATORY RISK */}
        <div id="section-supplier-risk" className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Supplier Compliance & Risk
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">5 Monitored</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-2">Supplier</th>
                  <th className="py-2.5 px-2 text-center">Shipments (Sus/Q)</th>
                  <th className="py-2.5 px-2 text-center">Rate</th>
                  <th className="py-2.5 px-2 text-center">Avg Risk</th>
                  <th className="py-2.5 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {SUPPLIER_REGULATORY_RISKS.map((sup) => (
                  <tr
                    key={sup.supplier}
                    onClick={() => {
                      const entityId = sup.supplier === 'MedRoute Distributors' ? 'SUP-MEDROUTE' : 'SUP-BIOLOGIX';
                      onOpenEntityProfile(entityId, 'supplier');
                    }}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-2 font-semibold text-white truncate max-w-[140px]">
                      {sup.supplier}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono">
                      {sup.totalShipments} <span className="text-rose-400">({sup.suspiciousShipments}/{sup.quarantinedShipments})</span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-amber-400">
                      {sup.incidentRate}%
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-white">
                      {sup.avgRiskScore}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          sup.reviewStatus === 'Escalated'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : sup.reviewStatus === 'Watchlist'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : sup.reviewStatus === 'Under Review'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {sup.reviewStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4D: STORE REGULATORY RISK */}
        <div id="section-store-risk" className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Store Compliance & Risk
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">6 Monitored</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-2">Store / Location</th>
                  <th className="py-2.5 px-2 text-center">Shipments</th>
                  <th className="py-2.5 px-2 text-center">Incidents</th>
                  <th className="py-2.5 px-2 text-center">Avg Risk</th>
                  <th className="py-2.5 px-2 text-right">Review Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {STORE_REGULATORY_RISKS.map((st) => (
                  <tr
                    key={st.storeId}
                    onClick={() => onOpenEntityProfile(st.storeId, 'store')}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-2">
                      <div className="font-semibold text-white truncate max-w-[140px]">{st.storeName}</div>
                      <div className="text-[10px] text-slate-400">{st.location}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono">
                      {st.totalShipments}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-rose-400">
                      {st.incidentCount}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-white">
                      {st.avgRiskScore}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          st.reviewStatus === 'Escalated' || st.reviewStatus === 'Investigation Active'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : st.reviewStatus === 'Requires Review'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {st.reviewStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5: HOLOGRAM VERIFICATION INTELLIGENCE & REPEATED FAILURE OVERSIGHT */}
      {(() => {
        const holoStats = unifiedStore.getHologramStats();

        return (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <h2 className="text-base font-bold uppercase tracking-wider text-white">
                    Hologram Verification Intelligence & Regulatory Oversight
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Analytical telemetry on physical optical security hologram checks, failure rates, and suspicious supplier trends.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950 px-3 py-1 rounded-lg border border-blue-500/30">
                {holoStats.totalChecks} Total Hologram Inspections
              </span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Checks Passed</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{holoStats.passedCount}</div>
                <span className="text-[10px] text-emerald-400 font-medium">Authentic Hologram Pattern</span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Anomalies Flagged</span>
                <div className="text-2xl font-black font-mono text-rose-400 mt-1">{holoStats.flaggedCount}</div>
                <span className="text-[10px] text-rose-400 font-medium">Reflectance Mismatch / Counterfeit</span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Unable to Verify</span>
                <div className="text-2xl font-black font-mono text-amber-400 mt-1">{holoStats.unableToVerifyCount}</div>
                <span className="text-[10px] text-amber-400 font-medium">Missing Sample / Poor Image</span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Repeated Failure Batches</span>
                <div className="text-2xl font-black font-mono text-purple-400 mt-1">{holoStats.repeatedFailures.length}</div>
                <span className="text-[10px] text-purple-400 font-medium">Targeted Regulatory Audit</span>
              </div>
            </div>

            {/* Repeated Failures & Recent Hologram Incidents Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              {/* Repeated Failures */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 uppercase text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Batches with Repeated Hologram Anomalies</span>
                </span>

                {holoStats.repeatedFailures.length === 0 ? (
                  <p className="text-slate-500 italic text-[11px]">No repeated hologram failure patterns detected across active batches.</p>
                ) : (
                  <div className="space-y-2">
                    {holoStats.repeatedFailures.map((rf) => (
                      <div key={rf.batchNumber} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white font-mono">{rf.batchNumber}</div>
                          <div className="text-[11px] text-slate-400">{rf.medicineName} • {rf.supplier}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-rose-400 text-xs">{rf.failureCount} Flagged Checks</span>
                          <div className="text-[10px] text-slate-500">{rf.lastChecked}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Incidents Log */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 uppercase text-[11px] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span>Recent Hologram Verification Logs</span>
                </span>

                <div className="space-y-2">
                  {holoStats.recentIncidents.map((inc) => (
                    <div key={inc.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{inc.medicineName} ({inc.batchNumber})</div>
                        <div className="text-[10px] text-slate-400">{inc.supplier} • {inc.timestamp}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {inc.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
