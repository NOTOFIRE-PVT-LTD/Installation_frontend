import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';

const ICONS = {
  download: DownloadIcon,
  send: SendIcon,
};

export default function AnimatedActionButton({
  kind = 'download',
  label,
  onClick,
  disabled = false,
}) {
  const Icon = ICONS[kind] || DownloadIcon;
  const text = label || (kind === 'send' ? 'Send' : 'Download');

  return (
    <Tooltip title={text}>
      <Button
        onClick={onClick}
        disabled={disabled}
        aria-label={text}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          height: 36,
          minWidth: { xs: 36, lg: 118 },
          width: { xs: 36, lg: 'auto' },
          px: { xs: 0, lg: 2 },
          borderRadius: 999,
          textTransform: 'none',
          fontWeight: 700,
          color: '#241404',
          background: 'linear-gradient(180deg, #FFE997 0%, #E5B85C 42%, #D4A34E 100%)',
          boxShadow: '0 2px 8px rgba(88, 55, 20, 0.22)',
          '&:hover': {
            background: 'linear-gradient(180deg, #FFE08A 0%, #D4A34E 50%, #C99846 100%)',
            boxShadow: '0 4px 12px rgba(88, 55, 20, 0.28)',
          },
          '@media (min-width: 1200px)': {
            '&:hover .aa-text': { top: '-100%' },
            '&:hover .aa-icon': { top: 0 },
            ...(kind === 'send'
              ? { '&:hover .aa-icon svg': { transform: 'rotate(45deg)' } }
              : {}),
          },
        }}
      >
        <Box
          className="aa-text"
          sx={{
            display: { xs: 'none', lg: 'flex' },
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
            top: 0,
            fontSize: '0.8125rem',
            letterSpacing: '0.01em',
            transition: 'top 0.45s ease',
            pointerEvents: 'none',
          }}
        >
          {text}
        </Box>
        <Box
          className="aa-icon"
          sx={{
            display: 'flex',
            position: { xs: 'static', lg: 'absolute' },
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
            top: { xs: 0, lg: '100%' },
            transition: 'top 0.45s ease',
            pointerEvents: 'none',
            '& svg': { fontSize: 18, transition: 'transform 0.35s ease' },
          }}
        >
          <Icon />
        </Box>
      </Button>
    </Tooltip>
  );
}
