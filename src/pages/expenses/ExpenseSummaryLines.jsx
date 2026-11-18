import Typography from '@mui/material/Typography';
import { PRIVATE_KM_RATE } from '../../utils/constants';

export default function ExpenseSummaryLines({
  perVisitMode,
  privateKm,
  privateAmount,
  publicAmount,
  dayTotalAmount,
}) {
  if (perVisitMode) {
    return (
      <>
        <Typography>
          Private travel: {privateKm} km × ₹{PRIVATE_KM_RATE}/km = ₹{privateAmount.toLocaleString('en-IN')}
        </Typography>
        <Typography>Public transport fares: ₹{publicAmount.toLocaleString('en-IN')}</Typography>
      </>
    );
  }

  return <Typography>Day total claim: ₹{dayTotalAmount.toLocaleString('en-IN')}</Typography>;
}