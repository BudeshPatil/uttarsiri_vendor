import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Send, Trash2 } from 'lucide-react';
import vendorService, { PRODUCT_UNITS } from '@/services/vendor.service';
import { useI18n } from '@/contexts/LanguageContext';
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
import { formatCurrency } from '@/lib/vendorFormat';

const PRODUCT_STATUSES = ['draft', 'pending_approval', 'active', 'inactive'];
const SUBMITTABLE = ['draft', 'inactive'];

const emptyVariant = () => ({
  variant_id: null,
  sku: '',
  weight: '',
  unit: 'g',
  selling_price: '',
  original_price: '',
  stock_quantity: '',
});

const emptyForm = () => ({
  sku: '',
  name_en: '',
  name_kn: '',
  name_hi: '',
  description_en: '',
  description_kn: '',
  description_hi: '',
  category_ids: [],
  brand: '',
  origin: '',
  ingredients: '',
  storage_instructions: '',
  shelf_life: '',
  product_images: [''],
  variants: [emptyVariant()],
});

const numStr = (value) => (value === null || value === undefined ? '' : String(value));

const productToForm = (product) => ({
  sku: product.sku || '',
  name_en: product.name_en || product.name || '',
  name_kn: product.name_kn || '',
  name_hi: product.name_hi || '',
  description_en: product.description_en || '',
  description_kn: product.description_kn || '',
  description_hi: product.description_hi || '',
  category_ids: [...(product.category_ids || [])],
  brand: product.brand || '',
  origin: product.origin || '',
  ingredients: product.ingredients || '',
  storage_instructions: product.storage_instructions || '',
  shelf_life: product.shelf_life || '',
  product_images: product.product_images?.length ? [...product.product_images] : [''],
  variants: (product.variants || []).map((v) => ({
    variant_id: v.variant_id,
    sku: v.sku || '',
    weight: numStr(v.weight),
    unit: v.unit || 'g',
    selling_price: numStr(v.selling_price),
    original_price: numStr(v.original_price),
    stock_quantity: '',
  })),
});

const TEXT_FIELDS = [
  'name_kn', 'name_hi', 'description_en', 'description_kn', 'description_hi',
  'brand', 'origin', 'ingredients', 'storage_instructions', 'shelf_life',
];

function variantErrors(variants, t) {
  if (variants.length === 0) return t('products.needVariant');
  for (let i = 0; i < variants.length; i += 1) {
    const v = variants[i];
    const label = `Variant ${i + 1}`;
    if (v.sku.trim().length < 2) return `${label}: SKU is required (min 2 characters)`;
    if (!(Number(v.weight) > 0)) return `${label}: weight must be greater than 0`;
    if (v.selling_price === '' || !(Number(v.selling_price) >= 0)) return `${label}: selling price is required`;
    if (v.original_price !== '' && !(Number(v.original_price) >= 0)) return `${label}: original price is invalid`;
    if (v.stock_quantity !== '' && !(Number.isInteger(Number(v.stock_quantity)) && Number(v.stock_quantity) >= 0)) {
      return `${label}: stock must be a whole number`;
    }
  }
  return '';
}

function variantPayload(v, { includeStock }) {
  const payload = {
    sku: v.sku.trim(),
    weight: Number(v.weight),
    unit: v.unit,
    selling_price: Number(v.selling_price),
  };
  if (v.original_price !== '') payload.original_price = Number(v.original_price);
  if (includeStock && v.stock_quantity !== '') payload.stock_quantity = Number(v.stock_quantity);
  return payload;
}

