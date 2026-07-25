import { useState, useCallback } from 'react';
import type { Page } from '../types';

interface UsePaginationOptions {
  initialPage?: number;
  initialSize?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const [page, setPage] = useState(options.initialPage ?? 0);
  const [size] = useState(options.initialSize ?? 10);
  const [pageData, setPageData] = useState<Page<unknown> | null>(null);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return { page, size, pageData, setPageData, handlePageChange, setPage };
}
