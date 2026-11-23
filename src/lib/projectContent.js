import { normalizeRelatedIds } from '@/lib/relatedItems';
import { slugifyTitle } from '@/lib/serviceContent';

export { slugifyTitle };

export const PROJECT_STATUS_OPTIONS = [
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'planning', label: 'Planning' },
];

export function formFromProject(item) {
  return {
    title: item.title || '',
    slug: item.slug || '',
    short_description: item.short_description || '',
    overview: item.overview || '',
    category: item.category || '',
    location: item.location || '',
    budget: item.budget || '',
    cover_image: item.cover_image || '',
    before_image: item.before_image || '',
    after_image: item.after_image || '',
    gallery: Array.isArray(item.gallery) ? item.gallery : [],
    status: item.status || 'draft',
    is_featured: Boolean(item.is_featured),
    project_status: item.project_status || 'completed',
    completion_date: item.completion_date || '',
    meta_title: item.meta_title || '',
    meta_description: item.meta_description || '',
    related_projects: normalizeRelatedIds(item.related_projects, 'project_id'),
  };
}

export function payloadFromForm(formData) {
  return {
    title: formData.title.trim(),
    slug: formData.slug.trim(),
    short_description: formData.short_description.trim(),
    overview: formData.overview.trim(),
    category: formData.category.trim(),
    location: formData.location.trim(),
    budget: formData.budget.trim(),
    cover_image: formData.cover_image.trim(),
    before_image: formData.before_image.trim(),
    after_image: formData.after_image.trim(),
    gallery: Array.isArray(formData.gallery) ? formData.gallery.filter(Boolean) : [],
    status: formData.status,
    is_featured: Boolean(formData.is_featured),
    project_status: formData.project_status,
    completion_date: formData.completion_date.trim(),
    meta_title: formData.meta_title.trim(),
    meta_description: formData.meta_description.trim(),
    related_projects: Array.isArray(formData.related_projects) ? formData.related_projects : [],
  };
}
