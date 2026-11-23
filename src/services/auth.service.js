import apiClient, {
  clearStoredTokens,
  getStoredTokens,
  setStoredTokens,
} from '@/lib/apiClient';

class AuthService {
  loadTokensFromStorage() {
    return getStoredTokens() || { accessToken: null, refreshToken: null, user: null };
  }

  saveTokensToStorage(tokens) {
    setStoredTokens(tokens);
  }

  clearTokens() {
    clearStoredTokens();
  }

  get tokens() {
    return this.loadTokensFromStorage();
  }

  isAuthenticated() {
    const tokens = this.loadTokensFromStorage();
    return Boolean(tokens?.accessToken);
  }

  isTokenExpired() {
    const tokens = this.loadTokensFromStorage();
    if (!tokens?.accessToken) return true;

    const payload = this.parseJwtPayload(tokens.accessToken);
    if (!payload?.exp) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime + 300;
  }

  getAccessToken() {
    return this.loadTokensFromStorage()?.accessToken || null;
  }

  getIdToken() {
    return this.getAccessToken();
  }

  parseJwtPayload(token) {
    try {
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  normalizeUser(user, tokenPayload = null) {
    if (!user && !tokenPayload) return null;

    const payload = tokenPayload || this.parseJwtPayload(this.getAccessToken());

    return {
      user_id: user?.user_id || payload?.sub,
      sub: user?.user_id || payload?.sub,
      email: user?.email || payload?.email,
      name: user?.name || payload?.name || user?.email?.split('@')[0],
      phone: user?.phone,
      role_id: user?.role_id || payload?.role_id,
      role_code: payload?.role_code,
      permissions: payload?.permissions || [],
      status: user?.status,
      profile_image: user?.profile_image,
    };
  }

  parseUserFromIdToken() {
    const tokens = this.loadTokensFromStorage();
    if (tokens?.user) {
      return this.normalizeUser(tokens.user);
    }
    return this.normalizeUser(null, this.parseJwtPayload(tokens?.accessToken));
  }

  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data || {};

      if (!accessToken) {
        throw new Error(response.message || 'Login failed');
      }

      this.saveTokensToStorage({ accessToken, refreshToken, user });
      return { success: true, user: this.normalizeUser(user) };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  async signup(email, name, password, phone = '') {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        name,
        password,
        phone: phone || '0000000000',
      });

      return {
        success: true,
        user: response.data,
        needsVerification: false,
        needsApproval: true,
        message: response.message,
      };
    } catch (error) {
      return { success: false, error: error.message || 'Signup failed' };
    }
  }

  async confirmSignup() {
    return { success: true };
  }

  async checkUserExists(email) {
    try {
      await apiClient.post('/auth/login', { email, password: '__check__' });
      return { success: true, exists: true };
    } catch (error) {
      if (error.status === 401) {
        return { success: true, exists: true, message: 'User may exist' };
      }
      return { success: true, exists: false };
    }
  }

  async refreshTokens() {
    try {
      const tokens = this.loadTokensFromStorage();
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/auth/refresh', {
        refreshToken: tokens.refreshToken,
      });

      const { accessToken, refreshToken } = response.data || {};
      if (!accessToken) {
        throw new Error('Token refresh failed');
      }

      this.saveTokensToStorage({
        ...tokens,
        accessToken,
        refreshToken: refreshToken || tokens.refreshToken,
      });

      return { success: true };
    } catch (error) {
      this.clearTokens();
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Clear local session even if API fails
    } finally {
      this.clearTokens();
    }
    return { success: true };
  }

  async getCurrentUser() {
    try {
      if (!this.isAuthenticated()) return null;
      return this.parseUserFromIdToken();
    } catch {
      return null;
    }
  }

  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response;
  }

  async resetPassword(token, password) {
    const response = await apiClient.post('/auth/reset-password', { token, password });
    return response;
  }

  async changePassword(currentPassword, newPassword) {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response;
  }

  async authenticatedRequest(url, options = {}) {
    const method = (options.method || 'GET').toLowerCase();
    const config = {
      url,
      method,
      headers: options.headers,
      data: options.body ? JSON.parse(options.body) : undefined,
    };
    return apiClient.request(config);
  }
}

export default new AuthService();
