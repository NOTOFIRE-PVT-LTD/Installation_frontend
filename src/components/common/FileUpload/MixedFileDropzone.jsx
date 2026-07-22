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
import CloudUploadIcon from '@mui/icons-material/CloudUploadOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdfOutlined';

function isPdfItem(item) {
  if (item.resourceType) return item.resourceType === 'raw';
  return item.file?.type === 'application/pdf';
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

// `value` is an array of { file?: File, url?: string, name: string, publicId?: string, resourceType?: 'image'|'raw' } items.
export default function MixedFileDropzone({
  value = [],
  onChange,
  label = 'Files (Images or PDFs)',
  error,
  helperText,
  disabled = false,
}) {
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const newItems = Array.from(fileList).map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    onChange([...value, ...newItems]);
  };

  const handleRemove = (index, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (disabled) return;
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }} color={error ? 'error' : 'text.primary'}>
        {label}
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 1 }}>
        {value.map((item, index) => {
          const fileName = item.originalName || item.name || `file-${index + 1}`;
          return (
            <Box
              key={item.publicId || item.url || index}
              sx={{
                position: 'relative',
                width: 96,
                height: 96,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {isPdfItem(item) ? (
                <Stack alignItems="center" justifyContent="center" sx={{ width: '100%', height: '100%', bgcolor: 'action.hover', p: 0.5 }}>
                  <PictureAsPdfIcon color="error" />
                  <Typography variant="caption" noWrap sx={{ maxWidth: 84 }}>
                    {fileName}
                  </Typography>
                </Stack>
              ) : (
                <Box component="img" src={item.url} alt={fileName} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              {item.url && (
                <Stack
                  direction="row"
                  spacing={0.25}
                  sx={{ position: 'absolute', left: 2, bottom: 2 }}
                >
                  <Tooltip title="Open">
                    <IconButton
                      type="button"
                      size="small"
                      component="a"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', p: 0.35, '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}
                    >
                      <OpenInNewIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton
                      type="button"
                      size="small"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        triggerDownload(item.url, fileName);
                      }}
                      sx={{ bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', p: 0.35, '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}
                    >
                      <DownloadIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
              {!disabled && (
                <IconButton
                  type="button"
                  size="small"
                  onClick={(e) => handleRemove(index, e)}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          );
        })}
        {!disabled && (
          <Button
            type="button"
            variant="outlined"
            onClick={() => inputRef.current?.click()}
            sx={{ width: 96, height: 96, flexDirection: 'column', gap: 0.5 }}
          >
            <CloudUploadIcon />
            <Typography variant="caption">Add</Typography>
          </Button>
        )}
      </Stack>
      {helperText && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
          {helperText}
        </Typography>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        multiple
        hidden
        disabled={disabled}
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </Box>
  );
}
