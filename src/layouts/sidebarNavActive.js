import { matchComplaintsItem } from './sidebarNavActiveComplaints';

function matchQueryTabItem(location, item) {
  const pathname = location.pathname;
  const [itemPath, itemQuery] = item.path.split('?');
  if (!itemQuery) return null;
  if (pathname !== itemPath) return false;
  const want = new URLSearchParams(itemQuery).get('tab');
  const have = new URLSearchParams(location.search || '').get('tab');
  return (have || 'home') === (want || 'home');
}

function matchAttendanceItem(pathname, item) {
  if (item.path !== '/attendance') return null;
  return (
    pathname === '/attendance' ||
    pathname.startsWith('/attendance/') ||
    pathname === '/salesperson-tracking' ||
    pathname.startsWith('/salesperson-tracking/')
  );
}

function matchVisitsItem(pathname, item) {
  if (item.path === '/visits/today') return pathname === '/visits/today';
  if (item.path === '/visits/new') return pathname === '/visits/new';
  if (item.path === '/visits') {
    return (
      pathname === '/visits' ||
      (pathname.startsWith('/visits/') && pathname !== '/visits/new' && pathname !== '/visits/today')
    );
  }
  return null;
}

function matchSimplePathItem(pathname, item) {
  if (item.path === '/expenses') return pathname === '/expenses' || pathname.startsWith('/expenses/');
  if (item.path === '/my-approvals') return pathname === '/my-approvals';
  if (pathname === item.path || pathname.startsWith(`${item.path}/`)) return true;
  return false;
}

export function isSidebarItemActive(location, item) {
  const queryMatch = matchQueryTabItem(location, item);
  if (queryMatch !== null) return queryMatch;

  const pathname = location.pathname;
  const complaints = matchComplaintsItem(pathname, item);
  if (complaints !== null) return complaints;

  const attendance = matchAttendanceItem(pathname, item);
  if (attendance !== null) return attendance;

  const visits = matchVisitsItem(pathname, item);
  if (visits !== null) return visits;

  return matchSimplePathItem(pathname, item);
}