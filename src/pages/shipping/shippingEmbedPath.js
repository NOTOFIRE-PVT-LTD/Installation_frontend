export function tabRootPath(tabs, tabId) {
  const tab = tabs.find((t) => t.id === tabId) || tabs[0];
  return tab?.path || '/';
}

/** True if iframe path still belongs to the selected tab (ignore stale polls). */
export function pathBelongsToTab(path, rootPath) {
  const pathOnly = String(path || '/').split('?')[0];
  const root = String(rootPath || '/').split('?')[0];
  if (pathOnly === root) return true;
  if (root === '/') return pathOnly.startsWith('/shipments/');
  if (root === '/dispatch/new') {
    return (
      pathOnly.startsWith('/dispatch/new/') ||
      pathOnly.startsWith('/shipments/')
    );
  }
  return pathOnly.startsWith(`${root}/`);
}

/** True when iframe is deeper than the selected tab's root. */
export function isDeepEmbed(embedPath, rootPath) {
  const path = String(embedPath || '/').split('?')[0];
  const root = String(rootPath || '/').split('?')[0];
  if (!path || path === root) return false;
  return pathBelongsToTab(path, root);
}
