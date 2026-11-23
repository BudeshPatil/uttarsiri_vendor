import { useCallback, useEffect, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import uploadService from '@/services/upload.service';
import PageHeader, { AlertMessage } from '@/components/admin/PageHeader';
import Pagination from '@/components/ui/pagination';
import usePaginationState from '@/hooks/usePaginationState';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

export default function UploadsPage() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const {
    page, limit, pagination, setPagination, changePage, changeLimit, query,
  } = usePaginationState();

  const fetchUploads = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await uploadService.getAll(query);
      setUploads(response.data?.uploads || response.data?.items || response.data || []);
      setPagination(response.data?.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load uploads');
    } finally {
      setLoading(false);
    }
  }, [query, setPagination]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      await uploadService.upload(file);
      setSuccess('File uploaded successfully');
      fetchUploads();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    try {
      await uploadService.remove(id);
      setSuccess('Upload deleted successfully');
      fetchUploads();
    } catch (err) {
      setError(err.message || 'Failed to delete upload');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Uploads"
        description="Manage uploaded media and files"
        onRefresh={fetchUploads}
        isRefreshing={loading}
        actions={
          <div>
            <input type="file" id="file-upload" className="hidden" onChange={handleUpload} disabled={uploading} />
            <Button asChild disabled={uploading}>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload File'}
              </label>
            </Button>
          </div>
        }
      />

      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Loading uploads...</TableCell></TableRow>
            ) : uploads.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">No uploads found</TableCell></TableRow>
            ) : (
              uploads.map((item) => (
                <TableRow key={item.upload_id || item.id}>
                  <TableCell className="font-medium">{item.filename || item.name}</TableCell>
                  <TableCell>{item.mime_type || item.type || '—'}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.url || '—'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.upload_id || item.id)}>
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
