import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { stateColor, stateLabel, visitQueueFlags } from './visitDayPageHelpers';
import VisitDayVisitQueueBody from './VisitDayVisitQueueBody';

export default function VisitDayVisitQueueItem({ visit, index, submitted, onOpenVisit }) {
  const { isDone, needsCheckOut } = visitQueueFlags(visit);

  return (
    <Card
      variant="outlined"
      sx={{
        border: '1px solid',
        borderColor: isDone ? 'success.light' : 'divider',
        borderRadius: '8px',
        bgcolor: isDone ? 'action.hover' : 'background.paper',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
          <VisitDayVisitQueueBody visit={visit} index={index} isDone={isDone} />
          <Stack spacing={1} alignItems={{ xs: 'flex-start', sm: 'flex-end' }} justifyContent="center">
            <Chip size="small" color={stateColor(visit)} label={stateLabel(visit)} sx={{ fontWeight: 600 }} />
            {!submitted && (
              <Button
                variant={needsCheckOut ? 'contained' : isDone ? 'outlined' : 'contained'}
                color={needsCheckOut ? 'warning' : 'primary'}
                onClick={() => onOpenVisit(visit._id)}
                sx={{ fontWeight: 700 }}
              >
                {needsCheckOut ? 'Check Out →' : isDone ? 'View Details' : 'Check In →'}
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}