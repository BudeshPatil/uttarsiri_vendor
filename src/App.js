import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './components/Layout/scrollbar.css';
import { APP_NAME } from './config/api';
import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
import ProtectedRoute from './components/auth/ProtectedRoute';
import VendorStatusGate from './components/VendorStatusGate';
import LanguageSelect from './components/LanguageSelect';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useI18n } from './contexts/LanguageContext';
import { VendorProvider, useVendor } from './contexts/VendorContext';
import BrandLogo from './components/BrandLogo';

import VendorDashboardPage from './pages/VendorDashboard';
import VendorProductsPage from './pages/VendorProducts';
import VendorOrdersPage from './pages/VendorOrders';
import VendorInventoryPage from './pages/VendorInventory';
import VendorReportsPage from './pages/VendorReports';
import VendorProfilePage from './pages/VendorProfile';

import {
  Menu,
  User,
  ChevronLeft,
  ChevronRight,
  Home,
  X,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Warehouse,
  BarChart3,
  UserCog,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'products', labelKey: 'nav.products', icon: Package, path: '/products' },
  { id: 'orders', labelKey: 'nav.orders', icon: ShoppingBag, path: '/orders' },
  { id: 'inventory', labelKey: 'nav.inventory', icon: Warehouse, path: '/inventory' },
  { id: 'reports', labelKey: 'nav.reports', icon: BarChart3, path: '/reports' },
  { id: 'profile', labelKey: 'nav.profile', icon: UserCog, path: '/profile' },
];

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-card shadow-lg ring-1 ring-border flex items-center justify-center mx-auto mb-4 p-2 animate-pulse">
          <BrandLogo variant="favicon" alt="Logo" className="w-10 h-10" />
        </div>
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Shown for any account that is not an approved vendor. No business navigation or modules
 * are rendered here.
 */
function StatusGateLayout({ notVendor }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useI18n();
  const { isDark, toggleTheme } = useTheme();
  const { vendor, error, loading, refreshVendor } = useVendor();

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-surface text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-header/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 flex-shrink-0">
              <BrandLogo variant="favicon" alt={`${APP_NAME} Logo`} className="w-full h-full" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-sm font-semibold truncate">{APP_NAME}</h2>
              <p className="text-[11px] text-muted-foreground">{t('nav.vendorPortal')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelect />
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title={isDark ? t('common.lightMode') : t('common.darkMode')}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.signOut')}</span>
            </button>
          </div>
        </div>
      </header>
      <VendorStatusGate
        vendor={vendor}
        error={error}
        notVendor={notVendor}
        refreshing={loading}
        onRefresh={refreshVendor}
      />
    </div>
  );
}

