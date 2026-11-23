import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, CheckCircle, XCircle, Ban, Unlock } from 'lucide-react';
import userService from '@/services/user.service';
import roleService from '@/services/role.service';
import PageHeader, { AlertMessage } from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';
import Pagination from '@/components/ui/pagination';
import usePaginationState from '@/hooks/usePaginationState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role_id: '',
  status: 'pending',
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const {
    page,
    limit,
    pagination,
    setPagination,
    changePage,
    changeLimit,
    resetPage,
    query,
  } = usePaginationState();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { ...query };
      if (statusFilter !== 'all') params.status = statusFilter;

      const [usersRes, rolesRes] = await Promise.all([
        userService.getAll(params),
        roleService.getAll({ limit: 100 }),
      ]);
      setUsers(usersRes.data?.users || usersRes.data?.items || usersRes.data || []);
      setPagination(usersRes.data?.pagination);
      setRoles(rolesRes.data?.roles || rolesRes.data?.items || rolesRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [query, statusFilter, setPagination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term),
    );
  }, [users, searchTerm]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role_id: user.role_id || '',
      status: user.status || 'pending',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const payload = { ...formData };
      if (editingUser && !payload.password) delete payload.password;

      if (editingUser) {
        await userService.update(editingUser.user_id, payload);
        setSuccess('User updated successfully');
      } else {
        await userService.create(payload);
        setSuccess('User created successfully');
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const runAction = async (action, userId) => {
    try {
      setError('');
      await action(userId);
      setSuccess('Action completed successfully');
      fetchData();
    } catch (err) {
      setError(err.message || 'Action failed');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Users"
        description="Manage user accounts, approvals, and access"
        onRefresh={fetchData}
        isRefreshing={loading}
        actions={
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        }
      />

      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            resetPage();
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">Loading users...</TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">No users found</TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '—'}</TableCell>
                  <TableCell><StatusBadge status={user.status} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1 flex-wrap">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(user)} title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {user.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => runAction(userService.approve, user.user_id)} title="Approve">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => runAction(userService.reject, user.user_id)} title="Reject">
                            <XCircle className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      {user.status === 'blocked' ? (
                        <Button variant="ghost" size="icon" onClick={() => runAction(userService.unblock, user.user_id)} title="Unblock">
                          <Unlock className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => runAction(userService.block, user.user_id)} title="Block">
                          <Ban className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => runAction(userService.remove, user.user_id)} title="Delete">
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

      <Modal
        open={showModal}
        title={editingUser ? 'Edit User' : 'Add User'}
        onClose={() => setShowModal(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : editingUser ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password {editingUser && '(leave blank to keep)'}</label>
            <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingUser} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <Select value={formData.role_id} onValueChange={(value) => setFormData({ ...formData, role_id: value })}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.role_id} value={role.role_id}>{role.role_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
