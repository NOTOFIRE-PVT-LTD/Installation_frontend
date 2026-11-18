import { formatPlanTime } from '../../utils/readLocation';
import { formatIstDateTime } from '../../utils/attendanceFormat';
import {
  VisitApprovalDecideCell,
  VisitApprovalKindCell,
  VisitApprovalReasonCell,
  VisitApprovalStatusCell,
  VisitApprovalViewCell,
} from './visitApprovalsColumnCells';

function baseVisitApprovalColumns() {
  return [
    {
      field: 'salesperson',
      headerName: 'Person',
      minWidth: 150,
      valueGetter: (_v, row) => row.visit?.salesperson?.name || '—',
    },
    {
      field: 'customer',
      headerName: 'Customer',
      minWidth: 160,
      valueGetter: (_v, row) => row.visit?.customer?.companyName || '—',
    },
    {
      field: 'kind',
      headerName: 'Type',
      minWidth: 130,
      renderCell: (params) => <VisitApprovalKindCell value={params.value} />,
    },
    {
      field: 'requestedAt',
      headerName: 'Requested on',
      minWidth: 160,
      valueGetter: (_v, row) => formatIstDateTime(row.requestedAt || row.createdAt),
    },
    {
      field: 'visitDate',
      headerName: 'Visit date',
      minWidth: 110,
      valueGetter: (_v, row) => row.visit?.visitDate || '—',
    },
    {
      field: 'plannedTime',
      headerName: 'Time',
      minWidth: 90,
      valueGetter: (_v, row) => formatPlanTime(row.visit?.plannedTime),
    },
    {
      field: 'purpose',
      headerName: 'Purpose',
      minWidth: 140,
      valueGetter: (_v, row) => row.visit?.purpose || '—',
    },
    {
      field: 'reason',
      headerName: 'Reason / Details',
      minWidth: 230,
      flex: 1,
      renderCell: (params) => <VisitApprovalReasonCell row={params.row} />,
    },
    {
      field: 'decision',
      headerName: 'Status',
      minWidth: 120,
      renderCell: (params) => <VisitApprovalStatusCell value={params.value} />,
    },
    {
      field: 'reviewedBy',
      headerName: 'Reviewed by',
      minWidth: 140,
      valueGetter: (_v, row) => row.reviewedBy?.name || '—',
    },
    { field: 'rejectionReason', headerName: 'Admin comment', minWidth: 160 },
  ];
}

function viewAndDecideColumns(navigate, isAdmin, setApproveRow, setRejectRow) {
  const viewCol = {
    field: 'view',
    headerName: 'Photo & Details',
    minWidth: 130,
    sortable: false,
    renderCell: (params) => (
      <VisitApprovalViewCell visit={params.row.visit} onNavigate={navigate} />
    ),
  };
  if (!isAdmin) return [viewCol];
  const decideCol = {
    field: 'decide',
    headerName: 'Decision',
    minWidth: 200,
    sortable: false,
    renderCell: (params) => (
      <VisitApprovalDecideCell
        row={params.row}
        onApprove={setApproveRow}
        onReject={setRejectRow}
      />
    ),
  };
  return [viewCol, decideCol];
}

export function buildVisitApprovalsColumns({ navigate, isAdmin, setApproveRow, setRejectRow }) {
  return [...baseVisitApprovalColumns(), ...viewAndDecideColumns(navigate, isAdmin, setApproveRow, setRejectRow)];
}