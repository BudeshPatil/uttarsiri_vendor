import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import roleService from '@/services/role.service';
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

const emptyForm = {
  role_name: '',
  role_code: '',
  description: '',
  permissions: [],
};

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const {
    page, limit, pagination, setPagination, changePage, changeLimit, query,
  } = usePaginationState();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [rolesRes, permissionsRes] = await Promise.all([
        roleService.getAll(query),
        permissionService.getAll({ limit: 100 }).catch(() => ({ data: [] })),
      ]);
      setRoles(rolesRes.data?.roles || rolesRes.data?.items || rolesRes.data || []);
      setPagination(rolesRes.data?.pagination);
      setPermissions(permissionsRes.data?.permissions || permissionsRes.data?.items || permissionsRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, [query, setPagination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setFormData({
      role_name: role.role_name || '',
      role_code: role.role_code || '',
      description: role.description || '',
      permissions: role.permissions || [],
    });
    setShowModal(true);
  };

  const togglePermission = (code) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(code)
        ? prev.permissions.filter((p) => p !== code)
        : [...prev.permissions, code],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      if (editingRole) {
        await roleService.update(editingRole.role_id, formData);
        setSuccess('Role updated successfully');
      } else {
        await roleService.create(formData);
        setSuccess('Role created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to save role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (roleId) => {
    try {
      await roleService.remove(roleId);
      setSuccess('Role deleted successfully');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete role');
    }
  };

  const permissionOptions = permissions.length
    ? permissions.map((p) => p.code || p.name)
    : [
        'USERS_READ', 'USERS_CREATE', 'USERS_UPDATE', 'USERS_DELETE', 'USERS_APPROVE', 'USERS_BLOCK',
        'ROLES_READ', 'ROLES_CREATE', 'ROLES_UPDATE', 'ROLES_DELETE',
        'SETTINGS_READ', 'SETTINGS_UPDATE', 'SEO_READ', 'SEO_UPDATE',
      ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Roles"
        description="Manage roles and assign permissions"
        onRefresh={fetchData}
        isRefreshing={loading}
        actions={
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        }
      />

      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Loading roles...</TableCell></TableRow>
            ) : roles.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">No roles found</TableCell></TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.role_id}>
                  <TableCell className="font-medium">{role.role_name}</TableCell>
                  <TableCell>{role.role_code}</TableCell>
                  <TableCell className="max-w-md truncate">{(role.permissions || []).join(', ') || '—'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(role)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(role.role_id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
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
        title={editingRole ? 'Edit Role' : 'Add Role'}
        onClose={() => setShowModal(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-700">Role Name</label>
            <Input value={formData.role_name} onChange={(e) => setFormData({ ...formData, role_name: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Role Code</label>
            <Input value={formData.role_code} onChange={(e) => setFormData({ ...formData, role_code: e.target.value.toUpperCase() })} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Permissions</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {permissionOptions.map((code) => (
                <label key={code} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(code)}
                    onChange={() => togglePermission(code)}
                  />
                  {code}
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
