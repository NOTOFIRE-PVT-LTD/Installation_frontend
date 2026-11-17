import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import { buildVisitApprovalsColumns } from './visitApprovalsColumns';
import { useVisitApprovalsPage } from './useVisitApprovalsPage';
import VisitApprovalsDialogs from './VisitApprovalsDialogs';

export default function VisitApprovalsPage({ embedded = false, toolbarStart }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const {
    items,
    approveRow,
    setApproveRow,
    rejectRow,
    setRejectRow,
    rejectionReason,
    setRejectionReason,
    busy,
    review,
  } = useVisitApprovalsPage();

  const columns = useMemo(
    () => buildVisitApprovalsColumns({ navigate, isAdmin, setApproveRow, setRejectRow }),
    [navigate, isAdmin, setApproveRow, setRejectRow]
  );

  return (
    <>
      {!embedded && (
        <PageHeader
          title="Visit Approvals"
          subtitle="Missed visits and out-of-range location requests waiting for review"
        />
      )}
      <DataTable
        columns={columns}
        rows={items}
        totalCount={items.length}
        page={1}
        pageSize={50}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        onSortChange={() => {}}
        toolbarStart={toolbarStart}
        emptyMessage="No visit requests."
      />

      <VisitApprovalsDialogs
        approveRow={approveRow}
        rejectRow={rejectRow}
        rejectionReason={rejectionReason}
        busy={busy}
        onCloseApprove={() => setApproveRow(null)}
        onCloseReject={() => setRejectRow(null)}
        onRejectionReasonChange={setRejectionReason}
        onConfirmApprove={() => review(approveRow._id, 'APPROVED')}
        onConfirmReject={() => review(rejectRow._id, 'REJECTED', rejectionReason.trim())}
      />
    </>
  );
}