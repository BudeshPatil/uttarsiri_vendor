import { useCallback, useEffect, useState } from 'react';
import auditLogService from '@/services/auditlog.service';
import PageHeader, { AlertMessage } from '@/components/admin/PageHeader';
import Pagination from '@/components/ui/pagination';
import usePaginationState from '@/hooks/usePaginationState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ user_id: '', module: '', action: '' });
  const [appliedFilters, setAppliedFilters] = useState({ user_id: '', module: '', action: '' });
  const {
    page, limit, pagination, setPagination, changePage, changeLimit, resetPage, query,
  } = usePaginationState();

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        ...query,
        ...Object.fromEntries(
          Object.entries(appliedFilters).filter(([, value]) => value !== '' && value !== null),
        ),
      };
      const response = await auditLogService.getAll(params);
      setLogs(response.data?.logs || response.data?.items || response.data || []);
      setPagination(response.data?.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [query, appliedFilters, setPagination]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const applyFilters = () => {
    setAppliedFilters(filters);
    resetPage();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader title="Audit Logs" description="Track system activity and changes" onRefresh={fetchLogs} isRefreshing={loading} />

      <AlertMessage message={error} />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        <Input placeholder="User ID" value={filters.user_id} onChange={(e) => setFilters({ ...filters, user_id: e.target.value })} />
        <Input placeholder="Module" value={filters.module} onChange={(e) => setFilters({ ...filters, module: e.target.value })} />
        <Input placeholder="Action" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} />
        <Button onClick={applyFilters}>Apply Filters</Button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Loading audit logs...</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">No audit logs found</TableCell></TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.audit_id || log.id}>
                  <TableCell>{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</TableCell>
                  <TableCell>{log.user_id || '—'}</TableCell>
                  <TableCell>{log.module || '—'}</TableCell>
                  <TableCell>{log.action || '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
    </div>
  );
}
