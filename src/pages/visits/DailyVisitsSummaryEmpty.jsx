import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

export default function DailyVisitsSummaryEmpty({ onPlanVisit, onToday }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'rgba(212, 163, 78, 0.35)',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%)',
        p: { xs: 2.5, sm: 4 },
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(56, 32, 10, 0.06)',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#241404' }}>
        No Visit Records Yet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 460, mx: 'auto' }}>
        You have not planned or completed any customer visits yet. Plan your first customer visit to get started!
      </Typography>
      <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" useFlexGap>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onPlanVisit} sx={{ borderRadius: '16px', fontWeight: 700 }}>
          + Plan Visits
        </Button>
        <Button variant="outlined" onClick={onToday} sx={{ borderRadius: '16px', fontWeight: 600 }}>
          Today's Visits
        </Button>
      </Stack>
    </Card>
  );
}