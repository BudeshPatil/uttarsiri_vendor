import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function PageHeader({ title, description, onRefresh, isRefreshing, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}

export function StatCard({ title, value, icon: Icon, tone = 'blue' }) {
  const tones = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {Icon && (
          <div className={`p-2 rounded-lg bg-gradient-to-br ${tones[tone] || tones.blue}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{value ?? '—'}</div>
      </CardContent>
    </Card>
  );
}

export function AlertMessage({ type = 'error', message }) {
  if (!message) return null;

  const styles = {
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  return (
    <div className={`p-4 rounded-xl border mb-4 text-sm ${styles[type]}`}>
      {message}
    </div>
  );
}
