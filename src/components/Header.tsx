/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  Link2,
  RotateCcw,
  Menu,
  LogOut,
} from 'lucide-react';
import { FilterState, UserRole } from '../types';
import { unifiedStore } from '../services/unifiedStore';
import { notificationService } from '../services/notificationService';

export type AppNavTab =
  | 'dashboard'
  | 'analytics'
  | 'alerts'
  | 'audit'
  | 'forensics'
  | 'regulatory'
  | 'incidents'
  | 'blockchain'
  | 'notifications';

interface HeaderProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  userRole: UserRole;
  onOpenQuickCamera: () => void;
  filters: FilterState;
  onClearFilters: () => void;
  onExportPDF: () => void;
  onSignOut?: () => void;
  unreadAlertsCount?: number;
  openIncidentsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  onOpenQuickCamera,
  filters,
  onClearFilters,
  onExportPDF,
  onSignOut,
  unreadAlertsCount = 4,
  openIncidentsCount = 7,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const hasActiveFilters =
    filters.statusFilter !== 'All' ||
    filters.supplier !== 'All suppliers' ||
    filters.category !== 'All categories' ||
    filters.riskLevel !== 'All' ||
    Boolean(filters.searchQuery);

  const handleResetDemo = () => {
    if (confirm('Reset all demo data to clean baseline state (MED-001..MED-005)?')) {
      unifiedStore.resetDemoData();
      setIsMobileMenuOpen(false);
    }
  };

  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const notifs = notificationService.getSupplyChainNotifications();
      const unread = notifs.filter((n) => n.status !== 'READ' && n.status !== 'ACTIONED').length;
      setUnreadNotifCount(unread);
    };
    update();
    const unsub = notificationService.subscribe(update);
    return () => unsub();
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Role Context, Demo Mode Indicator & Reset Demo Data */}
      <div className="bg-slate-900 text-slate-200 text-xs px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 font-medium text-slate-300 truncate">
            <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="font-semibold text-white truncate">
              {userRole === 'patient'
                ? 'Patient Verification Portal'
                : userRole === 'manufacturer'
                ? 'Manufacturer Command Hub'
                : userRole === 'wholesaler'
                ? 'Wholesaler Depot Hub'
                : userRole === 'pharmacist'
                ? 'Licensed Pharmacist Terminal'
                : userRole === 'chemist'
                ? 'Chemist Dock Terminal #4'
                : userRole === 'regulatory'
                ? 'CDSCO & State Drug Vigilance'
                : 'National Health Supply Command'}
            </span>
          </div>

          {/* Demo Mode Badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-900/80 border border-purple-500/50 text-purple-200 text-[10px] font-bold shrink-0">
            <Sparkles className="w-3 h-3 text-purple-300" />
            <span>DEMO MODE — Controlled Dataset</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              title="Switch role or log out"
            >
              <LogOut className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">Switch Role</span>
            </button>
          )}

          <button
            id="btn-reset-demo-header"
            onClick={handleResetDemo}
            className="px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset demo data to baseline state"
          >
            <RotateCcw className="w-3 h-3 text-rose-300" />
            <span className="hidden sm:inline">Reset Demo</span>
            <span className="sm:hidden">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Left: Brand & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shadow-sm ring-4 shrink-0 transition-colors ${
                userRole === 'regulatory'
                  ? 'bg-purple-700 ring-purple-50'
                  : 'bg-blue-700 ring-blue-50'
              }`}
            >
              {userRole === 'regulatory' ? (
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 font-display">
                  MediShield AI
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    userRole === 'patient'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : userRole === 'chemist'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : userRole === 'regulatory'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {userRole === 'patient'
                    ? 'Patient Workspace'
                    : userRole === 'chemist'
                    ? 'Chemist Terminal'
                    : userRole === 'regulatory'
                    ? 'Gov Regulatory Workspace'
                    : 'Admin Suite'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer relative shrink-0 ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications</span>
            {unreadNotifCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {(userRole === 'patient' || userRole === 'chemist') && (
            <button
              id="header-btn-camera"
              onClick={onOpenQuickCamera}
              className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Open Scanner</span>
            </button>
          )}

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Switch Role</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 text-white px-4 py-4 border-t border-slate-800 space-y-4 animate-in slide-in-from-top duration-200">
          {/* Active Account Identity */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Active Role Session</div>
              <div className="text-xs font-bold text-white capitalize">{userRole} Workspace</div>
            </div>
            {onSignOut && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onSignOut();
                }}
                className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Switch</span>
              </button>
            )}
          </div>

          {/* Quick Scanner Action on Mobile */}
          {(userRole === 'patient' || userRole === 'chemist') && (
            <button
              onClick={() => {
                onOpenQuickCamera();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Launch Camera Scanner</span>
            </button>
          )}

          <button
            onClick={handleResetDemo}
            className="w-full py-2.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      )}

      {/* Chemist Secondary Sub-Tabs (Only visible in Chemist mode) */}
      {userRole === 'chemist' && (
        <div className="bg-emerald-950/10 border-t border-emerald-200 px-4 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto">
            <button
              id="nav-tab-chemist-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-900 hover:bg-emerald-100/80'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Chemist Dock & Verification Terminal</span>
            </button>

            <button
              id="nav-tab-chemist-blockchain"
              onClick={() => setActiveTab('blockchain')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'blockchain'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-900 hover:bg-emerald-100/80'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Blockchain Ledger Proofs</span>
            </button>
          </div>
        </div>
      )}

      {/* Patient / Customer Secondary Sub-Tabs (Only visible in Patient mode) */}
      {userRole === 'patient' && (
        <div className="bg-blue-950/10 border-t border-blue-200 px-4 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto">
            <button
              id="nav-tab-patient-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-blue-900 hover:bg-blue-100/80'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Verify Your Medicine</span>
            </button>

            <button
              id="nav-tab-patient-blockchain"
              onClick={() => setActiveTab('blockchain')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'blockchain'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-blue-900 hover:bg-blue-100/80'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safety & Blockchain Certificate</span>
            </button>
          </div>
        </div>
      )}

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
              id="nav-tab-blockchain-reg"
              onClick={() => setActiveTab('blockchain')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'blockchain'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-purple-900 hover:bg-purple-100/80'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Blockchain Traceability</span>
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
              id="nav-tab-blockchain-admin"
              onClick={() => setActiveTab('blockchain')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'blockchain'
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200 ring-1 ring-blue-300/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Link2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Blockchain Traceability</span>
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
