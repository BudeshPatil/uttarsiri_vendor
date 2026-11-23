import { useEffect, useState } from 'react';
import seoService from '@/services/seo.service';
import PageHeader, { AlertMessage } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SeoPage() {
  const [seoData, setSeoData] = useState({
    seo: { title: '', description: '', keywords: [], ogImage: '' },
    sitemap: { urls: [], changefreq: 'weekly', priority: 0.8, baseUrl: '' },
    robots: { allow: ['*'], disallow: [] },
    google_tag_manager: {},
    google_analytics: {},
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSeo = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await seoService.getAll();
      setSeoData((prev) => ({ ...prev, ...(response.data || {}) }));
    } catch (err) {
      setError(err.message || 'Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeo();
  }, []);

  const handleSave = async () => {
    try {
      setSubmitting(true);
      setError('');
      await seoService.update(seoData);
      setSuccess('SEO settings updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update SEO settings');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerate = async (type) => {
    try {
      setError('');
      const response = type === 'sitemap'
        ? await seoService.generateSitemap()
        : await seoService.generateRobots();
      setSuccess(response.message || `${type} generated successfully`);
    } catch (err) {
      setError(err.message || `Failed to generate ${type}`);
    }
  };

  const updateSection = (section, field, value) => {
    setSeoData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="SEO"
        description="Manage SEO, sitemap, and robots configuration"
        onRefresh={fetchSeo}
        isRefreshing={loading}
        actions={<Button onClick={handleSave} disabled={submitting}>{submitting ? 'Saving...' : 'Save All'}</Button>}
      />

      <AlertMessage message={error} />
      <AlertMessage type="success" message={success} />

      <Tabs defaultValue="meta" className="space-y-4">
        <TabsList>
          <TabsTrigger value="meta">Meta SEO</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
          <TabsTrigger value="robots">Robots</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="meta">
          <Card className="border-0 shadow-lg">
            <CardHeader><CardTitle>Meta Tags</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-sm font-medium">Title</label><Input value={seoData.seo?.title || ''} onChange={(e) => updateSection('seo', 'title', e.target.value)} /></div>
              <div><label className="text-sm font-medium">Description</label><Textarea value={seoData.seo?.description || ''} onChange={(e) => updateSection('seo', 'description', e.target.value)} /></div>
              <div><label className="text-sm font-medium">Keywords (comma separated)</label><Input value={(seoData.seo?.keywords || []).join(', ')} onChange={(e) => updateSection('seo', 'keywords', e.target.value.split(',').map((k) => k.trim()).filter(Boolean))} /></div>
              <div><label className="text-sm font-medium">OG Image URL</label><Input value={seoData.seo?.ogImage || ''} onChange={(e) => updateSection('seo', 'ogImage', e.target.value)} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemap">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Sitemap</CardTitle><Button variant="outline" onClick={() => handleGenerate('sitemap')}>Generate Sitemap</Button></CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-sm font-medium">Base URL</label><Input value={seoData.sitemap?.baseUrl || ''} onChange={(e) => updateSection('sitemap', 'baseUrl', e.target.value)} /></div>
              <div><label className="text-sm font-medium">URLs (one per line)</label><Textarea rows={6} value={(seoData.sitemap?.urls || []).join('\n')} onChange={(e) => updateSection('sitemap', 'urls', e.target.value.split('\n').map((u) => u.trim()).filter(Boolean))} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="robots">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Robots.txt</CardTitle><Button variant="outline" onClick={() => handleGenerate('robots')}>Generate Robots.txt</Button></CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-sm font-medium">Allow (one per line)</label><Textarea rows={4} value={(seoData.robots?.allow || []).join('\n')} onChange={(e) => updateSection('robots', 'allow', e.target.value.split('\n').map((u) => u.trim()).filter(Boolean))} /></div>
              <div><label className="text-sm font-medium">Disallow (one per line)</label><Textarea rows={4} value={(seoData.robots?.disallow || []).join('\n')} onChange={(e) => updateSection('robots', 'disallow', e.target.value.split('\n').map((u) => u.trim()).filter(Boolean))} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="border-0 shadow-lg">
            <CardHeader><CardTitle>Analytics & Tag Manager</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-sm font-medium">Google Tag Manager (JSON)</label><Textarea rows={4} className="font-mono text-sm" value={JSON.stringify(seoData.google_tag_manager || {}, null, 2)} onChange={(e) => { try { setSeoData((prev) => ({ ...prev, google_tag_manager: JSON.parse(e.target.value) })); } catch { /* ignore invalid json while typing */ } }} /></div>
              <div><label className="text-sm font-medium">Google Analytics (JSON)</label><Textarea rows={4} className="font-mono text-sm" value={JSON.stringify(seoData.google_analytics || {}, null, 2)} onChange={(e) => { try { setSeoData((prev) => ({ ...prev, google_analytics: JSON.parse(e.target.value) })); } catch { /* ignore */ } }} /></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
