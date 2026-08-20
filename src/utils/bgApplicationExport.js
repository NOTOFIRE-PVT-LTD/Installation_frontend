import { jsPDF } from 'jspdf';
import { formatDate } from './formatters';
import { pdfText, dash, pdfCurrency, ensureSpace, safeFilePart } from './stationReportExport';
import { HDFC_LOGO_BASE64 } from '../assets/hdfcLogoBase64';

const BG_TYPE_OPTIONS = ['Physical BG', 'FCY BG', 'e-BG', 'GEM BG'];

const MARGIN = 10;
const COL_GAP = 5;
const SECTION_GAP = 4.2;
const HEADER_BLUE = [15, 50, 120];
const LABEL_COLOR = [71, 85, 105];
const VALUE_COLOR = [15, 23, 42];
const BOX_LINE = [180, 188, 198];
const SECTION_BORDER = [190, 196, 204];

const DECLARATION_ITEMS = [
  'i) I/We hereby authorise HDFC Bank Ltd to mark lien on Deposit accounts which are /will be kept as margin money against the Bank Guarantee.',
  'ii) I/We hereby agree and confirm that the above Bank Guarantee is subject to the terms and conditions as contained herein and in the sanction letter for the bank Guarantee entered into between the applicant and The Bank.',
  'iii) I/We, am/are fully aware that in the event of invocation of Bank Guarantee (BG) by beneficiary, HDFC Bank Ltd is entitled to make the payment immediately to the beneficiary by debiting my/our operative account (CC/OD/CA), notwithstanding any dispute that I/we might have with the beneficiary.',
  'iv) I/We hereby agree that margin money would be released by the Bank only on receipt of the Original Bank Guarantee along with discharge letter/ no claim letter from the Beneficiary.',
];
const DECLARATION_ITEMS_AFTER_CLAIM = [
  'vi) In case said BG is issued with Continuing clause, we authorize the bank to keep guarantee active for a further period of six months from earlier expiry date on every subsequent expiry date till the time original guarantee (including all amendments) along with beneficiary discharge letter is submitted to the bank for cancellation.',
  'vii) In case of the said BG being issued on an auto renewal basis, I/We hereby authorize the Bank to debit My/Our account(s) with the Bank towards commission for renewal of the said BG.',
  'viii) In case said BG is having governing law as URDG 758, we understand the implications related to the same and authorising bank to issue the bank guarantee with governing rule as URDG 758. We also confirm that the underlying text of the BG has beneficiary consent.',
  'ix) In case said BG is issued in Foreign Currency with Foreign Jurisdiction Clause whether in bank guarantee or counter bank guarantee, we will indemnify bank against all cost/ charges/ damages/ expenses which bank may incur in contesting any legal proceeding before foreign court.',
  'x) I am/ We are aware that Bank is required to provide 1-year additional claim period over the expiry date or the claim period as mentioned in the Bank Guarantee, whichever is later as per law. Accordingly, Bank is liable to make payment to Beneficiary if the claim is made within the above additional claim period. Hence, I/we authorize the Bank to block/continue the limit and hold margin/security provided by us during the additional claim period',
  'xi) I/We further confirm that all the documents/fixed deposit/margin submitted/furnished by us for issuance of the Bank Guarantee in favor of the Bank will continue to be in force and effect and shall be binding on me/us till I/we submit the Original Bank Guarantee and discharge letter from the Beneficiary to the Bank for cancellation.',
  'xii) I/We acknowledge and agree that the Bank shall be entitled to recover the commission for the additional claim period by debiting my/our account.',
];

function cols(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const fullWidth = pageWidth - MARGIN * 2;
  const width = (fullWidth - COL_GAP) / 2;
  return { left: MARGIN, right: MARGIN + width + COL_GAP, width, fullWidth };
}

function versionFooter(doc) {
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont('times', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(160, 166, 174);
    doc.text('Version 2.0 06-Nov-23', pageWidth - MARGIN, pageHeight - 4, { align: 'right' });
  }
}

function drawFormHeader(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.addImage(HDFC_LOGO_BASE64, 'PNG', MARGIN, 7, 52, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...VALUE_COLOR);
  doc.text('APPLICATION FOR BANK GUARANTEE', pageWidth / 2, 26, { align: 'center' });
  return 34;
}

function drawBoxedSection(doc, number, title, y, contentFn, { bordered = true, gap = SECTION_GAP, contentOffset = 7.5, allowNewPage = true } = {}) {
  if (allowNewPage) y = ensureSpace(doc, y, 18);
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxLeft = MARGIN - 2;
  const boxWidth = pageWidth - (MARGIN - 2) * 2;
  const startY = y;
  const startPage = doc.internal.getNumberOfPages();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...HEADER_BLUE);
  doc.text(pdfText(number ? `${number}. ${title}` : title), boxLeft + 3, y + 4);

  const contentY = contentFn(y + contentOffset);
  const endPage = doc.internal.getNumberOfPages();

  if (bordered) {
    doc.setDrawColor(...SECTION_BORDER);
    doc.setLineWidth(0.25);
    if (endPage === startPage) {
      doc.rect(boxLeft, startY - 1.5, boxWidth, contentY - startY + 2.2);
    } else {
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setPage(startPage);
      doc.rect(boxLeft, startY - 1.5, boxWidth, pageHeight - 10 - (startY - 1.5));
      doc.setPage(endPage);
      doc.rect(boxLeft, 8, boxWidth, contentY - 8 + 2.2);
    }
  }

  return contentY + gap;
}

