import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import vendorService from '@/services/vendor.service';
import authService from '@/services/auth.service';
import { useVendor } from '@/contexts/VendorContext';
import { useI18n } from '@/contexts/LanguageContext';
import { LANGUAGES } from '@/i18n/dictionaries';
import PageHeader, { AlertMessage } from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import FormField from '@/components/admin/FormField';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate, formatRate } from '@/lib/vendorFormat';

const toForm = (vendor) => ({
  business_name: vendor?.business_name || '',
  owner_name: vendor?.owner_name || '',
  mobile: vendor?.mobile || '',
  line1: vendor?.address?.line1 || '',
  line2: vendor?.address?.line2 || '',
  city: vendor?.address?.city || '',
  state: vendor?.address?.state || '',
  pincode: vendor?.address?.pincode || '',
  gstin: vendor?.gstin || '',
  documents: vendor?.business_documents?.length ? [...vendor.business_documents] : [''],
  account_holder_name: vendor?.bank_details?.account_holder_name || '',
  account_number: vendor?.bank_details?.account_number || '',
  ifsc_code: vendor?.bank_details?.ifsc_code || '',
  bank_name: vendor?.bank_details?.bank_name || '',
  branch: vendor?.bank_details?.branch || '',
  preferred_language: vendor?.preferred_language || 'en',
});

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg">
      <h2 className="mb-4 text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

