/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Building,
  Truck,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Thermometer,
  ShieldCheck,
  Search,
  ArrowRight,
  Link as LinkIcon,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { unifiedStore } from '../services/unifiedStore';
import { blockchainService } from '../services/blockchain';
import { SupplyChainTraceability } from './SupplyChainTraceability';
import { HologramVerificationPanel } from './HologramVerificationPanel';
import { SupplyChainNotificationCenter } from './SupplyChainNotificationCenter';
import { api } from '../services/api';

export const WholesalerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RECEIVE_INBOUND' | 'DISPATCH_PHARMACY' | 'HISTORY' | 'TRACEABILITY'>('RECEIVE_INBOUND');
  const [storeTick, setStoreTick] = useState<number>(0);
  const [isHologramModalOpen, setIsHologramModalOpen] = useState<boolean>(false);

  // Inbound receipt form
  const [selectedInboundShipment, setSelectedInboundShipment] = useState<string>('');
  const [wholesalerDepot, setWholesalerDepot] = useState<string>('MedRoute Distributors Central Depot');
  const [depotLocation, setDepotLocation] = useState<string>('Bay C4, Ghaziabad Hub, UP');
  const [recordedDockTemp, setRecordedDockTemp] = useState<number>(4.5);
  const [barcodeScanInput, setBarcodeScanInput] = useState<string>('');
  const [scanVerified, setScanVerified] = useState<boolean>(false);

  // Outbound dispatch form
  const [selectedWholesalerShipment, setSelectedWholesalerShipment] = useState<string>('');
  const [pharmacistName, setPharmacistName] = useState<string>('Fortis Hospital Central Pharmacy');
  const [destinationStore, setDestinationStore] = useState<string>('Fortis Delhi Retail Outlet #01');
  const [dispatchQuantity, setDispatchQuantity] = useState<number>(500);

  useEffect(() => {
    const unsub = unifiedStore.subscribe(() => setStoreTick((t) => t + 1));
    return () => {
      unsub();
    };
  }, []);

  const shipmentsList = useMemo(() => unifiedStore.getShipments(), [storeTick]);

  // Set default selected inbound shipment
  useEffect(() => {
    if (shipmentsList.length > 0 && !selectedInboundShipment) {
      setSelectedInboundShipment(shipmentsList[0].id);
      setSelectedWholesalerShipment(shipmentsList[0].id);
    }
  }, [shipmentsList]);

  // Handle barcode scan simulate
  const handleSimulateScan = () => {
    if (!selectedInboundShipment) return;
    const shp = shipmentsList.find((s) => s.id === selectedInboundShipment);
    setBarcodeScanInput(shp ? `GS1-DATAMATRIX-${shp.batchNumber}-VERIFIED` : 'GS1-9874-2026-AMX-01');
    setScanVerified(true);
  };

  // Handle receive shipment
  const handleConfirmReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInboundShipment) return;
    unifiedStore.receiveWholesalerShipment(
      selectedInboundShipment,
      wholesalerDepot,
      depotLocation,
      recordedDockTemp
    );
    setScanVerified(false);
    setBarcodeScanInput('');
  };

  // Handle dispatch to pharmacy
  const handleDispatchPharmacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWholesalerShipment) return;
    unifiedStore.dispatchWholesalerShipment({
      shipmentId: selectedWholesalerShipment,
      wholesalerName: wholesalerDepot,
      pharmacistName,
      destinationStore,
      quantity: dispatchQuantity,
    });

    // Trigger backend notification
    await api.triggerNotification({
      recipientOrg: pharmacistName,
      recipientRole: 'Pharmacist',
      type: 'NEW_SHIPMENT',
      title: 'New Shipment Dispatched',
      message: `Wholesaler ${wholesalerDepot} has dispatched ${dispatchQuantity} units to your pharmacy.`,
      shipmentId: selectedWholesalerShipment,
    });

    setActiveTab('HISTORY');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold text-white uppercase tracking-wider">
              Wholesaler & Distributor Control Hub
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Inbound Manufacturer Verification Dock, Cold Storage Auditing, and Licensed Pharmacy Dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SupplyChainNotificationCenter
            recipientOrg={wholesalerDepot}
            recipientRole="Wholesaler"
            onOpenShipment={(shipId) => {
              setSelectedInboundShipment(shipId);
              setActiveTab('RECEIVE_INBOUND');
            }}
          />

          {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex-wrap">
          <button
            onClick={() => setActiveTab('RECEIVE_INBOUND')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'RECEIVE_INBOUND'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Receive Inbound</span>
          </button>

          <button
            onClick={() => setActiveTab('DISPATCH_PHARMACY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'DISPATCH_PHARMACY'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Dispatch Pharmacy</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'HISTORY'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Depot Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('TRACEABILITY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'TRACEABILITY'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Blockchain Traceability</span>
          </button>
        </div>
      </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inbound Receipts</span>
          <div className="text-2xl font-black font-mono text-white">{shipmentsList.length} Consignments</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            RECEIVED_BY_WHOLESALER
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cold Chain Compliance</span>
          <div className="text-2xl font-black font-mono text-emerald-400">4.2°C Average</div>
          <p className="text-[11px] text-slate-400">Depot Cold Vault #C-4</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dispatched to Pharmacies</span>
          <div className="text-2xl font-black font-mono text-purple-400">18 Outbound</div>
          <p className="text-[11px] text-slate-400">DISPATCHED_BY_WHOLESALER</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hash Integrity Status</span>
          <div className="text-2xl font-black font-mono text-emerald-400">100% Intact</div>
          <p className="text-[11px] text-emerald-400">Cryptographically Signed</p>
        </div>
      </div>

      {/* TAB 1: RECEIVE INBOUND SHIPMENT */}
      {activeTab === 'RECEIVE_INBOUND' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-400" />
                <span>Receive & Verify Incoming Manufacturer Shipment</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verifies GS1 barcodes, checks cold storage temperature logs, and signs RECEIVED_BY_WHOLESALER block.
              </p>
            </div>
          </div>

          <form onSubmit={handleConfirmReceipt} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Select Arriving Consignment
              </label>
              <select
                value={selectedInboundShipment}
                onChange={(e) => setSelectedInboundShipment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-purple-500"
              >
                {shipmentsList.map((shp) => (
                  <option key={shp.id} value={shp.id}>
                    {shp.id} — {shp.medicineName} ({shp.supplier})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Wholesaler Organization Name
              </label>
              <input
                type="text"
                value={wholesalerDepot}
                onChange={(e) => setWholesalerDepot(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Warehouse Depot Location
              </label>
              <input
                type="text"
                value={depotLocation}
                onChange={(e) => setDepotLocation(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Dock Temperature Recorded (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={recordedDockTemp}
                onChange={(e) => setRecordedDockTemp(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Barcode & Hologram Verification Dock */}
            <div className="sm:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-purple-400" />
                  <span>Optical Verification & Security Hologram Check</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsHologramModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Check Hologram</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-md"
                  >
                    Simulate QR / Barcode Scan
                  </button>
                </div>
              </div>

              {scanVerified && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-between font-mono text-xs">
                  <span>Code: {barcodeScanInput}</span>
                  <span className="font-bold text-emerald-400">✓ GS1 DataMatrix Authentic</span>
                </div>
              )}
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Receipt & Sign RECEIVED_BY_WHOLESALER Block</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: DISPATCH TO PHARMACIST */}
      {activeTab === 'DISPATCH_PHARMACY' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-400" />
                <span>Create Outgoing Dispatch to Licensed Pharmacist</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dispatches verified stock from Wholesaler Depot to destination Pharmacist store.
              </p>
            </div>
          </div>

          <form onSubmit={handleDispatchPharmacy} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Wholesaler Stock Consignment
                </label>
                {(() => {
                  const selectedShp = shipmentsList.find((s) => s.id === selectedWholesalerShipment);
                  return selectedShp ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      Available: {selectedShp.quantity} units
                    </span>
                  ) : null;
                })()}
              </div>
              <select
                value={selectedWholesalerShipment}
                onChange={(e) => {
                  const shpId = e.target.value;
                  setSelectedWholesalerShipment(shpId);
                  const shp = shipmentsList.find((s) => s.id === shpId);
                  if (shp && typeof shp.quantity === 'number') {
                    setDispatchQuantity(Math.min(500, shp.quantity));
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-purple-500"
              >
                {shipmentsList.map((shp) => (
                  <option key={shp.id} value={shp.id}>
                    {shp.id} — {shp.medicineName} ({shp.batchNumber}) [Stock: {shp.quantity} units]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Destination Licensed Pharmacy
              </label>
              <input
                type="text"
                value={pharmacistName}
                onChange={(e) => setPharmacistName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Pharmacy Outlet Store Address
              </label>
              <input
                type="text"
                value={destinationStore}
                onChange={(e) => setDestinationStore(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quantity to Dispatch
                </label>
                {(() => {
                  const selectedShp = shipmentsList.find((s) => s.id === selectedWholesalerShipment);
                  return selectedShp && typeof selectedShp.quantity === 'number' && dispatchQuantity > selectedShp.quantity ? (
                    <span className="text-[10px] font-bold text-rose-400">Exceeds available stock!</span>
                  ) : null;
                })()}
              </div>
              <input
                type="number"
                min="1"
                max={shipmentsList.find((s) => s.id === selectedWholesalerShipment)?.quantity || 10000}
                value={dispatchQuantity}
                onChange={(e) => setDispatchQuantity(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Dispatch to Pharmacist & Sign DISPATCHED_BY_WHOLESALER Block</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: DEPOT LEDGER */}
      {activeTab === 'HISTORY' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Wholesaler Depot Inventory Ledger ({shipmentsList.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {shipmentsList.map((shp) => (
              <div key={shp.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-purple-300">{shp.id}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {shp.verificationStatus}
                  </span>
                </div>
                <div className="font-bold text-white">{shp.medicineName}</div>
                <div className="text-slate-400">Current Dock: {shp.currentLocation}</div>
                <div className="text-slate-400">Batch: <span className="font-mono text-slate-200">{shp.batchNumber}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TRACEABILITY */}
      {activeTab === 'TRACEABILITY' && <SupplyChainTraceability />}

      {/* HOLOGRAM VERIFICATION MODAL */}
      {(() => {
        const activeShp = shipmentsList.find((s) => s.id === selectedInboundShipment) || shipmentsList[0];
        return (
          <HologramVerificationPanel
            isOpen={isHologramModalOpen}
            onClose={() => setIsHologramModalOpen(false)}
            medicineName={activeShp?.medicineName || 'Amoxicillin 500mg Trihydrate'}
            batchNumber={activeShp?.batchNumber || 'AMX-2026-081'}
            shipmentId={activeShp?.id || 'SHP-001'}
            manufacturerName={activeShp?.supplier || 'GlaxoSmithKline Pharmaceuticals'}
            currentLocation={wholesalerDepot}
            role="wholesaler"
            actorName={wholesalerDepot}
            onActionQuarantine={(notes, evidenceUrl) => {
              unifiedStore.createRegulatoryIncident({
                title: `Hologram Verification Anomaly • Batch ${activeShp?.batchNumber || 'UNKNOWN'}`,
                severity: 'HIGH',
                store: { id: 'WHL-DEPOT', name: wholesalerDepot, location: depotLocation },
                supplier: { id: 'SUP-WHL', name: activeShp?.supplier || 'Supplier' },
                medicine: { name: activeShp?.medicineName || 'Medicine', category: 'Pharmaceuticals' },
                batchNumber: activeShp?.batchNumber || 'AMX-2026-081',
                shipmentId: activeShp?.id || 'SHP-001',
                detectionReason: `Wholesaler hologram verification flagged: ${notes}`,
                evidence: {
                  verificationRecords: ['Hologram diffractive reflectance mismatch detected on Wholesaler dock.'],
                  packagingObservations: [notes],
                  capturedHologramUrl: evidenceUrl,
                },
              });
            }}
          />
        );
      })()}
    </div>
  );
};
