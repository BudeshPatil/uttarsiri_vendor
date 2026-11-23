import { normalizeRelatedIds } from '@/lib/relatedItems';
import { slugifyTitle } from '@/lib/serviceContent';

export { slugifyTitle };

export function formFromBlog(item) {
  return {
    title: item.title || '',
    slug: item.slug || '',
    excerpt: item.excerpt || '',
    content: item.content || '',
    status: item.status || 'draft',
    author: item.author || '',
    cover_image: item.cover_image || '',
    related_blogs: normalizeRelatedIds(item.related_blogs, 'blog_id'),
  };
}

export function payloadFromForm(formData) {
  return {
    title: formData.title.trim(),
    slug: formData.slug.trim(),
    excerpt: formData.excerpt.trim(),
    content: formData.content.trim(),
    status: formData.status,
    author: formData.author.trim(),
    cover_image: formData.cover_image.trim(),
    related_blogs: Array.isArray(formData.related_blogs) ? formData.related_blogs : [],
  };
}
