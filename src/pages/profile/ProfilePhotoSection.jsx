import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const AVATAR_GRADIENT = 'linear-gradient(135deg, #FFE997 0%, #D4A34E 55%, #A37836 100%)';

export default function ProfilePhotoSection({
  user,
  imagePreview,
  onFileChange,
  onRemove,
  onUndo,
  isRemoved,
  hasOriginalPhoto,
}) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box sx={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
        <Avatar
          src={imagePreview || undefined}
          sx={{
            width: 72,
            height: 72,
            fontWeight: 700,
            fontSize: '1.5rem',
            color: '#3A230B',
            background: imagePreview ? undefined : AVATAR_GRADIENT,
          }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </Avatar>
        {imagePreview ? (
          <Tooltip title="Delete photo">
            <IconButton
              size="small"
              color="error"
              aria-label="Delete profile photo"
              onClick={onRemove}
              sx={{
                position: 'absolute',
                right: -6,
                bottom: -6,
                bgcolor: '#fff',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 1,
                '&:hover': { bgcolor: '#fff5f5' },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Box>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <Button component="label" variant="outlined" size="small">
          Change Photo
          <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={onFileChange} />
        </Button>
        {isRemoved && hasOriginalPhoto ? (
          <Button variant="text" size="small" color="inherit" onClick={onUndo} sx={{ textTransform: 'none' }}>
            Undo
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}