function drawPage2BankDetailsBox(doc, number, title, y, nameAddress, ifscSwift, c) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxLeft = MARGIN - 2;
  const boxWidth = pageWidth - (MARGIN - 2) * 2;
  const startY = y;
  const gutter = 6;
  const nameW = c.fullWidth * 0.52;
  const ifscX = c.left + nameW + gutter;
  const ifscW = c.left + c.fullWidth - ifscX;
  const nameH = 14.8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...HEADER_BLUE);
  doc.text(pdfText(`${number}. ${title}`), boxLeft + 3, y + 4);

  const labelY = y + 7.2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...LABEL_COLOR);
  doc.text('Name & Address', c.left, labelY);
  doc.text('IFSC / SWIFT code', ifscX, labelY);

  const boxY = labelY + 1.3;
  doc.setDrawColor(...BOX_LINE);
  doc.setLineWidth(0.2);
  doc.rect(c.left, boxY, nameW, nameH);
  doc.rect(ifscX, boxY, ifscW, 5.6);

  const nameLines = wrapFieldLines(doc, nameAddress, nameW);
  if (nameLines.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.4);
    doc.setTextColor(...VALUE_COLOR);
    doc.text(nameLines.slice(0, 4), c.left + 2, boxY + 3.4);
  }
  const ifscValue = pdfText(ifscSwift);
  if (ifscValue && ifscValue !== '-') {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...VALUE_COLOR);
    doc.text(ifscValue, ifscX + 2, boxY + 3.8, { maxWidth: ifscW - 4 });
  }

  const bottom = boxY + nameH + 2.2;
  doc.setDrawColor(...SECTION_BORDER);
  doc.setLineWidth(0.25);
  doc.rect(boxLeft, startY - 1.5, boxWidth, bottom - startY + 1.2);
  return bottom + 3.4;
}

function drawMarginDetailsBox(doc, app, y, c) {
  // Stay on the current page — page 2 must not spill onto a third sheet.
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxLeft = MARGIN - 2;
  const boxWidth = pageWidth - (MARGIN - 2) * 2;
  const startY = y;
  const midX = MARGIN + c.fullWidth * 0.58;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...HEADER_BLUE);
  doc.text('9. Margin Details', boxLeft + 3, y + 4);
  doc.text('New FD', midX + 4, y + 4);

  const contentY = y + 8;
  const contentLeft = c.left + 8;
  const leftColW = midX - contentLeft - 4;
  const fdW = (leftColW - COL_GAP) / 2;
  const stay = { allowNewPage: false };
  let leftY = drawInlineBox(doc, contentLeft, contentY, fdW, 'FD No', app.marginFdNo, { labelWidth: 14, height: 5.5, ...stay });
  const amtY = drawInlineBox(
    doc,
    contentLeft + fdW + COL_GAP,
    contentY,
    fdW,
    'Amount',
    pdfCurrency(app.marginFdAmount),
    { labelWidth: 16, height: 5.5, ...stay }
  );
  leftY = Math.max(leftY, amtY);
  leftY = drawInlineBox(doc, contentLeft, leftY, fdW, 'Other', app.marginOther, { labelWidth: 14, height: 5.5, ...stay });

  const rightW = c.left + c.fullWidth - midX - 4;
  let rightY = drawInlineBox(doc, midX + 4, contentY, rightW, 'Debit A/C', app.marginNewFdDebitAccount, {
    labelWidth: 20,
    height: 5.5,
    ...stay,
  });
  rightY = drawInlineBox(doc, midX + 4, rightY, rightW, 'Amount', pdfCurrency(app.marginNewFdAmount), {
    labelWidth: 20,
    height: 5.5,
    ...stay,
  });

  const bottom = Math.max(leftY, rightY);
  doc.setDrawColor(...SECTION_BORDER);
  doc.setLineWidth(0.25);
  doc.rect(boxLeft, startY - 1.5, boxWidth, bottom - startY + 3);
  doc.line(midX, startY - 1.5, midX, bottom + 1.5);
  return bottom + 3.5;
}

function drawParagraphs(doc, paragraphs, y, fontSize = 6.2, indent = MARGIN, { lineHeight = 2.6, paraGap = 1.3, allowNewPage = true, color = LABEL_COLOR, fontStyle = 'normal' } = {}) {
  const width = doc.internal.pageSize.getWidth() - indent - MARGIN;
  doc.setFont('helvetica', fontStyle);
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  paragraphs.forEach((text) => {
    const lines = doc.splitTextToSize(text, width);
    const block = lines.length * lineHeight + paraGap;
    if (allowNewPage) y = ensureSpace(doc, y, block);
    doc.text(lines, indent, y);
    y += block;
  });
  return y;
}

