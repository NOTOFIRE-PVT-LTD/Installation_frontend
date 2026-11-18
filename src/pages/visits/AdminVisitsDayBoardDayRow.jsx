import { useNavigate } from 'react-router-dom';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import AdminVisitsDayBoardDayHeader from './AdminVisitsDayBoardDayHeader';
import AdminVisitsDayBoardDayTable from './AdminVisitsDayBoardDayTable';

export default function AdminVisitsDayBoardDayRow({ date, items, names, today, open, onToggle }) {
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '14px',
        border: date === today ? '1.5px solid #D4A34E' : '1px solid #E2D3BE',
        overflow: 'hidden',
        bgcolor: '#FFFDF8',
      }}
    >
      <AdminVisitsDayBoardDayHeader
        date={date}
        items={items}
        names={names}
        today={today}
        open={open}
        onToggle={onToggle}
      />
      <Collapse in={open}>
        <AdminVisitsDayBoardDayTable items={items} onOpenVisit={(id) => navigate(`/visits/${id}`)} />
      </Collapse>
    </Paper>
  );
}