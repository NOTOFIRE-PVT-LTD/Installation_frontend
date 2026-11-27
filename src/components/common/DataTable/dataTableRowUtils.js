const MONGO_ID_RE = /^[a-f\d]{24}$/i;

export function getRowKey(row) {
  const raw = row?._id ?? row?.id;
  if (raw == null) return '';
  if (typeof raw === 'object' && raw.toString && raw.toString !== Object.prototype.toString) {
    return String(raw.toString());
  }
  return String(raw);
}

export function extractSelectedRowIds(model, rows = []) {
  if (model == null) return [];
  let rawIds = [];
  if (Array.isArray(model)) rawIds = model;
  else if (model.ids instanceof Set) {
    if (model.type === 'exclude') {
      const excluded = model.ids;
      rawIds = (rows || [])
        .map(getRowKey)
        .filter((id) => id && !excluded.has(id) && !excluded.has(Number(id)));
    } else rawIds = [...model.ids];
  } else if (Array.isArray(model.ids)) rawIds = model.ids;

  return [
    ...new Set(rawIds.map((id) => String(id ?? '').trim()).filter((id) => MONGO_ID_RE.test(id))),
  ];
}

export function loadStoredVisibility(storageKey) {
  if (!storageKey) return {};
  try {
    const saved = localStorage.getItem(`datatable-columns-${storageKey}`);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}
