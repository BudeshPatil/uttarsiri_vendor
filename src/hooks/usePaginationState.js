import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/components/ui/pagination';

export const emptyPagination = {
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  total: 0,
  totalPages: 1,
  count: 0,
};

export function usePaginationState(initialLimit = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [pagination, setPaginationState] = useState({
    ...emptyPagination,
    limit: initialLimit,
  });

  const applyPagination = useCallback((meta) => {
    if (!meta) {
      setPaginationState((prev) => ({ ...emptyPagination, limit: prev.limit || initialLimit }));
      return;
    }

    setPaginationState({
      page: meta.page || 1,
      limit: meta.limit || initialLimit,
      total: meta.total || 0,
      totalPages: meta.totalPages || 1,
      count: meta.count || 0,
    });
  }, [initialLimit]);

  const changePage = useCallback((nextPage) => {
    setPage(nextPage);
  }, []);

  const changeLimit = useCallback((nextLimit) => {
    setLimit(nextLimit);
    setPage(1);
  }, []);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  const query = useMemo(() => ({ page, limit }), [page, limit]);

  return {
    page,
    limit,
    pagination,
    setPagination: applyPagination,
    changePage,
    changeLimit,
    resetPage,
    query,
  };
}

export default usePaginationState;
