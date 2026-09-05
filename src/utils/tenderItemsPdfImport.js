import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

// Header labels looked for in an uploaded tender PDF. Patterns are tried in order and the
// first one that matches a header cell claims that column, so the exact spellings used on
// the tender sheets come before the loose fallbacks.
const COLUMN_PATTERNS = {
  itemName: [
    /item\s*descript/i,
    /descript\w*\s*of\s*(the\s*)?(work|item|tender)/i,
    /name\s*of\s*(the\s*)?work/i,
    /^\s*item\s*name\s*$/i,
    /descript/i,
    /^\s*particulars?\s*$/i,
  ],
  quantity: [/item\s*qty/i, /^\s*qty\b/i, /^\s*quantity\b/i, /\bqty\b/i, /\bquantity\b/i],
  amount: [/adv?t\.?\s*value/i, /advertis\w*\s*value/i, /tender\s*value/i, /^\s*amount\b/i, /\bvalue\b/i],
};

// "Advt. Value (in Lakhs)" style units — applied to every amount read from that column.
const SCALE_PATTERNS = [
  { re: /\bcrores?\b|\bcr\.\s*\)?/i, factor: 1e7, label: 'crore' },
  { re: /\blakh?s?\b|\blacs?\b/i, factor: 1e5, label: 'lakh' },
];

const NUMBER_RE = /-?\d[\d,]*(?:\.\d+)?/;
const SERIAL_RE = /^\(?\d{1,3}\s*[.)]?\)?$/;
const TOTAL_RE = /^\s*(sub[\s-]*|grand[\s-]*)?total\b/i;
const NOISE_RE = /^\s*(page\s*\d+(\s*of\s*\d+)?|contd\.?|continued)\s*$/i;

/** Reads every page's text layer as positioned tokens (PDF space, origin bottom-left). */
async function readPageTokens(file) {
  const data = await file.arrayBuffer();
  const pdf = await getDocument({ data, disableRange: true, disableStream: true }).promise;
  const pages = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    // eslint-disable-next-line no-await-in-loop
    const page = await pdf.getPage(pageNum);
    // eslint-disable-next-line no-await-in-loop
    const content = await page.getTextContent();
    const tokens = content.items
      .filter((item) => typeof item.str === 'string' && item.str.trim())
      .map((item) => ({
        text: item.str.replace(/\s+/g, ' ').trim(),
        x: item.transform[4],
        y: item.transform[5],
        width: item.width || 0,
        height: item.height || Math.abs(item.transform[3]) || 8,
      }));
    pages.push(tokens);
  }

  return pages;
}

/** Buckets tokens sharing a baseline into rows, top of the page first. */
function groupRows(tokens) {
  const sorted = [...tokens].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows = [];

  sorted.forEach((token) => {
    const last = rows[rows.length - 1];
    const tolerance = Math.max(2.5, token.height * 0.7);
    if (last && Math.abs(last.y - token.y) <= tolerance) {
      last.tokens.push(token);
    } else {
      rows.push({ y: token.y, tokens: [token] });
    }
  });

  rows.forEach((row) => row.tokens.sort((a, b) => a.x - b.x));
  return rows;
}

/** Joins tokens separated by less than a space-ish gap into one table cell. */
function toCells(row) {
  const cells = [];
  row.tokens.forEach((token) => {
    const last = cells[cells.length - 1];
    const gap = last ? token.x - last.endX : Infinity;
    if (last && gap <= Math.max(3, token.height * 0.9)) {
      last.text = `${last.text} ${token.text}`.replace(/\s+/g, ' ').trim();
      last.endX = Math.max(last.endX, token.x + token.width);
    } else {
      cells.push({ text: token.text, x: token.x, endX: token.x + token.width });
    }
  });
  return cells;
}

/**
 * Folds a wrapped second header line into the first. A cell only joins a column it
 * substantially overlaps, and each column takes at most one cell, so a stray line of prose
 * above the table cannot swallow the whole header row.
 */
function mergeHeaderCells(first, second) {
  const merged = first.map((cell) => ({ ...cell }));
  const used = new Set();

  second.forEach((cell) => {
    const width = Math.max(1, cell.endX - cell.x);
    const index = merged.findIndex((m, i) => {
      if (used.has(i)) return false;
      const overlap = Math.min(m.endX, cell.endX) - Math.max(m.x, cell.x);
      return overlap >= Math.min(width, Math.max(1, m.endX - m.x)) * 0.5;
    });

    if (index === -1) {
      merged.push({ ...cell });
      return;
    }
    used.add(index);
    const target = merged[index];
    target.text = `${target.text} ${cell.text}`.replace(/\s+/g, ' ').trim();
    target.x = Math.min(target.x, cell.x);
    target.endX = Math.max(target.endX, cell.endX);
  });

  return merged.sort((a, b) => a.x - b.x);
}

function detectHeader(cells) {
  const fields = {};
  const claimed = new Set();

  cells.forEach((cell, index) => {
    const field = ['itemName', 'quantity', 'amount'].find(
      (key) => !claimed.has(key) && COLUMN_PATTERNS[key].some((re) => re.test(cell.text))
    );
    if (field) {
      fields[field] = index;
      claimed.add(field);
    }
  });

  const usable = fields.itemName != null && (fields.quantity != null || fields.amount != null);
  return usable ? fields : null;
}

