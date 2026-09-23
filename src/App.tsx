/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header, AppNavTab } from './components/Header';
import { KPISection } from './components/KPISection';
import { VerificationTrendChart } from './components/VerificationTrendChart';
import { RiskDistributionChart } from './components/RiskDistributionChart';
import { RecentVerificationsTable } from './components/RecentVerificationsTable';
import { RiskHeatmap } from './components/RiskHeatmap';
import { ActionRequiredCard } from './components/ActionRequiredCard';
import { VerificationHealthCard } from './components/VerificationHealthCard';
import { ColdChainAttentionCard } from './components/ColdChainAttentionCard';
import { TopSuppliersCard } from './components/TopSuppliersCard';
import { ActivityTimelineCard } from './components/ActivityTimelineCard';
import { AnalyticsPage } from './components/AnalyticsPage';
import { AlertsView } from './components/AlertsView';
import { AuditLogView } from './components/AuditLogView';
import { ShipmentDetailModal } from './components/ShipmentDetailModal';
import { PatientModeView } from './components/PatientModeView';
import { ChemistModeView } from './components/ChemistModeView';
import { AdminModeView } from './components/AdminModeView';
import { CameraScannerModal } from './components/CameraScannerModal';
import { BatchForensicsView } from './components/BatchForensicsView';
import { RegulatoryIntelligenceDashboard } from './components/RegulatoryIntelligenceDashboard';
import { IncidentManagementView } from './components/IncidentManagementView';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { EntityProfileModal } from './components/EntityProfileModal';
import { BlockchainView } from './components/BlockchainView';
import { ToastNotificationCenter } from './components/ToastNotificationCenter';
import { LoginPage } from './components/LoginPage';
import { ManufacturerDashboard } from './components/ManufacturerDashboard';
import { WholesalerDashboard } from './components/WholesalerDashboard';
import { PharmacistDashboard } from './components/PharmacistDashboard';
import { NotificationsView } from './components/NotificationsView';
import { EvaluatorTestCasesModal } from './components/EvaluatorTestCasesModal';
import { MedicineImageUploadModal } from './components/MedicineImageUploadModal';
import { unifiedStore } from './services/unifiedStore';

import { api } from './services/api';
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
  ShipmentVerification,
  FilterState,
  RiskLevel,
  SupplierPerformance,
  CategoryRisk,
  GeographicRisk,
  ColdChainExcursion,
  RiskDriver,
  PredictedLoadDay,
  ReportSummary,
  UserRole,
  ScannedMedicineResult,
  RegulatoryIncident,
  EntityProfile,
  IncidentStatus,
  IncidentSeverity,
  IncidentTimelineEvent,
} from './types';

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
} from './data/mockData';

import {
  INITIAL_REGULATORY_INCIDENTS,
  STORE_REGULATORY_PROFILES,
  SUPPLIER_REGULATORY_PROFILES,
  MANUFACTURER_REGULATORY_PROFILES,
} from './data/regulatoryData';

