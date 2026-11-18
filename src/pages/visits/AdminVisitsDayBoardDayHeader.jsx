import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { formatDateLabel } from './adminVisitsDayBoardHelpers';

export default function AdminVisitsDayBoardDayHeader({ date, items, names, today, open, onToggle }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      onClick={onToggle}
      sx={{
        px: 1.5,
        py: 1.25,
        cursor: 'pointer',
        background:
          date === today
            ? 'linear-gradient(90deg, #FFF9E6 0%, #F5E2B3 100%)'
            : 'linear-gradient(90deg, #FFFDF8 0%, #FDF7EB 100%)',
      }}
    >
      <IconButton size="small" sx={{ color: '#583714' }}>
        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </IconButton>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800, color: '#241404', fontSize: '0.9375rem' }}>
          {formatDateLabel(date)}
          {date === today ? (
            <Chip label="Today" size="small" sx={{ ml: 1, height: 20, fontWeight: 800, bgcolor: '#E5B85C', color: '#241404' }} />
          ) : null}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#6E4D27', fontWeight: 600 }}>
          {items.length} visit{items.length === 1 ? '' : 's'} · {names.length} salesperson
          {names.length === 1 ? '' : 's'}
        </Typography>
      </Box>
      <NameChips names={names} />
    </Stack>
  );
}

function NameChips({ names }) {
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ maxWidth: '45%', justifyContent: 'flex-end' }}>
      {names.slice(0, 4).map((n) => (
        <Chip key={n} label={n} size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(212, 163, 78, 0.2)', color: '#3A230B' }} />
      ))}
      {names.length > 4 ? (
        <Chip label={`+${names.length - 4}`} size="small" sx={{ fontWeight: 700, bgcolor: '#F2E7D5', color: '#583714' }} />
      ) : null}
    </Stack>
  );
}