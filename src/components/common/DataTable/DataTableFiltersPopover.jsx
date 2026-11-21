import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FilterListIcon from '@mui/icons-material/FilterListOutlined';

export default function DataTableFiltersPopover({
  filters,
  filterValues,
  onFilterChange,
  activeFilterCount,
  filtersAnchor,
  setFiltersAnchor,
}) {
  if (!filters?.length) return null;

  return (
    <Popover
      anchorEl={filtersAnchor}
      open={Boolean(filtersAnchor)}
      onClose={() => setFiltersAnchor(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: (theme) => `${theme.shape?.borderRadius ?? 10}px`,
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
              borderRadius: (theme) => `${Math.max(4, (theme.shape?.borderRadius ?? 10) - 2)}px`,
              bgcolor: 'primary.light',
              color: 'primary.main',
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
          <FilterField
            key={filter.field}
            filter={filter}
            filterValues={filterValues}
            onFilterChange={onFilterChange}
          />
        ))}
        {activeFilterCount > 0 ? (
          <Button
            size="small"
            onClick={() => filters.forEach((f) => onFilterChange(f.field, ''))}
            sx={{ alignSelf: 'flex-start', color: 'primary.main', fontWeight: 600 }}
          >
            Clear Filters
          </Button>
        ) : null}
      </Stack>
    </Popover>
  );
}

function FilterField({ filter, filterValues, onFilterChange }) {
  const selectedApps = filter.multiple
    ? String(filterValues[filter.field] || '').split(',').filter(Boolean)
    : null;

  return (
    <TextField
      size="small"
      select
      label={filter.label}
      value={filter.multiple ? selectedApps : filterValues[filter.field] || ''}
      onChange={(e) => {
        if (!filter.multiple) {
          onFilterChange(filter.field, e.target.value);
          return;
        }
        const next = e.target.value;
        onFilterChange(filter.field, (Array.isArray(next) ? next : [next]).filter(Boolean).join(','));
      }}
      fullWidth
      SelectProps={
        filter.multiple
          ? {
              multiple: true,
              renderValue: (selected) =>
                selected
                  .map((val) => filter.options.find((opt) => opt.value === val)?.label || val)
                  .join(', '),
            }
          : undefined
      }
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: (theme) => `${theme.shape?.borderRadius ?? 10}px`,
          bgcolor: 'background.paper',
          fontSize: '0.75rem',
        },
      }}
    >
      {!filter.multiple && <MenuItem value="">All</MenuItem>}
      {filter.options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {filter.multiple ? (
            <Checkbox size="small" checked={selectedApps.includes(opt.value)} sx={{ p: 0.5, mr: 0.5 }} />
          ) : null}
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