export default function App() {
  // Authentication & Role State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('patient');

  // Navigation & Routing state
  const [activeTab, setActiveTab] = useState<AppNavTab>('dashboard');

  // Selected batch for Batch Forensics view
  const [selectedForensicsBatch, setSelectedForensicsBatch] = useState<string>('AMX-2026-081');

  // Selected shipment for Blockchain Traceability view
  const [selectedBlockchainShipment, setSelectedBlockchainShipment] = useState<string>('ALL');

  // Quick Camera Scanner State (opened from header)
  const [quickCameraOpen, setQuickCameraOpen] = useState<boolean>(false);
  const [evaluatorModalOpen, setEvaluatorModalOpen] = useState<boolean>(false);
  const [imageUploadModalOpen, setImageUploadModalOpen] = useState<boolean>(false);

  // Regulatory State
  const [incidents, setIncidents] = useState<RegulatoryIncident[]>(INITIAL_REGULATORY_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<RegulatoryIncident | null>(null);
  const [selectedEntityProfile, setSelectedEntityProfile] = useState<EntityProfile | null>(null);
  const [incidentFilterStatus, setIncidentFilterStatus] = useState<IncidentStatus | 'ALL'>('ALL');
  const [incidentFilterSeverity, setIncidentFilterSeverity] = useState<IncidentSeverity | 'ALL'>('ALL');

  // Handle URL hash or path sync for roles and tabs
  useEffect(() => {
    const handleHash = () => {
      const rawHash = window.location.hash.replace('#', '');
      const hash = rawHash.toLowerCase();
      if (hash === 'patient' || hash === 'consumer' || hash === 'client') {
        setUserRole('patient');
        setIsAuthenticated(true);
      } else if (hash === 'chemist' || hash === 'staff') {
        setUserRole('chemist');
        setIsAuthenticated(true);
      } else if (hash === 'pharmacist' || hash === 'pharmacy') {
        setUserRole('pharmacist');
        setIsAuthenticated(true);
      } else if (hash === 'wholesaler') {
        setUserRole('wholesaler');
        setIsAuthenticated(true);
      } else if (hash === 'manufacturer') {
        setUserRole('manufacturer');
        setIsAuthenticated(true);
      } else if (hash === 'admin') {
        setUserRole('admin');
        setActiveTab('dashboard');
        setIsAuthenticated(true);
      } else if (hash === 'regulatory' || hash === 'gov' || hash === 'cdsco') {
        setUserRole('regulatory');
        setActiveTab('regulatory');
        setIsAuthenticated(true);
      } else if (hash === 'login') {
        setIsAuthenticated(false);
      } else if (hash.startsWith('blockchain')) {
        setActiveTab('blockchain');
        setIsAuthenticated(true);
        const parts = rawHash.split(':');
        if (parts.length > 1 && parts[1]) {
          setSelectedBlockchainShipment(parts[1]);
        } else {
          setSelectedBlockchainShipment('ALL');
        }
      } else if (hash.startsWith('incidents') || hash.startsWith('incident')) {
        setUserRole('regulatory');
        setActiveTab('incidents');
        setIsAuthenticated(true);
        const parts = rawHash.split(':');
        if (parts.length > 1 && parts[1]) {
          const incId = parts[1];
          const found = INITIAL_REGULATORY_INCIDENTS.find((i) => i.id.toLowerCase() === incId.toLowerCase());
          if (found) setSelectedIncident(found);
        }
      } else if (hash.startsWith('store') || hash.startsWith('regulatory/store')) {
        setUserRole('regulatory');
        setIsAuthenticated(true);
        const parts = rawHash.split(':');
        const storeId = parts.length > 1 ? parts[1] : 'STORE-DEL-01';
        handleOpenEntityProfile(storeId, 'store');
      } else if (hash.startsWith('supplier') || hash.startsWith('regulatory/supplier')) {
        setUserRole('regulatory');
        setIsAuthenticated(true);
        const parts = rawHash.split(':');
        const suppId = parts.length > 1 ? parts[1] : 'SUP-MEDROUTE';
        handleOpenEntityProfile(suppId, 'supplier');
      } else if (hash === 'analytics') {
        setUserRole('admin');
        setActiveTab('analytics');
        setIsAuthenticated(true);
      } else if (hash === 'alerts') {
        setUserRole('admin');
        setActiveTab('alerts');
        setIsAuthenticated(true);
      } else if (hash === 'audit' || hash === 'audit-log') {
        setActiveTab('audit');
        setIsAuthenticated(true);
      } else if (hash.startsWith('forensics')) {
        setActiveTab('forensics');
        setIsAuthenticated(true);
        const parts = rawHash.split(':');
        if (parts.length > 1 && parts[1]) {
          setSelectedForensicsBatch(parts[1]);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleRoleSelectFromLogin = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    if (role === 'regulatory') {
      setActiveTab('regulatory');
      window.location.hash = '#regulatory';
    } else if (role === 'admin') {
      setActiveTab('dashboard');
      window.location.hash = '#admin';
    } else {
      setActiveTab('dashboard');
      window.location.hash = `#${role}`;
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    window.location.hash = '#login';
  };

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    if (role === 'regulatory') {
      setActiveTab('regulatory');
      window.location.hash = '#regulatory';
    } else if (role === 'admin') {
      setActiveTab('dashboard');
      window.location.hash = '#admin';
    } else {
      window.location.hash = `#${role}`;
    }
  };

  const handleTabChange = (tab: AppNavTab) => {
    setActiveTab(tab);
    window.location.hash = `#${tab}`;
  };

  const handleOpenBatchForensics = (batchNumber?: string) => {
    if (userRole !== 'regulatory' && userRole !== 'admin') {
      setUserRole('regulatory');
    }
    if (batchNumber) {
      setSelectedForensicsBatch(batchNumber);
      window.location.hash = `#forensics:${batchNumber}`;
    } else {
      window.location.hash = '#forensics';
    }
    setActiveTab('forensics');
  };

  const handleOpenBlockchainView = (shipmentId?: string) => {
    if (shipmentId) {
      setSelectedBlockchainShipment(shipmentId);
      window.location.hash = `#blockchain:${shipmentId}`;
    } else {
      setSelectedBlockchainShipment('ALL');
      window.location.hash = '#blockchain';
    }
    setActiveTab('blockchain');
  };

  // Regulatory Helpers
  const handleOpenIncidentDetail = (incidentId: string) => {
    const found = incidents.find((i) => i.id === incidentId);
    if (found) {
      setSelectedIncident(found);
    }
  };

  const handleOpenEntityProfile = (entityId: string, entityType: 'store' | 'supplier' | 'manufacturer') => {
    let foundProfile: EntityProfile | undefined;
    if (entityType === 'store') {
      foundProfile = STORE_REGULATORY_PROFILES[entityId] || STORE_REGULATORY_PROFILES['STORE-DEL-01'];
    } else if (entityType === 'supplier') {
      foundProfile = SUPPLIER_REGULATORY_PROFILES[entityId] || SUPPLIER_REGULATORY_PROFILES['SUP-MEDROUTE'];
    } else {
      foundProfile = MANUFACTURER_REGULATORY_PROFILES[entityId] || MANUFACTURER_REGULATORY_PROFILES['MFG-GSK'];
    }

    if (foundProfile) {
      setSelectedEntityProfile(foundProfile);
    }
  };

  const handleUpdateIncidentStatus = (incidentId: string, newStatus: IncidentStatus, notes: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const prevStatus = inc.status;
        const newTimelineEvt: IncidentTimelineEvent = {
          id: `TL-EVT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Dr. Neha Sen (CDSCO Senior Drug Inspector)',
          actorType: 'inspector',
          action: `Incident disposition transitioned to ${newStatus}`,
          reason: notes || `Official regulatory case status updated from ${prevStatus} to ${newStatus}.`,
          statusChange: {
            from: prevStatus,
            to: newStatus,
          },
          hashProof: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
        };

        const updated = {
          ...inc,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          regulatoryNotes: notes ? `${notes}\n\n${inc.regulatoryNotes || ''}` : inc.regulatoryNotes,
          timeline: [newTimelineEvt, ...inc.timeline],
        };

        if (selectedIncident && selectedIncident.id === incidentId) {
          setSelectedIncident(updated);
        }

        return updated;
      })
    );
  };

  const handleNavigateToIncidents = (filterStatus: IncidentStatus | 'ALL' = 'ALL', filterSeverity: IncidentSeverity | 'ALL' = 'ALL') => {
    setIncidentFilterStatus(filterStatus);
    setIncidentFilterSeverity(filterSeverity);
    setActiveTab('incidents');
    window.location.hash = '#incidents';
  };

  // Global & Analytics Filters State
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'Last 30 days',
    supplier: 'All suppliers',
    category: 'All categories',
    riskLevel: 'All',
    statusFilter: 'All',
    searchQuery: '',
  });

  // Data States initialized with realistic data
  const [kpiData, setKpiData] = useState<ExecutiveKPIs>(EXECUTIVE_KPIS);
  const [trendData, setTrendData] = useState<VerificationTrendDay[]>(VERIFICATION_TREND_14_DAYS);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution>(RISK_DISTRIBUTION_SUMMARY);
  const [heatmapData, setHeatmapData] = useState<SupplierHeatmapEntry[]>(SUPPLIER_HEATMAP_DATA);
  const [alerts, setAlerts] = useState<HighPriorityAlert[]>(HIGH_PRIORITY_ALERTS);
  const [healthData, setHealthData] = useState<VerificationHealthData>(VERIFICATION_HEALTH);
  const [coldChainData, setColdChainData] = useState<ColdChainAttentionShipment>(COLD_CHAIN_ATTENTION);
  const [topSuppliers, setTopSuppliers] = useState<TopSupplier[]>(TOP_SUPPLIERS_VOLUME);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(RECENT_ACTIVITY_TIMELINE);

  // Deep Analytics Data States
  const [outcomesData, setOutcomesData] = useState(OUTCOMES_OVER_TIME_30_DAYS);
  const [histogramData, setHistogramData] = useState(RISK_SCORE_HISTOGRAM);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance[]>(SUPPLIER_PERFORMANCE_DATA);
  const [categoryRiskData, setCategoryRiskData] = useState<CategoryRisk[]>(MEDICINE_CATEGORY_RISK_DATA);
  const [topRiskDrivers, setTopRiskDrivers] = useState<RiskDriver[]>(TOP_RISK_DRIVERS);
  const [geographicData, setGeographicData] = useState<GeographicRisk[]>(GEOGRAPHIC_RISK_DATA);
  const [coldChainExcursions, setColdChainExcursions] = useState<ColdChainExcursion[]>(COLD_CHAIN_EXCURSIONS_LIST);
  const [predictedLoadData, setPredictedLoadData] = useState<PredictedLoadDay[]>(PREDICTED_LOAD_FORECAST);
  const [reportsList, setReportsList] = useState<ReportSummary[]>(INITIAL_REPORTS_LIST);

  // Table pagination, sort & filter states
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('All');
  const [selectedRiskBucket, setSelectedRiskBucket] = useState<RiskLevel | undefined>(undefined);
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState<string | undefined>(undefined);
  const [sortField, setSortField] = useState<string>('verifiedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [shipmentsPageData, setShipmentsPageData] = useState<{
    items: ShipmentVerification[];
    total: number;
    totalPages: number;
  }>({
    items: ALL_SHIPMENTS.slice(0, 10),
    total: ALL_SHIPMENTS.length,
    totalPages: Math.ceil(ALL_SHIPMENTS.length / 10),
  });

  // Modal State
  const [selectedShipment, setSelectedShipment] = useState<ShipmentVerification | null>(null);

  // Fetch initial API metrics & subscribe to unifiedStore for reactive global updates
  useEffect(() => {
    const syncFromStore = () => {
      const storeShipments = unifiedStore.getShipments();
      const storeIncidents = unifiedStore.getIncidents();
      const storeAudit = unifiedStore.getAuditEvents();
      const storeKPIs = unifiedStore.getKPIs();

      setIncidents(storeIncidents);
      setActivityEvents(storeAudit);
      setKpiData(storeKPIs);
      setShipmentsPageData((prev) => ({
        ...prev,
        items: storeShipments.slice(0, 10),
        total: storeShipments.length,
        totalPages: Math.ceil(storeShipments.length / 10),
      }));
    };

    syncFromStore();
    const unsubscribe = unifiedStore.subscribe(syncFromStore);

    async function loadData() {
      try {
        const [
          kpis,
          trend,
          riskDist,
          heatmap,
          actionReq,
          health,
          coldChain,
          topSupp,
          activity,
          outcomes,
          histo,
          suppPerf,
          catRisk,
          riskDrivers,
          geoRisk,
          excursions,
          predLoad,
          reps,
        ] = await Promise.all([
          api.getKPIs(),
          api.getVerificationTrend(14),
          api.getRiskDistribution(),
          api.getSupplierHeatmap(),
          api.getActionRequired(),
          api.getVerificationHealth(),
          api.getColdChainAttention(),
          api.getTopSuppliers(),
          api.getRecentActivity(),
          api.getOutcomesOverTime(),
          api.getRiskHistogram(),
          api.getSupplierPerformance(),
          api.getMedicineCategoryRisk(),
          api.getTopRiskDrivers(),
          api.getGeographicRisk(),
          api.getColdChainExcursions(),
          api.getPredictedLoad(7),
          api.getReports(),
        ]);

        setTrendData(trend);
        setRiskDistribution(riskDist);
        setHeatmapData(heatmap);
        setAlerts(actionReq);
        setHealthData(health);
        setColdChainData(coldChain);
        setTopSuppliers(topSupp);
        setOutcomesData(outcomes);
        setHistogramData(histo);
        setSupplierPerformance(suppPerf);
        setCategoryRiskData(catRisk);
        setTopRiskDrivers(riskDrivers);
        setGeographicData(geoRisk);
        setColdChainExcursions(excursions);
        setPredictedLoadData(predLoad);
        setReportsList(reps);
      } catch (err) {
        console.warn('API error; keeping rich local data', err);
      }
    }

    loadData();

    return () => {
      unsubscribe();
    };
  }, []);

  // Load table data with filters
  const refreshTableData = useCallback(async () => {
    let riskMin: number | undefined;
    let riskMax: number | undefined;
    if (selectedRiskBucket === 'Low') {
      riskMin = 0;
      riskMax = 24;
    } else if (selectedRiskBucket === 'Medium') {
      riskMin = 25;
      riskMax = 59;
    } else if (selectedRiskBucket === 'High') {
      riskMin = 60;
      riskMax = 100;
    }

    const res = await api.getShipments({
      status: tableStatusFilter,
      supplier: selectedSupplierFilter,
      riskMin,
      riskMax,
      search: filters.searchQuery,
      page: currentPage,
      limit: 10,
      sortField,
      sortOrder,
    });

    setShipmentsPageData({
      items: res.items,
      total: res.total,
      totalPages: res.totalPages,
    });
  }, [tableStatusFilter, selectedSupplierFilter, selectedRiskBucket, filters.searchQuery, currentPage, sortField, sortOrder]);

  useEffect(() => {
    refreshTableData();
  }, [refreshTableData]);

  const handleInspectShipmentId = async (shipmentId: string) => {
    const found = await api.getShipmentById(shipmentId);
    if (found) {
      setSelectedShipment(found);
    }
  };

  const handleReviewAlert = async (alert: HighPriorityAlert) => {
    const found = await api.getShipmentById(alert.shipmentId);
    if (found) {
      setSelectedShipment(found);
    }
  };

  const handleUpdateShipmentStatus = (shipmentId: string, newStatus: 'Accepted' | 'Hold' | 'Quarantined') => {
    if (selectedShipment && selectedShipment.id === shipmentId) {
      setSelectedShipment({
        ...selectedShipment,
        status: newStatus,
      });
    }

    setShipmentsPageData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === shipmentId ? { ...item, status: newStatus } : item
      ),
    }));

    const newEvent: ActivityEvent = {
      id: `${Date.now()}`,
      type: newStatus === 'Accepted' ? 'accept' : newStatus === 'Quarantined' ? 'quarantine' : 'hold',
      timestamp: 'Just now',
      description: `Shipment ${shipmentId} manual override to ${newStatus} by Lead Pharmacist`,
      shipmentId,
      supplier: selectedShipment?.supplier || 'MedRoute Distributors',
    };
    setActivityEvents((prev) => [newEvent, ...prev]);
  };

  const handleGenerateReport = async (type: string, dateRange: string, format: 'pdf' | 'csv') => {
    const newRep = await api.generateReport(type, dateRange, format);
    setReportsList((prev) => [newRep, ...prev]);
  };

  const handleGlobalFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      dateRange: 'Last 30 days',
      supplier: 'All suppliers',
      category: 'All categories',
      riskLevel: 'All',
      statusFilter: 'All',
      searchQuery: '',
    });
    setSelectedRiskBucket(undefined);
    setSelectedSupplierFilter(undefined);
    setTableStatusFilter('All');
    setCurrentPage(1);
  };

  const openIncidentsCount = incidents.filter(
    (i) => i.status !== 'CLOSED' && i.status !== 'ACTION TAKEN'
  ).length;

  // Google Maps Quota Exceeded Banner State
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);
  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  if (!isAuthenticated) {
    return <LoginPage onSelectRole={handleRoleSelectFromLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Quota Exceeded Banner */}
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Universal Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        userRole={userRole}
        onOpenQuickCamera={() => setQuickCameraOpen(true)}
        onOpenImageUploadModal={() => setImageUploadModalOpen(true)}
        onOpenEvaluatorSuite={() => setEvaluatorModalOpen(true)}
        filters={filters}
        onClearFilters={handleClearAllFilters}
        onExportPDF={() => window.print()}
        onSignOut={handleSignOut}
        unreadAlertsCount={alerts.length}
        openIncidentsCount={openIncidentsCount}
      />

      {/* Main App Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ========================================================================= */}
        {/* ROLE 1: PATIENT / CUSTOMER MODE */}
        {/* ========================================================================= */}
        {userRole === 'patient' && (
          <div className="animate-in fade-in-50 duration-150">
            <PatientModeView
              onSwitchToChemist={() => handleRoleChange('chemist')}
              onViewForensics={handleOpenBatchForensics}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROLE: MANUFACTURER DASHBOARD */}
        {/* ========================================================================= */}
        {userRole === 'manufacturer' && (
          <div className="animate-in fade-in-50 duration-150">
            <ManufacturerDashboard />
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROLE: WHOLESALER DASHBOARD */}
        {/* ========================================================================= */}
        {userRole === 'wholesaler' && (
          <div className="animate-in fade-in-50 duration-150">
            <WholesalerDashboard />
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROLE: PHARMACIST DASHBOARD */}
        {/* ========================================================================= */}
        {userRole === 'pharmacist' && (
          <div className="animate-in fade-in-50 duration-150">
            <PharmacistDashboard />
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROLE 2: CHEMIST / PHARMACIST DOCK MODE */}
        {/* ========================================================================= */}
        {userRole === 'chemist' && (
          <div className="animate-in fade-in-50 duration-150">
            <ChemistModeView
              onAddActivity={(desc, type) => {
                const newEvt: ActivityEvent = {
                  id: `act-${Date.now()}`,
                  timestamp: 'Just now',
                  type: type === 'accept' ? 'accept' : type === 'quarantine' ? 'quarantine' : 'hold',
                  description: desc,
                  shipmentId: 'REC-INBOUND',
                  supplier: 'Pharmacy Stock Desk',
                };
                setActivityEvents((prev) => [newEvt, ...prev]);
              }}
              onViewForensics={handleOpenBatchForensics}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROLE 4: REGULATORY AUTHORITY & INTELLIGENCE MODE */}
        {/* ========================================================================= */}
        {(userRole === 'regulatory' || userRole === 'admin') && activeTab === 'regulatory' && (
          <div className="animate-in fade-in-50 duration-150">
            <RegulatoryIntelligenceDashboard
              incidents={incidents}
              onOpenIncidentDetail={handleOpenIncidentDetail}
              onOpenEntityProfile={handleOpenEntityProfile}
              onNavigateToIncidents={handleNavigateToIncidents}
              onOpenForensics={handleOpenBatchForensics}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* INCIDENT MANAGEMENT REGISTRY (Accessible by Regulatory & Admin) */}
        {/* ========================================================================= */}
        {(userRole === 'regulatory' || userRole === 'admin') && activeTab === 'incidents' && (
          <div className="animate-in fade-in-50 duration-150">
            <IncidentManagementView
              incidents={incidents}
              onOpenIncidentDetail={handleOpenIncidentDetail}
              onOpenEntityProfile={handleOpenEntityProfile}
              onOpenForensics={handleOpenBatchForensics}
              onUpdateStatus={handleUpdateIncidentStatus}
              initialFilterStatus={incidentFilterStatus}
              initialFilterSeverity={incidentFilterSeverity}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROLE 3: ADMINISTRATOR MODE */}
        {/* ========================================================================= */}
        {userRole === 'admin' && activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in-50 duration-150">
            <AdminModeView
              kpiData={kpiData}
              trendData={trendData}
              riskDistribution={riskDistribution}
              heatmapData={heatmapData}
              healthData={healthData}
              topSuppliers={topSuppliers}
              shipments={shipmentsPageData.items}
              onInspectShipment={setSelectedShipment}
              onNavigateToForensics={handleOpenBatchForensics}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* BATCH FORENSICS VIEW */}
        {/* ========================================================================= */}
        {(userRole === 'admin' || userRole === 'regulatory') && activeTab === 'forensics' && (
          <div className="animate-in fade-in-50 duration-150">
            <BatchForensicsView
              initialBatchNumber={selectedForensicsBatch}
              onBackToDashboard={() => setActiveTab(userRole === 'regulatory' ? 'regulatory' : 'dashboard')}
              onSelectShipmentId={handleInspectShipmentId}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* ANALYTICS & MACRO GRAPHS */}
        {/* ========================================================================= */}
        {userRole === 'admin' && activeTab === 'analytics' && (
          <div className="animate-in fade-in-50 duration-150">
            <AnalyticsPage
              filters={filters}
              onFilterChange={handleGlobalFilterChange}
              outcomesData={outcomesData}
              histogramData={histogramData}
              supplierPerformance={supplierPerformance}
              categoryRiskData={categoryRiskData}
              topRiskDrivers={topRiskDrivers}
              geographicData={geographicData}
              coldChainExcursions={coldChainExcursions}
              predictedLoadData={predictedLoadData}
              reportsList={reportsList}
              onGenerateReport={handleGenerateReport}
              onSelectRiskDriver={() => {
                setActiveTab('alerts');
              }}
              onSelectCategory={(cat) => {
                setFilters((prev) => ({ ...prev, category: cat }));
              }}
              onSelectSupplier={(supp) => {
                setSelectedSupplierFilter(supp);
                setActiveTab('dashboard');
              }}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* ALERTS VIEW */}
        {/* ========================================================================= */}
        {userRole === 'admin' && activeTab === 'alerts' && (
          <div className="animate-in fade-in-50 duration-150">
            <AlertsView
              alerts={alerts}
              onReviewAlert={handleReviewAlert}
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* BLOCKCHAIN TRACEABILITY & VERIFICATION VIEW */}
        {/* ========================================================================= */}
        {activeTab === 'blockchain' && (
          <div className="animate-in fade-in-50 duration-150">
            <BlockchainView
              initialShipmentId={selectedBlockchainShipment}
              onSelectShipmentId={handleInspectShipmentId}
              onOpenForensics={handleOpenBatchForensics}
              onBackToDashboard={() => setActiveTab(userRole === 'regulatory' ? 'regulatory' : 'dashboard')}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* AUDIT LOG VIEW */}
        {/* ========================================================================= */}
        {(userRole === 'admin' || userRole === 'regulatory') && activeTab === 'audit' && (
          <div className="animate-in fade-in-50 duration-150">
            <AuditLogView
              events={activityEvents}
              onSelectShipment={handleInspectShipmentId}
              onBackToDashboard={() => setActiveTab(userRole === 'regulatory' ? 'regulatory' : 'dashboard')}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* NOTIFICATIONS VIEW */}
        {/* ========================================================================= */}
        {activeTab === 'notifications' && (
          <div className="animate-in fade-in-50 duration-150">
            <NotificationsView
              onOpenShipment={(shipId) => {
                handleInspectShipmentId(shipId);
                setActiveTab('blockchain');
              }}
              onOpenBatch={(batchId) => {
                handleOpenBatchForensics(batchId);
              }}
              setActiveTab={setActiveTab}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div>
            MediShield AI™ Enterprise Pharmacy Operations & Regulatory Intelligence Platform
          </div>
          <div className="flex items-center gap-3">
            <span>GS1 EPCIS 1.2 Compliant</span>
            <span>•</span>
            <span>CDSCO Gateway Status: Operational (99.98%)</span>
          </div>
        </div>
      </footer>

      {/* Shipment Detailed Inspection Modal */}
      {selectedShipment && (
        <ShipmentDetailModal
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
          onUpdateStatus={handleUpdateShipmentStatus}
          onInspectBatchForensics={handleOpenBatchForensics}
          onViewBlockchainHistory={handleOpenBlockchainView}
        />
      )}

      {/* Regulatory Incident Detail Modal (/incidents/:id) */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          isOpen={Boolean(selectedIncident)}
          onClose={() => setSelectedIncident(null)}
          onUpdateStatus={handleUpdateIncidentStatus}
          onOpenEntityProfile={handleOpenEntityProfile}
          onOpenRelatedIncident={handleOpenIncidentDetail}
          onOpenForensics={handleOpenBatchForensics}
          onViewBlockchainHistory={handleOpenBlockchainView}
        />
      )}

      {/* Entity Profile Modal (/regulatory/stores/:id, /regulatory/suppliers/:id) */}
      {selectedEntityProfile && (
        <EntityProfileModal
          profile={selectedEntityProfile}
          isOpen={Boolean(selectedEntityProfile)}
          onClose={() => setSelectedEntityProfile(null)}
          onOpenIncident={handleOpenIncidentDetail}
          onOpenForensics={handleOpenBatchForensics}
        />
      )}

      {/* Quick Camera Scanner Modal */}
      <CameraScannerModal
        isOpen={quickCameraOpen}
        onClose={() => setQuickCameraOpen(false)}
        mode={userRole === 'patient' ? 'patient' : 'chemist'}
        onViewForensics={handleOpenBatchForensics}
      />

      {/* Evaluator Test Cases Modal */}
      <EvaluatorTestCasesModal
        isOpen={evaluatorModalOpen}
        onClose={() => setEvaluatorModalOpen(false)}
        onOpenScanner={() => setQuickCameraOpen(true)}
        onOpenBlockchain={() => handleOpenBlockchainView()}
        onOpenRegulatory={() => {
          setUserRole('regulatory');
          setActiveTab('regulatory');
        }}
        onOpenForensics={handleOpenBatchForensics}
      />

      {/* Medicine Image & Optical Hologram AI Upload Modal */}
      <MedicineImageUploadModal
        isOpen={imageUploadModalOpen}
        onClose={() => setImageUploadModalOpen(false)}
        onViewForensics={handleOpenBatchForensics}
      />

      {/* Real-Time Toast Notifications */}
      <ToastNotificationCenter />
    </div>
  );
}
