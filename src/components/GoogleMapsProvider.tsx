/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { APIProvider, useApiIsLoaded } from '@vis.gl/react-google-maps';
import { AlertTriangle, Key, Loader2 } from 'lucide-react';

interface GoogleMapsContextType {
  apiKey: string | null;
  isLoaded: boolean;
  loadError: string | null;
  apiKeyMissing: boolean;
  quotaExceeded: boolean;
  loadMap: (container: HTMLElement, options?: Record<string, any>) => any;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  apiKey: null,
  isLoaded: false,
  loadError: null,
  apiKeyMissing: false,
  quotaExceeded: false,
  loadMap: () => null,
});

export const useGoogleMaps = () => useContext(GoogleMapsContext);

interface GoogleMapsProviderProps {
  children: ReactNode;
}

const MapContentWrapper: React.FC<{
  children: ReactNode;
  apiKey: string;
  loadError: string | null;
  quotaExceeded: boolean;
  loadMap: (container: HTMLElement, options?: Record<string, any>) => any;
}> = ({ children, apiKey, loadError, quotaExceeded, loadMap }) => {
  const isLoaded = useApiIsLoaded();

  const contextValue = React.useMemo<GoogleMapsContextType>(
    () => ({
      apiKey,
      isLoaded,
      loadError,
      apiKeyMissing: false,
      quotaExceeded,
      loadMap,
    }),
    [apiKey, isLoaded, loadError, quotaExceeded, loadMap]
  );

  return (
    <GoogleMapsContext.Provider value={contextValue}>
      {!isLoaded ? (
        <div className="w-full h-full min-h-[400px] bg-slate-950/80 backdrop-blur-sm border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center space-y-3 p-6 text-slate-400">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <div className="text-xs font-bold text-white tracking-wider uppercase">
            Loading Google Maps Platform CDN...
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Initializing spatial vector engine & tile layers
          </p>
        </div>
      ) : (
        children
      )}
    </GoogleMapsContext.Provider>
  );
};

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children }) => {
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    (typeof process !== 'undefined' ? process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY : undefined) ||
    '';

  const apiKeyMissing = !apiKey || apiKey.trim() === '';
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    // Listen for auth failure or quota errors
    (window as any).gm_authFailure = () => {
      setLoadError('Google Maps API authentication failed. Please verify your VITE_GOOGLE_MAPS_API_KEY.');
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    };

    const handleQuota = () => {
      setQuotaExceeded(true);
    };

    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuota);
    };
  }, []);

  // Helper function to initialize a Google Map imperatively if requested
  const loadMap = React.useCallback((container: HTMLElement, options?: Record<string, any>): any => {
    const win = window as any;
    if (typeof win.google === 'undefined' || !win.google.maps) {
      console.warn('Google Maps API is not loaded yet.');
      return null;
    }
    return new win.google.maps.Map(container, {
      mapId: 'DEMO_MAP_ID',
      center: { lat: 24.5937, lng: 78.9629 },
      zoom: 5,
      ...options,
    });
  }, []);

  if (apiKeyMissing) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
          <Key className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white">Google Maps API Key Not Configured</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Please set the <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">VITE_GOOGLE_MAPS_API_KEY</code> environment variable in your project configuration to render live interactive maps.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-rose-500/40 text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-rose-300">Google Maps Error</h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto">{loadError}</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} version="beta">
      <MapContentWrapper
        apiKey={apiKey}
        loadError={loadError}
        quotaExceeded={quotaExceeded}
        loadMap={loadMap}
      >
        {children}
      </MapContentWrapper>
    </APIProvider>
  );
};
