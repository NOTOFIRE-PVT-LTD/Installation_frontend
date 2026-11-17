import Stack from '@mui/material/Stack';
import ExpensePerVisitItemCard from './ExpensePerVisitItemCard';

export default function ExpensePerVisitItems({ liveItems, draft, onPatchItem, onUploadTicket }) {
  return (
    <Stack spacing={1.5}>
      {liveItems.map((row, index) => (
        <ExpensePerVisitItemCard
          key={row._id}
          row={row}
          index={index}
          draft={draft}
          onPatchItem={onPatchItem}
          onUploadTicket={onUploadTicket}
        />
      ))}
    </Stack>
  );
}