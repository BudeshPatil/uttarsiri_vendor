import { Badge } from '@/components/ui/badge';

const green = 'bg-green-100 text-green-800 border-green-200';
const amber = 'bg-amber-100 text-amber-800 border-amber-200';
const red = 'bg-red-100 text-red-800 border-red-200';
const gray = 'bg-gray-100 text-gray-700 border-gray-200';
const blue = 'bg-blue-100 text-blue-800 border-blue-200';
const purple = 'bg-purple-100 text-purple-800 border-purple-200';

const statusStyles = {
  // Vendor
  approved: green,
  pending: amber,
  rejected: red,
  suspended: red,
  blocked: gray,
  // Product
  active: green,
  inactive: gray,
  published: green,
  draft: amber,
  pending_approval: amber,
  out_of_stock: red,
  // Order items
  accepted: blue,
  preparing: purple,
  ready: 'bg-teal-100 text-teal-800 border-teal-200',
  dispatched: green,
  // Inventory
  low: red,
  ok: green,
};

/**
 * @param {string} status raw status value from the API
 * @param {string} [label] optional translated label (falls back to a humanised status)
 */
export default function StatusBadge({ status, label }) {
  const normalized = String(status || 'unknown').toLowerCase();
  const className = statusStyles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';
  const text = label || normalized.replace(/_/g, ' ');

  return (
    <Badge variant="outline" className={`capitalize ${className}`}>
      {text}
    </Badge>
  );
}
