import { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faBuildingUser,
  faCalendarCheck,
  faIndianRupeeSign,
  faFileExcel,
} from '@fortawesome/free-solid-svg-icons';

import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { contractorAttendanceApi } from '../../api/contractorAttendanceApi';
import { showSnackbar } from '../../features/ui/uiSlice';
import { useAppDispatch } from '../../app/hooks';
import { useTableQueryParams } from '../../hooks/useTableQueryParams';

function ContractorStatCard({ label, value, sub, icon }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.75,
        borderRadius: '16px',
        border: '1px solid #E2D3BE',
        background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <Box sx={{ minWidth: 0, pr: 1 }}>
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: '#6E4D27',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: 1.25,
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.375rem' }, fontWeight: 800, color: '#241404', mt: 0.25, lineHeight: 1.1 }}>
          {value}
        </Typography>
        {sub ? (
          <Typography sx={{ fontSize: '0.6875rem', color: '#8A5D18', mt: 0.5, fontWeight: 600, lineHeight: 1.25 }}>
            {sub}
          </Typography>
        ) : null}
      </Box>
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          width: 38,
          height: 38,
          borderRadius: '12px',
          bgcolor: 'rgba(229, 184, 92, 0.22)',
          border: '1px solid rgba(212, 163, 78, 0.4)',
          color: '#38200A',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <FontAwesomeIcon icon={icon} style={{ fontSize: 16 }} />
      </Box>
    </Paper>
  );
}

