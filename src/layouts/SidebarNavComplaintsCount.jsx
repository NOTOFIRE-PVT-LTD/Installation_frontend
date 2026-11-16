import Box from '@mui/material/Box';

export default function SidebarNavComplaintsCount({ count, active }) {
  if (count <= 0) return null;
  return (
    <Box
      sx={{
        ml: 'auto',
        minWidth: 20,
        height: 20,
        px: 0.75,
        borderRadius: 10,
        bgcolor: active ? '#991B1B' : '#DC2626',
        color: '#FFFFFF',
        fontSize: '0.6875rem',
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(220, 38, 38, 0.45)',
      }}
    >
      {count}
    </Box>
  );
}