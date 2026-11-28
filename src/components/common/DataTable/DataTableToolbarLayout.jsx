import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import ViewColumnIcon from '@mui/icons-material/ViewColumnOutlined';
import FilterListIcon from '@mui/icons-material/FilterListOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AnimatedActionButton from '../AnimatedActionButton';

const iconBtnSx = {
  width: 46,
  height: 46,
  borderRadius: '14px',
  color: '#8B5A1A',
  flex: '0 0 auto',
  border: '1.5px solid transparent !important',
  backgroundImage:
    'linear-gradient(145deg, #FFFDF8 0%, #F8F0E2 40%, #EFE0C4 100%), linear-gradient(135deg, #FFE9A8 0%, #E5B85C 35%, #D4A34E 65%, #8C591D 100%) !important',
  backgroundOrigin: 'border-box !important',
  backgroundClip: 'padding-box, border-box !important',
  boxShadow:
    '5px 6px 12px rgba(120,85,40,0.16), inset 0 1px 1px rgba(255,252,245,0.65) !important',
};

function SearchInput({ localSearch, setLocalSearch }) {
  return (
    <TextField
      size="small"
      placeholder="Search…"
      value={localSearch}
      onChange={(e) => setLocalSearch(e.target.value)}
      sx={{
        flex: '1 1 auto',
        minWidth: 0,
        '& .MuiOutlinedInput-root': {
          borderRadius: 999,
          minHeight: 38,
          background: 'linear-gradient(145deg, #efe0b8 0%, #e5b85c 55%, #d4a34e 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'inset 0 1px 0 rgba(255,233,168,0.4), 0 3px 10px rgba(58,40,24,0.1)',
          '& .MuiOutlinedInput-notchedOutline': {
            border: '1px solid rgba(189,131,45,0.45)',
          },
        },
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon
              sx={{
                color: '#9A6B28',
                fontSize: 16,
                filter:
                  'drop-shadow(0 1px 0 rgba(255,255,255,0.7)) drop-shadow(0 2px 3px rgba(88,55,20,0.35))',
              }}
            />
          </InputAdornment>
        ),
      }}
    />
  );
}

function IconActions({
  filters,
  activeFilterCount,
  setFiltersAnchor,
  setColumnsMenuAnchor,
  checkboxSelection,
  selectedCount,
  onBulkDelete,
  bulkDeleteLabel,
  selectedIds,
  onExportCsv,
}) {
  const showBulk = checkboxSelection && selectedCount > 0 && onBulkDelete;
  const filterList = filters || [];
  return (
    <>
      {showBulk ? (
        <Button
          size="small"
          color="error"
          variant="outlined"
          startIcon={<DeleteOutlineIcon />}
          onClick={() => onBulkDelete(selectedIds)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {bulkDeleteLabel} ({selectedCount})
        </Button>
      ) : null}
      {filterList.length > 0 ? (
        <Tooltip title="Filters">
          <IconButton onClick={(e) => setFiltersAnchor(e.currentTarget)} sx={iconBtnSx}>
            <Badge
              badgeContent={activeFilterCount}
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: 'primary.main',
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
      ) : null}
      <Tooltip title="Columns">
        <IconButton onClick={(e) => setColumnsMenuAnchor(e.currentTarget)} sx={iconBtnSx}>
          <ViewColumnIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      {onExportCsv ? <AnimatedActionButton kind="download" label="Download" onClick={onExportCsv} /> : null}
    </>
  );
}

function EndActions({ toolbarEnd, iconProps }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flex: '0 0 auto', ml: 'auto' }}>
      {toolbarEnd}
      <IconActions {...iconProps} />
    </Stack>
  );
}

/**
 * Customers/Approvals: one row (search|+|columns or pills|columns).
 * People (start+end): Staff Role | Search, then Add buttons | columns on xs.
 */
export default function DataTableToolbarLayout({
  toolbarStart,
  onSearchChange,
  localSearch,
  setLocalSearch,
  actionProps,
}) {
  const { toolbarEnd, ...iconProps } = actionProps;
  const hasSearch = Boolean(onSearchChange);
  const splitPeopleMobile = Boolean(toolbarStart && toolbarEnd);

  // Same 8px rhythm as Add Salesperson / Add Admin buttons.
  const rowGap = 1;

  return (
    <Stack spacing={rowGap} sx={{ minWidth: 0, width: '100%' }}>
      <Stack direction="row" spacing={rowGap} alignItems="center" sx={{ minWidth: 0, width: '100%', columnGap: 1 }}>
        {toolbarStart ? (
          <Box
            sx={{
              flex: splitPeopleMobile ? '0 1 auto' : '1 1 auto',
              minWidth: 0,
              width: splitPeopleMobile ? { xs: '38%', sm: 190 } : 'auto',
              mr: 0,
            }}
          >
            {toolbarStart}
          </Box>
        ) : null}
        {hasSearch ? (
          <SearchInput localSearch={localSearch} setLocalSearch={setLocalSearch} />
        ) : !toolbarStart ? (
          <Box sx={{ flex: 1, minWidth: 0 }} />
        ) : null}
        {!splitPeopleMobile ? <EndActions toolbarEnd={toolbarEnd} iconProps={iconProps} /> : null}
        {splitPeopleMobile ? (
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{ display: { xs: 'none', md: 'flex' }, flex: '0 0 auto', ml: 'auto' }}
          >
            {toolbarEnd}
            <IconActions {...iconProps} />
          </Stack>
        ) : null}
      </Stack>
      {splitPeopleMobile ? (
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          sx={{ display: { xs: 'flex', md: 'none' }, width: '100%', minWidth: 0 }}
        >
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'nowrap', gap: 0.75 }}>
            {toolbarEnd}
          </Box>
          <IconActions {...iconProps} />
        </Stack>
      ) : null}
    </Stack>
  );
}