function measureDeclarationList(doc, clauses, fontSize, lineHeight, paraGap, { listLeft = 6 } = {}) {
  const textW = doc.internal.pageSize.getWidth() - MARGIN * 2 - listLeft;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  return clauses.reduce((sum, text, idx) => {
    const gap = idx === clauses.length - 1 ? 0 : paraGap;
    return sum + doc.splitTextToSize(text, textW).length * lineHeight + gap;
  }, 0);
}

function drawDeclarationList(doc, clauses, y, { fontSize = 6.2, lineHeight = 2.7, paraGap = 2.6, listLeft = 6 } = {}) {
  const textX = MARGIN + listLeft;
  const textW = doc.internal.pageSize.getWidth() - MARGIN - textX;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(...VALUE_COLOR);
  clauses.forEach((text, idx) => {
    const lines = doc.splitTextToSize(text, textW);
    doc.text(lines, textX, y);
    y += lines.length * lineHeight + (idx === clauses.length - 1 ? 0 : paraGap);
  });
  return y;
}

// A bordered box with its label ABOVE it — used for multi-line fields like Name & Address.
function wrapFieldLines(doc, value, width, fontSize = 6.4) {
  const rawValue = pdfText(value);
  if (!rawValue || rawValue === '-') return [];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(rawValue, Math.max(12, width - 4));
}

function stackedBoxHeight(doc, width, value, minHeight) {
  const lines = wrapFieldLines(doc, value, width);
  return Math.max(minHeight, 3.6 + Math.max(lines.length, 1) * 2.85);
}

function drawStackedBox(doc, x, y, width, height, label, value, { maxHeight, allowNewPage = true, labelIndent = 0 } = {}) {
  const lines = wrapFieldLines(doc, value, width);
  let boxHeight = Math.max(height, 3.6 + Math.max(lines.length, 1) * 2.85);
  if (maxHeight) boxHeight = Math.min(boxHeight, maxHeight);
  if (allowNewPage) y = ensureSpace(doc, y, boxHeight + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...LABEL_COLOR);
  doc.text(pdfText(label), x + labelIndent, y);
  const boxY = y + 1.2;
  doc.setDrawColor(...BOX_LINE);
  doc.setLineWidth(0.2);
  doc.rect(x, boxY, width, boxHeight);
  if (lines.length) {
    const maxLines = Math.max(1, Math.floor((boxHeight - 2) / 2.85));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.4);
    doc.setTextColor(...VALUE_COLOR);
    doc.text(lines.slice(0, maxLines), x + 2, boxY + 3.4);
  }
  return boxY + boxHeight + 3;
}

// A bordered box with its label to the LEFT — used for short single-line fields.
function drawInlineBox(doc, x, y, width, label, value, { labelWidth = 34, height = 5.2, allowNewPage = true } = {}) {
  if (allowNewPage) y = ensureSpace(doc, y, height + 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...LABEL_COLOR);
  const labelText = pdfText(label);
  if (doc.getTextWidth(labelText) <= labelWidth) {
    doc.text(labelText, x, y + height / 2 + 1.1);
  } else {
    const labelLines = doc.splitTextToSize(labelText, Math.max(8, labelWidth - 1));
    doc.text(labelLines, x, y + height / 2 + (labelLines.length > 1 ? -1 : 1.1));
  }
  const boxX = x + labelWidth;
  const boxWidth = width - labelWidth;
  doc.setDrawColor(...BOX_LINE);
  doc.setLineWidth(0.2);
  doc.rect(boxX, y, boxWidth, height);
  const rawValue = pdfText(value);
  if (rawValue && rawValue !== '-') {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...VALUE_COLOR);
    doc.text(rawValue, boxX + 2, y + height / 2 + 1.1, { maxWidth: boxWidth - 4 });
  }
  return y + height + 2.2;
}

function drawSegmentedBoxes(doc, label, value, boxes, y, { x = MARGIN, boxSize = 4.6 } = {}) {
  y = ensureSpace(doc, y, 12);
  if (label) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(...LABEL_COLOR);
    doc.text(pdfText(label), x, y);
    y += 2.5;
  }

  const chars = String(value || '').split('');
  const gap = 0;
  let bx = x;

  doc.setDrawColor(...BOX_LINE);
  doc.setLineWidth(0.2);
  for (let i = 0; i < boxes; i += 1) {
    doc.rect(bx, y, boxSize, boxSize);
    const ch = chars[i] || '';
    if (ch) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...VALUE_COLOR);
      doc.text(pdfText(ch), bx + boxSize / 2, y + boxSize / 2 + 1.2, { align: 'center' });
    }
    bx += boxSize + gap;
  }
  return y + boxSize + 3;
}

// Renders a date value as D D M M Y Y Y Y single-character boxes.
function drawDateBoxes(doc, label, isoValue, y, opts = {}) {
  const match = isoValue ? String(isoValue).match(/^(\d{4})-(\d{2})-(\d{2})/) : null;
  const digits = match ? `${match[3]}${match[2]}${match[1]}` : '';
  return drawSegmentedBoxes(doc, label, digits, 8, y, opts);
}

