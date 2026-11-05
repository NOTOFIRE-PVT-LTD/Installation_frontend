import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

export function getContractorColumns() {
  return [
    {
      field: 'contractorName',
      headerName: 'Contractor / Agency',
      flex: 1.2,
      minWidth: 170,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#241404' }}>
          {params.row.contractorName}
        </Typography>
      ),
    },
    {
      field: 'workerName',
      headerName: 'Worker Name',
      flex: 1.1,
      minWidth: 160,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.row.workerName}</Typography>
          {params.row.workerId ? (
            <Typography variant="caption" sx={{ color: '#8A5D18', fontSize: '0.6875rem' }}>
              ID: {params.row.workerId}
            </Typography>
          ) : null}
        </Box>
      ),
    },
    { field: 'category', headerName: 'Trade / Skill', minWidth: 130 },
    { field: 'siteLocation', headerName: 'Site / Location', minWidth: 140, valueGetter: (_v, r) => r.siteLocation || '—' },
    { field: 'monthYear', headerName: 'Period', minWidth: 110, valueGetter: (_v, r) => r.monthYear || '—' },
    {
      field: 'presentDays',
      headerName: 'Present Days',
      minWidth: 110,
      renderCell: (p) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1B4D3E' }}>
          {p.row.presentDays ?? 0} {p.row.overtimeHours ? `(+${p.row.overtimeHours}h OT)` : ''}
        </Typography>
      ),
    },
    {
      field: 'dailyRate',
      headerName: 'Daily Rate (INR)',
      minWidth: 120,
      valueGetter: (_v, r) => (r.dailyRate ? `INR ${Number(r.dailyRate).toLocaleString('en-IN')}` : '—'),
    },
    {
      field: 'wages',
      headerName: 'Total Wages (INR)',
      minWidth: 150,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 800, color: '#8A5D18', fontSize: '0.9375rem' }}>
          INR {Number(params.row.wages || 0).toLocaleString('en-IN')}
        </Typography>
      ),
    },
    {
      field: 'paymentStatus',
      headerName: 'Status',
      minWidth: 100,
      renderCell: (params) => (
        <Chip size="small" label={params.row.paymentStatus || 'Pending'} color="primary" variant="outlined" />
      ),
    },
    { field: 'remarks', headerName: 'Remarks', minWidth: 140, valueGetter: (_v, r) => r.remarks || '—' },
  ];
}