/** Full portal — only rendered for approved vendors. */
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { vendor } = useVendor();
  const { t } = useI18n();
  const { isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('dashboard');
  // Expanded by default; only the button toggles collapse (no hover expand).
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navigationItems = NAV_ITEMS.map((item) => ({
    ...item,
    name: t(item.labelKey),
    breadcrumb: [t('nav.vendorPortal'), t(item.labelKey)],
  }));

  useEffect(() => {
    const path = location.pathname;
    const matchedItem = NAV_ITEMS.find((item) => item.path === path);

    if (matchedItem) {
      setActiveTab(matchedItem.id);
    } else {
      // Unknown / legacy admin paths fall back to the dashboard.
      setActiveTab('dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  const currentItem = navigationItems.find((item) => item.id === activeTab);
  const isExpanded = !sidebarCollapsed || mobileMenuOpen;

  const handleTabChange = (tabId) => {
    const item = navigationItems.find((nav) => nav.id === tabId);
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    if (item?.path) navigate(item.path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const displayName = vendor?.business_name || user?.name || 'Vendor';
  const displayEmail = vendor?.email || user?.email || '';

  return (
    <div className="min-h-screen bg-surface text-foreground transition-colors duration-300">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-64' : 'w-[72px]'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className={`flex items-center border-b border-sidebar-border p-3 ${isExpanded ? 'justify-between gap-2' : 'justify-center flex-col gap-2'}`}>
          {isExpanded ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 flex-shrink-0">
                <BrandLogo variant="favicon" alt={`${APP_NAME} Logo`} className="w-full h-full" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-sm font-semibold truncate">{APP_NAME}</h2>
                <p className="text-[11px] text-sidebar-muted">{t('nav.vendorPortal')}</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10">
              <BrandLogo variant="favicon" alt={`${APP_NAME} Logo`} className="w-full h-full" />
            </div>
          )}

          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="hidden lg:flex p-1.5 rounded-lg text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground transition-colors"
            title={sidebarCollapsed ? t('nav.expand') : t('nav.collapse')}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {isExpanded && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-sidebar-muted hover:bg-sidebar-hover"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  type="button"
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center rounded-xl font-medium transition-all duration-200 text-left ${
                    isExpanded ? 'px-3 py-2.5 gap-3' : 'px-0 py-2.5 justify-center'
                  } ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-md shadow-[#0e782c]/10'
                      : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground'
                  }`}
                  title={!isExpanded ? item.name : undefined}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-white/20' : 'bg-transparent'
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  {isExpanded && <span className="text-sm truncate">{item.name}</span>}
                </button>

                {!isExpanded && (
                  <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {item.name}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto p-3 border-t border-sidebar-border space-y-2">
          {isExpanded ? (
            <div className="rounded-xl border border-sidebar-border bg-sidebar-hover/60 p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0e782c] to-[#0e782c] flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-[11px] text-sidebar-muted truncate">{displayEmail}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 py-2 px-3 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-950/70 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('nav.signOut')}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0e782c] to-[#0e782c] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-8 h-8 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center"
                title={t('nav.signOut')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-out ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        }`}
      >
        <header className="sticky top-0 z-30 border-b border-border bg-header/90 backdrop-blur-xl">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setSidebarCollapsed((prev) => !prev)}
                  className="hidden lg:flex p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  title={sidebarCollapsed ? t('nav.expand') : t('nav.collapse')}
                >
                  {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>

                <nav className="hidden sm:flex items-center gap-2 text-sm">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  {currentItem?.breadcrumb.map((crumb, index) => (
                    <React.Fragment key={index}>
                      <span className="text-muted-foreground/60">/</span>
                      <span
                        className={
                          index === currentItem.breadcrumb.length - 1
                            ? 'text-foreground font-semibold'
                            : 'text-muted-foreground'
                        }
                      >
                        {crumb}
                      </span>
                    </React.Fragment>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-2">
                <LanguageSelect />
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title={isDark ? t('common.lightMode') : t('common.darkMode')}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('profile')}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0e782c] to-[#0e782c] flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
                  title={t('nav.profile')}
                >
                  <User className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1">
          {activeTab === 'dashboard' && <VendorDashboardPage onNavigate={handleTabChange} />}
          {activeTab === 'products' && <VendorProductsPage />}
          {activeTab === 'orders' && <VendorOrdersPage />}
          {activeTab === 'inventory' && <VendorInventoryPage />}
          {activeTab === 'reports' && <VendorReportsPage />}
          {activeTab === 'profile' && <VendorProfilePage />}
        </div>
      </div>
    </div>
  );
}

/**
 * Decides between the status gate and the full portal.
 * Business modules (and their navigation) render only for approved vendors.
 */
function PortalShell() {
  const { vendor, loading, isVendorAccount, isApproved } = useVendor();

  if (!isVendorAccount) return <StatusGateLayout notVendor />;
  if (loading && !vendor) return <FullScreenLoader />;
  if (!isApproved) return <StatusGateLayout />;
  return <AppContent />;
}

// Vite's BASE_URL always has a trailing slash ('/' or '/vendor/');
// react-router wants the basename without one.
const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrandingProvider>
            <Router basename={ROUTER_BASENAME}>
              <Routes>
                <Route path="/signup" element={<SignUp />} />
                <Route path="/register" element={<SignUp />} />
                <Route path="/signin" element={<SignIn />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <VendorProvider>
                        <PortalShell />
                      </VendorProvider>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </BrandingProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
