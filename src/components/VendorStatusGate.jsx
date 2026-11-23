import { AlertTriangle, Clock, LogOut, RefreshCw, ShieldAlert, XCircle } from 'lucide-react';
import { useI18n } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/admin/StatusBadge';
import { formatAddress } from '@/lib/vendorFormat';

const variants = {
  pending: { icon: Clock, tone: 'bg-amber-50 text-amber-700 ring-amber-200' },
  rejected: { icon: XCircle, tone: 'bg-red-50 text-red-700 ring-red-200' },
  suspended: { icon: ShieldAlert, tone: 'bg-red-50 text-red-700 ring-red-200' },
  error: { icon: AlertTriangle, tone: 'bg-red-50 text-red-700 ring-red-200' },
};

/**
 * Shown instead of any business module when the account is not an approved vendor.
 * Handles: pending / rejected / suspended vendors, non-vendor accounts and profile load errors.
 */
export default function VendorStatusGate({ vendor, error, notVendor, onRefresh, refreshing }) {
  const { t } = useI18n();

  let kind = 'error';
  let title = t('gate.loadError');
  let message = error || '';
  let reason = '';

  if (notVendor) {
    title = t('auth.notVendorTitle');
    message = t('auth.notVendorMessage');
  } else if (vendor) {
    kind = vendor.status;
    if (vendor.status === 'pending') {
      title = t('gate.pendingTitle');
      message = t('gate.pendingMessage');
    } else if (vendor.status === 'rejected') {
      title = t('gate.rejectedTitle');
      message = t('gate.rejectedMessage');
      reason = vendor.rejection_reason;
    } else if (vendor.status === 'suspended') {
      title = t('gate.suspendedTitle');
      message = t('gate.suspendedMessage');
      reason = vendor.suspended_reason;
    }
  }

  const { icon: Icon, tone } = variants[kind] || variants.error;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 sm:p-8">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-lg sm:p-8">
        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ring-1 ${tone}`}>
          <Icon className="h-8 w-8" />
        </div>
        {vendor?.status && (
          <div className="mb-3">
            <StatusBadge status={vendor.status} label={t(`vendorStatus.${vendor.status}`)} />
          </div>
        )}
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h1>
        {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
        {reason && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-left text-sm text-red-800">
            <span className="font-semibold">{t('gate.reason')}: </span>
            {reason}
          </div>
        )}

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          {!notVendor && (
            <Button
              onClick={onRefresh}
              disabled={refreshing}
              className="bg-[#0e782c] hover:bg-[#095c21]"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {error && !vendor ? t('common.retry') : t('gate.checkStatus')}
            </Button>
          )}
        </div>
      </div>

      {vendor && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">{t('gate.business')}</dt>
              <dd className="mt-0.5 font-medium text-gray-900">{vendor.business_name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">{t('gate.contact')}</dt>
              <dd className="mt-0.5 font-medium text-gray-900">
                {vendor.owner_name}
                <span className="block text-xs font-normal text-gray-500">{vendor.email}</span>
                <span className="block text-xs font-normal text-gray-500">{vendor.mobile}</span>
              </dd>
            </div>
            {vendor.address && (
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-gray-500">{t('profile.address')}</dt>
                <dd className="mt-0.5 text-gray-900">{formatAddress(vendor.address)}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}

export function SignOutButton({ onClick, label }) {
  return (
    <Button variant="outline" onClick={onClick}>
      <LogOut className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
