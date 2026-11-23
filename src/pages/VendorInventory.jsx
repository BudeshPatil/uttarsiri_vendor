import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, PackageCheck } from 'lucide-react';
import vendorService from '@/services/vendor.service';
import { useI18n } from '@/contexts/LanguageContext';
import PageHeader, { AlertMessage } from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';
import FormField from '@/components/admin/FormField';
import Pagination from '@/components/ui/pagination';
import usePaginationState from '@/hooks/usePaginationState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, formatNumber } from '@/lib/vendorFormat';

const isLow = (row) => Number(row.available_stock) <= Number(row.low_stock_threshold);

const variantLabel = (variant) => {
  if (!variant) return '—';
  const size = variant.weight != null ? `${variant.weight} ${variant.unit || ''}`.trim() : '';
  return [size, variant.sku].filter(Boolean).join(' · ') || '—';
};

export default function VendorInventory() {
  const { t } = useI18n();
  const [rows, setRows] = useState([]);
  const [productNames, setProductNames] = useState({});
  const [lowOnly, setLowOnly] = useState(false);
  const [lowCount, setLowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState({ available_stock: '', adjustment: '', low_stock_threshold: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const { page, limit, pagination, setPagination, changePage, changeLimit } = usePaginationState();
  const query = useMemo(() => ({ page, limit }), [page, limit]);

  // Product names for display (inventory rows only carry product_id).
  useEffect(() => {
    let cancelled = false;
    vendorService.listProducts({ limit: 100 })
      .then((response) => {
        if (cancelled) return;
        const map = {};
        (response.data?.products || []).forEach((p) => {
          map[p.product_id] = p.name || p.name_en;
        });
        setProductNames(map);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [listResponse, lowResponse] = await Promise.all([
        lowOnly ? vendorService.listLowStock() : vendorService.listInventory(query),
        lowOnly ? Promise.resolve(null) : vendorService.listLowStock().catch(() => null),
      ]);
      setRows(listResponse.data?.inventory || []);
      if (lowOnly) {
        setLowCount(listResponse.data?.count ?? (listResponse.data?.inventory || []).length);
        setPagination(null);
      } else {
        setPagination(listResponse.data?.pagination);
        setLowCount(lowResponse?.data?.count ?? 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [lowOnly, query, setPagination]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(''), 5000);
    return () => clearTimeout(timer);
  }, [success]);

  const loadDetail = async (variantId) => {
    try {
      setDetailLoading(true);
      const response = await vendorService.getInventory(variantId, { limit: 10 });
      setDetail(response.data || null);
    } catch (err) {
      setModalError(err.message || 'Failed to load stock movements');
    } finally {
      setDetailLoading(false);
    }
  };

  const openRow = (row) => {
    setSelected(row);
    setDetail(null);
    setModalError('');
    setForm({
      available_stock: String(row.available_stock ?? ''),
      adjustment: '',
      low_stock_threshold: String(row.low_stock_threshold ?? ''),
      reason: '',
    });
    loadDetail(row.variant_id);
  };

  const closeModal = () => {
    setSelected(null);
    setDetail(null);
    setModalError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {};
    const adjustmentFilled = form.adjustment.trim() !== '';

    if (adjustmentFilled) {
      const adjustment = Number(form.adjustment);
      if (!Number.isInteger(adjustment)) {
        setModalError('Adjustment must be a whole number');
        return;
      }
      payload.adjustment = adjustment;
      payload.movement_type = adjustment > 0 ? 'restock' : 'adjustment';
    } else if (form.available_stock.trim() !== '') {
      const available = Number(form.available_stock);
      if (!Number.isInteger(available) || available < 0) {
        setModalError('Available stock must be a whole number (0 or more)');
        return;
      }
      if (available !== Number(selected.available_stock)) payload.available_stock = available;
    }

    if (form.low_stock_threshold.trim() !== '') {
      const threshold = Number(form.low_stock_threshold);
      if (!Number.isInteger(threshold) || threshold < 0) {
        setModalError('Low-stock threshold must be a whole number (0 or more)');
        return;
      }
      if (threshold !== Number(selected.low_stock_threshold)) payload.low_stock_threshold = threshold;
    }

    if (Object.keys(payload).length === 0) {
      setModalError('Change at least one value before saving');
      return;
    }
    if (form.reason.trim()) payload.reason = form.reason.trim();

    try {
      setSaving(true);
      setModalError('');
      await vendorService.updateInventory(selected.variant_id, payload);
      setSuccess(t('inventory.updated'));
      closeModal();
      fetchInventory();
    } catch (err) {
      setModalError(err.message || 'Failed to update inventory');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={t('inventory.title')}
        description={t('inventory.subtitle')}
        onRefresh={fetchInventory}
        isRefreshing={loading}
        actions={(
          <Button
            variant={lowOnly ? 'default' : 'outline'}
            className={lowOnly ? 'bg-amber-600 hover:bg-amber-700' : ''}
            onClick={() => {
              setLowOnly((prev) => !prev);
              changePage(1);
            }}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            {t('inventory.lowOnly')}
          </Button>
        )}
      />
      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      {lowCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {t('inventory.lowStockAlert', { count: lowCount })}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('inventory.product')}</TableHead>
                <TableHead>{t('inventory.variant')}</TableHead>
                <TableHead className="text-right">{t('inventory.available')}</TableHead>
                <TableHead className="hidden sm:table-cell text-right">{t('inventory.reserved')}</TableHead>
                <TableHead className="hidden md:table-cell text-right">{t('inventory.threshold')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="py-8 text-center">{t('common.loading')}</TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-8 text-center">{t('common.noData')}</TableCell></TableRow>
              ) : rows.map((row) => (
                <TableRow key={row.variant_id}>
                  <TableCell className="font-medium">{productNames[row.product_id] || '—'}</TableCell>
                  <TableCell>{variantLabel(row.variant)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatNumber(row.available_stock)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-right">{formatNumber(row.reserved_stock)}</TableCell>
                  <TableCell className="hidden md:table-cell text-right">{formatNumber(row.low_stock_threshold)}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={isLow(row) ? 'low' : 'ok'}
                      label={isLow(row) ? t('inventory.low') : t('inventory.ok')}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => openRow(row)}>
                        <PackageCheck className="mr-1.5 h-4 w-4" />
                        {t('inventory.updateStock')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {!lowOnly && (
          <Pagination
            page={pagination.page || page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit || limit}
            onPageChange={changePage}
            onLimitChange={changeLimit}
            disabled={loading}
          />
        )}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={closeModal}
        title={selected ? `${t('inventory.updateStock')} — ${productNames[selected.product_id] || variantLabel(selected.variant)}` : ''}
        footer={(
          <>
            <Button type="button" variant="outline" onClick={closeModal}>{t('common.cancel')}</Button>
            <Button type="submit" form="inventory-form" disabled={saving} className="bg-[#0e782c] hover:bg-[#095c21]">
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          </>
        )}
      >
        {selected && (
          <div className="space-y-6">
            <AlertMessage message={modalError} />
            <form id="inventory-form" onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label={t('inventory.setAvailable')} hint={`${t('inventory.reserved')}: ${formatNumber(selected.reserved_stock)}`}>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={form.available_stock}
                    onChange={(e) => setForm((prev) => ({ ...prev, available_stock: e.target.value }))}
                    disabled={form.adjustment.trim() !== ''}
                  />
                </FormField>
                <FormField label={t('inventory.adjustment')}>
                  <Input
                    type="number"
                    step={1}
                    placeholder="+10 / -3"
                    value={form.adjustment}
                    onChange={(e) => setForm((prev) => ({ ...prev, adjustment: e.target.value }))}
                  />
                </FormField>
                <FormField label={t('inventory.threshold')}>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={form.low_stock_threshold}
                    onChange={(e) => setForm((prev) => ({ ...prev, low_stock_threshold: e.target.value }))}
                  />
                </FormField>
                <FormField label={t('inventory.reason')}>
                  <Input
                    value={form.reason}
                    onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                  />
                </FormField>
              </div>
            </form>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">{t('inventory.movements')}</h3>
              {detailLoading ? (
                <p className="text-sm text-gray-500">{t('common.loading')}</p>
              ) : !detail?.movements?.length ? (
                <p className="text-sm text-gray-500">{t('inventory.noMovements')}</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('common.date')}</TableHead>
                        <TableHead>{t('inventory.type')}</TableHead>
                        <TableHead className="text-right">{t('inventory.change')}</TableHead>
                        <TableHead className="text-right">{t('inventory.available')}</TableHead>
                        <TableHead className="hidden sm:table-cell">{t('inventory.reason')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.movements.map((m) => (
                        <TableRow key={m.movement_id}>
                          <TableCell className="whitespace-nowrap">{formatDate(m.created_at)}</TableCell>
                          <TableCell className="capitalize">{m.movement_type}</TableCell>
                          <TableCell className="text-right">
                            {Number(m.quantity) > 0 ? `+${m.quantity}` : m.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {m.previous_available} → {m.new_available}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{m.reason || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
