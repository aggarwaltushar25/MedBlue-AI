/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
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
} from './src/data/mockData';

const inMemoryReports = [...INITIAL_REPORTS_LIST];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'MediShield AI Operations Hub' });
  });

  // Executive KPIs
  app.get('/api/analytics/kpis', (req: Request, res: Response) => {
    res.json(EXECUTIVE_KPIS);
  });

  // Verification trend (last 14 days or custom)
  app.get('/api/analytics/verification-trend', (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string, 10) || 14;
    if (days <= 14) {
      res.json(VERIFICATION_TREND_14_DAYS.slice(-days));
    } else {
      res.json(OUTCOMES_OVER_TIME_30_DAYS.slice(-days));
    }
  });

  // Risk distribution
  app.get('/api/analytics/risk-distribution', (req: Request, res: Response) => {
    res.json(RISK_DISTRIBUTION_SUMMARY);
  });

  // Risk score histogram
  app.get('/api/analytics/risk-histogram', (req: Request, res: Response) => {
    res.json(RISK_SCORE_HISTOGRAM);
  });

  // Supplier performance comparison
  app.get('/api/analytics/supplier-performance', (req: Request, res: Response) => {
    res.json(SUPPLIER_PERFORMANCE_DATA);
  });

  // Medicine category risk
  app.get('/api/analytics/medicine-category-risk', (req: Request, res: Response) => {
    res.json(MEDICINE_CATEGORY_RISK_DATA);
  });

  // Geographic risk
  app.get('/api/analytics/geographic-risk', (req: Request, res: Response) => {
    res.json(GEOGRAPHIC_RISK_DATA);
  });

  // Cold chain excursions
  app.get('/api/analytics/cold-chain-excursions', (req: Request, res: Response) => {
    res.json(COLD_CHAIN_EXCURSIONS_LIST);
  });

  // Predicted load forecast (AI-powered)
  app.get('/api/analytics/predicted-load', (req: Request, res: Response) => {
    res.json(PREDICTED_LOAD_FORECAST);
  });

  // Heatmap matrix
  app.get('/api/analytics/supplier-risk-heatmap', (req: Request, res: Response) => {
    res.json(SUPPLIER_HEATMAP_DATA);
  });

  // Action required (High-priority alerts)
  app.get('/api/analytics/action-required', (req: Request, res: Response) => {
    res.json(HIGH_PRIORITY_ALERTS);
  });

  // Verification health donut data
  app.get('/api/analytics/verification-health', (req: Request, res: Response) => {
    res.json(VERIFICATION_HEALTH);
  });

  // Cold chain attention card
  app.get('/api/analytics/cold-chain-attention', (req: Request, res: Response) => {
    res.json(COLD_CHAIN_ATTENTION);
  });

  // Top suppliers by volume
  app.get('/api/analytics/top-suppliers', (req: Request, res: Response) => {
    res.json(TOP_SUPPLIERS_VOLUME);
  });

  // Recent activity timeline
  app.get('/api/analytics/recent-activity', (req: Request, res: Response) => {
    res.json(RECENT_ACTIVITY_TIMELINE);
  });

  // Top risk drivers
  app.get('/api/analytics/top-risk-drivers', (req: Request, res: Response) => {
    res.json(TOP_RISK_DRIVERS);
  });

  // 30-day outcomes over time (stacked area)
  app.get('/api/analytics/outcomes-over-time', (req: Request, res: Response) => {
    res.json(OUTCOMES_OVER_TIME_30_DAYS);
  });

  // Verifications list with filtering, sorting, pagination
  app.get('/api/analytics/verifications', (req: Request, res: Response) => {
    let filtered = [...ALL_SHIPMENTS];

    const { status, supplier, category, riskMin, riskMax, search, page = '1', limit = '10', sortField, sortOrder } = req.query;

    if (status && status !== 'All') {
      filtered = filtered.filter((s) => s.status.toLowerCase() === (status as string).toLowerCase());
    }

    if (supplier && supplier !== 'All suppliers' && supplier !== 'All') {
      filtered = filtered.filter((s) => s.supplier === supplier);
    }

    if (category && category !== 'All categories' && category !== 'All') {
      filtered = filtered.filter((s) => s.category === category);
    }

    if (riskMin !== undefined) {
      filtered = filtered.filter((s) => s.riskScore >= parseInt(riskMin as string, 10));
    }

    if (riskMax !== undefined) {
      filtered = filtered.filter((s) => s.riskScore <= parseInt(riskMax as string, 10));
    }

    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.medicineName.toLowerCase().includes(q) ||
          s.supplier.toLowerCase().includes(q) ||
          s.batchNumber.toLowerCase().includes(q) ||
          s.primaryIssue.toLowerCase().includes(q)
      );
    }

    if (sortField) {
      const field = sortField as keyof (typeof filtered)[0];
      const order = sortOrder === 'desc' ? -1 : 1;
      filtered.sort((a, b) => {
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * order;
        }
        return String(valA).localeCompare(String(valB)) * order;
      });
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 10);
    const total = filtered.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    res.json({
      items: paginated,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  });

  // Single verification detail
  app.get('/api/analytics/verifications/:id', (req: Request, res: Response) => {
    const item = ALL_SHIPMENTS.find((s) => s.id.toLowerCase() === req.params.id.toLowerCase());
    if (!item) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    res.json(item);
  });

  // Reports API
  app.get('/api/reports/recent', (req: Request, res: Response) => {
    res.json(inMemoryReports);
  });

  app.post('/api/reports/generate', (req: Request, res: Response) => {
    const { reportType = 'Executive summary', dateRange = 'Last 30 days', format = 'pdf' } = req.body;
    const newReport = {
      id: `REP-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: `${reportType.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.${format}`,
      type: reportType,
      dateRange,
      generatedAt: 'Just now',
      format: format as 'pdf' | 'csv',
      fileSize: format === 'pdf' ? '1.8 MB' : '520 KB',
    };
    inMemoryReports.unshift(newReport);
    res.json({ success: true, report: newReport });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediShield AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start MediShield AI server:', err);
});
