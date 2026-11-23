import apiClient from '@/lib/apiClient';

const seoService = {
  getAll() {
    return apiClient.get('/seo');
  },

  update(payload) {
    return apiClient.put('/seo', payload);
  },

  generateSitemap() {
    return apiClient.post('/seo/generate-sitemap');
  },

  generateRobots() {
    return apiClient.post('/seo/generate-robots');
  },
};

export default seoService;
