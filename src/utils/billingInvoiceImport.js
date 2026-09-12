import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { billingApi } from '../api/billingApi';

GlobalWorkerOptions.workerSrc = pdfWorker;

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

export async function parseBillingLoaPdf(file, party) {
  if (!file) throw new Error('No file selected.');
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');
  if (!isPdf) throw new Error('Please upload a PDF LOA.');

  let pages;
  try {
    pages = await readPageTokens(file);
  } catch {
    throw new Error('Could not open that PDF — it may be corrupt or password protected.');
  }

  if (!pages.some((tokens) => tokens.length)) {
    throw new Error('This PDF has no selectable text (it looks like a scan).');
  }

  const text = pagesToAiText(pages);
  if (!text.trim()) throw new Error('Could not read text from that PDF.');

  try {
    const { data } = await billingApi.parseLoa({
      text,
      fileName: file.name || '',
      party,
    });
    return data?.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || 'Could not parse that LOA with AI.'
    );
  }
}

export async function downloadBillingExcel(params = {}) {
  const { data } = await billingApi.downloadExcel(params);
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `billing-${(params.party || 'all').toLowerCase()}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
