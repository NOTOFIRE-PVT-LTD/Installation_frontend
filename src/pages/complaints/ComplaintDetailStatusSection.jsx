import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const ALL_PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low — 72 hours SLA' },
  { value: 'MEDIUM', label: 'Medium — 48 hours SLA' },
  { value: 'HIGH', label: 'High — 24 hours SLA' },
  { value: 'CRITICAL', label: 'Critical — 4 hours SLA' },
];

export default function ComplaintDetailStatusSection({
  formData,
  handleChange,
  statusOptions,
  assigneeOptions,
  disabled,
}) {
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #E2D3BE', bgcolor: '#FFFDF8', mb: 2.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3A230B', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SwapHorizIcon sx={{ color: '#8C5E28', fontSize: 20 }} /> Status & Allocation
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Ticket Status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            {statusOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Priority / Urgency"
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
          >
            {ALL_PRIORITY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Assigned Engineer"
            value={formData.assignedTo}
            onChange={(e) => handleChange('assignedTo', e.target.value)}
            disabled={disabled}
          >
            {assigneeOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="Update Note / Remark"
            placeholder="Add internal note or justification for status change"
            value={formData.note}
            onChange={(e) => handleChange('note', e.target.value)}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

