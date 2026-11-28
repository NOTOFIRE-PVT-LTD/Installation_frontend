import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

function Row({ label, value }) {
  if (value == null || value === '') return null;
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return (
    <Box sx={{ py: 1, borderBottom: '1px solid #E2D3BE' }}>
      <Typography variant="caption" sx={{ color: '#8A6A3D', fontWeight: 700, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: '#241404', fontWeight: 600, mt: 0.25, wordBreak: 'break-word' }}>
        {text}
      </Typography>
    </Box>
  );
}

export default function ShipmentDetailDrawer({ open, shipment, onClose, onOpenFullApp, opening }) {
  const s = shipment || {};
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, borderBottom: '1px solid #E2D3BE' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#3A230B' }}>
            {s.shipment_number || 'Shipment'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#8A6A3D', fontWeight: 600 }}>
            {s.stage || '—'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </Stack>
      <Box sx={{ p: 2 }}>
        <Row label="Customer" value={s.customer_name} />
        <Row label="Destination" value={[s.destination_city, s.destination_state].filter(Boolean).join(', ')} />
        <Row label="Pincode" value={s.destination_pincode} />
        <Row label="Dispatch date" value={s.dispatch_date} />
        <Row label="Payment" value={s.payment_mode} />
        <Row label="Type" value={s.shipment_type} />
        <Row label="Remarks" value={s.remarks} />
        {onOpenFullApp ? (
          <Button
            fullWidth
            variant="contained"
            disabled={opening}
            onClick={onOpenFullApp}
            sx={{ mt: 2.5, fontWeight: 700, textTransform: 'none' }}
          >
            {opening ? 'Opening…' : 'Open in Shipping app'}
          </Button>
        ) : null}
      </Box>
    </Drawer>
  );
}