export default function VendorProducts() {
  const { t, lang } = useI18n();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [busyId, setBusyId] = useState('');
  const { page, limit, pagination, setPagination, changePage, changeLimit, resetPage } = usePaginationState();

  const query = useMemo(() => {
    const params = { page, limit, lang };
    if (statusFilter !== 'all') params.status = statusFilter;
    if (search) params.search = search;
    return params;
  }, [page, limit, lang, statusFilter, search]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await vendorService.listProducts(query);
      setProducts(response.data?.products || []);
      setPagination(response.data?.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [query, setPagination]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    let cancelled = false;
    vendorService.listCategories(lang)
      .then((response) => {
        if (!cancelled) setCategories(response.data?.categories || []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [lang]);

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(''), 5000);
    return () => clearTimeout(timer);
  }, [success]);

  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const updateVariant = (index, patch) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm());
    setModalError('');
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalError('');
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm(productToForm(product));
    setModalError('');
    setShowModal(true);
  };

  const toggleCategory = (id) => {
    updateForm({
      category_ids: form.category_ids.includes(id)
        ? form.category_ids.filter((c) => c !== id)
        : [...form.category_ids, id],
    });
  };

  const buildCreatePayload = () => {
    const payload = {
      sku: form.sku.trim(),
      name_en: form.name_en.trim(),
      status: 'draft',
      variants: form.variants.map((v) => variantPayload(v, { includeStock: true })),
    };
    TEXT_FIELDS.forEach((key) => {
      if (form[key].trim()) payload[key] = form[key].trim();
    });
    if (form.category_ids.length) payload.category_ids = form.category_ids;
    const images = form.product_images.map((i) => i.trim()).filter(Boolean);
    if (images.length) payload.product_images = images;
    return payload;
  };

  const buildUpdatePayload = () => {
    const payload = { name_en: form.name_en.trim() };
    if (form.sku.trim() && form.sku.trim() !== editing.sku) payload.sku = form.sku.trim();
    TEXT_FIELDS.forEach((key) => {
      payload[key] = form[key].trim();
    });
    payload.category_ids = form.category_ids;
    payload.product_images = form.product_images.map((i) => i.trim()).filter(Boolean);
    return payload;
  };

  const saveVariantsForEdit = async (productId) => {
    const originals = new Map((editing.variants || []).map((v) => [v.variant_id, v]));
    for (const v of form.variants) {
      if (!v.variant_id) {
        await vendorService.addVariant(productId, variantPayload(v, { includeStock: true }));
        continue;
      }
      const original = originals.get(v.variant_id);
      const next = variantPayload(v, { includeStock: false });
      const changed = !original
        || next.sku !== original.sku
        || next.weight !== Number(original.weight)
        || next.unit !== original.unit
        || next.selling_price !== Number(original.selling_price)
        || (next.original_price ?? null) !== (original.original_price ?? null);
      if (changed) {
        await vendorService.updateVariant(productId, v.variant_id, next);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (form.sku.trim().length < 2) {
      setModalError('SKU is required (min 2 characters)');
      return;
    }
    if (form.name_en.trim().length < 2) {
      setModalError('English name is required (min 2 characters)');
      return;
    }
    const variantProblem = editing && form.variants.length === 0 ? '' : variantErrors(form.variants, t);
    if (variantProblem) {
      setModalError(variantProblem);
      return;
    }

    try {
      setSubmitting(true);
      if (editing) {
        await vendorService.updateProduct(editing.product_id, buildUpdatePayload());
        await saveVariantsForEdit(editing.product_id);
      } else {
        await vendorService.createProduct(buildCreatePayload());
      }
      setSuccess(t('products.saved'));
      closeModal();
      fetchProducts();
    } catch (err) {
      setModalError(err.message || 'Failed to save product');
      if (editing) fetchProducts();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForApproval = async (product) => {
    try {
      setBusyId(product.product_id);
      setError('');
      await vendorService.submitProduct(product.product_id);
      setSuccess(t('products.submitted'));
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to submit product');
    } finally {
      setBusyId('');
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      setBusyId(product.product_id);
      setError('');
      await vendorService.deleteProduct(product.product_id);
      setSuccess(t('products.deleted'));
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setBusyId('');
    }
  };

  const categoryName = (c) => c.name || c.name_en || c.category_id;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={t('products.title')}
        description={t('products.subtitle')}
        onRefresh={fetchProducts}
        isRefreshing={loading}
        actions={(
          <Button onClick={openCreate} className="bg-[#0e782c] hover:bg-[#095c21]">
            <Plus className="mr-2 h-4 w-4" />
            {t('products.add')}
          </Button>
        )}
      />
      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput.trim());
            resetPage();
          }}
        >
          <Input
            placeholder={t('products.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="outline">{t('common.search')}</Button>
        </form>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              resetPage();
            }}
          >
            <SelectTrigger aria-label={t('products.statusFilter')}><SelectValue /></SelectTrigger>
            <SelectContent className="z-[60]">
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {PRODUCT_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('products.sku')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('products.variants')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="py-8 text-center">{t('common.loading')}</TableCell></TableRow>
              ) : products.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="py-8 text-center">{t('common.noData')}</TableCell></TableRow>
              ) : products.map((product) => (
                <TableRow key={product.product_id}>
                  <TableCell className="font-medium">{product.name || product.name_en}</TableCell>
                  <TableCell className="hidden sm:table-cell">{product.sku}</TableCell>
                  <TableCell><StatusBadge status={product.status} /></TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(product.variants || []).map((v) => (
                        <span
                          key={v.variant_id}
                          className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                        >
                          {v.weight} {v.unit} · {formatCurrency(v.selling_price)}
                        </span>
                      ))}
                      {(product.variants || []).length === 0 && <span className="text-xs text-gray-400">—</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {SUBMITTABLE.includes(product.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busyId === product.product_id}
                          onClick={() => handleSubmitForApproval(product)}
                          title={t('products.submitForApproval')}
                        >
                          <Send className="mr-1.5 h-4 w-4" />
                          <span className="hidden lg:inline">{t('products.submitForApproval')}</span>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEdit(product)} aria-label={t('common.edit')}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={busyId === product.product_id}
                        onClick={() => handleDelete(product)}
                        aria-label={t('common.delete')}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
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
        title={editing ? t('products.edit') : t('products.add')}
        footer={(
          <>
            <Button type="button" variant="outline" onClick={closeModal}>{t('common.cancel')}</Button>
            <Button type="submit" form="vendor-product-form" disabled={submitting} className="bg-[#0e782c] hover:bg-[#095c21]">
              {submitting ? t('common.saving') : t('common.save')}
            </Button>
          </>
        )}
      >
        <form id="vendor-product-form" onSubmit={handleSubmit} className="space-y-6">
          <AlertMessage message={modalError} />

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">{t('products.basicInfo')}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label={t('products.sku')}>
                <Input value={form.sku} onChange={(e) => updateForm({ sku: e.target.value })} required />
              </FormField>
              <FormField label={t('products.brand')}>
                <Input value={form.brand} onChange={(e) => updateForm({ brand: e.target.value })} />
              </FormField>
            </div>

            <FormField label={t('products.categories')}>
              {categories.length === 0 ? (
                <p className="text-xs text-gray-500">{t('products.noCategories')}</p>
              ) : (
                <div className="grid max-h-40 grid-cols-1 gap-1.5 overflow-y-auto rounded-lg border border-gray-200 p-3 sm:grid-cols-2">
                  {categories.map((c) => (
                    <label key={c.category_id} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 accent-[#0e782c]"
                        checked={form.category_ids.includes(c.category_id)}
                        onChange={() => toggleCategory(c.category_id)}
                      />
                      {categoryName(c)}
                    </label>
                  ))}
                </div>
              )}
            </FormField>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">{t('products.translations')}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label={t('products.nameEn')}>
                <Input value={form.name_en} onChange={(e) => updateForm({ name_en: e.target.value })} required />
              </FormField>
              <FormField label={t('products.nameKn')}>
                <Input value={form.name_kn} onChange={(e) => updateForm({ name_kn: e.target.value })} />
              </FormField>
              <FormField label={t('products.nameHi')}>
                <Input value={form.name_hi} onChange={(e) => updateForm({ name_hi: e.target.value })} />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label={t('products.descEn')}>
                <Textarea rows={3} value={form.description_en} onChange={(e) => updateForm({ description_en: e.target.value })} />
              </FormField>
              <FormField label={t('products.descKn')}>
                <Textarea rows={3} value={form.description_kn} onChange={(e) => updateForm({ description_kn: e.target.value })} />
              </FormField>
              <FormField label={t('products.descHi')}>
                <Textarea rows={3} value={form.description_hi} onChange={(e) => updateForm({ description_hi: e.target.value })} />
              </FormField>
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{t('products.images')}</h3>
              <p className="text-xs text-gray-500">{t('products.imagesHint')}</p>
            </div>
            {form.product_images.map((image, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  <ImageUploadField
                    label={`${t('products.images')} ${index + 1}`}
                    value={image}
                    onChange={(value) =>
                      updateForm({ product_images: form.product_images.map((img, i) => (i === index ? value : img)) })}
                    placeholder="https://... or /public/uploads/..."
                    previewClassName="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                  />
                </div>
                {form.product_images.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="mb-0.5 shrink-0"
                    onClick={() => updateForm({ product_images: form.product_images.filter((_, i) => i !== index) })}
                    aria-label={t('common.remove')}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => updateForm({ product_images: [...form.product_images, ''] })}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              {t('products.addImage')}
            </Button>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">{t('products.extra')}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label={t('products.origin')}>
                <Input value={form.origin} onChange={(e) => updateForm({ origin: e.target.value })} />
              </FormField>
              <FormField label={t('products.shelfLife')}>
                <Input value={form.shelf_life} onChange={(e) => updateForm({ shelf_life: e.target.value })} />
              </FormField>
              <FormField label={t('products.ingredients')}>
                <Input value={form.ingredients} onChange={(e) => updateForm({ ingredients: e.target.value })} />
              </FormField>
              <FormField label={t('products.storage')}>
                <Input value={form.storage_instructions} onChange={(e) => updateForm({ storage_instructions: e.target.value })} />
              </FormField>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">{t('products.variants')}</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateForm({ variants: [...form.variants, emptyVariant()] })}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                {t('products.addVariant')}
              </Button>
            </div>

            {form.variants.map((variant, index) => {
              const existing = Boolean(variant.variant_id);
              return (
                <div key={variant.variant_id || `new-${index}`} className="rounded-xl border border-gray-200 p-3">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                    <div className="col-span-2 md:col-span-2">
                      <FormField label={t('products.sku')}>
                        <Input value={variant.sku} onChange={(e) => updateVariant(index, { sku: e.target.value })} />
                      </FormField>
                    </div>
                    <FormField label={t('products.weight')}>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={variant.weight}
                        onChange={(e) => updateVariant(index, { weight: e.target.value })}
                      />
                    </FormField>
                    <FormField label={t('products.unit')}>
                      <Select value={variant.unit} onValueChange={(value) => updateVariant(index, { unit: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="z-[60]">
                          {PRODUCT_UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label={t('products.sellingPrice')}>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={variant.selling_price}
                        onChange={(e) => updateVariant(index, { selling_price: e.target.value })}
                      />
                    </FormField>
                    <FormField label={t('products.originalPrice')}>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={variant.original_price}
                        onChange={(e) => updateVariant(index, { original_price: e.target.value })}
                      />
                    </FormField>
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    {existing ? (
                      <p className="text-xs text-gray-500">{t('nav.inventory')}: {t('inventory.updateStock')}</p>
                    ) : (
                      <div className="w-40">
                        <FormField label={t('products.stock')}>
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            value={variant.stock_quantity}
                            onChange={(e) => updateVariant(index, { stock_quantity: e.target.value })}
                          />
                        </FormField>
                      </div>
                    )}
                    {!existing && form.variants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updateForm({ variants: form.variants.filter((_, i) => i !== index) })}
                      >
                        <Trash2 className="mr-1.5 h-4 w-4 text-red-600" />
                        {t('common.remove')}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </form>
      </Modal>
    </div>
  );
}
