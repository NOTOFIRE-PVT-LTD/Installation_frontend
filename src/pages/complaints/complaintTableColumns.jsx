import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { formatDate } from '../../utils/formatters';
import { STATUS_CONFIG, WARRANTY_CONFIG } from './complaintUtils';
import EngineerDropdownCell from './EngineerDropdownCell';

export function buildComplaintColumns({ onSelectTicket, assignees, onSelectEngineer, isFieldEngineer }) {
  return [
    {
      field: 'ticketNo',
      headerName: 'Ticket',
      width: 145,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Typography
          variant="body2"
          fontWeight={800}
          sx={{ cursor: 'pointer', fontFamily: 'monospace', color: '#9E7432', letterSpacing: '0.02em', '&:hover': { textDecoration: 'underline', color: '#583714' } }}
          onClick={(e) => { e.stopPropagation(); onSelectTicket(params.row._id); }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Submitted',
      width: 110,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary" fontWeight={700}>{formatDate(params.value)}</Typography>
      ),
    },
    {
      field: 'resolvedAt',
      headerName: 'Resolved',
      width: 110,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary" fontWeight={600}>{params.value ? formatDate(params.value) : '—'}</Typography>
      ),
    },
    {
      field: 'customerName',
      headerName: 'Customer',
      flex: 1,
      minWidth: 180,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap color="#0f172a">{params.row.customerName}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {params.row.customerOrganization || params.row.companyName || params.row.contactNumber}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'subject',
      headerName: 'Complaint / Equipment',
      flex: 1.3,
      minWidth: 220,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const prod = params.row.productName || params.row.product;
        return (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap color="#0f172a">{params.value}</Typography>
            {prod && (
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {prod} {params.row.productSerialNumber ? `• S/N: ${params.row.productSerialNumber}` : ''}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'warrantyStatus',
      headerName: 'Warranty',
      width: 135,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const w = WARRANTY_CONFIG[params.value] || WARRANTY_CONFIG.UNKNOWN;
        return (
          <Chip size="small" label={w.label} sx={{ bgcolor: w.bg, color: w.color, border: `1px solid ${w.border}`, fontWeight: 700, fontSize: '0.65rem' }} />
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const s = STATUS_CONFIG[params.value] || STATUS_CONFIG.NEW;
        return (
          <Chip size="small" label={s.label} sx={{ bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}`, fontWeight: 700, fontSize: '0.7rem' }} />
        );
      },
    },
    {
      field: 'assignedTo',
      headerName: 'Engineer',
      width: 195,
      filterable: false,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <EngineerDropdownCell row={params.row} assignees={assignees} onSelectEngineer={onSelectEngineer} disabled={isFieldEngineer} />
      ),
    },
  ];
}
