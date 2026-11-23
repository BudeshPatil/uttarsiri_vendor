import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import testimonialService from '@/services/testimonial.service';
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
  customer_name: '',
  customer_image: '',
  customer_location: '',
  service_name: '',
  rating: 5,
  content: '',
  status: 'pending',
  is_featured: false,
};

export default function TestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const { page, limit, pagination, setPagination, changePage, changeLimit, query } = usePaginationState();

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await testimonialService.getAll(query);
      setItems(response.data?.testimonials || []);
      setPagination(response.data?.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load testimonials');
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
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormData({
      customer_name: item.customer_name || '',
      customer_image: item.customer_image || '',
      customer_location: item.customer_location || '',
      service_name: item.service_name || '',
      rating: item.rating ?? 5,
      content: item.content || '',
      status: item.status || 'pending',
      is_featured: Boolean(item.is_featured),
    });
    setShowModal(true);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      setError('');
      const url = await uploadFile(file);
      updateForm({ customer_image: url });
    } catch (err) {
      setError(err.message || 'Failed to upload customer photo');
    } finally {
      setUploadingPhoto(false);
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
        rating: Number(formData.rating),
        is_featured: Boolean(formData.is_featured),
      };
      if (editing) {
        await testimonialService.update(editing.testimonial_id, payload);
        setSuccess('Testimonial updated successfully');
      } else {
        await testimonialService.create(payload);
        setSuccess('Testimonial created successfully');
      }
      closeModal();
      fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to save testimonial');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await testimonialService.remove(id);
      setSuccess('Testimonial deleted successfully');
      fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to delete testimonial');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Testimonials"
        description="Manage customer testimonials"
        onRefresh={fetchItems}
        isRefreshing={loading}
        actions={<Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Testimonial</Button>}
      />
      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">No testimonials found</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.testimonial_id}>
                  <TableCell className="font-medium">{item.customer_name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{item.rating}/5</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="hidden md:table-cell">{item.is_featured ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.testimonial_id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
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
        title={editing ? 'Edit Testimonial' : 'Add Testimonial'}
        footer={(
          <>
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" form="testimonial-form" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      >
        <form id="testimonial-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Customer Name" hint="Name shown on the testimonial card.">
              <Input
                placeholder="Priya Sharma"
                value={formData.customer_name}
                onChange={(e) => updateForm({ customer_name: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Location">
              <Input
                placeholder="Mumbai"
                value={formData.customer_location}
                onChange={(e) => updateForm({ customer_location: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Service Name">
              <Input
                placeholder="Kitchen Renovation"
                value={formData.service_name}
                onChange={(e) => updateForm({ service_name: e.target.value })}
              />
            </FormField>

            <FormField label="Rating" hint="Score from 1 to 5.">
              <Input
                type="number"
                min={1}
                max={5}
                value={formData.rating}
                onChange={(e) => updateForm({ rating: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Testimonial" hint="Customer quote or review text.">
            <Textarea
              placeholder="Share what the customer said about their experience..."
              value={formData.content}
              onChange={(e) => updateForm({ content: e.target.value })}
              rows={4}
            />
          </FormField>

          <ImageUploadField
            label="Customer Photo"
            hint="Profile photo shown alongside the testimonial."
            value={formData.customer_image}
            onChange={(value) => updateForm({ customer_image: value })}
            uploading={uploadingPhoto}
            onUpload={handlePhotoUpload}
            previewClassName="h-28 w-28 rounded-full border border-gray-200 object-cover"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Status">
              <Select value={formData.status} onValueChange={(value) => updateForm({ status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="z-[60]">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
                Featured testimonial
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
