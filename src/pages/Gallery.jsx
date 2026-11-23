import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, GalleryThumbnails } from 'lucide-react';
import galleryService from '@/services/gallery.service';
import { uploadFile } from '@/lib/uploadHelpers';
import { getMediaUrl } from '@/config/api';
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

const SECTIONS = [
  { value: 'about', label: 'About page' },
  { value: 'home', label: 'Home page' },
];

const emptyForm = {
  title: '',
  image: '',
  alt_text: '',
  caption: '',
  section: 'about',
  sort_order: 0,
  status: 'active',
  is_featured: false,
};

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const { page, limit, pagination, setPagination, changePage, changeLimit, query } = usePaginationState();

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await galleryService.getAll(query);
      setItems(response.data?.galleries || []);
      setPagination(response.data?.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load gallery images');
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
    }, 5000);
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
    // Continue the existing order rather than restarting at 0.
    const nextOrder = items.reduce((max, item) => Math.max(max, Number(item.sort_order) || 0), 0) + 1;
    setFormData({ ...emptyForm, sort_order: nextOrder });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormData({
      title: item.title || '',
      image: item.image || '',
      alt_text: item.alt_text || '',
      caption: item.caption || '',
      section: item.section || 'about',
      sort_order: item.sort_order ?? 0,
      status: item.status || 'active',
      is_featured: Boolean(item.is_featured),
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

  // A gallery is filled a dozen images at a time, so uploading one at a time
  // through the modal is the slow path. This creates one record per file.
  const handleBulkUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setBulkUploading(true);
      setError('');
      let nextOrder = items.reduce((max, item) => Math.max(max, Number(item.sort_order) || 0), 0);

      for (const file of files) {
        const url = await uploadFile(file);
        nextOrder += 1;
        await galleryService.create({
          title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Gallery image',
          image: url,
                  section: 'about',
          sort_order: nextOrder,
          status: 'active',
        });
      }

      setSuccess(`${files.length} image${files.length > 1 ? 's' : ''} added to the gallery`);
      fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to bulk upload images');
    } finally {
      setBulkUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const payload = {
        ...formData,
        sort_order: Number(formData.sort_order) || 0,
        is_featured: Boolean(formData.is_featured),
      };
      if (editing) {
        await galleryService.update(editing.gallery_id, payload);
        setSuccess('Gallery image updated successfully');
      } else {
        await galleryService.create(payload);
        setSuccess('Gallery image created successfully');
      }
      closeModal();
      fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to save gallery image');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await galleryService.remove(id);
      setSuccess('Gallery image deleted successfully');
      fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to delete gallery image');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Gallery"
        description="Images shown in the About page section — Craft, Detail & Finished Spaces"
        onRefresh={fetchItems}
        isRefreshing={loading}
        actions={(
          <>
            <Button variant="outline" disabled={bulkUploading} asChild>
              <label className="cursor-pointer">
                <GalleryThumbnails className="w-4 h-4 mr-2" />
                {bulkUploading ? 'Uploading...' : 'Bulk Upload'}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleBulkUpload} />
              </label>
            </Button>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Image</Button>
          </>
        )}
      />
      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden lg:table-cell">Section</TableHead>
                <TableHead className="hidden md:table-cell">Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">No gallery images found</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.gallery_id}>
                  <TableCell>
                    {item.image ? (
                      <img
                        src={getMediaUrl(item.image)}
                        alt={item.alt_text || item.title}
                        className="h-12 w-16 rounded-md border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="h-12 w-16 rounded-md border border-dashed border-gray-200" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="hidden lg:table-cell">{item.section || '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">{item.sort_order ?? 0}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.gallery_id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
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
        title={editing ? 'Edit Gallery Image' : 'Add Gallery Image'}
        footer={(
          <>
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" form="gallery-form" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      >
        <form id="gallery-form" onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Title" hint="Internal label, also used as the image alt text fallback.">
            <Input
              placeholder="Modular kitchen detail"
              value={formData.title}
              onChange={(e) => updateForm({ title: e.target.value })}
              required
            />
          </FormField>

          <ImageUploadField
            label="Image"
            hint="Shown in the About page gallery slider."
            value={formData.image}
            onChange={(value) => updateForm({ image: value })}
            uploading={uploadingImage}
            onUpload={handleImageUpload}
          />

          <FormField label="Section" hint="Which page renders this image.">
            <Select value={formData.section} onValueChange={(value) => updateForm({ section: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="z-[60]">
                {SECTIONS.map((section) => (
                  <SelectItem key={section.value} value={section.value}>{section.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Alt Text" hint="Describes the image for screen readers and search engines.">
            <Input
              placeholder="Finished modular kitchen with island counter"
              value={formData.alt_text}
              onChange={(e) => updateForm({ alt_text: e.target.value })}
            />
          </FormField>

          <FormField label="Caption" hint="Optional short line shown with the image.">
            <Textarea
              placeholder="Hand-finished cabinetry in a 3BHK Whitefield project."
              value={formData.caption}
              onChange={(e) => updateForm({ caption: e.target.value })}
              rows={2}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Sort Order" hint="Lower numbers appear first.">
              <Input
                type="number"
                min={0}
                value={formData.sort_order}
                onChange={(e) => updateForm({ sort_order: e.target.value })}
              />
            </FormField>

            <FormField label="Status">
              <Select value={formData.status} onValueChange={(value) => updateForm({ status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="z-[60]">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => updateForm({ is_featured: e.target.checked })}
                  className="rounded border-gray-300"
                />
                Featured
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
