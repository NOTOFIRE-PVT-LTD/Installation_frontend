import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { glassBtnSx, glassPrimaryBtnSx, glassIcon3dSx } from './complaintsGlassSx';

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
      <Button
        variant="outlined"
        size="small"
        onClick={onRefresh}
        disabled={loading}
        startIcon={<RefreshIcon sx={glassIcon3dSx} />}
        sx={glassBtnSx}
      >
        Refresh
      </Button>
      {!isFieldEngineer ? (
        <Button
          variant="outlined"
          size="small"
          onClick={onOpenQr}
          startIcon={<QrCode2Icon sx={glassIcon3dSx} />}
          sx={glassBtnSx}
        >
          QR & Links
        </Button>
      ) : null}
      <Button
        component={Link}
        to={ticketsPath}
        variant="outlined"
        size="small"
        startIcon={<ListAltIcon sx={glassIcon3dSx} />}
        sx={glassBtnSx}
      >
        All Tickets
      </Button>
      {!isFieldEngineer ? (
        <Button
          component={Link}
          to="/complaints/new"
          variant="contained"
          size="small"
          startIcon={<AddCircleOutlineIcon sx={glassIcon3dSx} />}
          sx={glassPrimaryBtnSx}
        >
          + Phone Intake
        </Button>
      ) : null}
    </Box>
  );
}
