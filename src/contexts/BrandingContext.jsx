import React, { createContext, useContext, useMemo } from 'react';
import { getMediaUrl } from '@/config/api';

/**
 * The vendor portal uses static Uttar Siri branding. It deliberately does not call the
 * admin/CMS settings API (`/settings/branding`).
 */
const DEFAULT_LOGO = '/favicon-96x96.png';
const DEFAULT_FAVICON = '/favicon-96x96.png';

const BrandingContext = createContext({
  logoUrl: DEFAULT_LOGO,
  faviconUrl: DEFAULT_FAVICON,
  rawLogo: '',
  rawFavicon: '',
  loading: false,
  refreshBranding: async () => {},
});

export function BrandingProvider({ children }) {
  const value = useMemo(
    () => ({
      logoUrl: getMediaUrl('', DEFAULT_LOGO),
      faviconUrl: getMediaUrl('', DEFAULT_FAVICON),
      rawLogo: '',
      rawFavicon: '',
      loading: false,
      refreshBranding: async () => {},
    }),
    [],
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}

export default BrandingContext;
