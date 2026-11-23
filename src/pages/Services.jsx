import { useCallback, useEffect, useState } from 'react';
import { ImagePlus, Plus, Pencil, Trash2, X } from 'lucide-react';
import serviceService from '@/services/service.service';
import uploadService from '@/services/upload.service';
import { getMediaUrl } from '@/config/api';
import { SERVICE_TEMPLATES } from '@/data/serviceTemplates';
import { SERVICE_FEATURE_OPTIONS } from '@/data/serviceFeatureOptions';
import {
  formFromService,
  payloadFromForm,
  slugifyTitle,
} from '@/lib/serviceContent';
import PageHeader, { AlertMessage } from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';
import Pagination from '@/components/ui/pagination';
import usePaginationState from '@/hooks/usePaginationState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const emptyForm = {
  title: '',
  slug: '',
  short_description: '',
  overview: '',
  features: [],
  category: '',
  banner_image: '',
  homepage_image: '',
  gallery: [],
  status: 'draft',
  is_featured: false,
  sort_order: 0,
  meta_title: '',
  meta_description: '',
};

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

function ImageUploadField({ label, hint, value, onChange, uploading, onUpload }) {
  return (
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        {value ? (
          <div className="relative">
            <img
              src={getMediaUrl(value)}
              alt={label}
              className="h-32 w-full rounded-lg border border-gray-200 object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => onChange('')}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="/public/uploads/image.jpg"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <Button type="button" variant="outline" disabled={uploading} asChild className="shrink-0">
            <label className="cursor-pointer">
              <ImagePlus className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload'}
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
            </label>
          </Button>
        </div>
      </div>
    </Field>
  );
}

function GalleryField({ images, uploading, onUpload, onRemove }) {
  return (
    <Field label="Gallery Images" hint="Upload multiple images for the service detail page.">
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="relative group">
              <img
                src={getMediaUrl(url)}
                alt={`Gallery ${index + 1}`}
                className="h-24 w-full rounded-lg border border-gray-200 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-7 w-7 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(index)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
      <Button type="button" variant="outline" disabled={uploading} asChild>
        <label className="cursor-pointer">
          <ImagePlus className="w-4 h-4 mr-2" />
          {uploading ? 'Uploading...' : 'Add Gallery Images'}
          <input type="file" accept="image/*" multiple className="hidden" onChange={onUpload} />
        </label>
      </Button>
    </Field>
  );
}

export default function ServicesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingHomepage, setUploadingHomepage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const { page, limit, pagination, setPagination, changePage, changeLimit, query } = usePaginationState();

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await serviceService.getAll(query);
      setItems(response.data?.services || []);
      setPagination(response.data?.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load services');
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

  const handleTitleChange = (title) => {
    updateForm({
      title,
      ...(slugEdited ? {} : { slug: slugifyTitle(title) }),
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData(emptyForm);
    setSlugEdited(false);
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm);
    setSlugEdited(false);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormData(formFromService(item));
    setSlugEdited(true);
    setShowModal(true);
  };

  const applyTemplate = (templateId) => {
    const template = SERVICE_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;

    setFormData({
      ...emptyForm,
      ...template.data,
      features: template.data.features || [],
      gallery: template.data.gallery || [],
      homepage_image: template.data.homepage_image || '',
    });
    setSlugEdited(true);
  };

  const extractUploadUrl = (response) => {
    const data = response?.data;
    return data?.url || data?.upload?.url || data?.path || '';
  };

  const uploadFile = async (file) => {
    const response = await uploadService.upload(file);
    const url = extractUploadUrl(response);
    if (!url) throw new Error('Upload succeeded but no file URL was returned');
    return url;
  };

  const handleSingleUpload = (field, setUploading) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      const url = await uploadFile(file);
      updateForm({ [field]: url });
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setUploadingGallery(true);
      setError('');
      const urls = await Promise.all(files.map((file) => uploadFile(file)));
      updateForm({ gallery: [...formData.gallery, ...urls] });
    } catch (err) {
      setError(err.message || 'Failed to upload gallery images');
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  };

  const toggleFeature = (feature) => {
    const selected = formData.features.includes(feature)
      ? formData.features.filter((item) => item !== feature)
      : [...formData.features, feature];
    updateForm({ features: selected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = payloadFromForm(formData);

      if (editing) {
        await serviceService.update(editing.service_id, payload);
        setSuccess('Service updated successfully');
      } else {
        await serviceService.create(payload);
        setSuccess('Service created successfully');
      }
      closeModal();
      fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await serviceService.remove(id);
      setSuccess('Service deleted successfully');
      fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to delete service');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Services"
        description="Manage service offerings"
        onRefresh={fetchItems}
        isRefreshing={loading}
        actions={(
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        )}
      />
      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">No services found</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.service_id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="hidden sm:table-cell">{item.category || '—'}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="hidden md:table-cell">{item.is_featured ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.service_id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
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
        title={editing ? 'Edit Service' : 'Add Service'}
        footer={(
          <>
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" form="service-form" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      >
        <form id="service-form" onSubmit={handleSubmit} className="space-y-5">
          {!editing && SERVICE_TEMPLATES.length > 0 ? (
            <Field label="Start from template" hint="Load pre-written content and edit before saving.">
              <Select onValueChange={applyTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template (optional)" />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  {SERVICE_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>{template.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title" hint="Service name shown on the website.">
              <Input
                placeholder="Personal Transformation Coaching"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </Field>

            <Field label="Slug" hint="URL-friendly identifier">
              <Input
                placeholder="personal-transformation-coaching"
                value={formData.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  updateForm({ slug: e.target.value });
                }}
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Category">
              <Input
                placeholder="Coaching"
                value={formData.category}
                onChange={(e) => updateForm({ category: e.target.value })}
              />
            </Field>

            <Field label="Sort Order">
              <Input
                type="number"
                min="0"
                value={formData.sort_order}
                onChange={(e) => updateForm({ sort_order: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Short Description" hint="Brief summary for cards and listings.">
            <Textarea
              placeholder="One-line summary of the service"
              value={formData.short_description}
              onChange={(e) => updateForm({ short_description: e.target.value })}
              rows={2}
            />
          </Field>

          <Field label="Overview" hint="Main description paragraphs for the service page.">
            <Textarea
              placeholder="Describe what this service includes..."
              value={formData.overview}
              onChange={(e) => updateForm({ overview: e.target.value })}
              rows={5}
            />
          </Field>

          <Field
            label="Key Features"
            hint={`Select the features to show for this service (${formData.features.length} selected).`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl border border-gray-200 p-3 max-h-48 overflow-y-auto bg-gray-50">
              {SERVICE_FEATURE_OPTIONS.map((feature) => (
                <label
                  key={feature}
                  className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-white cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => toggleFeature(feature)}
                    className="mt-0.5 rounded border-gray-300"
                  />
                  <span>{feature}</span>
                </label>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ImageUploadField
              label="Banner Image"
              hint="Hero image on the service detail page."
              value={formData.banner_image}
              onChange={(value) => updateForm({ banner_image: value })}
              uploading={uploadingBanner}
              onUpload={handleSingleUpload('banner_image', setUploadingBanner)}
            />

            <ImageUploadField
              label="Home Page Image"
              hint="Thumbnail shown on the homepage services section."
              value={formData.homepage_image}
              onChange={(value) => updateForm({ homepage_image: value })}
              uploading={uploadingHomepage}
              onUpload={handleSingleUpload('homepage_image', setUploadingHomepage)}
            />
          </div>

          <GalleryField
            images={formData.gallery}
            uploading={uploadingGallery}
            onUpload={handleGalleryUpload}
            onRemove={(index) => updateForm({
              gallery: formData.gallery.filter((_, i) => i !== index),
            })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Status">
              <Select value={formData.status} onValueChange={(value) => updateForm({ status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="z-[60]">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => updateForm({ is_featured: e.target.checked })}
                  className="rounded border-gray-300"
                />
                Featured service
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Meta Title">
              <Input
                placeholder="SEO page title"
                value={formData.meta_title}
                onChange={(e) => updateForm({ meta_title: e.target.value })}
              />
            </Field>

            <Field label="Meta Description">
              <Textarea
                placeholder="SEO description"
                value={formData.meta_description}
                onChange={(e) => updateForm({ meta_description: e.target.value })}
                rows={2}
              />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
