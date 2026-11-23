import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/LanguageContext';
import vendorService from '@/services/vendor.service';

const VendorContext = createContext({
  vendor: null,
  loading: true,
  error: '',
  isVendorAccount: false,
  isApproved: false,
  refreshVendor: async () => {},
  setVendor: () => {},
});

export function VendorProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const { setDefaultLang } = useI18n();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isVendorAccount = user?.role_code === 'VENDOR';

  const refreshVendor = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await vendorService.getMe();
      const profile = response.data?.vendor || null;
      setVendor(profile);
      if (profile?.preferred_language) setDefaultLang(profile.preferred_language);
      return profile;
    } catch (err) {
      setVendor(null);
      setError(err.message || 'Failed to load vendor profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setDefaultLang]);

  useEffect(() => {
    if (isAuthenticated && isVendorAccount) {
      refreshVendor();
    } else {
      setVendor(null);
      setError('');
      setLoading(false);
    }
  }, [isAuthenticated, isVendorAccount, user?.user_id, refreshVendor]);

  const value = useMemo(
    () => ({
      vendor,
      loading,
      error,
      isVendorAccount,
      isApproved: vendor?.status === 'approved',
      refreshVendor,
      setVendor,
    }),
    [vendor, loading, error, isVendorAccount, refreshVendor],
  );

  return <VendorContext.Provider value={value}>{children}</VendorContext.Provider>;
}

export function useVendor() {
  return useContext(VendorContext);
}

export default VendorContext;
