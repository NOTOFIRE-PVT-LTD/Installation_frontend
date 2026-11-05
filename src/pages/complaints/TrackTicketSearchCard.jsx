import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';

export default function TrackTicketSearchCard({
  ticketQuery,
  setTicketQuery,
  verification,
  setVerification,
  loading,
  onSubmit,
}) {
  return (
    <Paper
      elevation={0}
      component="form"
      onSubmit={onSubmit}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: '16px',
        border: '2px solid transparent',
        background:
          'linear-gradient(135deg, #FFFDF8 0%, #FDF7EB 45%, #F7EFE1 80%, #F2E7D5 100%) padding-box, linear-gradient(135deg, #FAE2B4 0%, #E5B85C 25%, #C99846 60%, #7D511E 85%, #38200A 100%) border-box',
        boxShadow: '0 8px 30px rgba(56, 32, 10, 0.08), 0 2px 8px rgba(229, 184, 92, 0.12)',
        mb: 4,
      }}
    >
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, color: '#0f172a' }}>
        Track Your Complaint Status
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Enter your unique Ticket ID (e.g., <code style={{ color: '#0f766e', fontWeight: 600 }}>CMP-2026-000124</code>) received via SMS or email.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={7}>
          <TextField
            fullWidth
            size="small"
            label="Ticket ID"
            placeholder="e.g. CMP-2026-000124"
            value={ticketQuery}
            onChange={(e) => setTicketQuery(e.target.value.toUpperCase())}
            required
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            size="small"
            label="Phone or Email (Optional Verification)"
            placeholder="Last 5 digits or email"
            value={verification}
            onChange={(e) => setVerification(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !ticketQuery.trim()}
            sx={{
              borderRadius: 999,
              background: 'linear-gradient(90deg, #FAE2B4 0%, #E5B85C 25%, #C99846 60%, #7D511E 85%, #38200A 100%) !important',
              color: '#241404 !important',
              fontWeight: 800,
              fontSize: '0.875rem',
              boxShadow: '0 4px 14px rgba(32, 18, 4, 0.35)',
              textTransform: 'none',
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Check Status'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}