export default function ContractorAttendancePage() {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef(null);

  const {
    page,
    pageSize,
    search,
    sortField,
    sortOrder,
    filters,
    setPage,
    setPageSize,
    setSearch,
    setSort,
    setFilter,
    queryParams,
  } = useTableQueryParams({ filterKeys: ['contractor', 'monthYear'] });

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalWorkers: 0, totalContractors: 0, totalDays: 0, totalWages: 0 });
  const [filterOptions, setFilterOptions] = useState({ contractors: [], months: [] });

  // Upload modal state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMonthYear, setUploadMonthYear] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Delete modal state
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await contractorAttendanceApi.list(queryParams);
      setItems(data.data || []);
      setTotal(data.meta?.total || 0);
      if (data.summary) setSummary(data.summary);
      if (data.filterOptions) setFilterOptions(data.filterOptions);
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to load contractor attendance', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  const handleDownloadTemplate = async () => {
    try {
      const response = await contractorAttendanceApi.downloadTemplate();
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Contractor_Attendance_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      dispatch(showSnackbar({ message: 'Template downloaded successfully' }));
    } catch {
      dispatch(showSnackbar({ message: 'Failed to download template', severity: 'error' }));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError('');
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      setUploadError('Please choose an Excel file to upload');
      return;
    }
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (uploadMonthYear) formData.append('monthYear', uploadMonthYear);

      const res = await contractorAttendanceApi.uploadExcel(formData);
      dispatch(
        showSnackbar({
          message: res.data?.message || 'Excel uploaded and details extracted successfully!',
        })
      );
      setUploadOpen(false);
      setSelectedFile(null);
      setUploadMonthYear('');
      loadData();
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'Failed to process Excel file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await contractorAttendanceApi.deleteRecord(confirmDelete._id);
      dispatch(showSnackbar({ message: 'Record deleted' }));
      setConfirmDelete(null);
      loadData();
    } catch (err) {
      dispatch(showSnackbar({ message: err.response?.data?.message || 'Failed to delete record', severity: 'error' }));
    }
  };

  const columns = [
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
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.row.workerName}
          </Typography>
          {params.row.workerId ? (
            <Typography variant="caption" sx={{ color: '#8A5D18', fontSize: '0.6875rem' }}>
              ID: {params.row.workerId}
            </Typography>
          ) : null}
        </Box>
      ),
    },
    {
      field: 'category',
      headerName: 'Trade / Skill',
      minWidth: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.row.category || 'General'}
          sx={{
            fontWeight: 600,
            fontSize: '0.72rem',
            bgcolor: 'rgba(212, 163, 78, 0.16)',
            color: '#704712',
            border: '1px solid rgba(212, 163, 78, 0.35)',
            borderRadius: '6px',
          }}
        />
      ),
    },
    { field: 'siteLocation', headerName: 'Site / Location', minWidth: 140, valueGetter: (_v, r) => r.siteLocation || '—' },
    { field: 'monthYear', headerName: 'Period', minWidth: 110, valueGetter: (_v, r) => r.monthYear || '—' },
    {
      field: 'presentDays',
      headerName: 'Present Days',
      minWidth: 110,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1B4D3E' }}>
          {params.row.presentDays ?? 0} {params.row.overtimeHours ? `(+${params.row.overtimeHours}h OT)` : ''}
        </Typography>
      ),
    },
    {
      field: 'dailyRate',
      headerName: 'Daily Rate',
      minWidth: 110,
      valueGetter: (_v, r) => (r.dailyRate ? `₹${Number(r.dailyRate).toLocaleString('en-IN')}` : '—'),
    },
    {
      field: 'wages',
      headerName: 'Total Wages (₹)',
      minWidth: 150,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 800, color: '#8A5D18', fontSize: '0.9375rem' }}>
          ₹{Number(params.row.wages || 0).toLocaleString('en-IN')}
        </Typography>
      ),
    },
    {
      field: 'paymentStatus',
      headerName: 'Status',
      minWidth: 110,
      renderCell: (params) => {
        const s = params.row.paymentStatus || 'Pending';
        const isPaid = s === 'Paid' || s === 'Approved';
        return (
          <Chip
            size="small"
            label={s}
            sx={{
              fontWeight: 700,
              fontSize: '0.6875rem',
              bgcolor: isPaid ? '#ECFDF5' : '#FEF3C7',
              color: isPaid ? '#15803D' : '#B45309',
              border: isPaid ? '1px solid #BBF7D0' : '1px solid #FDE68A',
            }}
          />
        );
      },
    },
    { field: 'remarks', headerName: 'Remarks', minWidth: 150, valueGetter: (_v, r) => r.remarks || '—' },
  ];

  const actions = [
    {
      label: 'Delete',
      icon: <DeleteIcon fontSize="small" color="error" />,
      onClick: (row) => setConfirmDelete(row),
    },
  ];

  const headerActions = (
    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleDownloadTemplate}
        sx={{
          whiteSpace: 'nowrap',
          borderColor: '#C99846',
          color: '#583714',
          '&:hover': { borderColor: '#8A5D18', bgcolor: 'rgba(212, 163, 78, 0.08)' },
        }}
      >
        Download Template
      </Button>
      <Button
        variant="contained"
        startIcon={<UploadFileIcon />}
        onClick={() => {
          setSelectedFile(null);
          setUploadError('');
          setUploadOpen(true);
        }}
        sx={{ whiteSpace: 'nowrap' }}
      >
        Upload Excel
      </Button>
    </Stack>
  );

  return (
    <>
      <PageHeader
        title="Contractor Attendance"
        subtitle="Upload contractor attendance Excel sheets, extract attendance records, and compute wages"
        actions={headerActions}
      />

      {/* KPI Stat Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <ContractorStatCard
          label="Total Workers"
          value={(summary.totalWorkers || 0).toLocaleString('en-IN')}
          sub="Extracted workforce"
          icon={faUsers}
        />
        <ContractorStatCard
          label="Contractors"
          value={summary.totalContractors || 0}
          sub="Agencies / vendors"
          icon={faBuildingUser}
        />
        <ContractorStatCard
          label="Total Present Days"
          value={(summary.totalDays || 0).toLocaleString('en-IN')}
          sub="Total working days"
          icon={faCalendarCheck}
        />
        <ContractorStatCard
          label="Total Wages (₹)"
          value={`₹${(summary.totalWages || 0).toLocaleString('en-IN')}`}
          sub="Wages calculated & payable"
          icon={faIndianRupeeSign}
        />
      </Box>

      {/* Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: '12px',
          border: '1px solid #E2D3BE',
          display: 'flex',
          gap: 1.5,
          flexWrap: 'wrap',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #FFFDF8 0%, #FAF3E6 100%)',
        }}
      >
        {filterOptions.contractors.length > 0 && (
          <TextField
            select
            size="small"
            label="Contractor"
            value={filters.contractor || ''}
            onChange={(e) => setFilter('contractor', e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All Contractors</MenuItem>
            {filterOptions.contractors.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        )}

        {filterOptions.months.length > 0 && (
          <TextField
            select
            size="small"
            label="Period / Month"
            value={filters.monthYear || ''}
            onChange={(e) => setFilter('monthYear', e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Periods</MenuItem>
            {filterOptions.months.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </TextField>
        )}

        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          sx={{ ml: 'auto', color: '#6E4D27', borderColor: '#E2D3BE' }}
        >
          Refresh
        </Button>
      </Paper>

      {/* Extracted Data Table */}
      <DataTable
        columns={columns}
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
        loading={loading}
      />

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={() => !uploading && setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#3A230B' }}>
          Upload Contractor Attendance Excel
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Typography variant="body2" sx={{ color: '#5C4022' }}>
              Upload the contractor attendance spreadsheet (<code>.xlsx</code>, <code>.xls</code>, or <code>.csv</code>).
              The system will automatically extract worker names, contractor agency, present days, rate, and total wages into the database table.
            </Typography>

            {uploadError && <Alert severity="error">{uploadError}</Alert>}

            <Box
              sx={{
                border: '2px dashed #C99846',
                borderRadius: '12px',
                p: 3,
                textAlign: 'center',
                bgcolor: selectedFile ? 'rgba(212, 163, 78, 0.08)' : '#FFFDF8',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(212, 163, 78, 0.12)', borderColor: '#8A5D18' },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                onChange={handleFileSelect}
              />
              <CloudUploadIcon sx={{ fontSize: 44, color: '#8A5D18', mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#3A230B' }}>
                {selectedFile ? selectedFile.name : 'Click to select or drag & drop Excel file'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#8A5D18' }}>
                Supported: .xlsx, .xls, .csv (Max 10 MB)
              </Typography>
            </Box>

            <TextField
              size="small"
              label="Month / Period (Optional, e.g. Nov 2026)"
              placeholder="e.g. Nov 2026"
              value={uploadMonthYear}
              onChange={(e) => setUploadMonthYear(e.target.value)}
              helperText="If omitted, will read from Excel or default to current month"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUploadOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadSubmit}
            disabled={!selectedFile || uploading}
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <FontAwesomeIcon icon={faFileExcel} />}
          >
            {uploading ? 'Extracting Details…' : 'Extract & Save Records'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Contractor Attendance Record"
        message={`Delete record for ${confirmDelete?.workerName || 'this worker'} (${confirmDelete?.contractorName})?`}
        confirmLabel="Delete"
        confirmColor="error"
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}

