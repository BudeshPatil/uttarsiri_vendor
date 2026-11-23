import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function getVisiblePages(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  return [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)
    .reduce((acc, page, index, arr) => {
      if (index > 0 && page - arr[index - 1] > 1) {
        acc.push('ellipsis');
      }
      acc.push(page);
      return acc;
    }, []);
}

export default function Pagination({
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 10,
  onPageChange,
  onLimitChange,
  className,
  disabled = false,
}) {
  if (total <= 0 && totalPages <= 1) {
    return null;
  }

  const safePage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  const from = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const to = Math.min(safePage * limit, total);
  const pages = getVisiblePages(safePage, Math.max(totalPages, 1));

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-100 bg-white',
        className,
      )}
    >
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>
          Showing <span className="font-medium text-gray-700">{from}</span>
          {'–'}
          <span className="font-medium text-gray-700">{to}</span>
          {' of '}
          <span className="font-medium text-gray-700">{total}</span>
        </span>
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Rows</span>
            <Select
              value={String(limit)}
              onValueChange={(value) => onLimitChange(Number(value))}
              disabled={disabled}
            >
              <SelectTrigger className="h-8 w-[76px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || safePage <= 1}
          onClick={() => onPageChange?.(safePage - 1)}
          className="h-8 px-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Prev</span>
        </Button>

        {pages.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              variant={item === safePage ? 'default' : 'outline'}
              size="sm"
              disabled={disabled}
              onClick={() => onPageChange?.(item)}
              className="h-8 w-8 p-0"
            >
              {item}
            </Button>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || safePage >= totalPages}
          onClick={() => onPageChange?.(safePage + 1)}
          className="h-8 px-2"
        >
          <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export const DEFAULT_PAGE_SIZE = 10;
export { PAGE_SIZE_OPTIONS };
