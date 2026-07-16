import { useEffect, useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import ViewColumnIcon from '@mui/icons-material/ViewColumnOutlined';
import FilterListIcon from '@mui/icons-material/FilterListOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StatusBadge from '../StatusBadge';
import { useDebounce } from '../../../hooks/useDebounce';

function SkeletonOverlay() {
  return (
    <Stack sx={{ p: 2 }} spacing={1.5}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={36} />
      ))}
    </Stack>
  );
}

function RowActionsMenu({ row, actions }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const visibleActions = actions.filter((a) => !a.show || a.show(row));

  if (visibleActions.length === 0) return null;

  return (
    <>
      <IconButton
        size="small"
        aria-label="More actions"
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        sx={{
          borderRadius: '8px',
          color: 'text.secondary',
          '&:hover': { bgcolor: 'primary.light', color: 'primary.main' },
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '10px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 12px 28px rgba(31, 42, 68, 0.1)',
              minWidth: 180,
              mt: 0.5,
            },
          },
        }}
      >
        {visibleActions.map((action) => (
          <MenuItem
            key={action.label}
            dense
            onClick={() => {
              setAnchorEl(null);
              action.onClick(row);
            }}
            sx={{
              fontSize: '0.75rem',
              py: 0.85,
              color: action.danger ? 'error.main' : 'text.primary',
            }}
          >
            {action.icon && <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>{action.icon}</ListItemIcon>}
            <ListItemText primary={action.label} primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500 }} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function loadStoredVisibility(storageKey) {
  if (!storageKey) return {};
  try {
    const saved = localStorage.getItem(`datatable-columns-${storageKey}`);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export default function DataTable({
  columns,
  rows,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sortModel,
  onSortChange,
  searchValue,
  onSearchChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  statusField,
  actions = [],
  onExportCsv,
  loading,
  emptyMessage = 'No records found',
  storageKey,
  onRowClick,
}) {
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
  const [filtersAnchor, setFiltersAnchor] = useState(null);
  const activeFilterCount = Object.values(filterValues).filter(Boolean).length;
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => loadStoredVisibility(storageKey));

  const [localSearch, setLocalSearch] = useState(searchValue || '');
  const debouncedSearch = useDebounce(localSearch, 400);

  useEffect(() => {
    setLocalSearch(searchValue || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  useEffect(() => {
    if (onSearchChange && debouncedSearch !== searchValue) {
      onSearchChange(debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleVisibilityChange = (model) => {
    setColumnVisibilityModel(model);
    if (storageKey) {
      try {
        localStorage.setItem(`datatable-columns-${storageKey}`, JSON.stringify(model));
      } catch {
        // ignore storage failures (e.g. private browsing quota)
      }
    }
  };

  const toggleColumn = (field) => {
    const isVisible = columnVisibilityModel[field] !== false;
    handleVisibilityChange({ ...columnVisibilityModel, [field]: !isVisible });
  };

  const finalColumns = useMemo(() => {
    let cols = columns.map((col) => {
      if (col.field === statusField && !col.renderCell) {
        return { ...col, renderCell: (params) => <StatusBadge status={params.value} /> };
      }
      return col;
    });

    if (actions.length > 0) {
      cols = [
        ...cols,
        {
          field: '__actions',
          headerName: '',
          sortable: false,
          filterable: false,
          disableColumnMenu: true,
          width: 52,
          align: 'right',
          headerAlign: 'right',
          renderCell: (params) => <RowActionsMenu row={params.row} actions={actions} />,
        },
      ];
    }

    return cols;
  }, [columns, statusField, actions]);

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between">
        {onSearchChange ? (
          <TextField
            size="small"
            placeholder="Search…"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            sx={{
              width: '100%',
              minWidth: { xs: 0, sm: 220 },
              maxWidth: { xs: '100%', sm: 360 },
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 999,
                bgcolor: 'background.default',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.light' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main', borderWidth: 1 },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        ) : (
          <Box />
        )}
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
          {filters.length > 0 && (
            <>
              <Tooltip title="Filters">
                <IconButton
                  onClick={(e) => setFiltersAnchor(e.currentTarget)}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '8px',
                    bgcolor: '#fff7ed',
                    color: '#d97706',
                    border: '1px solid #fed7aa',
                    '&:hover': { bgcolor: '#ffedd5', color: '#b45309' },
                  }}
                >
                  <Badge
                    badgeContent={activeFilterCount}
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: '#d97706',
                        color: '#fff',
                        fontSize: '0.625rem',
                        minWidth: 16,
                        height: 16,
                      },
                    }}
                  >
                    <FilterListIcon sx={{ fontSize: 18 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Popover
                anchorEl={filtersAnchor}
                open={Boolean(filtersAnchor)}
                onClose={() => setFiltersAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 12px 28px rgba(31, 42, 68, 0.1)',
                      mt: 0.75,
                    },
                  },
                }}
              >
                <Stack spacing={1.5} sx={{ p: 1.75, minWidth: 240 }}>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        bgcolor: '#fff7ed',
                        color: '#d97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FilterListIcon sx={{ fontSize: 14 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Filters</Typography>
                  </Stack>
                  {filters.map((filter) => (
                    <TextField
                      key={filter.field}
                      size="small"
                      select
                      label={filter.label}
                      value={filterValues[filter.field] || ''}
                      onChange={(e) => onFilterChange(filter.field, e.target.value)}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          bgcolor: '#fff',
                          fontSize: '0.75rem',
                        },
                      }}
                    >
                      <MenuItem value="">All</MenuItem>
                      {filter.options.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  ))}
                  {activeFilterCount > 0 && (
                    <Button
                      size="small"
                      onClick={() => filters.forEach((filter) => onFilterChange(filter.field, ''))}
                      sx={{ alignSelf: 'flex-start', color: '#d97706', fontWeight: 600 }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </Stack>
              </Popover>
            </>
          )}
          <Tooltip title="Columns">
            <IconButton
              onClick={(e) => setColumnsMenuAnchor(e.currentTarget)}
              sx={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                bgcolor: '#eaf2ff',
                color: '#2f6fed',
                border: '1px solid #c7d9fb',
                '&:hover': { bgcolor: '#dbe8ff', color: '#1746b7' },
              }}
            >
              <ViewColumnIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={columnsMenuAnchor}
            open={Boolean(columnsMenuAnchor)}
            onClose={() => setColumnsMenuAnchor(null)}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 12px 28px rgba(31, 42, 68, 0.1)',
                  mt: 0.75,
                  minWidth: 180,
                },
              },
            }}
          >
            <Box sx={{ px: 1.5, pt: 1.25, pb: 0.5 }}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '6px',
                    bgcolor: '#eaf2ff',
                    color: '#2f6fed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ViewColumnIcon sx={{ fontSize: 14 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Columns</Typography>
              </Stack>
            </Box>
            {columns
              .filter((col) => col.field !== '__actions')
              .map((col) => (
                <MenuItem
                  key={col.field}
                  onClick={() => toggleColumn(col.field)}
                  dense
                  sx={{
                    py: 0,
                    minHeight: 28,
                    gap: 0,
                    '&:hover': { bgcolor: '#f1f5f9' },
                  }}
                >
                  <Checkbox
                    checked={columnVisibilityModel[col.field] !== false}
                    size="small"
                    sx={{
                      p: 0.35,
                      mr: 0.5,
                      color: '#2f6fed',
                      '&.Mui-checked': { color: '#2f6fed' },
                      '& .MuiSvgIcon-root': { fontSize: 16 },
                    }}
                  />
                  <ListItemText
                    primary={col.headerName || col.field}
                    sx={{ my: 0 }}
                    primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.2 }}
                  />
                </MenuItem>
              ))}
          </Menu>
          {onExportCsv && (
            <Tooltip title="Export CSV">
              <IconButton
                onClick={onExportCsv}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '8px',
                  bgcolor: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  '&:hover': { bgcolor: '#d1fae5', color: '#047857' },
                }}
              >
                <DownloadIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <DataGrid
          autoHeight
          rows={rows}
          columns={finalColumns}
          getRowId={(row) => row._id || row.id}
          loading={loading}
          rowCount={totalCount}
          paginationMode="server"
          sortingMode="server"
          paginationModel={{ page: Math.max(page - 1, 0), pageSize }}
          onPaginationModelChange={(model) => {
            if (model.pageSize !== pageSize) onPageSizeChange(model.pageSize);
            else onPageChange(model.page + 1);
          }}
          pageSizeOptions={[10, 25, 50]}
          sortModel={sortModel ? [sortModel] : []}
          onSortModelChange={(model) => onSortChange(model[0])}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={handleVisibilityChange}
          onRowClick={onRowClick ? (params) => onRowClick(params.row) : undefined}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            ...(onRowClick ? { '& .MuiDataGrid-row': { cursor: 'pointer' } } : {}),
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
              outline: 'none',
              overflow: 'hidden',
            },
            '& .MuiDataGrid-cellContent': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%',
            },
            '& .MuiDataGrid-columnHeader': {
              outline: 'none',
            },
          }}
          slots={{
            noRowsOverlay: () => (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', py: 4 }}>
                <Typography color="text.secondary">{emptyMessage}</Typography>
              </Box>
            ),
            loadingOverlay: SkeletonOverlay,
          }}
        />
      </Box>
    </Box>
  );
}
