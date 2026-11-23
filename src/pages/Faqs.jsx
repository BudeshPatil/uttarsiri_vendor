import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import faqService from '@/services/faq.service';
import PageHeader, { AlertMessage } from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';
import FormField from '@/components/admin/FormField';
import Pagination from '@/components/ui/pagination';
import usePaginationState from '@/hooks/usePaginationState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const emptyForm = {
  question: '',
  answer: '',
  sort_order: 0,
  status: 'active',
  is_featured: false,
};

export default function FaqsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const { page, limit, pagination, setPagination, changePage, changeLimit, query } = usePaginationState();

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await faqService.getAll(query);
      setItems(response.data?.faqs || []);
      setPagination(response.data?.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load FAQs');
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

  const updateForm = (updates) => setFormData((prev) => ({ ...prev, ...updates }));

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData(emptyForm);
  };

  const openCreate = () => {
    setEditing(null);
    // Continue the existing order instead of restarting at 0.
    const nextOrder = items.reduce((max, item) => Math.max(max, Number(item.sort_order) || 0), 0) + 1;
    setFormData({ ...emptyForm, sort_order: nextOrder });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormData({
      question: item.question || '',
      answer: item.answer || '',
      sort_order: item.sort_order ?? 0,
      status: item.status || 'active',
      is_featured: Boolean(item.is_featured),
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
        is_featured: Boolean(formData.is_featured),
      };
      if (editing) {
        await faqService.update(editing.faq_id, payload);
        setSuccess('FAQ updated successfully');
      } else {
        await faqService.create(payload);
        setSuccess('FAQ created successfully');
      }
      closeModal();
      fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to save FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await faqService.remove(id);
      setSuccess('FAQ deleted successfully');
      fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to delete FAQ');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="FAQs"
        description="Frequently Asked Questions shown on the website home page"
        onRefresh={fetchItems}
        isRefreshing={loading}
        actions={<Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add FAQ</Button>}
      />
      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead className="hidden lg:table-cell">Answer</TableHead>
                <TableHead className="hidden sm:table-cell">Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">No FAQs yet</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.faq_id}>
                  <TableCell className="font-medium max-w-sm">{item.question}</TableCell>
                  <TableCell className="hidden lg:table-cell max-w-md text-gray-500 truncate">{item.answer}</TableCell>
                  <TableCell className="hidden sm:table-cell">{item.sort_order ?? 0}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.faq_id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
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
        title={editing ? 'Edit FAQ' : 'Add FAQ'}
        footer={(
          <>
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" form="faq-form" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      >
        <form id="faq-form" onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Question" hint="Shown as the clickable heading in the FAQ list.">
            <Input
              placeholder="How long does a typical home renovation take?"
              value={formData.question}
              onChange={(e) => updateForm({ question: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Answer" hint="Shown when the question is expanded.">
            <Textarea
              placeholder="Project timelines vary based on scope..."
              value={formData.answer}
              onChange={(e) => updateForm({ answer: e.target.value })}
              rows={5}
              required
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

            <FormField label="Status" hint="Inactive FAQs are hidden from the website.">
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
