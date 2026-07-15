import { useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import VideoFileIcon from '@mui/icons-material/VideoFileOutlined';

// `value` is an array of { file?: File, url?: string, name: string } items.
export default function MultiVideoDropzone({ value = [], onChange, label = 'Commissioning Videos' }) {
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
      <Typography variant="body2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Stack spacing={1} sx={{ mb: 1 }}>
        {value.map((item, index) => (
          <Stack
            key={item.url || item.publicId || index}
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, width: 'fit-content' }}
          >
            <VideoFileIcon color="primary" />
            <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
              {item.name}
            </Typography>
            <IconButton size="small" onClick={() => handleRemove(index)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <Button variant="outlined" startIcon={<VideoFileIcon />} onClick={() => inputRef.current?.click()}>
        Add Video
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
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
