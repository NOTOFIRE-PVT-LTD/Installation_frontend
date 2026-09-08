import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { nitTenderApi } from '../api/nitTenderApi';

GlobalWorkerOptions.workerSrc = pdfWorker;

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
 * Builds a column-aware plain-text dump so the AI can see table structure
 * (e.g. Item Desc | Item Qty | Advt. Value | Bid Amount).
 */
function pagesToAiText(pages) {
  return pages
    .map((tokens, pageIndex) => {
      if (!tokens.length) return '';
      const lines = groupRows(tokens).map((row) =>
        toCells(row)
          .map((cell) => cell.text)
          .join(' | ')
      );
      return `--- Page ${pageIndex + 1} ---\n${lines.join('\n')}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Parses tender item rows from an uploaded PDF using AI on the server.
 * Returns { items: [{ itemName, quantity, amount }], amountUnit, columns, provider }.
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

  const text = pagesToAiText(pages);
  if (!text.trim()) {
    throw new Error('Could not read text from that PDF.');
  }

  try {
    const { data } = await nitTenderApi.parseItems({ text });
    const result = data?.data || {};
    const items = Array.isArray(result.items) ? result.items : [];
    if (!items.length) {
      throw new Error('AI could not find any item rows in that PDF.');
    }

    return {
      items: items.map((item) => ({
        itemName: String(item.itemName || '').trim(),
        quantity: item.quantity ?? null,
        amount: item.amount ?? null,
      })),
      amountUnit: result.amountUnit || '',
      provider: result.provider || 'ai',
      columns: {
        itemName: true,
        quantity: items.some((item) => item.quantity != null),
        amount: items.some((item) => item.amount != null),
      },
    };
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Could not extract items from that PDF with AI.';
    throw new Error(message);
  }
}
