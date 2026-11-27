import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { extractSelectedRowIds, loadStoredVisibility } from './dataTableRowUtils';

export function useDataTableState({
  storageKey,
  searchValue,
  onSearchChange,
  filterValues,
  rowSelectionModel,
  rows,
}) {
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
  const [filtersAnchor, setFiltersAnchor] = useState(null);
  const activeFilterCount = Object.values(filterValues || {}).filter(Boolean).length;
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() =>
    loadStoredVisibility(storageKey),
  );
  const [localSearch, setLocalSearch] = useState(searchValue || '');
  const debouncedSearch = useDebounce(localSearch, 400);
  const selectedIds = useMemo(
    () => extractSelectedRowIds(rowSelectionModel, rows),
    [rowSelectionModel, rows],
  );

  useEffect(() => {
    setLocalSearch(searchValue || '');
  }, [searchValue]);

  useEffect(() => {
    if (onSearchChange && debouncedSearch !== searchValue) onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange, searchValue]);

  const handleVisibilityChange = (model) => {
    setColumnVisibilityModel(model);
    if (!storageKey) return;
    try {
      localStorage.setItem(`datatable-columns-${storageKey}`, JSON.stringify(model));
    } catch {
      /* ignore */
    }
  };

  const toggleColumn = (field) => {
    const isVisible = columnVisibilityModel[field] !== false;
    handleVisibilityChange({ ...columnVisibilityModel, [field]: !isVisible });
  };

  return {
    columnsMenuAnchor,
    setColumnsMenuAnchor,
    filtersAnchor,
    setFiltersAnchor,
    activeFilterCount,
    columnVisibilityModel,
    handleVisibilityChange,
    toggleColumn,
    localSearch,
    setLocalSearch,
    selectedIds,
  };
}
