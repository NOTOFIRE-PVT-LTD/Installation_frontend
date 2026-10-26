import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useState } from 'react';
import { formatDate } from '../../utils/formatters';

const ACTION_COLORS = {
  CREATE: { color: '#16a34a', bg: '#dcfce7', label: 'CREATE' },
  UPDATE: { color: '#2563eb', bg: '#dbeafe', label: 'UPDATE' },
  DELETE: { color: '#dc2626', bg: '#fee2e2', label: 'DELETE' },
  LOGIN: { color: '#7c3aed', bg: '#f3e8ff', label: 'LOGIN' },
  LOGOUT: { color: '#64748b', bg: '#f1f5f9', label: 'LOGOUT' },
  STATUS_CHANGE: { color: '#d97706', bg: '#fef3c7', label: 'STATUS' },
  RESTORE: { color: '#0891b2', bg: '#cffafe', label: 'RESTORE' },
  OTHER: { color: '#475569', bg: '#f1f5f9', label: 'ACTION' },
};

function formatExactDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function InfoItem({ label, value, monospace }) {
  return (
    <Box sx={{ p: 1.25, borderRadius: '8px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'text.primary',
          mt: 0.25,
          fontFamily: monospace ? 'Consolas, monospace' : 'inherit',
          wordBreak: 'break-all',
        }}
      >
        {value || '—'}
      </Typography>
    </Box>
  );
}

export default function AuditLogDetailDrawer({ open, log, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const actionStyle = ACTION_COLORS[log.action] || ACTION_COLORS.OTHER;
  const jsonString = JSON.stringify(log.details || {}, null, 2);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 540 },
          maxWidth: '100vw',
          borderRadius: 0,
          boxShadow: '-8px 0 32px rgba(31, 42, 68, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#fff',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
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
              <Chip
                size="small"
                label={log.module}
                sx={{
                  bgcolor: '#fff',
                  border: '1px solid #cbd5e1',
                  color: '#1e293b',
                  fontWeight: 600,
                  fontSize: '0.6875rem',
                  height: 22,
                  borderRadius: '6px',
                }}
              />
            </Stack>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', lineHeight: 1.3 }}>
              {log.description}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
              Timestamp: {formatExactDate(log.createdAt)}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ borderRadius: '8px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Body Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        <Stack spacing={2.5}>
          {/* Performed By User */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.04em' }}>
              Performed By
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                src={log.user?.profileImage?.url}
                sx={{ width: 44, height: 44, bgcolor: '#6366f1', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}
              >
                {log.userName?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{log.userName || 'System'}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{log.userEmail || '—'}</Typography>
                {log.userRole && (
                  <Chip
                    size="small"
                    label={log.userRole}
                    sx={{
                      height: 18,
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      mt: 0.5,
                      bgcolor: '#f1f5f9',
                      color: '#475569',
                    }}
                  />
                )}
              </Box>
            </Stack>
          </Paper>

          {/* Request & Target Details */}
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', mb: 1, letterSpacing: '0.04em' }}>
              Action & Endpoint Metadata
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.25 }}>
              <InfoItem label="HTTP Method" value={log.method} monospace />
              <InfoItem label="Status Code" value={log.statusCode} />
              <Box sx={{ gridColumn: 'span 2' }}>
                <InfoItem label="Endpoint URL" value={log.endpoint} monospace />
              </Box>
              {log.entityId && (
                <Box sx={{ gridColumn: 'span 2' }}>
                  <InfoItem label="Target Entity ID" value={log.entityId} monospace />
                </Box>
              )}
              {log.entityName && (
                <Box sx={{ gridColumn: 'span 2' }}>
                  <InfoItem label="Target Entity Name / Title" value={log.entityName} />
                </Box>
              )}
            </Box>
          </Box>

          {/* Client & Device Info */}
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', mb: 1, letterSpacing: '0.04em' }}>
              Client Network & Device
            </Typography>
            <Stack spacing={1.25}>
              <InfoItem label="IP Address" value={log.ipAddress} monospace />
              <InfoItem label="User Agent" value={log.userAgent} />
            </Stack>
          </Box>

          {/* Raw Payload / Details */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Payload & Event Details
              </Typography>
              <Button
                size="small"
                startIcon={copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                onClick={handleCopyJson}
                sx={{ fontSize: '0.6875rem', textTransform: 'none', py: 0.25, px: 1 }}
              >
                {copied ? 'Copied!' : 'Copy JSON'}
              </Button>
            </Stack>
            <Box
              component="pre"
              sx={{
                p: 2,
                borderRadius: '10px',
                bgcolor: '#0f172a',
                color: '#e2e8f0',
                fontSize: '0.75rem',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                overflowX: 'auto',
                maxHeight: 280,
                border: '1px solid #1e293b',
              }}
            >
              <code>{jsonString}</code>
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ p: 2, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: '8px', textTransform: 'none' }}>
          Close
        </Button>
      </Box>
    </Drawer>
  );
}
