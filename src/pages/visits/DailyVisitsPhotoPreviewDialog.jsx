import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';

export default function DailyVisitsPhotoPreviewDialog({ previewPhoto, onClose }) {
  return (
    <Dialog
      open={Boolean(previewPhoto)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '16px', p: 1 } } }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {previewPhoto?.caption || 'Photo Preview'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2, textAlign: 'center' }}>
        {previewPhoto?.url ? (
          <Box
            component="img"
            src={previewPhoto.url}
            alt="Visit verification photo"
            sx={{
              width: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}