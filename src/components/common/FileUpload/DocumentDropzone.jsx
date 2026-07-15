import { useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUploadOutlined';

function isImageValue(value) {
  if (!value) return false;
  if (value.file?.type?.startsWith('image/')) return true;
  const name = (value.name || value.url || '').toLowerCase();
  return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(name) || /\/image\//i.test(value.url || '');
}

// `value` is a single { file?: File, url?: string, name: string } item or null.
export default function DocumentDropzone({
  value,
  onChange,
  label = 'Checklist (PDF)',
  accept = 'application/pdf',
  buttonLabel,
}) {
  const inputRef = useRef(null);
  const acceptsImages = accept.includes('image/');
  const acceptsPdf = accept.includes('pdf');
  const defaultButtonLabel = acceptsImages && !acceptsPdf ? 'Upload Image' : acceptsImages ? 'Upload File' : 'Upload PDF';
  const StartIcon = acceptsImages && !acceptsPdf ? ImageOutlinedIcon : acceptsImages ? CloudUploadIcon : PictureAsPdfIcon;
  const showImage = isImageValue(value);

  const handleFile = (file) => {
    onChange({ file, url: URL.createObjectURL(file), name: file.name });
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      {value ? (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, width: 'fit-content', maxWidth: '100%' }}
        >
          {showImage && value.url ? (
            <Box
              component="img"
              src={value.url}
              alt={value.name}
              sx={{ width: 56, height: 56, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <PictureAsPdfIcon color="error" />
          )}
          <Typography
            variant="body2"
            noWrap
            component={value.url && !value.file ? 'a' : 'span'}
            href={value.url && !value.file ? value.url : undefined}
            target={value.url && !value.file ? '_blank' : undefined}
            rel="noopener noreferrer"
            sx={{ maxWidth: 220 }}
          >
            {value.name}
          </Typography>
          <IconButton size="small" onClick={() => onChange(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      ) : (
        <Button variant="outlined" startIcon={<StartIcon />} onClick={() => inputRef.current?.click()}>
          {buttonLabel || defaultButtonLabel}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
          e.target.value = '';
        }}
      />
    </Box>
  );
}
