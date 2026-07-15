import { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import DownloadIcon from '@mui/icons-material/Download';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { downloadSingleStationReport, downloadStationWiseReport } from '../../utils/stationReportExport';

/**
 * Download menu: all stations, or one particular station.
 */
export default function StationReportDownloadMenu({
  project,
  size = 'small',
  variant = 'outlined',
  label = 'Download PDF',
  sx,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const stations = project?.stations || [];

  if (!stations.length) return null;

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Button
        size={size}
        variant={variant}
        startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        sx={{ fontSize: '0.6875rem', textTransform: 'none', borderRadius: '8px', ...sx }}
      >
        {label}
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
            downloadStationWiseReport(project);
            handleClose();
          }}
        >
          <ListItemText primary="All stations (PDF)" secondary={`${stations.length} station(s)`} />
        </MenuItem>
        <Divider />
        {stations.map((station) => (
          <MenuItem
            key={station._id}
            onClick={() => {
              downloadSingleStationReport(project, station);
              handleClose();
            }}
          >
            <ListItemText
              primary={station.name || 'Untitled station'}
              secondary={`${station.type || 'Station'} · PDF`}
              primaryTypographyProps={{ noWrap: true }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
