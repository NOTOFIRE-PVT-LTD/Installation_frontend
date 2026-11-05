import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

const filter = createFilterOptions();

export default function ComplaintIntakeCustomerSection({
  customers,
  handleCustomerChange,
  customerName,
  setCustomerName,
  mobileNo,
  setMobileNo,
  whatsappNo,
  setWhatsappNo,
  email,
  setEmail,
  customerOrganization,
  setCustomerOrganization,
  stationName,
  setStationName,
  onPhoneBlur,
}) {
  return (
    <>
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          1. Customer & Station Information
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Autocomplete
          freeSolo
          options={customers}
          getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.companyName || option.contactPerson} (${option.phone || 'No phone'})`)}
          onChange={handleCustomerChange}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);
            if (params.inputValue !== '') {
              filtered.push({ inputValue: params.inputValue, companyName: `Add "${params.inputValue}"` });
            }
            return filtered;
          }}
          renderInput={(params) => <TextField {...params} size="small" label="Search Existing Customer / Account" placeholder="Type company or contact name" />}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth required size="small" label="Customer / Caller Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth required size="small" label="Contact Mobile No *" value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} onBlur={onPhoneBlur} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth required size="small" label="WhatsApp Number *" value={whatsappNo} onChange={(e) => setWhatsappNo(e.target.value)} helperText="Ticket updates are sent on WhatsApp only" />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth size="small" label="Email (Optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth size="small" label="Company / Organization" value={customerOrganization} onChange={(e) => setCustomerOrganization(e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth size="small" label="Station / Site Name" value={stationName} onChange={(e) => setStationName(e.target.value)} />
      </Grid>
    </>
  );
}
