import { useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import VideoFileIcon from '@mui/icons-material/VideoFileOutlined';

// `value` is a single { file?: File, url?: string, name: string } item or null.
export default function VideoDropzone({ value, onChange, label = 'Site Video (optional)' }) {
  const inputRef = useRef(null);

  const handleFile = (file) => {
    onChange({ file, url: URL.createObjectURL(file), name: file.name });
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      {value ? (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, width: 'fit-content' }}>
          <VideoFileIcon color="primary" />
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
            {value.name}
          </Typography>
          <IconButton size="small" onClick={() => onChange(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      ) : (
        <Button variant="outlined" startIcon={<VideoFileIcon />} onClick={() => inputRef.current?.click()}>
          Upload Video
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        hidden
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
          e.target.value = '';
        }}
      />
    </Box>
  );
}
