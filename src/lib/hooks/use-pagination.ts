import { useCallback, useState } from "react";

/**
 * Local page/limit state for a server-paginated table.
 * Pass `page`/`limit` as queryParams and call `reset()` whenever
 * an unrelated filter (e.g. version) changes, so the user doesn't
 * land on a now-out-of-range page.
 */
export function usePagination(initialLimit = 10) {
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(initialLimit);

  const setPage = useCallback((next: number | string | ((prev: number) => number)) => {
    setPageState((prev) => {
      const val = typeof next === "function" ? next(prev) : next;
      return Number(val) || 1;
    });
  }, []);

  const setLimit = useCallback((next: number | string) => {
    setLimitState(Number(next) || initialLimit);
    setPageState(1);
  }, [initialLimit]);

  const reset = useCallback(() => setPageState(1), []);

  return { page, limit, setPage, setLimit, reset };
}
