/** Drop both-apps-only items (e.g. Home → /apps) until access says both. */
export function filterPortalNavItems(items, { bothApps, ready }) {
  if (!ready || !bothApps) {
    return items.filter((item) => !item.bothAppsOnly);
  }
  return items;
}
