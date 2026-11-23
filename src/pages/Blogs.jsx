import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import blogService from '@/services/blog.service';
import { formFromBlog, payloadFromForm, slugifyTitle } from '@/lib/blogContent';
import { uploadFile } from '@/lib/uploadHelpers';
import PageHeader, { AlertMessage } from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';
import FormField from '@/components/admin/FormField';
import ImageUploadField from '@/components/admin/ImageUploadField';
import RelatedItemsField from '@/components/admin/RelatedItemsField';
import Pagination from '@/components/ui/pagination';
import usePaginationState from '@/hooks/usePaginationState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  status: 'draft',
  author: '',
  cover_image: '',
  related_blogs: [],
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [blogOptions, setBlogOptions] = useState([]);
  const [loadingBlogOptions, setLoadingBlogOptions] = useState(false);
  const {
    page, limit, pagination, setPagination, changePage, changeLimit, query,
  } = usePaginationState();

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await blogService.getAll(query);
      setBlogs(response.data?.blogs || response.data?.items || response.data || []);
      setPagination(response.data?.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [query, setPagination]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const fetchBlogOptions = useCallback(async () => {
    try {
      setLoadingBlogOptions(true);
      const response = await blogService.getAll({ page: 1, limit: 100 });
      setBlogOptions(response.data?.blogs || response.data?.items || response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load blog options');
    } finally {
      setLoadingBlogOptions(false);
    }
  }, []);

  useEffect(() => {
    if (!showModal) return;
    fetchBlogOptions();
  }, [showModal, fetchBlogOptions]);

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
    setEditingBlog(null);
    setFormData(emptyForm);
    setSlugEdited(false);
  };

  const openCreateModal = () => {
    setEditingBlog(null);
    setFormData(emptyForm);
    setSlugEdited(false);
    setShowModal(true);
  };

  const openEditModal = (blog) => {
    setEditingBlog(blog);
    setFormData(formFromBlog(blog));
    setSlugEdited(true);
    setShowModal(true);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      setError('');
      const url = await uploadFile(file);
      updateForm({ cover_image: url });
    } catch (err) {
      setError(err.message || 'Failed to upload cover image');
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const payload = payloadFromForm(formData);
      if (editingBlog) {
        await blogService.update(editingBlog.blog_id || editingBlog.id, payload);
        setSuccess('Blog updated successfully');
      } else {
        await blogService.create(payload);
        setSuccess('Blog created successfully');
      }
      closeModal();
      fetchBlogs();
    } catch (err) {
      setError(err.message || 'Failed to save blog');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await blogService.remove(id);
      setSuccess('Blog deleted successfully');
      fetchBlogs();
    } catch (err) {
      setError(err.message || 'Failed to delete blog');
    }
  };

  const relatedBlogChoices = blogOptions
    .filter((blog) => {
      const currentId = editingBlog?.blog_id || editingBlog?.id;
      const blogId = blog.blog_id || blog.id;
      return !currentId || String(blogId) !== String(currentId);
    })
    .map((blog) => ({
      id: blog.blog_id || blog.id,
      label: blog.title,
      sublabel: [blog.author, blog.status].filter(Boolean).join(' · '),
    }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Blogs"
        description="Manage blog posts and articles"
        onRefresh={fetchBlogs}
        isRefreshing={loading}
        actions={<Button onClick={openCreateModal}><Plus className="w-4 h-4 mr-2" />Add Blog</Button>}
      />

      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Loading blogs...</TableCell></TableRow>
              ) : blogs.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">No blogs found</TableCell></TableRow>
              ) : (
                blogs.map((blog) => (
                  <TableRow key={blog.blog_id || blog.id}>
                    <TableCell className="font-medium">{blog.title}</TableCell>
                    <TableCell className="hidden sm:table-cell">{blog.author || '—'}</TableCell>
                    <TableCell><StatusBadge status={blog.status} /></TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(blog)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(blog.blog_id || blog.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
        title={editingBlog ? 'Edit Blog' : 'Add Blog'}
        onClose={closeModal}
        footer={(
          <>
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" form="blog-form" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      >
        <form id="blog-form" className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Title" hint="Blog post title shown on the website.">
              <Input
                placeholder="How to plan your dream kitchen"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Slug" hint="URL path, e.g. /blog/how-to-plan-your-dream-kitchen">
              <Input
                placeholder="how-to-plan-your-dream-kitchen"
                value={formData.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  updateForm({ slug: e.target.value });
                }}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Author">
              <Input
                placeholder="Innoventies Team"
                value={formData.author}
                onChange={(e) => updateForm({ author: e.target.value })}
              />
            </FormField>

            <FormField label="Status">
              <Select value={formData.status} onValueChange={(value) => updateForm({ status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="z-[60]">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField label="Excerpt" hint="Short summary for blog cards and SEO.">
            <Textarea
              placeholder="A brief introduction to the article..."
              value={formData.excerpt}
              onChange={(e) => updateForm({ excerpt: e.target.value })}
              rows={2}
            />
          </FormField>

          <FormField label="Content" hint="Full article body.">
            <Textarea
              placeholder="Write your blog content here..."
              rows={8}
              value={formData.content}
              onChange={(e) => updateForm({ content: e.target.value })}
            />
          </FormField>

          <ImageUploadField
            label="Cover Image"
            hint="Hero image for the blog listing and detail page."
            value={formData.cover_image}
            onChange={(value) => updateForm({ cover_image: value })}
            uploading={uploadingCover}
            onUpload={handleCoverUpload}
          />

          <RelatedItemsField
            label="Related Blogs"
            hint="Articles shown in the related section on the blog detail page."
            options={relatedBlogChoices}
            selectedIds={formData.related_blogs}
            onChange={(related_blogs) => updateForm({ related_blogs })}
            loading={loadingBlogOptions}
            maxItems={6}
            emptyMessage="Create other blog posts first to use them as related items."
          />
        </form>
      </Modal>
    </div>
  );
}
