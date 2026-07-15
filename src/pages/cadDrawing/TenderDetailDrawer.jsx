import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/EditOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { formatDate } from '../../utils/formatters';

export default function TenderDetailDrawer({ open, tender, onClose, onEdit, canEdit = false }) {
  if (!tender) return null;

  const images = (tender.files || []).filter((f) => f.resourceType === 'image');
  const documents = (tender.files || []).filter((f) => f.resourceType === 'raw');

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 420 }, p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {tender.tenderName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tender.division?.name} · {tender.division?.zone}
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Date
        </Typography>
        <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
          {formatDate(tender.date)}
        </Typography>

        {tender.project?.projectName && (
          <>
            <Typography variant="body2" color="text.secondary">
              Project
            </Typography>
            <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
              {tender.project.projectName}
            </Typography>
          </>
        )}

        {canEdit && (
          <Button startIcon={<EditIcon />} variant="contained" size="small" onClick={() => onEdit(tender)} sx={{ mb: 3 }}>
            Edit Tender
          </Button>
        )}

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
          Images
        </Typography>
        {images.length > 0 ? (
          <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 3 }}>
            {images.map((img) => (
              <Box
                key={img.publicId}
                component="a"
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ width: 110, height: 110, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
              >
                <Box component="img" src={img.url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
            No images uploaded
          </Typography>
        )}

        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
          PDF Documents
        </Typography>
        {documents.length > 0 ? (
          <Stack spacing={1}>
            {documents.map((doc) => (
              <Button
                key={doc.publicId}
                component="a"
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<PictureAsPdfIcon color="error" />}
                variant="outlined"
                size="small"
                sx={{ justifyContent: 'flex-start' }}
              >
                {doc.originalName || 'View PDF'}
              </Button>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary" variant="body2">
            No PDF documents uploaded
          </Typography>
        )}
      </Box>
    </Drawer>
  );
}
