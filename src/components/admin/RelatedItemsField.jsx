import { useMemo, useState } from 'react';
import FormField from '@/components/admin/FormField';
import { Input } from '@/components/ui/input';

export default function RelatedItemsField({
  label,
  hint,
  options = [],
  selectedIds = [],
  onChange,
  loading = false,
  maxItems,
  emptyMessage = 'No items available.',
}) {
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => {
      const labelText = String(option.label || '').toLowerCase();
      const sublabelText = String(option.sublabel || '').toLowerCase();
      return labelText.includes(query) || sublabelText.includes(query);
    });
  }, [options, search]);

  const atLimit = maxItems != null && selectedIds.length >= maxItems;

  const toggleItem = (id) => {
    const normalizedId = String(id);
    const isSelected = selectedIds.some((itemId) => String(itemId) === normalizedId);

    if (isSelected) {
      onChange(selectedIds.filter((itemId) => String(itemId) !== normalizedId));
      return;
    }

    if (atLimit) return;
    onChange([...selectedIds, id]);
  };

  const limitHint = maxItems != null
    ? `Select up to ${maxItems} item${maxItems === 1 ? '' : 's'}.`
    : null;

  return (
    <FormField
      label={label}
      hint={[hint, limitHint].filter(Boolean).join(' ')}
    >
      <div className="space-y-3">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading || options.length === 0}
        />

        <div className="rounded-xl border border-gray-200 bg-gray-50 max-h-48 overflow-y-auto">
          {loading ? (
            <p className="px-3 py-4 text-sm text-gray-500">Loading options...</p>
          ) : filteredOptions.length === 0 ? (
            <p className="px-3 py-4 text-sm text-gray-500">{emptyMessage}</p>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selectedIds.some((itemId) => String(itemId) === String(option.id));
              const isDisabled = !isSelected && atLimit;

              return (
                <label
                  key={option.id}
                  className={`flex items-start gap-2 px-3 py-2.5 text-sm border-b border-gray-100 last:border-b-0 ${
                    isDisabled
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer hover:bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => toggleItem(option.id)}
                    className="mt-0.5 rounded border-gray-300"
                  />
                  <span className="min-w-0">
                    <span className="block font-medium text-gray-800">{option.label}</span>
                    {option.sublabel ? (
                      <span className="block text-xs text-gray-500 truncate">{option.sublabel}</span>
                    ) : null}
                  </span>
                </label>
              );
            })
          )}
        </div>

        <p className="text-xs text-gray-500">
          {selectedIds.length} selected
          {maxItems != null ? ` / ${maxItems} max` : ''}
        </p>
      </div>
    </FormField>
  );
}
