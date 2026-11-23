import { useEffect, useState } from 'react';
import { ImagePlus, Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import settingsService from '@/services/settings.service';
import uploadService from '@/services/upload.service';
import { getMediaUrl } from '@/config/api';
import { useBranding } from '@/contexts/BrandingContext';
import PageHeader, { AlertMessage } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SETTING_FIELDS = [
  { key: 'SENDER_EMAIL', label: 'Sender Email', type: 'text' },
  { key: 'RECEIVER_EMAIL', label: 'Receiver Email', type: 'text' },
  { key: 'CONTACT_DETAILS', label: 'Contact Details (JSON)', type: 'json' },
  { key: 'SOCIAL_MEDIA_LINKS', label: 'Social Media Links (JSON)', type: 'json' },
  { key: 'SMTP_CONFIG', label: 'SMTP Config (JSON)', type: 'json' },
];

export default function SettingsPage() {
  const { refreshBranding } = useBranding();
  const [settings, setSettings] = useState({});
  const [formValues, setFormValues] = useState({});
  const [siteLogo, setSiteLogo] = useState('');
  const [siteFavicon, setSiteFavicon] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [stats, setStats] = useState([]);
  const [savingStats, setSavingStats] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await settingsService.getAll();
      const data = response.data || {};
      setSettings(data);
      setSiteLogo(data.SITE_LOGO || '');
      setSiteFavicon(data.SITE_FAVICON || '');
      setStats(Array.isArray(data.SITE_STATS) ? data.SITE_STATS.map((s) => ({ value: s?.value || '', label: s?.label || '' })) : []);
      setFormValues(
        Object.fromEntries(
          SETTING_FIELDS.map(({ key }) => [
            key,
            typeof data[key] === 'object' ? JSON.stringify(data[key], null, 2) : (data[key] || ''),
          ]),
        ),
      );
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const extractUploadUrl = (response) => {
    const data = response?.data;
    return data?.url || data?.upload?.url || data?.path || '';
  };

  const handleLogoUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingFavicon;
    const setValue = type === 'logo' ? setSiteLogo : setSiteFavicon;

    try {
      setUploading(true);
      setError('');
      const response = await uploadService.upload(file);
      const url = extractUploadUrl(response);
      if (!url) {
        throw new Error('Upload succeeded but no file URL was returned');
      }
      setValue(url);
      setSuccess(`${type === 'logo' ? 'Logo' : 'Favicon'} uploaded. Click Save Branding to apply.`);
    } catch (err) {
      setError(err.message || `Failed to upload ${type}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveBranding = async () => {
    try {
      setSubmitting(true);
      setError('');
      await settingsService.update({
        SITE_LOGO: siteLogo,
        SITE_FAVICON: siteFavicon,
      });
      await refreshBranding();
      setSuccess('Branding updated successfully. Logo will appear on Sign In, Sign Up, and sidebar.');
      fetchSettings();
    } catch (err) {
      setError(err.message || 'Failed to save branding');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStat = (index, patch) => {
    setStats((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addStat = () => setStats((prev) => [...prev, { value: '', label: '' }]);

  const removeStat = (index) => setStats((prev) => prev.filter((_, i) => i !== index));

  // Display order is the array order, so moving a row is just a swap.
  const moveStat = (index, direction) => {
    const target = index + direction;
    setStats((prev) => {
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSaveStats = async () => {
    try {
      setSavingStats(true);
      setError('');
      const cleaned = stats
        .map((item) => ({ value: item.value.trim(), label: item.label.trim() }))
        .filter((item) => item.value || item.label);
      await settingsService.update({ SITE_STATS: cleaned });
      setSuccess('Site stats updated. The website picks them up within a minute.');
      fetchSettings();
    } catch (err) {
      setError(err.message || 'Failed to save site stats');
    } finally {
      setSavingStats(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const payload = {};

      SETTING_FIELDS.forEach(({ key, type }) => {
        const value = formValues[key];
        if (type === 'json') {
          payload[key] = value ? JSON.parse(value) : {};
        } else {
          payload[key] = value;
        }
      });

      await settingsService.update(payload);
      setSuccess('Settings updated successfully');
      fetchSettings();
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader title="Settings" description="Configure branding, application, and email settings" onRefresh={fetchSettings} isRefreshing={loading} />

      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Site Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-500">
            Upload a logo to use on Sign In, Sign Up, loading screen, and the sidebar. Optionally upload a separate favicon/icon.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Main Logo</label>
              <div className="flex items-center justify-center h-40 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                {siteLogo ? (
                  <img src={getMediaUrl(siteLogo)} alt="Site logo preview" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-sm text-gray-400">No logo uploaded</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  id="site-logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoUpload(e, 'logo')}
                  disabled={uploadingLogo}
                />
                <Button type="button" variant="outline" asChild disabled={uploadingLogo}>
                  <label htmlFor="site-logo-upload" className="cursor-pointer">
                    <ImagePlus className="w-4 h-4 mr-2" />
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  </label>
                </Button>
                {siteLogo && (
                  <Button type="button" variant="ghost" onClick={() => setSiteLogo('')}>
                    <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                    Remove
                  </Button>
                )}
              </div>
              <Input
                value={siteLogo}
                onChange={(e) => setSiteLogo(e.target.value)}
                placeholder="/public/uploads/logo.png or https://..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Favicon / Icon</label>
              <div className="flex items-center justify-center h-40 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                {siteFavicon || siteLogo ? (
                  <img
                    src={getMediaUrl(siteFavicon || siteLogo)}
                    alt="Favicon preview"
                    className="max-h-24 max-w-24 object-contain"
                  />
                ) : (
                  <span className="text-sm text-gray-400">Uses main logo if empty</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  id="site-favicon-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoUpload(e, 'favicon')}
                  disabled={uploadingFavicon}
                />
                <Button type="button" variant="outline" asChild disabled={uploadingFavicon}>
                  <label htmlFor="site-favicon-upload" className="cursor-pointer">
                    <ImagePlus className="w-4 h-4 mr-2" />
                    {uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}
                  </label>
                </Button>
                {siteFavicon && (
                  <Button type="button" variant="ghost" onClick={() => setSiteFavicon('')}>
                    <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                    Remove
                  </Button>
                )}
              </div>
              <Input
                value={siteFavicon}
                onChange={(e) => setSiteFavicon(e.target.value)}
                placeholder="Optional — leave blank to use main logo"
              />
            </div>
          </div>

          <Button type="button" onClick={handleSaveBranding} disabled={submitting || loading}>
            {submitting ? 'Saving...' : 'Save Branding'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader><CardTitle>Site Stats</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            The counter cards on the home and about pages. The design fits four across —
            adding more still works, but they wrap onto another row.
          </p>

          {stats.length === 0 ? (
            <p className="text-sm text-gray-400">No stats yet. Add one below.</p>
          ) : (
            <div className="space-y-3">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3 sm:flex-row sm:items-end">
                  <div className="sm:w-32">
                    <label className="text-xs font-medium text-gray-600">Value</label>
                    <Input
                      placeholder="500+"
                      value={stat.value}
                      onChange={(e) => updateStat(index, { value: e.target.value })}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-600">Label</label>
                    <Input
                      placeholder="Projects Completed"
                      value={stat.label}
                      onChange={(e) => updateStat(index, { label: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => moveStat(index, -1)} title="Move up">
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" disabled={index === stats.length - 1} onClick={() => moveStat(index, 1)} title="Move down">
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeStat(index)} title="Remove">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={addStat}>
              <Plus className="w-4 h-4 mr-2" />Add Stat
            </Button>
            <Button type="button" onClick={handleSaveStats} disabled={savingStats || loading}>
              {savingStats ? 'Saving...' : 'Save Stats'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSave}>
            {SETTING_FIELDS.map(({ key, label, type }) => (
              <div key={key}>
                <label className="text-sm font-medium text-gray-700">{label}</label>
                {type === 'json' ? (
                  <Textarea
                    rows={4}
                    value={formValues[key] || ''}
                    onChange={(e) => setFormValues({ ...formValues, [key]: e.target.value })}
                    className="font-mono text-sm"
                  />
                ) : (
                  <Input
                    value={formValues[key] || ''}
                    onChange={(e) => setFormValues({ ...formValues, [key]: e.target.value })}
                  />
                )}
              </div>
            ))}
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Settings'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
