import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { WEEK_DAYS } from './visitPlanHelpers';
import { visitPlanFieldSx, visitPlanWeekDayToggleSx } from './visitPlanMuiSx';
import VisitPlanPurposeChips from './VisitPlanPurposeChips';
import VisitPlanVisitTimingFields from './VisitPlanVisitTimingFields';

const newCustomerButtonSx = {
  whiteSpace: 'nowrap',
  px: 1.75,
  borderRadius: '10px',
  borderColor: 'rgba(88, 55, 20, 0.35)',
  color: '#583714',
  fontWeight: 700,
  bgcolor: 'rgba(255, 233, 151, 0.15)',
  '&:hover': { bgcolor: 'rgba(255, 233, 151, 0.35)', borderColor: '#583714' },
};

export default function VisitPlanVisitCardFields({
  item,
  scope,
  customers,
  pageLayout,
  onUpdate,
  onOpenCustomerModal,
}) {
  const stackGap = pageLayout ? 2 : 1.5;

  return (
    <Stack spacing={stackGap}>
      {scope === 'week' ? <VisitWeekDayPicker dayOffset={item.dayOffset} onUpdate={onUpdate} /> : null}
      <VisitCustomerPicker item={item} customers={customers} onUpdate={onUpdate} onOpenCustomerModal={onOpenCustomerModal} />
      <VisitPlanVisitTimingFields item={item} pageLayout={pageLayout} onUpdate={onUpdate} />
      <TextField size="small" label="Purpose" value={item.purpose} onChange={(e) => onUpdate('purpose', e.target.value)} fullWidth sx={visitPlanFieldSx} />
      <VisitPlanPurposeChips purpose={item.purpose} onSelect={(p) => onUpdate('purpose', p)} />
      <TextField
        size="small"
        label="Notes (Optional)"
        placeholder="Agenda, contact person, or discussion notes"
        value={item.notes}
        onChange={(e) => onUpdate('notes', e.target.value)}
        fullWidth
        multiline
        minRows={1}
        sx={visitPlanFieldSx}
      />
    </Stack>
  );
}

function VisitWeekDayPicker({ dayOffset, onUpdate }) {
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={dayOffset}
      onChange={(_e, val) => val !== null && onUpdate('dayOffset', val)}
      sx={visitPlanWeekDayToggleSx}
    >
      {WEEK_DAYS.map((d) => (
        <ToggleButton key={d.offset} value={d.offset}>
          {d.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

function VisitCustomerPicker({ item, customers, onUpdate, onOpenCustomerModal }) {
  return (
    <Stack direction="row" spacing={1}>
      <TextField select required fullWidth size="small" label="Customer" value={item.customer} onChange={(e) => onUpdate('customer', e.target.value)} sx={visitPlanFieldSx}>
        <MenuItem value="" disabled>
          <em>Select Customer</em>
        </MenuItem>
        {customers.map((c) => (
          <MenuItem key={c._id} value={c._id}>
            {c.companyName} {c.city ? `(${c.city})` : ''}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="outlined" size="small" startIcon={<PersonAddAlt1Icon />} onClick={onOpenCustomerModal} sx={newCustomerButtonSx}>
        New
      </Button>
    </Stack>
  );
}