import { useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUploadOutlined';

// `value` is an array of { file?: File, url?: string, name: string } items.
export default function ImageDropzone({ value = [], onChange, label = 'Site Photos', error, helperText }) {
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const newItems = Array.from(fileList).map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    onChange([...value, ...newItems]);
  };

  const handleRemove = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }} color={error ? 'error' : 'text.primary'}>
        {label}
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 1 }}>
        {value.map((item, index) => (
          <Box
            key={item.url || item.publicId || index}
            sx={{ position: 'relative', width: 96, height: 96, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
          >
            <Box component="img" src={item.url} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <IconButton
              type="button"
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemove(index);
              }}
              sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        <Button
          type="button"
          variant="outlined"
          onClick={() => inputRef.current?.click()}
          sx={{ width: 96, height: 96, flexDirection: 'column', gap: 0.5 }}
        >
          <CloudUploadIcon />
          <Typography variant="caption">Add</Typography>
        </Button>
      </Stack>
      {helperText && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
          {helperText}
        </Typography>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </Box>
  );
}
