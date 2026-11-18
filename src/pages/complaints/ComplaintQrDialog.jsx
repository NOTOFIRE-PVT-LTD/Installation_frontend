import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';
import { publicComplaintLink, publicTrackLink } from './complaintUtils';

export default function ComplaintQrDialog({ open, onClose }) {
  const dispatch = useAppDispatch();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [error, setError] = useState('');
  const submitLink = publicComplaintLink();
  const trackLink = publicTrackLink();

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setQrDataUrl('');
    setError('');

    QRCode.toDataURL(submitLink, {
      width: 640,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#241404', light: '#FFFFFF' },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setError('Could not generate the QR code. You can still copy the links below.');
      });

    return () => {
      active = false;
    };
  }, [open, submitLink]);

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      dispatch(showSnackbar({ message: `${label} copied to clipboard!` }));
    } catch {
      dispatch(showSnackbar({ message: 'Could not copy link', severity: 'error' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <QrCode2Icon sx={{ color: '#B57F2F', fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={800} color="#241404">
              Public Complaint Links & QR Code
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Customers scan this code on site or visit the link to submit or track service tickets.
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} alignItems="center">
          <Box
            sx={{
              p: 2,
              border: '2px solid #D4A34E',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 100%)',
              boxShadow: '0 6px 20px rgba(88, 55, 20, 0.15)',
              width: { xs: 200, sm: 240 },
              height: { xs: 200, sm: 240 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {qrDataUrl ? (
              <Box component="img" src={qrDataUrl} alt="Complaint QR code" sx={{ width: '100%', height: '100%' }} />
            ) : error ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ px: 2 }}>
                {error}
              </Typography>
            ) : (
              <CircularProgress size={28} />
            )}
          </Box>

          <Box sx={{ width: '100%' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
              Public Complaint Submission URL
            </Typography>
            <TextField
              value={submitLink}
              fullWidth
              size="small"
              sx={{ mt: 0.5 }}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => copyToClipboard(submitLink, 'Submission link')} edge="end">
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ width: '100%' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
              Public Customer Tracking Portal URL
            </Typography>
            <TextField
              value={trackLink}
              fullWidth
              size="small"
              sx={{ mt: 0.5 }}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => copyToClipboard(trackLink, 'Tracking link')} edge="end">
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {error && <Alert severity="warning">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="outlined"
          startIcon={<OpenInNewIcon />}
          sx={{
            borderColor: '#D4A34E',
            color: '#583714',
            fontWeight: 700,
            borderRadius: '10px',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#B57F2F',
              bgcolor: 'rgba(212, 163, 78, 0.1)',
            },
          }}
          component="a"
          href={submitLink}
          target="_blank"
          rel="noreferrer"
        >
          Open Form
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadOutlinedIcon />}
          component="a"
          href={qrDataUrl || undefined}
          download={`complaint-qr-${new Date().toISOString().slice(0, 10)}.png`}
          disabled={!qrDataUrl}
          sx={{
            background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
            color: '#3A230B',
            fontWeight: 800,
            borderRadius: '10px',
            textTransform: 'none',
            px: 2.5,
            boxShadow: '0 3px 12px rgba(88, 55, 20, 0.2)',
            '&:hover': {
              background: 'linear-gradient(90deg, #FFF0B3 0%, #DEA954 60%, #B8853D 100%)',
            },
          }}
        >
          Download QR
        </Button>
      </DialogActions>
    </Dialog>
  );
}
