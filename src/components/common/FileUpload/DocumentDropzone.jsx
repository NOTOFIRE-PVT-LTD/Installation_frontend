import { useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUploadOutlined';

function isImageValue(value) {
  if (!value) return false;
  if (value.file?.type?.startsWith('image/')) return true;
  if (value.resourceType === 'raw') return false;
  const name = (value.name || value.url || value.originalName || '').toLowerCase();
  return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(name) || /\/image\//i.test(value.url || '');
}

function toDownloadUrl(url) {
  if (!url) return url;
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/fl_attachment/');
  }
  return url;
}

function triggerDownload(url, filename = 'download') {
  if (!url) return;
  const link = document.createElement('a');
  link.href = toDownloadUrl(url);
  link.download = filename;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// `value` is a single { file?: File, url?: string, name: string, publicId?: string } item or null.
export default function DocumentDropzone({
  value,
  onChange,
  label = 'Checklist (PDF)',
  accept = 'application/pdf',
  buttonLabel,
  disabled = false,
  onRemove,
  removing = false,
}) {
  const inputRef = useRef(null);
  const acceptsImages = accept.includes('image/');
  const acceptsPdf = accept.includes('pdf');
  const defaultButtonLabel = acceptsImages && !acceptsPdf ? 'Upload Image' : acceptsImages ? 'Upload File' : 'Upload PDF';
  const StartIcon = acceptsImages && !acceptsPdf ? ImageOutlinedIcon : acceptsImages ? CloudUploadIcon : PictureAsPdfIcon;
  const showImage = isImageValue(value);
  const fileName = value?.originalName || value?.name || 'file';

  const handleFile = (file) => {
    onChange({ file, url: URL.createObjectURL(file), name: file.name });
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || removing) return;
    if (onRemove) {
      await onRemove(value);
      return;
    }
    onChange(null);
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
          spacing={1.25}
          sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, width: 'fit-content', maxWidth: '100%' }}
        >
          {showImage && value.url ? (
            <Box
              component="img"
              src={value.url}
              alt={fileName}
              sx={{ width: 56, height: 56, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <PictureAsPdfIcon color="error" />
          )}
          <Typography variant="body2" noWrap sx={{ maxWidth: 180, fontWeight: 500 }}>
            {fileName}
          </Typography>
          {value.url && (
            <>
              <Tooltip title="Open">
                <IconButton
                  type="button"
                  size="small"
                  component="a"
                  href={value.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open file"
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton
                  type="button"
                  size="small"
                  aria-label="Download file"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerDownload(value.url, fileName);
                  }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {!disabled && (
            <Tooltip title="Remove">
              <span>
                <IconButton
                  type="button"
                  size="small"
                  aria-label="Remove file"
                  onClick={handleRemove}
                  color="error"
                  disabled={removing}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Stack>
      ) : (
        <Button
          type="button"
          variant="outlined"
          startIcon={<StartIcon />}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {buttonLabel || defaultButtonLabel}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        disabled={disabled}
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
          e.target.value = '';
        }}
      />
    </Box>
  );
}
