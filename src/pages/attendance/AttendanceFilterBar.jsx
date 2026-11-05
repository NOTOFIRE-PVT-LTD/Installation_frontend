import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

export default function AttendanceFilterBar({ filters, setFilter, people }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(140px, auto))' },
        gap: 1,
        width: { xs: '100%', md: 'auto' },
        '& .MuiTextField-root': { minWidth: 0, width: '100%' },
      }}
    >
      <TextField
        select
        size="small"
        label="Salesperson"
        value={filters.salesperson || ''}
        onChange={(e) => setFilter('salesperson', e.target.value)}
      >
        <MenuItem value="">All</MenuItem>
        {people.map((person) => (
          <MenuItem key={person._id} value={person._id}>
            {person.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        type="date"
        label="From"
        value={filters.from || ''}
        onChange={(e) => setFilter('from', e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        size="small"
        type="date"
        label="To"
        value={filters.to || ''}
        onChange={(e) => setFilter('to', e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        select
        size="small"
        label="Status"
        value={filters.status || ''}
        onChange={(e) => setFilter('status', e.target.value)}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="OPEN">Incomplete / open</MenuItem>
        <MenuItem value="CLOSED">Completed</MenuItem>
      </TextField>
    </Box>
  );
}
