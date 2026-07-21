import { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadIcon from '@mui/icons-material/Download';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { downloadSingleStationReport, downloadStationWiseReport } from '../../utils/stationReportExport';
import { useAppDispatch } from '../../app/hooks';
import { showSnackbar } from '../../features/ui/uiSlice';

/**
 * Download menu: all stations, or one particular station.
 * Generated PDFs include checklist docs, signed checklist, work photos, and other attachments.
 */
export default function StationReportDownloadMenu({
  project,
  size = 'small',
  variant = 'outlined',
  label = 'Download PDF',
  sx,
}) {
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [busy, setBusy] = useState(false);
  const open = Boolean(anchorEl);
  const stations = project?.stations || [];

  if (!stations.length) return null;

  const handleClose = () => setAnchorEl(null);

  const runDownload = async (action) => {
    handleClose();
    setBusy(true);
    try {
      await action();
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err?.message || 'Failed to generate PDF with attachments',
          severity: 'error',
        })
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        size={size}
        variant={variant}
        disabled={busy}
        startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon sx={{ fontSize: 16 }} />}
        endIcon={!busy ? <KeyboardArrowDownIcon sx={{ fontSize: 16 }} /> : null}
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        sx={{ fontSize: '0.6875rem', textTransform: 'none', borderRadius: '8px', ...sx }}
      >
        {busy ? 'Preparing PDF…' : label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 220, maxHeight: 360 } }}
      >
        <MenuItem
          onClick={() => {
            runDownload(() => downloadStationWiseReport(project));
          }}
        >
          <ListItemText primary="All stations (PDF)" secondary={`${stations.length} station(s) + attachments`} />
        </MenuItem>
        <Divider />
        {stations.map((station) => (
          <MenuItem
            key={station._id}
            onClick={() => {
              runDownload(() => downloadSingleStationReport(project, station));
            }}
          >
            <ListItemText
              primary={station.name || 'Untitled station'}
              secondary={`${station.type || 'Station'} · PDF with photos`}
              primaryTypographyProps={{ noWrap: true }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
