import {
  faChartLine,
  faClipboardList,
  faClockRotateLeft,
  faCommentDots,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

/** SuperAdmin Workspace tabs — same SlidingPills pattern as Shipping. */
export const LEADTRACK_TABS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: faChartLine },
  { id: 'leads', label: 'Leads', path: '/leads', icon: faClipboardList },
  { id: 'users', label: 'Users', path: '/users', icon: faUsers },
  { id: 'audit', label: 'Audit Logs', path: '/audit-logs', icon: faClockRotateLeft },
  { id: 'feedback', label: 'Feedback', path: '/feedback', icon: faCommentDots },
];

/** Map an iframe pathname (e.g. /users) back to a tab id. */
export function tabIdForPath(rawPath) {
  const path = String(rawPath || '').split('?')[0].replace(/\/$/, '') || '/';
  const hit = LEADTRACK_TABS.find(
    (t) => path === t.path || path.startsWith(`${t.path}/`),
  );
  return hit?.id || null;
}
