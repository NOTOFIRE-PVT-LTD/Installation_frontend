import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { formatPlanTime } from '../../utils/readLocation';
import { formatIstTime } from '../../utils/attendanceFormat';
import { statusColor } from './adminVisitsDayBoardHelpers';

export default function AdminVisitsDayBoardDayTable({ items, onOpenVisit }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Salesperson</TableCell>
          <TableCell>Customer</TableCell>
          <TableCell>Time</TableCell>
          <TableCell>Check-in</TableCell>
          <TableCell>Check-out</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((visit) => (
          <TableRow key={visit._id} hover sx={{ cursor: 'pointer' }} onClick={() => onOpenVisit(visit._id)}>
            <TableCell sx={{ fontWeight: 700, color: '#241404' }}>{visit.salesperson?.name || '—'}</TableCell>
            <TableCell>{visit.customer?.companyName || '—'}</TableCell>
            <TableCell>
              {formatPlanTime(visit.plannedTime)}
              {visit.endTime ? ` – ${formatPlanTime(visit.endTime)}` : ''}
            </TableCell>
            <TableCell>{formatIstTime(visit.checkInAt)}</TableCell>
            <TableCell>{formatIstTime(visit.checkOutAt)}</TableCell>
            <TableCell>
              <Chip size="small" label={visit.status || '—'} color={statusColor(visit.status)} sx={{ fontWeight: 700 }} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}