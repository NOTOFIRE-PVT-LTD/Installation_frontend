import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { CATEGORY_OPTIONS, SOURCE_OPTIONS, WARRANTY_CONFIG } from './complaintUtils';

export default function ComplaintIntakeEquipmentSection({
  complaintDate,
  setComplaintDate,
  source,
  setSource,
  productName,
  setProductName,
  panelSerialNo,
  setPanelSerialNo,
  category,
  setCategory,
  priority,
  setPriority,
  warrantyStatus,
  setWarrantyStatus,
  onSerialBlur,
}) {
  return (
    <>
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em', mt: 1 }}>
          2. Equipment & Fault Classification
        </Typography>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth size="small" type="date" label="Complaint Date" value={complaintDate} onChange={(e) => setComplaintDate(e.target.value)} InputLabelProps={{ shrink: true }} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth select size="small" label="Intake Channel" value={source} onChange={(e) => setSource(e.target.value)}>
          {SOURCE_OPTIONS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
        </TextField>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth size="small" label="Equipment / Product Name" placeholder="e.g. SSDAC / HASSDAC Panel" value={productName} onChange={(e) => setProductName(e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth size="small" label="Panel / Serial No" placeholder="e.g. SN-88219" value={panelSerialNo} onChange={(e) => setPanelSerialNo(e.target.value)} onBlur={onSerialBlur} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth select size="small" label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORY_OPTIONS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth select size="small" label="Priority / Urgency" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <MenuItem value="LOW">Low (SLA: 72 hrs)</MenuItem>
          <MenuItem value="MEDIUM">Medium (SLA: 48 hrs)</MenuItem>
          <MenuItem value="HIGH">High (SLA: 24 hrs)</MenuItem>
          <MenuItem value="CRITICAL">Critical (SLA: 4 hrs)</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth select size="small" label="Warranty Status" value={warrantyStatus} onChange={(e) => setWarrantyStatus(e.target.value)}>
          {Object.entries(WARRANTY_CONFIG).map(([k, cfg]) => <MenuItem key={k} value={k}>{cfg.label}</MenuItem>)}
        </TextField>
      </Grid>
    </>
  );
}

