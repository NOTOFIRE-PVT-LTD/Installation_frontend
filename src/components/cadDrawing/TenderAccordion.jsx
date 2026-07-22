import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArchitectureIcon from '@mui/icons-material/ArchitectureOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { formatDate } from '../../utils/formatters';

export default function TenderAccordion({ tender, onSelect }) {
  const images = (tender.files || []).filter((f) => f.resourceType === 'image');
  const documents = (tender.files || []).filter((f) => f.resourceType === 'raw');

  return (
    <Accordion
      disableGutters
      onClick={onSelect ? () => onSelect(tender) : undefined}
      sx={{
        '&:before': { display: 'none' },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
        cursor: onSelect ? 'pointer' : 'default',
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} onClick={(e) => e.stopPropagation()}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
          <ArchitectureIcon fontSize="small" color="action" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={500}>
              {tender.tenderName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {tender.division?.name ? `${tender.division.name} · ` : ''}
              {formatDate(tender.date)} · {tender.files?.length || 0} file(s)
            </Typography>
          </Box>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {images.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: documents.length > 0 ? 1.5 : 0 }}>
            {images.map((img) => (
              <Box
                key={img.publicId}
                component="a"
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ width: 72, height: 72, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
              >
                <Box component="img" src={img.url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            ))}
          </Stack>
        )}
        {documents.map((doc) => (
          <Link
            key={doc.publicId}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
          >
            <PictureAsPdfIcon color="error" fontSize="small" /> {doc.originalName || 'View PDF'}
          </Link>
        ))}
        {images.length === 0 && documents.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No files uploaded for this drawing
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
