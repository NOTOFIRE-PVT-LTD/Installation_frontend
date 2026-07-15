import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAddressBook,
  faCompassDrafting,
  faFolderOpen,
  faLocationDot,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { searchApi } from '../../api/searchApi';
import { useDebounce } from '../../hooks/useDebounce';

const SECTION_META = {
  projects: { label: 'Projects', icon: faFolderOpen, color: '#14b8a6' },
  stations: { label: 'Stations', icon: faLocationDot, color: '#0ea5e9' },
  users: { label: 'Users', icon: faUsers, color: '#8b5cf6' },
  numbers: { label: 'Numbers', icon: faAddressBook, color: '#06b6d4' },
  tenders: { label: 'CAD / Tenders', icon: faCompassDrafting, color: '#ec4899' },
};

const SECTION_ORDER = ['projects', 'stations', 'users', 'numbers', 'tenders'];

const ROUND_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 999,
    bgcolor: 'background.default',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.light' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main', borderWidth: 1 },
  },
};

export default function GlobalSearchBar() {
  const navigate = useNavigate();
  const anchorRef = useRef(null);
  const requestIdRef = useRef(0);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const debouncedQuery = useDebounce(query.trim(), 400);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults(null);
      setLoading(false);
      setError('');
      return undefined;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError('');
    setOpen(true);

    searchApi
      .search({ q: debouncedQuery, limit: 5 })
      .then((res) => {
        if (requestId !== requestIdRef.current) return;
        setResults(res.data?.data || null);
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setResults(null);
        setError('Search failed. Try again.');
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoading(false);
      });

    return undefined;
  }, [debouncedQuery]);

  const flatSections = useMemo(() => {
    if (!results) return [];
    return SECTION_ORDER.map((key) => ({
      key,
      ...SECTION_META[key],
      items: results[key] || [],
    })).filter((section) => section.items.length > 0);
  }, [results]);

  const hasResults = flatSections.length > 0;
  const showPanel = open && (query.trim().length >= 2 || loading || error || results);

  const handleSelect = (item) => {
    setOpen(false);
    setQuery('');
    setResults(null);
    navigate(item.path);
  };

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setError('');
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ flex: 1, maxWidth: 520, mx: { xs: 1, sm: 2 }, position: 'relative' }} ref={anchorRef}>
        <TextField
          fullWidth
          size="small"
          value={query}
          placeholder="Search projects, users, stations..."
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          sx={ROUND_SX}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {loading ? (
                  <CircularProgress size={16} />
                ) : query ? (
                  <IconButton size="small" onClick={handleClear} edge="end" aria-label="Clear search">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : null}
              </InputAdornment>
            ),
          }}
        />

        <Popper
          open={Boolean(showPanel)}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ width: anchorRef.current?.offsetWidth || undefined, zIndex: 1400 }}
        >
          <Paper
            elevation={0}
            sx={{
              mt: 1,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 18px 40px rgba(31, 42, 68, 0.12)',
              maxHeight: 420,
              overflow: 'auto',
            }}
          >
            {debouncedQuery.length < 2 && query.trim().length > 0 && (
              <Typography sx={{ px: 2, py: 1.5 }} color="text.secondary" variant="body2">
                Type at least 2 characters to search
              </Typography>
            )}

            {error && (
              <Typography sx={{ px: 2, py: 1.5 }} color="error" variant="body2">
                {error}
              </Typography>
            )}

            {!loading && !error && debouncedQuery.length >= 2 && !hasResults && (
              <Typography sx={{ px: 2, py: 1.5 }} color="text.secondary" variant="body2">
                No results for “{debouncedQuery}”
              </Typography>
            )}

            {hasResults && (
              <List dense disablePadding>
                {flatSections.map((section) => (
                  <Box key={section.key} component="li" sx={{ listStyle: 'none' }}>
                    <ListSubheader
                      sx={{
                        bgcolor: 'background.paper',
                        lineHeight: '36px',
                        fontWeight: 700,
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <FontAwesomeIcon icon={section.icon} style={{ color: section.color, width: 14 }} />
                      {section.label}
                    </ListSubheader>
                    {section.items.map((item) => (
                      <ListItemButton
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleSelect(item)}
                        sx={{ borderRadius: 0, py: 1, px: 2 }}
                      >
                        <ListItemText
                          primary={item.title}
                          secondary={item.subtitle}
                          primaryTypographyProps={{ fontWeight: 600, noWrap: true }}
                          secondaryTypographyProps={{ noWrap: true }}
                        />
                      </ListItemButton>
                    ))}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