/** Column x-ranges, split at the midpoint between neighbouring header cells. */
function columnRanges(cells) {
  return cells.map((cell, index) => {
    const prev = cells[index - 1];
    const next = cells[index + 1];
    return {
      start: prev ? (prev.endX + cell.x) / 2 : -Infinity,
      end: next ? (cell.endX + next.x) / 2 : Infinity,
    };
  });
}

/**
 * Picks the column a cell belongs to by widest overlap, so it works for both the
 * left-aligned description and the right-aligned qty / value figures.
 */
function assignColumn(cell, ranges) {
  let best = -1;
  let bestOverlap = 0;

  ranges.forEach((range, index) => {
    const start = Math.max(cell.x, range.start === -Infinity ? cell.x : range.start);
    const end = Math.min(cell.endX, range.end === Infinity ? cell.endX : range.end);
    if (end - start > bestOverlap) {
      bestOverlap = end - start;
      best = index;
    }
  });

  if (best !== -1) return best;
  const center = (cell.x + cell.endX) / 2;
  return ranges.findIndex((range) => center >= range.start && center < range.end);
}

function parseNumber(text) {
  const match = String(text || '').match(NUMBER_RE);
  if (!match) return null;
  const value = Number(match[0].replace(/,/g, ''));
  return Number.isFinite(value) ? value : null;
}

function scaleOf(text) {
  return SCALE_PATTERNS.find((scale) => scale.re.test(String(text || ''))) || null;
}

/**
 * Finds the header row on a page. Whole-row headers win over two-line ones across the
 * entire page, so a heading printed above the table is never mistaken for the top half of
 * a wrapped header.
 */
function findHeader(rows) {
  for (let i = 0; i < rows.length; i += 1) {
    const fields = detectHeader(rows[i]);
    if (fields) return { cells: rows[i], fields, nextIndex: i + 1 };
  }
  for (let i = 0; i < rows.length - 1; i += 1) {
    const cells = mergeHeaderCells(rows[i], rows[i + 1]);
    const fields = detectHeader(cells);
    if (fields) return { cells, fields, nextIndex: i + 2 };
  }
  return null;
}

function cellsByColumn(cells, ranges) {
  const byColumn = [];
  cells.forEach((cell) => {
    const index = assignColumn(cell, ranges);
    if (index < 0) return;
    byColumn[index] = byColumn[index] ? `${byColumn[index]} ${cell.text}` : cell.text;
  });
  return byColumn;
}

function extractItems(pages) {
  const items = [];
  let fields = null;
  let ranges = null;
  let headerScale = null;

  pages.forEach((tokens) => {
    if (!tokens.length) return;
    const rows = groupRows(tokens).map((row) => toCells(row));

    // Look for the header on every page — continuation pages usually repeat it. When a page
    // has none, the layout carried over from the previous page still applies.
    const header = findHeader(rows);
    let startIndex = 0;
    if (header) {
      fields = header.fields;
      ranges = columnRanges(header.cells);
      headerScale = fields.amount != null ? scaleOf(header.cells[fields.amount]?.text) : null;
      startIndex = header.nextIndex;
    }

    if (!fields || !ranges) return;

    for (let i = startIndex; i < rows.length; i += 1) {
      const byColumn = cellsByColumn(rows[i], ranges);
      const description = String(byColumn[fields.itemName] || '').trim();
      if (!description || NOISE_RE.test(description) || TOTAL_RE.test(description)) continue;

      const quantity = fields.quantity != null ? parseNumber(byColumn[fields.quantity]) : null;
      const amountText = fields.amount != null ? byColumn[fields.amount] : '';
      const amountRaw = fields.amount != null ? parseNumber(amountText) : null;
      const hasSerial = byColumn
        .slice(0, fields.itemName)
        .some((text) => text && SERIAL_RE.test(String(text).trim()));

      const current = items[items.length - 1];
      if (!hasSerial && quantity == null && amountRaw == null) {
        // A wrapped description line — glue it back onto the item above it.
        if (current) current.itemName = `${current.itemName} ${description}`.replace(/\s+/g, ' ').trim();
        continue;
      }

      const scale = scaleOf(amountText) || headerScale;
      items.push({
        itemName: description,
        quantity,
        amount: amountRaw == null ? null : Math.round(amountRaw * (scale?.factor || 1) * 100) / 100,
      });
    }
  });

  return { items, fields, amountUnit: headerScale?.label || '' };
}

/**
 * Parses the item table out of an uploaded tender PDF: Item Description → itemName,
 * Item Qty → quantity, Advt. Value → amount.
 * Returns { items: [{ itemName, quantity, amount }], amountUnit, columns }.
 * Throws an Error whose message is safe to show the user.
 */
export async function parseTenderItemsPdf(file) {
  if (!file) throw new Error('No file selected.');
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');
  if (!isPdf) throw new Error('Please upload a PDF file.');

  let pages;
  try {
    pages = await readPageTokens(file);
  } catch {
    throw new Error('Could not open that PDF — it may be corrupt or password protected.');
  }

  if (!pages.some((tokens) => tokens.length)) {
    throw new Error('This PDF has no selectable text (it looks like a scan). Enter the items manually.');
  }

  const { items, fields, amountUnit } = extractItems(pages);

  if (!fields) {
    throw new Error(
      'Could not find the item table. Expected column headings like "Item Description", "Item Qty" and "Advt. Value".'
    );
  }
  if (!items.length) {
    throw new Error('Found the item table but could not read any item rows from it.');
  }

  return {
    items,
    amountUnit,
    columns: { itemName: true, quantity: fields.quantity != null, amount: fields.amount != null },
  };
}
