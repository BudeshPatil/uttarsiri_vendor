import apiClient from '@/lib/apiClient';

const settingsService = {
  getAll() {
    return apiClient.get('/settings');
  },

  /** Public — no auth required (SignIn / SignUp). */
  getBranding() {
    return apiClient.get('/settings/branding');
  },

  update(payload) {
    return apiClient.put('/settings', payload);
  },
};

export default settingsService;
