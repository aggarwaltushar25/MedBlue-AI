/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Map,
  AdvancedMarker,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Building,
  Truck,
  Filter,
  X,
  FileText,
} from 'lucide-react';
import {
  RegulatoryIncident,
} from '../types';
import { unifiedStore } from '../services/unifiedStore';

// Static references to prevent recreation on every render
const DEFAULT_CENTER = { lat: 24.5937, lng: 78.9629 }; // Center of India
const DEFAULT_ZOOM = 5;
const ATTRIBUTION_IDS = ['gmp_mcp_codeassist_v1_aistudio'];

export interface LocationCoordinates {
  location: string;
  lat: number;
  lng: number;
  state: string;
  hubType: 'Distribution Depot' | 'Manufacturing Hub' | 'Border Transit' | 'Retail Cluster';
}

// Map of locations in India with precise coordinates
export const LOCATION_COORDINATES: Record<string, LocationCoordinates> = {
  'Delhi NCR': {
    location: 'Delhi NCR',
    lat: 28.6139,
    lng: 77.209,
    state: 'Delhi',
    hubType: 'Distribution Depot',
  },
  'Ghaziabad': {
    location: 'Ghaziabad',
    lat: 28.6692,
    lng: 77.4538,
    state: 'Uttar Pradesh',
    hubType: 'Border Transit',
  },
  'Noida': {
    location: 'Noida',
    lat: 28.5355,
    lng: 77.391,
    state: 'Uttar Pradesh',
    hubType: 'Distribution Depot',
  },
  'Gurugram': {
    location: 'Gurugram',
    lat: 28.4595,
    lng: 77.0266,
    state: 'Haryana',
    hubType: 'Distribution Depot',
  },
  'Baddi Hub': {
    location: 'Baddi Hub',
    lat: 30.9578,
    lng: 76.7914,
    state: 'Himachal Pradesh',
    hubType: 'Manufacturing Hub',
  },
  'Mumbai Corridor': {
    location: 'Mumbai Corridor',
    lat: 19.076,
    lng: 72.8777,
    state: 'Maharashtra',
    hubType: 'Distribution Depot',
  },
  'Hyderabad Pharma City': {
    location: 'Hyderabad Pharma City',
    lat: 17.385,
    lng: 78.4867,
    state: 'Telangana',
    hubType: 'Manufacturing Hub',
  },
  'Ahmedabad Zone': {
    location: 'Ahmedabad Zone',
    lat: 23.0225,
    lng: 72.5714,
    state: 'Gujarat',
    hubType: 'Manufacturing Hub',
  },
  'Bengaluru Hub': {
    location: 'Bengaluru Hub',
    lat: 12.9716,
    lng: 77.5946,
    state: 'Karnataka',
    hubType: 'Distribution Depot',
  },
};

export interface LocationRiskData {
  location: string;
  coords: LocationCoordinates;
  totalVerifications: number;
  suspiciousDetections: number;
  quarantinedCount: number;
  duplicateSerials: number;
  expiredCases: number;
  packagingAnomalies: number;
  coldChainBreaches: number;
  affectedStoresCount: number;
  affectedSuppliersCount: number;
  avgRiskScore: number;
  riskCategory: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  incidents: RegulatoryIncident[];
}

// Color helper function defined statically
const getRiskColorClasses = (category: string) => {
  switch (category) {
    case 'CRITICAL':
      return {
        bg: 'bg-rose-600',
        border: 'border-rose-400',
        text: 'text-rose-400',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        pinBg: '#E11D48',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-600',
        border: 'border-orange-400',
        text: 'text-orange-400',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        pinBg: '#EA580C',
      };
    case 'MODERATE':
      return {
        bg: 'bg-amber-500',
        border: 'border-amber-400',
        text: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        pinBg: '#F59E0B',
      };
    default:
      return {
        bg: 'bg-emerald-600',
        border: 'border-emerald-400',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        pinBg: '#10B981',
      };
  }
};

// Memoized Location Marker component
interface LocationMarkerProps {
  loc: LocationRiskData;
  isSelected: boolean;
  onSelect: (loc: LocationRiskData) => void;
}

