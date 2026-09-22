/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Filter,
  Download,
  AlertTriangle,
  FileCheck,
  MapPin,
  TrendingUp,
  Sparkles,
  FileSpreadsheet,
  Check,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import {
  FilterState,
  SupplierPerformance,
  CategoryRisk,
  GeographicRisk,
  ColdChainExcursion,
  RiskDriver,
  PredictedLoadDay,
  ReportSummary,
} from '../types';
import { SUPPLIERS, CATEGORIES } from '../data/mockData';
import { downloadCSV } from '../utils/exportUtils';

interface AnalyticsPageProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  outcomesData: { date: string; accepted: number; hold: number; quarantined: number; total: number }[];
  histogramData: { bucket: string; count: number; isHighRisk?: boolean }[];
  supplierPerformance: SupplierPerformance[];
  categoryRiskData: CategoryRisk[];
  topRiskDrivers: RiskDriver[];
  geographicData: GeographicRisk[];
  coldChainExcursions: ColdChainExcursion[];
  predictedLoadData: PredictedLoadDay[];
  reportsList: ReportSummary[];
  onGenerateReport: (type: string, dateRange: string, format: 'pdf' | 'csv') => void;
  onSelectRiskDriver: (driverKey: string) => void;
  onSelectCategory: (category: string) => void;
  onSelectSupplier: (supplier: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  filters,
  onFilterChange,
  outcomesData,
  histogramData,
  supplierPerformance,
  categoryRiskData,
  topRiskDrivers,
  geographicData,
  coldChainExcursions,
  predictedLoadData,
  reportsList,
  onGenerateReport,
  onSelectRiskDriver,
  onSelectCategory,
  onSelectSupplier,
}) => {
  // Local state for filter bar
  const [tempRange, setTempRange] = useState(filters.dateRange || 'Last 30 days');
  const [tempSupplier, setTempSupplier] = useState(filters.supplier || 'All suppliers');
  const [tempCategory, setTempCategory] = useState(filters.category || 'All categories');
  const [tempRisk, setTempRisk] = useState(filters.riskLevel || 'All');

  // Report generation form state
  const [reportType, setReportType] = useState('Executive summary');
  const [reportDateRange, setReportDateRange] = useState('Last 30 days');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);

  // Hovered excursion detail
  const [hoveredExcursion, setHoveredExcursion] = useState<ColdChainExcursion | null>(null);

  const handleApplyFilters = () => {
    onFilterChange({
      dateRange: tempRange,
      supplier: tempSupplier,
      category: tempCategory,
      riskLevel: tempRisk as any,
    });
  };

  const handleExportOutcomesCSV = () => {
    const headers = ['Date', 'Accepted', 'Hold', 'Quarantined', 'Total'];
    const rows = outcomesData.map((d) => [d.date, d.accepted, d.hold, d.quarantined, d.total]);
    downloadCSV('verification_outcomes_30_days.csv', headers, rows);
  };

  const handleExportSuppliersCSV = () => {
    const headers = ['Supplier Name', 'Total Shipments', 'Acceptance %', 'Hold %', 'Quarantine %', 'Avg Risk Score'];
    const rows = supplierPerformance.map((s) => [
      s.supplier,
      s.totalShipments,
      `${s.acceptanceRate}%`,
      `${s.holdRate}%`,
      `${s.quarantineRate}%`,
      s.avgRiskScore,
    ]);
    downloadCSV('supplier_performance_comparison.csv', headers, rows);
  };

  const handleGenerateReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      onGenerateReport(reportType, reportDateRange, reportFormat);
      setIsGenerating(false);
      setGenerationSuccess(true);
      setTimeout(() => setGenerationSuccess(false), 3000);
    }, 600);
  };

  const handleDownloadReport = (rep: ReportSummary) => {
    if (rep.format === 'csv') {
      const headers = ['Metric', 'Value', 'Baseline Reference'];
      const rows = [
        ['Report Type', rep.type, 'N/A'],
        ['Date Range Covered', rep.dateRange, 'N/A'],
        ['Generated On', new Date().toISOString(), 'N/A'],
        ['Total Verified Batches', '184', 'Target: 180'],
        ['Accepted Rate', '88.5%', 'National Avg: 85%'],
        ['Quarantine Interceptions', '14', 'Zero-Tolerance Policy'],
      ];
      downloadCSV(rep.name, headers, rows);
    } else {
      // Mock PDF print/download
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${rep.name}</title>
              <style>
                body { font-family: sans-serif; padding: 40px; color: #1e293b; }
                h1 { color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
                .meta { margin-bottom: 24px; color: #64748b; font-size: 14px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
                th { background-color: #f1f5f9; }
              </style>
            </head>
            <body>
              <h1>MediShield AI — Official Audit Report</h1>
              <div class="meta">
                <p><strong>Report Title:</strong> ${rep.name}</p>
                <p><strong>Scope:</strong> ${rep.dateRange}</p>
                <p><strong>Generated At:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Issuing Authority:</strong> CDSCO National Hub #04 Quality Control Unit</p>
              </div>
              <table>
                <thead>
                  <tr><th>Operational Metric</th><th>Recorded Result</th><th>Compliance Status</th></tr>
                </thead>
                <tbody>
                  <tr><td>Total Received Shipments</td><td>214 Batches</td><td>Logged</td></tr>
                  <tr><td>GS1 Authenticated</td><td>184 Batches (86%)</td><td>Verified</td></tr>
                  <tr><td>Thermal Integrity Maintained</td><td>199 Batches</td><td>Standard Nominal</td></tr>
                  <tr><td>Critical Quarantines</td><td>14 Batches</td><td>CDSCO Incident Flagged</td></tr>
                </tbody>
              </table>
              <p style="margin-top: 30px; font-size: 11px; color: #94a3b8;">Digitally signed & encrypted per GS1 Healthcare Standard EPCIS 1.2.</p>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
          Supply-chain analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore verification patterns, supplier performance, and risk trends.
        </p>
      </div>

      {/* TOP FILTER BAR */}
      <section
        aria-label="Analytics Filter Bar"
        className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1">
            {/* Date Range Picker */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                Date Range
              </label>
              <select
                id="analytics-filter-date"
                value={tempRange}
                onChange={(e) => setTempRange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Last 30 days">Last 30 days (Default)</option>
                <option value="Last 7 days">Last 7 days</option>
                <option value="Last 90 days">Last 90 days</option>
                <option value="Custom">Custom Range</option>
              </select>
            </div>

            {/* Supplier Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                Supplier
              </label>
              <select
                id="analytics-filter-supplier"
                value={tempSupplier}
                onChange={(e) => setTempSupplier(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All suppliers">All suppliers</option>
                {SUPPLIERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Medicine Category Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                Category
              </label>
              <select
                id="analytics-filter-category"
                value={tempCategory}
                onChange={(e) => setTempCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All categories">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Level Filter */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                Risk Level
              </label>
              <select
                id="analytics-filter-risk"
                value={tempRisk}
                onChange={(e) => setTempRisk(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Risk Levels</option>
                <option value="Low">Low (0–24)</option>
                <option value="Medium">Medium (25–59)</option>
                <option value="High">High (60–100)</option>
              </select>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2 pt-1 lg:pt-5 shrink-0">
            <button
              id="btn-apply-analytics-filters"
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply filters</span>
            </button>

            <button
              id="btn-export-quick-report"
              onClick={() => {
                const el = document.getElementById('section-reports-generator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export report</span>
            </button>
          </div>
        </div>
      </section>

      {/* MAIN ANALYTICS GRID (60% Left, 40% Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN — DEEP METRICS (60% => lg:col-span-7 or 8) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Verification outcomes over time */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                  Verification outcomes over time
                </h3>
                <p className="text-xs text-slate-500">
                  Stacked area progression showing daily accepted, hold, and quarantined volumes
                </p>
              </div>
              <button
                id="btn-export-outcomes"
                onClick={handleExportOutcomesCSV}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                title="Export outcomes to CSV"
                aria-label="Export outcomes data to CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={outcomesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    iconType="circle"
                  />
                  <Area
                    type="monotone"
                    dataKey="accepted"
                    name="Accepted"
                    stackId="1"
                    stroke="#16A34A"
                    fill="#86EFAC"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="hold"
                    name="Hold"
                    stackId="1"
                    stroke="#D97706"
                    fill="#FDE68A"
                    fillOpacity={0.7}
                  />
                  <Area
                    type="monotone"
                    dataKey="quarantined"
                    name="Quarantined"
                    stackId="1"
                    stroke="#DC2626"
                    fill="#FCA5A5"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Summary stats */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-slate-50">
                <span className="text-slate-500 block text-[11px]">Avg. Daily Verifications</span>
                <span className="text-slate-900 font-bold text-sm">18 batches</span>
              </div>
              <div className="p-2 rounded bg-rose-50">
                <span className="text-rose-700 block text-[11px]">Quarantine Rate</span>
                <span className="text-rose-900 font-bold text-sm">7.2%</span>
              </div>
              <div className="p-2 rounded bg-amber-50">
                <span className="text-amber-700 block text-[11px]">Hold Rate</span>
                <span className="text-amber-900 font-bold text-sm">12.5%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Risk score distribution */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                  Risk score distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Histogram of batch scores (60+ bucket highlighted in critical red)
                </p>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                  <XAxis
                    dataKey="bucket"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val} shipments`, 'Frequency']}
                    labelFormatter={(label) => `Risk Range: ${label}`}
                  />
                  <Bar
                    dataKey="count"
                    shape={(props: any) => {
                      const { x, y, width, height, payload } = props;
                      const fill = payload.isHighRisk ? '#DC2626' : '#3B82F6';
                      return (
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill={fill}
                          rx={3}
                        />
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-100">
              Most shipments cluster in the low-risk range. High-risk outliers (60+) warrant immediate investigation by quality managers.
            </p>
          </div>

          {/* Card 3: Supplier performance comparison */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                  Supplier performance comparison
                </h3>
                <p className="text-xs text-slate-500">
                  Acceptance, hold, and quarantine proportions sorted by compliance
                </p>
              </div>
              <button
                onClick={handleExportSuppliersCSV}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                title="Export supplier performance"
                aria-label="Export supplier performance to CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="h-64 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="supplier"
                    tick={{ fontSize: 9, fill: '#475569' }}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val}%`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="acceptanceRate" name="Acceptance %" fill="#16A34A" rx={2} />
                  <Bar dataKey="holdRate" name="Hold %" fill="#F59E0B" rx={2} />
                  <Bar dataKey="quarantineRate" name="Quarantine %" fill="#DC2626" rx={2} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Table */}
            <div className="overflow-x-auto border-t border-slate-100 pt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-100">
                    <th className="py-2 px-2">Supplier</th>
                    <th className="py-2 px-2 text-right">Shipments</th>
                    <th className="py-2 px-2 text-right">Accept %</th>
                    <th className="py-2 px-2 text-right">Hold %</th>
                    <th className="py-2 px-2 text-right">Quarantine %</th>
                    <th className="py-2 px-2 text-right">Avg Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supplierPerformance.map((s) => (
                    <tr
                      key={s.supplier}
                      onClick={() => onSelectSupplier(s.supplier)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-2 font-medium text-slate-800 flex items-center gap-1">
                        <span>{s.supplier}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                        {s.totalShipments}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-emerald-700 font-semibold">
                        {s.acceptanceRate}%
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-amber-700">
                        {s.holdRate}%
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-rose-700 font-semibold">
                        {s.quarantineRate}%
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-900 font-bold">
                        {s.avgRiskScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 4: Medicine categories by risk */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                  Medicine categories by risk
                </h3>
                <p className="text-xs text-slate-500">
                  Average risk index across major pharmaceutical classes
                </p>
              </div>
              <span className="text-[11px] text-slate-400">Click category to filter</span>
            </div>

            <div className="space-y-3 pt-1">
              {categoryRiskData.map((cat) => {
                // Color gradient from green (low) to red (high)
                let barColor = 'bg-emerald-500';
                if (cat.avgRiskScore >= 40) barColor = 'bg-rose-600';
                else if (cat.avgRiskScore >= 25) barColor = 'bg-amber-500';

                return (
                  <button
                    key={cat.category}
                    onClick={() => onSelectCategory(cat.category)}
                    className="w-full text-left p-2 rounded-md hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800 group-hover:text-blue-700">
                        {cat.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">
                          {cat.shipmentsCount} batches ({cat.quarantineRate}% quar.)
                        </span>
                        <span className="font-bold font-mono text-slate-900">
                          {cat.avgRiskScore}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-300`}
                        style={{ width: `${(cat.avgRiskScore / 60) * 100}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              Vaccines and antibiotics show higher risk due to cold-chain requirements and higher counterfeit incidence.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN — DRILL-DOWN INSIGHTS (40% => lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 5: Top 5 risk drivers */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Top 5 risk drivers
              </h3>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Primary Interceptions
              </span>
            </div>

            <div className="space-y-2.5">
              {topRiskDrivers.map((driver) => {
                const isCritical = driver.severity === 'critical';
                const isWarning = driver.severity === 'warning';

                return (
                  <button
                    key={driver.rank}
                    id={`driver-btn-${driver.rank}`}
                    onClick={() => onSelectRiskDriver(driver.key)}
                    className="w-full text-left p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                        {driver.rank}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                        {driver.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {driver.occurrences} occurrences
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
              Duplicate serials and missing handoffs account for 62% of all high-risk detections.
            </p>
          </div>

          {/* Card 6: Geographic risk map / Table */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                  Shipments by location
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Terminal Analysis</span>
            </div>

            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">City</th>
                    <th className="py-2.5 px-3 text-right">Shipments</th>
                    <th className="py-2.5 px-3 text-right">Quar. %</th>
                    <th className="py-2.5 px-3 text-right">Avg. Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {geographicData.map((geo) => (
                    <tr
                      key={geo.city}
                      className={geo.isElevated ? 'bg-rose-50/50' : 'hover:bg-slate-50/60'}
                    >
                      <td className="py-2.5 px-3 font-medium text-slate-800 flex items-center gap-1.5">
                        <span>{geo.city}</span>
                        {geo.isElevated && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                            Elevated
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {geo.totalShipments}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-semibold ${
                          geo.isElevated ? 'text-rose-700' : 'text-slate-700'
                        }`}
                      >
                        {geo.quarantineRate}%
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-bold ${
                          geo.isElevated ? 'text-rose-700' : 'text-slate-900'
                        }`}
                      >
                        {geo.avgRiskScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-100 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>Mumbai Terminal shows elevated risk (12% quarantine rate); priority audits enacted.</span>
            </p>
          </div>

          {/* Card 7: Cold-chain excursion timeline */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Cold-chain excursion timeline
              </h3>
              <span className="text-[11px] font-medium text-slate-400">Past 30 Days</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Chronological temperature excursions (&gt;8°C). Hover to inspect incident metadata.
            </p>

            {/* Interactive Timeline visualization with dots */}
            <div className="relative py-4 px-2 bg-slate-50 rounded-lg border border-slate-200 overflow-x-auto">
              <div className="min-w-[360px] relative h-12 flex items-center justify-between border-b-2 border-slate-300 px-3">
                {coldChainExcursions.map((exc, i) => (
                  <div
                    key={exc.id}
                    onMouseEnter={() => setHoveredExcursion(exc)}
                    className="group relative flex flex-col items-center cursor-pointer"
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                        exc.maxTemp >= 12
                          ? 'bg-rose-700 ring-4 ring-rose-200'
                          : 'bg-rose-500 ring-2 ring-rose-200'
                      } hover:scale-125`}
                    />
                    <span className="text-[9px] text-slate-400 mt-1 font-mono">
                      #{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Excursion Hover Detail Box */}
            <div className="mt-3 p-3 bg-rose-50/60 rounded-md border border-rose-200 min-h-[72px]">
              {hoveredExcursion ? (
                <div className="text-xs">
                  <div className="flex items-center justify-between font-semibold text-rose-900 mb-1">
                    <span>{hoveredExcursion.shipmentId} • {hoveredExcursion.medicine}</span>
                    <span className="font-mono text-rose-700">{hoveredExcursion.date}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600 text-[11px]">
                    <span>Peak Temp: <strong className="text-rose-700">{hoveredExcursion.maxTemp}°C</strong></span>
                    <span>Duration: <strong className="text-slate-800">{hoveredExcursion.durationHours}h</strong></span>
                    <span>Safe Range: {hoveredExcursion.safeRange}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 flex items-center justify-center h-full">
                  <span>Hover over any excursion point above to view shipment ID, peak temp, and breach duration.</span>
                </div>
              )}
            </div>

            {/* Summary statistics */}
            <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
              <span>Total excursions: <strong className="text-slate-900">15</strong></span>
              <span>Avg breach duration: <strong className="text-slate-900">3.2 hours</strong></span>
              <span>Most common: <strong className="text-slate-900">8–12°C range</strong></span>
            </div>
          </div>

          {/* Card 8: Predicted risk for next 7 days (AI-powered) */}
          <div className="bg-white rounded-lg border border-blue-200 p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                  AI-predicted verification load
                </h3>
              </div>
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                Model: RxForecast-7D
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictedLoadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 9, fill: '#64748b' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[5, 35]}
                    tick={{ fontSize: 9, fill: '#64748b' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any, name: any) => [
                      `${val} shipments`,
                      name === 'predicted' ? 'Predicted Load' : name,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="upperBound"
                    name="Upper Bound (95% CI)"
                    stroke="#93c5fd"
                    strokeDasharray="2 2"
                    strokeWidth={1}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    name="Predicted Load"
                    stroke="#2563EB"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#2563EB' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="lowerBound"
                    name="Lower Bound (95% CI)"
                    stroke="#93c5fd"
                    strokeDasharray="2 2"
                    strokeWidth={1}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="mt-3 text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded border border-blue-100">
              Based on historical patterns, expect 15–22 verifications per day next week. Quarantine rate may increase to 9% due to seasonal supply-chain disruptions.
            </p>

            <p className="mt-2 text-[11px] text-slate-400 italic">
              Predictions are estimates based on historical data and should not be used for critical decisions without human review.
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION — EXPORTABLE REPORTS (Card 9) */}
      <section
        id="section-reports-generator"
        aria-label="Exportable Reports Section"
        className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-xs"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-700" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Generate monthly report
              </h3>
              <p className="text-xs text-slate-500">
                Produce digitally verifiable audit binders for compliance officers and regulatory reviews
              </p>
            </div>
          </div>
        </div>

        {/* Report Generation Form */}
        <form onSubmit={handleGenerateReportSubmit} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Report Type
              </label>
              <select
                id="select-report-type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-white border border-slate-200 text-xs font-medium text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Executive summary">Executive summary</option>
                <option value="Detailed verification log">Detailed verification log</option>
                <option value="Supplier performance report">Supplier performance report</option>
                <option value="Cold-chain compliance report">Cold-chain compliance report</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date Range
              </label>
              <select
                id="select-report-date-range"
                value={reportDateRange}
                onChange={(e) => setReportDateRange(e.target.value)}
                className="w-full bg-white border border-slate-200 text-xs font-medium text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Last 30 days">Last 30 days (Aug 24 – Sep 22)</option>
                <option value="August 2026">August 2026 Complete</option>
                <option value="July 2026">July 2026 Complete</option>
                <option value="Q3 2026 to date">Q3 2026 to date</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Export Format
              </label>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={reportFormat === 'pdf'}
                    onChange={() => setReportFormat('pdf')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>PDF Document</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={reportFormat === 'csv'}
                    onChange={() => setReportFormat('csv')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>CSV Dataset</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Includes SHA-256 cryptographic checksum for regulatory compliance</span>
            </span>

            <button
              id="btn-generate-report"
              type="submit"
              disabled={isGenerating}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Compiling metrics...</span>
                </>
              ) : generationSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Report ready!</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Generate report</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Recent Generated Reports List */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Recent generated reports
          </h4>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {reportsList.map((rep) => (
              <div
                key={rep.id}
                className="p-3.5 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-blue-50 text-blue-700">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{rep.name}</div>
                    <div className="text-[11px] text-slate-400">
                      Generated {rep.generatedAt} • {rep.dateRange} • {rep.fileSize}
                    </div>
                  </div>
                </div>

                <button
                  id={`btn-download-report-${rep.id}`}
                  onClick={() => handleDownloadReport(rep)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold rounded-md border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
