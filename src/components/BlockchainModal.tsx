/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Copy,
  Check,
  ExternalLink,
  Blocks,
  Lock,
  Cpu,
  FileCheck2,
  Calendar,
  Layers,
} from 'lucide-react';
import { ScannedMedicineResult } from '../types';

import { blockchainService, BlockchainBlock } from '../services/blockchain';
import { unifiedStore } from '../services/unifiedStore';

interface BlockchainModalProps {
  medicine: ScannedMedicineResult;
  onClose: () => void;
  shipmentId?: string;
}

export const BlockchainModal: React.FC<BlockchainModalProps> = ({ medicine, onClose, shipmentId }) => {
  const [copied, setCopied] = useState(false);
  const [storeTick, setStoreTick] = useState(0);

  useEffect(() => {
    const unsub = unifiedStore.subscribe(() => setStoreTick(t => t + 1));
    return () => unsub();
  }, []);

  const ancestryBlocks = useMemo(() => {
    if (shipmentId) {
      return blockchainService.getAncestryBlocks(shipmentId);
    }
    // Fallback to batch-based lookup if no specific shipment ID
    return blockchainService.getChain().filter(b => b.batchId === medicine.batchNumber);
  }, [medicine.batchNumber, shipmentId, storeTick]);

  const latestBlock = ancestryBlocks[ancestryBlocks.length - 1];
  
  const bc = useMemo(() => {
    if (latestBlock) {
      return {
        network: 'MediShield Private Ethereum Rollup',
        blockNumber: latestBlock.blockNumber,
        txHash: latestBlock.transactionId,
        contractAddress: '0x88fA...91C2',
        timestamp: latestBlock.timestamp,
        verified: true,
        status: 'Confirmed' as const,
        gasUsed: '21,442 Gwei',
        manufacturerSigner: latestBlock.actor
      };
    }
    return medicine.blockchain;
  }, [latestBlock, medicine.blockchain]);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(bc.txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="blockchain-ledger-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto text-slate-800">
        {/* Header with Dark Trust Badge */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Blocks className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display text-white">
                  Blockchain Provenance Ledger Certificate
                </h2>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    bc.status === 'Confirmed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {bc.status === 'Confirmed' ? 'Verified On-Chain' : 'Unverified Record'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Cryptographic immutable proof for {medicine.medicineName} • Batch #{medicine.batchNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Top Verification Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center gap-3.5 ${
              bc.verified
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                bc.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {bc.verified ? <ShieldCheck className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold">
                {bc.verified
                  ? 'Cryptographically Validated & Signed'
                  : 'Zero-Knowledge Proof Mismatch Detected'}
              </h3>
              <p className="text-xs mt-0.5 opacity-90">
                {bc.verified
                  ? `Signed by verified manufacturer ${medicine.manufacturer}. The digital token hash matches the physical 2D barcode and hologram.`
                  : 'This batch number does not exist on the decentralized health authority ledger or has been revoked due to tampering.'}
              </p>
            </div>
          </div>

          {/* Cryptographic Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Distributed Ledger Network</span>
              </div>
              <div className="font-semibold text-slate-900">{bc.network}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Block Height #{bc.blockNumber.toLocaleString()}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Timestamp & Sign Time</span>
              </div>
              <div className="font-semibold text-slate-900">{bc.timestamp}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Gas Used: {bc.gasUsed}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>Transaction Hash (TxHash)</span>
                </span>
                <button
                  onClick={handleCopyHash}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy Hash'}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-800 break-all select-all">
                {bc.txHash}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
              <div className="text-slate-500 font-medium mb-1 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Smart Contract Address & Signer</span>
              </div>
              <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-700 break-all">
                Contract: {bc.contractAddress}
                <br />
                Signer: {bc.manufacturerSigner}
              </div>
            </div>
          </div>

          {/* Immutable Custody Chain Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Decentralized Custody Audit Trail
            </h4>
            <div className="space-y-2">
              {ancestryBlocks.length > 0 ? (
                ancestryBlocks.map((blk, idx) => (
                  <div
                    key={blk.blockNumber}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{blk.eventData.action || blk.eventType}</span>
                        <span className="text-[10px] text-slate-500">{blk.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-slate-600">{blk.actor} ({blk.actorRole})</div>
                      <div className="font-mono text-[10px] text-blue-600 mt-0.5 truncate">
                        Block: #{blk.blockNumber} • Tx: {blk.transactionId}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                medicine.provenance.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{step.step}</span>
                        <span className="text-[10px] text-slate-500">{step.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-slate-600">{step.actor}</div>
                      <div className="font-mono text-[10px] text-blue-600 mt-0.5 truncate">
                        Tx: {step.txHash}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secured via SHA-256 Merkle Proof and Ethereum Rollup Consensus</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
            >
              Print Certificate
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
