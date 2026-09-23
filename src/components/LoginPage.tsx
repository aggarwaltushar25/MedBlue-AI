/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldCheck,
  User,
  Store,
  Shield,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building2,
  Boxes,
  RotateCcw,
  Factory,
  Truck,
  Building,
} from 'lucide-react';
import { UserRole } from '../types';
import { unifiedStore } from '../services/unifiedStore';

interface LoginPageProps {
  onSelectRole: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSelectRole }) => {
  const handleResetDemo = () => {
    unifiedStore.resetDemoData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans">
      {/* Top Banner */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg ring-4 ring-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-white font-display">
                  MediShield AI
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  National Supply Chain Ledger
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Complete End-to-End Medicine Traceability & Regulatory Intelligence Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>DEMO DATASET READY</span>
            </span>

            <button
              onClick={handleResetDemo}
              className="px-3 py-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-900/80 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-300" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Role Selection */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-300 text-xs font-medium mb-3">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>Multi-Role Supply Chain & Regulatory Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display mb-3 leading-tight">
            Complete Medicine Journey & Blockchain Verification
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Select your assigned role to open your specialized dashboard. Every handoff from manufacturer to patient is signed and linked on a single unified blockchain.
          </p>
        </div>

        {/* Role Cards Grid — 7 Roles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Manufacturer */}
          <div
            onClick={() => onSelectRole('manufacturer')}
            className="group relative bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/60 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                <Factory className="w-5 h-5" />
              </div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
                Stage 1 — Manufacturing
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                Manufacturer
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Register batch genesis, assign encrypted GS1 serial tags, set storage limits, and create shipments for wholesalers.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300">
              <span>Open Manufacturer Hub</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Wholesaler */}
          <div
            onClick={() => onSelectRole('wholesaler')}
            className="group relative bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                <Building className="w-5 h-5" />
              </div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
                Stage 2 — Wholesaler
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">
                Wholesaler / Distributor
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Scan incoming shipments, audit cold-storage reefer conditions, confirm depot receipts, and dispatch to pharmacies.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
              <span>Open Wholesaler Depot</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Pharmacist */}
          <div
            onClick={() => onSelectRole('pharmacist')}
            className="group relative bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                Stage 3 — Licensed Pharmacy
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                Pharmacist (Licensed)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Verify incoming stock, manage active inventory, enforce FEFO expiry rules, and record patient dispensing transactions.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
              <span>Open Pharmacist Terminal</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Patient / Client */}
          <div
            onClick={() => onSelectRole('customer')}
            className="group relative bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/60 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                <User className="w-5 h-5" />
              </div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
                Stage 4 — Consumer Patient
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                Patient / Client
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Scan medicine strips, upload photos, and view simplified, plain-English verification & supply-chain confirmation.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
              <span>Verify Medicine</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 5. Chemist */}
          <div
            onClick={() => onSelectRole('chemist')}
            className="group relative bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/60 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/10 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-600/20 border border-teal-500/40 flex items-center justify-center text-teal-400 mb-3 group-hover:scale-110 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-2">
                Dock Operations
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-teal-300 transition-colors">
                Chemist Staff
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Receive stock shipments, scan DataMatrix packaging, isolate suspicious batches, and manage vault quarantine.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-teal-400 group-hover:text-teal-300">
              <span>Open Chemist Dock</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 6. Admin */}
          <div
            onClick={() => onSelectRole('admin')}
            className="group relative bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-500/60 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/10 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 mb-3 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 mb-2">
                Oversight Suite
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-slate-200 transition-colors">
                Administrator
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                System operational dashboard, macro verification trends, audit logs, and cold-chain compliance oversight.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white">
              <span>Enter Admin Suite</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 7. Regulator */}
          <div
            onClick={() => onSelectRole('regulatory')}
            className="group relative bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/60 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/10 cursor-pointer flex flex-col justify-between sm:col-span-2 lg:col-span-2"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/20 mb-2">
                CDSCO & State Drug Inspection Authority
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-rose-300 transition-colors">
                Regulator & Drug Vigilance
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Investigate counterfeit rings, view interactive geographic risk maps, inspect complete blockchain supply-chain histories, and export legally anchored evidence packages.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-rose-400 group-hover:text-rose-300">
              <span>Open Regulatory Intelligence Dashboard</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Demo Dataset Reference */}
        <div className="mt-10 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Boxes className="w-5 h-5 text-blue-400 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-200 font-bold">5 Controlled Test Medicines & Linked Blockchain:</span>{' '}
              <span className="text-slate-400">
                All 7 roles operate on the same real-time medicine, batch, shipment, and SHA-256 hash-chain data.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>Cryptographically Intact</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 MediShield AI Platform • Complete Supply Chain Blockchain Architecture</span>
          <span className="font-mono text-[11px] text-slate-400">Genesis Root Block #1040 Linked</span>
        </div>
      </footer>
    </div>
  );
};
