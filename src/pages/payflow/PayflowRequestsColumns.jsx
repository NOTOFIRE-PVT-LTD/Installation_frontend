import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import RestoreFromTrashOutlinedIcon from '@mui/icons-material/RestoreFromTrashOutlined';
import { StatusPill } from './PayflowRequestDetail';
import { computeBalanceAmount, formatInr } from './payflowRequestConfig';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '—');

function TrashRowActions({ row, busy, onRestore, onPurge }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Button
        size="small"
        variant="outlined"
        startIcon={<RestoreFromTrashOutlinedIcon fontSize="small" />}
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation();
          onRestore(row);
        }}
        sx={{ textTransform: 'none', fontWeight: 600 }}
      >
        Restore
      </Button>
      <Tooltip title="Delete Permanently">
        <span>
          <IconButton
            size="small"
            color="error"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation();
              onPurge(row);
            }}
          >
            <DeleteForeverOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}

function MoveToTrashButton({ row, busy, onTrash }) {
  return (
    <Tooltip title="Move to Trash">
      <span>
        <IconButton
          size="small"
          color="error"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            onTrash(row);
          }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
}

export function buildPayflowRequestColumns({ isAdmin, isTrashView, actionBusyId, onRestore, onTrash, onPurge }) {
  const base = [
    { field: 'srNo', headerName: 'SR No.', width: 90 },
    { field: 'requestDate', headerName: 'Date', width: 110, valueFormatter: (v) => fmtDate(v) },
    { field: 'company', headerName: 'Company, Branch', minWidth: 170, flex: 1, valueGetter: (_, row) => `${row.company}, ${row.branch}` },
    { field: 'vendor', headerName: 'Vendor', minWidth: 190, flex: 1.2 },
    { field: 'category', headerName: 'Category', minWidth: 190, flex: 1, valueGetter: (_, row) => [row.category, row.itemType].filter(Boolean).join(' • ') },
    { field: 'totalOutstanding', headerName: 'Total Outstanding', width: 145, valueFormatter: (v) => formatInr(v) },
    { field: 'amount', headerName: 'Amount', width: 120, valueFormatter: (v) => formatInr(v) },
    {
      field: 'balanceAmount',
      headerName: 'Balance',
      width: 125,
      valueGetter: (_, row) => (row.balanceAmount != null ? row.balanceAmount : computeBalanceAmount(row.totalOutstanding, row.amount)),
      valueFormatter: (v) => formatInr(v),
    },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (p) => <StatusPill status={p.value} /> },
    { field: 'requestedBy', headerName: 'Requested By', minWidth: 150, flex: 0.8, sortable: false, valueGetter: (_, row) => row.requestedBy?.name || '—' },
  ];

  if (!isAdmin) return base;

  base.push({
    field: 'actions',
    headerName: 'Actions',
    width: isTrashView ? 170 : 90,
    sortable: false,
    renderCell: ({ row }) => {
      const busy = actionBusyId === row._id;
      return isTrashView ? (
        <TrashRowActions row={row} busy={busy} onRestore={onRestore} onPurge={onPurge} />
      ) : (
        <MoveToTrashButton row={row} busy={busy} onTrash={onTrash} />
      );
    },
  });
  return base;
}
