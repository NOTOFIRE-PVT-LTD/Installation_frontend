export function matchComplaintsDesk(pathname, item) {
  if (item.path !== '/complaints/desk') return null;
  return pathname === '/complaints/desk';
}

export function matchComplaintsDashboard(pathname, item) {
  if (item.path !== '/complaints/dashboard') return null;
  return pathname === '/complaints/dashboard';
}

export function matchComplaintsHub(pathname, item) {
  if (item.path !== '/complaints') return null;
  if (pathname === '/complaints/desk' || pathname === '/complaints/dashboard') return false;
  return (
    pathname === '/complaints' ||
    pathname.startsWith('/complaints/') ||
    pathname === '/support' ||
    pathname.startsWith('/support/') ||
    pathname === '/submit' ||
    pathname === '/track'
  );
}

export function matchComplaintsItem(pathname, item) {
  const desk = matchComplaintsDesk(pathname, item);
  if (desk !== null) return desk;
  const dashboard = matchComplaintsDashboard(pathname, item);
  if (dashboard !== null) return dashboard;
  return matchComplaintsHub(pathname, item);
}