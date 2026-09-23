/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  AlertTriangle,
  Info,
  Radio,
  ExternalLink,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import L from 'leaflet';
import {
  RegulatoryIncident,
} from '../types';
import { unifiedStore } from '../services/unifiedStore';
import { useGoogleMaps } from './GoogleMapsProvider';

// Static references to prevent recreation on every render
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // Center of India
const DEFAULT_ZOOM = 5;
const ATTRIBUTION_IDS = ['gmp_mcp_codeassist_v1_aistudio'];

export interface LocationCoordinates {
  location: string;
  lat: number;
  lng: number;
  state: string;
  hubType: 'Distribution Depot' | 'Manufacturing Hub' | 'Border Transit' | 'Retail Cluster';
}

// Map of locations in India with precise geographic coordinates
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
  const { isLoaded, apiKeyMissing } = useGoogleMaps();
  const leafletContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

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

  const useGoogleMapsLive = isLoaded && !apiKeyMissing;

  // Initialize Leaflet Map for dark-mode street tiles
  useEffect(() => {
    if (useGoogleMapsLive || !leafletContainerRef.current || leafletMapRef.current) return;

    const map = L.map(leafletContainerRef.current, {
      center: [22.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
    });

    // High quality CartoDB Dark Matter tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [useGoogleMapsLive]);

  // Sync markers on Leaflet Map
  useEffect(() => {
    if (useGoogleMapsLive || !leafletMapRef.current) return;
    const map = leafletMapRef.current;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredLocations.forEach((loc) => {
      const isSelected = activeLocation?.location === loc.location;
      const colors = getRiskColorClasses(loc.riskCategory);

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative group cursor-pointer transition-transform duration-200 ${
            isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
          }">
            <div class="px-2.5 py-1 rounded-xl text-white font-bold text-[11px] shadow-2xl border-2 flex items-center gap-1.5 whitespace-nowrap ${colors.bg} ${colors.border}">
              <svg class="w-3.5 h-3.5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>${loc.location}</span>
              <span class="bg-black/50 px-1.5 py-0.2 rounded text-[10px] font-mono border border-white/20">
                ${loc.suspiciousDetections}
              </span>
            </div>
            <div class="w-0 h-0 mx-auto border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]" style="border-top-color: ${colors.pinBg}"></div>
          </div>
        `,
        iconSize: [120, 36],
        iconAnchor: [60, 36],
      });

      const marker = L.marker([loc.coords.lat, loc.coords.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        handleSelectLocation(loc);
        map.flyTo([loc.coords.lat, loc.coords.lng], 7, { animate: true, duration: 1.2 });
      });

      markersRef.current.push(marker);
    });
  }, [useGoogleMapsLive, filteredLocations, activeLocation, handleSelectLocation]);

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
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Geographic Risk Intelligence Map
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-900/60 border border-purple-500/40 text-purple-300 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
                  {useGoogleMapsLive ? 'Google Maps Live' : 'Dark-Tile Map Engine (Live)'}
                </span>
              </div>
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

      {/* Filter Toolbar */}
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
        {/* Map Canvas Container */}
        <div className="lg:col-span-2 h-[450px] sm:h-[520px] rounded-2xl overflow-hidden border border-slate-800 relative shadow-inner touch-auto bg-slate-950">
          {useGoogleMapsLive ? (
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
          ) : (
            /* Leaflet Dark-Mode Interactive Tile Map (Always Active & Free) */
            <div ref={leafletContainerRef} className="w-full h-full relative z-10 bg-slate-950" />
          )}
        </div>

        {/* Side Location Intelligence Panel */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
          {activeLocation ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{activeLocation.location}</span>
                    <span className="text-xs text-slate-400 font-normal font-mono">({activeLocation.coords.state})</span>
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Hub Type: <span className="text-slate-200 font-semibold">{activeLocation.coords.hubType}</span>
                  </div>
                </div>

                <span
                  className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                    getRiskColorClasses(activeLocation.riskCategory).badge
                  }`}
                >
                  {activeLocation.riskCategory} RISK
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Risk Score</div>
                  <div className="font-mono text-lg font-black text-rose-400 mt-0.5">
                    {activeLocation.avgRiskScore} / 100
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Suspicious Detections</div>
                  <div className="font-mono text-lg font-black text-amber-400 mt-0.5">
                    {activeLocation.suspiciousDetections}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Quarantined Units</div>
                  <div className="font-mono text-lg font-black text-purple-400 mt-0.5">
                    {activeLocation.quarantinedCount}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Duplicate Serials</div>
                  <div className="font-mono text-lg font-black text-blue-400 mt-0.5">
                    {activeLocation.duplicateSerials}
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Breakdown by Anomaly Category
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-300">Packaging / Hologram Variance</span>
                    <span className="font-mono font-bold text-purple-400">{activeLocation.packagingAnomalies}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-300">Cold-Chain Temperature Breaches</span>
                    <span className="font-mono font-bold text-amber-400">{activeLocation.coldChainBreaches}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-300">Expired Batch Detections</span>
                    <span className="font-mono font-bold text-emerald-400">{activeLocation.expiredCases}</span>
                  </div>
                </div>
              </div>

              {/* Incidents Linked */}
              {activeLocation.incidents.length > 0 && (
                <div className="space-y-2 text-xs pt-1 border-t border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Recent Incidents in this Hub ({activeLocation.incidents.length})
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {activeLocation.incidents.map((inc) => (
                      <div
                        key={inc.id}
                        onClick={() => onOpenIncidentDetail(inc.id)}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="truncate">
                          <div className="font-bold text-slate-200 truncate">{inc.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Store: {inc.store.name}</div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-6 text-slate-400 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <MapPin className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white">Select a Location Hub on the Map</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click any node on the geographic risk map to inspect live pharmacy clusters, quarantined stocks, and cold-chain breach incidents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
