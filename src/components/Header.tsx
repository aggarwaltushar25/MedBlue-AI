/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldCheck,
  Activity,
  BarChart3,
  Bell,
  FileText,
  Printer,
  X,
  Building2,
  Camera,
  User,
  Store,
  Shield,
  Radio,
  ShieldAlert,
  Sparkles,
  Layers,
} from 'lucide-react';
import { FilterState, UserRole } from '../types';

export type AppNavTab =
  | 'dashboard'
  | 'analytics'
  | 'alerts'
  | 'audit'
  | 'forensics'
  | 'regulatory'
  | 'incidents';

interface HeaderProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onOpenQuickCamera: () => void;
  filters: FilterState;
  onClearFilters: () => void;
  onExportPDF: () => void;
  unreadAlertsCount?: number;
  openIncidentsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  onOpenQuickCamera,
  filters,
  onClearFilters,
  onExportPDF,
  unreadAlertsCount = 4,
  openIncidentsCount = 7,
}) => {
  const hasActiveFilters =
    filters.statusFilter !== 'All' ||
    filters.supplier !== 'All suppliers' ||
    filters.category !== 'All categories' ||
    filters.riskLevel !== 'All' ||
    Boolean(filters.searchQuery);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Role Context & Security Node */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-white">
              {userRole === 'customer'
                ? 'Patient Verification Portal • Zero Jargon'
                : userRole === 'chemist'
                ? 'Chemist Dock Terminal #4 (Delhi Regional)'
                : userRole === 'regulatory'
                ? 'CDSCO & State Drug Control Regulatory Vigilance Portal'
                : 'National Health Supply Command & Verifications'}
            </span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Blockchain Genesis Root: Validated (Block #19,482,044)</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="hidden md:inline font-mono text-[11px] text-slate-400">
            {userRole === 'customer'
              ? 'AI Consumer Safe-Med Mode'
              : userRole === 'chemist'
              ? 'Chemist Stock-Receiving Mode'
              : userRole === 'regulatory'
              ? 'Regulatory Intelligence & Case Escalation'
              : 'Admin Macro Suite'}
          </span>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        {/* Left: Brand & Identity & Patient-App Branding */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ring-4 shrink-0 transition-colors ${
                userRole === 'regulatory'
                  ? 'bg-purple-700 ring-purple-50'
                  : 'bg-blue-700 ring-blue-50'
              }`}
            >
              {userRole === 'regulatory' ? (
                <ShieldAlert className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 font-display">
                  MediShield AI
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    userRole === 'customer'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : userRole === 'chemist'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : userRole === 'regulatory'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {userRole === 'customer'
                    ? 'Patient App'
                    : userRole === 'chemist'
                    ? 'Chemist Dock'
                    : userRole === 'regulatory'
                    ? 'Gov / Regulatory'
                    : 'Admin Suite'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {userRole === 'customer'
                  ? 'Verify genuine medicine & safety'
                  : userRole === 'chemist'
                  ? 'Stock receiving & optical hologram check'
                  : userRole === 'regulatory'
                  ? 'Regulatory intelligence, pattern detection & government escalation'
                  : 'Total checking records & macro graphs'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Horizontal Role Switcher & Header Controls in a Compact Row */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 sm:gap-3">
          {/* User-Role Switcher (Horizontal compact row) */}
          <div
            id="header-role-switcher"
            className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full"
          >
            <button
              id="role-btn-customer"
              onClick={() => setUserRole('customer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                userRole === 'customer'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Patient / Customer</span>
            </button>

            <button
              id="role-btn-chemist"
              onClick={() => setUserRole('chemist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                userRole === 'chemist'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Chemist / Stock Receiver</span>
            </button>

            <button
              id="role-btn-admin"
              onClick={() => setUserRole('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                userRole === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Administrator</span>
            </button>

            <button
              id="role-btn-regulatory"
              onClick={() => setUserRole('regulatory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                userRole === 'regulatory'
                  ? 'bg-purple-700 text-white shadow-xs ring-1 ring-purple-400'
                  : 'text-purple-700 hover:text-purple-900 hover:bg-purple-100/70 font-bold'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Regulatory Authority</span>
            </button>
          </div>

          {/* Quick Camera Scan / Actions */}
          {(userRole === 'customer' || userRole === 'chemist') && (
            <button
              id="header-btn-camera"
              onClick={onOpenQuickCamera}
              className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Open Scanner</span>
            </button>
          )}

          {(userRole === 'admin' || userRole === 'regulatory') && (
            <div className="flex items-center gap-2 shrink-0">
              {hasActiveFilters && (
                <button
                  id="btn-clear-global-filters"
                  onClick={onClearFilters}
                  className="px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  title="Clear active filters"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear filters</span>
                </button>
              )}

              <button
                id="btn-export-pdf"
                onClick={onExportPDF}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export Dossier</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Regulatory Secondary Sub-Tabs (Only visible in Regulatory mode) */}
      {userRole === 'regulatory' && (
        <div className="bg-purple-950/10 border-t border-purple-200 px-4 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto">
            <button
              id="nav-tab-regulatory"
              onClick={() => setActiveTab('regulatory')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'regulatory'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-purple-900 hover:bg-purple-100/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regulatory Intelligence</span>
            </button>

            <button
              id="nav-tab-incidents"
              onClick={() => setActiveTab('incidents')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'incidents'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-purple-900 hover:bg-purple-100/80'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Incident Registry & Cases</span>
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                {openIncidentsCount}
              </span>
            </button>

            <button
              id="nav-tab-forensics-reg"
              onClick={() => setActiveTab('forensics')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'forensics'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-purple-900 hover:bg-purple-100/80'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Batch Forensics</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-200 text-purple-800">Cross-Supplier</span>
            </button>

            <button
              id="nav-tab-audit-reg"
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-purple-900 hover:bg-purple-100/80'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Gov Audit Trail</span>
            </button>
          </div>
        </div>
      )}

      {/* Admin Secondary Sub-Tabs (Only visible in Administrator mode) */}
      {userRole === 'admin' && (
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>All Checking Records & Summary</span>
            </button>

            <button
              id="nav-tab-regulatory-admin"
              onClick={() => setActiveTab('regulatory')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'regulatory'
                  ? 'bg-white text-purple-700 shadow-xs border border-purple-200 ring-1 ring-purple-300/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
              <span>Regulatory Intelligence</span>
            </button>

            <button
              id="nav-tab-incidents-admin"
              onClick={() => setActiveTab('incidents')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'incidents'
                  ? 'bg-white text-purple-700 shadow-xs border border-purple-200 ring-1 ring-purple-300/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Incidents & Escalations</span>
            </button>

            <button
              id="nav-tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Macro Graphs & Forecasts</span>
            </button>

            <button
              id="nav-tab-alerts"
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-white text-rose-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Quarantine & Risk Alerts</span>
              {unreadAlertsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-audit"
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Regulatory Audit Log</span>
            </button>

            <button
              id="nav-tab-forensics"
              onClick={() => setActiveTab('forensics')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'forensics'
                  ? 'bg-white text-purple-700 shadow-xs border border-purple-200 ring-1 ring-purple-300/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-purple-600" />
              <span>Batch Forensics</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-700">Cross-Supplier</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
