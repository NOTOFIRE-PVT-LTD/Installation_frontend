import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DataTable from '../../components/common/DataTable/DataTable';
import { DETAIL_COLUMNS, MONTHS } from './rosterColumns';

export default function AdminAttendanceDetailView({
  selected,
  onBack,
  month,
  setMonth,
  year,
  setYear,
  years,
  detailRows,
  detailLoading,
}) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ textTransform: 'none', fontWeight: 700, color: '#583714' }}
        >
          Back to today
        </Button>
        <Typography sx={{ fontWeight: 800, color: '#241404', fontSize: '1.05rem' }}>
          {selected.name}
        </Typography>
        <TextField
          select
          size="small"
          label="Month"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          sx={{ minWidth: 140 }}
        >
          {MONTHS.map((m) => (
            <MenuItem key={m.value} value={m.value}>
              {m.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Year"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ minWidth: 100 }}
        >
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <DataTable
        columns={DETAIL_COLUMNS}
        rows={detailRows}
        totalCount={detailRows.length}
        page={0}
        pageSize={Math.max(detailRows.length, 10)}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        loading={detailLoading}
      />
    </Box>
  );
}
