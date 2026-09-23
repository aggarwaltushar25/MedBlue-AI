/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ExecutiveKPIs,
  VerificationTrendDay,
  RiskDistribution,
  SupplierHeatmapEntry,
  HighPriorityAlert,
  VerificationHealthData,
  ColdChainAttentionShipment,
  TopSupplier,
  ActivityEvent,
  SupplierPerformance,
  CategoryRisk,
  GeographicRisk,
  ColdChainExcursion,
  RiskDriver,
  PredictedLoadDay,
  ReportSummary,
  ShipmentVerification,
} from '../types';

import {
  EXECUTIVE_KPIS,
  VERIFICATION_TREND_14_DAYS,
  RISK_DISTRIBUTION_SUMMARY,
  SUPPLIER_HEATMAP_DATA,
  HIGH_PRIORITY_ALERTS,
  VERIFICATION_HEALTH,
  COLD_CHAIN_ATTENTION,
  TOP_SUPPLIERS_VOLUME,
  RECENT_ACTIVITY_TIMELINE,
  OUTCOMES_OVER_TIME_30_DAYS,
  RISK_SCORE_HISTOGRAM,
  SUPPLIER_PERFORMANCE_DATA,
  MEDICINE_CATEGORY_RISK_DATA,
  TOP_RISK_DRIVERS,
  GEOGRAPHIC_RISK_DATA,
  COLD_CHAIN_EXCURSIONS_LIST,
  PREDICTED_LOAD_FORECAST,
  INITIAL_REPORTS_LIST,
  ALL_SHIPMENTS,
} from '../data/mockData';

