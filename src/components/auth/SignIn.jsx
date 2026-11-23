import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, ArrowRight, Store } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/LanguageContext';
import BrandLogo from '../BrandLogo';
import LanguageSelect from '../LanguageSelect';
import { APP_NAME } from '@/config/api';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const { t } = useI18n();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.email) {
      setFormData((prev) => ({ ...prev, email: location.state.email }));
    }
  }, [location.state, navigate, location.pathname]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(formData.email);
    const passwordError = formData.password ? null : 'Password is required';

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await signIn(formData.email.trim(), formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors({ general: result.error || 'Sign in failed. Please try again.' });
      }
    } catch {
      setErrors({ general: 'Sign in failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="auth-shell min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#0e782c]/15 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-[#f5f10a]/20 blur-3xl animate-pulse-slower" />
      </div>

      <div className="absolute right-4 top-4 z-10">
        <LanguageSelect />
      </div>

      <div className="auth-card relative w-full max-w-[440px]">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg shadow-green-900/5 ring-1 ring-slate-200/80 p-2">
            <BrandLogo alt={`${APP_NAME} Logo`} className="h-full w-full" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#0e782c] ring-1 ring-green-100 mb-3">
            <Store className="h-3.5 w-3.5" />
            {t('nav.vendorPortal')}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">{t('auth.welcomeBack')}</h1>
          <p className="mt-2 text-sm text-slate-500">{t('auth.signInSubtitle')}</p>
        </div>

        <div className="rounded-3xl border border-white/80 bg-white/90 p-6 sm:p-8 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
          {successMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="username"
                  className={`w-full rounded-xl border bg-slate-50/80 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#0e782c] focus:bg-white focus:ring-4 focus:ring-[#0e782c]/10 ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  placeholder="you@business.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  className={`w-full rounded-xl border bg-slate-50/80 py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#0e782c] focus:bg-white focus:ring-4 focus:ring-[#0e782c]/10 ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.password}
                </p>
              )}
            </div>

            {errors.general && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e782c] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-900/15 transition-all hover:bg-[#095c21] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? t('auth.signingIn') : t('auth.signIn')}
              {!isLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">{t('auth.approvalNote')}</p>

          <p className="mt-4 text-center text-sm text-slate-500">
            {t('auth.noAccount')}{' '}
            <Link to="/signup" className="font-semibold text-[#0e782c] hover:text-[#095c21] hover:underline">
              {t('auth.registerAsVendor')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
