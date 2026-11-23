import { useCallback, useEffect, useState } from 'react';
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import bannerService from '@/services/banner.service';
import uploadService from '@/services/upload.service';
import { getMediaUrl } from '@/config/api';
import PageHeader, { AlertMessage } from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';
import HomeBannerSlider from '@/components/HomeBannerSlider';
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
  subtitle: '',
  description: '',
  image: '',
  mobile_image: '',
  link_url: '',
  link_target: '_self',
  button_text: '',
  sort_order: 0,
  status: 'active',
};

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const {
    page, limit, pagination, setPagination, changePage, changeLimit, query,
  } = usePaginationState();

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bannerService.getAll(query);
      setBanners(response.data?.banners || response.data?.items || response.data || []);
      setPagination(response.data?.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  }, [query, setPagination]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const extractUploadUrl = (response) => {
    const data = response?.data;
    return data?.url || data?.upload?.url || data?.path || '';
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploading = field === 'image' ? setUploadingImage : setUploadingMobile;

    try {
      setUploading(true);
      setError('');
      const response = await uploadService.upload(file);
      const url = extractUploadUrl(response);
      if (!url) throw new Error('Upload succeeded but no file URL was returned');
      setFormData((prev) => ({ ...prev, [field]: url }));
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image: banner.image || '',
      mobile_image: banner.mobile_image || '',
      link_url: banner.link_url || '',
      link_target: banner.link_target || '_self',
      button_text: banner.button_text || '',
      sort_order: banner.sort_order ?? 0,
      status: banner.status || 'active',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const payload = {
        ...formData,
        sort_order: Number(formData.sort_order) || 0,
      };

      if (editingBanner) {
        await bannerService.update(editingBanner.banner_id || editingBanner.id, payload);
        setSuccess('Banner updated successfully');
      } else {
        await bannerService.create(payload);
        setSuccess('Banner created successfully');
      }

      setShowModal(false);
      fetchBanners();
      setPreviewKey((key) => key + 1);
    } catch (err) {
      setError(err.message || 'Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await bannerService.remove(id);
      setSuccess('Banner deleted successfully');
      fetchBanners();
      setPreviewKey((key) => key + 1);
    } catch (err) {
      setError(err.message || 'Failed to delete banner');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Home Banners"
        description="Manage homepage banner slider slides"
        onRefresh={() => {
          fetchBanners();
          setPreviewKey((key) => key + 1);
        }}
        isRefreshing={loading}
        actions={(
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Banner
          </Button>
        )}
      />

      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Homepage slider preview</h3>
        <HomeBannerSlider key={previewKey} />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading banners...</TableCell></TableRow>
            ) : banners.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">No banners found</TableCell></TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow key={banner.banner_id || banner.id}>
                  <TableCell>
                    {banner.image ? (
                      <img
                        src={getMediaUrl(banner.image)}
                        alt={banner.title}
                        className="h-12 w-20 rounded-md object-cover border border-gray-100"
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{banner.title}</div>
                    {banner.subtitle && <div className="text-xs text-gray-500">{banner.subtitle}</div>}
                  </TableCell>
                  <TableCell>{banner.sort_order ?? 0}</TableCell>
                  <TableCell><StatusBadge status={banner.status} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(banner)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(banner.banner_id || banner.id)}
                      >
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
        title={editingBanner ? 'Edit Banner' : 'Add Banner'}
        onClose={() => setShowModal(false)}
        footer={(
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting || !formData.image}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Subtitle</label>
            <Input
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Desktop Image</label>
            {formData.image && (
              <img
                src={getMediaUrl(formData.image)}
                alt="Banner preview"
                className="h-28 w-full rounded-lg object-cover border border-gray-100"
              />
            )}
            <div className="flex flex-wrap gap-2">
              <input
                id="banner-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'image')}
                disabled={uploadingImage}
              />
              <Button type="button" variant="outline" asChild disabled={uploadingImage}>
                <label htmlFor="banner-image-upload" className="cursor-pointer">
                  <ImagePlus className="w-4 h-4 mr-2" />
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </label>
              </Button>
            </div>
            <Input
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="/public/uploads/banner.jpg"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile Image (optional)</label>
            {formData.mobile_image && (
              <img
                src={getMediaUrl(formData.mobile_image)}
                alt="Mobile banner preview"
                className="h-28 w-full rounded-lg object-cover border border-gray-100"
              />
            )}
            <div className="flex flex-wrap gap-2">
              <input
                id="banner-mobile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'mobile_image')}
                disabled={uploadingMobile}
              />
              <Button type="button" variant="outline" asChild disabled={uploadingMobile}>
                <label htmlFor="banner-mobile-upload" className="cursor-pointer">
                  <ImagePlus className="w-4 h-4 mr-2" />
                  {uploadingMobile ? 'Uploading...' : 'Upload Mobile Image'}
                </label>
              </Button>
            </div>
            <Input
              value={formData.mobile_image}
              onChange={(e) => setFormData({ ...formData, mobile_image: e.target.value })}
              placeholder="Optional mobile image URL"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Button Text</label>
              <Input
                value={formData.button_text}
                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                placeholder="Learn More"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Link URL</label>
              <Input
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Link Target</label>
              <Select
                value={formData.link_target}
                onValueChange={(value) => setFormData({ ...formData, link_target: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">Same tab</SelectItem>
                  <SelectItem value="_blank">New tab</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Sort Order</label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
