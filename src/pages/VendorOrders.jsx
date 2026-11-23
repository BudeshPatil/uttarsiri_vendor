import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatAddress, formatCurrency, formatDate } from '@/lib/vendorFormat';

const ITEM_STATUSES = ['pending', 'accepted', 'preparing', 'ready', 'dispatched', 'rejected'];

/** Mirrors the server-side transition table. */
const NEXT_ACTIONS = {
  pending: ['accepted', 'rejected'],
  accepted: ['preparing', 'rejected'],
  preparing: ['ready'],
  ready: ['dispatched'],
};

const ACTION_LABEL_KEY = {
  accepted: 'order.action.accept',
  rejected: 'order.action.reject',
  preparing: 'order.action.preparing',
  ready: 'order.action.ready',
  dispatched: 'order.action.dispatched',
};

const getItemStatus = (item) => item.vendor_status || 'pending';

export default function VendorOrders() {
  const { t } = useI18n();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busyItem, setBusyItem] = useState('');
  const [rejecting, setRejecting] = useState(null); // order_item_id awaiting a reason
  const [rejectReason, setRejectReason] = useState('');
  const [modalError, setModalError] = useState('');
  const { page, limit, pagination, setPagination, changePage, changeLimit, resetPage } = usePaginationState();

  const query = useMemo(() => {
    const params = { page, limit };
    if (statusFilter !== 'all') params.status = statusFilter;
    return params;
  }, [page, limit, statusFilter]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await vendorService.listOrders(query);
      setOrders(response.data?.orders || []);
      setPagination(response.data?.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [query, setPagination]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(''), 5000);
    return () => clearTimeout(timer);
  }, [success]);

  const statusLabel = (status) => t(`order.status.${status}`);

  const openOrder = async (order) => {
    setSelected(order);
    setModalError('');
    setRejecting(null);
    setRejectReason('');
    try {
      setDetailLoading(true);
      const response = await vendorService.getOrder(order.order_id);
      if (response.data?.order) setSelected(response.data.order);
    } catch (err) {
      setModalError(err.message || 'Failed to load order');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelected(null);
    setRejecting(null);
    setRejectReason('');
    setModalError('');
  };

  const applyStatus = async (item, status, reason) => {
    try {
      setBusyItem(item.order_item_id);
      setModalError('');
      const response = await vendorService.updateOrderItemStatus(selected.order_id, {
        order_item_id: item.order_item_id,
        status,
        reason,
      });
      const updated = response.data?.order;
      if (updated) {
        setSelected(updated);
        setOrders((prev) => prev.map((o) => (o.order_id === updated.order_id ? updated : o)));
      } else {
        fetchOrders();
      }
      setRejecting(null);
      setRejectReason('');
      setSuccess(t('orders.updated'));
    } catch (err) {
      setModalError(err.message || 'Failed to update order item');
    } finally {
      setBusyItem('');
    }
  };

  const handleAction = (item, status) => {
    if (status === 'rejected') {
      setRejecting(item.order_item_id);
      setRejectReason('');
      return;
    }
    applyStatus(item, status);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={t('orders.title')}
        description={t('orders.subtitle')}
        onRefresh={fetchOrders}
        isRefreshing={loading}
        actions={(
          <div className="w-44">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                resetPage();
              }}
            >
              <SelectTrigger aria-label={t('orders.filterStatus')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[60]">
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {ITEM_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>{statusLabel(status)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />
      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('orders.orderNumber')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('orders.customer')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('orders.placedOn')}</TableHead>
                <TableHead>{t('orders.items')}</TableHead>
                <TableHead className="text-right">{t('orders.yourTotal')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center">{t('common.loading')}</TableCell></TableRow>
              ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center">{t('common.noData')}</TableCell></TableRow>
              ) : orders.map((order) => (
                <TableRow key={order.order_id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell className="hidden sm:table-cell">{order.customer_name || '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(order.items || []).map((item) => (
                        <StatusBadge
                          key={item.order_item_id}
                          status={getItemStatus(item)}
                          label={statusLabel(getItemStatus(item))}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(order.vendor_subtotal)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openOrder(order)} aria-label={t('common.view')}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination
          page={pagination.page || page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit || limit}
          onPageChange={changePage}
          onLimitChange={changeLimit}
          disabled={loading}
        />
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={closeModal}
        title={selected ? `${t('orders.details')} — ${selected.order_number}` : ''}
        footer={<Button variant="outline" onClick={closeModal}>{t('common.close')}</Button>}
      >
        {selected && (
          <div className="space-y-5">
            <AlertMessage message={modalError} />
            {detailLoading && <p className="text-sm text-gray-500">{t('common.loading')}</p>}

            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">{t('orders.customer')}</dt>
                <dd className="font-medium text-gray-900">
                  {selected.customer_name || '—'}
                  {selected.customer_phone && <span className="block text-xs font-normal text-gray-500">{selected.customer_phone}</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">{t('orders.placedOn')}</dt>
                <dd className="font-medium text-gray-900">{formatDate(selected.created_at)}</dd>
              </div>
              {selected.address_snapshot && (
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-gray-500">{t('orders.deliverTo')}</dt>
                  <dd className="text-gray-900">{formatAddress(selected.address_snapshot)}</dd>
                </div>
              )}
            </dl>

            <div className="space-y-3">
              {(selected.items || []).map((item) => {
                const status = getItemStatus(item);
                const actions = NEXT_ACTIONS[status] || [];
                const busy = busyItem === item.order_item_id;
                return (
                  <div key={item.order_item_id} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-xs text-gray-500">
                          {[item.sku, item.unit_label].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <StatusBadge status={status} label={statusLabel(status)} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                      <span>{t('common.quantity')}: <strong>{item.quantity}</strong></span>
                      <span>{t('orders.unitPrice')}: <strong>{formatCurrency(item.unit_price)}</strong></span>
                      <span>{t('orders.lineTotal')}: <strong>{formatCurrency(item.line_total)}</strong></span>
                    </div>
                    {item.vendor_status_reason && (
                      <p className="mt-2 text-xs text-gray-500">{t('gate.reason')}: {item.vendor_status_reason}</p>
                    )}

                    {rejecting === item.order_item_id ? (
                      <div className="mt-3 space-y-2 rounded-lg bg-red-50 p-3">
                        <FormField label={t('orders.rejectReason')}>
                          <Input
                            maxLength={300}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                          />
                        </FormField>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={busy}
                            onClick={() => applyStatus(item, 'rejected', rejectReason.trim() || undefined)}
                          >
                            {t('orders.confirmReject')}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setRejecting(null)}>
                            {t('common.cancel')}
                          </Button>
                        </div>
                      </div>
                    ) : actions.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {actions.map((next) => (
                          <Button
                            key={next}
                            size="sm"
                            variant={next === 'rejected' ? 'outline' : 'default'}
                            className={next === 'rejected' ? 'text-red-600' : 'bg-[#0e782c] hover:bg-[#095c21]'}
                            disabled={busy}
                            onClick={() => handleAction(item, next)}
                          >
                            {t(ACTION_LABEL_KEY[next])}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-gray-400">{t('orders.noActions')}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between border-t border-gray-100 pt-3 text-sm">
              <span className="text-gray-600">{t('orders.yourTotal')}</span>
              <span className="font-semibold text-gray-900">{formatCurrency(selected.vendor_subtotal)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
