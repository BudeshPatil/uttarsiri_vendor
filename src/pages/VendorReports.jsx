import { useCallback, useEffect, useState } from 'react';
import { IndianRupee, Percent, Receipt, ShoppingBag } from 'lucide-react';
import vendorService from '@/services/vendor.service';
import { useI18n } from '@/contexts/LanguageContext';
import PageHeader, { AlertMessage, StatCard } from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber, formatRate } from '@/lib/vendorFormat';

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2.5 text-sm last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg">
      <h2 className="mb-2 text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

export default function VendorReports() {
  const { t } = useI18n();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await vendorService.getReports();
      setReports(response.data?.reports || null);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sales = reports?.sales || {};
  const commission = reports?.commission || {};
  const settlements = reports?.settlements || {};
  const performance = reports?.product_performance || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={t('reports.title')}
        description={t('reports.subtitle')}
        onRefresh={load}
        isRefreshing={loading}
      />
      <AlertMessage message={error} />

      {loading && !reports ? (
        <p className="py-10 text-center text-sm text-gray-500">{t('common.loading')}</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title={t('reports.grossSales')} value={formatCurrency(sales.gross_sales)} icon={IndianRupee} tone="green" />
            <StatCard title={t('reports.orderCount')} value={formatNumber(sales.order_count)} icon={ShoppingBag} tone="blue" />
            <StatCard title={t('reports.commissionAmount')} value={formatCurrency(commission.amount)} icon={Percent} tone="purple" />
            <StatCard title={t('reports.netPayable')} value={formatCurrency(settlements.net_payable)} icon={Receipt} tone="amber" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Panel title={t('reports.sales')}>
              <Row label={t('reports.grossSales')} value={formatCurrency(sales.gross_sales)} />
              <Row label={t('reports.orderCount')} value={formatNumber(sales.order_count)} />
              <Row label={t('reports.acceptedLines')} value={formatNumber(sales.accepted_lines)} />
              <Row label={t('reports.rejectedLines')} value={formatNumber(sales.rejected_lines)} />
              <Row label={t('reports.dispatchedLines')} value={formatNumber(sales.dispatched_lines)} />
            </Panel>

            <Panel title={t('reports.commission')}>
              <Row label={t('reports.commissionRate')} value={formatRate(commission.rate)} />
              <Row label={t('reports.commissionAmount')} value={formatCurrency(commission.amount)} />
            </Panel>

            <Panel title={t('reports.settlements')}>
              <Row
                label={t('reports.settlementStatus')}
                value={settlements.status ? <StatusBadge status={settlements.status} /> : '—'}
              />
              <Row label={t('reports.grossSales')} value={formatCurrency(settlements.gross_sales)} />
              <Row label={t('reports.commission')} value={formatCurrency(settlements.commission)} />
              <Row label={t('reports.netPayable')} value={formatCurrency(settlements.net_payable)} />
              {settlements.note && <p className="mt-3 text-xs text-gray-500">{settlements.note}</p>}
            </Panel>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">{t('reports.productPerformance')}</h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('inventory.product')}</TableHead>
                    <TableHead className="text-right">{t('reports.quantitySold')}</TableHead>
                    <TableHead className="text-right">{t('reports.revenue')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-8 text-center">{t('common.noData')}</TableCell>
                    </TableRow>
                  ) : (
                    performance.map((row) => (
                      <TableRow key={row.product_id}>
                        <TableCell className="font-medium">{row.product_name}</TableCell>
                        <TableCell className="text-right">{formatNumber(row.quantity)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
