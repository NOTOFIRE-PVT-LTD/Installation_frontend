import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import RefreshIcon from '@mui/icons-material/Refresh';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { whatsappApi } from '../../api/whatsappApi';
import { formatDateTime } from '../../utils/formatters';

const STATUS_STYLE = {
  sent: { color: '#15803d', bg: '#dcfce7', label: 'Sent' },
  failed: { color: '#b91c1c', bg: '#fee2e2', label: 'Failed' },
  skipped: { color: '#64748b', bg: '#f1f5f9', label: 'Skipped' },
};

const COLUMNS = [
  {
    field: 'createdAt',
    headerName: 'Time',
    width: 170,
    valueFormatter: (value) => formatDateTime(value),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 110,
    renderCell: (params) => {
      const style = STATUS_STYLE[params.value] || STATUS_STYLE.skipped;
      return (
        <Chip
          size="small"
          label={style.label}
          sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600, fontSize: '0.75rem' }}
        />
      );
    },
  },
  {
    field: 'recipient',
    headerName: 'Recipient',
    flex: 1,
    minWidth: 160,
    valueGetter: (value, row) => row.recipient?.name || row.mobileNumber || '—',
  },
  {
    field: 'mobileNumber',
    headerName: 'Mobile',
    width: 130,
  },
  {
    field: 'message',
    headerName: 'Summary',
    flex: 1.5,
    minWidth: 220,
  },
  {
    field: 'error',
    headerName: 'Error',
    flex: 1,
    minWidth: 180,
    valueGetter: (value) => value || '—',
  },
  {
    field: 'triggeredBy',
    headerName: 'Triggered By',
    width: 140,
    valueGetter: (value, row) => row.triggeredBy?.name || '—',
  },
];

export default function WhatsAppLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusInfo, setStatusInfo] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize };
      if (filters.status) params.status = filters.status;

      const [logsRes, statusRes] = await Promise.all([whatsappApi.listLogs(params), whatsappApi.getStatus()]);
      setLogs(logsRes.data.data || []);
      setTotal(logsRes.data.meta?.total || 0);
      setStatusInfo(statusRes.data.data || null);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters.status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Box>
      <PageHeader
        title="WhatsApp Logs"
        subtitle="Delivery history for payment-request WhatsApp alerts via AiSensy"
        actions={
          <Button startIcon={<RefreshIcon />} variant="outlined" onClick={load} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {statusInfo?.hints?.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Setup issues detected
          </Typography>
          <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
            {statusInfo.hints.map((hint) => (
              <Typography key={hint} component="li" variant="body2">
                {hint}
              </Typography>
            ))}
          </Stack>
        </Alert>
      )}

      {statusInfo && (
        <Paper sx={{ p: 2, mb: 2.5, border: '1px solid', borderColor: 'divider' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
            <Box>
              <Typography variant="caption" color="text.secondary">
                AiSensy
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {statusInfo.enabled ? 'Enabled' : 'Disabled'} · Campaign: {statusInfo.campaignName || '—'} · PDF:{' '}
                {statusInfo.mediaSource === 'station' ? 'from station attachment' : statusInfo.mediaSource || 'station'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Alert recipients
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {statusInfo.recipientAdminCount} admin(s)
                {statusInfo.recipientAdmins?.length > 0
                  ? ` — ${statusInfo.recipientAdmins.map((a) => a.name).join(', ')}`
                  : ''}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Totals
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                Sent {statusInfo.statusCounts?.sent || 0} · Failed {statusInfo.statusCounts?.failed || 0} · Skipped{' '}
                {statusInfo.statusCounts?.skipped || 0}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {loading && logs.length === 0 ? (
        <Stack alignItems="center" sx={{ mt: 6 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <DataTable
          rows={logs}
          columns={COLUMNS}
          totalCount={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          filters={[
            {
              field: 'status',
              label: 'Status',
              options: [
                { value: 'sent', label: 'Sent' },
                { value: 'failed', label: 'Failed' },
                { value: 'skipped', label: 'Skipped' },
              ],
            },
          ]}
          filterValues={filters}
          onFilterChange={(field, value) => {
            setFilters((prev) => ({ ...prev, [field]: value }));
            setPage(1);
          }}
          loading={loading}
          emptyMessage="No WhatsApp logs yet"
          storageKey="whatsapp-logs"
        />
      )}
    </Box>
  );
}
