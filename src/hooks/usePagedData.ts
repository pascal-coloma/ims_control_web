import { useMemo, useState } from "react";

export const DEFAULT_PAGE_SIZE = 10;

interface PagedData<T> {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  pageItems: T[];
}

/** Slices `items` into pages of `pageSize`, clamping the current page if the data shrinks. */
export function usePagedData<T>(
  items: T[],
  pageSize: number = DEFAULT_PAGE_SIZE,
): PagedData<T> {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const clampedPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (clampedPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, clampedPage, pageSize]);

  return { page: clampedPage, setPage, totalPages, pageItems };
}