function drawCheckboxGroup(doc, options, selected, y, { columns = null, x = MARGIN } = {}) {
  y = ensureSpace(doc, y, 10);
  const boxSize = 3.4;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxX = pageWidth - MARGIN;
  let bx = x;

  options.forEach((option, idx) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const label = pdfText(option);
    const labelWidth = doc.getTextWidth(label);
    const itemWidth = boxSize + 1.5 + labelWidth + 8;

    const forceBreak = columns ? idx % columns === 0 && idx !== 0 : bx + itemWidth > maxX;
    if (forceBreak) {
      bx = x;
      y += 6;
      y = ensureSpace(doc, y, 8);
    }

    const checked = option === selected;
    drawCheckbox(doc, bx, y, checked);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...VALUE_COLOR);
    doc.text(label, bx + boxSize + 1.5, y - 0.5);
    bx += itemWidth;
  });

  return y + 4;
}

function drawCheckbox(doc, x, y, checked) {
  const boxSize = 3.4;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.25);
  doc.rect(x, y - boxSize, boxSize, boxSize);
  if (checked) {
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.55);
    doc.line(x + 0.55, y - boxSize + 1.75, x + 1.35, y - 0.65);
    doc.line(x + 1.35, y - 0.65, x + boxSize - 0.45, y - boxSize + 0.55);
  }
  return boxSize;
}

function drawNatureGrid(doc, selected, y, { x = MARGIN, width }) {
  // Official form: compact 3 columns (not stretched edge-to-edge), 2 rows.
  const colWidth = Math.min(width / 3, 56);
  const rowGap = 7.2;
  const columns = [
    ['Financial Guarantee', 'Advance Payment Guarantee'],
    ['Performance Guarantee', 'Others'],
    ['Deferred Payment Guarantee'],
  ];
  let maxY = y;
  columns.forEach((col, colIdx) => {
    let cy = y;
    const cx = x + colIdx * colWidth;
    col.forEach((option) => {
      drawCheckboxOption(doc, cx, cy, option, option === selected);
      cy += rowGap;
    });
    maxY = Math.max(maxY, cy);
  });
  return maxY;
}

function drawBgTenor(doc, x, y, years, months) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...LABEL_COLOR);
  doc.text('BG Tenor', x, y + 3.4);
  const boxesX = x + 22;
  const boxSize = 4.2;
  const rowY = y + boxSize;
  let bx = drawInlineSegmentedBoxes(
    doc,
    String(years ?? '').padStart(2, '0'),
    2,
    boxesX,
    rowY,
    { boxSize }
  );
  const monthsX = bx + 5;
  drawInlineSegmentedBoxes(doc, String(months ?? '').padStart(2, '0'), 2, monthsX, rowY, { boxSize });

  // Labels below boxes (no border) — Year / Months
  const labelY = rowY + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...VALUE_COLOR);
  doc.text('Year', boxesX + boxSize, labelY, { align: 'center' });
  doc.text('Months', monthsX + boxSize, labelY, { align: 'center' });
  return labelY + 2.2;
}

// A single checkbox + label on one line (baseline-anchored at y). Returns the x position
// right after the label, so a caller can continue drawing on the same row (e.g. digit boxes).
function drawCheckboxOption(doc, x, y, label, checked) {
  const boxSize = drawCheckbox(doc, x, y, checked);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...VALUE_COLOR);
  const text = pdfText(label);
  doc.text(text, x + boxSize + 1.5, y - 0.5);
  return x + boxSize + 1.5 + doc.getTextWidth(text);
}

// Digit boxes drawn inline on the same baseline as a preceding checkbox option (no own label).
function drawInlineSegmentedBoxes(doc, value, boxes, x, y, { boxSize = 4.2, placeholders = [] } = {}) {
  const chars = String(value || '').split('');
  const gap = 0;
  const boxY = y - boxSize + 0.6;
  let bx = x;

  doc.setDrawColor(...BOX_LINE);
  doc.setLineWidth(0.2);
  for (let i = 0; i < boxes; i += 1) {
    doc.rect(bx, boxY, boxSize, boxSize);
    const ch = chars[i] || '';
    if (ch) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...VALUE_COLOR);
      doc.text(pdfText(ch), bx + boxSize / 2, boxY + boxSize / 2 + 1.2, { align: 'center' });
    } else if (placeholders[i]) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.2);
      doc.setTextColor(190, 196, 204);
      doc.text(placeholders[i], bx + boxSize / 2, boxY + boxSize / 2 + 1.1, { align: 'center' });
    }
    bx += boxSize + gap;
  }
  return bx;
}

function drawLeftLabelBox(doc, x, y, width, label, value, { labelWidth = 28, height = 10, maxHeight, allowNewPage = true } = {}) {
  const boxWidth = width - labelWidth;
  const lines = wrapFieldLines(doc, value, boxWidth);
  let boxHeight = Math.max(height, 3.6 + Math.max(lines.length, 1) * 2.85);
  if (maxHeight) boxHeight = Math.min(boxHeight, maxHeight);
  if (allowNewPage) y = ensureSpace(doc, y, boxHeight + 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...LABEL_COLOR);
  doc.text(pdfText(label), x, y + 3.2);
  const boxX = x + labelWidth;
  doc.setDrawColor(...BOX_LINE);
  doc.setLineWidth(0.2);
  doc.rect(boxX, y, boxWidth, boxHeight);
  if (lines.length) {
    const maxLines = Math.max(1, Math.floor((boxHeight - 2) / 2.85));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.4);
    doc.setTextColor(...VALUE_COLOR);
    doc.text(lines.slice(0, maxLines), boxX + 2, y + 3.4);
  }
  return y + boxHeight + 2.2;
}

