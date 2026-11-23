import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import projectCategoryService from '@/services/projectCategory.service';
import { uploadFile } from '@/lib/uploadHelpers';
import PageHeader, { AlertMessage } from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';
import FormField from '@/components/admin/FormField';
import ImageUploadField from '@/components/admin/ImageUploadField';
import Pagination from '@/components/ui/pagination';
import usePaginationState from '@/hooks/usePaginationState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const emptyForm = {
  name: '',
  description: '',
  image: '',
  sort_order: 0,
  status: 'active',
};

export default function ProjectCategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { page, limit, pagination, setPagination, changePage, changeLimit, query } = usePaginationState();

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await projectCategoryService.getAll(query);
      setItems(response.data?.categories || []);
      setPagination(response.data?.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load project categories');
    } finally {
      setLoading(false);
    }
  }, [query, setPagination]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    if (!success && !error) return undefined;
    const timer = setTimeout(() => {
      setSuccess('');
      setError('');
    }, 6000);
    return () => clearTimeout(timer);
  }, [success, error]);

  const updateForm = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData(emptyForm);
  };

  const openCreate = () => {
    setEditing(null);
    const nextOrder = items.reduce((max, item) => Math.max(max, Number(item.sort_order) || 0), 0) + 1;
    setFormData({ ...emptyForm, sort_order: nextOrder });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      image: item.image || '',
      sort_order: item.sort_order ?? 0,
      status: item.status || 'active',
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError('');
      const url = await uploadFile(file);
      updateForm({ image: url });
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const payload = { ...formData, sort_order: Number(formData.sort_order) || 0 };

      if (editing) {
        await projectCategoryService.update(editing.category_id, payload);
        setSuccess(
          editing.name !== payload.name
            ? `Category renamed. Projects using "${editing.name}" were moved to "${payload.name}".`
            : 'Category updated successfully',
        );
      } else {
        await projectCategoryService.create(payload);
        setSuccess('Category created successfully');
      }
      closeModal();
      fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    try {
      setError('');
      await projectCategoryService.remove(item.category_id);
      setSuccess('Category deleted successfully');
      fetchItems();
    } catch (err) {
      // The API refuses to delete a category that projects still reference.
      setError(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Project Categories"
        description="Categories used to group and filter portfolio projects"
        onRefresh={fetchItems}
        isRefreshing={loading}
        actions={<Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Category</Button>}
      />
      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Slug</TableHead>
                <TableHead className="hidden sm:table-cell">Projects</TableHead>
                <TableHead className="hidden lg:table-cell">Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">No project categories yet</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.category_id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-gray-500">{item.slug || '—'}</TableCell>
                  <TableCell className="hidden sm:table-cell">{item.project_count ?? 0}</TableCell>
                  <TableCell className="hidden lg:table-cell">{item.sort_order ?? 0}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item)}
                        title={item.project_count ? `${item.project_count} project(s) still use this category` : 'Delete category'}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
        onClose={closeModal}
        title={editing ? 'Edit Project Category' : 'Add Project Category'}
        footer={(
          <>
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" form="project-category-form" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      >
        <form id="project-category-form" onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Name"
            hint={editing
              ? 'Renaming also updates every project currently in this category.'
              : 'Shown as a filter chip on the website portfolio page.'}
          >
            <Input
              placeholder="Residential Interior"
              value={formData.name}
              onChange={(e) => updateForm({ name: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Description" hint="Optional short line describing the category.">
            <Textarea
              placeholder="Full-home interior projects delivered end to end."
              value={formData.description}
              onChange={(e) => updateForm({ description: e.target.value })}
              rows={2}
            />
          </FormField>

          <ImageUploadField
            label="Category Image"
            hint="Optional cover image, for use in category listings."
            value={formData.image}
            onChange={(value) => updateForm({ image: value })}
            uploading={uploadingImage}
            onUpload={handleImageUpload}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Sort Order" hint="Lower numbers appear first.">
              <Input
                type="number"
                min={0}
                value={formData.sort_order}
                onChange={(e) => updateForm({ sort_order: e.target.value })}
              />
            </FormField>

            <FormField label="Status" hint="Inactive categories are hidden from the website.">
              <Select value={formData.status} onValueChange={(value) => updateForm({ status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="z-[60]">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </form>
      </Modal>
    </div>
  );
}
