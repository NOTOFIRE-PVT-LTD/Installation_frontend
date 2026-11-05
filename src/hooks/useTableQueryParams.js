import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useTableQueryParams({
  defaultPageSize = 10,
  defaultSortField = '',
  defaultSortOrder = 'desc',
  filterKeys = [],
} = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || defaultPageSize;
  const search = searchParams.get('search') || '';
  const sortField = searchParams.get('sortField') || defaultSortField;
  const sortOrder = searchParams.get('sortOrder') || defaultSortOrder;

  const filters = useMemo(() => {
    if (filterKeys && filterKeys.length > 0) {
      return filterKeys.reduce((acc, key) => {
        const value = searchParams.get(key);
        if (value) acc[key] = value;
        return acc;
      }, {});
    }
    const standard = new Set(['page', 'pageSize', 'search', 'sortField', 'sortOrder']);
    const custom = {};
    for (const [k, v] of searchParams.entries()) {
      if (!standard.has(k) && v) {
        custom[k] = v;
      }
    }
    return custom;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const patch = useCallback(
    (updates) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
              next.delete(key);
            } else {
              next.set(key, value);
            }
          });
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
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

  return {
    page,
    pageSize,
    search,
    sortField,
    sortOrder,
    filters,
    setPage,
    setPageSize,
    setSearch,
    setSort,
    setFilter,
    setFilters,
    queryParams,
  };
}
