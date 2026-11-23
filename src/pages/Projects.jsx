import { useCallback, useEffect, useMemo, useState } from 'react';
import { ImagePlus, Plus, Pencil, Trash2, X } from 'lucide-react';
import projectService from '@/services/project.service';
import projectCategoryService from '@/services/projectCategory.service';
import uploadService from '@/services/upload.service';
import { getMediaUrl } from '@/config/api';
import {
  formFromProject,
  payloadFromForm,
  PROJECT_STATUS_OPTIONS,
  slugifyTitle,
} from '@/lib/projectContent';
import PageHeader, { AlertMessage } from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';
import RelatedItemsField from '@/components/admin/RelatedItemsField';
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
  category: '',
  location: '',
  budget: '',
  cover_image: '',
  before_image: '',
  after_image: '',
  gallery: [],
  status: 'draft',
  is_featured: false,
  project_status: 'completed',
  completion_date: '',
  meta_title: '',
  meta_description: '',
  related_projects: [],
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
    <Field label="Gallery Images" hint="Additional images shown on the project detail page.">
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

function formatProjectStatus(status) {
  const match = PROJECT_STATUS_OPTIONS.find((item) => item.value === status);
  return match?.label || status || '—';
}

export default function ProjectsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [projectOptions, setProjectOptions] = useState([]);
  const [loadingProjectOptions, setLoadingProjectOptions] = useState(false);
  const { page, limit, pagination, setPagination, changePage, changeLimit, query } = usePaginationState();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    projectCategoryService
      .getAll({ limit: 100, status: 'active' })
      .then((res) => setCategories(res.data?.categories || []))
      .catch(() => setCategories([]));
  }, []);

  // A project may already hold a category that predates the managed list, or one
  // that has since been deactivated. Keep it selectable so saving cannot wipe it.
  const categoryOptions = useMemo(() => {
    const names = categories.map((item) => item.name).filter(Boolean);
    const current = formData.category?.trim();
    if (current && !names.includes(current)) return [current, ...names];
    return names;
  }, [categories, formData.category]);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await projectService.getAll(query);
      setItems(response.data?.projects || []);
      setPagination(response.data?.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [query, setPagination]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const fetchProjectOptions = useCallback(async () => {
    try {
      setLoadingProjectOptions(true);
      const response = await projectService.getAll({ page: 1, limit: 100 });
      setProjectOptions(response.data?.projects || []);
    } catch (err) {
      setError(err.message || 'Failed to load project options');
    } finally {
      setLoadingProjectOptions(false);
    }
  }, []);

  useEffect(() => {
    if (!showModal) return;
    fetchProjectOptions();
  }, [showModal, fetchProjectOptions]);

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
    setFormData(formFromProject(item));
    setSlugEdited(true);
    setShowModal(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const payload = payloadFromForm(formData);

      if (editing) {
        await projectService.update(editing.project_id, payload);
        setSuccess('Project updated successfully');
      } else {
        await projectService.create(payload);
        setSuccess('Project created successfully');
      }
      closeModal();
      fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await projectService.remove(id);
      setSuccess('Project deleted successfully');
      fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    }
  };

  const relatedProjectChoices = projectOptions
    .filter((item) => !editing || String(item.project_id) !== String(editing.project_id))
    .map((item) => ({
      id: item.project_id,
      label: item.title,
      sublabel: [item.category, item.location].filter(Boolean).join(' · '),
    }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Projects"
        description="Manage portfolio projects shown on the website"
        onRefresh={fetchItems}
        isRefreshing={loading}
        actions={(
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Project
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
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">Project Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">No projects found</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.project_id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="hidden sm:table-cell">{item.category || '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">{item.location || '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{formatProjectStatus(item.project_status)}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="hidden md:table-cell">{item.is_featured ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.project_id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
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
        title={editing ? 'Edit Project' : 'Add Project'}
        footer={(
          <>
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" form="project-form" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      >
        <form id="project-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title" hint="Project name shown on the portfolio page.">
              <Input
                placeholder="Aurora Residence"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </Field>

            <Field label="Slug" hint="URL path, e.g. /portfolio/aurora-residence">
              <Input
                placeholder="aurora-residence"
                value={formData.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  updateForm({ slug: e.target.value });
                }}
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="Category"
              hint={categoryOptions.length ? 'Managed under Project Categories.' : 'Add categories under Project Categories to pick from a list.'}
            >
              {categoryOptions.length > 0 ? (
                <Select value={formData.category} onValueChange={(value) => updateForm({ category: value })}>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent className="z-[60]">
                    {categoryOptions.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Residential Interior"
                  value={formData.category}
                  onChange={(e) => updateForm({ category: e.target.value })}
                />
              )}
            </Field>

            <Field label="Location">
              <Input
                placeholder="Mumbai"
                value={formData.location}
                onChange={(e) => updateForm({ location: e.target.value })}
              />
            </Field>

            <Field label="Budget">
              <Input
                placeholder="INR 18L"
                value={formData.budget}
                onChange={(e) => updateForm({ budget: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Project Status" hint="Build phase shown on the detail page.">
              <Select value={formData.project_status} onValueChange={(value) => updateForm({ project_status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="z-[60]">
                  {PROJECT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Completion Date" hint="Year or full date, e.g. 2026">
              <Input
                placeholder="2026"
                value={formData.completion_date}
                onChange={(e) => updateForm({ completion_date: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Short Description" hint="Summary for cards and the detail hero.">
            <Textarea
              placeholder="A full interior overhaul that keeps circulation clear..."
              value={formData.short_description}
              onChange={(e) => updateForm({ short_description: e.target.value })}
              rows={2}
            />
          </Field>

          <Field label="Overview" hint="Full project story shown on the detail page.">
            <Textarea
              placeholder="The brief called for a calm, family-friendly home..."
              value={formData.overview}
              onChange={(e) => updateForm({ overview: e.target.value })}
              rows={6}
            />
          </Field>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ImageUploadField
              label="Cover Image"
              hint="Main hero image for listings and detail page."
              value={formData.cover_image}
              onChange={(value) => updateForm({ cover_image: value })}
              uploading={uploadingCover}
              onUpload={handleSingleUpload('cover_image', setUploadingCover)}
            />

            <ImageUploadField
              label="Before Image"
              hint="Before renovation photo."
              value={formData.before_image}
              onChange={(value) => updateForm({ before_image: value })}
              uploading={uploadingBefore}
              onUpload={handleSingleUpload('before_image', setUploadingBefore)}
            />

            <ImageUploadField
              label="After Image"
              hint="After renovation photo."
              value={formData.after_image}
              onChange={(value) => updateForm({ after_image: value })}
              uploading={uploadingAfter}
              onUpload={handleSingleUpload('after_image', setUploadingAfter)}
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

          <RelatedItemsField
            label="Related Projects"
            hint="Projects shown in the related section on the detail page."
            options={relatedProjectChoices}
            selectedIds={formData.related_projects}
            onChange={(related_projects) => updateForm({ related_projects })}
            loading={loadingProjectOptions}
            maxItems={6}
            emptyMessage="Publish other projects first to use them as related items."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Publish Status">
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
                Featured project
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
