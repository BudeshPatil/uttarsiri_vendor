export function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? new Intl.NumberFormat('en-IN').format(n) : '—';
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Commission rate comes from the API as a fraction (0.1) — show as a percentage. */
export function formatRate(rate) {
  const n = Number(rate);
  if (!Number.isFinite(n)) return '—';
  const pct = n <= 1 ? n * 100 : n;
  return `${Math.round(pct * 100) / 100}%`;
}

export function formatAddress(address) {
  if (!address) return '';
  if (typeof address === 'string') return address;
  return [
    address.line1 || address.address_line1,
    address.line2 || address.address_line2,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(', ');
}