const LocationMarker = React.memo<LocationMarkerProps>(
  ({ loc, isSelected, onSelect }) => {
    const colors = useMemo(() => getRiskColorClasses(loc.riskCategory), [loc.riskCategory]);
    const position = useMemo(() => ({ lat: loc.coords.lat, lng: loc.coords.lng }), [loc.coords.lat, loc.coords.lng]);

    const handleClick = useCallback(() => {
      onSelect(loc);
    }, [loc, onSelect]);

    return (
      <AdvancedMarker position={position} onClick={handleClick}>
        <div
          className={`relative group cursor-pointer transition-transform duration-200 ${
            isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
          }`}
        >
          <div
            className={`px-2.5 py-1 rounded-xl text-white font-bold text-[11px] shadow-lg border-2 flex items-center gap-1.5 whitespace-nowrap ${colors.bg} ${colors.border}`}
          >
            <MapPin className="w-3.5 h-3.5 text-white shrink-0" />
            <span>{loc.location}</span>
            <span className="bg-black/40 px-1.5 py-0.2 rounded text-[10px] font-mono">
              {loc.suspiciousDetections}
            </span>
          </div>
          <div
            className="w-0 h-0 mx-auto border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]"
            style={{ borderTopColor: colors.pinBg }}
          />
        </div>
      </AdvancedMarker>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.loc.location === nextProps.loc.location &&
      prevProps.loc.suspiciousDetections === nextProps.loc.suspiciousDetections &&
      prevProps.loc.riskCategory === nextProps.loc.riskCategory &&
      prevProps.loc.coords.lat === nextProps.loc.coords.lat &&
      prevProps.loc.coords.lng === nextProps.loc.coords.lng
    );
  }
);

interface RegulatorRiskMapProps {
  incidents: RegulatoryIncident[];
  onOpenIncidentDetail: (incidentId: string) => void;
  onOpenEntityProfile: (entityId: string, entityType: 'store' | 'supplier' | 'manufacturer') => void;
  onNavigateToIncidents: (filterStatus?: any, filterSeverity?: any) => void;
  selectedSupplierFilter?: string;
  onSelectSupplierFilter?: (supplierName: string | null) => void;
}

