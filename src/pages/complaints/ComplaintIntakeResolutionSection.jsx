import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

const DELIVERY_STATUS_OPTIONS = [
  '',
  'Pending',
  'In Transit',
  'Delivered',
  'Partially Delivered',
  'Not Applicable',
];

export default function ComplaintIntakeResolutionSection({
  problem,
  setProblem,
  solutions,
  setSolutions,
  isAdmin,
  visitPersonId,
  setVisitPersonId,
  assignees,
  complaintReceiver,
  setComplaintReceiver,
  takenTime,
  setTakenTime,
  attempt,
  setAttempt,
  deliveryStatus,
  setDeliveryStatus,
  pendingReason,
  setPendingReason,
}) {
  return (
    <>
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em', mt: 1 }}>
          3. Issue Description & Immediate Notes
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth required multiline minRows={3} size="small" label="Reported Problem / Defect Description *" placeholder="Describe the fault symptoms..." value={problem} onChange={(e) => setProblem(e.target.value)} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth multiline minRows={2} size="small" label="Immediate Remedial Advice / Solutions Suggested (Optional)" placeholder="Any troubleshooting advice given to caller on call" value={solutions} onChange={(e) => setSolutions(e.target.value)} />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em', mt: 1 }}>
          4. Assignment & Tracking Metadata
        </Typography>
      </Grid>
      {isAdmin && (
        <Grid item xs={12} sm={6}>
          <TextField fullWidth select size="small" label="Assign To Field Engineer" value={visitPersonId} onChange={(e) => setVisitPersonId(e.target.value)} helperText="Leave blank if unassigned">
            <MenuItem value=""><em>Unassigned (Desk Queue)</em></MenuItem>
            {assignees.map((eng) => (
              <MenuItem key={eng.id || eng._id} value={eng.id || eng._id}>{eng.name} ({eng.jobRole || 'Field Engineer'})</MenuItem>
            ))}
          </TextField>
        </Grid>
      )}
      <Grid item xs={12} sm={isAdmin ? 6 : 12}>
        <TextField fullWidth size="small" label="Complaint Receiver / Attendant" value={complaintReceiver} onChange={(e) => setComplaintReceiver(e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth size="small" label="Time Taken on Call / Diagnosis" placeholder="e.g. 15 mins" value={takenTime} onChange={(e) => setTakenTime(e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth select size="small" label="Attempt Number" value={attempt} onChange={(e) => setAttempt(e.target.value)}>
          <MenuItem value="1">1st Attempt</MenuItem>
          <MenuItem value="2">2nd Attempt</MenuItem>
          <MenuItem value="3">3rd Attempt</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth select size="small" label="Delivery Status" value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)}>
          {DELIVERY_STATUS_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt || '— None —'}</MenuItem>)}
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth size="small" label="Pending Reason / Remarks (Optional)" placeholder="e.g. Waiting for railway station master approval" value={pendingReason} onChange={(e) => setPendingReason(e.target.value)} />
      </Grid>
    </>
  );
}

