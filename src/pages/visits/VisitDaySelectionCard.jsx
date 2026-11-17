import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import VisitDayPlannedVisitOption from './VisitDayPlannedVisitOption';

export default function VisitDaySelectionCard({
  day,
  planned,
  picked,
  selectionLocked,
  busy,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onSaveSelection,
}) {
  const navigate = useNavigate();

  return (
    <Card sx={{ mb: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <div>
            <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
              Pick Visits for Today ({day.date})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Choose the visits you will be performing today from your plan
            </Typography>
          </div>
          {!selectionLocked && planned.length > 0 && (
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={onSelectAll}>
                Select All
              </Button>
              <Button size="small" onClick={onDeselectAll}>
                Clear
              </Button>
            </Stack>
          )}
        </Stack>

        <Stack spacing={0.5}>
          {planned.map((visit) => (
            <VisitDayPlannedVisitOption
              key={visit._id}
              visit={visit}
              checked={picked.includes(visit._id)}
              disabled={selectionLocked}
              onToggle={() => onToggle(visit._id)}
            />
          ))}
          {!planned.length && (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography color="text.secondary" variant="body2">
                No visits planned for today yet.
              </Typography>
              <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={() => navigate('/visits')}>
                Go to Visit Plan to Add Visits
              </Button>
            </Box>
          )}
        </Stack>

        {!selectionLocked && planned.length > 0 && (
          <Button
            variant="contained"
            sx={{ mt: 2, fontWeight: 700 }}
            disabled={busy || !picked.length}
            onClick={onSaveSelection}
          >
            Confirm Today&apos;s Visits ({picked.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}