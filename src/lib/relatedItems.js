export function normalizeRelatedIds(value, idKey = 'id') {
  if (value == null || value === '') return [];

  let items = value;
  if (typeof value === 'string') {
    try {
      items = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (item == null || item === '') return null;
      if (typeof item === 'object') return item[idKey] ?? item.id ?? null;
      return item;
    })
    .filter((id) => id != null && id !== '');
}
