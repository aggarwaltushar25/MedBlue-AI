/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { APIProvider, useApiIsLoaded } from '@vis.gl/react-google-maps';
import { Key } from 'lucide-react';

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
  apiKeyMissing: true,
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
      isLoaded: Boolean(isLoaded),
      loadError,
      apiKeyMissing: false,
      quotaExceeded,
      loadMap,
    }),
    [apiKey, isLoaded, loadError, quotaExceeded, loadMap]
  );

  return (
    <GoogleMapsContext.Provider value={contextValue}>
      {children}
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
    (window as any).gm_authFailure = () => {
      setLoadError('Google Maps API authentication failed. Falling back to Spatial Vector Map engine.');
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

  // Fallback context when API key is missing
  const fallbackContextValue = React.useMemo<GoogleMapsContextType>(
    () => ({
      apiKey: null,
      isLoaded: false,
      loadError,
      apiKeyMissing: true,
      quotaExceeded,
      loadMap,
    }),
    [loadError, quotaExceeded, loadMap]
  );

  if (apiKeyMissing || loadError) {
    return (
      <GoogleMapsContext.Provider value={fallbackContextValue}>
        {children}
      </GoogleMapsContext.Provider>
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
