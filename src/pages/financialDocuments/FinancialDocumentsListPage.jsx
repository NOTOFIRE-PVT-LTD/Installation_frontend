import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { buildCsvColumns } from '../../components/common/DataTable/DataTable.helpers';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FinancialDocumentDrawer from './FinancialDocumentDrawer';
import ContractAgreementsListPage from '../contractAgreements/ContractAgreementsListPage';
import CallLettersListPage from '../callLetters/CallLettersListPage';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';
import {
  fetchFinancialDocuments,
  createFinancialDocument,
  updateFinancialDocument,
  deleteFinancialDocument,
} from '../../features/financialDocuments/financialDocumentsThunks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { exportToCsv } from '../../utils/csvExport';
import { formatCurrency, formatDate } from '../../utils/formatters';

const BG_COLUMNS = [
  {
    field: 'tenderName',
    headerName: 'Tender Name',
    flex: 1.2,
    minWidth: 160,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'bgNumber',
    headerName: 'BG Number',
    flex: 1,
    minWidth: 140,
  },
  {
    field: 'partyName',
    headerName: 'Party Name',
    width: 130,
  },
  {
    field: 'bgAmount',
    headerName: 'BG Amount',
    width: 140,
    valueFormatter: (value) => formatCurrency(value),
  },
  {
    field: 'loaNumber',
    headerName: 'LOA Number',
    flex: 1,
    minWidth: 140,
    valueGetter: (value) => value || '-',
  },
  {
    field: 'loaDate',
    headerName: 'LOA Date',
    width: 130,
    valueFormatter: (value) => formatDate(value),
  },
  {
    field: 'bgDeadline21',
    headerName: 'BG Deadline (21D)',
    width: 150,
    valueFormatter: (value) => formatDate(value),
  },
  {
    field: 'bgDeadline60',
    headerName: 'BG Deadline (60D)',
    width: 150,
    valueFormatter: (value) => formatDate(value),
  },
  {
    field: 'bgDispatch',
    headerName: 'BG Dispatch',
    width: 130,
    valueFormatter: (value) => formatDate(value),
  },
  {
    field: 'bgSubmission',
    headerName: 'BG Submission',
    width: 140,
    valueFormatter: (value) => formatDate(value),
  },
  {
    field: 'bgVerify',
    headerName: 'BG Verify',
    width: 130,
    valueFormatter: (value) => formatDate(value),
  },
];

function BgDocumentsPanel() {
  const dispatch = useAppDispatch();
  const { items, total, status } = useAppSelector((state) => state.financialDocuments);
  const { page, pageSize, search, sortField, sortOrder, setPage, setPageSize, setSearch, setSort, queryParams } =
    useTableQueryParams();

  const [drawerState, setDrawerState] = useState({ open: false, mode: 'create', document: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchFinancialDocuments(queryParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  const refresh = () => dispatch(fetchFinancialDocuments(queryParams));
  const closeDrawer = () => setDrawerState({ open: false, mode: 'create', document: null });

  const handleDrawerSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (drawerState.mode === 'create') {
        await dispatch(createFinancialDocument(payload)).unwrap();
        dispatch(showSnackbar({ message: 'BG document created successfully' }));
      } else {
        await dispatch(updateFinancialDocument({ id: drawerState.document._id, payload })).unwrap();
        dispatch(showSnackbar({ message: 'BG document updated successfully' }));
      }
      closeDrawer();
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to save BG document', severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteFinancialDocument(confirmDelete._id)).unwrap();
      dispatch(showSnackbar({ message: 'BG document deleted' }));
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      dispatch(showSnackbar({ message: err || 'Failed to delete BG document', severity: 'error' }));
    }
  };

  const actions = [
    {
      label: 'View',
      icon: <VisibilityIcon fontSize="small" />,
      onClick: (row) => setDrawerState({ open: true, mode: 'view', document: row }),
    },
    {
      label: 'Edit',
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => setDrawerState({ open: true, mode: 'edit', document: row }),
    },
    {
      label: 'Delete',
      icon: <DeleteIcon fontSize="small" color="error" />,
      onClick: setConfirmDelete,
    },
  ];

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setDrawerState({ open: true, mode: 'create', document: null })}
        >
          Add BG Document
        </Button>
      </Box>

      <DataTable
        columns={BG_COLUMNS}
        rows={items}
        totalCount={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        sortModel={sortField ? { field: sortField, sort: sortOrder } : null}
        onSortChange={(model) => model && setSort(model.field, model.sort)}
        searchValue={search}
        onSearchChange={setSearch}
        actions={actions}
        onExportCsv={() => exportToCsv('financial-documents', items, buildCsvColumns(BG_COLUMNS))}
        loading={status === 'loading'}
        emptyMessage="No BG documents found"
        storageKey="financial-documents-bg"
      />

      <FinancialDocumentDrawer
        open={drawerState.open}
        mode={drawerState.mode}
        document={drawerState.document}
        submitting={submitting}
        onClose={closeDrawer}
        onSubmit={handleDrawerSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete BG Document"
        message={`Delete BG "${confirmDelete?.bgNumber || 'this record'}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}

export default function FinancialDocumentsListPage() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <PageHeader
        title="Financial Document"
        subtitle="All steps in one place: BG Document → Contract Agreement → Call Letter"
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_e, next) => setTab(next)} variant="scrollable" allowScrollButtonsMobile>
          <Tab label="1. BG Document" />
          <Tab label="2. Contract Agreement" />
          <Tab label="3. Call Letter" />
        </Tabs>
      </Box>

      {tab === 0 && <BgDocumentsPanel />}
      {tab === 1 && <ContractAgreementsListPage embedded />}
      {tab === 2 && <CallLettersListPage embedded />}
    </>
  );
}
