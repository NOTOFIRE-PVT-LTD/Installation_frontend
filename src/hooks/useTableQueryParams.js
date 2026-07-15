import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useTableQueryParams({ defaultPageSize = 10, filterKeys = [] } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || defaultPageSize;
  const search = searchParams.get('search') || '';
  const sortField = searchParams.get('sortField') || '';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const filters = useMemo(() => {
    return filterKeys.reduce((acc, key) => {
      const value = searchParams.get(key);
      if (value) acc[key] = value;
      return acc;
    }, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const patch = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setPage = useCallback((newPage) => patch({ page: newPage }), [patch]);
  const setPageSize = useCallback((newSize) => patch({ pageSize: newSize, page: 1 }), [patch]);
  const setSearch = useCallback((value) => patch({ search: value, page: 1 }), [patch]);
  const setSort = useCallback((field, order) => patch({ sortField: field, sortOrder: order }), [patch]);
  const setFilter = useCallback((key, value) => patch({ [key]: value, page: 1 }), [patch]);
  const setFilters = useCallback((updates) => patch({ ...updates, page: 1 }), [patch]);

  const queryParams = useMemo(
    () => ({
      page,
      pageSize,
      ...(search ? { search } : {}),
      ...(sortField ? { sortField, sortOrder } : {}),
      ...filters,
    }),
    [page, pageSize, search, sortField, sortOrder, filters]
  );

  return { page, pageSize, search, sortField, sortOrder, filters, setPage, setPageSize, setSearch, setSort, setFilter, setFilters, queryParams };
}
