import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock,
  IndianRupee,
  Package,
  Percent,
  ShoppingBag,
  TrendingUp,
  Warehouse,
} from 'lucide-react';
import vendorService from '@/services/vendor.service';
import { useI18n } from '@/contexts/LanguageContext';
import PageHeader, { AlertMessage, StatCard } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber, formatRate } from '@/lib/vendorFormat';

export default function VendorDashboard({ onNavigate }) {
  const { t } = useI18n();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await vendorService.getDashboard();
      setSummary(response.data?.summary || null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sales = summary?.sales_summary || {};
  const inventory = summary?.inventory_summary || {};
  const lowStock = Number(inventory.low_stock_count || 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.subtitle')}
        onRefresh={load}
        isRefreshing={loading}
      />
      <AlertMessage message={error} />

      {lowStock > 0 && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{t('dashboard.lowStockAlert', { count: lowStock })}</span>
          </div>
          {onNavigate && (
            <Button variant="outline" size="sm" onClick={() => onNavigate('inventory')}>
              {t('dashboard.viewInventory')}
            </Button>
          )}
        </div>
      )}

      {loading && !summary ? (
        <p className="py-10 text-center text-sm text-gray-500">{t('common.loading')}</p>
      ) : (
        <div className="space-y-8">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard title={t('dashboard.totalProducts')} value={formatNumber(summary?.total_products)} icon={Package} tone="green" />
            <StatCard title={t('dashboard.activeProducts')} value={formatNumber(summary?.active_products)} icon={CheckCircle2} tone="green" />
            <StatCard title={t('dashboard.pendingApproval')} value={formatNumber(summary?.pending_approval)} icon={Clock} tone="amber" />
            <StatCard title={t('dashboard.totalOrders')} value={formatNumber(summary?.total_orders)} icon={ShoppingBag} tone="blue" />
            <StatCard title={t('dashboard.pendingOrders')} value={formatNumber(summary?.pending_orders)} icon={Clock} tone="amber" />
            <StatCard title={t('dashboard.completedOrders')} value={formatNumber(summary?.completed_orders)} icon={CheckCircle2} tone="green" />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">{t('dashboard.salesSummary')}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard title={t('dashboard.grossSales')} value={formatCurrency(sales.gross_sales)} icon={IndianRupee} tone="green" />
              <StatCard title={t('dashboard.commissionRate')} value={formatRate(sales.commission_rate)} icon={Percent} tone="purple" />
              <StatCard title={t('dashboard.estCommission')} value={formatCurrency(sales.estimated_commission)} icon={TrendingUp} tone="blue" />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">{t('dashboard.inventorySummary')}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard title={t('dashboard.variantsTracked')} value={formatNumber(inventory.variants_tracked)} icon={Boxes} tone="blue" />
              <StatCard title={t('dashboard.lowStock')} value={formatNumber(inventory.low_stock_count)} icon={AlertTriangle} tone={lowStock > 0 ? 'red' : 'green'} />
              <StatCard title={t('dashboard.availableUnits')} value={formatNumber(inventory.total_available_units)} icon={Warehouse} tone="green" />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
