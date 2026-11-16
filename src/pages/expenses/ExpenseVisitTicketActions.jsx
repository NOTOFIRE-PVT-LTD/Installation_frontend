import Button from '@mui/material/Button';

export default function ExpenseVisitTicketActions({ row, draft, privateMode, onUploadTicket }) {
  return (
    <>
      {!privateMode && draft && (
        <Button component="label" size="small" sx={{ mt: 1 }}>
          {row.ticketUrl ? 'Replace ticket' : 'Upload ticket (optional)'}
          <input
            hidden
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => onUploadTicket(row._id, e.target.files?.[0])}
          />
        </Button>
      )}
      {row.ticketUrl && (
        <Button size="small" href={row.ticketUrl} target="_blank" rel="noreferrer" sx={{ mt: 1 }}>
          View ticket
        </Button>
      )}
    </>
  );
}