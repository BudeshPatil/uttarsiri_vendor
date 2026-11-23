import { Languages } from 'lucide-react';
import { LANGUAGES } from '@/i18n/dictionaries';
import { useI18n } from '@/contexts/LanguageContext';

export default function LanguageSelect({ className = '' }) {
  const { lang, setLang, t } = useI18n();

  return (
    <label className={`inline-flex items-center gap-1.5 text-muted-foreground ${className}`}>
      <Languages className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{t('common.language')}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-[#0e782c] focus:ring-2 focus:ring-[#0e782c]/20"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
