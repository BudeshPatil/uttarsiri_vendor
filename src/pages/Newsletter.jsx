import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import newsletterService from '@/services/newsletter.service';
import PageHeader, { AlertMessage } from '@/components/admin/PageHeader';
import Pagination from '@/components/ui/pagination';
import usePaginationState from '@/hooks/usePaginationState';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const {
    page, limit, pagination, setPagination, changePage, changeLimit, query,
  } = usePaginationState();

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await newsletterService.getAll(query);
      setSubscribers(response.data?.subscribers || response.data?.items || response.data || []);
      setPagination(response.data?.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load newsletter subscribers');
    } finally {
      setLoading(false);
    }
  }, [query, setPagination]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleDelete = async (id) => {
    try {
      await newsletterService.remove(id);
      setSuccess('Subscriber removed successfully');
      fetchSubscribers();
    } catch (err) {
      setError(err.message || 'Failed to remove subscriber');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader title="Newsletter" description="Manage newsletter subscribers" onRefresh={fetchSubscribers} isRefreshing={loading} />

      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Subscribed At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8">Loading subscribers...</TableCell></TableRow>
            ) : subscribers.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8">No subscribers found</TableCell></TableRow>
            ) : (
              subscribers.map((item) => (
                <TableRow key={item.subscriber_id || item.id}>
                  <TableCell className="font-medium">{item.email}</TableCell>
                  <TableCell>{item.created_at ? new Date(item.created_at).toLocaleString() : '—'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.subscriber_id || item.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
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
