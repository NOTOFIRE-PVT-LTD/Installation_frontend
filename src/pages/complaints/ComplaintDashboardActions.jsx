import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ListAltIcon from '@mui/icons-material/ListAlt';

const outlinedSx = {
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 700,
  borderColor: '#D4A34E',
  color: '#583714',
  bgcolor: 'rgba(212, 163, 78, 0.08)',
  width: '100%',
};

const primarySx = {
  ...outlinedSx,
  fontWeight: 800,
  border: 'none',
  background: 'linear-gradient(90deg, #FFE997 0%, #D4A34E 60%, #A37836 100%)',
  color: '#3A230B',
  px: 2,
};

export default function ComplaintDashboardActions({
  loading,
  isFieldEngineer,
  ticketsPath,
  onRefresh,
  onOpenQr,
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, auto)' },
        gap: 1.25,
        width: { xs: '100%', sm: 'auto' },
        alignSelf: { xs: 'stretch', sm: 'center' },
      }}
    >
      <Button variant="outlined" size="small" onClick={onRefresh} disabled={loading} startIcon={<RefreshIcon />} sx={outlinedSx}>
        Refresh
      </Button>
      {!isFieldEngineer ? (
        <Button variant="outlined" size="small" onClick={onOpenQr} startIcon={<QrCode2Icon />} sx={outlinedSx}>
          QR & Links
        </Button>
      ) : null}
      <Button component={Link} to={ticketsPath} variant="outlined" size="small" startIcon={<ListAltIcon />} sx={outlinedSx}>
        All Tickets
      </Button>
      {!isFieldEngineer ? (
        <Button component={Link} to="/complaints/new" variant="contained" size="small" startIcon={<AddCircleOutlineIcon />} sx={primarySx}>
          + Phone Intake
        </Button>
      ) : null}
    </Box>
  );
}