// Fetch helper with fallback to mock data
async function fetchWithFallback<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export const api = {
  getKPIs: async (): Promise<ExecutiveKPIs> => {
    return fetchWithFallback('/api/analytics/kpis', EXECUTIVE_KPIS);
  },

  getVerificationTrend: async (days = 14): Promise<VerificationTrendDay[]> => {
    return fetchWithFallback(
      `/api/analytics/verification-trend?days=${days}`,
      days <= 14 ? VERIFICATION_TREND_14_DAYS.slice(-days) : (OUTCOMES_OVER_TIME_30_DAYS.slice(-days) as unknown as VerificationTrendDay[])
    );
  },

  getRiskDistribution: async (): Promise<RiskDistribution> => {
    return fetchWithFallback('/api/analytics/risk-distribution', RISK_DISTRIBUTION_SUMMARY);
  },

  getRiskHistogram: async () => {
    return fetchWithFallback('/api/analytics/risk-histogram', RISK_SCORE_HISTOGRAM);
  },

  getSupplierHeatmap: async (): Promise<SupplierHeatmapEntry[]> => {
    return fetchWithFallback('/api/analytics/supplier-risk-heatmap', SUPPLIER_HEATMAP_DATA);
  },

  getActionRequired: async (): Promise<HighPriorityAlert[]> => {
    return fetchWithFallback('/api/analytics/action-required', HIGH_PRIORITY_ALERTS);
  },

  getVerificationHealth: async (): Promise<VerificationHealthData> => {
    return fetchWithFallback('/api/analytics/verification-health', VERIFICATION_HEALTH);
  },

  getColdChainAttention: async (): Promise<ColdChainAttentionShipment> => {
    return fetchWithFallback('/api/analytics/cold-chain-attention', COLD_CHAIN_ATTENTION);
  },

  getTopSuppliers: async (): Promise<TopSupplier[]> => {
    return fetchWithFallback('/api/analytics/top-suppliers', TOP_SUPPLIERS_VOLUME);
  },

  getRecentActivity: async (): Promise<ActivityEvent[]> => {
    return fetchWithFallback('/api/analytics/recent-activity', RECENT_ACTIVITY_TIMELINE);
  },

  getOutcomesOverTime: async () => {
    return fetchWithFallback('/api/analytics/outcomes-over-time', OUTCOMES_OVER_TIME_30_DAYS);
  },

  getSupplierPerformance: async (): Promise<SupplierPerformance[]> => {
    return fetchWithFallback('/api/analytics/supplier-performance', SUPPLIER_PERFORMANCE_DATA);
  },

  getMedicineCategoryRisk: async (): Promise<CategoryRisk[]> => {
    return fetchWithFallback('/api/analytics/medicine-category-risk', MEDICINE_CATEGORY_RISK_DATA);
  },

  getTopRiskDrivers: async (): Promise<RiskDriver[]> => {
    return fetchWithFallback('/api/analytics/top-risk-drivers', TOP_RISK_DRIVERS);
  },

  getGeographicRisk: async (): Promise<GeographicRisk[]> => {
    return fetchWithFallback('/api/analytics/geographic-risk', GEOGRAPHIC_RISK_DATA);
  },

  getColdChainExcursions: async (): Promise<ColdChainExcursion[]> => {
    return fetchWithFallback('/api/analytics/cold-chain-excursions', COLD_CHAIN_EXCURSIONS_LIST);
  },

  getPredictedLoad: async (days = 7): Promise<PredictedLoadDay[]> => {
    return fetchWithFallback(`/api/analytics/predicted-load?days=${days}`, PREDICTED_LOAD_FORECAST);
  },

  getReports: async (): Promise<ReportSummary[]> => {
    return fetchWithFallback('/api/reports/recent', INITIAL_REPORTS_LIST);
  },

  generateReport: async (reportType: string, dateRange: string, format: 'pdf' | 'csv'): Promise<ReportSummary> => {
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, dateRange, format }),
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const data = await res.json();
      return data.report;
    } catch {
      return {
        id: `REP-${Date.now()}`,
        name: `${reportType.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.${format}`,
        type: reportType,
        dateRange,
        generatedAt: 'Just now',
        format,
        fileSize: format === 'pdf' ? '1.8 MB' : '520 KB',
      };
    }
  },

  getShipments: async (params: {
    status?: string;
    supplier?: string;
    category?: string;
    riskMin?: number;
    riskMax?: number;
    search?: string;
    page?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.supplier) query.set('supplier', params.supplier);
    if (params.category) query.set('category', params.category);
    if (params.riskMin !== undefined) query.set('riskMin', String(params.riskMin));
    if (params.riskMax !== undefined) query.set('riskMax', String(params.riskMax));
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.sortField) query.set('sortField', params.sortField);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    try {
      const res = await fetch(`/api/analytics/verifications?${query.toString()}`);
      if (!res.ok) throw new Error('Failed');
      return await res.json();
    } catch {
      // Local client filtering fallback
      let list = [...ALL_SHIPMENTS];
      if (params.status && params.status !== 'All') {
        list = list.filter((s) => s.status.toLowerCase() === params.status?.toLowerCase());
      }
      if (params.supplier && params.supplier !== 'All suppliers' && params.supplier !== 'All') {
        list = list.filter((s) => s.supplier === params.supplier);
      }
      if (params.category && params.category !== 'All categories' && params.category !== 'All') {
        list = list.filter((s) => s.category === params.category);
      }
      if (params.riskMin !== undefined) {
        list = list.filter((s) => s.riskScore >= params.riskMin!);
      }
      if (params.riskMax !== undefined) {
        list = list.filter((s) => s.riskScore <= params.riskMax!);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (s) =>
            s.id.toLowerCase().includes(q) ||
            s.medicineName.toLowerCase().includes(q) ||
            s.supplier.toLowerCase().includes(q) ||
            s.batchNumber.toLowerCase().includes(q) ||
            s.primaryIssue.toLowerCase().includes(q)
        );
      }

      if (params.sortField) {
        const field = params.sortField as keyof ShipmentVerification;
        const mult = params.sortOrder === 'desc' ? -1 : 1;
        list.sort((a, b) => {
          const vA = a[field] ?? '';
          const vB = b[field] ?? '';
          if (typeof vA === 'number' && typeof vB === 'number') return (vA - vB) * mult;
          return String(vA).localeCompare(String(vB)) * mult;
        });
      }

      const page = params.page || 1;
      const limit = params.limit || 10;
      const total = list.length;
      const items = list.slice((page - 1) * limit, page * limit);
      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
  },

  getNotifications: async (recipientOrg: string, recipientRole: string): Promise<any[]> => {
    return fetchWithFallback(`/api/notifications?recipientOrg=${encodeURIComponent(recipientOrg)}&recipientRole=${recipientRole}`, []);
  },

  triggerNotification: async (notification: any): Promise<any> => {
    try {
      const res = await fetch('/api/notifications/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification),
      });
      if (!res.ok) throw new Error('Failed to trigger notification');
      return await res.json();
    } catch {
      return null;
    }
  },

  getShipmentById: async (id: string): Promise<ShipmentVerification | null> => {
    try {
      const res = await fetch(`/api/analytics/verifications/${id}`);
      if (!res.ok) throw new Error('Not found');
      return await res.json();
    } catch {
      return ALL_SHIPMENTS.find((s) => s.id.toLowerCase() === id.toLowerCase()) || null;
    }
  },
};
