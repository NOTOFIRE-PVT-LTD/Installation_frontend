import { useEffect, useState } from 'react';
import { formatDuration, minutesBetween } from '../utils/attendanceFormat';

export function useLiveDuration(punchInAt, punchOutAt) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!punchInAt || punchOutAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [punchInAt, punchOutAt]);

  return formatDuration(minutesBetween(punchInAt, punchOutAt, now));
}
