/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Store,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShoppingBag,
  ShieldAlert,
  Search,
  Plus,
  Link as LinkIcon,
  Sparkles,
  FileText,
} from 'lucide-react';
import { unifiedStore } from '../services/unifiedStore';
import { blockchainService } from '../services/blockchain';
import { SupplyChainTraceability } from './SupplyChainTraceability';
import { HologramVerificationPanel } from './HologramVerificationPanel';
import { ShieldCheck } from 'lucide-react';
import { SupplyChainNotificationCenter } from './SupplyChainNotificationCenter';
import { api } from '../services/api';

export const PharmacistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RECEIVE_DOCK' | 'INVENTORY' | 'DISPENSE' | 'TRACEABILITY'>('RECEIVE_DOCK');
  const [storeTick, setStoreTick] = useState<number>(0);
  const [isHologramModalOpen, setIsHologramModalOpen] = useState<boolean>(false);

  // Receive Form
  const [selectedInboundShipment, setSelectedInboundShipment] = useState<string>('');
  const [pharmacistName, setPharmacistName] = useState<string>('Dr. Alok Verma (Lead Pharmacist)');
  const [pharmacyLocation, setPharmacyLocation] = useState<string>('Fortis Hospital Dispensing Pharmacy, Delhi');
  const [actualReceivedQty, setActualReceivedQty] = useState<number | ''>('');
  const [discrepancyNotes, setDiscrepancyNotes] = useState<string>('');

  // Add to inventory form
  const [invMedicineName, setInvMedicineName] = useState<string>('Amoxicillin + Clavulanate 625mg');
  const [invGenericName, setInvGenericName] = useState<string>('Amoxicillin / Clavulanic Acid');
  const [invCategory, setInvCategory] = useState<string>('Antibiotics');
  const [invBatchNumber, setInvBatchNumber] = useState<string>('AMX-2026-081');
  const [invSerialNumber, setInvSerialNumber] = useState<string>('GS1-9874-2026-AMX-01');
  const [invManufacturer, setInvManufacturer] = useState<string>('GlaxoSmithKline Nashik Unit-3');
  const [invSupplier, setInvSupplier] = useState<string>('MedRoute Distributors');
  const [invQuantity, setInvQuantity] = useState<number>(500);
  const [invExpiryDate, setInvExpiryDate] = useState<string>('2028-09-19');
  const [invShelfLocation, setInvShelfLocation] = useState<string>('Cold Vault Row A-04');

  // Dispatch to Chemist Form
  const [selectedInventoryForDispatch, setSelectedInventoryForDispatch] = useState<string>('');
  const [dispatchQtyToChemist, setDispatchQtyToChemist] = useState<number>(100);
  const [chemistNameInput, setChemistNameInput] = useState<string>('Amit Sharma (Senior Chemist)');
  const [chemistStationInput, setChemistStationInput] = useState<string>('Counter B-12 (OPD)');

  useEffect(() => {
    const unsub = unifiedStore.subscribe(() => setStoreTick((t) => t + 1));
    return () => {
      unsub();
    };
  }, []);

  const inventoryList = useMemo(() => unifiedStore.getInventory(), [storeTick]);
  const shipmentsList = useMemo(() => unifiedStore.getShipments(), [storeTick]);

  useEffect(() => {
    if (shipmentsList.length > 0 && !selectedInboundShipment) {
      setSelectedInboundShipment(shipmentsList[0].id);
    }
    if (inventoryList.length > 0 && !selectedInventoryForDispatch) {
      setSelectedInventoryForDispatch(inventoryList[0].id);
    }
  }, [shipmentsList, inventoryList]);

  // Handle Receive Pharmacist Shipment
  const handleConfirmReceive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInboundShipment) return;
    const shp = shipmentsList.find((s) => s.id === selectedInboundShipment);
    const qtyToReceive = typeof actualReceivedQty === 'number' ? actualReceivedQty : shp?.quantity;
    unifiedStore.receivePharmacistShipment(
      selectedInboundShipment,
      pharmacistName,
      pharmacyLocation,
      qtyToReceive,
      discrepancyNotes
    );
    setActualReceivedQty('');
    setDiscrepancyNotes('');
    setActiveTab('INVENTORY');
  };

  // Handle Add to Inventory
  const handleAddInventory = (e: React.FormEvent) => {
    e.preventDefault();
    unifiedStore.addToPharmacyInventory({
      medicineName: invMedicineName,
      genericName: invGenericName,
      category: invCategory,
      batchNumber: invBatchNumber,
      serialNumber: invSerialNumber,
      manufacturer: invManufacturer,
      supplier: invSupplier,
      shipmentId: selectedInboundShipment || 'SHP-001',
      quantity: invQuantity,
      expiryDate: invExpiryDate,
      mfgDate: '2026-09-20',
      verificationStatus: 'Verified',
      riskScore: 12,
      riskLevel: 'Low',
      location: invShelfLocation,
      coldChainCompliant: true,
      isDuplicate: false,
      isPackagingAnomaly: false,
    });
    setActiveTab('INVENTORY');
  };

  // Handle Dispatch to Chemist
  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInventoryForDispatch) return;
    
    const invItem = inventoryList.find(i => i.id === selectedInventoryForDispatch);
    
    unifiedStore.dispatchPharmacistToChemist({
      inventoryId: selectedInventoryForDispatch,
      pharmacistName,
      chemistName: chemistNameInput,
      destinationChemist: chemistStationInput,
      quantity: dispatchQtyToChemist
    });

    // Trigger backend notification for Chemist Staff (Stage 4)
    await api.triggerNotification({
      recipientOrg: chemistStationInput,
      recipientRole: 'chemist',
      type: 'NEW_DISPATCH',
      title: 'Incoming Stock from Pharmacy',
      message: `${pharmacistName} has dispatched ${dispatchQtyToChemist} units of ${invItem?.medicineName || 'medicine'} to your station.`,
      batchId: invItem?.batchNumber,
    });

    setActiveTab('INVENTORY');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold text-white uppercase tracking-wider">
              STAGE 3 — LICENSED PHARMACY DASHBOARD
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bulk Stock Receiving, Pharmaceutical Inventory Control, and Internal Dispatch to Chemist Staff (Stage 4).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SupplyChainNotificationCenter
            recipientOrg="Fortis Hospital Central Pharmacy"
            recipientRole="Pharmacist"
            onOpenShipment={(shipId) => {
              setSelectedInboundShipment(shipId);
              setActiveTab('RECEIVE_DOCK');
            }}
          />

          {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex-wrap">
          <button
            onClick={() => setActiveTab('RECEIVE_DOCK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'RECEIVE_DOCK'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Dock Receive</span>
          </button>

          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'INVENTORY'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Active Stock ({inventoryList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DISPENSE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'DISPENSE'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Dispatch to Chemist</span>
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
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inventory Items</span>
          <div className="text-2xl font-black font-mono text-white">{inventoryList.length} Active SKUs</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            ADDED_TO_INVENTORY Signed
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Stock Units</span>
          <div className="text-2xl font-black font-mono text-purple-400">
            {inventoryList.reduce((acc, i) => acc + i.quantity, 0)} Packs
          </div>
          <p className="text-[11px] text-slate-400">FEFO Expiry Compliant</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dispensed to Patients</span>
          <div className="text-2xl font-black font-mono text-emerald-400">4,280 Transactions</div>
          <p className="text-[11px] text-slate-400">DISPENSED Blocks Anchored</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quarantined Stock</span>
          <div className="text-2xl font-black font-mono text-rose-400">
            {inventoryList.filter((i) => i.verificationStatus === 'Quarantined').length} Bins
          </div>
          <p className="text-[11px] text-rose-300">Isolated in Vault</p>
        </div>
      </div>

      {/* TAB 1: RECEIVE AT PHARMACY DOCK */}
      {activeTab === 'RECEIVE_DOCK' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-400" />
                <span>Receive & Verify Inbound Wholesaler Consignment</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Scans GS1 digital matrix, verifies wholesaler hash proof, and logs RECEIVED_BY_PHARMACIST event.
              </p>
            </div>
          </div>

          <form onSubmit={handleConfirmReceive} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Select Arriving Wholesaler Consignment
              </label>
              <select
                value={selectedInboundShipment}
                onChange={(e) => setSelectedInboundShipment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-purple-500"
              >
                {shipmentsList.map((shp) => (
                  <option key={shp.id} value={shp.id}>
                    {shp.id} — {shp.medicineName} ({shp.destinationLocation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Licensed Pharmacist Name
              </label>
              <input
                type="text"
                value={pharmacistName}
                onChange={(e) => setPharmacistName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Actual Received Quantity
                  </label>
                  {(() => {
                    const shp = shipmentsList.find((s) => s.id === selectedInboundShipment);
                    return shp ? (
                      <span className="text-[10px] font-semibold text-slate-400">
                        Expected: {shp.quantity} units
                      </span>
                    ) : null;
                  })()}
                </div>
                <input
                  type="number"
                  placeholder={
                    shipmentsList.find((s) => s.id === selectedInboundShipment)?.quantity?.toString() || 'Expected quantity'
                  }
                  value={actualReceivedQty}
                  onChange={(e) => setActualReceivedQty(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Discrepancy / Condition Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10 damaged units / carton seal broken"
                  value={discrepancyNotes}
                  onChange={(e) => setDiscrepancyNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Hologram Physical Packaging Verification</span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Compare physical medicine batch hologram against official manufacturer reference.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsHologramModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Check Hologram</span>
                </button>
              </div>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Receipt & Sign RECEIVED_BY_PHARMACIST Block</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: ACTIVE INVENTORY & ADD STOCK */}
      {activeTab === 'INVENTORY' && (
        <div className="space-y-6">
          {/* Add Stock Form */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Record Stock Item into Pharmacy Inventory (ADDED_TO_INVENTORY)</span>
            </h2>

            <form onSubmit={handleAddInventory} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Medicine Name</label>
                <input
                  type="text"
                  value={invMedicineName}
                  onChange={(e) => setInvMedicineName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Batch Number</label>
                <input
                  type="text"
                  value={invBatchNumber}
                  onChange={(e) => setInvBatchNumber(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-purple-300 font-mono font-bold rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={invQuantity}
                  onChange={(e) => setInvQuantity(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Shelf / Vault Location</label>
                <input
                  type="text"
                  value={invShelfLocation}
                  onChange={(e) => setInvShelfLocation(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2 font-medium focus:outline-none"
                />
              </div>

              <div className="lg:col-span-4 pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Add to Active Inventory & Anchor ADDED_TO_INVENTORY Block</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Inventory List */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Pharmacy Dispensing Inventory ({inventoryList.length} SKUs)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {inventoryList.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-purple-300">{item.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.verificationStatus === 'Verified' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {item.verificationStatus}
                    </span>
                  </div>

                  <div className="font-bold text-white text-sm">{item.medicineName}</div>
                  <div className="text-slate-400 flex justify-between">
                    <span>Batch:</span>
                    <span className="font-mono text-slate-200">{item.batchNumber}</span>
                  </div>
                  <div className="text-slate-400 flex justify-between">
                    <span>Quantity Available:</span>
                    <span className="font-mono font-bold text-amber-400">{item.quantity} Packs</span>
                  </div>
                  <div className="text-slate-400 flex justify-between">
                    <span>Expiry:</span>
                    <span className="font-mono text-slate-200">{item.expiryDate}</span>
                  </div>
                  <div className="text-slate-400 flex justify-between">
                    <span>Shelf:</span>
                    <span className="text-slate-200">{item.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DISPATCH TO CHEMIST */}
      {activeTab === 'DISPENSE' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                <span>Dispatch Verified Stock to Chemist Staff (Stage 4)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Allocates bulk pharmacy stock to specific chemist dispensing stations for final patient delivery.
              </p>
            </div>
          </div>

          <form onSubmit={handleDispatchSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Select Active Inventory Item
              </label>
              <select
                value={selectedInventoryForDispatch}
                onChange={(e) => setSelectedInventoryForDispatch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-purple-500"
              >
                {inventoryList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.medicineName} ({item.batchNumber}) — {item.quantity} In Stock
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Quantity to Dispatch
              </label>
              <input
                type="number"
                min="1"
                value={dispatchQtyToChemist}
                onChange={(e) => setDispatchQtyToChemist(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Recipient Chemist Staff Name
              </label>
              <input
                type="text"
                value={chemistNameInput}
                onChange={(e) => setChemistNameInput(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Dispensing Station / Counter
              </label>
              <input
                type="text"
                value={chemistStationInput}
                onChange={(e) => setChemistStationInput(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Dispatch to Chemist & Sign DISPATCHED_BY_PHARMACIST Block</span>
              </button>
            </div>
          </form>
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
            currentLocation={pharmacyLocation}
            role="pharmacist"
            actorName={pharmacistName}
            onActionQuarantine={(notes, evidenceUrl) => {
              unifiedStore.createRegulatoryIncident({
                title: `Hologram Physical Packaging Anomaly • Batch ${activeShp?.batchNumber || 'UNKNOWN'}`,
                severity: 'HIGH',
                store: { id: 'PHARM-STORE', name: pharmacyLocation, location: pharmacyLocation },
                supplier: { id: 'SUP-WHL', name: activeShp?.supplier || 'Supplier' },
                medicine: { name: activeShp?.medicineName || 'Medicine', category: 'Pharmaceuticals' },
                batchNumber: activeShp?.batchNumber || 'AMX-2026-081',
                shipmentId: activeShp?.id || 'SHP-001',
                detectionReason: `Pharmacist hologram check flagged anomaly: ${notes}`,
                evidence: {
                  verificationRecords: ['Diffractive hologram mismatch observed by lead pharmacist during dock inspection.'],
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
