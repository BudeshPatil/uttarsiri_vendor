import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import permissionService from '@/services/permission.service';
import PageHeader, { AlertMessage } from '@/components/admin/PageHeader';
import Modal from '@/components/admin/Modal';
import Pagination from '@/components/ui/pagination';
import usePaginationState from '@/hooks/usePaginationState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const emptyForm = { name: '', code: '', module: '', description: '' };

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const {
    page, limit, pagination, setPagination, changePage, changeLimit, query,
  } = usePaginationState();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await permissionService.getAll(query);
      setPermissions(response.data?.permissions || response.data?.items || response.data || []);
      setPagination(response.data?.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }, [query, setPagination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      code: item.code || '',
      module: item.module || '',
      description: item.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      if (editingItem) {
        await permissionService.update(editingItem.permission_id, formData);
        setSuccess('Permission updated successfully');
      } else {
        await permissionService.create(formData);
        setSuccess('Permission created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to save permission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await permissionService.remove(id);
      setSuccess('Permission deleted successfully');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete permission');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Permissions"
        description="Manage permission definitions"
        onRefresh={fetchData}
        isRefreshing={loading}
        actions={<Button onClick={openCreateModal}><Plus className="w-4 h-4 mr-2" />Add Permission</Button>}
      />

      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading permissions...</TableCell></TableRow>
            ) : permissions.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">No permissions found</TableCell></TableRow>
            ) : (
              permissions.map((item) => (
                <TableRow key={item.permission_id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>{item.module}</TableCell>
                  <TableCell>{item.description || '—'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(item)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.permission_id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
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
        title={editingItem ? 'Edit Permission' : 'Add Permission'}
        onClose={() => setShowModal(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div><label className="text-sm font-medium">Name</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
          <div><label className="text-sm font-medium">Code</label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required /></div>
          <div><label className="text-sm font-medium">Module</label><Input value={formData.module} onChange={(e) => setFormData({ ...formData, module: e.target.value })} required /></div>
          <div><label className="text-sm font-medium">Description</label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
        </form>
      </Modal>
    </div>
  );
}
