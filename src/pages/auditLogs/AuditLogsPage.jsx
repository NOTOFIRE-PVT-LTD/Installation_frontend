import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClockRotateLeft,
  faPlusCircle,
  faPenToSquare,
  faTrashCan,
  faBolt,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';

import { auditLogApi } from '../../api/auditLogApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { apiErrorMessage } from '../quotations/quotationUtils';
import AuditLogDetailDrawer from './AuditLogDetailDrawer';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

const ACTION_CONFIG = {
  CREATE: { color: '#16a34a', bg: '#dcfce7', label: 'CREATE' },
  UPDATE: { color: '#2563eb', bg: '#dbeafe', label: 'UPDATE' },
  DELETE: { color: '#dc2626', bg: '#fee2e2', label: 'DELETE' },
  LOGIN: { color: '#7c3aed', bg: '#f3e8ff', label: 'LOGIN' },
  LOGOUT: { color: '#64748b', bg: '#f1f5f9', label: 'LOGOUT' },
  STATUS_CHANGE: { color: '#d97706', bg: '#fef3c7', label: 'STATUS' },
  RESTORE: { color: '#0891b2', bg: '#cffafe', label: 'RESTORE' },
  OTHER: { color: '#475569', bg: '#f1f5f9', label: 'OTHER' },
};

const MODULE_COLORS = {
  'Projects': { color: '#0d9488', bg: '#ccfbf1' },
  'Atlanta Payments': { color: '#dc2626', bg: '#fee2e2' },
  'Quotations': { color: '#4f46e5', bg: '#e0e7ff' },
  'Proforma Invoices': { color: '#0284c7', bg: '#e0f2fe' },
  'Delivery Challans': { color: '#0891b2', bg: '#cffafe' },
  'Users': { color: '#7c3aed', bg: '#f3e8ff' },
  'Stock Items': { color: '#ea580c', bg: '#ffedd5' },
  'BOM': { color: '#0369a1', bg: '#e0f2fe' },
  'Items Master': { color: '#c026d3', bg: '#fae8ff' },
  'Billing': { color: '#b45309', bg: '#fef3c7' },
  'Auth': { color: '#4338ca', bg: '#e0e7ff' },
  'Reports': { color: '#15803d', bg: '#dcfce7' },
  'Payments': { color: '#059669', bg: '#d1fae5' },
};

function formatTimestamp(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  // relative time calculation
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  let relative = '';
  if (diffSec < 60) relative = 'Just now';
  else if (diffSec < 3600) relative = `${Math.floor(diffSec / 60)}m ago`;
  else if (diffSec < 86400) relative = `${Math.floor(diffSec / 3600)}h ago`;
  else relative = `${Math.floor(diffSec / 86400)}d ago`;

  return { exact: `${dateStr}, ${hours}:${minutes} ${ampm}`, relative };
}

function StatCard({ label, value, icon, color, bg }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        bgcolor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        minWidth: 160,
      }}
    >
      <Box>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '1.375rem', fontWeight: 800, color: '#0f172a', mt: 0.25 }}>
          {(value ?? 0).toLocaleString('en-IN')}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '10px',
          bgcolor: bg,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
        }}
      >
        <FontAwesomeIcon icon={icon} />
      </Box>
    </Paper>
  );
}

