import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import cmsService from '@/services/cms.service';
import PageHeader, { AlertMessage } from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';
import Pagination from '@/components/ui/pagination';
import usePaginationState from '@/hooks/usePaginationState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const emptyForm = {
  title: '',
  slug: '',
  content: '',
  status: 'draft',
  meta_title: '',
  meta_description: '',
};

export default function CmsPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const {
    page, limit, pagination, setPagination, changePage, changeLimit, query,
  } = usePaginationState();

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await cmsService.getAll(query);
      setPages(response.data?.pages || response.data?.items || response.data || []);
      setPagination(response.data?.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load CMS pages');
    } finally {
      setLoading(false);
    }
  }, [query, setPagination]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const openCreateModal = () => {
    setEditingPage(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (page) => {
    setEditingPage(page);
    setFormData({
      title: page.title || '',
      slug: page.slug || '',
      content: page.content || '',
      status: page.status || 'draft',
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      if (editingPage) {
        await cmsService.update(editingPage.page_id || editingPage.id, formData);
        setSuccess('Page updated successfully');
      } else {
        await cmsService.create(formData);
        setSuccess('Page created successfully');
      }
      setShowModal(false);
      fetchPages();
    } catch (err) {
      setError(err.message || 'Failed to save page');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await cmsService.remove(id);
      setSuccess('Page deleted successfully');
      fetchPages();
    } catch (err) {
      setError(err.message || 'Failed to delete page');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="CMS Pages"
        description="Manage website content pages"
        onRefresh={fetchPages}
        isRefreshing={loading}
        actions={<Button onClick={openCreateModal}><Plus className="w-4 h-4 mr-2" />Add Page</Button>}
      />

      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Loading pages...</TableCell></TableRow>
            ) : pages.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">No CMS pages found</TableCell></TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.page_id || page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>{page.slug}</TableCell>
                  <TableCell><StatusBadge status={page.status} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(page)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(page.page_id || page.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
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

      <Modal
        open={showModal}
        title={editingPage ? 'Edit Page' : 'Add Page'}
        onClose={() => setShowModal(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div><label className="text-sm font-medium">Title</label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
          <div><label className="text-sm font-medium">Slug</label><Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required /></div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><label className="text-sm font-medium">Content</label><Textarea rows={6} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Meta Title</label><Input value={formData.meta_title} onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Meta Description</label><Textarea value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} /></div>
        </form>
      </Modal>
    </div>
  );
}