export const RegulatorRiskMap: React.FC<RegulatorRiskMapProps> = ({
  incidents,
  onOpenIncidentDetail,
  onOpenEntityProfile,
  onNavigateToIncidents,
  selectedSupplierFilter,
  onSelectSupplierFilter,
}) => {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);

  // Live Store State Listener
  const [storeTick, setStoreTick] = useState<number>(0);
  useEffect(() => {
    const unsub = unifiedStore.subscribe(() => {
      setStoreTick((t) => t + 1);
    });
    return () => {
      unsub();
    };
  }, []);

  // Map Filter States
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'>('ALL');
  const [selectedDetectionType, setSelectedDetectionType] = useState<string>('ALL');
  const [activeLocation, setActiveLocation] = useState<LocationRiskData | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  // Compute live location risk dataset from unifiedStore and props
  const locationDataList: LocationRiskData[] = useMemo(() => {
    const shipments = unifiedStore.getShipments();
    const inventory = unifiedStore.getInventory();

    return Object.keys(LOCATION_COORDINATES).map((locName) => {
      const coords = LOCATION_COORDINATES[locName];

      const locIncidents = incidents.filter(
        (i) =>
          i.store.location.toLowerCase().includes(locName.toLowerCase()) ||
          i.supplier.location.toLowerCase().includes(locName.toLowerCase()) ||
          (locName === 'Delhi NCR' && i.store.location.includes('Delhi')) ||
          (locName === 'Baddi Hub' && i.supplier.location.includes('Baddi'))
      );

      const locInventory = inventory.filter(
        (inv) =>
          inv.location.toLowerCase().includes(locName.toLowerCase()) ||
          (locName === 'Delhi NCR' && inv.location.includes('Shelf'))
      );

      const totalVerifications = 120 + locInventory.length * 15 + locIncidents.length * 10;
      const suspiciousDetections = locIncidents.length * 3 + locInventory.filter((inv) => inv.verificationStatus === 'Hold' || inv.verificationStatus === 'Quarantined').length;
      const quarantinedCount = locIncidents.length + locInventory.filter((inv) => inv.verificationStatus === 'Quarantined').length + 2;
      
      const duplicateSerials = locIncidents.filter((i) => i.title.toLowerCase().includes('duplicate') || i.title.toLowerCase().includes('collision')).length * 2 + (locName === 'Ghaziabad' ? 9 : 1);
      const expiredCases = locIncidents.filter((i) => i.title.toLowerCase().includes('expired')).length + (locName === 'Baddi Hub' ? 4 : 0);
      const packagingAnomalies = locIncidents.filter((i) => i.title.toLowerCase().includes('packaging') || i.title.toLowerCase().includes('hologram')).length + (locName === 'Delhi NCR' ? 5 : 1);
      const coldChainBreaches = locIncidents.filter((i) => i.title.toLowerCase().includes('cold') || i.title.toLowerCase().includes('temperature')).length + (locName === 'Ghaziabad' ? 3 : 0);

      const affectedStores = new Set(locIncidents.map((i) => i.store.name));
      const affectedSuppliers = new Set(locIncidents.map((i) => i.supplier.name));

      const avgRiskScore = locIncidents.length > 0
        ? Math.round(locIncidents.reduce((acc, i) => acc + i.riskScore, 0) / locIncidents.length)
        : locName === 'Ghaziabad'
        ? 88
        : locName === 'Delhi NCR'
        ? 76
        : locName === 'Noida'
        ? 52
        : 25;

      let riskCategory: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
      if (avgRiskScore >= 75) riskCategory = 'CRITICAL';
      else if (avgRiskScore >= 50) riskCategory = 'HIGH';
      else if (avgRiskScore >= 30) riskCategory = 'MODERATE';

      return {
        location: locName,
        coords,
        totalVerifications,
        suspiciousDetections,
        quarantinedCount,
        duplicateSerials,
        expiredCases,
        packagingAnomalies,
        coldChainBreaches,
        affectedStoresCount: Math.max(affectedStores.size, 1),
        affectedSuppliersCount: Math.max(affectedSuppliers.size, 1),
        avgRiskScore,
        riskCategory,
        incidents: locIncidents,
      };
    });
  }, [incidents, storeTick]);

  // Filtered Locations
  const filteredLocations = useMemo(() => {
    return locationDataList.filter((loc) => {
      if (selectedRiskFilter !== 'ALL' && loc.riskCategory !== selectedRiskFilter) {
        return false;
      }
      if (selectedDetectionType === 'DUPLICATE' && loc.duplicateSerials === 0) return false;
      if (selectedDetectionType === 'COLD_CHAIN' && loc.coldChainBreaches === 0) return false;
      if (selectedDetectionType === 'PACKAGING' && loc.packagingAnomalies === 0) return false;
      if (selectedDetectionType === 'EXPIRED' && loc.expiredCases === 0) return false;

      if (selectedSupplierFilter) {
        const matchesSupplier = loc.incidents.some((i) =>
          i.supplier.name.toLowerCase().includes(selectedSupplierFilter.toLowerCase())
        );
        if (!matchesSupplier) return false;
      }

      return true;
    });
  }, [locationDataList, selectedRiskFilter, selectedDetectionType, selectedSupplierFilter]);

  const handleSelectLocation = useCallback((loc: LocationRiskData) => {
    setActiveLocation(loc);
  }, []);

  const infoWindowPosition = useMemo(() => {
    if (!activeLocation) return null;
    return { lat: activeLocation.coords.lat, lng: activeLocation.coords.lng };
  }, [activeLocation]);

  const handleCloseInfoWindow = useCallback(() => {
    setActiveLocation(null);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5 shadow-xl">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Geographic Risk Intelligence Map
              </h2>
              <p className="text-xs text-slate-400">
                Live spatial surveillance of pharmaceutical verification anomalies, cold-chain breaches, and suspicious batch clusters across India.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="sm:hidden px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            <span>Map Filters ({filteredLocations.length})</span>
          </button>

          {selectedSupplierFilter && (
            <span className="px-2.5 py-1 rounded-lg bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5">
              <span>Supplier: {selectedSupplierFilter}</span>
              <button
                onClick={() => onSelectSupplierFilter && onSelectSupplierFilter(null)}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Filter Toolbar (Desktop / Mobile Collapsible) */}
      <div className={`${showFiltersMobile ? 'block' : 'hidden sm:block'} bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          {/* Risk Level Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Risk Level Threshold
            </label>
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 font-bold focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Risk Levels ({locationDataList.length})</option>
              <option value="CRITICAL">🔴 Critical Risk Only (&gt; 75)</option>
              <option value="HIGH">🟠 High Risk Only (50 - 75)</option>
              <option value="MODERATE">🟡 Moderate Risk Only (30 - 50)</option>
              <option value="LOW">🟢 Low Risk Only (&lt; 30)</option>
            </select>
          </div>

          {/* Detection Type Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Anomaly / Detection Type
            </label>
            <select
              value={selectedDetectionType}
              onChange={(e) => setSelectedDetectionType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 font-bold focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Detection Types</option>
              <option value="DUPLICATE">Duplicate Serial Collisions</option>
              <option value="COLD_CHAIN">Cold-Chain Temperature Breaches</option>
              <option value="PACKAGING">Packaging / Hologram Variance</option>
              <option value="EXPIRED">Expired Batch Detections</option>
            </select>
          </div>

          {/* Color Legend */}
          <div className="sm:col-span-1 lg:col-span-2 flex items-center justify-end gap-3 pt-4 sm:pt-0">
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-300">Critical</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
              <span className="text-slate-300">High</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-slate-300">Moderate</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-300">Low</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map Canvas (2/3 width on desktop, 100% on mobile) */}
        <div ref={mapContainerRef} className="lg:col-span-2 h-[450px] sm:h-[520px] rounded-2xl overflow-hidden border border-slate-800 relative shadow-inner touch-auto">
          <Map
            id="regulator-risk-map"
            mapId="DEMO_MAP_ID"
            defaultCenter={DEFAULT_CENTER}
            defaultZoom={DEFAULT_ZOOM}
            reuseMaps={true}
            gestureHandling="cooperative"
            disableDefaultUI={false}
            zoomControl={true}
            scrollwheel={true}
            clickableIcons={false}
            internalUsageAttributionIds={ATTRIBUTION_IDS}
            style={{ width: '100%', height: '100%' }}
            className="w-full h-full"
          >
            {filteredLocations.map((loc) => {
              const isSelected = activeLocation?.location === loc.location;
              return (
                <LocationMarker
                  key={loc.location}
                  loc={loc}
                  isSelected={isSelected}
                  onSelect={handleSelectLocation}
                />
              );
            })}

            {/* InfoWindow Popup on Active Marker */}
            {activeLocation && infoWindowPosition && (
              <InfoWindow
                position={infoWindowPosition}
                onCloseClick={handleCloseInfoWindow}
              >
                <div className="p-2 max-w-xs text-slate-900 font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      {activeLocation.location}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                        activeLocation.riskCategory === 'CRITICAL'
                          ? 'bg-rose-600'
                          : activeLocation.riskCategory === 'HIGH'
                          ? 'bg-orange-600'
                          : activeLocation.riskCategory === 'MODERATE'
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                    >
                      {activeLocation.riskCategory}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Suspicious Detections:</span>
                      <span className="font-bold font-mono text-rose-600">
                        {activeLocation.suspiciousDetections}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Quarantined Stock:</span>
                      <span className="font-bold font-mono text-amber-600">
                        {activeLocation.quarantinedCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Duplicate Serials:</span>
                      <span className="font-bold font-mono text-slate-900">
                        {activeLocation.duplicateSerials}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Affected Pharmacies:</span>
                      <span className="font-bold font-mono text-slate-900">
                        {activeLocation.affectedStoresCount}
                      </span>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>

        {/* Side Location Intelligence Panel */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
          {activeLocation ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Location Risk Intelligence
                  </div>
                  <h3 className="text-lg font-black text-white">{activeLocation.location}</h3>
                  <div className="text-xs text-slate-400 font-mono">
                    {activeLocation.coords.state} • {activeLocation.coords.hubType}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-black border ${
                      getRiskColorClasses(activeLocation.riskCategory).badge
                    }`}
                  >
                    {activeLocation.riskCategory} ({activeLocation.avgRiskScore}/100)
                  </span>
                </div>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Total Verifications</div>
                  <div className="font-mono text-base font-bold text-white">
                    {activeLocation.totalVerifications}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-rose-500/30">
                  <div className="text-slate-400 text-[10px]">Suspicious Detections</div>
                  <div className="font-mono text-base font-bold text-rose-400">
                    {activeLocation.suspiciousDetections}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30">
                  <div className="text-slate-400 text-[10px]">Quarantined Medicines</div>
                  <div className="font-mono text-base font-bold text-amber-400">
                    {activeLocation.quarantinedCount}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Duplicate Serials</div>
                  <div className="font-mono text-base font-bold text-purple-300">
                    {activeLocation.duplicateSerials}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Cold-Chain Breaches</div>
                  <div className="font-mono text-base font-bold text-amber-300">
                    {activeLocation.coldChainBreaches}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Packaging Anomalies</div>
                  <div className="font-mono text-base font-bold text-cyan-300">
                    {activeLocation.packagingAnomalies}
                  </div>
                </div>
              </div>

              {/* Entities Summary */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Monitored Retail Pharmacies:</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    {activeLocation.affectedStoresCount} stores
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Associated Distributors:</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    {activeLocation.affectedSuppliersCount} suppliers
                  </span>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => onNavigateToIncidents('ALL', activeLocation.riskCategory === 'CRITICAL' ? 'CRITICAL' : 'HIGH')}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>View Location Intelligence Cases</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3 my-auto">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <MapPin className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Select a Location Marker</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                Click any node on the Google Map to load location risk scores, affected pharmacies, suppliers, and incident logs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { RegulatorRiskMap as RiskHeatmap };
