import { useCallback, useEffect, useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import contactService from '@/services/contact.service';
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

const LEAD_STATUSES = ['new', 'contacted', 'follow_up', 'quotation_sent', 'converted', 'closed'];

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [leadStatus, setLeadStatus] = useState('new');
  const [followUpDate, setFollowUpDate] = useState('');
  const [note, setNote] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const {
    page, limit, pagination, setPagination, changePage, changeLimit, query,
  } = usePaginationState();

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { ...query };
      if (filterStatus) params.lead_status = filterStatus;
      const response = await contactService.getAll(params);
      setContacts(response.data?.contacts || []);
      setPagination(response.data?.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [query, filterStatus, setPagination]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const openLead = (contact) => {
    setSelected(contact);
    setLeadStatus(contact.lead_status || 'new');
    setFollowUpDate(contact.follow_up_date || '');
    setNote('');
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      const payload = { lead_status: leadStatus, follow_up_date: followUpDate };
      if (note.trim()) payload.note = { content: note.trim() };
      await contactService.update(selected.contact_id, payload);
      setSuccess('Lead updated successfully');
      setShowModal(false);
      fetchContacts();
    } catch (err) {
      setError(err.message || 'Failed to update lead');
    }
  };

  const handleDelete = async (id) => {
    try {
      await contactService.remove(id);
      setSuccess('Contact deleted successfully');
      fetchContacts();
    } catch (err) {
      setError(err.message || 'Failed to delete contact');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader title="Leads & Inquiries" description="Manage contact form submissions and lead pipeline" onRefresh={fetchContacts} isRefreshing={loading} />

      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <div className="mb-4 flex gap-3">
        <Select value={filterStatus || 'all'} onValueChange={(v) => setFilterStatus(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {LEAD_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Lead Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : contacts.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">No inquiries found</TableCell></TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact.contact_id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.service_interest || '—'}</TableCell>
                  <TableCell><StatusBadge status={contact.lead_status || 'new'} /></TableCell>
                  <TableCell>{contact.source || 'website'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openLead(contact)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(contact.contact_id)}>
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Lead Details">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Name:</span> {selected.name}</div>
              <div><span className="text-muted-foreground">Email:</span> {selected.email}</div>
              <div><span className="text-muted-foreground">Phone:</span> {selected.phone || '—'}</div>
              <div><span className="text-muted-foreground">Service:</span> {selected.service_interest || '—'}</div>
            </div>
            <p className="text-sm"><span className="text-muted-foreground">Message:</span> {selected.message || '—'}</p>

            <Select value={leadStatus} onValueChange={setLeadStatus}>
              <SelectTrigger><SelectValue placeholder="Lead Status" /></SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} placeholder="Follow-up Date" />
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add internal note..." />

            {selected.notes?.length > 0 && (
              <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Notes</p>
                {selected.notes.map((n) => (
                  <div key={n.note_id} className="text-sm mb-2 pb-2 border-b last:border-0">
                    <p>{n.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.created_by_name} • {new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleUpdate}>Update Lead</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
