/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Factory,
  Boxes,
  Plus,
  Truck,
  ShieldCheck,
  QrCode,
  FileText,
  Calendar,
  MapPin,
  Thermometer,
  Layers,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  Search,
} from 'lucide-react';
import { unifiedStore } from '../services/unifiedStore';
import { blockchainService } from '../services/blockchain';
import { SupplyChainNotificationCenter } from './SupplyChainNotificationCenter';
import { SupplyChainTraceability } from './SupplyChainTraceability';

export const ManufacturerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BATCH_GENESIS' | 'CREATE_SHIPMENT' | 'OUTGOING' | 'TRACEABILITY'>('BATCH_GENESIS');
  const [storeTick, setStoreTick] = useState<number>(0);

  // Form states for creating a batch
  const [medicineName, setMedicineName] = useState<string>('Amoxicillin + Clavulanate 625mg');
  const [genericName, setGenericName] = useState<string>('Amoxicillin / Clavulanic Acid');
  const [batchNumber, setBatchNumber] = useState<string>(`AMX-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [manufacturerName, setManufacturerName] = useState<string>('GlaxoSmithKline Nashik Unit-3');
  const [mfgLocation, setMfgLocation] = useState<string>('Nashik, Maharashtra');
  const [unitsCount, setUnitsCount] = useState<number>(5000);
  const [mfgDate, setMfgDate] = useState<string>('2026-09-20');
  const [expiryDate, setExpiryDate] = useState<string>('2028-09-19');
  const [storageReqs, setStorageReqs] = useState<string>('15°C - 25°C Cool & Dry Place');
  const [generatedSerials, setGeneratedSerials] = useState<string[]>([]);

  // Hologram reference & batch packaging image uploads
  const [referenceHologramUrl, setReferenceHologramUrl] = useState<string | null>(null);
  const [batchImageUrl, setBatchImageUrl] = useState<string | null>(null);

  // Form states for dispatching shipment to wholesaler
  const [selectedBatchForShipment, setSelectedBatchForShipment] = useState<string>('AMX-2026-081');
  const [selectedWholesaler, setSelectedWholesaler] = useState<string>('MedRoute Distributors Central Depot');
  const [wholesalerLocation, setWholesalerLocation] = useState<string>('Ghaziabad Hub, UP');
  const [shipmentQuantity, setShipmentQuantity] = useState<number>(1000);
  const [carrierName, setCarrierName] = useState<string>('PharmaExpress Fleet Logistics');
  const [targetTemp, setTargetTemp] = useState<string>('15°C - 25°C');

  useEffect(() => {
    const unsub = unifiedStore.subscribe(() => setStoreTick((t) => t + 1));
    return () => {
      unsub();
    };
  }, []);

  // Generate GS1 Encrypted Serials sample
  const handleGenerateSerials = () => {
    const serials: string[] = [];
    const prefix = batchNumber.split('-')[0] || 'GEN';
    for (let i = 1; i <= 10; i++) {
      serials.push(`GS1-9874-2026-${prefix}-${i.toString().padStart(2, '0')}`);
    }
    setGeneratedSerials(serials);
  };

  useEffect(() => {
    handleGenerateSerials();
  }, [batchNumber]);

  // Handle batch genesis submit
  const handleRegisterBatch = (e: React.FormEvent) => {
    e.preventDefault();
    unifiedStore.createMedicineBatch({
      medicineName,
      genericName,
      batchNumber,
      manufacturer: manufacturerName,
      manufacturerLocation: mfgLocation,
      unitsManufactured: unitsCount,
      mfgDate,
      expiryDate,
      storageRequirements: storageReqs,
      serialNumbers: generatedSerials,
    });

    // Create Hologram Reference for the batch
    const defaultHologramSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="400" height="220">
        <rect width="400" height="220" rx="12" fill="#0f172a" />
        <rect width="400" height="220" rx="12" fill="none" stroke="#10b981" stroke-width="3" />
        <circle cx="200" cy="110" r="65" fill="none" stroke="#34d399" stroke-width="2" stroke-dasharray="4 2" />
        <text x="200" y="105" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="14" font-weight="bold">${manufacturerName.toUpperCase()}</text>
        <text x="200" y="125" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12">BATCH: ${batchNumber}</text>
        <text x="200" y="145" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="10">GS1 AUTHENTIC OVD SAMPLE</text>
      </svg>`
    )}`;

    unifiedStore.createHologramReference({
      medicineId: `MED-${batchNumber}`,
      medicineName,
      genericName,
      batchId: `BATCH-${batchNumber}`,
      batchNumber,
      manufacturerId: 'MFG-GENESIS',
      manufacturerName,
      referenceImageUrl: referenceHologramUrl || defaultHologramSvg,
      batchImageUrl: batchImageUrl || undefined,
      location: mfgLocation,
      notes: 'Official GS1 diffractive security hologram reference created at batch genesis.',
    });

    // Reset fields for next creation
    setReferenceHologramUrl(null);
    setBatchImageUrl(null);
    setBatchNumber(`AMX-2026-${Math.floor(100 + Math.random() * 900)}`);
  };

  // Handle shipment creation submit
  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    unifiedStore.createManufacturerShipment({
      batchNumber: selectedBatchForShipment,
      medicineName: 'Amoxicillin + Clavulanate 625mg',
      manufacturer: manufacturerName,
      wholesaler: selectedWholesaler,
      wholesalerLocation,
      quantity: shipmentQuantity,
      carrierName,
      targetTemp,
    });
    setActiveTab('OUTGOING');
  };

  const shipmentsList = useMemo(() => unifiedStore.getShipments(), [storeTick]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Factory className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold text-white uppercase tracking-wider">
              Manufacturer Command Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pharmaceutical Batch Genesis, Encrypted Serial Generation, and Wholesaler Dispatch Controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SupplyChainNotificationCenter
            recipientOrg={manufacturerName}
            recipientRole="Manufacturer"
            onOpenShipment={(shipId) => {
              setActiveTab('OUTGOING');
            }}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex-wrap">
          <button
            onClick={() => setActiveTab('BATCH_GENESIS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'BATCH_GENESIS'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Register Batch</span>
          </button>

          <button
            onClick={() => setActiveTab('CREATE_SHIPMENT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'CREATE_SHIPMENT'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Create Shipment</span>
          </button>

          <button
            onClick={() => setActiveTab('OUTGOING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'OUTGOING'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Outgoing Consignments ({shipmentsList.length})</span>
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
            <span>Traceability Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Batches Registered</span>
          <div className="text-2xl font-black font-mono text-white">28 Active</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            100% GS1 Compliant
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Manufactured</span>
          <div className="text-2xl font-black font-mono text-purple-400">145,000 Units</div>
          <p className="text-[11px] text-slate-400">Master batch certificates signed</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outgoing Shipments</span>
          <div className="text-2xl font-black font-mono text-amber-400">{shipmentsList.length} Consignments</div>
          <p className="text-[11px] text-slate-400">In transit to Wholesalers</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Blockchain Block Anchor</span>
          <div className="text-2xl font-black font-mono text-emerald-400">Block #{blockchainService.getChain().length + 1000}</div>
          <p className="text-[11px] text-emerald-400">SHA-256 Hash Linked</p>
        </div>
      </div>

      {/* TAB 1: REGISTER NEW MEDICINE BATCH */}
      {activeTab === 'BATCH_GENESIS' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-4 h-4 text-purple-400" />
                <span>Register New Pharmaceutical Batch & Anchor Genesis Block</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generates immutable batch ID, serial tag range, and anchors manufacturing timestamp on the blockchain.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
              GS1 EPCIS Standard
            </span>
          </div>

          <form onSubmit={handleRegisterBatch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Medicine Name
              </label>
              <input
                type="text"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Generic API Name
              </label>
              <input
                type="text"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Generated Batch Number
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                required
                className="w-full bg-slate-950 border border-purple-500/60 text-purple-300 font-mono font-bold rounded-lg p-2.5 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Manufacturer Legal Organization
              </label>
              <input
                type="text"
                value={manufacturerName}
                onChange={(e) => setManufacturerName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Manufacturing Location / Plant
              </label>
              <input
                type="text"
                value={mfgLocation}
                onChange={(e) => setMfgLocation(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Units Manufactured
              </label>
              <input
                type="number"
                value={unitsCount}
                onChange={(e) => setUnitsCount(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Manufacturing Date
              </label>
              <input
                type="date"
                value={mfgDate}
                onChange={(e) => setMfgDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Storage Temperature Requirement
              </label>
              <input
                type="text"
                value={storageReqs}
                onChange={(e) => setStorageReqs(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* HOLOGRAM & PACKAGING IMAGE SEPARATE UPLOAD SECTION */}
            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              {/* FIELD 1: REFERENCE HOLOGRAM */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Reference Hologram — Official Batch Sample</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {referenceHologramUrl ? 'Reference Available' : 'Auto Generated'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Upload official high-res diffractive security hologram sample for batch verification down the chain.
                </p>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => setReferenceHologramUrl(evt.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                  />
                </div>

                {referenceHologramUrl && (
                  <div className="mt-2 h-24 rounded-lg overflow-hidden border border-emerald-500/30 bg-slate-900 p-1">
                    <img src={referenceHologramUrl} alt="Official Reference Hologram" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              {/* FIELD 2: BATCH / BULK PACKAGING IMAGE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Boxes className="w-4 h-4" />
                    <span>Batch Packaging Image</span>
                  </span>
                  <span className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    Optional Packaging Photo
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Upload bulk packaging / shipper box sample image (separate from security hologram).
                </p>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => setBatchImageUrl(evt.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                  />
                </div>

                {batchImageUrl && (
                  <div className="mt-2 h-24 rounded-lg overflow-hidden border border-blue-500/30 bg-slate-900 p-1">
                    <img src={batchImageUrl} alt="Batch Packaging Sample" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>

            {/* Generated Serial Sample List */}
            <div className="md:col-span-2 lg:col-span-3 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-purple-400" />
                  <span>Associated GS1 Digital Tag Serial Preview</span>
                </span>
                <button
                  type="button"
                  onClick={handleGenerateSerials}
                  className="text-xs text-purple-400 hover:underline font-semibold"
                >
                  Regenerate Serials
                </button>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                {generatedSerials.map((s) => (
                  <span key={s} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-purple-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 lg:col-span-3 pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Anchor Batch Genesis on Blockchain</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: CREATE SHIPMENT TO WHOLESALER */}
      {activeTab === 'CREATE_SHIPMENT' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-400" />
                <span>Dispatch Consignment to Licensed Wholesaler</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Creates outgoing consignment manifest, assigns BLE cold chain tracking, and anchors dispatch event.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateShipment} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Select Manufactured Batch
              </label>
              <select
                value={selectedBatchForShipment}
                onChange={(e) => setSelectedBatchForShipment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-purple-500"
              >
                <option value="AMX-2026-081">AMX-2026-081 (Amoxicillin 625mg)</option>
                <option value="COV-VAX-902">COV-VAX-902 (Covaxin Boosters)</option>
                <option value="LIP-2026-442">LIP-2026-442 (Lipitor 20mg)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Destination Wholesaler / Distributor
              </label>
              <input
                type="text"
                value={selectedWholesaler}
                onChange={(e) => setSelectedWholesaler(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Wholesaler Hub Location
              </label>
              <input
                type="text"
                value={wholesalerLocation}
                onChange={(e) => setWholesalerLocation(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Quantity (Cartons / Packs)
              </label>
              <input
                type="number"
                value={shipmentQuantity}
                onChange={(e) => setShipmentQuantity(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Logistics Freight Partner
              </label>
              <input
                type="text"
                value={carrierName}
                onChange={(e) => setCarrierName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Required Transit Temperature Range
              </label>
              <input
                type="text"
                value={targetTemp}
                onChange={(e) => setTargetTemp(e.target.value)}
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
                <span>Confirm Outgoing Shipment & Sign DISPATCHED_BY_MANUFACTURER Block</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: OUTGOING SHIPMENTS */}
      {activeTab === 'OUTGOING' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Outgoing Wholesaler Consignments ({shipmentsList.length})
            </h2>
            <span className="text-xs text-slate-400 font-mono">Live Sync</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {shipmentsList.map((shp) => (
              <div
                key={shp.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-purple-300">{shp.id}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {shp.verificationStatus}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-bold text-white">{shp.medicineName}</div>
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Batch:</span>
                    <span className="font-mono text-slate-200">{shp.batchNumber}</span>
                  </div>
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Wholesaler Destination:</span>
                    <span className="text-slate-200 truncate max-w-[150px]">{shp.destinationLocation}</span>
                  </div>
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Quantity:</span>
                    <span className="font-mono text-white">{shp.quantity} Cartons</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-400 truncate">
                  TX: {shp.blockchainTxHash}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TRACEABILITY */}
      {activeTab === 'TRACEABILITY' && <SupplyChainTraceability />}
    </div>
  );
};