function drawEvenCheckboxRow(doc, options, selected, y, x, width) {
  // Official form Type of BG: left-aligned with even gaps (not full-width columns).
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const boxSize = 3.4;
  const labelGap = 1.5;
  const itemGap = 18;
  const widths = options.map((option) => boxSize + labelGap + doc.getTextWidth(pdfText(option)));
  const total = widths.reduce((sum, w) => sum + w, 0) + itemGap * Math.max(options.length - 1, 0);
  const gap = total <= width ? itemGap : Math.max(6, (width - widths.reduce((sum, w) => sum + w, 0)) / Math.max(options.length - 1, 1));
  let bx = x;
  options.forEach((option, idx) => {
    drawCheckboxOption(doc, bx, y, option, option === selected);
    bx += widths[idx] + gap;
  });
  return y + 5;
}

// A label to the left spanning the full height of several stacked single-line boxes to its
// right — matches the original form's "Amount (Rs/FCY) in figures & in words" field.
function drawSharedLabelBoxes(doc, x, width, label, values, y, { labelWidth = 46, heights = [5.5, 8], gap = 1.4, allowNewPage = true } = {}) {
  const boxHeights = values.map((_, i) => heights[i] ?? heights[heights.length - 1] ?? 5.5);
  const totalHeight = boxHeights.reduce((sum, h) => sum + h, 0) + gap * Math.max(values.length - 1, 0);
  if (allowNewPage) y = ensureSpace(doc, y, totalHeight + 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...LABEL_COLOR);
  const labelLines = Array.isArray(label) ? label : doc.splitTextToSize(pdfText(label), labelWidth - 2);
  const lineH = 2.7;
  const textStartY = y + totalHeight / 2 - ((labelLines.length - 1) * lineH) / 2 + 1;
  doc.text(labelLines, x, textStartY);

  const boxX = x + labelWidth;
  const boxWidth = width - labelWidth;
  doc.setDrawColor(...BOX_LINE);
  doc.setLineWidth(0.2);
  let by = y;
  values.forEach((val, idx) => {
    const h = boxHeights[idx];
    doc.rect(boxX, by, boxWidth, h);
    const rawValue = pdfText(val);
    if (rawValue && rawValue !== '-') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...VALUE_COLOR);
      if (idx === 0) {
        doc.text(rawValue, boxX + 2, by + h / 2 + 1.1, { maxWidth: boxWidth - 4 });
      } else {
        const lines = doc.splitTextToSize(rawValue, boxWidth - 4);
        doc.text(lines.slice(0, 2), boxX + 2, by + 3.2);
      }
    }
    by += h + gap;
  });

  return y + totalHeight + 2.2;
}

// A date's D D M M Y Y Y Y digit boxes drawn on the same row as its label (label to the
// left), matching the on-screen SegmentedDateField's `inline` mode.
function drawInlineDateBoxes(doc, x, y, label, isoValue, { labelWidth = 30, boxSize = 4.2, allowNewPage = true } = {}) {
  if (allowNewPage) y = ensureSpace(doc, y, boxSize + 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...LABEL_COLOR);
  doc.text(pdfText(label), x, y + boxSize / 2 + 1.1);

  const match = isoValue ? String(isoValue).match(/^(\d{4})-(\d{2})-(\d{2})/) : null;
  const digits = match ? `${match[3]}${match[2]}${match[1]}` : '';
  drawInlineSegmentedBoxes(doc, digits, 8, x + labelWidth, y + boxSize, {
    boxSize,
    placeholders: ['D', 'D', 'M', 'M', 'Y', 'Y', 'Y', 'Y'],
  });

  return y + boxSize + 0.8;
}

function drawLabeledConnectedBoxes(doc, x, y, label, value, boxes, { boxSize = 4.4 } = {}) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...LABEL_COLOR);
  doc.text(pdfText(label), x, y + boxSize / 2 + 1.3);
  const startX = x + doc.getTextWidth(pdfText(label)) + 3;
  drawInlineSegmentedBoxes(doc, value, boxes, startX, y + boxSize, { boxSize });
  return y + boxSize;
}

