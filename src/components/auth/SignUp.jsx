import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, Plus, Trash2, Store } from 'lucide-react';
import vendorService from '@/services/vendor.service';
import { useI18n } from '@/contexts/LanguageContext';
import { LANGUAGES } from '@/i18n/dictionaries';
import { APP_NAME } from '@/config/api';
import BrandLogo from '../BrandLogo';
import LanguageSelect from '../LanguageSelect';
import FormField from '@/components/admin/FormField';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { AlertMessage } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STEPS = ['business', 'address', 'kyc', 'bank'];

const initialForm = {
  business_name: '',
  owner_name: '',
  mobile: '',
  email: '',
  password: '',
  confirm_password: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  gstin: '',
  documents: [''],
  account_holder_name: '',
  account_number: '',
  ifsc_code: '',
  bank_name: '',
  branch: '',
  preferred_language: 'en',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStep(step, form, t) {
  const errors = {};
  if (step === 'business') {
    if (form.business_name.trim().length < 2) errors.business_name = 'Required (min 2 characters)';
    if (form.owner_name.trim().length < 2) errors.owner_name = 'Required (min 2 characters)';
    if (form.mobile.replace(/\D/g, '').length < 10) errors.mobile = 'Enter a valid mobile number (min 10 digits)';
    if (!emailRegex.test(form.email.trim())) errors.email = 'Enter a valid email address';
    if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (form.confirm_password !== form.password) errors.confirm_password = t('register.passwordMismatch');
  }
  if (step === 'address') {
    if (!form.line1.trim()) errors.line1 = 'Required';
    if (!form.city.trim()) errors.city = 'Required';
    if (!form.state.trim()) errors.state = 'Required';
    const pin = form.pincode.trim();
    if (pin.length < 4 || pin.length > 10) errors.pincode = 'Enter a valid pincode';
  }
  if (step === 'kyc') {
    if (form.gstin.trim().length > 20) errors.gstin = 'GSTIN is too long';
  }
  return errors;
}

function buildPayload(form) {
  const payload = {
    business_name: form.business_name.trim(),
    owner_name: form.owner_name.trim(),
    mobile: form.mobile.trim(),
    email: form.email.trim(),
    password: form.password,
    address: {
      line1: form.line1.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
    },
    preferred_language: form.preferred_language,
  };

  if (form.line2.trim()) payload.address.line2 = form.line2.trim();
  if (form.gstin.trim()) payload.gstin = form.gstin.trim().toUpperCase();

  const documents = form.documents.map((d) => d.trim()).filter(Boolean);
  if (documents.length) payload.business_documents = documents;

  const bank = {
    account_holder_name: form.account_holder_name.trim(),
    account_number: form.account_number.trim(),
    ifsc_code: form.ifsc_code.trim().toUpperCase(),
    bank_name: form.bank_name.trim(),
    branch: form.branch.trim(),
  };
  const filledBank = Object.fromEntries(Object.entries(bank).filter(([, v]) => v));
  if (Object.keys(filledBank).length) payload.bank_details = filledBank;

  return payload;
}

function FieldError({ message }) {
  return message ? <p className="text-xs font-medium text-red-600">{message}</p> : null;
}

const SignUp = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const update = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }));
    const keys = Object.keys(patch);
    if (keys.some((k) => errors[k])) {
      setErrors((prev) => {
        const next = { ...prev };
        keys.forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  const updateDocument = (index, value) => {
    update({ documents: form.documents.map((d, i) => (i === index ? value : d)) });
  };

  const goNext = () => {
    const stepErrors = validateStep(step, form, t);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length) return;
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setErrors({});
    setApiError('');
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLast) {
      goNext();
      return;
    }

    // Re-validate every step so earlier steps can't be skipped.
    for (let i = 0; i < STEPS.length; i += 1) {
      const stepErrors = validateStep(STEPS[i], form, t);
      if (Object.keys(stepErrors).length) {
        setErrors(stepErrors);
        setStepIndex(i);
        setApiError(t('register.fixErrors'));
        return;
      }
    }

    try {
      setSubmitting(true);
      setApiError('');
      await vendorService.register(buildPayload(form));
      setSubmittedEmail(form.email.trim());
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const shell = (children) => (
    <div className="auth-shell min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#0e782c]/15 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-[#f5f10a]/20 blur-3xl" />
      </div>
      <div className="absolute right-4 top-4 z-10">
        <LanguageSelect />
      </div>
      {children}
    </div>
  );

  if (submittedEmail) {
    return shell(
      <div className="relative w-full max-w-lg rounded-3xl border border-white/80 bg-white/95 p-8 text-center shadow-xl shadow-slate-900/5">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 ring-1 ring-green-100">
          <CheckCircle2 className="h-9 w-9 text-[#0e782c]" />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900">{t('register.successTitle')}</h1>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
          <Clock className="h-3.5 w-3.5" />
          {t('vendorStatus.pending')}
        </div>
        <p className="mt-4 text-sm text-slate-600">{t('register.successMessage')}</p>
        <p className="mt-2 text-xs text-slate-500">{submittedEmail}</p>
        <Button
          className="mt-6 bg-[#0e782c] hover:bg-[#095c21]"
          onClick={() =>
            navigate('/signin', {
              state: { email: submittedEmail, message: t('register.successMessage') },
            })
          }
        >
          {t('register.goToSignIn')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>,
    );
  }

  return shell(
    <div className="relative w-full max-w-2xl">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-200/80">
          <BrandLogo alt={`${APP_NAME} Logo`} className="h-full w-full" />
        </div>
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#0e782c] ring-1 ring-green-100">
          <Store className="h-3.5 w-3.5" />
          {t('nav.vendorPortal')}
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">{t('register.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('register.subtitle')}</p>
      </div>

      <div className="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-xl shadow-slate-900/5 sm:p-8">
        {/* Stepper */}
        <ol className="mb-6 flex items-center justify-between gap-2">
          {STEPS.map((id, index) => {
            const done = index < stepIndex;
            const active = index === stepIndex;
            return (
              <li key={id} className="flex flex-1 items-center gap-2 last:flex-none">
                <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      done
                        ? 'bg-[#0e782c] text-white'
                        : active
                          ? 'bg-[#0e782c]/10 text-[#0e782c] ring-2 ring-[#0e782c]'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  <span
                    className={`hidden text-xs font-medium sm:inline ${active ? 'text-slate-900' : 'text-slate-500'}`}
                  >
                    {t(`register.step.${id}`)}
                  </span>
                </div>
                {index < STEPS.length - 1 && <div className="h-px flex-1 bg-slate-200" />}
              </li>
            );
          })}
        </ol>
        <p className="mb-4 text-sm font-semibold text-slate-800 sm:hidden">{t(`register.step.${step}`)}</p>

        <AlertMessage message={apiError} />

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {step === 'business' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label={t('register.businessName')}>
                <Input value={form.business_name} onChange={(e) => update({ business_name: e.target.value })} />
                <FieldError message={errors.business_name} />
              </FormField>
              <FormField label={t('register.ownerName')}>
                <Input value={form.owner_name} onChange={(e) => update({ owner_name: e.target.value })} />
                <FieldError message={errors.owner_name} />
              </FormField>
              <FormField label={t('register.mobile')}>
                <Input
                  type="tel"
                  inputMode="tel"
                  value={form.mobile}
                  onChange={(e) => update({ mobile: e.target.value })}
                />
                <FieldError message={errors.mobile} />
              </FormField>
              <FormField label={t('register.email')}>
                <Input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update({ email: e.target.value })}
                />
                <FieldError message={errors.email} />
              </FormField>
              <FormField label={t('register.password')} hint={t('register.passwordHint')}>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => update({ password: e.target.value })}
                />
                <FieldError message={errors.password} />
              </FormField>
              <FormField label={t('register.confirmPassword')}>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm_password}
                  onChange={(e) => update({ confirm_password: e.target.value })}
                />
                <FieldError message={errors.confirm_password} />
              </FormField>
            </div>
          )}

          {step === 'address' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField label={t('register.addressLine1')}>
                  <Input value={form.line1} onChange={(e) => update({ line1: e.target.value })} />
                  <FieldError message={errors.line1} />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label={`${t('register.addressLine2')} (${t('common.optional')})`}>
                  <Input value={form.line2} onChange={(e) => update({ line2: e.target.value })} />
                </FormField>
              </div>
              <FormField label={t('register.city')}>
                <Input value={form.city} onChange={(e) => update({ city: e.target.value })} />
                <FieldError message={errors.city} />
              </FormField>
              <FormField label={t('register.state')}>
                <Input value={form.state} onChange={(e) => update({ state: e.target.value })} />
                <FieldError message={errors.state} />
              </FormField>
              <FormField label={t('register.pincode')}>
                <Input
                  inputMode="numeric"
                  value={form.pincode}
                  onChange={(e) => update({ pincode: e.target.value })}
                />
                <FieldError message={errors.pincode} />
              </FormField>
            </div>
          )}

          {step === 'kyc' && (
            <div className="space-y-5">
              <FormField label={`${t('register.gstin')} (${t('common.optional')})`} hint={t('register.gstinHint')}>
                <Input
                  className="uppercase"
                  maxLength={20}
                  value={form.gstin}
                  onChange={(e) => update({ gstin: e.target.value })}
                />
                <FieldError message={errors.gstin} />
              </FormField>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">{t('register.documents')}</p>
                  <p className="text-xs text-gray-500">{t('register.documentsHint')}</p>
                </div>
                {form.documents.map((doc, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-1">
                      <ImageUploadField
                        label={`${t('profile.documentLink')} ${index + 1}`}
                        value={doc}
                        onChange={(value) => updateDocument(index, value)}
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => update({ documents: [...form.documents, ''] })}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  {t('register.addDocument')}
                </Button>
              </div>
            </div>
          )}

          {step === 'bank' && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-800">{t('register.bankDetails')}</p>
                <p className="text-xs text-gray-500">{t('register.bankHint')}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label={t('register.accountHolder')}>
                  <Input
                    value={form.account_holder_name}
                    onChange={(e) => update({ account_holder_name: e.target.value })}
                  />
                </FormField>
                <FormField label={t('register.accountNumber')}>
                  <Input
                    inputMode="numeric"
                    value={form.account_number}
                    onChange={(e) => update({ account_number: e.target.value })}
                  />
                </FormField>
                <FormField label={t('register.ifsc')}>
                  <Input
                    className="uppercase"
                    value={form.ifsc_code}
                    onChange={(e) => update({ ifsc_code: e.target.value })}
                  />
                </FormField>
                <FormField label={t('register.bankName')}>
                  <Input value={form.bank_name} onChange={(e) => update({ bank_name: e.target.value })} />
                </FormField>
                <FormField label={t('register.branch')}>
                  <Input value={form.branch} onChange={(e) => update({ branch: e.target.value })} />
                </FormField>
                <FormField label={t('register.preferredLanguage')}>
                  <Select
                    value={form.preferred_language}
                    onValueChange={(value) => update({ preferred_language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l.code} value={l.code}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button type="button" variant="outline" onClick={goBack} disabled={stepIndex === 0 || submitting}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back')}
            </Button>
            {isLast ? (
              <Button type="submit" disabled={submitting} className="bg-[#0e782c] hover:bg-[#095c21]">
                {submitting ? t('register.submitting') : t('register.submit')}
              </Button>
            ) : (
              <Button type="button" onClick={goNext} className="bg-[#0e782c] hover:bg-[#095c21]">
                {t('common.next')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {t('register.haveAccount')}{' '}
          <Link to="/signin" className="font-semibold text-[#0e782c] hover:underline">
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    </div>,
  );
};

export default SignUp;