export default function AuditLogsPage() {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const [selectedModule, setSelectedModule] = useState('ALL');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('all');

  const [availableModules, setAvailableModules] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, creates: 0, updates: 0, deletes: 0 });
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch summary stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await auditLogApi.getStats();
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch available modules
  const fetchModules = useCallback(async () => {
    try {
      const res = await auditLogApi.getModules();
      if (Array.isArray(res.data?.data)) {
        setAvailableModules(res.data.data);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch logs
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        pageSize,
        search: debouncedSearch || undefined,
        module: selectedModule !== 'ALL' ? selectedModule : undefined,
        action: selectedAction !== 'ALL' ? selectedAction : undefined,
      };

      if (dateFilter === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        params.startDate = todayStr;
        params.endDate = todayStr;
      } else if (dateFilter === '7days') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        params.startDate = d.toISOString().split('T')[0];
      } else if (dateFilter === '30days') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        params.startDate = d.toISOString().split('T')[0];
      }

      const res = await auditLogApi.list(params);
      setRows(res.data?.data || []);
      setTotal(res.data?.meta?.total ?? 0);
    } catch (err) {
      dispatch(showSnackbar({ message: apiErrorMessage(err, 'Failed to load audit logs'), severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, selectedModule, selectedAction, dateFilter, dispatch]);

  useEffect(() => {
    fetchStats();
    fetchModules();
  }, [fetchStats, fetchModules]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, selectedModule, selectedAction, dateFilter]);

  const handleExportCsv = () => {
    if (!rows.length) {
      dispatch(showSnackbar({ message: 'No logs to export', severity: 'warning' }));
      return;
    }
    const headers = ['Timestamp', 'Action', 'Module', 'Description', 'User Name', 'User Email', 'Role', 'IP Address', 'Method', 'Endpoint'];
    const csvRows = [headers.join(',')];

    rows.forEach((row) => {
      const timeStr = row.createdAt ? new Date(row.createdAt).toISOString() : '';
      const line = [
        `"${timeStr}"`,
        `"${row.action || ''}"`,
        `"${row.module || ''}"`,
        `"${(row.description || '').replace(/"/g, '""')}"`,
        `"${row.userName || ''}"`,
        `"${row.userEmail || ''}"`,
        `"${row.userRole || ''}"`,
        `"${row.ipAddress || ''}"`,
        `"${row.method || ''}"`,
        `"${row.endpoint || ''}"`,
      ];
      csvRows.push(line.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    dispatch(showSnackbar({ message: 'Audit logs exported successfully' }));
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Stat Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <StatCard
          label="Total Activities"
          value={stats.total}
          icon={faClockRotateLeft}
          color="#4f46e5"
          bg="#eef2ff"
        />
        <StatCard
          label="Creates"
          value={stats.creates}
          icon={faPlusCircle}
          color="#16a34a"
          bg="#dcfce7"
        />
        <StatCard
          label="Updates"
          value={stats.updates}
          icon={faPenToSquare}
          color="#2563eb"
          bg="#dbeafe"
        />
        <StatCard
          label="Deletes"
          value={stats.deletes}
          icon={faTrashCan}
          color="#dc2626"
          bg="#fee2e2"
        />
        <StatCard
          label="Today's Events"
          value={stats.today}
          icon={faBolt}
          color="#9333ea"
          bg="#f3e8ff"
        />
      </Stack>

      {/* Main Table Card */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: '#fff' }}>
        {/* Table Header Bar */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1.5}
          sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '7px',
                  bgcolor: '#eef2ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                }}
              >
                <FontAwesomeIcon icon={faLayerGroup} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                System Audit Trail
              </Typography>
            </Stack>
            <Typography color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.25 }}>
              Comprehensive immutable record of all create, update, delete, and login actions across the application.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Export current results as CSV">
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
                onClick={handleExportCsv}
                sx={{ borderRadius: '8px', textTransform: 'none', fontSize: '0.8125rem' }}
              >
                Export CSV
              </Button>
            </Tooltip>
            <Tooltip title="Refresh audit logs">
              <IconButton
                size="small"
                onClick={() => {
                  loadLogs();
                  fetchStats();
                }}
                sx={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Filter Controls Bar */}
        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="center">
            {/* Shortened search bar */}
            <TextField
              size="small"
              placeholder="Search user, action, description, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: '100%', sm: 320 }, bgcolor: '#fff' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Module Filter */}
            <FormControl size="small" sx={{ minWidth: 160, width: { xs: '100%', sm: 'auto' } }}>
              <Select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                displayEmpty
                sx={{ bgcolor: '#fff', fontSize: '0.8125rem' }}
              >
                <MenuItem value="ALL">All Modules</MenuItem>
                {availableModules.map((m) => (
                  <MenuItem key={m} value={m} sx={{ fontSize: '0.8125rem' }}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Action Filter */}
            <FormControl size="small" sx={{ minWidth: 140, width: { xs: '100%', sm: 'auto' } }}>
              <Select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                displayEmpty
                sx={{ bgcolor: '#fff', fontSize: '0.8125rem' }}
              >
                <MenuItem value="ALL">All Actions</MenuItem>
                <MenuItem value="CREATE" sx={{ fontSize: '0.8125rem' }}>Create</MenuItem>
                <MenuItem value="UPDATE" sx={{ fontSize: '0.8125rem' }}>Update</MenuItem>
                <MenuItem value="DELETE" sx={{ fontSize: '0.8125rem' }}>Delete</MenuItem>
                <MenuItem value="LOGIN" sx={{ fontSize: '0.8125rem' }}>Login</MenuItem>
                <MenuItem value="STATUS_CHANGE" sx={{ fontSize: '0.8125rem' }}>Status Change</MenuItem>
              </Select>
            </FormControl>

            {/* Date Range Filter */}
            <FormControl size="small" sx={{ minWidth: 140, width: { xs: '100%', sm: 'auto' } }}>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                displayEmpty
                sx={{ bgcolor: '#fff', fontSize: '0.8125rem' }}
              >
                <MenuItem value="all" sx={{ fontSize: '0.8125rem' }}>All Time</MenuItem>
                <MenuItem value="today" sx={{ fontSize: '0.8125rem' }}>Today</MenuItem>
                <MenuItem value="7days" sx={{ fontSize: '0.8125rem' }}>Last 7 Days</MenuItem>
                <MenuItem value="30days" sx={{ fontSize: '0.8125rem' }}>Last 30 Days</MenuItem>
              </Select>
            </FormControl>

            {(search || selectedModule !== 'ALL' || selectedAction !== 'ALL' || dateFilter !== 'all') && (
              <Button
                size="small"
                onClick={() => {
                  setSearch('');
                  setSelectedModule('ALL');
                  setSelectedAction('ALL');
                  setDateFilter('all');
                }}
                sx={{ textTransform: 'none', fontSize: '0.75rem', color: 'error.main' }}
              >
                Clear Filters
              </Button>
            )}
          </Stack>
        </Box>

        {/* Audit Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc', '& th': { fontWeight: 700, fontSize: '0.8125rem', color: '#475569' } }}>
                <TableCell sx={{ minWidth: 170 }}>Date & Time</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Performed By</TableCell>
                <TableCell sx={{ minWidth: 110 }}>Action</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Module</TableCell>
                <TableCell sx={{ minWidth: 260 }}>Description</TableCell>
                <TableCell sx={{ minWidth: 130 }}>IP / Method</TableCell>
                <TableCell align="right" sx={{ minWidth: 70 }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7}>
                      <Skeleton height={32} />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>No audit logs found</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
                      Activity will automatically appear here as actions and operations are performed.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const actionStyle = ACTION_CONFIG[row.action] || ACTION_CONFIG.OTHER;
                  const moduleStyle = MODULE_COLORS[row.module] || { color: '#334155', bg: '#f1f5f9' };
                  const time = formatTimestamp(row.createdAt);

                  return (
                    <TableRow
                      key={row._id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        '& td': { fontSize: '0.8125rem', py: 1.25 },
                      }}
                      onClick={() => setSelectedLog(row)}
                    >
                      {/* Date & Time */}
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color: '#1e293b' }}>
                          {time.exact}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>
                          {time.relative}
                        </Typography>
                      </TableCell>

                      {/* Performed By User */}
                      <TableCell>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <Avatar
                            src={row.user?.profileImage?.url}
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: '#6366f1',
                              color: '#fff',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {row.userName?.[0]?.toUpperCase() || 'U'}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.2 }} noWrap>
                              {row.userName || 'System'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }} noWrap>
                              {row.userEmail || row.userRole || '—'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Action Pill */}
                      <TableCell>
                        <Chip
                          size="small"
                          label={actionStyle.label}
                          sx={{
                            bgcolor: actionStyle.bg,
                            color: actionStyle.color,
                            fontWeight: 800,
                            fontSize: '0.6875rem',
                            height: 22,
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>

                      {/* Module Badge */}
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.module}
                          sx={{
                            bgcolor: moduleStyle.bg,
                            color: moduleStyle.color,
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 22,
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>

                      {/* Description */}
                      <TableCell>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.8125rem', color: '#1e293b' }}>
                          {row.description}
                        </Typography>
                        {row.entityName && row.entityName !== row.description && (
                          <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }} noWrap>
                            Target: {row.entityName}
                          </Typography>
                        )}
                      </TableCell>

                      {/* IP / Method */}
                      <TableCell>
                        <Typography sx={{ fontSize: '0.75rem', fontFamily: 'Consolas, monospace', color: '#334155' }}>
                          {row.ipAddress || '—'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>
                          {row.method} {row.statusCode ? `(${row.statusCode})` : ''}
                        </Typography>
                      </TableCell>

                      {/* View Details */}
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="View full event details">
                          <IconButton size="small" onClick={() => setSelectedLog(row)}>
                            <VisibilityOutlinedIcon fontSize="small" sx={{ color: '#6366f1' }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Leftmost Pagination */}
        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
          onPageChange={(_event, next) => setPage(next)}
          onRowsPerPageChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(0);
          }}
          sx={{
            '& .MuiTablePagination-toolbar': {
              justifyContent: 'flex-start',
              pl: 2,
            },
            '& .MuiTablePagination-spacer': {
              display: 'none',
            },
          }}
        />
      </Paper>

      {/* Audit Log Detail Drawer */}
      <AuditLogDetailDrawer
        open={Boolean(selectedLog)}
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </Box>
  );
}
