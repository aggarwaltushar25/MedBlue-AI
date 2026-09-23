/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Boxes,
  Truck,
  Building,
  Store,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Link,
  Search,
  CheckCircle2,
  Clock,
  ArrowDown,
  Layers,
  Sparkles,
  ExternalLink,
  FileCode2,
} from 'lucide-react';
import { blockchainService, BlockchainBlock } from '../services/blockchain';
import { unifiedStore } from '../services/unifiedStore';

interface SupplyChainTraceabilityProps {
  initialBatchId?: string;
  onSelectIncident?: (incidentId: string) => void;
}

export interface SupplyChainStage {
  key: string;
  title: string;
  actorRole: string;
  icon: React.ComponentType<{ className?: string }>;
  expectedEventTypes: string[];
  block?: BlockchainBlock;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'MISSING' | 'FLAGGED';
  notes?: string;
}

export const SupplyChainTraceability: React.FC<SupplyChainTraceabilityProps> = ({
  initialBatchId = 'AMX-2026-081',
  onSelectIncident,
}) => {
  const [selectedBatch, setSelectedBatch] = useState<string>(initialBatchId);
  const [chainBlocks, setChainBlocks] = useState<BlockchainBlock[]>([]);
  const [storeTick, setStoreTick] = useState<number>(0);

  useEffect(() => {
    const unsub = unifiedStore.subscribe(() => {
      setStoreTick((t) => t + 1);
    });
    return () => {
      unsub();
    };
  }, []);

  // Fetch all blocks from blockchainService
  useEffect(() => {
    const allBlocks = blockchainService.getChain();
    setChainBlocks(allBlocks);
  }, [storeTick]);

  // Available batches
  const availableBatches = useMemo(() => {
    const batchSet = new Set<string>();
    chainBlocks.forEach((b) => {
      if (b.batchId) batchSet.add(b.batchId);
    });
    return Array.from(batchSet);
  }, [chainBlocks]);

  // Filter blocks for selected batch
  const batchBlocks = useMemo(() => {
    return chainBlocks.filter(
      (b) => b.batchId.toLowerCase() === selectedBatch.toLowerCase()
    );
  }, [chainBlocks, selectedBatch]);

  // Detect Supply Chain Chain Integrity & Anomalies
  const anomalyAnalysis = useMemo(() => {
    const issues: { type: string; title: string; description: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' }[] = [];

    const hasManufactured = batchBlocks.some((b) => b.eventType === 'MANUFACTURED' || b.eventType === 'MANUFACTURER_GENESIS' || b.eventType === 'BATCH_CREATED');
    const hasDistributorRec = batchBlocks.some((b) => b.eventType === 'RECEIVED_BY_WHOLESALER' || b.eventType === 'DISTRIBUTOR_RECEIVED');
    const hasDistributorDisp = batchBlocks.some((b) => b.eventType === 'DISPATCHED_BY_WHOLESALER' || b.eventType === 'SHIPMENT_DISPATCHED');
    const hasPharmacyRec = batchBlocks.some((b) => b.eventType === 'RECEIVED_BY_PHARMACIST' || b.eventType === 'PHARMACY_RECEIVED');
    const hasDispensed = batchBlocks.some((b) => b.eventType === 'DISPENSED' || b.eventType === 'SOLD');

    // 1. Missing handoff detection
    if (hasPharmacyRec && !hasDistributorRec) {
      issues.push({
        type: 'MISSING_WHOLESALE_RECEIPT',
        title: 'Broken Handoff: Missing Wholesaler Receipt',
        description: 'Medicine received at pharmacy dock without a recorded Wholesaler Depot receipt log on the blockchain.',
        severity: 'CRITICAL',
      });
    }

    if (hasDispensed && !hasPharmacyRec) {
      issues.push({
        type: 'MISSING_PHARMACY_RECEIPT',
        title: 'Broken Handoff: Dispensed Without Receipt',
        description: 'Medicine was dispensed/sold to patient without formal pharmacist dock receipt verification.',
        severity: 'CRITICAL',
      });
    }

    // 2. Anomaly flags in event data
    const anomalyBlock = batchBlocks.find((b) => b.eventType === 'ANOMALY_FLAGGED' || b.isTampered);
    if (anomalyBlock) {
      issues.push({
        type: 'BLOCKCHAIN_ANOMALY',
        title: anomalyBlock.isTampered ? 'Cryptographic Tamper Alert' : 'Supply Chain Anomaly Detected',
        description: anomalyBlock.tamperDetails || anomalyBlock.eventData.anomalyType || 'GS1 duplicate serial collision or thermal breach flagged.',
        severity: 'CRITICAL',
      });
    }

    // 3. Cold chain breach
    const coldChainBlock = batchBlocks.find((b) => b.eventType === 'COLD_CHAIN_LOGGED');
    if (coldChainBlock && coldChainBlock.eventData?.recordedTemp > 8.0) {
      issues.push({
        type: 'COLD_CHAIN_BREACH',
        title: 'Temperature Excursion Logged',
        description: `Reefer telemetry recorded ${coldChainBlock.eventData.recordedTemp}°C (Maximum allowed: 8.0°C) for ${coldChainBlock.eventData.breachDurationMinutes || 180} minutes.`,
        severity: 'HIGH',
      });
    }

    return {
      isPristine: issues.length === 0,
      issues,
    };
  }, [batchBlocks]);

  // Standard 7-Stage Journey Mapping
  const journeyStages: SupplyChainStage[] = useMemo(() => {
    const stages: SupplyChainStage[] = [
      {
        key: 'MANUFACTURED',
        title: '1. Manufactured',
        actorRole: 'Manufacturer',
        icon: Boxes,
        expectedEventTypes: ['MANUFACTURED', 'MANUFACTURER_GENESIS', 'BATCH_CREATED'],
        status: 'MISSING',
      },
      {
        key: 'DISPATCHED_BY_MANUFACTURER',
        title: '2. Dispatched by Manufacturer',
        actorRole: 'Manufacturer',
        icon: Truck,
        expectedEventTypes: ['DISPATCHED_BY_MANUFACTURER', 'SHIPMENT_DISPATCHED'],
        status: 'MISSING',
      },
      {
        key: 'RECEIVED_BY_WHOLESALER',
        title: '3. Received by Wholesaler',
        actorRole: 'Wholesaler',
        icon: Building,
        expectedEventTypes: ['RECEIVED_BY_WHOLESALER', 'DISTRIBUTOR_RECEIVED'],
        status: 'MISSING',
      },
      {
        key: 'DISPATCHED_BY_WHOLESALER',
        title: '4. Dispatched by Wholesaler',
        actorRole: 'Wholesaler',
        icon: Truck,
        expectedEventTypes: ['DISPATCHED_BY_WHOLESALER'],
        status: 'MISSING',
      },
      {
        key: 'RECEIVED_BY_PHARMACIST',
        title: '5. Received by Pharmacist',
        actorRole: 'Pharmacist',
        icon: Store,
        expectedEventTypes: ['RECEIVED_BY_PHARMACIST', 'PHARMACY_RECEIVED'],
        status: 'MISSING',
      },
      {
        key: 'ADDED_TO_INVENTORY',
        title: '6. Added to Pharmacy Inventory',
        actorRole: 'Pharmacist',
        icon: Layers,
        expectedEventTypes: ['ADDED_TO_INVENTORY', 'MEDICINE_VERIFIED'],
        status: 'MISSING',
      },
      {
        key: 'DISPENSED',
        title: '7. Dispensed / Sold to Patient',
        actorRole: 'Pharmacist / Patient',
        icon: UserCheck,
        expectedEventTypes: ['DISPENSED', 'SOLD'],
        status: 'MISSING',
      },
    ];

    // Populate stage block matches
    return stages.map((stg) => {
      const match = batchBlocks.find((b) => stg.expectedEventTypes.includes(b.eventType));
      if (match) {
        const isFlagged = match.isTampered || match.eventType === 'ANOMALY_FLAGGED';
        return {
          ...stg,
          block: match,
          status: isFlagged ? 'FLAGGED' : 'COMPLETED',
        };
      }
      return stg;
    });
  }, [batchBlocks]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Selector & Summary */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                End-to-End Supply Chain Traceability & Blockchain Ledger
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Verifiable cryptographic custody chain from pharmaceutical manufacturing plant to patient dispensing dock.
            </p>
          </div>

          {/* Batch Selector */}
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 pl-1">Batch:</span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-white font-mono font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500"
            >
              {availableBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chain Integrity Alert Banner */}
        {!anomalyAnalysis.isPristine ? (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <span>Chain Anomalies / Discrepancies Flagged ({anomalyAnalysis.issues.length})</span>
            </div>
            <div className="space-y-1.5 pl-7 text-xs">
              {anomalyAnalysis.issues.map((iss, idx) => (
                <div key={idx} className="bg-rose-900/40 p-2.5 rounded-lg border border-rose-500/30">
                  <span className="font-bold text-white">{iss.title}:</span> {iss.description}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold">
                100% Intact Supply-Chain Hash Linkage Verified for Batch {selectedBatch}
              </span>
            </div>
            <span className="font-mono text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-200">
              SHA-256 Validated
            </span>
          </div>
        )}
      </div>

      {/* 7-Stage Chronological Handoff Timeline */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Chronological Handoff Blocks ({journeyStages.filter((s) => s.status !== 'MISSING').length}/7 Logged)</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Every handoff signed with immutable cryptographic proof
          </span>
        </div>

        <div className="relative border-l-2 border-slate-800 ml-4 space-y-6">
          {journeyStages.map((stg, idx) => {
            const IconComp = stg.icon;
            const blk = stg.block;

            return (
              <div key={stg.key} className="relative pl-8 group">
                {/* Timeline Pin Icon */}
                <div
                  className={`absolute -left-4 top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    stg.status === 'COMPLETED'
                      ? 'bg-purple-950 border-purple-500 text-purple-300 shadow-md shadow-purple-500/20'
                      : stg.status === 'FLAGGED'
                      ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-md shadow-rose-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                </div>

                {/* Stage Content Card */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    stg.status === 'COMPLETED'
                      ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      : stg.status === 'FLAGGED'
                      ? 'bg-rose-950/30 border-rose-500/40'
                      : 'bg-slate-950/30 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{stg.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-purple-300 uppercase">
                        {stg.actorRole}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        stg.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : stg.status === 'FLAGGED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {stg.status === 'COMPLETED'
                        ? 'VERIFIED'
                        : stg.status === 'FLAGGED'
                        ? 'ANOMALY DETECTED'
                        : 'PENDING HANDOFF'}
                    </span>
                  </div>

                  {/* If block exists */}
                  {blk ? (
                    <div className="space-y-3 pt-2 text-xs border-t border-slate-800/80 mt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-slate-400">
                        <div>
                          <span className="text-[10px] uppercase text-slate-500 block">Actor / Unit</span>
                          <span className="font-semibold text-white truncate block">{blk.actor}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-500 block">Timestamp</span>
                          <span className="font-mono text-slate-300 block">{blk.timestamp}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-500 block">Shipment / Batch</span>
                          <span className="font-mono text-purple-300 block">
                            {blk.shipmentId} ({blk.batchId})
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-500 block">Block Number</span>
                          <span className="font-mono font-bold text-amber-400 block">#{blk.blockNumber}</span>
                        </div>
                      </div>

                      {/* Event Details Payload */}
                      <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px] text-slate-300">
                        <div className="text-[10px] text-purple-400 uppercase font-bold tracking-wider mb-1">
                          Action Payload: {blk.eventData?.action || blk.eventType}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                          {Object.entries(blk.eventData || {}).map(([key, val]) => (
                            <div key={key} className="flex justify-between border-b border-slate-800/40 py-0.5">
                              <span className="text-slate-500">{key}:</span>
                              <span className="text-slate-200 truncate max-w-[200px]">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cryptographic Hash Pointer Link */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] font-mono bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-400 gap-1">
                        <div className="truncate max-w-full">
                          <span className="text-slate-500">PREV:</span>{' '}
                          <span className="text-slate-400">{blk.previousHash.slice(0, 16)}...</span> →{' '}
                          <span className="text-slate-500">CURR:</span>{' '}
                          <span className="text-emerald-400 font-bold">{blk.currentHash.slice(0, 16)}...</span>
                        </div>
                        <span className="text-purple-400 shrink-0">TX: {blk.transactionId}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic pt-1">
                      Handoff not yet logged for Batch {selectedBatch}. Awaiting next supply chain actor action.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HOLOGRAM SECURITY CHECKS TRAIL FOR THIS BATCH */}
      {(() => {
        const hologramChecks = unifiedStore.getHologramChecks(selectedBatch);
        const hologramRef = unifiedStore.getHologramReference(selectedBatch);

        return (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Hologram Security Verification Trail • Batch {selectedBatch}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Multi-actor hologram inspection logs connected to this batch record on the blockchain.
                </p>
              </div>

              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                hologramRef ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}>
                {hologramRef ? 'Official Reference Registered' : 'No Official Reference'}
              </span>
            </div>

            {hologramChecks.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                No hologram checks recorded yet for batch {selectedBatch}. Wholesalers or pharmacists can execute check via camera dock.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {hologramChecks.map((chk) => (
                  <div key={chk.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300 uppercase text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {chk.actorRole}
                      </span>
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        chk.result === 'PASS'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : chk.result === 'FLAGGED'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {chk.resultLabel}
                      </span>
                    </div>

                    <div className="font-medium text-white truncate">{chk.actor}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{chk.timestamp}</span>
                    </div>

                    {chk.notes && (
                      <p className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800 italic">
                        "{chk.notes}"
                      </p>
                    )}

                    {chk.blockchainTxHash && (
                      <div className="text-[10px] font-mono text-slate-500 truncate pt-1 border-t border-slate-900">
                        HASH: {chk.blockchainTxHash.slice(0, 18)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