export default function VendorProfile() {
  const { vendor, setVendor, refreshVendor } = useVendor();
  const { t, setLang } = useI18n();
  const [form, setForm] = useState(() => toForm(vendor));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [password, setPassword] = useState({ current: '', next: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setForm(toForm(vendor));
  }, [vendor]);

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(''), 5000);
    return () => clearTimeout(timer);
  }, [success]);

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.line1.trim() || !form.city.trim() || !form.state.trim() || form.pincode.trim().length < 4) {
      setError('Address line 1, city, state and a valid pincode are required.');
      return;
    }

    const address = {
      line1: form.line1.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
    };
    if (form.line2.trim()) address.line2 = form.line2.trim();

    const payload = {
      business_name: form.business_name.trim(),
      owner_name: form.owner_name.trim(),
      mobile: form.mobile.trim(),
      address,
      gstin: form.gstin.trim().toUpperCase(),
      business_documents: form.documents.map((d) => d.trim()).filter(Boolean),
      bank_details: {
        account_holder_name: form.account_holder_name.trim(),
        account_number: form.account_number.trim(),
        ifsc_code: form.ifsc_code.trim().toUpperCase(),
        bank_name: form.bank_name.trim(),
        branch: form.branch.trim(),
      },
      preferred_language: form.preferred_language,
    };

    try {
      setSaving(true);
      const response = await vendorService.updateMe(payload);
      const updated = response.data?.vendor;
      if (updated) setVendor(updated);
      else await refreshVendor();
      if (payload.preferred_language !== vendor?.preferred_language) setLang(payload.preferred_language);
      setSuccess(t('profile.saved'));
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });
    if (password.next.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    try {
      setChangingPassword(true);
      await authService.changePassword(password.current, password.next);
      setPassword({ current: '', next: '' });
      setPasswordMessage({ type: 'success', text: t('profile.passwordChanged') });
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message || 'Unable to change password.' });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={t('profile.title')}
        description={t('profile.subtitle')}
        actions={vendor?.status ? <StatusBadge status={vendor.status} label={t(`vendorStatus.${vendor.status}`)} /> : null}
      />
      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title={t('profile.business')}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label={t('register.businessName')}>
              <Input required minLength={2} value={form.business_name} onChange={(e) => update({ business_name: e.target.value })} />
            </FormField>
            <FormField label={t('register.ownerName')}>
              <Input required minLength={2} value={form.owner_name} onChange={(e) => update({ owner_name: e.target.value })} />
            </FormField>
            <FormField label={t('register.mobile')}>
              <Input required minLength={10} value={form.mobile} onChange={(e) => update({ mobile: e.target.value })} />
            </FormField>
            <FormField label={t('register.email')} hint={t('profile.emailReadOnly')}>
              <Input value={vendor?.email || ''} disabled readOnly />
            </FormField>
            <FormField label={t('profile.commission')}>
              <Input value={formatRate(vendor?.commission_rate ?? 0.1)} disabled readOnly />
            </FormField>
            {vendor?.approved_at && (
              <FormField label={t('vendorStatus.approved')}>
                <Input value={formatDate(vendor.approved_at)} disabled readOnly />
              </FormField>
            )}
          </div>
        </Section>

        <Section title={t('profile.address')}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormField label={t('register.addressLine1')}>
                <Input required value={form.line1} onChange={(e) => update({ line1: e.target.value })} />
              </FormField>
            </div>
            <div className="sm:col-span-2">
              <FormField label={t('register.addressLine2')}>
                <Input value={form.line2} onChange={(e) => update({ line2: e.target.value })} />
              </FormField>
            </div>
            <FormField label={t('register.city')}>
              <Input required value={form.city} onChange={(e) => update({ city: e.target.value })} />
            </FormField>
            <FormField label={t('register.state')}>
              <Input required value={form.state} onChange={(e) => update({ state: e.target.value })} />
            </FormField>
            <FormField label={t('register.pincode')}>
              <Input required value={form.pincode} onChange={(e) => update({ pincode: e.target.value })} />
            </FormField>
          </div>
        </Section>

        <Section title={t('profile.kyc')}>
          <div className="space-y-4">
            <FormField label={t('register.gstin')} hint={t('register.gstinHint')}>
              <Input className="uppercase" maxLength={20} value={form.gstin} onChange={(e) => update({ gstin: e.target.value })} />
            </FormField>
            <p className="text-xs text-gray-500">{t('register.documentsHint')}</p>
            {form.documents.map((doc, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  <ImageUploadField
                    label={`${t('profile.documentLink')} ${index + 1}`}
                    value={doc}
                    onChange={(value) => update({ documents: form.documents.map((d, i) => (i === index ? value : d)) })}
                    placeholder="https://..."
                    showPreview={false}
                  />
                </div>
                {form.documents.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="mb-0.5 shrink-0"
                    onClick={() => update({ documents: form.documents.filter((_, i) => i !== index) })}
                    aria-label={t('common.remove')}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => update({ documents: [...form.documents, ''] })}>
              <Plus className="mr-1.5 h-4 w-4" />
              {t('register.addDocument')}
            </Button>
          </div>
        </Section>

        <Section title={t('profile.bank')}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label={t('register.accountHolder')}>
              <Input value={form.account_holder_name} onChange={(e) => update({ account_holder_name: e.target.value })} />
            </FormField>
            <FormField label={t('register.accountNumber')}>
              <Input inputMode="numeric" value={form.account_number} onChange={(e) => update({ account_number: e.target.value })} />
            </FormField>
            <FormField label={t('register.ifsc')}>
              <Input className="uppercase" value={form.ifsc_code} onChange={(e) => update({ ifsc_code: e.target.value })} />
            </FormField>
            <FormField label={t('register.bankName')}>
              <Input value={form.bank_name} onChange={(e) => update({ bank_name: e.target.value })} />
            </FormField>
            <FormField label={t('register.branch')}>
              <Input value={form.branch} onChange={(e) => update({ branch: e.target.value })} />
            </FormField>
          </div>
        </Section>

        <Section title={t('profile.preferences')}>
          <div className="max-w-xs">
            <FormField label={t('register.preferredLanguage')}>
              <Select value={form.preferred_language} onValueChange={(value) => update({ preferred_language: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="z-[60]">
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </Section>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="bg-[#0e782c] hover:bg-[#095c21]">
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </form>

      <form onSubmit={handlePasswordChange} className="mt-6">
        <Section title={t('profile.password')}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label={t('profile.currentPassword')}>
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={password.current}
                onChange={(e) => setPassword((prev) => ({ ...prev, current: e.target.value }))}
              />
            </FormField>
            <FormField label={t('profile.newPassword')} hint={t('register.passwordHint')}>
              <Input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password.next}
                onChange={(e) => setPassword((prev) => ({ ...prev, next: e.target.value }))}
              />
            </FormField>
          </div>
          {passwordMessage.text && (
            <p className={`mt-3 text-sm ${passwordMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {passwordMessage.text}
            </p>
          )}
          <div className="mt-4 flex justify-end">
            <Button type="submit" variant="outline" disabled={changingPassword}>
              {changingPassword ? t('common.saving') : t('profile.password')}
            </Button>
          </div>
        </Section>
      </form>
    </div>
  );
}
