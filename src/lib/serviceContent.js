const KEY_SERVICES_HEADER = 'Key Services:';

export function slugifyTitle(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function textToKeyServices(text) {
  return text
    .split('\n')
    .map((line) => line.replace(/^[\s*\-•]+/, '').trim())
    .filter(Boolean);
}

function parseOverview(fullOverview = '') {
  const markerIndex = fullOverview.indexOf(KEY_SERVICES_HEADER);

  if (markerIndex === -1) {
    return { overview: fullOverview.trim(), key_services: [] };
  }

  const overview = fullOverview.slice(0, markerIndex).trim();
  const keyServicesBlock = fullOverview.slice(markerIndex + KEY_SERVICES_HEADER.length).trim();
  const services = keyServicesBlock
    .split('\n')
    .map((line) => line.replace(/^[\s*\-•]+/, '').trim())
    .filter(Boolean);

  return { overview, key_services: services };
}

export function formFromService(item) {
  const parsed = parseOverview(item.overview || '');
  const features = Array.isArray(item.features) && item.features.length
    ? item.features
    : parsed.key_services;

  return {
    title: item.title || '',
    slug: item.slug || '',
    short_description: item.short_description || '',
    overview: parsed.overview,
    features,
    category: item.category || '',
    banner_image: item.banner_image || '',
    homepage_image: item.homepage_image || item.icon || '',
    gallery: Array.isArray(item.gallery) ? item.gallery : [],
    status: item.status || 'draft',
    is_featured: item.is_featured || false,
    sort_order: item.sort_order ?? 0,
    meta_title: item.meta_title || '',
    meta_description: item.meta_description || '',
  };
}

export function payloadFromForm(formData) {
  return {
    title: formData.title,
    slug: formData.slug,
    short_description: formData.short_description,
    overview: formData.overview.trim(),
    category: formData.category,
    banner_image: formData.banner_image,
    icon: formData.homepage_image || '',
    gallery: Array.isArray(formData.gallery) ? formData.gallery.filter(Boolean) : [],
    features: Array.isArray(formData.features) ? formData.features.filter(Boolean) : [],
    status: formData.status,
    is_featured: Boolean(formData.is_featured),
    sort_order: Number(formData.sort_order) || 0,
    meta_title: formData.meta_title,
    meta_description: formData.meta_description,
  };
}
