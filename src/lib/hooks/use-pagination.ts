import { useCallback, useState } from "react";

/**
 * Local page/limit state for a server-paginated table.
 * Pass `page`/`limit` as queryParams and call `reset()` whenever
 * an unrelated filter (e.g. version) changes, so the user doesn't
 * land on a now-out-of-range page.
 */
export function usePagination(initialLimit = 10) {
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState(initialLimit);

  const setLimit = useCallback((next: number) => {
    setLimitState(next);
    setPage(1);
  }, []);

  const reset = useCallback(() => setPage(1), []);

  return { page, limit, setPage, setLimit, reset };
}
