import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';

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
  photos = [],
  onAddPhotos,
  onRemovePhoto,
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
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em', mt: 1 }}>
          5. Photos / Evidence (Optional)
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Attach up to 3 photos of the equipment, issue, or nameplate.
        </Typography>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ gap: 1 }}>
          {photos.map((p, idx) => (
            <Box key={idx} sx={{ position: 'relative', width: 72, height: 72, borderRadius: 1.5, overflow: 'hidden', border: '1px solid #E2D3BE' }}>
              <Box component="img" src={p.url} alt={`photo-${idx}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <IconButton size="small" onClick={() => onRemovePhoto(idx)} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', p: 0.25, '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' } }}>
                <CloseIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Box>
          ))}
          {photos.length < 3 && (
            <ButtonBase component="label" sx={{ width: 72, height: 72, borderRadius: 1.5, border: '1px dashed #d4a34e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(212,163,78,0.06)', cursor: 'pointer' }}>
              <input type="file" accept="image/*" multiple hidden onChange={onAddPhotos} />
              <AddPhotoAlternateOutlinedIcon sx={{ color: '#8C5E28', fontSize: 24 }} />
              <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.5, color: '#8C5E28', fontWeight: 700 }}>+ Photo</Typography>
            </ButtonBase>
          )}
        </Stack>
      </Grid>
    </>
  );
}