export function downloadBgApplicationPdf(app) {
  if (!app) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const c = cols(doc);
  let y = drawFormHeader(doc);

  y = drawLabeledConnectedBoxes(doc, c.left, y, 'Account number', app.accountNumber, 14, { boxSize: 4.5 });
  y += 8;
  {
    const rowY = y;
    const codeBox = 4.5;
    drawLabeledConnectedBoxes(doc, c.left, rowY, 'Branch Code', app.branchCode, 5, { boxSize: codeBox });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...LABEL_COLOR);
    const nameLabel = 'Branch Name';
    const codeBoxesEnd = c.left + doc.getTextWidth('Branch Code') + 3 + 5 * codeBox;
    const nameLabelX = Math.max(c.left + 62, codeBoxesEnd + 8);
    const nameBoxH = codeBox;
    const nameBoxY = rowY + 0.6;
    doc.text(nameLabel, nameLabelX, nameBoxY + nameBoxH / 2 + 1.1);
    const nameBoxX = nameLabelX + doc.getTextWidth(nameLabel) + 2;
    const nameBoxW = 68;
    doc.setDrawColor(...BOX_LINE);
    doc.setLineWidth(0.2);
    doc.rect(nameBoxX, nameBoxY, nameBoxW, nameBoxH);
    const branchName = pdfText(app.branchName);
    if (branchName && branchName !== '-') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...VALUE_COLOR);
      doc.text(branchName, nameBoxX + 2, nameBoxY + nameBoxH / 2 + 1.1, { maxWidth: nameBoxW - 4 });
    }
    y = rowY + 12;
  }

  const page1 = { allowNewPage: false, gap: 3.2, contentOffset: 6.5 };
  const capBox = { allowNewPage: false };

  y = drawBoxedSection(doc, 1, 'Type of Application', y, (cy) => {
    cy += 4;
    drawCheckboxOption(doc, c.left, cy, 'Fresh Issuance', app.typeOfApplication === 'Fresh Issuance');
    cy += 8;
    const afterLabelX = drawCheckboxOption(
      doc,
      c.left,
      cy,
      'Amendment (Existing Guarantee Number)',
      app.typeOfApplication === 'Amendment'
    );
    drawInlineSegmentedBoxes(doc, app.amendmentExistingGuaranteeNumber, 15, afterLabelX + 3, cy, { boxSize: 4.2 });
    return cy + 4;
  }, page1);

  y = drawBoxedSection(doc, 2, 'Applicant Details', y, (cy) => {
    const nameCap = { maxHeight: 12, allowNewPage: false };
    const leftY = drawStackedBox(doc, c.left, cy, c.width, 11, 'Name & Address', app.applicantNameAddress, nameCap);
    const rightY = drawStackedBox(
      doc,
      c.right,
      cy,
      c.width,
      11,
      'Contact Person Name & Mobile No.',
      app.applicantContactPersonMobile,
      nameCap
    );
    cy = Math.max(leftY, rightY) + 1.8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    const smallBoxW = 28;
    const panLabelW = 14;
    const panFieldW = panLabelW + smallBoxW;
    const dateLabel = 'Date of Incorporation';
    const dateLabelW = doc.getTextWidth(dateLabel) + 2.2;
    const dateFieldW = dateLabelW + smallBoxW;
    const dateX = c.left + panFieldW + 3.5;
    const leiX = dateX + dateFieldW + 3.5;
    const panY = drawInlineBox(doc, c.left, cy, panFieldW, 'PAN No', app.applicantPan, {
      labelWidth: panLabelW,
      height: 5.5,
      ...capBox,
    });
    const dateY = drawInlineBox(
      doc,
      dateX,
      cy,
      dateFieldW,
      dateLabel,
      app.applicantDateOfIncorporation ? formatDate(app.applicantDateOfIncorporation) : '',
      { labelWidth: dateLabelW, height: 5.5, ...capBox }
    );
    const leiY = drawInlineBox(doc, leiX, cy, c.left + c.fullWidth - leiX, 'LEI Code', app.applicantLeiCode, {
      labelWidth: 16,
      height: 5.5,
      ...capBox,
    });
    cy = Math.max(panY, dateY, leiY) + 2.2;

    const emailY = drawStackedBox(doc, c.left, cy, c.width, 5.2, 'Email ID', app.applicantEmail, {
      maxHeight: 5.4,
      allowNewPage: false,
      labelIndent: 6.5,
    });
    const regY = drawStackedBox(doc, c.right, cy, c.width, 8.5, 'Registered Address', app.applicantRegisteredAddress, {
      maxHeight: 9.5,
      allowNewPage: false,
    });
    return Math.max(emailY, regY);
  }, page1);

  y = drawBoxedSection(doc, 3, 'Nature of Bank Guarantee', y, (cy) =>
    drawNatureGrid(doc, app.natureOfBankGuarantee, cy + 2.2, {
      x: c.left + 6,
      width: c.fullWidth - 6,
    })
  , { ...page1, contentOffset: 6 });

  y = drawBoxedSection(doc, 4, 'Type of BG', y, (cy) =>
    drawEvenCheckboxRow(doc, BG_TYPE_OPTIONS, app.typeOfBG, cy + 2.2, c.left + 24, c.fullWidth - 24)
  , { ...page1, contentOffset: 6 });

  y = drawBoxedSection(doc, 5, 'Details of Bank Guarantee', y, (cy) => {
    const labelWidth = 46;
    cy = drawLeftLabelBox(doc, c.left, cy, c.fullWidth, 'Purpose', app.purpose, {
      labelWidth,
      height: 9,
      maxHeight: 10,
      allowNewPage: false,
    });
    cy = drawSharedLabelBoxes(
      doc,
      c.left,
      c.fullWidth,
      ['Amount (Rs/FCY)', 'in figures &', 'in words'],
      [app.bgAmountFigures, app.bgAmountWords],
      cy,
      { labelWidth, heights: [5.4, 7.4], gap: 1.3, allowNewPage: false }
    );

    const dateLabelW = 36;
    const dateBox = 4.2;
    const dateColY = cy + 1.2;
    const leftAfterExpiry = drawInlineDateBoxes(doc, c.left, dateColY, 'Expiry Date', app.expiryDate, {
      labelWidth: dateLabelW,
      boxSize: dateBox,
      allowNewPage: false,
    });
    const leftAfterClaim = drawInlineDateBoxes(
      doc,
      c.left,
      leftAfterExpiry + 0.4,
      'Claim Expiry Date',
      app.claimExpiryDate,
      { labelWidth: dateLabelW, boxSize: dateBox, allowNewPage: false }
    );
    const tenorX = c.left + dateLabelW + dateBox * 8 + 8;
    const tenorY = drawBgTenor(doc, tenorX, dateColY, app.bgTenorYears, app.bgTenorMonths);

    // Borderless claim-period text under Claim Expiry Date — e.g. "2 year"
    const claimYears = app.claimExpiryYear;
    const metaY = Math.max(leftAfterClaim, tenorY) + 2;
    if (claimYears != null && claimYears !== '' && Number(claimYears) > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...VALUE_COLOR);
      const yearLabel = `${Number(claimYears)} year`;
      doc.text(yearLabel, c.left + dateLabelW, metaY);
      return metaY + 4;
    }
    return Math.max(leftAfterClaim, tenorY) + 3;
  }, page1);

  y = drawBoxedSection(doc, 6, 'Beneficiary Details', y, (cy) => {
    const nameCap = { maxHeight: 11.5, allowNewPage: false };
    const leftY = drawStackedBox(doc, c.left, cy, c.width, 10.5, 'Name & Address', app.beneficiaryNameAddress, nameCap);
    const rightY = drawStackedBox(
      doc,
      c.right,
      cy,
      c.width,
      10.5,
      'Contact Person Name & Mobile No',
      app.beneficiaryContactPersonMobile,
      nameCap
    );
    cy = Math.max(leftY, rightY);

    const emailY = drawStackedBox(doc, c.left, cy, c.width, 5.5, 'EMail ID', app.beneficiaryEmail, {
      maxHeight: 6.2,
      allowNewPage: false,
    });
    const gstY = drawStackedBox(doc, c.right, cy, c.width, 5.5, 'GST Number', app.beneficiaryGstNumber, {
      maxHeight: 6.2,
      allowNewPage: false,
    });
    cy = Math.max(emailY, gstY);

    const panY = drawInlineBox(doc, c.left, cy, 48, 'PAN No', app.beneficiaryPan, { labelWidth: 16, height: 5.5, ...capBox });
    const dateY = drawInlineBox(
      doc,
      c.left + 50,
      cy,
      68,
      'Date of Incorporation',
      app.beneficiaryDateOfIncorporation ? formatDate(app.beneficiaryDateOfIncorporation) : '',
      { labelWidth: 36, height: 5.5, ...capBox }
    );
    const leiY = drawInlineBox(doc, c.left + 120, cy, c.fullWidth - 120, 'LEI Code', app.beneficiaryLeiCode, {
      labelWidth: 18,
      height: 5.5,
      ...capBox,
    });
    return Math.max(panY, dateY, leiY);
  }, page1);

  {
    doc.setPage(1);
    const pageHeight = doc.internal.pageSize.getHeight();
    const notesY = pageHeight - 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    doc.setTextColor(...LABEL_COLOR);
    doc.text('*If e-BG with NeSL, please provide UIN allotted to Beneficiary by NeSL', MARGIN, notesY);
    doc.text('*Please note that in case of e-BG, the stamp duty will be procured through NeSL', MARGIN, notesY + 4.2);
  }

  doc.addPage();
  y = 10;
  const page2Bottom = doc.internal.pageSize.getHeight() - 8;

  y = drawPage2BankDetailsBox(
    doc,
    7,
    'Beneficiary Bank Details for SFMS',
    y,
    app.beneficiaryBankNameAddress,
    app.beneficiaryBankIfscSwift,
    c
  );
  y = drawPage2BankDetailsBox(
    doc,
    8,
    'Advising Bank Details (if Advising Bank is other than Beneficiary Bank)',
    y,
    app.advisingBankNameAddress,
    app.advisingBankIfscSwift,
    c
  );

  y = drawMarginDetailsBox(doc, app, y, c);

  const chargesText =
    '"I/We agree to pay all applicable taxes, duties (including stamp duty), cesses, fees and charges for issuance of this Guarantee and consent that necessary deductions in this regard may be made from my/our account number"';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...HEADER_BLUE);
  doc.text('10. Instruction on Bank Charges', c.left, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...VALUE_COLOR);
  const chargesLines = doc.splitTextToSize(chargesText, c.fullWidth);
  doc.text(chargesLines, c.left, y + 8.2);
  y += 8.2 + chargesLines.length * 3.05 + 5.5;

  const claimAccount = String(app.claimDebitAccountNumber || '').trim() || '.......................................';
  const interestRaw = app.delayedPaymentInterestPercent;
  const claimInterest =
    interestRaw !== 0 && interestRaw !== '0' && interestRaw !== null && interestRaw !== undefined && String(interestRaw).trim() !== ''
      ? String(interestRaw)
      : '...................';
  const clauseV =
    `v) We hereby authorize you to debit our account number ${claimAccount} to make the payment immediately in case of receipt of any claim from the beneficiary. You are also authorised to debit our account with the interest @ ${claimInterest} % towards delayed payment claimed by the beneficiary.`;

  const clauses = [...DECLARATION_ITEMS, clauseV, ...DECLARATION_ITEMS_AFTER_CLAIM];
  const signBlockH = 18;
  const docsBlockH = 22;
  const gapAfterDecl = 2;
  const gapBeforeDocs = 5.5;
  const header11H = 6.4;
  const reservedAfterDecl = gapAfterDecl + signBlockH + gapBeforeDocs + docsBlockH;
  const availDecl = Math.max(70, page2Bottom - reservedAfterDecl - (y + header11H));
  const declOpts = { listLeft: 6 };

  let clauseFont = 7.3;
  let lineH = 3.15;
  let paraGap = 2.9;
  let clauseTextH = measureDeclarationList(doc, clauses, clauseFont, lineH, paraGap, declOpts);
  if (clauseTextH > availDecl) {
    const scale = availDecl / Math.max(clauseTextH, 1);
    lineH = Math.max(2.85, lineH * scale);
    clauseFont = Math.max(6.8, clauseFont * Math.min(1, scale + 0.06));
    paraGap = Math.max(2.2, paraGap * scale);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...HEADER_BLUE);
  doc.text('11. General Declaration', c.left, y + 4);
  y = drawDeclarationList(doc, clauses, y + header11H, {
    fontSize: clauseFont,
    lineHeight: lineH,
    paraGap,
    ...declOpts,
  });

  y += gapAfterDecl;
  const signX = c.left + 6;
  const dateBox = 4.1;
  const boxesX = signX + 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);
  doc.setTextColor(...VALUE_COLOR);
  doc.text('Authorized Signatory', boxesX, y);
  y += 2.1;
  doc.text('Date', signX, y + dateBox / 2 + 1);
  const match = app.declarationDate ? String(app.declarationDate).match(/^(\d{4})-(\d{2})-(\d{2})/) : null;
  const dateDigits = match ? `${match[3]}${match[2]}${match[1]}` : '';
  drawInlineSegmentedBoxes(doc, dateDigits, 8, boxesX, y + dateBox, {
    boxSize: dateBox,
    placeholders: ['D', 'D', 'M', 'M', 'Y', 'Y', 'Y', 'Y'],
  });
  y += dateBox + 2.2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...VALUE_COLOR);
  doc.text('(Stamp to be affixed by firm/ Company)', boxesX, y);

  y += gapBeforeDocs;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...HEADER_BLUE);
  doc.text('Details of documents enclosed: (please tick all that are relevant)', c.left, y);
  y += 6.2;

  const rightColX = c.left + c.fullWidth * 0.55;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.6);
  doc.setTextColor(...VALUE_COLOR);
  let boxSize = drawCheckbox(doc, c.left, y, Boolean(app.documentsContractAgreementCopy));
  doc.text('Contract/Agreement copy', c.left + boxSize + 1.5, y - 0.5);
  boxSize = drawCheckbox(doc, rightColX, y, Boolean(app.documentsCounterGuarantee));
  doc.text('Counter Guarantee', rightColX + boxSize + 1.5, y - 0.5);
  y += 6.2;
  boxSize = drawCheckbox(doc, c.left, y, Boolean(app.documentsBankGuaranteeText));
  doc.text('Bank Guarantee Text', c.left + boxSize + 1.5, y - 0.5);
  y += 6.2;
  boxSize = drawCheckbox(doc, c.left, y, Boolean(app.documentsOther));
  const otherLine = 'Other documents if any, please specify';
  doc.text(otherLine, c.left + boxSize + 1.5, y - 0.5);
  const specifyX = c.left + boxSize + 1.5 + doc.getTextWidth(otherLine) + 1.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.6);
  doc.setTextColor(...VALUE_COLOR);
  const dotsWidth = c.left + c.fullWidth - specifyX;
  let dots = '';
  while (doc.getTextWidth(dots) < dotsWidth - 1) dots += '.';
  doc.text(dots, specifyX, y - 0.5);
  if (app.otherDocumentsSpecify) {
    doc.setTextColor(...VALUE_COLOR);
    doc.text(pdfText(app.otherDocumentsSpecify), specifyX + 1, y - 1.2, { maxWidth: dotsWidth - 2 });
  }

  while (doc.internal.getNumberOfPages() > 2) {
    doc.deletePage(doc.internal.getNumberOfPages());
  }
  versionFooter(doc);
  doc.save(`${safeFilePart(app.applicantNameAddress, 'bg-application')}_bank_guarantee.pdf`);
}
