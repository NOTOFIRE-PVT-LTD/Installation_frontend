import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PageHeader from '../../components/common/PageHeader';
import { DAY_VISIT_STATUS } from '../../utils/constants';
import { isSelectionLocked } from './visitDayPageHelpers';
import { useVisitDayPage } from './useVisitDayPage';
import VisitDayProgressAlert from './VisitDayProgressAlert';
import VisitDaySelectionCard from './VisitDaySelectionCard';
import VisitDayVisitQueueItem from './VisitDayVisitQueueItem';
import { VisitDaySubmitCard, VisitDaySubmittedExpenseCard } from './VisitDayFooterCards';

export default function VisitDayPage() {
  const {
    day,
    picked,
    busy,
    navigate,
    toggle,
    selectAll,
    deselectAll,
    saveSelection,
    submitDay,
  } = useVisitDayPage();

  if (!day) return null;

  const selected = day.selected || [];
  const planned = day.planned || [];
  const submitted = day.status === DAY_VISIT_STATUS.SUBMITTED;
  const selectionLocked = isSelectionLocked(selected);
  const openExpense = () => navigate(`/expenses/${day.expense._id}`);

  return (
    <>
      <PageHeader
        title="Today's Visits"
        subtitle="Select today's visits, check in & out at each location with a selfie, and submit your travel expenses."
        actions={
          <Button variant="outlined" startIcon={<CalendarMonthIcon />} onClick={() => navigate('/visits')}>
            Open Visit Plan
          </Button>
        }
      />

      <VisitDayProgressAlert
        day={day}
        selected={selected}
        submitted={submitted}
        onOpenExpense={openExpense}
      />

      {!submitted && (
        <VisitDaySelectionCard
          day={day}
          planned={planned}
          picked={picked}
          selectionLocked={selectionLocked}
          busy={busy}
          onToggle={toggle}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onSaveSelection={saveSelection}
        />
      )}

      <Stack spacing={2}>
        {selected.map((visit, index) => (
          <VisitDayVisitQueueItem
            key={visit._id}
            visit={visit}
            index={index}
            submitted={submitted}
            onOpenVisit={(id) => navigate(`/visits/${id}`)}
          />
        ))}
      </Stack>

      {day.canSubmit && <VisitDaySubmitCard busy={busy} onSubmitDay={submitDay} />}

      {submitted && day.expense?._id && (
        <VisitDaySubmittedExpenseCard onOpenExpense={openExpense} />
      )}
    </>
  );
}